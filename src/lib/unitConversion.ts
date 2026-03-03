/**
 * Unit Conversion Engine — ERP-grade multi-level packaging support.
 * 
 * Phase 0 (F-01..F-08) + Phase 1 (E-01..E-05) hardened engine.
 * 
 * Core concepts:
 * - Each product has a BASE UNIT (e.g., kg for Ciment)
 * - All stock is stored internally in the base unit
 * - Product-specific conversion table maps packaging units to base unit
 * - Smart breakdown engine calculates optimal mixed-unit fulfillment
 * - Factor locking prevents edits after first transaction use
 * - Rounding config per unit prevents precision drift
 */

// ── Types ──

export interface ProductUnitConversion {
  id: string;
  productId: string;
  unitName: string;            // e.g., "Sac (50kg)", "Carton (24)"
  unitAbbreviation: string;    // e.g., "Sac", "Ctn"
  conversionFactor: number;    // how many base units = 1 of this unit
  allowBuy: boolean;
  allowSell: boolean;
  sortOrder: number;
  isInteger?: boolean;         // true for physical units (pieces, cartons)
  // Phase 0 — F-02: Locking
  usedInTransactions?: boolean;
  lockedAt?: string;           // ISO date when locked
  // Phase 0 — F-03: Effective dating
  validFrom?: string;          // ISO date
  validTo?: string;            // null = current
  // Phase 0 — F-04: Rounding
  decimalPlaces?: number;      // e.g., 0 for Sac, 2 for kg
  roundingMode?: "ceil" | "floor" | "round";
}

export interface ProductDimensions {
  productId: string;
  widthCm: number;
  heightCm: number;
  allowPartialCarton: boolean;
}

// Phase 0 — F-08: Per-warehouse reorder points
export interface WarehouseProduct {
  warehouseId: string;
  productId: string;
  reorderPoint: number;
  maxStock?: number;
}

// ── Area Calculations ──

export function areaPieceM2(widthCm: number, heightCm: number): number {
  return (widthCm / 100) * (heightCm / 100);
}

export function piecesForArea(
  requestedM2: number,
  widthCm: number,
  heightCm: number,
  allowPartial: boolean
): number {
  const areaPerPiece = areaPieceM2(widthCm, heightCm);
  if (areaPerPiece <= 0) return 0;
  const exact = requestedM2 / areaPerPiece;
  return allowPartial ? Math.ceil(exact) : Math.ceil(exact);
}

export function calculateAreaBreakdown(
  requestedM2: number,
  dimensions: ProductDimensions,
  conversions: ProductUnitConversion[],
  mode: "sell" | "buy" = "sell"
): BreakdownResult & { piecesNeeded: number; areaPerPiece: number; actualM2: number } {
  const areaPerPiece = areaPieceM2(dimensions.widthCm, dimensions.heightCm);
  const piecesNeeded = piecesForArea(requestedM2, dimensions.widthCm, dimensions.heightCm, dimensions.allowPartialCarton);
  
  let basePieces = piecesNeeded;
  if (!dimensions.allowPartialCarton && conversions.length > 0) {
    const cartonConv = conversions
      .filter(c => mode === "sell" ? c.allowSell : c.allowBuy)
      .filter(c => c.conversionFactor > 1)
      .sort((a, b) => a.conversionFactor - b.conversionFactor)[0];
    if (cartonConv) {
      basePieces = Math.ceil(piecesNeeded / cartonConv.conversionFactor) * cartonConv.conversionFactor;
    }
  }

  const breakdown = calculateBreakdown(basePieces, conversions, mode);
  const actualM2 = basePieces * areaPerPiece;

  return { ...breakdown, piecesNeeded, areaPerPiece, actualM2 };
}

export function formatAreaInfo(widthCm: number, heightCm: number): string {
  return `${widthCm}×${heightCm} cm = ${areaPieceM2(widthCm, heightCm).toFixed(4)} m²/pièce`;
}

// ── Breakdown Types ──

export interface BreakdownLine {
  unitName: string;
  unitAbbreviation: string;
  quantity: number;
  baseEquivalent: number;
}

export interface BreakdownResult {
  lines: BreakdownLine[];
  totalBaseUnits: number;
  remainder: number;
}

// ── Phase 1 — E-01: Precision-safe conversion ──

/**
 * Convert a quantity from a given unit to base units.
 * Applies rounding per unit config to prevent floating-point drift.
 */
export function toBaseUnits(
  quantity: number,
  conversionFactor: number,
  decimals: number = 4
): number {
  const raw = quantity * conversionFactor;
  const multiplier = Math.pow(10, decimals);
  return Math.round(raw * multiplier) / multiplier;
}

/**
 * Convert base units to a given unit.
 */
export function fromBaseUnits(
  baseQuantity: number,
  conversionFactor: number,
  decimals: number = 4
): number {
  if (conversionFactor === 0) return 0;
  const raw = baseQuantity / conversionFactor;
  const multiplier = Math.pow(10, decimals);
  return Math.round(raw * multiplier) / multiplier;
}

/**
 * Apply rounding per unit configuration.
 */
export function applyRounding(
  value: number,
  decimalPlaces: number = 4,
  roundingMode: "ceil" | "floor" | "round" = "round"
): number {
  const multiplier = Math.pow(10, decimalPlaces);
  switch (roundingMode) {
    case "ceil": return Math.ceil(value * multiplier) / multiplier;
    case "floor": return Math.floor(value * multiplier) / multiplier;
    default: return Math.round(value * multiplier) / multiplier;
  }
}

// ── Phase 1 — E-02: Factor Locking ──

/**
 * Check if a conversion factor can be edited.
 * Returns { editable: true } or { editable: false, reason: string }
 */
export function canEditFactor(conv: ProductUnitConversion): { editable: boolean; reason?: string } {
  if (conv.conversionFactor === 1) {
    return { editable: false, reason: "L'unité de base ne peut pas être modifiée" };
  }
  if (conv.usedInTransactions) {
    return { editable: false, reason: `Facteur verrouillé depuis le ${conv.lockedAt ?? "N/A"} — utilisé dans des transactions` };
  }
  return { editable: true };
}

/**
 * Mark a conversion as used in transactions (locks it).
 */
export function lockConversionFactor(conv: ProductUnitConversion): ProductUnitConversion {
  return {
    ...conv,
    usedInTransactions: true,
    lockedAt: conv.lockedAt ?? new Date().toISOString().slice(0, 10),
  };
}

// ── Phase 1 — E-03: Effective-dated factor resolution ──

/**
 * Get the active conversion factor for a product unit at a given date.
 * If multiple versions exist, returns the one where validFrom <= date < validTo.
 */
export function resolveConversionAtDate(
  conversions: ProductUnitConversion[],
  unitAbbreviation: string,
  date: Date = new Date()
): ProductUnitConversion | undefined {
  const candidates = conversions
    .filter(c => c.unitAbbreviation === unitAbbreviation)
    .filter(c => {
      if (!c.validFrom) return true; // no dating = always valid
      const from = new Date(c.validFrom);
      if (from > date) return false;
      if (c.validTo) {
        const to = new Date(c.validTo);
        if (date >= to) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Most recent validFrom wins
      const aFrom = a.validFrom ? new Date(a.validFrom).getTime() : 0;
      const bFrom = b.validFrom ? new Date(b.validFrom).getTime() : 0;
      return bFrom - aFrom;
    });
  return candidates[0];
}

// ── Phase 1 — E-04: Integer validation ──

export interface QtyValidationResult {
  valid: boolean;
  error?: string;
  correctedQty?: number;
}

/**
 * Validate quantity against unit constraints (integer, positive, etc.)
 */
export function validateQuantity(
  qty: number,
  unit: Pick<ProductUnitConversion, "unitName" | "isInteger" | "conversionFactor">,
  checkBase: boolean = true
): QtyValidationResult {
  if (qty <= 0) {
    return { valid: false, error: "La quantité doit être positive" };
  }
  if (unit.isInteger && !Number.isInteger(qty)) {
    return {
      valid: false,
      error: `${unit.unitName} doit être un nombre entier`,
      correctedQty: Math.ceil(qty),
    };
  }
  if (checkBase) {
    const baseQty = qty * unit.conversionFactor;
    // Check if base qty is integer when it should be (physical base units)
    if (unit.isInteger && !Number.isInteger(baseQty)) {
      return {
        valid: false,
        error: `${qty} × ${unit.conversionFactor} = ${baseQty} — résultat non entier en unité de base`,
      };
    }
  }
  return { valid: true };
}

// ── Breakdown Engine ──

export function calculateBreakdown(
  requestedBaseQty: number,
  conversions: ProductUnitConversion[],
  mode: "sell" | "buy" = "sell"
): BreakdownResult {
  const available = conversions
    .filter(c => mode === "sell" ? c.allowSell : c.allowBuy)
    .sort((a, b) => b.conversionFactor - a.conversionFactor);

  const lines: BreakdownLine[] = [];
  let remaining = requestedBaseQty;

  for (const conv of available) {
    if (remaining <= 0) break;
    if (conv.conversionFactor > remaining) continue;

    const qty = Math.floor(remaining / conv.conversionFactor);
    if (qty > 0) {
      const baseEquiv = qty * conv.conversionFactor;
      lines.push({
        unitName: conv.unitName,
        unitAbbreviation: conv.unitAbbreviation,
        quantity: qty,
        baseEquivalent: baseEquiv,
      });
      remaining -= baseEquiv;
    }
  }

  if (remaining > 0 && available.length > 0) {
    const smallest = available[available.length - 1];
    if (smallest.conversionFactor <= remaining) {
      const qty = Math.ceil(remaining / smallest.conversionFactor);
      const existing = lines.find(l => l.unitAbbreviation === smallest.unitAbbreviation);
      if (existing) {
        existing.quantity += qty;
        existing.baseEquivalent += qty * smallest.conversionFactor;
      } else {
        lines.push({
          unitName: smallest.unitName,
          unitAbbreviation: smallest.unitAbbreviation,
          quantity: qty,
          baseEquivalent: qty * smallest.conversionFactor,
        });
      }
      remaining -= qty * smallest.conversionFactor;
    }
  }

  return {
    lines,
    totalBaseUnits: requestedBaseQty,
    remainder: Math.max(0, remaining),
  };
}

export function formatBreakdown(result: BreakdownResult): string {
  if (result.lines.length === 0) return "—";
  return result.lines
    .map(l => `${l.quantity} ${l.unitAbbreviation}`)
    .join(" + ");
}

// ── Stock Validation ──

export function validateStockAvailability(
  requestedQty: number,
  unitConversionFactor: number,
  availableBaseStock: number,
  decimals: number = 4
): { sufficient: boolean; requiredBase: number; availableBase: number; deficit: number } {
  const requiredBase = toBaseUnits(requestedQty, unitConversionFactor, decimals);
  const deficit = Math.max(0, requiredBase - availableBaseStock);
  return {
    sufficient: requiredBase <= availableBaseStock,
    requiredBase,
    availableBase: availableBaseStock,
    deficit,
  };
}

// ── Phase 3 — Effective-Date Validation ──

/**
 * Prevent overlapping date ranges for the same unit abbreviation + product.
 */
export function validateDateRange(
  conversions: ProductUnitConversion[],
  newEntry: Pick<ProductUnitConversion, "productId" | "unitAbbreviation" | "validFrom" | "validTo">,
  excludeId?: string
): { valid: boolean; error?: string; overlappingId?: string } {
  const siblings = conversions.filter(c =>
    c.productId === newEntry.productId &&
    c.unitAbbreviation === newEntry.unitAbbreviation &&
    c.id !== excludeId
  );

  for (const existing of siblings) {
    const existingFrom = existing.validFrom ? new Date(existing.validFrom) : new Date(0);
    const existingTo = existing.validTo ? new Date(existing.validTo) : new Date("9999-12-31");
    const newFrom = newEntry.validFrom ? new Date(newEntry.validFrom) : new Date(0);
    const newTo = newEntry.validTo ? new Date(newEntry.validTo) : new Date("9999-12-31");

    if (newFrom < existingTo && existingFrom < newTo) {
      return {
        valid: false,
        error: `Chevauchement avec la version existante (${existing.validFrom ?? "début"} → ${existing.validTo ?? "actuel"})`,
        overlappingId: existing.id,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate packaging change workflow.
 * Checks if a factor can be changed and validates the new version parameters.
 */
export function validatePackagingChange(
  currentConv: ProductUnitConversion,
  newFactor: number,
  effectiveDate: string
): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!currentConv.usedInTransactions) {
    warnings.push("Aucune transaction n'utilise ce facteur — modification directe possible");
    return { valid: true, warnings, errors };
  }

  if (newFactor === currentConv.conversionFactor) {
    errors.push("Le nouveau facteur est identique à l'ancien");
    return { valid: false, warnings, errors };
  }

  if (newFactor <= 0) {
    errors.push("Le facteur doit être strictement positif");
    return { valid: false, warnings, errors };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (effectiveDate < today) {
    errors.push("La date d'effet ne peut pas être dans le passé");
    return { valid: false, warnings, errors };
  }

  const factorChange = Math.abs(newFactor - currentConv.conversionFactor) / currentConv.conversionFactor;
  if (factorChange > 0.5) {
    warnings.push(`Changement de facteur important (${(factorChange * 100).toFixed(0)}%) — vérifiez`);
  }

  return { valid: true, warnings, errors };
}

// ── Phase 3 — S-01: Negative stock prevention ──

/**
 * Pre-check all outbound operations to prevent negative stock.
 * Returns blocking issues if any line would cause negative stock.
 */
export function validateOutboundStock(
  lines: Array<{ productId: string; qty: number; conversionFactor: number }>,
  stockMap: Map<string, number>,
  stockFactorMap: Map<string, number>
): Array<{ productId: string; requested: number; available: number; deficit: number }> {
  const issues: Array<{ productId: string; requested: number; available: number; deficit: number }> = [];
  
  for (const line of lines) {
    const available = stockMap.get(line.productId) ?? 0;
    const stockFactor = stockFactorMap.get(line.productId) ?? 1;
    const stockUnitsNeeded = toBaseUnits(line.qty, line.conversionFactor) / stockFactor;
    
    if (stockUnitsNeeded > available) {
      issues.push({
        productId: line.productId,
        requested: Math.ceil(stockUnitsNeeded),
        available,
        deficit: Math.ceil(stockUnitsNeeded - available),
      });
    }
  }
  
  return issues;
}
