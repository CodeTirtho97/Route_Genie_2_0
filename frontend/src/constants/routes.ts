export const ROUTES = {
  home:           "/",
  about:          "/about",
  login:          "/login",
  signup:         "/signup",
  dashboard:      "/dashboard",
  trips:          "/trips",
  tripCreate:     "/trips/new",
  tripDetail:     (id = ":id") => `/trips/${id}`,
  tripEdit:       (id = ":id") => `/trips/${id}/edit`,
  bookings:       "/bookings",
  profile:        "/profile",
} as const;
