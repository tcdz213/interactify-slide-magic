/**
 * PHASE 1 — Master Data Setup Tests
 * Validates: Units, Products, Conversions, Factor Locking, Effective Dating
 */
import { describe, it, expect } from "vitest";
import { productUnitConversions, getBaseUnitForProduct, productDimensions } from "@/data/productUnitConversions";
import {
  toBaseUnits, fromBaseUnits, validateQuantity, canEditFactor,
  lockConversionFactor, resolveConversionAtDate, validateDateRange,
  calculateBreakdown, areaPieceM2, applyRounding,
} from "@/lib/unitConversion";

// ── 1.1 Units of Measurement ──

describe("Phase 1.1 — Units of Measurement", () => {
  it("each product has exactly one base unit (conversionFactor=1)", () => {
    const productIds = [...new Set(productUnitConversions.map(c => c.productId))];
    for (const pid of productIds) {
      const baseUnits = productUnitConversions.filter(c => c.productId === pid && c.conversionFactor === 1);
      expect(baseUnits.length, `Product ${pid} should have exactly 1 base unit`).toBe(1);
    }
  });

  it("unit symbols are unique per product", () => {
    const productIds = [...new Set(productUnitConversions.map(c => c.productId))];
    for (const pid of productIds) {
      const units = productUnitConversions.filter(c => c.productId === pid);
      const abbrs = units.map(u => u.unitAbbreviation);
      expect(new Set(abbrs).size, `Product ${pid} has duplicate unit abbreviations`).toBe(abbrs.length);
    }
  });

  it("conversion factors are positive", () => {
    for (const c of productUnitConversions) {
      expect(c.conversionFactor, `${c.id} factor must be > 0`).toBeGreaterThan(0);
    }
  });

  it("integer-only units reject decimal quantities", () => {
    const sac = productUnitConversions.find(c => c.id === "PUC-002")!; // Sac 50kg, integer
    const result = validateQuantity(1.5, sac);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("entier");
  });

  it("integer-only units accept whole quantities", () => {
    const sac = productUnitConversions.find(c => c.id === "PUC-002")!;
    expect(validateQuantity(100, sac).valid).toBe(true);
  });

  it("non-integer units accept decimals (kg)", () => {
    const kg = productUnitConversions.find(c => c.id === "PUC-001")!; // kg, non-integer
    expect(validateQuantity(12.5, kg).valid).toBe(true);
  });

  it("rejects zero and negative quantities", () => {
    const sac = productUnitConversions.find(c => c.id === "PUC-002")!;
    expect(validateQuantity(0, sac).valid).toBe(false);
    expect(validateQuantity(-5, sac).valid).toBe(false);
  });
});

// ── 1.1 Conversion Accuracy ──

describe("Phase 1.1 — Conversion Accuracy", () => {
  it("100 T = 100,000 Kg for Cement (P001)", () => {
    const tonne = productUnitConversions.find(c => c.id === "PUC-004")!; // T, factor=1000
    expect(toBaseUnits(100, tonne.conversionFactor)).toBe(100_000);
  });

  it("200 Sac = 10,000 Kg for Cement", () => {
    const sac = productUnitConversions.find(c => c.id === "PUC-002")!; // Sac, factor=50
    expect(toBaseUnits(200, sac.conversionFactor)).toBe(10_000);
  });

  it("1 Palette = 2,000 Kg for Cement", () => {
    const pal = productUnitConversions.find(c => c.id === "PUC-003")!; // Pal, factor=2000
    expect(toBaseUnits(1, pal.conversionFactor)).toBe(2_000);
  });

  it("fromBaseUnits reverses correctly", () => {
    const sac = productUnitConversions.find(c => c.id === "PUC-002")!;
    expect(fromBaseUnits(10_000, sac.conversionFactor)).toBe(200);
  });

  it("no circular dependencies: toBase then fromBase = identity", () => {
    const sac = productUnitConversions.find(c => c.id === "PUC-002")!;
    const qty = 42;
    expect(fromBaseUnits(toBaseUnits(qty, sac.conversionFactor), sac.conversionFactor)).toBe(qty);
  });
});

// ── 1.1 Factor Locking ──

describe("Phase 1.1 — Factor Locking (F-02)", () => {
  it("locked conversions cannot be edited", () => {
    const locked = productUnitConversions.find(c => c.usedInTransactions)!;
    expect(canEditFactor(locked).editable).toBe(false);
  });

  it("base unit (factor=1) cannot be edited", () => {
    const base = productUnitConversions.find(c => c.conversionFactor === 1)!;
    expect(canEditFactor(base).editable).toBe(false);
  });

  it("unused conversion can be edited", () => {
    const unlocked = productUnitConversions.find(c => !c.usedInTransactions && c.conversionFactor !== 1);
    if (unlocked) {
      expect(canEditFactor(unlocked).editable).toBe(true);
    }
  });

  it("lockConversionFactor marks as used", () => {
    const conv: any = { id: "test", conversionFactor: 10, usedInTransactions: false };
    const locked = lockConversionFactor(conv);
    expect(locked.usedInTransactions).toBe(true);
    expect(locked.lockedAt).toBeTruthy();
  });
});

// ── 1.1 Effective-Date Ranges ──

describe("Phase 1.1 — Effective Date Ranges (F-03)", () => {
  it("rejects overlapping date ranges for same unit", () => {
    const existing = [
      { id: "v1", productId: "P001", unitAbbreviation: "Sac", validFrom: "2025-01-01", validTo: "2025-06-01" } as any,
      { id: "v2", productId: "P001", unitAbbreviation: "Sac", validFrom: "2025-06-01", validTo: undefined } as any,
    ];
    const result = validateDateRange(existing, {
      productId: "P001", unitAbbreviation: "Sac", validFrom: "2025-04-01", validTo: "2025-08-01",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Chevauchement");
  });

  it("accepts non-overlapping date range", () => {
    const existing = [
      { id: "v1", productId: "P001", unitAbbreviation: "Sac", validFrom: "2025-01-01", validTo: "2025-06-01" } as any,
    ];
    const result = validateDateRange(existing, {
      productId: "P001", unitAbbreviation: "Sac", validFrom: "2025-06-01", validTo: undefined,
    });
    expect(result.valid).toBe(true);
  });

  it("resolves historical date to correct version", () => {
    const versions = [
      { id: "v1", productId: "P001", unitName: "Sac v1", unitAbbreviation: "Sac", conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 1, validFrom: "2025-01-01", validTo: "2025-06-01" },
      { id: "v2", productId: "P001", unitName: "Sac v2", unitAbbreviation: "Sac", conversionFactor: 40, allowBuy: true, allowSell: true, sortOrder: 1, validFrom: "2025-06-01", validTo: undefined },
    ] as any[];
    const feb = resolveConversionAtDate(versions, "Sac", new Date("2025-02-15"));
    expect(feb?.conversionFactor).toBe(50);
    const jul = resolveConversionAtDate(versions, "Sac", new Date("2025-07-15"));
    expect(jul?.conversionFactor).toBe(40);
  });
});

// ── 1.2 Products ──

describe("Phase 1.2 — Products", () => {
  it("getBaseUnitForProduct returns correct base unit", () => {
    const cement = getBaseUnitForProduct("P001");
    expect(cement).toBeTruthy();
    expect(cement!.unitAbbreviation).toBe("kg");

    const flour = getBaseUnitForProduct("P009");
    expect(flour).toBeTruthy();
    expect(flour!.unitAbbreviation).toBe("kg");
  });

  it("Tiles (P003) have dimensional data", () => {
    const dim = productDimensions.find(d => d.productId === "P003");
    expect(dim).toBeTruthy();
    expect(dim!.widthCm).toBe(40);
    expect(dim!.heightCm).toBe(40);
  });

  it("area calculation correct for 40x40 tiles", () => {
    const area = areaPieceM2(40, 40);
    expect(area).toBeCloseTo(0.16, 4);
  });
});

// ── 1.1 Breakdown Engine ──

describe("Phase 1.1 — Breakdown Engine", () => {
  it("breaks 10,000 kg cement into optimal units", () => {
    const cementConvs = productUnitConversions.filter(c => c.productId === "P001");
    const result = calculateBreakdown(10_000, cementConvs, "sell");
    expect(result.totalBaseUnits).toBe(10_000);
    expect(result.remainder).toBe(0);
    // Should use Palette (2000) and Sac (50)
    expect(result.lines.length).toBeGreaterThan(0);
  });

  it("handles exact palette multiples", () => {
    const cementConvs = productUnitConversions.filter(c => c.productId === "P001");
    const result = calculateBreakdown(4_000, cementConvs, "sell");
    expect(result.totalBaseUnits).toBe(4_000);
    const palLine = result.lines.find(l => l.unitAbbreviation === "Pal");
    expect(palLine?.quantity).toBe(2);
  });
});

// ── 1.1 Rounding ──

describe("Phase 1.1 — Rounding (F-04)", () => {
  it("ceil rounding works", () => {
    expect(applyRounding(1.234, 2, "ceil")).toBe(1.24);
  });
  it("floor rounding works", () => {
    expect(applyRounding(1.236, 2, "floor")).toBe(1.23);
  });
  it("standard rounding works", () => {
    expect(applyRounding(1.235, 2, "round")).toBe(1.24);
  });
});
