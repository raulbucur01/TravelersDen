import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Paths to precomputed embeddings
path_sbert_matrix = "sbert_matrix.npz"
path_similarity_matrix_sbert = "similarity_matrix_sbert.csv"
path_post_data = "post_data.csv"  # CSV containing PostId, Caption, and Body

# Load SBERT model
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

# Load precomputed SBERT embeddings
sbert_matrix = np.load(path_sbert_matrix)["arr_0"]

# Load similarity matrix and post metadata
similarity_df = pd.read_csv(path_similarity_matrix_sbert, index_col=0)
post_data_df = pd.read_csv(path_post_data)  # Contains PostId, Caption, and Body

# Ensure PostId is the index
post_data_df.set_index("PostId", inplace=True)
post_ids = similarity_df.index.tolist()


def get_similar_posts(prompt: str, top_n: int = 5):
    """Find the most similar posts to the user's prompt, including captions."""

    # Encode the prompt using SBERT
    prompt_embedding = sbert_model.encode([prompt])  # Shape: (1, embedding_size)

    # Compute cosine similarity with all posts
    similarities = cosine_similarity(prompt_embedding, sbert_matrix)[
        0
    ]  # Shape: (num_posts,)

    # Get top N similar post indices
    top_indices = similarities.argsort()[-top_n:][::-1]  # Sort descending

    # Retrieve Post IDs, Captions, and Similarity Scores
    similar_posts = []
    for i in top_indices:
        post_id = post_ids[i]
        caption = (
            post_data_df.loc[post_id, "Caption"]
            if post_id in post_data_df.index
            else "Unknown"
        )
        similar_posts.append(
            {"post_id": post_id, "caption": caption, "similarity": similarities[i]}
        )

    return similar_posts


# Example Usage
prompt = "Best places to visit in Paris for a 3-day trip"
similar_posts = get_similar_posts(prompt, top_n=5)

# Print results
for post in similar_posts:
    print(f"Post ID: {post['post_id']}, Similarity: {post['similarity']:.4f}")
    print(f"Caption: {post['caption']}\n")
