import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import { AuthGuard } from "../components/features/auth/AuthGuard";
import { ROUTES } from "../constants/routes";

const Landing        = lazy(() => import("../pages/Landing/Landing"));
const Login          = lazy(() => import("../pages/Auth/Login"));
const Signup         = lazy(() => import("../pages/Auth/Signup"));
const About          = lazy(() => import("../pages/About/About"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword  = lazy(() => import("../pages/Auth/ResetPassword"));
const AppLayout      = lazy(() => import("../components/layout/AppLayout"));
const Dashboard      = lazy(() => import("../pages/Dashboard/Dashboard"));
const Trips          = lazy(() => import("../pages/Trips/Trips"));
const TripCreate     = lazy(() => import("../pages/Trips/TripCreate"));
const TripDetail     = lazy(() => import("../pages/Trips/TripDetail"));

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
    <CircularProgress sx={{ color: "#F59E0B" }} />
  </Box>
);

const wrap = (el: React.ReactNode) => <Suspense fallback={<Loader />}>{el}</Suspense>;

export const router = createBrowserRouter([
  // Public routes
  { path: ROUTES.home,           element: wrap(<Landing />) },
  { path: ROUTES.login,          element: wrap(<Login />) },
  { path: ROUTES.signup,         element: wrap(<Signup />) },
  { path: ROUTES.about,          element: wrap(<About />) },
  { path: ROUTES.forgotPassword, element: wrap(<ForgotPassword />) },
  { path: ROUTES.resetPassword,  element: wrap(<ResetPassword />) },

  // Authenticated routes — wrapped in AppLayout
  {
    element: <AuthGuard>{wrap(<AppLayout />)}</AuthGuard>,
    children: [
      { path: ROUTES.dashboard,  element: wrap(<Dashboard />) },
      { path: ROUTES.trips,      element: wrap(<Trips />) },
      { path: ROUTES.tripCreate, element: wrap(<TripCreate />) },
      { path: ROUTES.tripDetail(), element: wrap(<TripDetail />) },
    ],
  },

  { path: "*", element: <Navigate to={ROUTES.home} replace /> },
]);
