# cluster search
import pandas as pd


def get_post_details(
    post_id,
    clustered_posts_path="../../caption_from_body/posts_clustered.csv",
):
    # Load the clustered posts data
    clustered_df = pd.read_csv(clustered_posts_path)

    # Ensure PostID is a string for consistency
    clustered_df["PostID"] = clustered_df["PostID"].astype(str)
    post_id = str(post_id)

    # Check if the post_id exists in the dataset
    if post_id not in clustered_df["PostID"].values:
        raise ValueError(f"Post ID {post_id} not found in clustered data.")

    # Get the post details (PostID, Caption, Body, Cluster)
    post_details = clustered_df[clustered_df["PostID"] == post_id][
        ["PostID", "Caption", "Body", "Cluster"]
    ]

    # Print and return the post details
    print("\nPost Details:")
    print(post_details.to_string(index=False))  # Avoid printing index column

    return post_details


pd.set_option("display.max_colwidth", None)  # None means no truncation
# Example usage:
post_id = 1321  # User inputs the Post ID
post_info = get_post_details(post_id)
