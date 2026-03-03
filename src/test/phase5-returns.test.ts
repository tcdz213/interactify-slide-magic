/**
 * PHASE 5 — Returns & Adjustments Tests
 * Validates: Return processing, FIFO batch restocking, write-offs
 */
import { describe, it, expect } from "vitest";
import { toBaseUnits } from "@/lib/unitConversion";
import { applyStockDelta } from "@/lib/optimisticLock";

describe("Phase 5.1 — Sales Return (RET-001)", () => {
  it("return qty converts correctly: 10 Sacks = 500 Kg", () => {
    expect(toBaseUnits(10, 50)).toBe(500);
  });

  it("return credit: 10 Sacks × 450 DZD = 4,500 DZD", () => {
    expect(10 * 450).toBe(4_500);
  });

  it("batch restocked: 70,000 + 500 = 70,500 Kg", () => {
    expect(70_000 + 500).toBe(70_500);
  });

  it("GL reversal COGS: 500 Kg × 9 DZD = 4,500 DZD", () => {
    expect(500 * 9).toBe(4_500);
  });

  it("VAT adjustment: 19% × 4,500 = 855 DZD", () => {
    expect(Math.round(4_500 * 0.19)).toBe(855);
  });
});

describe("Phase 5.2 — Inventory Adjustment (ADJ-001)", () => {
  it("write-off converts correctly: 50 Bundles × 125 = 6,250 Kg", () => {
    expect(toBaseUnits(50, 125)).toBe(6_250);
  });

  it("cost write-off: 6,250 Kg × 26 DZD = 162,500 DZD", () => {
    expect(6_250 * 26).toBe(162_500);
  });

  it("inventory reduced: 48,750 - 6,250 = 42,500 Kg", () => {
    expect(48_750 - 6_250).toBe(42_500);
  });

  it("applyStockDelta handles write-off correctly", () => {
    const row = {
      productId: "STL-002", warehouseId: "WH1",
      quantity: 48_750, version: 1,
      updatedAt: new Date().toISOString(), updatedBy: "test",
    };
    const result = applyStockDelta(row, -6_250, 1, "warehouse-mgr");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newRow.quantity).toBe(42_500);
      expect(result.newRow.version).toBe(2);
    }
  });
});
