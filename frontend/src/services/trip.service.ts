import { api } from "./api";
import type { TripCreate, TripUpdate, TripResponse, TripListItem } from "../types/trip.types";
import type { ApiResponse, PaginatedResponse } from "../types/api.types";

export const tripService = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<TripListItem>>("/trips", { params }).then((r) => r.data),

  create: (data: TripCreate) =>
    api.post<ApiResponse<TripResponse>>("/trips", data).then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<TripResponse>>(`/trips/${id}`).then((r) => r.data.data),

  update: (id: string, data: TripUpdate) =>
    api.patch<ApiResponse<TripResponse>>(`/trips/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/trips/${id}`).then((r) => r.data),
};
