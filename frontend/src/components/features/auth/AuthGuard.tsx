import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/auth.store";
import { ROUTES } from "../../../constants/routes";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshToken } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated && !refreshToken) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
