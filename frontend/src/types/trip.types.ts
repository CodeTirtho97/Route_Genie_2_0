export type TripType = "Adventure" | "Cultural" | "Relaxation" | "Business" | "Family" | "Romantic" | "Solo" | "Other";
export type TripStatus = "planned" | "ongoing" | "completed" | "cancelled";

export interface TripListItem {
  id: string;
  title: string;
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  num_persons: number;
  trip_type: TripType;
  budget: number;
  currency: string;
  cover_image_url: string | null;
  tags: string[];
  status: TripStatus;
  ai_generated: boolean;
  duration_days: number;
  created_at: string;
}

export interface TripResponse extends TripListItem {
  user_id: string;
  notes: string | null;
  days_count: number;
  updated_at: string;
}

export interface TripCreate {
  title: string;
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  num_persons: number;
  trip_type: TripType;
  budget: number;
  currency: string;
  cover_image_url?: string;
  tags?: string[];
}

export interface TripUpdate {
  title?: string;
  destination?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  num_persons?: number;
  trip_type?: TripType;
  budget?: number;
  currency?: string;
  cover_image_url?: string;
  tags?: string[];
  status?: TripStatus;
  notes?: string;
}
