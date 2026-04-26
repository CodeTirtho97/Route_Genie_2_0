from fastapi import APIRouter, Depends, Query

from app.dependencies.deps import get_current_user
from app.models.user import User
from app.schemas.bookings import BookingCreate, BookingUpdate, BookingResponse, BookingListItem
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services import bookings as booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=PaginatedResponse[BookingListItem])
async def list_bookings(
    itinerary_id: str | None = Query(None),
    category: str | None = Query(None),
    booking_status: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=500),
    current_user: User = Depends(get_current_user),
):
    items, total = await booking_service.list_bookings(
        current_user, itinerary_id, category, booking_status, page, limit
    )
    pages = max(1, -(-total // limit))
    return PaginatedResponse(data=items, total=total, page=page, limit=limit, pages=pages)


@router.post("", response_model=ApiResponse[BookingResponse], status_code=201)
async def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
):
    booking = await booking_service.create_booking(current_user, data)
    return {"success": True, "data": booking, "message": "Booking created"}


@router.get("/{booking_id}", response_model=ApiResponse[BookingResponse])
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
):
    booking = await booking_service.get_booking(booking_id, current_user)
    return {"success": True, "data": booking}


@router.patch("/{booking_id}", response_model=ApiResponse[BookingResponse])
async def update_booking(
    booking_id: str,
    data: BookingUpdate,
    current_user: User = Depends(get_current_user),
):
    booking = await booking_service.update_booking(booking_id, current_user, data)
    return {"success": True, "data": booking, "message": "Booking updated"}


@router.delete("/{booking_id}", response_model=MessageResponse)
async def delete_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
):
    await booking_service.delete_booking(booking_id, current_user)
    return {"success": True, "message": "Booking deleted"}
