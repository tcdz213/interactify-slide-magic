/**
 * Phase 2 — Optimistic Locking for Inventory Updates.
 * Prevents lost updates when multiple users modify the same inventory row.
 * Uses version column pattern with exponential backoff retry.
 */

// ── Types ──

export interface OptimisticUpdateResult<T> {
  success: boolean;
  data?: T;
  conflict?: {
    expectedVersion: number;
    currentVersion: number;
    currentQty: number;
  };
  retryCount: number;
  error?: string;
}

export interface ConflictError {
  code: "VERSION_CONFLICT";
  expectedVersion: number;
  currentVersion: number;
  currentQty: number;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface NegativeStockError {
  code: "NEGATIVE_STOCK";
  productId: string;
  currentQty: number;
  requestedDelta: number;
  resultingQty: number;
}

export type InventoryUpdateError = ConflictError | NegativeStockError;

// ── In-Memory Optimistic Lock (Mock Phase) ──

export interface InventoryRow {
  productId: string;
  warehouseId: string;
  quantity: number;
  version: number;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Check if an inventory row's version matches the expected version.
 * Returns the conflict details if mismatched.
 */
export function checkOptimisticVersion(
  row: InventoryRow,
  expectedVersion: number
): ConflictError | null {
  if (row.version !== expectedVersion) {
    return {
      code: "VERSION_CONFLICT",
      expectedVersion,
      currentVersion: row.version,
      currentQty: row.quantity,
      modifiedAt: row.updatedAt,
      modifiedBy: row.updatedBy,
    };
  }
  return null;
}

/**
 * Apply a stock delta with optimistic locking and negative stock prevention.
 * Returns the new state or an error.
 */
export function applyStockDelta(
  row: InventoryRow,
  delta: number,
  expectedVersion: number,
  updatedBy?: string
): { success: true; newRow: InventoryRow } | { success: false; error: InventoryUpdateError } {
  // Version check
  const conflict = checkOptimisticVersion(row, expectedVersion);
  if (conflict) {
    return { success: false, error: conflict };
  }

  // Negative stock check
  const newQty = row.quantity + delta;
  if (newQty < 0) {
    return {
      success: false,
      error: {
        code: "NEGATIVE_STOCK",
        productId: row.productId,
        currentQty: row.quantity,
        requestedDelta: delta,
        resultingQty: newQty,
      },
    };
  }

  // Apply update
  return {
    success: true,
    newRow: {
      ...row,
      quantity: newQty,
      version: row.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy,
    },
  };
}

// ── Retry Logic (for future API phase) ──

/**
 * Retry an operation with exponential backoff + jitter.
 * For the mock phase, this provides the pattern for future API integration.
 */
export async function updateWithRetry<T>(
  operation: (version: number) => Promise<T>,
  getVersion: () => Promise<number>,
  maxRetries: number = 3,
  baseDelayMs: number = 200
): Promise<OptimisticUpdateResult<T>> {
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const version = await getVersion();
      const result = await operation(version);
      return { success: true, data: result, retryCount };
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "VERSION_CONFLICT" && retryCount < maxRetries) {
        retryCount++;
        const delay = baseDelayMs * Math.pow(2, retryCount) + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return {
        success: false,
        retryCount,
        error: error.code === "VERSION_CONFLICT"
          ? `Conflit de version après ${retryCount} tentatives`
          : String(err),
      };
    }
  }

  return { success: false, retryCount };
}

// ── Conflict Resolution Helpers ──

/**
 * Format a conflict error into a user-friendly message (French).
 */
export function formatConflictMessage(error: ConflictError): string {
  return `Conflit de modification détecté. Version attendue: v${error.expectedVersion}, version actuelle: v${error.currentVersion}. Stock actuel: ${error.currentQty}. Veuillez rafraîchir et réessayer.`;
}

/**
 * Format a negative stock error into a user-friendly message (French).
 */
export function formatNegativeStockMessage(error: NegativeStockError): string {
  return `Stock insuffisant: ${error.currentQty} disponible, ${Math.abs(error.requestedDelta)} demandé. Résultat: ${error.resultingQty}.`;
}
