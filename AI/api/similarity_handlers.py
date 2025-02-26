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
from utils import fetch_posts_from_db


# Connect to Redis
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

TOP_N = 5  # Number of most similar posts to store
path_posts = "../api/data/posts.csv"
path_similarity = "../api/data/posts_similarity_matrix.csv"
path_tfidf_model = "../api/data/tfidf_vectorizer.pkl"
path_tfidf_matrix = "../api/data/tfidf_matrix.npz"


def initialize_post_similarity_startpoint():
    """Initialize the TF-IDF model and matrix, then compute and save the similarity matrix."""

    try:
        # Load existing posts from the database
        df = fetch_posts_from_db()

        if df is None or df.empty:
            print("⚠️ No posts found. Initialization skipped.")
            return

        df.to_csv(path_posts, index=False)
        print(f"✅ CSV updated successfully: {path_posts}")

        # Combine Caption and Body for text analysis
        df["text"] = df["Caption"].fillna("") + " " + df["Body"].fillna("")

        # Create and fit the TF-IDF vectorizer
        vectorizer = TfidfVectorizer(stop_words="english")
        text_vectors = vectorizer.fit_transform(df["text"])

        # Save the TF-IDF model
        joblib.dump(vectorizer, path_tfidf_model)
        print(f"✅ TF-IDF vectorizer saved at {path_tfidf_model}")

        # Save the TF-IDF matrix
        np.savez_compressed(path_tfidf_matrix, text_vectors.toarray())
        print(f"✅ TF-IDF matrix saved at {path_tfidf_matrix}")

        # Compute Cosine Similarity
        cosine_sim_matrix = cosine_similarity(text_vectors, text_vectors)

        # Convert to DataFrame
        similarity_df = pd.DataFrame(
            cosine_sim_matrix, index=df["PostId"], columns=df["PostId"]
        )

        # Save similarity matrix
        similarity_df.to_csv(path_similarity)
        print("✅ Similarity matrix updated successfully!")

        # Store Top-N most similar posts in Redis
        for post_id in similarity_df.index:
            post_id = str(post_id)  # Ensure post_id is a string (UUID)

            # Get the most similar post IDs (excluding itself)
            similar_posts = (
                similarity_df.loc[post_id].drop(post_id).nlargest(TOP_N).index.tolist()
            )

            # Store in Redis
            redis_client.set(f"similar:{post_id}", ",".join(map(str, similar_posts)))

        print("✅ Top similarities for each post stored in Redis!")

    except Exception as e:
        print(f"❌ Error initializing similarity system: {e}")


def handle_unprocessed_inserted_posts(updated_posts_to_add=None):
    """Handle new posts efficiently by computing only the necessary similarities.
    Returns:
        list: A list of post IDs that have been processed.
    """

    # Load existing posts and similarity matrix
    df_existing = pd.read_csv(path_posts)
    df_similarity = pd.read_csv(path_similarity, index_col=0)

    # Fetch unprocessed inserted posts
    if updated_posts_to_add:
        new_posts = updated_posts_to_add
    else:
        new_posts = fetch_unprocessed_inserted_posts()
    if not new_posts:
        print("💤 INSERT: No new inserted posts to process.")
        return []

    df_new = pd.DataFrame(new_posts)

    # Append new posts to CSV
    df_updated = pd.concat([df_existing, df_new], ignore_index=True)
    df_updated.to_csv(path_posts, index=False)

    # Load existing TF-IDF model and matrix
    vectorizer = joblib.load(path_tfidf_model)
    text_vectors_existing = np.load(path_tfidf_matrix)["arr_0"]

    # Compute TF-IDF vectors **only for new posts**
    new_texts = df_new["Caption"].fillna("") + " " + df_new["Body"].fillna("")
    new_text_vectors = vectorizer.transform(new_texts)

    # Stack new vectors with existing vectors
    text_vectors = np.vstack([text_vectors_existing, new_text_vectors.toarray()])

    # Save updated TF-IDF matrix
    np.savez_compressed(path_tfidf_matrix, text_vectors)

    # Update similarity matrix **only for new posts**
    new_post_ids = df_new["PostId"].tolist()
    all_post_ids = df_updated["PostId"].tolist()

    # Ensure df_similarity has all required indices (rows & columns)
    df_similarity = df_similarity.reindex(
        index=all_post_ids, columns=all_post_ids, fill_value=np.nan
    )

    # Compute pairwise similarities efficiently
    new_similarities = cosine_similarity(new_text_vectors, text_vectors)

    ## Assign similarity values
    for i, new_id in enumerate(new_post_ids):
        df_similarity.loc[new_id, all_post_ids] = new_similarities[
            i, : len(all_post_ids)
        ]
        df_similarity.loc[all_post_ids, new_id] = new_similarities[
            i, : len(all_post_ids)
        ]

        # Update Redis with the top similar posts
        top_similar = (
            df_similarity.loc[new_id].drop(new_id).nlargest(TOP_N).index.tolist()
        )
        redis_client.set(f"similar:{new_id}", ",".join(map(str, top_similar)))

    # Save updated similarity matrix
    df_similarity.to_csv(path_similarity)

    # Save updated TF-IDF model
    joblib.dump(vectorizer, path_tfidf_model)

    if updated_posts_to_add:
        print(
            f"✅ UPDATE: Inserted {len(updated_posts_to_add)} posts and updated similarity matrix!"
        )
    else:
        print(
            f"✅ INSERT: Inserted {len(new_posts)} posts and updated similarity matrix!"
        )

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
        path_posts, usecols=["PostId"]
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
    df_existing = pd.read_csv(path_posts)
    df_similarity = pd.read_csv(path_similarity, index_col=0)

    # Fetch and split unprocessed updated posts
    # updated_posts = fetch_unprocessed_updated_posts()
    updated_posts, updated_posts_to_add = split_updated_posts()

    if not updated_posts and not updated_posts_to_add:
        print("💤 UPDATE: No updated posts to process or updated posts to add.")
        return []

    if not updated_posts:
        print("💤 UPDATE: No updated posts to process.")
    else:
        print(f"💤 UPDATE: Found {len(updated_posts)} updated posts to process.")

        df_updated_posts = pd.DataFrame(updated_posts)

        # Ensure updates modify the correct posts in df_existing
        for _, row in df_updated_posts.iterrows():
            post_id = row["PostId"]

            # Convert to string to avoid data type mismatches
            post_id = str(post_id)
            df_existing["PostId"] = df_existing["PostId"].astype(str)

            # Find the row index
            mask = df_existing["PostId"] == post_id

            if mask.any():  # If post exists, update it properly
                df_existing.loc[mask, "Caption"] = row["Caption"]
                df_existing.loc[mask, "Body"] = row["Body"]

        # Save the updated posts data
        df_existing.to_csv(path_posts, index=False)

        # Load existing TF-IDF model and matrix
        vectorizer = joblib.load(path_tfidf_model)
        text_vectors_existing = np.load(path_tfidf_matrix)["arr_0"]

        # Compute new TF-IDF vectors **only for updated posts**
        updated_texts = (
            df_updated_posts["Caption"].fillna("")
            + " "
            + df_updated_posts["Body"].fillna("")
        )
        updated_text_vectors = vectorizer.transform(updated_texts)

        # Replace old vectors with new ones in the TF-IDF matrix
        updated_post_ids = df_updated_posts["PostId"].tolist()
        post_id_to_index = {
            post_id: i for i, post_id in enumerate(df_existing["PostId"])
        }

        for i, post_id in enumerate(updated_post_ids):
            index = post_id_to_index[post_id]
            text_vectors_existing[index] = updated_text_vectors[i].toarray()

        # Save updated TF-IDF matrix
        np.savez_compressed(path_tfidf_matrix, text_vectors_existing)

        # Compute pairwise similarities **only for updated posts**
        all_post_ids = df_existing["PostId"].tolist()
        updated_similarities = cosine_similarity(
            updated_text_vectors, text_vectors_existing
        )

        # Assign new similarity values
        for i, updated_id in enumerate(updated_post_ids):
            df_similarity.loc[updated_id, all_post_ids] = updated_similarities[
                i, : len(all_post_ids)
            ]
            df_similarity.loc[all_post_ids, updated_id] = updated_similarities[
                i, : len(all_post_ids)
            ]

            # Update Redis with the top similar posts
            top_similar = (
                df_similarity.loc[updated_id]
                .drop(updated_id)
                .nlargest(TOP_N)
                .index.tolist()
            )
            redis_client.set(f"similar:{updated_id}", ",".join(map(str, top_similar)))

        # Save updated similarity matrix
        df_similarity.to_csv(path_similarity)

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
    df_existing = pd.read_csv(path_posts)
    df_similarity = pd.read_csv(path_similarity, index_col=0)

    # Fetch unprocessed deleted posts
    deleted_post_ids = fetch_unprocessed_deleted_posts()
    if not deleted_post_ids:
        print("💤 DELETE: No deleted posts to process.")
        return []

    # Convert PostId to string for consistency
    df_existing["PostId"] = df_existing["PostId"].astype(str)
    deleted_post_ids = [str(pid) for pid in deleted_post_ids]

    # Remove deleted posts from everywhere

    ## 1. Remove from posts CSV
    df_existing = df_existing[~df_existing["PostId"].isin(deleted_post_ids)]
    df_existing.to_csv(path_posts, index=False)

    ## 2. Remove from similarity matrix
    df_similarity = df_similarity.drop(
        index=deleted_post_ids, columns=deleted_post_ids, errors="ignore"
    )
    df_similarity.to_csv(path_similarity)

    ## 3. Remove from TF-IDF matrix
    text_vectors_existing = np.load(path_tfidf_matrix)["arr_0"]
    all_post_ids = df_existing["PostId"].tolist()
    indices_to_keep = [
        i for i, post_id in enumerate(all_post_ids) if post_id not in deleted_post_ids
    ]
    text_vectors_existing = text_vectors_existing[indices_to_keep]
    np.savez_compressed(path_tfidf_matrix, text_vectors_existing)

    ## 4. Remove from Redis
    for post_id in deleted_post_ids:
        redis_client.delete(f"similar:{post_id}")

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
