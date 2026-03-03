import { Navigate, Outlet } from "react-router-dom";

/**
 * Protects delivery routes — requires driver PIN auth stored in localStorage.
 */
export default function DeliveryAuthGuard() {
  const auth = localStorage.getItem("delivery_auth");
  if (!auth) return <Navigate to="/delivery/login" replace />;
  return <Outlet />;
}
