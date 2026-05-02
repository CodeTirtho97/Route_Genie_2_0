from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from jose import JWTError, jwt

from app.core.config import settings

_WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

# These write endpoints must stay open for demo users (logout, token refresh)
_DEMO_ALLOWED_PATHS = {
    "/api/v1/auth/logout",
    "/api/v1/auth/refresh",
}


class DemoGuardMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method not in _WRITE_METHODS:
            return await call_next(request)

        if request.url.path in _DEMO_ALLOWED_PATHS:
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return await call_next(request)

        token = auth_header.removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("email", "").lower() == settings.DEMO_EMAIL.lower():
                return JSONResponse(
                    status_code=403,
                    content={
                        "success": False,
                        "error": "DEMO_RESTRICTED",
                        "detail": "This is a read-only demo account. Create a free account to plan and manage your own trips.",
                    },
                )
        except JWTError:
            pass  # invalid tokens are handled by the auth dependency

        return await call_next(request)
