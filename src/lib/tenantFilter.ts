import { useAuthOptional } from "@/contexts/AuthContext";

export function filterByTenant<T extends Record<string, any>>(
  items: T[], 
  tenantId: string | null | undefined
): T[] {
  if (!tenantId || tenantId === "T-OWN-01") return items; // Platform owner sees all, or no context
  
  return items.filter(item => {
    // If an item doesn't have a tenantId yet (migration phase), we assume it belongs to T-ENT-01 (Jawda / Bennet Eddar)
    const itemTenant = item.tenantId || "T-ENT-01";
    return itemTenant === tenantId;
  });
}

/**
 * Returns the current tenant ID based on the authenticated user.
 */
export function useCurrentTenantId(): string | null {
  const auth = useAuthOptional();
  return auth?.currentUser?.tenantId || null;
}
