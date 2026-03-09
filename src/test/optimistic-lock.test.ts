import { describe, it, expect } from "vitest";
import {
  checkOptimisticVersion,
  applyStockDelta,
  formatConflictMessage,
  formatNegativeStockMessage,
  type InventoryRow,
} from "@/lib/optimisticLock";

const baseRow: InventoryRow = {
  productId: "P1",
  warehouseId: "wh-1",
  quantity: 100,
  version: 1,
  updatedAt: "2026-03-01T00:00:00Z",
};

describe("optimisticLock", () => {
  describe("checkOptimisticVersion", () => {
    it("returns null when versions match", () => {
      expect(checkOptimisticVersion(baseRow, 1)).toBeNull();
    });

    it("returns conflict when versions differ", () => {
      const conflict = checkOptimisticVersion(baseRow, 0);
      expect(conflict).not.toBeNull();
      expect(conflict!.code).toBe("VERSION_CONFLICT");
      expect(conflict!.expectedVersion).toBe(0);
      expect(conflict!.currentVersion).toBe(1);
    });
  });

  describe("applyStockDelta", () => {
    it("applies positive delta successfully", () => {
      const result = applyStockDelta(baseRow, 50, 1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newRow.quantity).toBe(150);
        expect(result.newRow.version).toBe(2);
      }
    });

    it("applies negative delta successfully", () => {
      const result = applyStockDelta(baseRow, -30, 1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newRow.quantity).toBe(70);
      }
    });

    it("rejects negative stock result", () => {
      const result = applyStockDelta(baseRow, -150, 1);
      expect(result.success).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).error.code).toBe("NEGATIVE_STOCK");
    });

    it("rejects version conflict", () => {
      const result = applyStockDelta(baseRow, 10, 0);
      expect(result.success).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).error.code).toBe("VERSION_CONFLICT");
    });
  });

  describe("format helpers", () => {
    it("formats conflict message", () => {
      const msg = formatConflictMessage({
        code: "VERSION_CONFLICT",
        expectedVersion: 1,
        currentVersion: 2,
        currentQty: 150,
      });
      expect(msg).toContain("v1");
      expect(msg).toContain("v2");
    });

    it("formats negative stock message", () => {
      const msg = formatNegativeStockMessage({
        code: "NEGATIVE_STOCK",
        productId: "P1",
        currentQty: 10,
        requestedDelta: -50,
        resultingQty: -40,
      });
      expect(msg).toContain("10");
      expect(msg).toContain("50");
    });
  });
});