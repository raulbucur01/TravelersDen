import pandas as pd


def get_similar_posts(
    post_id,
    similarity_matrix_path="../../../../api/data/posts_similarity_matrix.csv",
    dataset_path="../../../../api/data/posts.csv",
    top_n=10,
):
    # Load the precomputed similarity matrix
    similarity_df = pd.read_csv(similarity_matrix_path, index_col=0, dtype=str)

    # Ensure PostID is treated as a string
    similarity_df.index = similarity_df.index.astype(str)
    similarity_df.columns = similarity_df.columns.astype(str)
    post_id = str(post_id)  # Convert the input ID to string

    # Ensure the post_id exists in the similarity matrix
    if post_id not in similarity_df.index:
        raise ValueError(f"Post ID {post_id} not found in similarity matrix.")

    # Get the similarity scores for the given post
    similarity_scores = similarity_df.loc[post_id]

    # Sort by similarity score (excluding the post itself)
    similar_posts = (
        similarity_scores.drop(post_id, errors="ignore")  # Exclude self
        .sort_values(ascending=False)
        .head(top_n)
    )

    # Load the dataset containing the post details
    posts_df = pd.read_csv(
        dataset_path, dtype={"PostId": str}
    )  # Treat PostID as string

    # Get the selected post details
    selected_post = posts_df[posts_df["PostId"] == post_id][
        ["PostId", "Caption", "Body"]
    ]

    # Merge similar post IDs with their details
    similar_posts_details = posts_df[posts_df["PostId"].isin(similar_posts.index)][
        ["PostId", "Caption", "Body"]
    ]

    # Add similarity scores to the DataFrame
    similar_posts_details["Similarity Score"] = similar_posts.values

    # Print selected post details
    print(f"Selected Post {post_id}:")
    print(selected_post.to_string(index=False))  # Avoid printing index column

    return similar_posts_details


pd.set_option("display.max_colwidth", None)  # None means no truncation
# Example usage:
post_id = "1b61497f-f287-4ffc-ab0e-6ada1a5cf8c1"  # Replace with a valid post ID
similar_posts = get_similar_posts(post_id)

# Display similar posts along with their details
print(f"\nPosts similar to {post_id}:")
print(similar_posts)
