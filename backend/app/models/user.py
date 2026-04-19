from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime, timezone
from typing import Literal


class UserPreferences(BaseModel):
    preferred_currency: str = "USD"
    travel_styles: list[str] = []
    home_country: str | None = None
    notification_enabled: bool = True


class User(Document):
    email: Indexed(EmailStr, unique=True)
    name: str
    password_hash: str
    dob: date
    gender: Literal["Male", "Female", "Other", "Prefer not to say"]
    avatar_url: str | None = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
