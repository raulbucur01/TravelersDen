from sqlalchemy import create_engine, text
import urllib
import pandas as pd

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=DESKTOP-C99J9KM\\SQLEXPRESS;"
    "DATABASE=TravelApp;"
    "Trusted_Connection=yes;"
)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(DATABASE_URL)


def test_connection():
    """Test the connection to the database and return a success message."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ SQLAlchemy Connection Successful!")
            return True
    except Exception as e:
        print(f"❌ SQLAlchemy Connection Failed: {e}")
        return False


def update_posts_csv_from_db():
    """Fetch posts from SQL Server and save to a CSV file."""
    try:
        path = "../api/data/posts.csv"
        with engine.connect() as conn:
            query = text("SELECT PostId, Caption, Body FROM Posts")
            df = pd.read_sql(query, conn)
            df.to_csv(path, index=False)
            print(f"✅ CSV updated successfully: {path}")
    except Exception as e:
        print(f"❌ Failed to fetch data: {e}")


def fetch_posts_from_db():
    """Fetch posts from SQL Server and return as DataFrame."""
    try:
        with engine.connect() as conn:
            query = text("SELECT PostId, Caption, Body FROM Posts")
            df = pd.read_sql(query, conn)
            return df
    except Exception as e:
        print(f"❌ Failed to fetch data: {e}")
        return None


def remove_post_from_similarity_matrix(
    post_id, path_similarity="../api/data/posts_similarity_matrix.csv"
):
    """
    Removes a specific post ID from the similarity matrix by deleting its row and column.

    Args:
        post_id (str): The ID of the post to remove.
        path_similarity (str): Path to the similarity matrix CSV file.
    """
    try:
        # Load the similarity matrix
        df_similarity = pd.read_csv(path_similarity, index_col=0)

        # Check if the post ID exists
        if post_id not in df_similarity.index:
            print(f"⚠️ Post ID {post_id} not found in similarity matrix.")
            return

        # Drop the row and column
        df_similarity = df_similarity.drop(index=post_id, errors="ignore")
        df_similarity = df_similarity.drop(columns=post_id, errors="ignore")

        # Save the updated similarity matrix
        df_similarity.to_csv(path_similarity)

        print(
            f"✅ Successfully removed post {post_id} from similarity matrix and Redis."
        )

    except Exception as e:
        print(f"❌ Error removing post {post_id}: {e}")


def get_similarity_between_posts(
    post_id1, post_id2, similarity_matrix_path="../api/data/posts_similarity_matrix.csv"
):
    """Fetch and print the similarity score between two posts."""

    # Load the similarity matrix
    df_similarity = pd.read_csv(similarity_matrix_path, index_col=0)

    # Ensure post IDs exist in the matrix
    if (
        str(post_id1) not in df_similarity.index
        or str(post_id2) not in df_similarity.columns
    ):
        print(
            f"❌ One or both Post IDs ({post_id1}, {post_id2}) not found in the similarity matrix."
        )
        return None

    # Retrieve similarity score
    similarity_score = df_similarity.loc[str(post_id1), str(post_id2)]

    print(
        f"🔍 Similarity between Post {post_id1} and Post {post_id2}: {similarity_score:.4f}"
    )
    return similarity_score


def normalize_similarity_matrix(
    matrix: pd.DataFrame, new_ids: list = None
) -> pd.DataFrame:
    """
    Normalizes the similarity matrix to a 0-1 range using the global min and max values.

    Args:
        matrix (pd.DataFrame): The similarity matrix.
        new_ids (list, optional): If provided, only normalizes the specified rows and columns.

    Returns:
        pd.DataFrame: The normalized similarity matrix.
    """
    # Calculate global min and max values
    min_val = matrix.min().min()
    max_val = matrix.max().max()
    epsilon = 1e-9  # Prevent division by zero

    if new_ids:
        # Normalize only the specified rows and columns using the global min/max
        matrix.loc[new_ids] = (matrix.loc[new_ids] - min_val) / (
            max_val - min_val + epsilon
        )
        matrix[new_ids] = (matrix[new_ids] - min_val) / (max_val - min_val + epsilon)
    else:
        # Normalize the entire matrix using the global min/max
        matrix = (matrix - min_val) / (max_val - min_val + epsilon)

    return matrix


# get_similarity_between_posts(
#     "11d04796-eb9c-4b04-bd5b-a5fcd3898248", "fa23b1aa-3c25-42ef-ac1f-d2082ead5461"
# )
# df94b0ec-0483-44d0-bc6a-7aaad48de273
# remove_post_from_similarity_matrix("776d2d4d-1de7-4e89-b10d-cb54dd707e1b")
# remove_post_from_similarity_matrix("79285e3b-5e28-441c-a553-bf2acef2efb3")
# update_posts_csv_from_db()
