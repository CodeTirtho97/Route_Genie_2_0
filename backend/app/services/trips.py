from datetime import datetime, timezone, date as date_type

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.itinerary import Itinerary
from app.models.user import User
from app.schemas.trips import TripCreate, TripUpdate, TripResponse, TripListItem


def _duration(start: date_type, end: date_type) -> int:
    return max((end - start).days + 1, 1)


def _to_response(trip: Itinerary) -> TripResponse:
    return TripResponse(
        id=str(trip.id),
        user_id=str(trip.user_id),
        title=trip.title,
        destination=trip.destination,
        country=trip.country,
        start_date=trip.start_date,
        end_date=trip.end_date,
        num_persons=trip.num_persons,
        trip_type=trip.trip_type,
        budget=trip.budget,
        currency=trip.currency,
        cover_image_url=trip.cover_image_url,
        tags=trip.tags,
        status=trip.status,
        ai_generated=trip.ai_generated,
        duration_days=_duration(trip.start_date, trip.end_date),
        days_count=len(trip.days),
        created_at=trip.created_at,
        updated_at=trip.updated_at,
    )


def _to_list_item(trip: Itinerary) -> TripListItem:
    return TripListItem(
        id=str(trip.id),
        title=trip.title,
        destination=trip.destination,
        country=trip.country,
        start_date=trip.start_date,
        end_date=trip.end_date,
        num_persons=trip.num_persons,
        trip_type=trip.trip_type,
        budget=trip.budget,
        currency=trip.currency,
        cover_image_url=trip.cover_image_url,
        tags=trip.tags,
        status=trip.status,
        ai_generated=trip.ai_generated,
        duration_days=_duration(trip.start_date, trip.end_date),
        created_at=trip.created_at,
    )


async def list_trips(
    user: User,
    status_filter: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[TripListItem], int]:
    query = Itinerary.find(Itinerary.user_id == user.id)
    if status_filter:
        query = query.find(Itinerary.status == status_filter)

    total = await query.count()
    trips = await query.sort(-Itinerary.created_at).skip((page - 1) * limit).limit(limit).to_list()
    return [_to_list_item(t) for t in trips], total


async def create_trip(user: User, data: TripCreate) -> TripResponse:
    trip = Itinerary(
        user_id=user.id,
        title=data.title,
        destination=data.destination,
        country=data.country,
        coordinates={"lat": 0.0, "lng": 0.0},  # placeholder until geocoding
        start_date=data.start_date,
        end_date=data.end_date,
        num_persons=data.num_persons,
        trip_type=data.trip_type,
        budget=data.budget,
        currency=data.currency,
        cover_image_url=data.cover_image_url,
        tags=data.tags,
    )
    await trip.insert()
    return _to_response(trip)


async def get_trip(trip_id: str, user: User) -> TripResponse:
    trip = await _fetch_owned(trip_id, user)
    return _to_response(trip)


async def update_trip(trip_id: str, user: User, data: TripUpdate) -> TripResponse:
    trip = await _fetch_owned(trip_id, user)
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await trip.set(updates)
    return _to_response(trip)


async def delete_trip(trip_id: str, user: User) -> None:
    trip = await _fetch_owned(trip_id, user)
    await trip.delete()


async def _fetch_owned(trip_id: str, user: User) -> Itinerary:
    try:
        oid = PydanticObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid trip ID")

    trip = await Itinerary.get(oid)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    if trip.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return trip
