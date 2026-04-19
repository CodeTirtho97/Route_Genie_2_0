from fastapi import APIRouter, Depends, Request
from redis.asyncio import Redis

from app.db.redis import get_redis
from app.dependencies.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse,
    UserResponse, UpdateProfileRequest, ChangePasswordRequest,
    UpdatePreferencesRequest, UserPreferencesResponse, RefreshRequest,
)
from app.schemas.common import ApiResponse, MessageResponse
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=ApiResponse[TokenResponse], status_code=201)
async def register(data: RegisterRequest):
    user = await auth_service.register(data)
    token_data = auth_service.build_token_response(user)
    return {"success": True, "data": token_data, "message": "Registration successful"}


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(data: LoginRequest):
    user = await auth_service.login(data.email, data.password)
    token_data = auth_service.build_token_response(user)
    return {"success": True, "data": token_data, "message": "Login successful"}


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis),
):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()
    await auth_service.logout(token, redis)
    return {"success": True, "message": "Logged out successfully"}


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh(data: RefreshRequest, redis: Redis = Depends(get_redis)):
    access_token, refresh_token = await auth_service.refresh_tokens(data.refresh_token, redis)
    user_id = None
    from jose import jwt
    from app.core.config import settings
    payload = jwt.decode(access_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    user_id = payload.get("sub")
    user = await auth_service.get_user_by_id(user_id)
    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": auth_service._to_user_response(user),
        },
        "message": "Token refreshed",
    }


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": auth_service._to_user_response(current_user)}


@router.patch("/me", response_model=ApiResponse[UserResponse])
async def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
):
    user = await auth_service.update_profile(current_user, data)
    return {"success": True, "data": auth_service._to_user_response(user)}


@router.patch("/me/password", response_model=MessageResponse)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    await auth_service.change_password(current_user, data.current_password, data.new_password)
    return {"success": True, "message": "Password updated successfully"}


@router.patch("/me/preferences", response_model=ApiResponse[UserPreferencesResponse])
async def update_preferences(
    data: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
):
    user = await auth_service.update_preferences(current_user, data)
    return {"success": True, "data": UserPreferencesResponse(**user.preferences.model_dump())}
