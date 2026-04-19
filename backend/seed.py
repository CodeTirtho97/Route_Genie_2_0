"""
Run with:  uv run python seed.py
Creates (or resets) the demo user and seeds a couple of sample trips.
"""
import asyncio
from datetime import date, datetime, timezone

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.security import hash_password
from app.models.itinerary import Itinerary
from app.models.user import User, UserPreferences

DEMO_EMAIL    = "demo@routegenie.app"
DEMO_PASSWORD = "Demo@1234"
DEMO_NAME     = "Demo User"


SAMPLE_TRIPS = [
    {
        "title":           "Golden Week in Kyoto",
        "destination":     "Kyoto",
        "country":         "Japan",
        "start_date":      date(2025, 4, 29),
        "end_date":        date(2025, 5, 6),
        "num_persons":     2,
        "trip_type":       "Cultural",
        "budget":          3500.0,
        "currency":        "USD",
        "cover_image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        "tags":            ["History", "Food", "City"],
        "status":          "planned",
    },
    {
        "title":           "Bali Adventure Escape",
        "destination":     "Ubud",
        "country":         "Indonesia",
        "start_date":      date(2024, 11, 10),
        "end_date":        date(2024, 11, 20),
        "num_persons":     1,
        "trip_type":       "Adventure",
        "budget":          1800.0,
        "currency":        "USD",
        "cover_image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        "tags":            ["Beach", "Hiking", "Budget"],
        "status":          "completed",
    },
    {
        "title":           "Paris Romantic Getaway",
        "destination":     "Paris",
        "country":         "France",
        "start_date":      date(2025, 9, 1),
        "end_date":        date(2025, 9, 7),
        "num_persons":     2,
        "trip_type":       "Romantic",
        "budget":          4200.0,
        "currency":        "EUR",
        "cover_image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
        "tags":            ["Luxury", "City", "Food"],
        "status":          "planned",
    },
]


async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[User, Itinerary],
    )

    # ── Upsert demo user ──────────────────────────────────────
    existing = await User.find_one(User.email == DEMO_EMAIL)
    if existing:
        await existing.set({
            "password_hash": hash_password(DEMO_PASSWORD),
            "is_active":     True,
            "updated_at":    datetime.now(timezone.utc),
        })
        user = existing
        print(f"[OK] Demo user updated  -> {DEMO_EMAIL}")
    else:
        user = User(
            email=DEMO_EMAIL,
            name=DEMO_NAME,
            password_hash=hash_password(DEMO_PASSWORD),
            dob=date(1995, 1, 15),
            gender="Prefer not to say",
            preferences=UserPreferences(
                preferred_currency="USD",
                travel_styles=["Adventure", "Cultural"],
                home_country="India",
            ),
        )
        await user.insert()
        print(f"✓ Demo user created  → {DEMO_EMAIL}")

    # ── Seed sample trips (skip if user already has trips) ────
    existing_trips = await Itinerary.find(Itinerary.user_id == user.id).count()
    if existing_trips:
        print(f"  Skipping trips - {existing_trips} already exist for demo user.")
    else:
        for t in SAMPLE_TRIPS:
            trip = Itinerary(
                user_id=user.id,
                coordinates={"lat": 0.0, "lng": 0.0},
                **t,
            )
            await trip.insert()
        print(f"[OK] Seeded {len(SAMPLE_TRIPS)} sample trips")

    print()
    print("-" * 40)
    print(f"  Email    : {DEMO_EMAIL}")
    print(f"  Password : {DEMO_PASSWORD}")
    print("-" * 40)

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
