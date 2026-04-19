from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from app.db.mongodb import get_client
from app.db.redis import get_redis

router = APIRouter()


@router.get("/health")
async def health_check(redis: Redis = Depends(get_redis)):
    mongo_ok = False
    redis_ok = False

    try:
        await get_client().admin.command("ping")
        mongo_ok = True
    except Exception:
        pass

    try:
        await redis.ping()
        redis_ok = True
    except Exception:
        pass

    status = "healthy" if (mongo_ok and redis_ok) else "degraded"
    return {
        "status": status,
        "mongodb": "ok" if mongo_ok else "error",
        "redis": "ok" if redis_ok else "error",
    }
