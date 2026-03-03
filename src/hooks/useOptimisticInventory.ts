/**
 * Phase 2 — Optimistic Locking Hook for Inventory Updates.
 * Wraps WMSDataContext inventory mutations with version checking.
 */

import { useCallback } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { toast } from "@/hooks/use-toast";
import type { InventoryUpdateError, ConflictError, NegativeStockError } from "@/lib/optimisticLock";
import { formatConflictMessage, formatNegativeStockMessage } from "@/lib/optimisticLock";

export interface InventoryDelta {
  productId: string;
  warehouseId: string;
  delta: number;          // positive = inbound, negative = outbound
  expectedVersion: number;
  updatedBy?: string;
}

export interface InventoryUpdateResult {
  success: boolean;
  error?: InventoryUpdateError;
  newVersion?: number;
  newQty?: number;
}

/**
 * Hook providing version-checked inventory mutations.
 */
export function useOptimisticInventory() {
  const { inventory, setInventory } = useWMSData();

  /**
   * Update a single inventory row with optimistic locking.
   */
  const updateWithLock = useCallback((delta: InventoryDelta): InventoryUpdateResult => {
    const row = inventory.find(
      r => r.productId === delta.productId && r.warehouseId === delta.warehouseId
    );

    if (!row) {
      return {
        success: false,
        error: {
          code: "NEGATIVE_STOCK",
          productId: delta.productId,
          currentQty: 0,
          requestedDelta: delta.delta,
          resultingQty: delta.delta,
        } as NegativeStockError,
      };
    }

    // Version check
    if (row.version !== delta.expectedVersion) {
      const conflict: ConflictError = {
        code: "VERSION_CONFLICT",
        expectedVersion: delta.expectedVersion,
        currentVersion: row.version,
        currentQty: row.qtyOnHand,
        modifiedAt: row.updatedAt,
      };
      toast({
        title: "⚠️ Conflit de version",
        description: formatConflictMessage(conflict),
        variant: "destructive",
      });
      return { success: false, error: conflict };
    }

    // Negative stock check
    const newQty = row.qtyOnHand + delta.delta;
    if (newQty < 0) {
      const negError: NegativeStockError = {
        code: "NEGATIVE_STOCK",
        productId: delta.productId,
        currentQty: row.qtyOnHand,
        requestedDelta: delta.delta,
        resultingQty: newQty,
      };
      toast({
        title: "⛔ Stock insuffisant",
        description: formatNegativeStockMessage(negError),
        variant: "destructive",
      });
      return { success: false, error: negError };
    }

    // Apply update
    const newVersion = row.version + 1;
    setInventory(prev =>
      prev.map(r =>
        r.productId === delta.productId && r.warehouseId === delta.warehouseId
          ? {
              ...r,
              qtyOnHand: newQty,
              qtyAvailable: r.qtyAvailable + delta.delta,
              version: newVersion,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    return { success: true, newVersion, newQty };
  }, [inventory, setInventory]);

  /**
   * Batch update multiple inventory rows atomically.
   * If any fails, none are applied.
   */
  const batchUpdateWithLock = useCallback((deltas: InventoryDelta[]): InventoryUpdateResult => {
    // Pre-validate all
    for (const delta of deltas) {
      const row = inventory.find(
        r => r.productId === delta.productId && r.warehouseId === delta.warehouseId
      );
      if (!row) {
        return { success: false, error: { code: "NEGATIVE_STOCK", productId: delta.productId, currentQty: 0, requestedDelta: delta.delta, resultingQty: delta.delta } as NegativeStockError };
      }
      if (row.version !== delta.expectedVersion) {
        return { success: false, error: { code: "VERSION_CONFLICT", expectedVersion: delta.expectedVersion, currentVersion: row.version, currentQty: row.qtyOnHand } as ConflictError };
      }
      if (row.qtyOnHand + delta.delta < 0) {
        return { success: false, error: { code: "NEGATIVE_STOCK", productId: delta.productId, currentQty: row.qtyOnHand, requestedDelta: delta.delta, resultingQty: row.qtyOnHand + delta.delta } as NegativeStockError };
      }
    }

    // Apply all
    setInventory(prev =>
      prev.map(r => {
        const delta = deltas.find(d => d.productId === r.productId && d.warehouseId === r.warehouseId);
        if (!delta) return r;
        return {
          ...r,
          qtyOnHand: r.qtyOnHand + delta.delta,
          qtyAvailable: r.qtyAvailable + delta.delta,
          version: r.version + 1,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return { success: true };
  }, [inventory, setInventory]);

  /**
   * Get the current version of an inventory row.
   */
  const getVersion = useCallback((productId: string, warehouseId: string): number => {
    const row = inventory.find(r => r.productId === productId && r.warehouseId === warehouseId);
    return row?.version ?? 0;
  }, [inventory]);

  return { updateWithLock, batchUpdateWithLock, getVersion, inventory };
}
