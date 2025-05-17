from typing import List
from pydantic import BaseModel


class SimilarPostsResponse(BaseModel):
    postId: str
    similarPostIds: List[str]


class SimilarUsersResponse(BaseModel):
    userId: str
    similarUserIds: List[str]


class GenerateItineraryRequest(BaseModel):
    destination: str
    days: int
    preferences: list[str] = []


class ItineraryActivity(BaseModel):
    title: str
    description: str
    location: str


class ItineraryDay(BaseModel):
    day: int
    activities: List[ItineraryActivity]


class GeneratedItinerary(BaseModel):
    destination: str
    days: List[ItineraryDay]


class RegenerateDayRequest(BaseModel):
    destination: str
    excludedActivities: List[str]
