import { describe, it, expect } from "vitest";
import { calculatePMP, valuateFIFO, valuateLastCost, valuatePMP } from "@/lib/pmpEngine";

describe("PMP Engine", () => {
  it("calculates weighted average cost correctly", () => {
    const result = calculatePMP({
      currentQty: 100,
      currentCost: 850,
      receivedQty: 200,
      receivedUnitCost: 900,
    });
    expect(result.newCost).toBe(883);
    expect(result.newTotalQty).toBe(300);
    expect(result.oldCost).toBe(850);
  });

  it("handles zero current stock", () => {
    const result = calculatePMP({
      currentQty: 0,
      currentCost: 0,
      receivedQty: 500,
      receivedUnitCost: 1200,
    });
    expect(result.newCost).toBe(1200);
    expect(result.newTotalQty).toBe(500);
  });

  it("handles zero total qty edge case", () => {
    const result = calculatePMP({
      currentQty: 0,
      currentCost: 0,
      receivedQty: 0,
      receivedUnitCost: 1000,
    });
    expect(result.newCost).toBe(1000);
    expect(result.newTotalQty).toBe(0);
  });
});

describe("Valuation methods", () => {
  it("FIFO valuation sums layers", () => {
    const layers = [
      { qty: 100, unitCost: 850, date: "2026-01-01" },
      { qty: 200, unitCost: 900, date: "2026-02-01" },
    ];
    expect(valuateFIFO(layers)).toBe(100 * 850 + 200 * 900);
  });

  it("Last cost valuation", () => {
    expect(valuateLastCost(300, 900)).toBe(270000);
  });

  it("PMP valuation", () => {
    expect(valuatePMP(300, 883)).toBe(264900);
  });
});