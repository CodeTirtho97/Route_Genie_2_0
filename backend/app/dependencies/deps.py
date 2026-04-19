from fastapi import Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from redis.asyncio import Redis

from app.core.exceptions import CredentialsException
from app.core.security import decode_token
from app.db.redis import get_redis
from app.models.user import User

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    redis: Redis = Depends(get_redis),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError:
        raise CredentialsException()

    if payload.get("type") != "access":
        raise CredentialsException("Invalid token type")

    jti = payload.get("jti")
    if jti and await redis.exists(f"auth:blacklist:{jti}"):
        raise CredentialsException("Token has been revoked")

    user_id = payload.get("sub")
    if not user_id:
        raise CredentialsException()

    user = await User.get(user_id)
    if not user or not user.is_active:
        raise CredentialsException("User not found or inactive")

    return user


def pagination_params(page: int = 1, limit: int = 20) -> dict:
    limit = min(limit, 100)
    return {"page": page, "limit": limit, "skip": (page - 1) * limit}
