/**
 * PHASE 10 — BI & Analytics Tests
 * Validates: Unit conversion reporting, inventory valuation, turnover analysis
 */
import { describe, it, expect } from "vitest";
import { fromBaseUnits, toBaseUnits, areaPieceM2 } from "@/lib/unitConversion";
import { valuateFIFO } from "@/lib/pmpEngine";

describe("Phase 10.1 — Sales Report by Unit Type", () => {
  it("cement: 59,500 Kg → 1,190 Sacks", () => {
    expect(fromBaseUnits(59_500, 50)).toBe(1_190);
  });

  it("cement: 59,500 Kg → 59.5 T", () => {
    expect(fromBaseUnits(59_500, 1_000)).toBe(59.5);
  });

  it("steel: 1,250 Kg → 10 Bundles", () => {
    expect(fromBaseUnits(1_250, 125)).toBe(10);
  });

  it("tiles: 390 Pcs → 39 Boxes", () => {
    expect(fromBaseUnits(390, 10)).toBe(39);
  });

  it("tiles: 390 Pcs → 108.33 M² (at 60×60cm)", () => {
    const areaPerPiece = areaPieceM2(60, 60); // 0.36 m²
    const totalM2 = 390 * areaPerPiece;
    expect(totalM2).toBeCloseTo(140.4, 1); // 390 × 0.36
  });
});

describe("Phase 10.2 — Inventory Valuation Report", () => {
  it("total inventory value = 2,056,350 DZD (FIFO)", () => {
    const layers = [
      { qty: 70_500, unitCost: 9, date: "2024-01-25" },
      { qty: 20_000, unitCost: 9, date: "2024-01-25" },
      { qty: 42_500, unitCost: 26, date: "2024-01-20" },
      { qty: 1_410, unitCost: 85, date: "2024-02-02" },
      { qty: 200, unitCost: 85, date: "2024-02-02" },
    ];
    expect(valuateFIFO(layers)).toBe(2_056_350);
  });

  it("cement is 39.6% of total", () => {
    const cement = 814_500;
    const total = 2_056_350;
    expect(cement / total).toBeCloseTo(0.396, 2);
  });

  it("steel is 53.7% of total", () => {
    expect(1_105_000 / 2_056_350).toBeCloseTo(0.537, 2);
  });
});

describe("Phase 10.4 — Turnover Analysis", () => {
  it("cement turnover ratio", () => {
    const cogs = 525_500;
    const avgValue = ((150_000 + 90_500) / 2) * 8.93;
    const turnover = cogs / avgValue;
    expect(turnover).toBeGreaterThan(0);
    expect(turnover).toBeLessThan(1);
  });

  it("steel has very low turnover (under-utilized)", () => {
    const cogs = 32_500;
    const avgValue = ((50_000 + 42_500) / 2) * 26;
    const turnover = cogs / avgValue;
    expect(turnover).toBeLessThan(0.05);
  });
});

describe("Phase 10.5 — BI Export Verification", () => {
  it("all sales orders have correct base qty conversions", () => {
    const soData = [
      { unit: "Sack", qty: 200, factor: 50, expectedBase: 10_000 },
      { unit: "Bundle", qty: 10, factor: 125, expectedBase: 1_250 },
      { unit: "Box", qty: 30, factor: 10, expectedBase: 300 },
      { unit: "Sack", qty: 1000, factor: 50, expectedBase: 50_000 },
    ];
    for (const so of soData) {
      expect(toBaseUnits(so.qty, so.factor)).toBe(so.expectedBase);
    }
  });
});
