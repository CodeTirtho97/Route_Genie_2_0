from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Literal

BookingCategory = Literal["Flight", "Train", "Bus", "Hotel", "Restaurant", "Activity", "Car Rental", "Other"]
BookingStatus   = Literal["confirmed", "pending", "cancelled"]


class BookingCreate(BaseModel):
    itinerary_id: str
    category: BookingCategory
    name: str
    origin: str | None = None
    destination_name: str | None = None
    date: datetime
    time: str | None = None
    price: float
    currency: str = "USD"
    confirmation_number: str | None = None
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("price")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v


class BookingUpdate(BaseModel):
    category: BookingCategory | None = None
    name: str | None = None
    origin: str | None = None
    destination_name: str | None = None
    date: datetime | None = None
    time: str | None = None
    price: float | None = None
    currency: str | None = None
    status: BookingStatus | None = None
    confirmation_number: str | None = None
    notes: str | None = None


class BookingResponse(BaseModel):
    id: str
    user_id: str
    itinerary_id: str
    category: str
    name: str
    origin: str | None
    destination_name: str | None
    date: datetime
    time: str | None
    price: float
    currency: str
    status: str
    confirmation_number: str | None
    notes: str | None
    is_past: bool
    created_at: datetime
    updated_at: datetime


class BookingListItem(BaseModel):
    id: str
    itinerary_id: str
    category: str
    name: str
    origin: str | None
    destination_name: str | None
    date: datetime
    time: str | None
    price: float
    currency: str
    status: str
    confirmation_number: str | None
    is_past: bool
    created_at: datetime
