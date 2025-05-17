from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, HTTPException
from apscheduler.schedulers.background import BackgroundScheduler
import redis
from itinerary_generator import generate_itinerary, regenerate_day_activities
from models import (
    ItineraryActivity,
    GenerateItineraryRequest,
    RegenerateDayRequest,
    SimilarPostsResponse,
    GeneratedItinerary,
    SimilarUsersResponse,
)
from post_similarity_handlers import update_similarity_for_posts
from user_similarity_handlers import update_similarity_for_users
from database_operations import delete_processed_data
import ollama
from fastapi.middleware.cors import CORSMiddleware

# Initialize the scheduler
scheduler = BackgroundScheduler()


def periodic_post_similarity_update_task():
    """Task to update the similarity matrix periodically."""
    print("🔄 Updating similarity for posts...")
    update_similarity_for_posts()
    print("✅ Similarity for posts successfully updated.")


def delete_processed_data_task():
    print("🔄 Deleting processed data...")
    delete_processed_data()
    print("✅ Processed data successfully deleted.")


def periodic_user_similarity_update_task():
    print("🔄 Updating similarity for users...")
    update_similarity_for_users()
    print("✅ Similarity for users successfully updated.")


# Schedule the periodic similarity update task every 6 hours
scheduler.add_job(periodic_post_similarity_update_task, "interval", minutes=2)
scheduler.add_job(delete_processed_data_task, "interval", minutes=5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan function to manage the scheduler lifecycle."""

    # print("⏳ Starting Scheduler...")
    # scheduler.start()  # Start scheduler when FastAPI starts
    # print("✅ Scheduler started")
    # periodic_similarity_update_task()
    # delete_processed_data_task()
    yield  # Keep FastAPI running
    # print("⏳ Shutting Down Scheduler...")
    # scheduler.shutdown()  # Shutdown scheduler when FastAPI stops
    # print("✅ Scheduler shut down")


try:
    ollama.list()
    print("Ollama connection established")
except Exception as e:
    print(f"Ollama connection failed: {e}")
    raise

# http://127.0.0.1:8000/docs
app = FastAPI(lifespan=lifespan)
# app = FastAPI()

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


@app.get("/similar-posts/{post_id}", response_model=SimilarPostsResponse)
async def get_similar_posts(post_id: str):
    """Retrieve Top-N similar posts for a given Post ID from Redis."""
    result = redis_client.get(f"similar:{post_id}")

    if result is None:
        return SimilarPostsResponse(postId=post_id, similarPostIds=[])

    similar_post_ids = result.split(",")
    return SimilarPostsResponse(postId=post_id, similarPostIds=similar_post_ids)


@app.get("/similar-users/{user_id}", response_model=SimilarUsersResponse)
async def get_similar_users(user_id: str):
    """Retrieve Top-N similar users for a given User ID from Redis."""
    result = redis_client.get(f"similar_users:{user_id}")

    if result is None:
        return SimilarUsersResponse(userId=user_id, similarUserIds=[])

    similar_user_ids = result.split(",")
    return SimilarUsersResponse(userId=user_id, similarUserIds=similar_user_ids)


@app.post("/generate-itinerary", response_model=GeneratedItinerary)
async def generate_itinerary_endpoint(request: GenerateItineraryRequest):
    try:
        itinerary = generate_itinerary(
            request.destination, request.days, request.preferences
        )

        return itinerary

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/regenerate-day-activities", response_model=List[ItineraryActivity])
async def regenerate_day_activities_endpoint(request: RegenerateDayRequest):
    try:
        activities = regenerate_day_activities(
            request.destination,
            request.excludedActivities,
        )

    except (RuntimeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=str(e))

    return [ItineraryActivity(**a) for a in activities]
