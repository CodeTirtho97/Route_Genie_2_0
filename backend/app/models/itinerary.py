from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field
from datetime import date, datetime, timezone
from typing import Literal


class Coordinates(BaseModel):
    lat: float
    lng: float


class Activity(BaseModel):
    time: str | None = None
    title: str
    description: str | None = None
    location: str | None = None
    coordinates: Coordinates | None = None
    category: str | None = None
    estimated_cost: float = 0.0


class Day(BaseModel):
    day_number: int
    date: date
    title: str
    weather_summary: str | None = None
    activities: list[Activity] = []


class Itinerary(Document):
    user_id: Indexed(PydanticObjectId)
    title: str
    destination: str
    country: str
    coordinates: Coordinates
    start_date: date
    end_date: date
    num_persons: int
    trip_type: str
    budget: float
    currency: str = "USD"
    cover_image_url: str | None = None
    days: list[Day] = []
    tags: list[str] = []
    status: Literal["planned", "ongoing", "completed", "cancelled"] = "planned"
    notes: str | None = None
    ai_generated: bool = False
    agent_session_id: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "itineraries"
        indexes = [
            [("user_id", 1)],
            [("user_id", 1), ("status", 1)],
            [("destination", "text")],
        ]
