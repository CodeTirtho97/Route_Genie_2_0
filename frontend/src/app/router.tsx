import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import { AuthGuard } from "../components/features/auth/AuthGuard";
import { ROUTES } from "../constants/routes";

const Login    = lazy(() => import("../pages/Auth/Login"));
const Signup   = lazy(() => import("../pages/Auth/Signup"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
    <CircularProgress sx={{ color: "#F59E0B" }} />
  </Box>
);

const wrap = (el: React.ReactNode) => <Suspense fallback={<Loader />}>{el}</Suspense>;

export const router = createBrowserRouter([
  { path: ROUTES.login,  element: wrap(<Login />) },
  { path: ROUTES.signup, element: wrap(<Signup />) },
  {
    path: ROUTES.dashboard,
    element: <AuthGuard>{wrap(<Dashboard />)}</AuthGuard>,
  },
  { path: "/", element: <Navigate to={ROUTES.dashboard} replace /> },
  { path: "*", element: <Navigate to={ROUTES.dashboard} replace /> },
]);
