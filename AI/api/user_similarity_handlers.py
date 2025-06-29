import numpy as np
import pandas as pd
from collections import defaultdict
from constants import (
    TOP_N_SIMILAR_USERS,
    WEIGHT_TFIDF,
    WEIGHT_SBERT,
    PATH_SIMILARITY_MATRIX_SBERT,
    PATH_SIMILARITY_MATRIX_TFIDF,
)
from database_operations import get_post_user_mapping, get_user_followings_map
import redis

# Connect to Redis
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


def compute_user_similarity_scores(
    tfidf_sim_matrix: pd.DataFrame,
    sbert_sim_matrix: pd.DataFrame,
) -> dict[str, list[str]]:
    """
    Computes the top-N most similar users for each user, based on average post similarity,
    excluding the users they follow.

    Returns:
        dict: A mapping of user_id -> list of top similar user_ids.
    """
    # Load post-to-user mapping
    post_user_map = get_post_user_mapping()
    users_and_followed_ids = get_user_followings_map()

    users_and_their_posts = defaultdict(list)

    # Group posts by user
    for post_id, user_id in post_user_map.items():
        users_and_their_posts[user_id].append(post_id)

    # Compute combined similarity matrix
    combined_sim_matrix = (
        WEIGHT_TFIDF * tfidf_sim_matrix + WEIGHT_SBERT * sbert_sim_matrix
    )

    user_similarity_scores = defaultdict(dict)

    user_ids = list(users_and_their_posts.keys())

    for user_a in user_ids:
        posts_a = users_and_their_posts[user_a]
        followed_users = users_and_followed_ids.get(user_a, set())

        for user_b in user_ids:
            # exclude users they follow already and themselves
            if user_a == user_b or user_b in followed_users:
                continue

            posts_b = users_and_their_posts[user_b]

            # accumulate similarities between each post of user A and each post of user B
            sim_scores = []
            for post_a in posts_a:
                for post_b in posts_b:
                    try:
                        sim = combined_sim_matrix.loc[post_a, post_b]
                        sim_scores.append(sim)
                    except KeyError:
                        continue  # one of the posts might be missing from the matrix

            if sim_scores:
                avg_sim = np.mean(sim_scores)
                user_similarity_scores[user_a][user_b] = avg_sim

    # Select top-N similar users for each user
    top_similar_users = {}

    for user_id, similarities in user_similarity_scores.items():
        sorted_users = sorted(similarities.items(), key=lambda x: -x[1])[
            :TOP_N_SIMILAR_USERS
        ]
        top_similar_users[user_id] = [user for user, _ in sorted_users]

    return top_similar_users


def store_user_similarities_in_redis(user_sim_map: dict[str, list[str]]):
    """
    Stores the top similar users for each user into Redis.
    Clears old values to avoid outdated results.
    """
    pipeline = redis_client.pipeline()

    # Clear old values
    for key in redis_client.scan_iter("similar_users:*"):
        pipeline.delete(key)

    # Store new values
    for user_id, similar_users in user_sim_map.items():
        key = f"similar_users:{user_id}"
        value = ",".join(similar_users)
        pipeline.set(key, value)

    pipeline.execute()
    print("✅ Stored user similarities in Redis.")


def update_similarity_for_users():
    """
    Recomputes and updates top-N similar users based on post similarity matrices.
    """
    try:
        # Load similarity matrices
        tfidf_sim_matrix = pd.read_csv(PATH_SIMILARITY_MATRIX_TFIDF, index_col=0)
        sbert_sim_matrix = pd.read_csv(PATH_SIMILARITY_MATRIX_SBERT, index_col=0)

        # Ensure both matrices are aligned (same post IDs)
        post_ids = tfidf_sim_matrix.index.tolist()
        tfidf_sim_matrix = tfidf_sim_matrix.loc[post_ids, post_ids]
        sbert_sim_matrix = sbert_sim_matrix.loc[post_ids, post_ids]

        # Compute user similarity map
        user_sim_map = compute_user_similarity_scores(
            tfidf_sim_matrix, sbert_sim_matrix
        )

        # Store in Redis
        store_user_similarities_in_redis(user_sim_map)

    except Exception as e:
        print(f"❌ Error updating user similarity: {e}")
