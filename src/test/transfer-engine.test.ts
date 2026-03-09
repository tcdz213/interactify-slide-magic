import { describe, it, expect } from "vitest";
import {
  validateTransfer,
  calculateReceiptVariance,
  checkOptimisticLock,
} from "@/lib/transferEngine";

describe("transferEngine", () => {
  describe("validateTransfer", () => {
    it("validates when stock is sufficient", () => {
      const result = validateTransfer(
        { productId: "P1", qty: 10, unitFactor: 50, fromWarehouseId: "wh-1", toWarehouseId: "wh-2" },
        1000,
        1
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects when stock is insufficient", () => {
      const result = validateTransfer(
        { productId: "P1", qty: 100, unitFactor: 50, fromWarehouseId: "wh-1", toWarehouseId: "wh-2" },
        10,
        1
      );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("warns on same-warehouse transfer", () => {
      const result = validateTransfer(
        { productId: "P1", qty: 1, unitFactor: 1, fromWarehouseId: "wh-1", toWarehouseId: "wh-1" },
        100,
        1
      );
      expect(result.warnings.some((w) => w.includes("même entrepôt"))).toBe(true);
    });

    it("warns when transferring >50% of stock", () => {
      const result = validateTransfer(
        { productId: "P1", qty: 60, unitFactor: 1, fromWarehouseId: "wh-1", toWarehouseId: "wh-2" },
        100,
        1
      );
      expect(result.warnings.some((w) => w.includes("60%"))).toBe(true);
    });
  });

  describe("calculateReceiptVariance", () => {
    it("returns zero variance for exact match", () => {
      const result = calculateReceiptVariance(100, 100);
      expect(result.variance).toBe(0);
      expect(result.requiresAdjustment).toBe(false);
    });

    it("detects positive variance (over-received)", () => {
      const result = calculateReceiptVariance(100, 105);
      expect(result.variance).toBe(5);
      expect(result.variancePct).toBeCloseTo(5, 0);
      expect(result.requiresAdjustment).toBe(true);
    });

    it("detects negative variance (under-received)", () => {
      const result = calculateReceiptVariance(100, 90);
      expect(result.variance).toBe(-10);
      expect(result.requiresAdjustment).toBe(true);
    });
  });

  describe("checkOptimisticLock", () => {
    it("passes when versions match", () => {
      expect(checkOptimisticLock(5, 5).locked).toBe(false);
    });

    it("fails when versions differ", () => {
      const result = checkOptimisticLock(6, 5);
      expect(result.locked).toBe(true);
      expect(result.error).toBeDefined();
    });
  });
});