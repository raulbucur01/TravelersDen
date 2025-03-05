import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database_operations import (
    fetch_unprocessed_inserted_posts,
    fetch_unprocessed_deleted_posts,
    fetch_unprocessed_updated_posts,
    mark_as_processed,
    mark_deletions_as_processed,
)
import redis
import joblib
from utils import fetch_posts_from_db, normalize_similarity_matrix
from sentence_transformers import SentenceTransformer


# Connect to Redis
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

TOP_N = 5  # Number of most similar posts to store
WEIGHT_TFIDF = 0.5
WEIGHT_SBERT = 0.5

path_posts_csv = "../api/data/posts.csv"

# TF-IDF paths
path_similarity_matrix_tfidf = "../api/data/posts_similarity_matrix_TFIDF.csv"
path_tfidf_model = "../api/data/tfidf_vectorizer.pkl"
path_tfidf_matrix = "../api/data/tfidf_matrix.npz"

# SBERT paths
path_similarity_matrix_sbert = "../api/data/posts_similarity_matrix_SBERT.csv"
path_sbert_model = "../api/data/sbert_model.pkl"
path_sbert_matrix = "../api/data/sbert_matrix.npz"


def initialize_TFIDF_post_similarity_startpoint():
    """Initialize the TF-IDF model and matrix, then compute and save the similarity matrix."""

    try:
        print("💡 Starting TF-IDF similarity initialization...")
        # Load existing posts from the database
        df = fetch_posts_from_db()

        if df is None or df.empty:
            print("⚠️ No posts found. Initialization skipped.")
            return

        df.to_csv(path_posts_csv, index=False)
        print(f"✅ CSV updated successfully: {path_posts_csv}")

        # Combine Caption and Body for text analysis
        df["text"] = df["Caption"].fillna("") + " " + df["Body"].fillna("")

        # Create and fit the TF-IDF vectorizer
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(df["text"])

        # Save the TF-IDF model
        joblib.dump(vectorizer, path_tfidf_model)
        print(f"✅ TF-IDF vectorizer saved at {path_tfidf_model}")

        # Save the TF-IDF matrix
        np.savez_compressed(path_tfidf_matrix, tfidf_matrix.toarray())
        print(f"✅ TF-IDF matrix saved at {path_tfidf_matrix}")

        # Compute Cosine Similarity
        cosine_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

        # Convert to DataFrame
        similarity_df = pd.DataFrame(
            cosine_sim_matrix, index=df["PostId"], columns=df["PostId"]
        )

        # Save similarity matrix
        similarity_df.to_csv(path_similarity_matrix_tfidf)
        print("✅ Similarity matrix updated successfully!")

    except Exception as e:
        print(f"❌ Error initializing similarity system: {e}")


def initialize_SBERT_post_similarity_startpoint():
    """Initialize the SBERT model and embedding matrix, then compute and save the similarity matrix."""

    try:
        print("💡 Starting SBERT similarity initialization...")
        # Load existing posts from the database
        df = fetch_posts_from_db()

        if df is None or df.empty:
            print("⚠️ No posts found. Initialization skipped.")
            return

        # # Save posts to CSV
        # df.to_csv(path_posts, index=False)
        # print(f"✅ CSV updated successfully: {path_posts}")

        # Combine Caption and Body for text analysis
        df["text"] = df["Caption"].fillna("") + " " + df["Body"].fillna("")

        # Load SBERT model (you can change to a different model if needed)
        sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

        # Compute SBERT embeddings
        sbert_matrix = sbert_model.encode(df["text"].tolist(), show_progress_bar=True)

        # Save the SBERT model
        joblib.dump(sbert_model, path_sbert_model)
        print(f"✅ SBERT model saved at {path_sbert_model}")

        # Save the SBERT matrix
        np.savez_compressed(path_sbert_matrix, sbert_matrix)
        print(f"✅ SBERT matrix saved at {path_sbert_matrix}")

        # Compute Cosine Similarity
        cosine_sim_matrix = cosine_similarity(sbert_matrix, sbert_matrix)

        # Convert to DataFrame
        similarity_df = pd.DataFrame(
            cosine_sim_matrix, index=df["PostId"], columns=df["PostId"]
        )

        # Save normalized similarity matrix
        similarity_df = normalize_similarity_matrix(similarity_df)
        similarity_df.to_csv(path_similarity_matrix_sbert)
        print("✅ Similarity matrix updated successfully!")

    except Exception as e:
        print(f"❌ Error initializing SBERT similarity system: {e}")


def initialize_combined_similarity_redis_startpoint(weight_tfidf=0.5, weight_sbert=0.5):
    """Compute and store Top-N similar posts using weighted TF-IDF + SBERT similarity in Redis."""

    try:
        print("💡 Starting combined similarity redis initialization...")
        redis_client.flushall()

        # Load posts from the database
        df = fetch_posts_from_db()

        if df is None or df.empty:
            print("⚠️ No posts found. Initialization skipped.")
            return

        # Load and normalize similarity matrices
        tfidf_sim_matrix = pd.read_csv(path_similarity_matrix_tfidf, index_col=0)
        sbert_sim_matrix = pd.read_csv(path_similarity_matrix_sbert, index_col=0)

        # Ensure matrices are aligned (same post IDs and order)
        post_ids = df["PostId"].astype(str).tolist()
        tfidf_sim_matrix = tfidf_sim_matrix.loc[post_ids, post_ids]
        sbert_sim_matrix = sbert_sim_matrix.loc[post_ids, post_ids]

        # Compute Top-N similar posts per post using the combined formula
        for post_id in post_ids:
            post_id = str(post_id)  # Ensure post_id is a string (UUID)

            # Compute combined similarity for this post only
            combined_sim = (
                weight_tfidf * tfidf_sim_matrix.loc[post_id]
                + weight_sbert * sbert_sim_matrix.loc[post_id]
            )

            # Get Top-N most similar posts (excluding itself)
            similar_posts = combined_sim.drop(post_id).nlargest(TOP_N).index.tolist()

            # Store in Redis
            redis_client.set(f"similar:{post_id}", ",".join(map(str, similar_posts)))

        print("✅ Top combined similarities for each post stored in Redis!")

    except Exception as e:
        print(f"❌ Error initializing combined similarity system: {e}")


def handle_unprocessed_inserted_posts(updated_posts_to_add=None):
    """Handle new posts efficiently by computing only the necessary similarities.
    Returns:
        list: A list of post IDs that have been processed.
    """

    # Load existing posts and similarity matrix
    df_existing_posts = pd.read_csv(path_posts_csv)
    df_similarity_matrix_tfidf = pd.read_csv(path_similarity_matrix_tfidf, index_col=0)
    df_similarity_matrix_sbert = pd.read_csv(path_similarity_matrix_sbert, index_col=0)

    # Fetch unprocessed inserted posts
    if updated_posts_to_add:
        new_posts = updated_posts_to_add
    else:
        new_posts = fetch_unprocessed_inserted_posts()
    if not new_posts:
        print("💤 INSERT: No new inserted posts to process.")
        return []

    df_new_posts = pd.DataFrame(new_posts)

    # Append new posts to CSV
    df_updated_posts = pd.concat([df_existing_posts, df_new_posts], ignore_index=True)
    df_updated_posts.to_csv(path_posts_csv, index=False)

    ## ====================== TF-IDF UPDATE ====================== ##

    # Load existing TF-IDF model and matrix
    vectorizer = joblib.load(path_tfidf_model)
    tfidf_matrix_existing = np.load(path_tfidf_matrix)["arr_0"]

    # Compute TF-IDF vectors **only for new posts**
    new_texts = (
        df_new_posts["Caption"].fillna("") + " " + df_new_posts["Body"].fillna("")
    )
    new_tfidf_matrix = vectorizer.transform(new_texts)

    # Stack new matrix with existing matrix (rows)
    tfidf_matrix = np.vstack([tfidf_matrix_existing, new_tfidf_matrix.toarray()])

    # Save updated TF-IDF matrix
    np.savez_compressed(path_tfidf_matrix, tfidf_matrix)

    # Update similarity matrix **only for new posts**
    new_post_ids = df_new_posts["PostId"].tolist()
    all_post_ids = df_updated_posts["PostId"].tolist()

    # Ensure df_similarity has all required indices (rows & columns)
    df_similarity_matrix_tfidf = df_similarity_matrix_tfidf.reindex(
        index=all_post_ids, columns=all_post_ids, fill_value=np.nan
    )

    # Compute pairwise similarities efficiently
    new_similarities = cosine_similarity(new_tfidf_matrix, tfidf_matrix)

    ## Assign similarity values
    for i, new_id in enumerate(new_post_ids):
        df_similarity_matrix_tfidf.loc[new_id, all_post_ids] = new_similarities[
            i, : len(all_post_ids)
        ]
        df_similarity_matrix_tfidf.loc[all_post_ids, new_id] = new_similarities[
            i, : len(all_post_ids)
        ]

    # Save updated similarity matrix
    df_similarity_matrix_tfidf.to_csv(path_similarity_matrix_tfidf)

    # Save updated TF-IDF model
    joblib.dump(vectorizer, path_tfidf_model)

    ## ====================== SBERT UPDATE ====================== ##

    # Load SBERT model & embeddings
    sbert_model = SentenceTransformer(path_sbert_model)
    sbert_embeddings_existing = np.load(path_sbert_matrix)["arr_0"]

    # Compute SBERT embeddings for new posts
    new_sbert_embeddings = sbert_model.encode(new_texts, convert_to_numpy=True)

    # Stack SBERT embeddings
    sbert_embeddings = np.vstack([sbert_embeddings_existing, new_sbert_embeddings])
    np.savez_compressed(path_sbert_matrix, sbert_embeddings)

    # Ensure SBERT matrix is aligned
    df_similarity_matrix_sbert = df_similarity_matrix_sbert.reindex(
        index=all_post_ids, columns=all_post_ids, fill_value=np.nan
    )

    # Calculate pairwise SBERT similarities
    new_similarities_sbert = cosine_similarity(new_sbert_embeddings, sbert_embeddings)

    # Update SBERT similarity matrix
    for i, new_id in enumerate(new_post_ids):
        df_similarity_matrix_sbert.loc[new_id, all_post_ids] = new_similarities_sbert[
            i, :
        ]
        df_similarity_matrix_sbert.loc[all_post_ids, new_id] = new_similarities_sbert[
            i, :
        ]

    # Only normalize new ones
    df_similarity_matrix_sbert = normalize_similarity_matrix(
        df_similarity_matrix_sbert, new_post_ids
    )
    df_similarity_matrix_sbert.to_csv(path_similarity_matrix_sbert)

    ## ====================== COMBINED SIMILARITIES REDIS ====================== ##

    pipeline = redis_client.pipeline()
    for post_id in new_post_ids:
        # Get combined similarities for new post
        combined_sim = (
            WEIGHT_TFIDF * df_similarity_matrix_tfidf.loc[post_id]
            + WEIGHT_SBERT * df_similarity_matrix_sbert.loc[post_id]
        )

        # Get Top-N most similar posts (excluding itself)
        top_similar = combined_sim.drop(post_id).nlargest(TOP_N).index.tolist()

        # Update Redis
        pipeline.set(f"similar:{post_id}", ",".join(map(str, top_similar)))

    pipeline.execute()

    if updated_posts_to_add:
        print(
            f"✅ UPDATE: Inserted {len(updated_posts_to_add)} posts and updated similarity!"
        )
    else:
        print(f"✅ INSERT: Inserted {len(new_posts)} posts and updated similarity!")

    # return processed post IDs
    return new_post_ids


def split_updated_posts():
    """Splits updated posts into existing and new ones based on Posts.csv.

    Returns:
        tuple: (existing_posts, new_posts)
        - existing_posts: List of updated posts that exist in Posts.csv
        - new_posts: List of updated posts that do NOT exist in Posts.csv
    """

    # Load existing posts
    df_existing = pd.read_csv(
        path_posts_csv, usecols=["PostId"]
    )  # Load only PostId for efficiency

    # Fetch unprocessed updated posts
    updated_posts = fetch_unprocessed_updated_posts()
    if not updated_posts:
        return [], []

    df_updated_posts = pd.DataFrame(updated_posts)

    # Convert PostId to string to avoid type mismatches
    df_existing["PostId"] = df_existing["PostId"].astype(str)
    df_updated_posts["PostId"] = df_updated_posts["PostId"].astype(str)

    # Split into two groups: existing and new
    mask = df_updated_posts["PostId"].isin(df_existing["PostId"])
    existing_posts = df_updated_posts[mask].to_dict(orient="records")
    new_posts = df_updated_posts[~mask].to_dict(orient="records")
    return existing_posts, new_posts


def handle_unprocessed_updated_posts():
    """Handle updated posts efficiently by recomputing only the necessary similarities."""

    # Load existing posts and similarity matrix
    df_existing_posts = pd.read_csv(path_posts_csv)
    df_similarity_matrix_tfidf = pd.read_csv(path_similarity_matrix_tfidf, index_col=0)
    df_similarity_matrix_sbert = pd.read_csv(path_similarity_matrix_sbert, index_col=0)

    # Fetch and split unprocessed updated posts
    updated_posts, updated_posts_to_add = split_updated_posts()

    if not updated_posts and not updated_posts_to_add:
        print("💤 UPDATE: No updated posts to process or updated posts to add.")
        return []

    if not updated_posts:
        print("💤 UPDATE: No updated posts to process.")
    else:
        print(f"💤 UPDATE: Found {len(updated_posts)} updated posts to process.")

        df_updated_posts = pd.DataFrame(updated_posts)

        # Ensure updates modify the correct posts in df_existing_posts
        for _, row in df_updated_posts.iterrows():
            post_id = row["PostId"]

            # Convert to string to avoid data type mismatches
            post_id = str(post_id)
            df_existing_posts["PostId"] = df_existing_posts["PostId"].astype(str)

            # Find the row index
            mask = df_existing_posts["PostId"] == post_id

            if mask.any():  # If post exists, update it properly
                df_existing_posts.loc[mask, "Caption"] = row["Caption"]
                df_existing_posts.loc[mask, "Body"] = row["Body"]

        # Save the updated posts data
        df_existing_posts.to_csv(path_posts_csv, index=False)

        # =================== TF-IDF UPDATES =================== #

        # Load existing TF-IDF model and matrix
        vectorizer = joblib.load(path_tfidf_model)
        tfidf_matrix_existing = np.load(path_tfidf_matrix)["arr_0"]

        # Compute new TF-IDF vectors **only for updated posts**
        updated_texts = (
            df_updated_posts["Caption"].fillna("")
            + " "
            + df_updated_posts["Body"].fillna("")
        )
        updated_tfidf_matrix = vectorizer.transform(updated_texts)

        # Replace old vectors with new ones in the TF-IDF matrix
        updated_post_ids = df_updated_posts["PostId"].tolist()
        post_id_to_index = {
            post_id: i for i, post_id in enumerate(df_existing_posts["PostId"])
        }

        for i, post_id in enumerate(updated_post_ids):
            index = post_id_to_index[post_id]
            tfidf_matrix_existing[index] = updated_tfidf_matrix[i].toarray()

        # Save updated TF-IDF matrix
        np.savez_compressed(path_tfidf_matrix, tfidf_matrix_existing)

        # Compute pairwise similarities **only for updated posts**
        all_post_ids = df_existing_posts["PostId"].tolist()
        updated_similarities = cosine_similarity(
            updated_tfidf_matrix, tfidf_matrix_existing
        )

        # Assign new similarity values
        for i, updated_id in enumerate(updated_post_ids):
            df_similarity_matrix_tfidf.loc[updated_id, all_post_ids] = (
                updated_similarities[i, : len(all_post_ids)]
            )
            df_similarity_matrix_tfidf.loc[all_post_ids, updated_id] = (
                updated_similarities[i, : len(all_post_ids)]
            )

        # Save updated similarity matrix
        df_similarity_matrix_tfidf.to_csv(path_similarity_matrix_tfidf)

        # =================== SBERT UPDATES =================== #

        sbert_model = SentenceTransformer(path_sbert_model)
        sbert_embeddings_existing = np.load(path_sbert_matrix)["arr_0"]

        # Compute SBERT embeddings for updated posts
        updated_sbert_embeddings = sbert_model.encode(
            updated_texts, convert_to_numpy=True
        )

        # Replace old embeddings
        for i, post_id in enumerate(df_updated_posts["PostId"]):
            index = post_id_to_index[post_id]
            sbert_embeddings_existing[index] = updated_sbert_embeddings[i]

        # Save updated SBERT embeddings
        np.savez_compressed(path_sbert_matrix, sbert_embeddings_existing)

        # Compute SBERT similarities for updated posts
        updated_similarities_sbert = cosine_similarity(
            updated_sbert_embeddings, sbert_embeddings_existing
        )

        # Update SBERT similarity matrix
        for i, post_id in enumerate(df_updated_posts["PostId"]):
            df_similarity_matrix_sbert.loc[post_id, all_post_ids] = (
                updated_similarities_sbert[i, :]
            )
            df_similarity_matrix_sbert.loc[all_post_ids, post_id] = (
                updated_similarities_sbert[i, :]
            )

        df_similarity_matrix_sbert = normalize_similarity_matrix(
            df_similarity_matrix_sbert, updated_post_ids
        )
        df_similarity_matrix_sbert.to_csv(path_similarity_matrix_sbert)

        # =================== COMBINED SIMILARITIES REDIS =================== #

        pipeline = redis_client.pipeline()
        for post_id in df_updated_posts["PostId"]:
            combined_sim = (
                WEIGHT_TFIDF * df_similarity_matrix_tfidf.loc[post_id]
                + WEIGHT_SBERT * df_similarity_matrix_sbert.loc[post_id]
            )

            # Get Top-N most similar posts (excluding itself)
            top_similar = combined_sim.drop(post_id).nlargest(TOP_N).index.tolist()

            # Update Redis
            pipeline.set(f"similar:{post_id}", ",".join(map(str, top_similar)))

        pipeline.execute()

        print(
            f"✅ UPDATE: Updated {len(updated_posts)} posts and recomputed similarity matrix!"
        )

    if not updated_posts_to_add:
        print("💤 UPDATE: No updated posts to add.")
    else:
        print(f"✅ UPDATE: Found {len(updated_posts_to_add)} updated posts to add.")
        handle_unprocessed_inserted_posts(updated_posts_to_add)

    # return processed post IDs
    updated_posts_ids = [post["PostId"] for post in updated_posts]
    updated_posts_added_ids = [post["PostId"] for post in updated_posts_to_add]

    return updated_posts_ids + updated_posts_added_ids


def handle_unprocessed_deleted_posts():
    """Handle deleted posts by removing them from all relevant data."""

    # Load existing posts and similarity matrix
    df_existing_posts = pd.read_csv(path_posts_csv)
    df_similarity_matrix_tfidf = pd.read_csv(path_similarity_matrix_tfidf, index_col=0)
    df_similarity_matrix_sbert = pd.read_csv(path_similarity_matrix_sbert, index_col=0)

    # Fetch unprocessed deleted posts
    deleted_post_ids = fetch_unprocessed_deleted_posts()
    if not deleted_post_ids:
        print("💤 DELETE: No deleted posts to process.")
        return []

    # Convert PostId to string for consistency
    df_existing_posts["PostId"] = df_existing_posts["PostId"].astype(str)
    deleted_post_ids = [str(pid) for pid in deleted_post_ids]

    # Remove deleted posts from everywhere

    # =================== REMOVE FROM POSTS CSV =================== #
    df_existing_posts = df_existing_posts[
        ~df_existing_posts["PostId"].isin(deleted_post_ids)
    ]
    df_existing_posts.to_csv(path_posts_csv, index=False)

    # =================== REMOVE FROM TF-IDF =================== #

    ## Remove from similarity matrix
    df_similarity_matrix_tfidf = df_similarity_matrix_tfidf.drop(
        index=deleted_post_ids, columns=deleted_post_ids, errors="ignore"
    )
    df_similarity_matrix_tfidf.to_csv(path_similarity_matrix_tfidf)

    ## Remove from TF-IDF matrix
    tfidf_matrix_existing = np.load(path_tfidf_matrix)["arr_0"]
    all_post_ids = df_existing_posts["PostId"].tolist()
    indices_to_keep = [
        i for i, post_id in enumerate(all_post_ids) if post_id not in deleted_post_ids
    ]
    tfidf_matrix_existing = tfidf_matrix_existing[indices_to_keep]
    np.savez_compressed(path_tfidf_matrix, tfidf_matrix_existing)

    # =================== REMOVE FROM SBERT =================== #

    # Load SBERT embeddings
    sbert_embeddings_existing = np.load(path_sbert_matrix)["arr_0"]

    # Filter out deleted posts' embeddings
    sbert_embeddings_existing = sbert_embeddings_existing[indices_to_keep]

    # Save updated SBERT embeddings
    np.savez_compressed(path_sbert_matrix, sbert_embeddings_existing)

    # Remove deleted posts from SBERT similarity matrix
    df_similarity_matrix_sbert = df_similarity_matrix_sbert.drop(
        index=deleted_post_ids, columns=deleted_post_ids, errors="ignore"
    )
    df_similarity_matrix_sbert.to_csv(path_similarity_matrix_sbert)

    # =================== REMOVE FROM REDIS =================== #

    pipeline = redis_client.pipeline()
    for post_id in deleted_post_ids:
        pipeline.delete(f"similar:{post_id}")

    # Update combined similarities for remaining posts
    for post_id in df_existing_posts["PostId"]:
        combined_sim = (
            WEIGHT_TFIDF * df_similarity_matrix_tfidf.loc[post_id]
            + WEIGHT_SBERT * df_similarity_matrix_sbert.loc[post_id]
        )

        # Get Top-N similar posts (excluding any deleted ones)
        top_similar = (
            combined_sim.drop(deleted_post_ids, errors="ignore")
            .nlargest(TOP_N)
            .index.tolist()
        )

        # Update Redis
        pipeline.set(f"similar:{post_id}", ",".join(map(str, top_similar)))

    pipeline.execute()

    print(
        f"✅ DELETE: Deleted {len(deleted_post_ids)} posts from dataset, similarity matrix, and Redis."
    )

    # return processed deleted post IDs
    return deleted_post_ids


def update_similarity_for_posts():
    post_ids_processed = []
    deleted_post_ids_processed = []

    # Collect processed post IDs
    post_ids_processed.extend(handle_unprocessed_inserted_posts())
    post_ids_processed.extend(handle_unprocessed_updated_posts())
    deleted_post_ids_processed.extend(handle_unprocessed_deleted_posts())

    # Mark processed posts in database
    if post_ids_processed:
        mark_as_processed(post_ids_processed)

    if deleted_post_ids_processed:
        mark_deletions_as_processed(deleted_post_ids_processed)


# initialize_TFIDF_post_similarity_startpoint()
# initialize_SBERT_post_similarity_startpoint()
# initialize_combined_similarity_redis_startpoint()
