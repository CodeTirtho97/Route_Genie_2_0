from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Literal

TripType = Literal["Adventure", "Cultural", "Relaxation", "Business", "Family", "Romantic", "Solo", "Other"]
TripStatus = Literal["planned", "ongoing", "completed", "cancelled"]


class TripCreate(BaseModel):
    title: str
    destination: str
    country: str
    start_date: date
    end_date: date
    num_persons: int = 1
    trip_type: TripType = "Adventure"
    budget: float
    currency: str = "USD"
    cover_image_url: str | None = None
    tags: list[str] = []

    @field_validator("title", "destination", "country")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("End date must be on or after start date")
        return v

    @field_validator("num_persons")
    @classmethod
    def positive_persons(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Number of persons must be at least 1")
        return v

    @field_validator("budget")
    @classmethod
    def non_negative_budget(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Budget cannot be negative")
        return v


class TripUpdate(BaseModel):
    title: str | None = None
    destination: str | None = None
    country: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    num_persons: int | None = None
    trip_type: TripType | None = None
    budget: float | None = None
    currency: str | None = None
    cover_image_url: str | None = None
    tags: list[str] | None = None
    status: TripStatus | None = None
    notes: str | None = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    title: str
    destination: str
    country: str
    start_date: date
    end_date: date
    num_persons: int
    trip_type: str
    budget: float
    currency: str
    cover_image_url: str | None
    tags: list[str]
    status: str
    notes: str | None
    ai_generated: bool
    duration_days: int
    days_count: int
    created_at: datetime
    updated_at: datetime


class TripListItem(BaseModel):
    id: str
    title: str
    destination: str
    country: str
    start_date: date
    end_date: date
    num_persons: int
    trip_type: str
    budget: float
    currency: str
    cover_image_url: str | None
    tags: list[str]
    status: str
    ai_generated: bool
    duration_days: int
    created_at: datetime
