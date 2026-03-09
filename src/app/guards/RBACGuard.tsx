import { useAuth } from "@/contexts/AuthContext";
import type { GovernancePermission } from "@/data/userData";
import type { ReactNode } from "react";

/** Custom permission keys mapped to allowed roles */
const CUSTOM_PERMISSION_ROLES: Record<string, string[]> = {
  view_financials: ["PlatformOwner", "CEO", "FinanceDirector", "OpsDirector", "Accountant"],
  manage_products: ["PlatformOwner", "CEO", "OpsDirector", "WarehouseManager"],
  manage_suppliers: ["PlatformOwner", "CEO", "OpsDirector"],
  platform_settings: ["PlatformOwner"],
};

interface RBACGuardProps {
  permission: GovernancePermission | keyof typeof CUSTOM_PERMISSION_ROLES;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RBACGuard({ permission, children, fallback = null }: RBACGuardProps) {
  const { currentUser, hasGovernance } = useAuth();

  if (!currentUser) return <>{fallback}</>;

  if (permission in CUSTOM_PERMISSION_ROLES) {
    const allowedRoles = CUSTOM_PERMISSION_ROLES[permission];
    if (!allowedRoles.includes(currentUser.role)) return <>{fallback}</>;
    return <>{children}</>;
  }

  if (!hasGovernance(permission as GovernancePermission)) return <>{fallback}</>;
  return <>{children}</>;
}
