export const ROUTES = {
  home:      "/",
  login:     "/login",
  signup:    "/signup",
  dashboard: "/dashboard",
  trips:     "/trips",
  tripCreate: "/trips/new",
  tripDetail: (id = ":id") => `/trips/${id}`,
  bookings:  "/bookings",
  agent:     "/agent",
  profile:   "/profile",
} as const;
