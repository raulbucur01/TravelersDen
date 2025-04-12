# ruff: noqa: F403, F405
from constants import *
import asyncio
import ollama
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer
import pandas as pd
import joblib


async def generate_stream(prompt: str):
    """Stream text generation response from Ollama."""
    try:
        stream = ollama.generate(
            model="mistral",
            prompt=prompt,
            options={"temperature": 0.7},
            stream=True,  # Enables streaming
        )

        for chunk in stream:
            text_chunk = chunk["response"]
            print(f"Sending chunk: {text_chunk}")  # Debugging output

            # Yield chunk with a newline to ensure it's received properly
            yield text_chunk

            # Small async sleep to avoid buffering issues
            await asyncio.sleep(0.01)

    except Exception as e:
        yield f"Error: {e}\n"


# def extract_keywords(prompt, tfidf_vectorizer):
#     """Extracts important keywords from the user's prompt using TF-IDF."""
#     tfidf_matrix = tfidf_vectorizer.transform([prompt])
#     feature_names = np.array(tfidf_vectorizer.get_feature_names_out())
#     sorted_indices = np.argsort(tfidf_matrix.toarray()).flatten()[::-1]
#     top_keywords = feature_names[sorted_indices[:5]]  # Top 5 keywords
#     return top_keywords.tolist()


# def get_sbert_embedding(prompt, model):
#     """Generates an SBERT embedding for the prompt."""
#     return model.encode([prompt])[0]


# def normalize_array(arr):
#     """Normalizes an array to be between 0 and 1."""
#     return (arr - arr.min()) / (arr.max() - arr.min()) if arr.max() > arr.min() else arr


# def find_similar_posts_to_prompt(
#     prompt_tfidf, prompt_sbert, tfidf_matrix, sbert_matrix, top_n=5
# ):
#     """Finds similar posts based on normalized TF-IDF & SBERT cosine similarities."""

#     # Compute cosine similarity
#     tfidf_similarities = cosine_similarity(
#         tfidf_matrix, prompt_tfidf.reshape(1, -1)
#     ).flatten()
#     sbert_similarities = cosine_similarity(
#         sbert_matrix, prompt_sbert.reshape(1, -1)
#     ).flatten()

#     # Normalize SBERT similarity to match TF-IDF range (0 to 1)
#     sbert_similarities = normalize_array(sbert_similarities)

#     # Combine similarities (weighted sum)
#     combined_similarity = 0.3 * tfidf_similarities + 0.7 * sbert_similarities

#     # Get top-N most similar post indices
#     top_indices = np.argsort(tfidf_similarities)[-top_n:][::-1]

#     return top_indices  # Return indexes of top similar posts


# # Load posts dataset
# posts_df = pd.read_csv(
#     PATH_POSTS_CSV
# )  # Make sure this file exists in the working directory

# # Load or generate TF-IDF & SBERT matrices (Assuming they are precomputed)
# tfidf_matrix = np.load(PATH_TFIDF_MATRIX)["arr_0"]  # Shape: (num_posts, tfidf_dim)
# sbert_matrix = np.load(PATH_SBERT_MATRIX)["arr_0"]  # Shape: (num_posts, sbert_dim)

# # Load trained vectorizers/models
# tfidf_vectorizer = joblib.load(PATH_TFIDF_MODEL)

# sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

# # Test input prompt
# test_prompt = "I want to visit Iceland"

# # Convert prompt to TF-IDF vector
# prompt_tfidf = tfidf_vectorizer.transform([test_prompt]).toarray().flatten()

# # Convert prompt to SBERT vector
# prompt_sbert = sbert_model.encode([test_prompt], convert_to_numpy=True).flatten()

# # Run similarity search
# top_indices = find_similar_posts_to_prompt(
#     prompt_tfidf, prompt_sbert, tfidf_matrix, sbert_matrix, top_n=5
# )

# # Display results
# print("Top matching posts:")
# for idx in top_indices:
#     post = posts_df.iloc[idx]
#     print(f"\n📌 **Caption:** {post['Caption']}\n📝 **Body:** {post['Body']}")

from sklearn.preprocessing import normalize


def get_most_similar_posts(user_prompt, top_n=5):
    """Finds the most similar posts to the given prompt using SBERT similarity."""

    try:
        # Load SBERT model
        sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

        # Load saved post embeddings
        sbert_matrix = np.load(PATH_SBERT_MATRIX)["arr_0"]

        print(sbert_matrix.shape)  # Should be (num_posts, embedding_dim)
        print(sbert_matrix[:5])  # Inspect a few embeddings

        # Load post data
        df = pd.read_csv(PATH_POSTS_CSV)

        if df.empty:
            print("⚠️ No posts available.")
            return []

        # Encode user prompt
        user_embedding = sbert_model.encode([user_prompt])

        sbert_matrix = normalize(sbert_matrix, axis=1)  # Normalize post embeddings
        user_embedding = normalize(
            user_embedding, axis=1
        )  # Normalize user query embedding
        similarities = cosine_similarity(user_embedding, sbert_matrix)[0]

        # Get top-N most similar posts
        top_indices = similarities.argsort()[-top_n:][
            ::-1
        ]  # Get indices of highest similarities

        post_ids = df.iloc[top_indices]["PostId"].values
        print("Selected Post IDs:", post_ids)  # Debug which posts are selected

        # Return relevant post details
        similar_posts = df.iloc[top_indices][["PostId", "Caption", "Body"]].to_dict(
            orient="records"
        )

        return similar_posts

    except Exception as e:
        print(f"❌ Error finding similar posts: {e}")
        return []


user_prompt = "I want to visit Iceland"
similar_posts = get_most_similar_posts(user_prompt, top_n=5)

for post in similar_posts:
    print(post)
