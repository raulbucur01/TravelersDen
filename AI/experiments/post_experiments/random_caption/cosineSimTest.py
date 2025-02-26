import pandas as pd


def get_similar_posts(
    post_id,
    similarity_matrix_path="../random_caption/posts_random_caption_similarity_matrix.csv",
    dataset_path="../random_caption/posts_random_caption.csv",
    top_n=5,
):
    # Load the precomputed similarity matrix
    similarity_df = pd.read_csv(similarity_matrix_path, index_col=0)

    # Ensure the post_id exists in the index
    if post_id not in similarity_df.index:
        raise ValueError(f"Post ID {post_id} not found in similarity matrix.")

    # Convert index and post_id to the same type if necessary (string or integer)
    similarity_df.index = similarity_df.index.astype(str)
    similarity_df.columns = similarity_df.columns.astype(str)
    post_id = str(post_id)

    # Get the similarity scores for the given post
    similarity_scores = similarity_df.loc[post_id]

    # Sort by similarity score (excluding the post itself)
    similar_posts = (
        similarity_scores.drop(
            post_id, errors="ignore"
        )  # Avoid error if post_id is missing
        .sort_values(ascending=False)
        .head(top_n)
    )

    # Load the dataset containing the post details (Caption and Body)
    posts_df = pd.read_csv(dataset_path)

    # Ensure PostID is a string for consistency
    posts_df["PostID"] = posts_df["PostID"].astype(str)

    # Get the selected post details
    selected_post = posts_df[posts_df["PostID"] == post_id][
        ["PostID", "Caption", "Body"]
    ]

    # Merge similar post IDs with their details (Caption and Body)
    similar_posts_details = posts_df[posts_df["PostID"].isin(similar_posts.index)][
        ["PostID", "Caption", "Body"]
    ]

    # Add similarity scores to the details DataFrame
    similar_posts_details["Similarity Score"] = similar_posts.values

    # Print selected post details
    print(f"Selected Post {post_id}:")
    print(selected_post.to_string(index=False))  # Avoid printing index column

    # Return the DataFrame with similar posts and their details
    return similar_posts_details


pd.set_option("display.max_colwidth", None)  # None means no truncation
# Example usage:
post_id = 1695  # Replace with a valid post ID
similar_posts = get_similar_posts(post_id)

# Display similar posts along with their details
print(f"\nPosts similar to {post_id}:")
print(similar_posts)
