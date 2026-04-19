from fastapi import APIRouter, Depends, Query

from app.dependencies.deps import get_current_user
from app.models.user import User
from app.schemas.trips import TripCreate, TripUpdate, TripResponse, TripListItem
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services import trips as trip_service

router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("", response_model=PaginatedResponse[TripListItem])
async def list_trips(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    items, total = await trip_service.list_trips(current_user, status, page, limit)
    pages = max(1, -(-total // limit))
    return PaginatedResponse(data=items, total=total, page=page, limit=limit, pages=pages)


@router.post("", response_model=ApiResponse[TripResponse], status_code=201)
async def create_trip(
    data: TripCreate,
    current_user: User = Depends(get_current_user),
):
    trip = await trip_service.create_trip(current_user, data)
    return {"success": True, "data": trip, "message": "Trip created"}


@router.get("/{trip_id}", response_model=ApiResponse[TripResponse])
async def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
):
    trip = await trip_service.get_trip(trip_id, current_user)
    return {"success": True, "data": trip}


@router.patch("/{trip_id}", response_model=ApiResponse[TripResponse])
async def update_trip(
    trip_id: str,
    data: TripUpdate,
    current_user: User = Depends(get_current_user),
):
    trip = await trip_service.update_trip(trip_id, current_user, data)
    return {"success": True, "data": trip, "message": "Trip updated"}


@router.delete("/{trip_id}", response_model=MessageResponse)
async def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
):
    await trip_service.delete_trip(trip_id, current_user)
    return {"success": True, "message": "Trip deleted"}
