import { useAuth } from "@/contexts/AuthContext";
import type { GovernancePermission } from "@/data/userData";
import type { ReactNode } from "react";

/** Custom permission keys mapped to allowed roles */
const CUSTOM_PERMISSION_ROLES: Record<string, string[]> = {
  view_financials: ["CEO", "FinanceDirector", "OpsDirector", "Accountant"],
  manage_products: ["CEO", "OpsDirector", "WarehouseManager"],
};

interface RBACGuardProps {
  /** Governance permission required, OR a custom permission string */
  permission: GovernancePermission | keyof typeof CUSTOM_PERMISSION_ROLES;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user permissions.
 * Custom permissions (view_financials, manage_products) are role-based.
 * Governance permissions use the governance layer.
 */
export function RBACGuard({ permission, children, fallback = null }: RBACGuardProps) {
  const { currentUser, hasGovernance } = useAuth();

  if (!currentUser) return <>{fallback}</>;

  // Check custom role-based permissions
  if (permission in CUSTOM_PERMISSION_ROLES) {
    const allowedRoles = CUSTOM_PERMISSION_ROLES[permission];
    if (!allowedRoles.includes(currentUser.role)) return <>{fallback}</>;
    return <>{children}</>;
  }

  if (!hasGovernance(permission as GovernancePermission)) return <>{fallback}</>;
  return <>{children}</>;
}
