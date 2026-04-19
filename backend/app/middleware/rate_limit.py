import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.db.redis import get_redis


AUTH_LIMIT   = 5    # requests
AUTH_WINDOW  = 900  # 15 minutes
API_LIMIT    = 100  # requests
API_WINDOW   = 60   # 1 minute


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            redis = get_redis()
        except RuntimeError:
            return await call_next(request)

        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        if path.endswith("/auth/login") or path.endswith("/auth/register"):
            key    = f"rate:auth:{client_ip}"
            limit  = AUTH_LIMIT
            window = AUTH_WINDOW
        else:
            key    = f"rate:api:{client_ip}"
            limit  = API_LIMIT
            window = API_WINDOW

        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, window)

        if current > limit:
            return JSONResponse(
                status_code=429,
                content={"success": False, "error": "RATE_LIMIT_EXCEEDED", "detail": "Too many requests"},
            )

        return await call_next(request)
