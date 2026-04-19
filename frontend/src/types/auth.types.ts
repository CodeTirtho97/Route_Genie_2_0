export interface UserPreferences {
  preferred_currency: string;
  travel_styles: string[];
  home_country: string | null;
  notification_enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  dob: string;
  gender: string;
  avatar_url: string | null;
  preferences: UserPreferences;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  dob: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
}
