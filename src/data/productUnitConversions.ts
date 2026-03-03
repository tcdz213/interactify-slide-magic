/**
 * Product-specific unit conversion table.
 * Phase 0 — F-02/F-03/F-04/F-06/F-07 applied.
 * 
 * Each product defines its base unit + packaging hierarchy.
 * Stock is always stored in base unit.
 * productBaseUnits[] ELIMINATED (F-06) — base unit = entry with conversionFactor === 1.
 */
import type { ProductUnitConversion, ProductDimensions, WarehouseProduct } from "@/lib/unitConversion";

export const productUnitConversions: ProductUnitConversion[] = [
  // ── Ciment CPJ 42.5 (P001) — base unit: kg ──
  { id: "PUC-001", productId: "P001", unitName: "Kilogramme", unitAbbreviation: "kg", conversionFactor: 1, allowBuy: true, allowSell: true, sortOrder: 1, isInteger: false, usedInTransactions: true, lockedAt: "2025-12-05", decimalPlaces: 2, roundingMode: "round" },
  { id: "PUC-002", productId: "P001", unitName: "Sac (50kg)", unitAbbreviation: "Sac", conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2025-12-05", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-003", productId: "P001", unitName: "Palette (40 sacs)", unitAbbreviation: "Pal", conversionFactor: 2000, allowBuy: true, allowSell: true, sortOrder: 3, isInteger: true, usedInTransactions: true, lockedAt: "2025-12-05", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-004", productId: "P001", unitName: "Tonne", unitAbbreviation: "T", conversionFactor: 1000, allowBuy: true, allowSell: false, sortOrder: 4, isInteger: false, decimalPlaces: 3, roundingMode: "round" },

  // ── Farine T55 (P009) — base unit: kg ──
  { id: "PUC-010", productId: "P009", unitName: "Kilogramme", unitAbbreviation: "kg", conversionFactor: 1, allowBuy: true, allowSell: true, sortOrder: 1, isInteger: false, usedInTransactions: true, lockedAt: "2025-12-08", decimalPlaces: 2, roundingMode: "round" },
  { id: "PUC-011", productId: "P009", unitName: "Sac (50kg)", unitAbbreviation: "Sac", conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2025-12-08", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-012", productId: "P009", unitName: "Tonne", unitAbbreviation: "T", conversionFactor: 1000, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: false, decimalPlaces: 3, roundingMode: "round" },

  // ── Huile de tournesol 5L (P010) — base unit: Litre ──
  { id: "PUC-020", productId: "P010", unitName: "Litre", unitAbbreviation: "L", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: false, usedInTransactions: true, lockedAt: "2025-12-08", decimalPlaces: 2, roundingMode: "round" },
  { id: "PUC-021", productId: "P010", unitName: "Bidon (5L)", unitAbbreviation: "Bid", conversionFactor: 5, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2025-12-08", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-022", productId: "P010", unitName: "Carton (4 bidons)", unitAbbreviation: "Ctn", conversionFactor: 20, allowBuy: true, allowSell: true, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Tomate concentrée (P011) — base unit: Boîte ──
  { id: "PUC-030", productId: "P011", unitName: "Boîte", unitAbbreviation: "Bte", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, usedInTransactions: true, lockedAt: "2026-01-12", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-031", productId: "P011", unitName: "Carton (24)", unitAbbreviation: "Ctn", conversionFactor: 24, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2026-01-12", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-032", productId: "P011", unitName: "Palette (60 cartons)", unitAbbreviation: "Pal", conversionFactor: 1440, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Pâtes alimentaires (P014) — base unit: Paquet (500g) ──
  { id: "PUC-040", productId: "P014", unitName: "Paquet (500g)", unitAbbreviation: "Pqt", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, usedInTransactions: true, lockedAt: "2026-01-12", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-041", productId: "P014", unitName: "Carton (20)", unitAbbreviation: "Ctn", conversionFactor: 20, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2026-01-12", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-042", productId: "P014", unitName: "Palette (50 cartons)", unitAbbreviation: "Pal", conversionFactor: 1000, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Lait UHT 1L (P013) — base unit: Brique ──
  { id: "PUC-050", productId: "P013", unitName: "Brique (1L)", unitAbbreviation: "Brq", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, usedInTransactions: true, lockedAt: "2026-02-20", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-051", productId: "P013", unitName: "Carton (12)", unitAbbreviation: "Ctn", conversionFactor: 12, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2026-02-20", decimalPlaces: 0, roundingMode: "round" },

  // ── Sucre blanc 1kg (P012) — base unit: kg ──
  { id: "PUC-060", productId: "P012", unitName: "Kilogramme", unitAbbreviation: "kg", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: false, usedInTransactions: true, lockedAt: "2026-02-20", decimalPlaces: 2, roundingMode: "round" },
  { id: "PUC-061", productId: "P012", unitName: "Sac (50kg)", unitAbbreviation: "Sac", conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, usedInTransactions: true, lockedAt: "2026-02-20", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-062", productId: "P012", unitName: "Tonne", unitAbbreviation: "T", conversionFactor: 1000, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: false, decimalPlaces: 3, roundingMode: "round" },

  // ── Sardines conserve (P016) — base unit: Boîte ──
  { id: "PUC-070", productId: "P016", unitName: "Boîte", unitAbbreviation: "Bte", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-071", productId: "P016", unitName: "Carton (48)", unitAbbreviation: "Ctn", conversionFactor: 48, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Laptop HP (P017) — base unit: Pièce ──
  { id: "PUC-080", productId: "P017", unitName: "Pièce", unitAbbreviation: "Pce", conversionFactor: 1, allowBuy: true, allowSell: true, sortOrder: 1, isInteger: true, usedInTransactions: true, lockedAt: "2025-12-15", decimalPlaces: 0, roundingMode: "round" },

  // ── Fer à béton (P002) — base unit: Barre ──
  // F-07: Fixed Tonne factor from 83 → 93.84
  { id: "PUC-090", productId: "P002", unitName: "Barre (12m)", unitAbbreviation: "Bar", conversionFactor: 1, allowBuy: true, allowSell: true, sortOrder: 1, isInteger: true, usedInTransactions: true, lockedAt: "2026-01-15", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-091", productId: "P002", unitName: "Lot (10 barres)", unitAbbreviation: "Lot", conversionFactor: 10, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-092", productId: "P002", unitName: "Tonne (~94 barres)", unitAbbreviation: "T", conversionFactor: 93.84, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: false, decimalPlaces: 2, roundingMode: "round" },

  // ── Carrelage 40×40 (P003) — base unit: Pièce ──
  { id: "PUC-100", productId: "P003", unitName: "Pièce", unitAbbreviation: "Pce", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, usedInTransactions: true, lockedAt: "2026-02-18", decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-101", productId: "P003", unitName: "Carton (5 pièces)", unitAbbreviation: "Ctn", conversionFactor: 5, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-102", productId: "P003", unitName: "Palette (80 cartons)", unitAbbreviation: "Pal", conversionFactor: 400, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Carrelage 50×50 (P051) — base unit: Pièce ──
  { id: "PUC-110", productId: "P051", unitName: "Pièce", unitAbbreviation: "Pce", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-111", productId: "P051", unitName: "Carton (4 pièces)", unitAbbreviation: "Ctn", conversionFactor: 4, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-112", productId: "P051", unitName: "Palette (60 cartons)", unitAbbreviation: "Pal", conversionFactor: 240, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Carrelage 35×35 (P052) — base unit: Pièce ──
  { id: "PUC-120", productId: "P052", unitName: "Pièce", unitAbbreviation: "Pce", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-121", productId: "P052", unitName: "Carton (8 pièces)", unitAbbreviation: "Ctn", conversionFactor: 8, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-122", productId: "P052", unitName: "Palette (50 cartons)", unitAbbreviation: "Pal", conversionFactor: 400, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },

  // ── Carrelage 60×60 (P053) — base unit: Pièce ──
  { id: "PUC-130", productId: "P053", unitName: "Pièce", unitAbbreviation: "Pce", conversionFactor: 1, allowBuy: false, allowSell: true, sortOrder: 1, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-131", productId: "P053", unitName: "Carton (3 pièces)", unitAbbreviation: "Ctn", conversionFactor: 3, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
  { id: "PUC-132", productId: "P053", unitName: "Palette (48 cartons)", unitAbbreviation: "Pal", conversionFactor: 144, allowBuy: true, allowSell: false, sortOrder: 3, isInteger: true, decimalPlaces: 0, roundingMode: "round" },
];

/**
 * F-06: productBaseUnits ELIMINATED.
 * Base unit is now derived from productUnitConversions (entry with conversionFactor === 1).
 * This helper provides backward compatibility.
 */
export function getBaseUnitForProduct(productId: string): { unitName: string; unitAbbreviation: string } | null {
  const baseEntry = productUnitConversions.find(c => c.productId === productId && c.conversionFactor === 1);
  if (baseEntry) return { unitName: baseEntry.unitName, unitAbbreviation: baseEntry.unitAbbreviation };
  return null;
}

/**
 * @deprecated Use getBaseUnitForProduct() instead.
 * Kept for backward compatibility during migration.
 */
export interface ProductBaseUnit {
  productId: string;
  baseUnitName: string;
  baseUnitAbbreviation: string;
}

/** @deprecated Derived from productUnitConversions — do not use directly */
export const productBaseUnits: ProductBaseUnit[] = productUnitConversions
  .filter(c => c.conversionFactor === 1)
  .map(c => ({ productId: c.productId, baseUnitName: c.unitName, baseUnitAbbreviation: c.unitAbbreviation }));

/**
 * Dimensional metadata for area-based products (tiles, panels, fabric, etc.)
 */
export const productDimensions: ProductDimensions[] = [
  { productId: "P003", widthCm: 40, heightCm: 40, allowPartialCarton: true },
  { productId: "P051", widthCm: 50, heightCm: 50, allowPartialCarton: false },
  { productId: "P052", widthCm: 35, heightCm: 35, allowPartialCarton: true },
  { productId: "P053", widthCm: 60, heightCm: 60, allowPartialCarton: false },
];

/**
 * F-08: Per-warehouse reorder points.
 * Overrides product.reorderPoint for specific warehouse-product pairs.
 */
export const warehouseProducts: WarehouseProduct[] = [
  // Ciment — higher reorder in Alger (main hub)
  { warehouseId: "wh-alger-construction", productId: "P001", reorderPoint: 600, maxStock: 8000 },
  // Fer à béton — seasonal demand
  { warehouseId: "wh-alger-construction", productId: "P002", reorderPoint: 300, maxStock: 3000 },
  // Huile — high turnover Oran
  { warehouseId: "wh-oran-food", productId: "P010", reorderPoint: 600, maxStock: 5000 },
  // Farine — bakery demand
  { warehouseId: "wh-oran-food", productId: "P009", reorderPoint: 500, maxStock: 3000 },
  // Laptops — tech hub Constantine
  { warehouseId: "wh-constantine-tech", productId: "P017", reorderPoint: 40, maxStock: 100 },
];
