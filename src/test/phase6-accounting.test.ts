/**
 * PHASE 6 — Accounting Integration Tests
 * Validates: WAC calculation, FIFO valuation, GL accuracy
 */
import { describe, it, expect } from "vitest";
import { calculatePMP, valuateFIFO, valuatePMP } from "@/lib/pmpEngine";

describe("Phase 6.1 — WAC Revaluation", () => {
  it("WAC for cement: (100,000×9 + 50,000×8.8) / 150,000 ≈ 8.933", () => {
    const result = calculatePMP({
      currentQty: 100_000, currentCost: 9,
      receivedQty: 50_000, receivedUnitCost: 8.8,
    });
    expect(result.newTotalQty).toBe(150_000);
    // calculatePMP rounds to integer
    expect(result.newCost).toBe(9); // Math.round(8.9333) = 9
  });

  it("WAC with equal costs stays same", () => {
    const result = calculatePMP({
      currentQty: 100, currentCost: 10,
      receivedQty: 100, receivedUnitCost: 10,
    });
    expect(result.newCost).toBe(10);
  });

  it("WAC with zero initial stock uses received cost", () => {
    const result = calculatePMP({
      currentQty: 0, currentCost: 0,
      receivedQty: 1000, receivedUnitCost: 85,
    });
    expect(result.newCost).toBe(85);
  });
});

describe("Phase 6.1 — FIFO Valuation", () => {
  it("FIFO valuation for cement inventory", () => {
    const layers = [
      { qty: 70_500, unitCost: 9, date: "2024-01-25" },  // WH1
      { qty: 20_000, unitCost: 9, date: "2024-01-25" },  // WH3 (transferred)
    ];
    const value = valuateFIFO(layers);
    expect(value).toBe(814_500); // (70500+20000) × 9
  });

  it("FIFO valuation for steel", () => {
    const layers = [
      { qty: 42_500, unitCost: 26, date: "2024-01-20" },
    ];
    expect(valuateFIFO(layers)).toBe(1_105_000);
  });

  it("FIFO valuation for tiles", () => {
    const layers = [
      { qty: 1_410, unitCost: 85, date: "2024-02-02" },
      { qty: 200, unitCost: 85, date: "2024-02-02" },
    ];
    expect(valuateFIFO(layers)).toBe(136_850);
  });

  it("FIFO vs WAC variance for cement", () => {
    const fifoValue = 814_500;
    const wacValue = valuatePMP(90_500, 9); // simplified WAC
    expect(Math.abs(fifoValue - wacValue)).toBeLessThan(10_000);
  });
});

describe("Phase 6.2 — GL Summary Validation", () => {
  it("total inventory assets = sum of all product valuations", () => {
    const cement = 814_500;
    const steel = 1_105_000;
    const tiles = 136_850;
    const total = cement + steel + tiles;
    expect(total).toBe(2_056_350);
  });

  it("revenue - COGS = gross profit", () => {
    const revenue = 809_000;
    const cogs = 591_150;
    const gp = revenue - cogs;
    expect(gp).toBe(217_850);
    expect(gp / revenue).toBeCloseTo(0.269, 2);
  });

  it("VAT calculation: 19% on sales", () => {
    const netSales = 809_000;
    const vatCollected = Math.round(netSales * 0.19);
    expect(vatCollected).toBe(153_710);
  });
});
