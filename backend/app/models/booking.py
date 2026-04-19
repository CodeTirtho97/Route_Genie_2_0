from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from datetime import datetime, timezone
from enum import Enum


class BookingCategory(str, Enum):
    FLIGHT     = "Flight"
    TRAIN      = "Train"
    BUS        = "Bus"
    HOTEL      = "Hotel"
    RESTAURANT = "Restaurant"
    ACTIVITY   = "Activity"
    CAR_RENTAL = "Car Rental"
    OTHER      = "Other"


class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    PENDING   = "pending"
    CANCELLED = "cancelled"


class Booking(Document):
    user_id: Indexed(PydanticObjectId)
    itinerary_id: Indexed(PydanticObjectId)
    category: BookingCategory
    name: str
    origin: str | None = None
    destination_name: str | None = None
    date: datetime
    time: str | None = None
    price: float
    currency: str = "USD"
    status: BookingStatus = BookingStatus.PENDING
    confirmation_number: str | None = None
    notes: str | None = None
    is_past: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "bookings"
        indexes = [
            [("user_id", 1)],
            [("itinerary_id", 1)],
            [("user_id", 1), ("date", -1)],
            [("user_id", 1), ("is_past", 1)],
            [("user_id", 1), ("category", 1)],
        ]
