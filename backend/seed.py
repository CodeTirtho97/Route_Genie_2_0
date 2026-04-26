"""
Seed script — creates a rich demo user with realistic trips, itinerary days, and bookings.
Run with:  uv run python seed.py
"""
import asyncio
from datetime import date, datetime, timezone

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.security import hash_password
from app.models.booking import Booking, BookingCategory, BookingStatus
from app.models.itinerary import Activity, Coordinates, Day, Itinerary
from app.models.user import User, UserPreferences

# ── Demo credentials ──────────────────────────────────────────
DEMO_EMAIL    = "demo@routegenie.app"
DEMO_PASSWORD = "Demo@1234"

def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def dt(y, mo, d, h=10, mi=0) -> datetime:
    return datetime(y, mo, d, h, mi, tzinfo=timezone.utc)


# ─────────────────────────────────────────────────────────────
#  TRIP DEFINITIONS
# ─────────────────────────────────────────────────────────────

TRIPS = [
    # 1 ── Completed: Bali
    dict(
        title="Bali Adventure Escape",
        destination="Ubud",
        country="Indonesia",
        coordinates=Coordinates(lat=-8.5069, lng=115.2625),
        start_date=date(2024, 11, 10),
        end_date=date(2024, 11, 20),
        num_persons=1,
        trip_type="Adventure",
        budget=1800.0,
        currency="USD",
        cover_image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80",
        tags=["Beach", "Hiking", "Budget", "Solo"],
        status="completed",
        ai_generated=True,
        days=[
            Day(day_number=1, date=date(2024, 11, 10), title="Arrival & Ubud Orientation",
                weather_summary="Sunny, 29°C",
                activities=[
                    Activity(time="14:00", title="Check in to Komaneka at Bisma",
                             description="Eco-luxury jungle resort perched on Ubud's ridge with infinity pool views.",
                             location="Jl. Bisma, Ubud", estimated_cost=120),
                    Activity(time="17:00", title="Monkey Forest Sanctuary",
                             description="Wander among 700+ Balinese long-tailed macaques in a lush sacred forest.",
                             location="Jl. Monkey Forest, Ubud", estimated_cost=5),
                    Activity(time="19:30", title="Dinner at Locavore",
                             description="Award-winning restaurant showcasing hyper-local Indonesian ingredients.",
                             location="Jl. Dewisita No.10, Ubud", estimated_cost=55),
                ]),
            Day(day_number=2, date=date(2024, 11, 11), title="Rice Terraces & Sunrise Trek",
                weather_summary="Partly cloudy, 27°C",
                activities=[
                    Activity(time="05:30", title="Tegallalang Rice Terrace Sunrise Walk",
                             description="Beat the crowds for golden-hour light on the iconic stepped terraces.",
                             location="Tegallalang, Gianyar Regency", estimated_cost=3),
                    Activity(time="09:00", title="Balinese Cooking Class",
                             description="Learn to make nasi goreng, satay lilit and black rice pudding from a local chef.",
                             location="Paon Bali Cooking Class, Ubud", estimated_cost=35),
                    Activity(time="15:00", title="Traditional Kecak Fire Dance",
                             description="Spectacular sunset performance at the clifftop Uluwatu Temple.",
                             location="Pura Luhur Uluwatu", estimated_cost=15),
                ]),
            Day(day_number=3, date=date(2024, 11, 12), title="Volcano & Hot Springs",
                weather_summary="Morning fog, 24°C",
                activities=[
                    Activity(time="07:00", title="Mount Batur Sunrise Hike",
                             description="2-hour guided trek to the active volcano summit for panoramic lake views.",
                             location="Mount Batur, Kintamani", estimated_cost=65),
                    Activity(time="12:00", title="Toya Devasya Natural Hot Springs",
                             description="Relax in geothermally heated pools overlooking the volcanic caldera.",
                             location="Toya Devasya, Kintamani", estimated_cost=25),
                    Activity(time="18:00", title="Naughty Nuri's Warung",
                             description="Legendary BBQ ribs joint — the original Ubud expat institution since 1995.",
                             location="Jl. Raya Sanggingan, Ubud", estimated_cost=20),
                ]),
        ],
    ),

    # 2 ── Completed: Tokyo
    dict(
        title="Tokyo Culture & Ramen Tour",
        destination="Tokyo",
        country="Japan",
        coordinates=Coordinates(lat=35.6762, lng=139.6503),
        start_date=date(2025, 3, 5),
        end_date=date(2025, 3, 11),
        num_persons=2,
        trip_type="Cultural",
        budget=4200.0,
        currency="USD",
        cover_image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80",
        tags=["City", "Food", "History", "Cultural"],
        status="completed",
        ai_generated=True,
        days=[
            Day(day_number=1, date=date(2025, 3, 5), title="Shinjuku & Arrival Day",
                weather_summary="Clear, 10°C",
                activities=[
                    Activity(time="15:00", title="Check in to Park Hyatt Tokyo",
                             description="Iconic Lost in Translation hotel with sweeping cityscape views from floor 39.",
                             location="3-7-1-2 Nishi Shinjuku, Shinjuku", estimated_cost=350),
                    Activity(time="18:00", title="Shinjuku Golden Gai Bar Crawl",
                             description="Labyrinthine alley packed with 200+ tiny 6-seat bars — each with its own personality.",
                             location="Kabukicho, Shinjuku", estimated_cost=40),
                ]),
            Day(day_number=2, date=date(2025, 3, 6), title="Asakusa & Tsukiji Market",
                weather_summary="Overcast, 9°C",
                activities=[
                    Activity(time="07:30", title="Tsukiji Outer Market Breakfast",
                             description="Fresh tamagoyaki, uni on rice, and the best tuna sashimi you will ever eat.",
                             location="4-16-2 Tsukiji, Chuo City", estimated_cost=30),
                    Activity(time="10:00", title="Senso-ji Temple & Nakamise Shopping",
                             description="Tokyo's oldest temple; browse 250m of souvenir stalls for matcha KitKats and wagashi.",
                             location="2-3-1 Asakusa, Taito City", estimated_cost=0),
                    Activity(time="16:00", title="teamLab Borderless Digital Art Museum",
                             description="Immersive 10,000m² borderless world of digital art installations.",
                             location="Odaiba, Koto City", estimated_cost=32),
                    Activity(time="20:00", title="Ramen at Ichiran Harajuku",
                             description="Solo booth ramen — rich tonkotsu broth, perfectly calibrated to your exact taste.",
                             location="1-22-7 Jinnan, Shibuya City", estimated_cost=15),
                ]),
            Day(day_number=3, date=date(2025, 3, 7), title="Shibuya & Harajuku",
                weather_summary="Sunny, 13°C — cherry blossoms beginning",
                activities=[
                    Activity(time="08:00", title="Shibuya Crossing at Dawn",
                             description="Experience the world's busiest pedestrian crossing with no crowds — pure magic.",
                             location="2-2-1 Dogenzaka, Shibuya", estimated_cost=0),
                    Activity(time="10:30", title="Meiji Shrine Forest Walk",
                             description="Tranquil 700-year-old forested path to the imperial shrine in the heart of Tokyo.",
                             location="1-1 Yoyogikamizonocho, Shibuya", estimated_cost=0),
                    Activity(time="14:00", title="Harajuku Takeshita Street",
                             description="Crepe shops, vintage fashion, and the epicentre of Japanese street style culture.",
                             location="Takeshita Street, Harajuku", estimated_cost=20),
                    Activity(time="19:30", title="Sukiyaki at Imahan Honten",
                             description="Premium wagyu beef sukiyaki in a traditional tatami room — a Tokyo institution since 1895.",
                             location="3-1-2 Nishi Asakusa, Taito City", estimated_cost=120),
                ]),
        ],
    ),

    # 3 ── Completed: Rajasthan
    dict(
        title="Rajasthan Heritage Circuit",
        destination="Jaipur",
        country="India",
        coordinates=Coordinates(lat=26.9124, lng=75.7873),
        start_date=date(2025, 2, 10),
        end_date=date(2025, 2, 17),
        num_persons=2,
        trip_type="Cultural",
        budget=85000.0,
        currency="INR",
        cover_image_url="https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=900&q=80",
        tags=["History", "Cultural", "City", "Food"],
        status="completed",
        ai_generated=False,
        days=[],
    ),

    # 4 ── Completed: Meghalaya
    dict(
        title="Monsoon Trek in Meghalaya",
        destination="Shillong",
        country="India",
        coordinates=Coordinates(lat=25.5788, lng=91.8933),
        start_date=date(2024, 6, 28),
        end_date=date(2024, 7, 4),
        num_persons=1,
        trip_type="Adventure",
        budget=22000.0,
        currency="INR",
        cover_image_url="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=80",
        tags=["Hiking", "Mountains", "Solo", "Budget"],
        status="completed",
        ai_generated=False,
        days=[],
    ),

    # 5 ── Ongoing: Italy
    dict(
        title="Italian Riviera Road Trip",
        destination="Cinque Terre",
        country="Italy",
        coordinates=Coordinates(lat=44.1461, lng=9.6439),
        start_date=date(2026, 4, 18),
        end_date=date(2026, 5, 1),
        num_persons=2,
        trip_type="Romantic",
        budget=3800.0,
        currency="EUR",
        cover_image_url="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=80",
        tags=["Beach", "Food", "Luxury", "City"],
        status="ongoing",
        ai_generated=False,
        days=[],
    ),

    # 6 ── Planned: Switzerland
    dict(
        title="Swiss Alps Hiking Expedition",
        destination="Interlaken",
        country="Switzerland",
        coordinates=Coordinates(lat=46.6863, lng=7.8632),
        start_date=date(2026, 8, 10),
        end_date=date(2026, 8, 17),
        num_persons=3,
        trip_type="Adventure",
        budget=5500.0,
        currency="CHF",
        cover_image_url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
        tags=["Mountains", "Hiking", "Adventure"],
        status="planned",
        ai_generated=False,
        days=[],
    ),

    # 7 ── Planned: Maldives
    dict(
        title="Maldives Overwater Retreat",
        destination="Malé",
        country="Maldives",
        coordinates=Coordinates(lat=4.1755, lng=73.5093),
        start_date=date(2026, 12, 20),
        end_date=date(2026, 12, 26),
        num_persons=2,
        trip_type="Relaxation",
        budget=6200.0,
        currency="USD",
        cover_image_url="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=80",
        tags=["Beach", "Luxury", "Relaxation"],
        status="planned",
        ai_generated=False,
        days=[],
    ),

    # 8 ── Cancelled: Singapore
    dict(
        title="Singapore Business Summit",
        destination="Singapore",
        country="Singapore",
        coordinates=Coordinates(lat=1.3521, lng=103.8198),
        start_date=date(2025, 1, 15),
        end_date=date(2025, 1, 18),
        num_persons=1,
        trip_type="Business",
        budget=2800.0,
        currency="SGD",
        cover_image_url="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=80",
        tags=["City", "Business"],
        status="cancelled",
        ai_generated=False,
        days=[],
    ),
]


# ─────────────────────────────────────────────────────────────
#  BOOKINGS  (indexed by trip title for easy linking)
# ─────────────────────────────────────────────────────────────

def bookings_for(trip: Itinerary) -> list[dict]:
    t = trip.title

    if t == "Bali Adventure Escape":
        return [
            dict(category=BookingCategory.FLIGHT, name="IndiGo 6E-1424 DEL → DPS",
                 origin="New Delhi", destination_name="Denpasar", date=dt(2024, 11, 10, 5, 30),
                 time="05:30", price=310.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="6E1424NOV10"),
            dict(category=BookingCategory.HOTEL, name="Komaneka at Bisma, Ubud",
                 origin=None, destination_name="Ubud", date=dt(2024, 11, 10, 14, 0),
                 time="14:00", price=120.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="KOM-82740"),
            dict(category=BookingCategory.ACTIVITY, name="Mount Batur Sunrise Hike (Guided)",
                 origin=None, destination_name="Mount Batur", date=dt(2024, 11, 12, 4, 0),
                 time="04:00", price=65.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number=None),
            dict(category=BookingCategory.FLIGHT, name="Garuda GA-408 DPS → DEL",
                 origin="Denpasar", destination_name="New Delhi", date=dt(2024, 11, 20, 22, 15),
                 time="22:15", price=290.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="GA408NOV20"),
        ]

    if t == "Tokyo Culture & Ramen Tour":
        return [
            dict(category=BookingCategory.FLIGHT, name="Air India AI-307 DEL → NRT",
                 origin="New Delhi", destination_name="Tokyo Narita", date=dt(2025, 3, 5, 2, 45),
                 time="02:45", price=780.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="AI307MAR05"),
            dict(category=BookingCategory.HOTEL, name="Park Hyatt Tokyo",
                 origin=None, destination_name="Shinjuku, Tokyo", date=dt(2025, 3, 5, 15, 0),
                 time="15:00", price=350.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="PH-TYO-2025-8841"),
            dict(category=BookingCategory.ACTIVITY, name="teamLab Borderless — 2 tickets",
                 origin=None, destination_name="Odaiba, Tokyo", date=dt(2025, 3, 6, 16, 0),
                 time="16:00", price=64.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="TLB-991023"),
            dict(category=BookingCategory.RESTAURANT, name="Sukiyaki at Imahan Honten",
                 origin=None, destination_name="Asakusa, Tokyo", date=dt(2025, 3, 7, 19, 30),
                 time="19:30", price=240.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="IH-0703-A"),
            dict(category=BookingCategory.FLIGHT, name="Japan Airlines JL-09 NRT → DEL",
                 origin="Tokyo Narita", destination_name="New Delhi", date=dt(2025, 3, 11, 11, 30),
                 time="11:30", price=720.0, currency="USD", status=BookingStatus.CONFIRMED,
                 confirmation_number="JL09MAR11"),
        ]

    if t == "Rajasthan Heritage Circuit":
        return [
            dict(category=BookingCategory.TRAIN, name="Ajmer Shatabdi Express 12015 NDLS → JP",
                 origin="New Delhi", destination_name="Jaipur", date=dt(2025, 2, 10, 6, 0),
                 time="06:00", price=1250.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="PNR4829301"),
            dict(category=BookingCategory.HOTEL, name="Rambagh Palace by Taj",
                 origin=None, destination_name="Jaipur", date=dt(2025, 2, 10, 14, 0),
                 time="14:00", price=18500.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="TAJ-JP-9284"),
            dict(category=BookingCategory.ACTIVITY, name="Amber Fort Jeep Safari & Guided Tour",
                 origin=None, destination_name="Amber, Jaipur", date=dt(2025, 2, 11, 9, 0),
                 time="09:00", price=2200.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number=None),
            dict(category=BookingCategory.HOTEL, name="Umaid Bhawan Palace, Jodhpur",
                 origin=None, destination_name="Jodhpur", date=dt(2025, 2, 13, 13, 0),
                 time="13:00", price=22000.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="UBP-3320"),
            dict(category=BookingCategory.TRAIN, name="Mandore Express 12462 JU → NDLS",
                 origin="Jodhpur", destination_name="New Delhi", date=dt(2025, 2, 17, 20, 45),
                 time="20:45", price=1100.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="PNR8812940"),
        ]

    if t == "Monsoon Trek in Meghalaya":
        return [
            dict(category=BookingCategory.FLIGHT, name="IndiGo 6E-2412 DEL → SHL",
                 origin="New Delhi", destination_name="Shillong", date=dt(2024, 6, 28, 8, 30),
                 time="08:30", price=5400.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="6E2412JUN28"),
            dict(category=BookingCategory.HOTEL, name="Ri Kynjai Resort, Shillong",
                 origin=None, destination_name="Shillong", date=dt(2024, 6, 28, 13, 0),
                 time="13:00", price=7200.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="RK-4410"),
            dict(category=BookingCategory.ACTIVITY, name="Double Decker Living Root Bridge Trek",
                 origin=None, destination_name="Nongriat Village", date=dt(2024, 6, 30, 7, 0),
                 time="07:00", price=1500.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number=None),
            dict(category=BookingCategory.FLIGHT, name="IndiGo 6E-2413 SHL → DEL",
                 origin="Shillong", destination_name="New Delhi", date=dt(2024, 7, 4, 16, 15),
                 time="16:15", price=5800.0, currency="INR", status=BookingStatus.CONFIRMED,
                 confirmation_number="6E2413JUL04"),
        ]

    if t == "Italian Riviera Road Trip":
        return [
            dict(category=BookingCategory.FLIGHT, name="Emirates EK-507 DEL → FCO (via DXB)",
                 origin="New Delhi", destination_name="Rome Fiumicino", date=dt(2026, 4, 18, 3, 20),
                 time="03:20", price=980.0, currency="EUR", status=BookingStatus.CONFIRMED,
                 confirmation_number="EK507APR18"),
            dict(category=BookingCategory.HOTEL, name="Hotel Cenobio dei Dogi, Camogli",
                 origin=None, destination_name="Camogli, Liguria", date=dt(2026, 4, 19, 14, 0),
                 time="14:00", price=280.0, currency="EUR", status=BookingStatus.CONFIRMED,
                 confirmation_number="CDD-20260419"),
            dict(category=BookingCategory.CAR_RENTAL, name="Hertz — Fiat 500 (7 days)",
                 origin="Rome Fiumicino Airport", destination_name="Genoa", date=dt(2026, 4, 18, 10, 0),
                 time="10:00", price=340.0, currency="EUR", status=BookingStatus.CONFIRMED,
                 confirmation_number="HZ-IT-88210"),
            dict(category=BookingCategory.RESTAURANT, name="Trattoria da Billy, Manarola",
                 origin=None, destination_name="Manarola, Cinque Terre", date=dt(2026, 4, 22, 20, 0),
                 time="20:00", price=95.0, currency="EUR", status=BookingStatus.PENDING,
                 confirmation_number=None),
            dict(category=BookingCategory.FLIGHT, name="Alitalia AZ-792 VCE → DEL",
                 origin="Venice Marco Polo", destination_name="New Delhi", date=dt(2026, 5, 1, 14, 30),
                 time="14:30", price=870.0, currency="EUR", status=BookingStatus.CONFIRMED,
                 confirmation_number="AZ792MAY01"),
        ]

    if t == "Swiss Alps Hiking Expedition":
        return [
            dict(category=BookingCategory.FLIGHT, name="Swiss LX-148 DEL → ZRH",
                 origin="New Delhi", destination_name="Zurich", date=dt(2026, 8, 10, 1, 45),
                 time="01:45", price=1240.0, currency="CHF", status=BookingStatus.CONFIRMED,
                 confirmation_number="LX148AUG10"),
            dict(category=BookingCategory.TRAIN, name="Swiss Pass — Zurich → Interlaken Ost",
                 origin="Zurich HB", destination_name="Interlaken Ost", date=dt(2026, 8, 10, 11, 32),
                 time="11:32", price=95.0, currency="CHF", status=BookingStatus.CONFIRMED,
                 confirmation_number="SWPAS-882"),
            dict(category=BookingCategory.HOTEL, name="Victoria-Jungfrau Grand Hotel, Interlaken",
                 origin=None, destination_name="Interlaken", date=dt(2026, 8, 10, 15, 0),
                 time="15:00", price=620.0, currency="CHF", status=BookingStatus.PENDING,
                 confirmation_number=None),
            dict(category=BookingCategory.ACTIVITY, name="Jungfraujoch — Top of Europe Excursion",
                 origin=None, destination_name="Jungfraujoch, 3454m", date=dt(2026, 8, 12, 8, 0),
                 time="08:00", price=215.0, currency="CHF", status=BookingStatus.PENDING,
                 confirmation_number=None),
        ]

    if t == "Maldives Overwater Retreat":
        return [
            dict(category=BookingCategory.FLIGHT, name="Air India AI-271 DEL → MLE",
                 origin="New Delhi", destination_name="Velana Intl, Malé", date=dt(2026, 12, 20, 8, 15),
                 time="08:15", price=580.0, currency="USD", status=BookingStatus.PENDING,
                 confirmation_number=None),
            dict(category=BookingCategory.HOTEL, name="Soneva Jani Overwater Villa",
                 origin=None, destination_name="Noonu Atoll, Maldives", date=dt(2026, 12, 20, 14, 0),
                 time="14:00", price=4200.0, currency="USD", status=BookingStatus.PENDING,
                 confirmation_number=None),
            dict(category=BookingCategory.ACTIVITY, name="Private Snorkelling & Dolphin Safari",
                 origin=None, destination_name="Noonu Atoll", date=dt(2026, 12, 22, 9, 0),
                 time="09:00", price=180.0, currency="USD", status=BookingStatus.PENDING,
                 confirmation_number=None),
        ]

    if t == "Singapore Business Summit":
        return [
            dict(category=BookingCategory.FLIGHT, name="Singapore Airlines SQ-406 DEL → SIN",
                 origin="New Delhi", destination_name="Singapore Changi", date=dt(2025, 1, 15, 6, 0),
                 time="06:00", price=890.0, currency="SGD", status=BookingStatus.CANCELLED,
                 confirmation_number="SQ406JAN15"),
            dict(category=BookingCategory.HOTEL, name="Marina Bay Sands",
                 origin=None, destination_name="Marina Bay, Singapore", date=dt(2025, 1, 15, 15, 0),
                 time="15:00", price=760.0, currency="SGD", status=BookingStatus.CANCELLED,
                 confirmation_number="MBS-CAN-7714"),
        ]

    return []


# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────

async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[User, Itinerary, Booking],
    )

    # ── 1. Upsert demo user ────────────────────────────────────
    user = await User.find_one(User.email == DEMO_EMAIL)
    if user:
        await user.set({
            "name":          "Arjun Mehta",
            "password_hash": hash_password(DEMO_PASSWORD),
            "dob":           date(1992, 3, 14),
            "gender":        "Male",
            "avatar_url":    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&q=80",
            "preferences":   UserPreferences(
                preferred_currency="USD",
                travel_styles=["Adventure", "Cultural", "Solo", "Hiking", "Food"],
                home_country="India",
                notification_enabled=True,
            ),
            "is_active":     True,
            "updated_at":    now_utc(),
        })
        print(f"[OK] Demo user updated -> {DEMO_EMAIL}")
    else:
        user = User(
            email=DEMO_EMAIL,
            name="Arjun Mehta",
            password_hash=hash_password(DEMO_PASSWORD),
            dob=date(1992, 3, 14),
            gender="Male",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&q=80",
            preferences=UserPreferences(
                preferred_currency="USD",
                travel_styles=["Adventure", "Cultural", "Solo", "Hiking", "Food"],
                home_country="India",
                notification_enabled=True,
            ),
            created_at=datetime(2023, 6, 12, tzinfo=timezone.utc),
        )
        await user.insert()
        print(f"[OK] Demo user created -> {DEMO_EMAIL}")

    # ── 2. Wipe old trips & bookings for demo user ─────────────
    old_trips = await Itinerary.find(Itinerary.user_id == user.id).to_list()
    if old_trips:
        old_ids = [t.id for t in old_trips]
        for oid in old_ids:
            await Booking.find(Booking.itinerary_id == oid).delete()
        await Itinerary.find(Itinerary.user_id == user.id).delete()
        print(f"[OK] Cleared {len(old_trips)} old trip(s) + their bookings")

    # ── 3. Insert trips + bookings ────────────────────────────
    total_bookings = 0
    for tdata in TRIPS:
        days  = tdata.pop("days", [])
        coord = tdata.pop("coordinates")
        trip  = Itinerary(user_id=user.id, coordinates=coord, days=days, **tdata)
        await trip.insert()

        blist = bookings_for(trip)
        for bd in blist:
            bdate: datetime = bd["date"]
            booking = Booking(
                user_id=user.id,
                itinerary_id=trip.id,
                is_past=bdate < now_utc(),
                **bd,
            )
            await booking.insert()
        total_bookings += len(blist)
        print(f"  [+] {trip.title:46s} ({trip.status:10s}) - {len(blist)} booking(s)")

    print()
    print("-" * 54)
    print(f"  Trips    : {len(TRIPS)}")
    print(f"  Bookings : {total_bookings}")
    print(f"  Email    : {DEMO_EMAIL}")
    print(f"  Password : {DEMO_PASSWORD}")
    print("-" * 54)

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
