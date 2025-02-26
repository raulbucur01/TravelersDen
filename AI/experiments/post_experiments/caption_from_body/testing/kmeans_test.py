import pandas as pd


def get_kmeans_similar_posts(
    post_id,
    clustered_posts_path="../../caption_from_body/posts_clustered.csv",
    dataset_path="../../caption_from_body/posts_caption_from_body.csv",
    top_n=5,
):
    # Load the clustered posts data
    clustered_df = pd.read_csv(clustered_posts_path)

    # Ensure PostID is a string for consistency
    clustered_df["PostID"] = clustered_df["PostID"].astype(str)
    post_id = str(post_id)

    # Check if the post_id exists in the dataset
    if post_id not in clustered_df["PostID"].values:
        raise ValueError(f"Post ID {post_id} not found in clustered data.")

    # Find the cluster of the given post_id
    post_cluster = clustered_df.loc[
        clustered_df["PostID"] == post_id, "Cluster"
    ].values[0]

    # Get all posts in the same cluster (excluding the input post)
    similar_posts = clustered_df[clustered_df["Cluster"] == post_cluster]
    similar_posts = similar_posts[similar_posts["PostID"] != post_id].head(top_n)

    # Load the dataset containing post details (Caption and Body)
    posts_df = pd.read_csv(dataset_path)
    posts_df["PostID"] = posts_df["PostID"].astype(str)

    # Get the selected post details
    selected_post = posts_df[posts_df["PostID"] == post_id][
        ["PostID", "Caption", "Body"]
    ]

    # Merge similar post IDs with their details (Caption and Body)
    similar_posts_details = posts_df[posts_df["PostID"].isin(similar_posts["PostID"])][
        ["PostID", "Caption", "Body"]
    ]

    # Print selected post details
    print(f"Selected Post {post_id}:")
    print(selected_post.to_string(index=False))  # Avoid printing index column

    # Return the DataFrame with similar posts and their details
    return similar_posts_details


pd.set_option("display.max_colwidth", None)  # None means no truncation
# Example usage:
post_id = 777  # Replace with a valid post ID
similar_posts = get_kmeans_similar_posts(post_id)

# Display similar posts along with their details
print(f"\nPosts similar to {post_id} based on K-Means clustering:")
print(similar_posts)
