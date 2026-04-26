import { api } from "./api";
import type { BookingCreate, BookingUpdate, BookingResponse, BookingListItem } from "../types/booking.types";
import type { ApiResponse, PaginatedResponse } from "../types/api.types";

export const bookingService = {
  list: (params?: { itinerary_id?: string; category?: string; status?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<BookingListItem>>("/bookings", { params }).then((r) => r.data),

  create: (data: BookingCreate) =>
    api.post<ApiResponse<BookingResponse>>("/bookings", data).then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<BookingResponse>>(`/bookings/${id}`).then((r) => r.data.data),

  update: (id: string, data: BookingUpdate) =>
    api.patch<ApiResponse<BookingResponse>>(`/bookings/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/bookings/${id}`).then((r) => r.data),
};
