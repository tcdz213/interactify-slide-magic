import { Navigate, Outlet } from "react-router-dom";

/**
 * Protects mobile routes — requires PIN auth stored in localStorage.
 * Redirects to /mobile/login if not authenticated.
 */
export default function MobileAuthGuard() {
  const auth = localStorage.getItem("mobile_auth");
  if (!auth) return <Navigate to="/mobile/login" replace />;
  return <Outlet />;
}
