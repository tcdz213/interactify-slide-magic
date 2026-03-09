/**
 * Phase 5 — Auth context with full enterprise RBAC + Governance layer.
 * 
 * 3-Layer Permission Model:
 *   Layer 1 — Role Permissions: What actions a user type can do
 *   Layer 2 — Operational Scope: On which warehouses (via useWarehouseScope)
 *   Layer 3 — Governance: System-level capabilities (independent axis)
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { users } from "@/data/mockData";
import type { User, GovernancePermission } from "@/data/mockData";
import {
  canAccessWarehouse,
  canApproveDocument,
  canCreateDocument,
  getAccessibleWarehouses,
  hasGovernancePermission,
  isSystemAdmin as isSystemAdminCheck,
  type DocumentType,
} from "@/lib/rbac";

const STORAGE_KEY = "flow-food-user-id";

interface AuthContextValue {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  // Layer 1 — RBAC helpers
  canAccessWarehouse: (warehouseId: string) => boolean;
  canApprove: (docType: DocumentType, variancePct?: number | null, warehouseId?: string) => boolean;
  canCreate: (docType: DocumentType, warehouseId?: string) => boolean;
  /** null = unrestricted (all warehouses), string[] = specific warehouses */
  accessibleWarehouseIds: string[] | null;
  isFullAccess: boolean;
  // Layer 3 — Governance helpers
  isSystemAdmin: boolean;
  hasGovernance: (permission: GovernancePermission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) return null;
      return users.find((u) => u.id === id) ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) localStorage.setItem(STORAGE_KEY, currentUser.id);
    else localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  const login = useCallback((userId: string) => {
    const u = users.find((x) => x.id === userId) ?? null;
    setCurrentUser(u);
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  // Layer 1 — RBAC helpers
  const canAccessWarehouseHelper = useCallback(
    (warehouseId: string) => (currentUser ? canAccessWarehouse(currentUser, warehouseId) : false),
    [currentUser],
  );

  const canApproveHelper = useCallback(
    (docType: DocumentType, variancePct: number | null = null, warehouseId?: string) =>
      currentUser ? canApproveDocument(currentUser, docType, variancePct, warehouseId).allowed : false,
    [currentUser],
  );

  const canCreateHelper = useCallback(
    (docType: DocumentType, warehouseId?: string) =>
      currentUser ? canCreateDocument(currentUser, docType, warehouseId) : false,
    [currentUser],
  );

  const accessibleWarehouseIds = currentUser ? getAccessibleWarehouses(currentUser) : null;
  const isFullAccess = currentUser?.assignedWarehouseIds === "all";

  // Layer 3 — Governance helpers
  const isSystemAdminValue = currentUser ? isSystemAdminCheck(currentUser) : false;

  const hasGovernanceHelper = useCallback(
    (permission: GovernancePermission) =>
      currentUser ? hasGovernancePermission(currentUser, permission) : false,
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        canAccessWarehouse: canAccessWarehouseHelper,
        canApprove: canApproveHelper,
        canCreate: canCreateHelper,
        accessibleWarehouseIds,
        isFullAccess,
        isSystemAdmin: isSystemAdminValue,
        hasGovernance: hasGovernanceHelper,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
