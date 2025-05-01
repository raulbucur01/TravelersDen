from contextlib import asynccontextmanager
from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
import redis
from similarity_handlers import update_similarity_for_posts
from database_operations import delete_processed_data
import ollama
from fastapi.middleware.cors import CORSMiddleware

# Initialize the scheduler
scheduler = BackgroundScheduler()


def periodic_similarity_update_task():
    """Task to update the similarity matrix periodically."""
    print("\n⏳ Updating similarity...")
    update_similarity_for_posts()
    print("✅ Similarity updated")


def delete_processed_data_task():
    print("\n⏳ Deleting processed data...")
    delete_processed_data()
    print("✅ Processed data deleted")


# Schedule the periodic similarity update task every 6 hours
scheduler.add_job(periodic_similarity_update_task, "interval", minutes=2)
scheduler.add_job(delete_processed_data_task, "interval", minutes=5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan function to manage the scheduler lifecycle."""

    print("⏳ Starting Scheduler...")
    scheduler.start()  # Start scheduler when FastAPI starts
    print("✅ Scheduler started")
    periodic_similarity_update_task()
    delete_processed_data_task()
    yield  # Keep FastAPI running
    print("⏳ Shutting Down Scheduler...")
    scheduler.shutdown()  # Shutdown scheduler when FastAPI stops
    print("✅ Scheduler shut down")


try:
    ollama.list()
    print("Ollama connection established")
except Exception as e:
    print(f"Ollama connection failed: {e}")
    raise

# http://127.0.0.1:8000/docs
app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow all origins (or specify your frontend's URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allow all origins (or replace with ["http://localhost:8000"] for a specific frontend)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Connect to Redis
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


@app.get("/similar_posts/{post_id}")
def get_similar_posts(post_id: str):
    """Retrieve Top-N similar posts for a given Post ID from Redis."""
    similar_posts = redis_client.get(f"similar:{post_id}")

    if similar_posts is None:
        return {"postId": post_id, "similarPostIds": []}

    return {
        "postId": post_id,
        "similarPostIds": list(map(str, similar_posts.split(","))),
    }
