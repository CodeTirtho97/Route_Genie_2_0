from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.booking import Booking
from app.models.itinerary import Itinerary
from app.models.user import User
from app.schemas.bookings import BookingCreate, BookingUpdate, BookingResponse, BookingListItem


def _to_response(b: Booking) -> BookingResponse:
    return BookingResponse(
        id=str(b.id),
        user_id=str(b.user_id),
        itinerary_id=str(b.itinerary_id),
        category=b.category.value,
        name=b.name,
        origin=b.origin,
        destination_name=b.destination_name,
        date=b.date,
        time=b.time,
        price=b.price,
        currency=b.currency,
        status=b.status.value,
        confirmation_number=b.confirmation_number,
        notes=b.notes,
        is_past=b.is_past,
        created_at=b.created_at,
        updated_at=b.updated_at,
    )


def _to_list_item(b: Booking) -> BookingListItem:
    return BookingListItem(
        id=str(b.id),
        itinerary_id=str(b.itinerary_id),
        category=b.category.value,
        name=b.name,
        origin=b.origin,
        destination_name=b.destination_name,
        date=b.date,
        time=b.time,
        price=b.price,
        currency=b.currency,
        status=b.status.value,
        confirmation_number=b.confirmation_number,
        notes=b.notes,
        is_past=b.is_past,
        created_at=b.created_at,
    )


async def list_bookings(
    user: User,
    itinerary_id: str | None = None,
    category: str | None = None,
    booking_status: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[BookingListItem], int]:
    query = Booking.find(Booking.user_id == user.id)
    if itinerary_id:
        try:
            iid = PydanticObjectId(itinerary_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid itinerary ID")
        query = query.find(Booking.itinerary_id == iid)
    if category:
        query = query.find(Booking.category == category)
    if booking_status:
        query = query.find(Booking.status == booking_status)

    total = await query.count()
    items = await query.sort(-Booking.date).skip((page - 1) * limit).limit(limit).to_list()
    return [_to_list_item(b) for b in items], total


async def create_booking(user: User, data: BookingCreate) -> BookingResponse:
    try:
        iid = PydanticObjectId(data.itinerary_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid itinerary ID")

    trip = await Itinerary.get(iid)
    if not trip or trip.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    now = datetime.now(timezone.utc)
    booking = Booking(
        user_id=user.id,
        itinerary_id=iid,
        category=data.category,
        name=data.name,
        origin=data.origin,
        destination_name=data.destination_name,
        date=data.date,
        time=data.time,
        price=data.price,
        currency=data.currency,
        confirmation_number=data.confirmation_number,
        notes=data.notes,
        is_past=data.date < now,
    )
    await booking.insert()
    return _to_response(booking)


async def get_booking(booking_id: str, user: User) -> BookingResponse:
    booking = await _fetch_owned(booking_id, user)
    return _to_response(booking)


async def update_booking(booking_id: str, user: User, data: BookingUpdate) -> BookingResponse:
    booking = await _fetch_owned(booking_id, user)
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        if "date" in updates:
            updates["is_past"] = updates["date"] < datetime.now(timezone.utc)
        await booking.set(updates)
    return _to_response(booking)


async def delete_booking(booking_id: str, user: User) -> None:
    booking = await _fetch_owned(booking_id, user)
    await booking.delete()


async def _fetch_owned(booking_id: str, user: User) -> Booking:
    try:
        oid = PydanticObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid booking ID")

    booking = await Booking.get(oid)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return booking
