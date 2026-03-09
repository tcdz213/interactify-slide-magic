import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_ROLES = ["PlatformOwner", "CEO", "SystemAdmin", "OpsDirector", "FinanceDirector", "RegionalManager"];

export default function AdminRoute() {
  const { currentUser } = useAuth();
  if (!currentUser || !ADMIN_ROLES.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
