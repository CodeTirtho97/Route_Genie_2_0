from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Literal


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str
    dob: date
    gender: Literal["Male", "Female", "Other", "Prefer not to say"]

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserPreferencesResponse(BaseModel):
    preferred_currency: str
    travel_styles: list[str]
    home_country: str | None
    notification_enabled: bool


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    dob: date
    gender: str
    avatar_url: str | None
    preferences: UserPreferencesResponse
    created_at: str


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    dob: date | None = None
    gender: Literal["Male", "Female", "Other", "Prefer not to say"] | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UpdatePreferencesRequest(BaseModel):
    preferred_currency: str | None = None
    travel_styles: list[str] | None = None
    home_country: str | None = None
    notification_enabled: bool | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


TokenResponse.model_rebuild()
