from typing import List
from pydantic import BaseModel


class SimilarPostsResponse(BaseModel):
    postId: str
    similarPostIds: List[str]


class GenerateItineraryRequest(BaseModel):
    destination: str
    days: int
    preferences: list[str] = []


class Activity(BaseModel):
    title: str
    description: str
    location: str


class Day(BaseModel):
    day: int
    activities: List[Activity]


class GeneratedItinerary(BaseModel):
    destination: str
    days: List[Day]
