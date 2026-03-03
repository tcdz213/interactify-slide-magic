import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/rbac";

export default function FinancialRoute() {
  const { currentUser } = useAuth();
  if (!currentUser || !canViewFinancials(currentUser)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
