/**
 * useWarehouseScope — Centralized warehouse operational isolation hook.
 *
 * Provides:
 * - `operationalWarehouseIds`: warehouses the user can CREATE/MODIFY/APPROVE in
 * - `visibleWarehouseIds`: warehouses the user can SEE (null = all)
 * - `canOperateOn(whId)`: can the user perform CRUD on this warehouse?
 * - `canSeeWarehouse(whId)`: can the user view data from this warehouse?
 * - `operationalWarehouses`: full Warehouse objects for the user's scope
 * - `defaultWarehouseId`: first operational warehouse (for form defaults)
 * - `filterByWarehouse(items, getWhId)`: filters a list to operational scope
 * - `filterByVisibility(items, getWhId)`: filters a list to visibility scope
 *
 * Rules:
 * - Full-access users (CEO, Finance, BI, etc.) can SEE everything but can only
 *   OPERATE if their role allows it (CEO/OpsDirector can operate everywhere,
 *   BI/Finance are read-only on operations).
 * - Restricted users (WarehouseManager, Operator, etc.) operate ONLY on assigned warehouses.
 */

import { useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { Warehouse } from "@/data/mockData";

/** Roles that have operational authority across ALL warehouses */
const FULL_OPERATIONAL_ROLES = new Set(["CEO", "OpsDirector", "RegionalManager"]);

/** Roles that are read-only regardless of warehouse access */
const READ_ONLY_ROLES = new Set(["BIAnalyst", "FinanceDirector", "Accountant"]);

export function useWarehouseScope() {
  const { currentUser, accessibleWarehouseIds, isFullAccess } = useAuth();
  const { warehouses } = useWMSData();

  const role = currentUser?.role;

  /** Can this user operate (CRUD/approve) on ANY warehouse? */
  const isOperationalRole = role ? !READ_ONLY_ROLES.has(role) : false;

  /**
   * Operational warehouse IDs — warehouses where user can create/modify/approve.
   * null = unrestricted (can operate on all warehouses)
   */
  const operationalWarehouseIds = useMemo<string[] | null>(() => {
    if (!currentUser || !isOperationalRole) return []; // read-only: no operational scope
    if (isFullAccess && FULL_OPERATIONAL_ROLES.has(currentUser.role)) return null; // unrestricted
    if (isFullAccess) return []; // full visibility but read-only operations (e.g. Accountant)
    return accessibleWarehouseIds ?? [];
  }, [currentUser, isFullAccess, accessibleWarehouseIds, isOperationalRole]);

  /** Can the user perform CRUD on a specific warehouse? */
  const canOperateOn = useCallback(
    (warehouseId: string): boolean => {
      if (!isOperationalRole) return false;
      if (operationalWarehouseIds === null) return true; // unrestricted
      return operationalWarehouseIds.includes(warehouseId);
    },
    [operationalWarehouseIds, isOperationalRole],
  );

  /** Can the user see data from a specific warehouse? (visibility scope) */
  const canSeeWarehouse = useCallback(
    (warehouseId: string): boolean => {
      if (!currentUser) return false;
      if (isFullAccess) return true;
      return accessibleWarehouseIds?.includes(warehouseId) ?? false;
    },
    [currentUser, isFullAccess, accessibleWarehouseIds],
  );

  /** Warehouse objects the user can operate on */
  const operationalWarehouses = useMemo<Warehouse[]>(() => {
    if (operationalWarehouseIds === null) return warehouses;
    return warehouses.filter((w) => operationalWarehouseIds.includes(w.id));
  }, [warehouses, operationalWarehouseIds]);

  /** Default warehouse ID for forms */
  const defaultWarehouseId = useMemo<string>(() => {
    if (operationalWarehouseIds === null) return warehouses[0]?.id ?? "WH01";
    return operationalWarehouseIds[0] ?? warehouses[0]?.id ?? "WH01";
  }, [operationalWarehouseIds, warehouses]);

  /** Filter items to user's OPERATIONAL scope */
  const filterByOperationalScope = useCallback(
    <T>(items: T[], getWarehouseId: (item: T) => string): T[] => {
      if (operationalWarehouseIds === null) return items; // unrestricted
      return items.filter((item) => operationalWarehouseIds.includes(getWarehouseId(item)));
    },
    [operationalWarehouseIds],
  );

  /** Filter items to user's VISIBILITY scope (what they can see) */
  const filterByVisibility = useCallback(
    <T>(items: T[], getWarehouseId: (item: T) => string): T[] => {
      if (isFullAccess) return items;
      if (!accessibleWarehouseIds) return items;
      return items.filter((item) => accessibleWarehouseIds.includes(getWarehouseId(item)));
    },
    [isFullAccess, accessibleWarehouseIds],
  );

  /**
   * Transfer-specific authority checks.
   * - Create/dispatch: requires operational authority on SOURCE warehouse
   * - Receive: requires operational authority on DESTINATION warehouse
   */
  const canCreateTransferFrom = useCallback(
    (sourceWarehouseId: string) => canOperateOn(sourceWarehouseId),
    [canOperateOn],
  );

  const canDispatchTransfer = useCallback(
    (sourceWarehouseId: string) => canOperateOn(sourceWarehouseId),
    [canOperateOn],
  );

  const canReceiveTransfer = useCallback(
    (destinationWarehouseId: string) => canOperateOn(destinationWarehouseId),
    [canOperateOn],
  );

  return {
    operationalWarehouseIds,
    operationalWarehouses,
    defaultWarehouseId,
    canOperateOn,
    canSeeWarehouse,
    isOperationalRole,
    filterByOperationalScope,
    filterByVisibility,
    // Transfer-specific
    canCreateTransferFrom,
    canDispatchTransfer,
    canReceiveTransfer,
  };
}
