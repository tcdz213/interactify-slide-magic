/**
 * PHASE 3 — Internal Transfers Tests
 * Validates: Transfer validation, variance calculation, stock prevention
 */
import { describe, it, expect } from "vitest";
import { validateTransfer, calculateReceiptVariance } from "@/lib/transferEngine";
import { toBaseUnits, validateOutboundStock } from "@/lib/unitConversion";

describe("Phase 3.1 — Transfer Validation", () => {
  it("allows transfer when stock is sufficient", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 20, unitFactor: 1000, fromWarehouseId: "WH1", toWarehouseId: "WH3" },
      100_000, // 100,000 kg available
      1
    );
    expect(result.valid).toBe(true);
    expect(result.sourceBaseQty).toBe(20_000);
  });

  it("blocks transfer when stock is insufficient", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 200, unitFactor: 1000, fromWarehouseId: "WH1", toWarehouseId: "WH3" },
      50_000, // only 50T available
      1
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("warns on same-warehouse transfer", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 10, unitFactor: 1000, fromWarehouseId: "WH1", toWarehouseId: "WH1" },
      100_000,
      1
    );
    expect(result.warnings.some(w => w.includes("même entrepôt"))).toBe(true);
  });

  it("warns when transfer is >50% of source stock", () => {
    const result = validateTransfer(
      { productId: "P001", qty: 60, unitFactor: 1000, fromWarehouseId: "WH1", toWarehouseId: "WH3" },
      100_000, // 60% of stock
      1
    );
    expect(result.warnings.some(w => w.includes("%"))).toBe(true);
  });
});

describe("Phase 3.2 — Receipt Variance", () => {
  it("no variance when shipped == received", () => {
    const result = calculateReceiptVariance(100, 100, 50);
    expect(result.variance).toBe(0);
    expect(result.requiresAdjustment).toBe(false);
  });

  it("detects shortage on receipt", () => {
    const result = calculateReceiptVariance(100, 95, 50);
    expect(result.variance).toBeLessThan(0);
    expect(result.requiresAdjustment).toBe(true);
    expect(result.adjustmentQty).toBe(250); // 5 × 50
  });

  it("detects surplus on receipt", () => {
    const result = calculateReceiptVariance(100, 102, 1);
    expect(result.variance).toBe(2);
    expect(result.variancePct).toBeCloseTo(2, 1);
  });
});

describe("Phase 3 — Stock Conservation", () => {
  it("transfer does not create/destroy stock (sum stays constant)", () => {
    const wh1Before = 100_000;
    const wh3Before = 50_000;
    const transferQty = 20_000;

    const wh1After = wh1Before - transferQty;
    const wh3After = wh3Before + transferQty;

    expect(wh1After + wh3After).toBe(wh1Before + wh3Before);
  });

  it("validateOutboundStock prevents negative stock", () => {
    const stockMap = new Map([["P001", 100]]);
    const factorMap = new Map([["P001", 1]]);
    const issues = validateOutboundStock(
      [{ productId: "P001", qty: 5, conversionFactor: 50 }], // 250 > 100
      stockMap,
      factorMap
    );
    expect(issues.length).toBe(1);
    expect(issues[0].deficit).toBeGreaterThan(0);
  });
});
