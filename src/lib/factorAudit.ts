/**
 * Phase 3 — S-06 / BR-U15: Audit trail for all conversion factor changes.
 * Logs every create, update, delete, lock operation on ProductUnitConversion entries.
 */

import { logAudit } from "@/services/auditService";
import type { ProductUnitConversion } from "./unitConversion";

export type FactorAction = "FACTOR_CREATED" | "FACTOR_UPDATED" | "FACTOR_DELETED" | "FACTOR_LOCKED" | "FACTOR_VERSION_CREATED" | "BASE_UNIT_CHANGED" | "DIMENSIONS_UPDATED";

export function logFactorChange(
  action: FactorAction,
  conv: Partial<ProductUnitConversion> & { productId: string },
  performedBy: string,
  details?: string,
  diff?: Array<{ field: string; oldValue: string; newValue: string }>
) {
  return logAudit({
    action,
    module: "UnitConversion",
    entityId: conv.id ?? conv.productId,
    performedBy,
    details: details ?? `${action}: ${conv.unitName ?? ""} (${conv.unitAbbreviation ?? ""}) — facteur=${conv.conversionFactor ?? "N/A"}`,
    diff,
  });
}

/**
 * Log dimension changes for area-based products.
 */
export function logDimensionChange(
  productId: string,
  performedBy: string,
  oldDims: { widthCm: number; heightCm: number } | null,
  newDims: { widthCm: number; heightCm: number }
) {
  const diff = oldDims
    ? [
        { field: "widthCm", oldValue: String(oldDims.widthCm), newValue: String(newDims.widthCm) },
        { field: "heightCm", oldValue: String(oldDims.heightCm), newValue: String(newDims.heightCm) },
      ]
    : [];

  return logAudit({
    action: "DIMENSIONS_UPDATED",
    module: "UnitConversion",
    entityId: productId,
    performedBy,
    details: `Dimensions: ${oldDims ? `${oldDims.widthCm}×${oldDims.heightCm}` : "N/A"} → ${newDims.widthCm}×${newDims.heightCm} cm`,
    diff,
  });
}

/**
 * Phase 3 — S-05 / BR-U14: Variance tolerance configuration.
 * Default 5%, configurable per product category.
 */
export interface VarianceToleranceConfig {
  defaultPct: number;
  categoryOverrides: Record<string, number>;
}

const DEFAULT_VARIANCE_CONFIG: VarianceToleranceConfig = {
  defaultPct: 5,
  categoryOverrides: {
    "Agrégats": 3,        // Bulk materials — tighter tolerance
    "Ciment & Liants": 2, // High-value — tight tolerance
    "Conserves": 1,       // Count-based — very tight
    "Revêtement": 5,      // Tiles — standard
  },
};

export function getVarianceTolerance(category?: string): number {
  if (category && DEFAULT_VARIANCE_CONFIG.categoryOverrides[category]) {
    return DEFAULT_VARIANCE_CONFIG.categoryOverrides[category];
  }
  return DEFAULT_VARIANCE_CONFIG.defaultPct;
}

/**
 * Phase 3 — S-04 / BR-U7: Validate unique abbreviation per product.
 */
export function validateUniqueAbbreviation(
  conversions: ProductUnitConversion[],
  productId: string,
  abbreviation: string,
  excludeId?: string
): { valid: boolean; error?: string } {
  const duplicate = conversions.find(
    c => c.productId === productId &&
      c.unitAbbreviation.toLowerCase() === abbreviation.toLowerCase() &&
      c.id !== excludeId
  );
  if (duplicate) {
    return {
      valid: false,
      error: `L'abréviation "${abbreviation}" existe déjà pour ce produit (${duplicate.unitName})`,
    };
  }
  return { valid: true };
}
