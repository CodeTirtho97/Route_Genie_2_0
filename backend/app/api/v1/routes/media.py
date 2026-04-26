from fastapi import APIRouter, Query
import httpx
from app.core.config import settings

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/photos")
async def search_photos(
    query: str = Query(..., min_length=1, max_length=120),
    per_page: int = Query(default=1, ge=1, le=10),
):
    if not settings.PEXELS_API_KEY:
        return {"photos": [], "total": 0}

    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            r = await client.get(
                "https://api.pexels.com/v1/search",
                headers={"Authorization": settings.PEXELS_API_KEY},
                params={"query": query, "per_page": per_page, "orientation": "landscape"},
            )
            r.raise_for_status()
        except httpx.HTTPError:
            return {"photos": [], "total": 0}

        data = r.json()
        photos = [
            {
                "id": p["id"],
                "url": p["src"]["large2x"],
                "url_medium": p["src"]["large"],
                "photographer": p["photographer"],
                "alt": p.get("alt", ""),
            }
            for p in data.get("photos", [])
        ]
        return {"photos": photos, "total": data.get("total_results", 0)}
