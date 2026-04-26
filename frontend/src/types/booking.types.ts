export type BookingCategory = "Flight" | "Train" | "Bus" | "Hotel" | "Restaurant" | "Activity" | "Car Rental" | "Other";
export type BookingStatus   = "confirmed" | "pending" | "cancelled";

export interface BookingListItem {
  id: string;
  itinerary_id: string;
  category: BookingCategory;
  name: string;
  origin: string | null;
  destination_name: string | null;
  date: string;
  time: string | null;
  price: number;
  currency: string;
  status: BookingStatus;
  confirmation_number: string | null;
  is_past: boolean;
  created_at: string;
}

export interface BookingResponse extends BookingListItem {
  user_id: string;
  notes: string | null;
  updated_at: string;
}

export interface BookingCreate {
  itinerary_id: string;
  category: BookingCategory;
  name: string;
  origin?: string;
  destination_name?: string;
  date: string;
  time?: string;
  price: number;
  currency?: string;
  confirmation_number?: string;
  notes?: string;
}

export interface BookingUpdate {
  category?: BookingCategory;
  name?: string;
  origin?: string;
  destination_name?: string;
  date?: string;
  time?: string;
  price?: number;
  currency?: string;
  status?: BookingStatus;
  confirmation_number?: string;
  notes?: string;
}
