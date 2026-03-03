/**
 * Phase 3 — S-07 / BR-U11: Transfer engine with immediate source deduction.
 * 
 * When a transfer is approved/dispatched:
 * 1. Source warehouse stock is IMMEDIATELY deducted
 * 2. An "In_Transit" record is created
 * 3. Destination only receives stock upon confirmation
 * 4. Variance on receipt creates auto-adjustment
 */

import { toBaseUnits } from "./unitConversion";
import type { ProductUnitConversion } from "./unitConversion";

export interface TransferRequest {
  productId: string;
  qty: number;
  unitFactor: number;
  fromWarehouseId: string;
  toWarehouseId: string;
}

export interface TransferValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sourceBaseQty: number;
  availableBaseQty: number;
}

/**
 * Validate a transfer request before execution.
 * EC-09: Prevents negative stock at source during transit.
 */
export function validateTransfer(
  request: TransferRequest,
  sourceStock: number,
  stockFactor: number = 1
): TransferValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const baseQtyNeeded = toBaseUnits(request.qty, request.unitFactor);
  const stockUnitsNeeded = baseQtyNeeded / stockFactor;
  const availableBase = sourceStock * stockFactor;

  if (stockUnitsNeeded > sourceStock) {
    errors.push(
      `Stock insuffisant: ${sourceStock} disponible, ${Math.ceil(stockUnitsNeeded)} demandé`
    );
  }

  if (request.fromWarehouseId === request.toWarehouseId) {
    warnings.push("Transfert interne au même entrepôt — utilisez un mouvement de stock à la place");
  }

  if (stockUnitsNeeded > sourceStock * 0.5) {
    warnings.push(`Ce transfert représente ${((stockUnitsNeeded / sourceStock) * 100).toFixed(0)}% du stock source`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sourceBaseQty: baseQtyNeeded,
    availableBaseQty: availableBase,
  };
}

/**
 * Calculate receipt variance and determine if auto-adjustment is needed.
 */
export function calculateReceiptVariance(
  shippedQty: number,
  receivedQty: number,
  unitFactor: number = 1
): {
  variance: number;
  variancePct: number;
  requiresAdjustment: boolean;
  adjustmentQty: number;
} {
  const shippedBase = toBaseUnits(shippedQty, unitFactor);
  const receivedBase = toBaseUnits(receivedQty, unitFactor);
  const variance = receivedBase - shippedBase;
  const variancePct = shippedBase > 0 ? (variance / shippedBase) * 100 : 0;

  return {
    variance,
    variancePct,
    requiresAdjustment: Math.abs(variance) > 0,
    adjustmentQty: Math.abs(variance),
  };
}

/**
 * Phase 1 — E-05: Optimistic locking for concurrent inventory edits.
 * Compare version before applying update.
 */
export function checkOptimisticLock(
  currentVersion: number,
  expectedVersion: number
): { locked: boolean; error?: string } {
  if (currentVersion !== expectedVersion) {
    return {
      locked: true,
      error: `Conflit de version: vous travaillez sur la version ${expectedVersion}, mais la version actuelle est ${currentVersion}. Rafraîchissez et réessayez.`,
    };
  }
  return { locked: false };
}
