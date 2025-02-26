import pandas as pd

# Load the clustered posts data
csv_file_path = (
    "../../caption_from_body/posts_clustered.csv"  # Update with your actual path
)
df = pd.read_csv(csv_file_path)

# Ensure Cluster and PostID are treated properly
df["Cluster"] = df["Cluster"].astype(int)  # Ensure Cluster is an integer


# Function to get sample posts from a given cluster
def get_sample_posts(df, cluster_id, sample_size=10):
    cluster_posts = df[df["Cluster"] == cluster_id].sample(
        n=sample_size, random_state=7
    )
    return cluster_posts[["PostID", "Caption", "Body"]]


cluster_a_posts = get_sample_posts(df, 16)

cluster_b_posts = get_sample_posts(df, 2)

# Print results
print("\n📌 Sample Posts from Cluster a:")
print(cluster_a_posts.to_string(index=False))  # Print without index

print("\n📌 Sample Posts from Cluster b:")
print(cluster_b_posts.to_string(index=False))
