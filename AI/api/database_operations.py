from sqlalchemy import create_engine, text
import urllib

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=DESKTOP-C99J9KM\\SQLEXPRESS;"
    "DATABASE=TravelApp;"
    "Trusted_Connection=yes;"
)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(DATABASE_URL)


def fetch_unprocessed_inserted_posts():
    """Fetch unprocessed inserted posts from PostChanges."""
    try:
        with engine.connect() as conn:
            query = text(
                "SELECT PostId, Caption, Body FROM PostChanges WHERE ChangeType = 'INSERT' AND Processed = 0"
            )
            result = conn.execute(query).fetchall()
            return [
                {"PostId": row[0], "Caption": row[1], "Body": row[2]} for row in result
            ]
    except Exception as e:
        print(f"❌ Failed to fetch inserted posts: {e}")
        return []


def fetch_unprocessed_updated_posts():
    """Fetch unprocessed updated posts from PostChanges."""
    try:
        with engine.connect() as conn:
            query = text(
                "SELECT PostId, Caption, Body FROM PostChanges WHERE ChangeType = 'UPDATE' AND Processed = 0"
            )
            result = conn.execute(query).fetchall()
            return [
                {"PostId": row[0], "Caption": row[1], "Body": row[2]} for row in result
            ]
    except Exception as e:
        print(f"❌ Failed to fetch updated posts: {e}")
        return []


def fetch_unprocessed_deleted_posts():
    """Fetch unprocessed deleted posts from DeletedPosts."""
    try:
        with engine.connect() as conn:
            query = text("SELECT PostId FROM DeletedPosts WHERE Processed = 0")
            result = conn.execute(query).fetchall()
            return [row[0] for row in result]
    except Exception as e:
        print(f"❌ Failed to fetch deleted posts: {e}")
        return []


def mark_as_processed(post_ids):
    """Mark posts in PostChanges as processed (Processed = 1)."""
    if not post_ids:
        print("⚠️ No inserted or updated posts to mark as processed.")
        return

    try:
        with engine.connect() as conn:
            # Create dynamic placeholders like (:p1, :p2, :p3)
            placeholders = ", ".join([f":p{i}" for i in range(len(post_ids))])
            query = text(
                f"UPDATE PostChanges SET Processed = 1 WHERE PostId IN ({placeholders})"
            )

            # Create a dictionary of parameters for SQLAlchemy
            params = {f"p{i}": post_id for i, post_id in enumerate(post_ids)}
            conn.execute(query, params)
            conn.commit()

            print(f"✅ Marked {len(post_ids)} posts as processed in PostChanges.")
    except Exception as e:
        print(f"❌ Failed to mark posts as processed: {e}")


def mark_deletions_as_processed(post_ids):
    """Mark posts in DeletedPosts as processed (Processed = 1)."""
    if not post_ids:
        print("⚠️ No deleted posts to mark as processed.")
        return

    try:
        with engine.connect() as conn:
            placeholders = ", ".join([f":p{i}" for i in range(len(post_ids))])
            query = text(
                f"UPDATE DeletedPosts SET Processed = 1 WHERE PostId IN ({placeholders})"
            )

            params = {f"p{i}": post_id for i, post_id in enumerate(post_ids)}

            conn.execute(query, params)
            conn.commit()

            print(
                f"✅ Marked {len(post_ids)} deleted posts as processed in DeletedPosts."
            )
    except Exception as e:
        print(f"❌ Failed to mark deleted posts as processed: {e}")


def delete_processed_data():
    try:
        with engine.connect() as conn:
            # SQL query to delete processed rows from both tables
            delete_post_changes = text("DELETE FROM PostChanges WHERE Processed = 1")
            delete_deleted_posts = text("DELETE FROM DeletedPosts WHERE Processed = 1")

            # Execute both delete statements
            conn.execute(delete_post_changes)
            conn.execute(delete_deleted_posts)
            conn.commit()

            print("✅ Successfully deleted all processed entries.")
    except Exception as e:
        print(f"❌ Failed to delete processed entries: {e}")
        conn.rollback()
