from datetime import datetime, timezone, timedelta
from uuid import uuid4

from fastapi import HTTPException, status
from jose import JWTError
from redis.asyncio import Redis

from app.core.config import settings
from app.core.exceptions import CredentialsException, ConflictException, NotFoundException
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.models.user import User, UserPreferences
from app.schemas.auth import (
    RegisterRequest, UserResponse, UserPreferencesResponse,
    UpdateProfileRequest, UpdatePreferencesRequest,
)

_RESET_TTL = 15 * 60  # 15 minutes in seconds


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        dob=user.dob,
        gender=user.gender,
        avatar_url=user.avatar_url,
        preferences=UserPreferencesResponse(**user.preferences.model_dump()),
        created_at=user.created_at.isoformat(),
    )


async def register(data: RegisterRequest) -> User:
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise ConflictException("Email already registered")

    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        dob=data.dob,
        gender=data.gender,
    )
    await user.insert()
    return user


async def login(email: str, password: str) -> User:
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.password_hash):
        raise CredentialsException("Invalid email or password")
    if not user.is_active:
        raise CredentialsException("Account is disabled")
    return user


async def logout(token: str, redis: Redis) -> None:
    try:
        payload = decode_token(token)
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            remaining = exp - int(datetime.now(timezone.utc).timestamp())
            if remaining > 0:
                await redis.setex(f"auth:blacklist:{jti}", remaining, "1")
    except JWTError:
        pass


async def refresh_tokens(refresh_token: str, redis: Redis) -> tuple[str, str]:
    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise CredentialsException("Invalid refresh token")

    if payload.get("type") != "refresh":
        raise CredentialsException("Invalid token type")

    jti = payload.get("jti")
    if jti and await redis.exists(f"auth:blacklist:{jti}"):
        raise CredentialsException("Token has been revoked")

    user_id = payload.get("sub")
    user = await User.get(user_id)
    if not user or not user.is_active:
        raise CredentialsException("User not found")

    # Invalidate old refresh token
    await logout(refresh_token, redis)

    return create_access_token(str(user.id), user.email), create_refresh_token(str(user.id))


async def get_user_by_id(user_id: str) -> User:
    user = await User.get(user_id)
    if not user:
        raise NotFoundException("User not found")
    return user


async def update_profile(user: User, data: UpdateProfileRequest) -> User:
    updates = data.model_dump(exclude_none=True)
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await user.set(updates)
    return user


async def change_password(user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise CredentialsException("Current password is incorrect")
    await user.set({
        "password_hash": hash_password(new_password),
        "updated_at": datetime.now(timezone.utc),
    })


async def update_preferences(user: User, data: UpdatePreferencesRequest) -> User:
    updates = data.model_dump(exclude_none=True)
    if updates:
        prefs = user.preferences.model_dump()
        prefs.update(updates)
        await user.set({
            "preferences": UserPreferences(**prefs),
            "updated_at": datetime.now(timezone.utc),
        })
    return user


async def forgot_password(email: str, redis: Redis) -> None:
    user = await User.find_one(User.email == email)
    if not user or not user.is_active:
        return  # silent — don't reveal whether email exists

    token = str(uuid4())
    await redis.setex(f"password:reset:{token}", _RESET_TTL, str(user.id))

    from app.services.email import send_password_reset
    await send_password_reset(user.email, user.name, token)


async def reset_password(token: str, new_password: str, redis: Redis) -> None:
    key = f"password:reset:{token}"
    user_id = await redis.get(key)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired",
        )

    user = await User.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    await user.set({
        "password_hash": hash_password(new_password),
        "updated_at": datetime.now(timezone.utc),
    })
    await redis.delete(key)


def build_token_response(user: User) -> dict:
    return {
        "access_token": create_access_token(str(user.id), user.email),
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type": "bearer",
        "user": _to_user_response(user),
    }
