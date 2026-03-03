/**
 * PHASE 7 — Extreme Test Scenarios
 * Validates: Decimal rejection, anomaly detection, stock insufficiency, concurrency
 */
import { describe, it, expect } from "vitest";
import { validateQuantity, validateStockAvailability, toBaseUnits } from "@/lib/unitConversion";
import { detectAnomalies, hasBlockingAnomaly, hasWarningAnomaly } from "@/lib/qtyAnomalyDetector";
import { applyStockDelta, checkOptimisticVersion, type InventoryRow } from "@/lib/optimisticLock";
import { allocateFIFO } from "@/lib/fifoEngine";

describe("Phase 7.1 — Decimal Unit Rejection", () => {
  it("rejects 1.5 Sacks (integer-only unit)", () => {
    const result = validateQuantity(1.5, { unitName: "Sack", isInteger: true, conversionFactor: 50 });
    expect(result.valid).toBe(false);
    expect(result.correctedQty).toBe(2);
  });

  it("accepts whole sacks", () => {
    expect(validateQuantity(100, { unitName: "Sack", isInteger: true, conversionFactor: 50 }).valid).toBe(true);
  });
});

describe("Phase 7.2 — Anomaly Detection", () => {
  const history = Array.from({ length: 10 }, (_, i) => ({
    baseQty: 10_000, unitId: "Sac", date: `2024-0${(i % 9) + 1}-15`,
  }));

  it("detects 25× volume spike (5000 sacks vs avg 200)", () => {
    const anomalies = detectAnomalies("CEM-001", 5000, "Sac", 50, {
      historicalOrders: history, unit: { unitAbbreviation: "Sac" },
    });
    expect(anomalies.some(a => a.type === "VOLUME_SPIKE")).toBe(true);
  });

  it("blocks zero quantity", () => {
    const anomalies = detectAnomalies("CEM-001", 0, "Sac", 50, {
      historicalOrders: [], unit: { unitAbbreviation: "Sac" },
    });
    expect(hasBlockingAnomaly(anomalies)).toBe(true);
    expect(anomalies[0].type).toBe("ZERO");
  });

  it("blocks negative quantity", () => {
    const anomalies = detectAnomalies("CEM-001", -10, "Sac", 50, {
      historicalOrders: [], unit: { unitAbbreviation: "Sac" },
    });
    expect(hasBlockingAnomaly(anomalies)).toBe(true);
  });

  it("blocks decimal on integer unit", () => {
    const anomalies = detectAnomalies("CEM-001", 3.5, "Pce", 1, {
      historicalOrders: [], unit: { isInteger: true, unitAbbreviation: "Pce" },
    });
    expect(anomalies.some(a => a.type === "DECIMAL_ON_INTEGER")).toBe(true);
  });

  it("blocks capacity exceeded", () => {
    const anomalies = detectAnomalies("CEM-001", 100, "Sac", 50, {
      historicalOrders: [], unit: { unitAbbreviation: "Sac" },
      warehouseCapacity: 2000,
    });
    expect(anomalies.some(a => a.type === "CAPACITY_EXCEEDED")).toBe(true);
  });

  it("passes clean order", () => {
    const anomalies = detectAnomalies("CEM-001", 10, "Sac", 50, {
      historicalOrders: [], unit: { unitAbbreviation: "Sac" },
    });
    expect(anomalies.length).toBe(0);
  });
});

describe("Phase 7.3 — Insufficient Stock", () => {
  it("blocks 2000 Sacks when only 1810 available", () => {
    const check = validateStockAvailability(2000, 50, 90_500);
    expect(check.sufficient).toBe(false);
    expect(check.deficit).toBe(9_500); // 100,000 - 90,500
  });

  it("FIFO reports shortfall", () => {
    const batches = [
      { id: "B1", lotNumber: "B-001", productId: "P1", productName: "Test", batchDate: "2024-01-01", expiryDate: "2029-01-01", qtyAvailable: 1000, warehouseId: "W1", warehouseName: "W1", status: "Active" },
    ];
    const result = allocateFIFO("P1", "Test", 2000, batches, "FIFO");
    expect(result.fullyAllocated).toBe(false);
    expect(result.shortfall).toBe(1000);
  });
});

describe("Phase 7.5 — Concurrency (Optimistic Locking)", () => {
  it("User A succeeds, User B fails on stale version", () => {
    let row: InventoryRow = {
      productId: "CEM-001", warehouseId: "WH1",
      quantity: 70_500, version: 1,
      updatedAt: new Date().toISOString(), updatedBy: "system",
    };

    // User A ships 40,000
    const resultA = applyStockDelta(row, -40_000, 1, "User-A");
    expect(resultA.success).toBe(true);
    if (resultA.success) row = resultA.newRow;

    // User B tries with stale version 1
    const resultB = applyStockDelta(row, -40_000, 1, "User-B");
    expect(resultB.success).toBe(false);

    // User B retries with version 2
    const resultB2 = applyStockDelta(row, -30_500, 2, "User-B");
    expect(resultB2.success).toBe(true);
    if (resultB2.success) {
      expect(resultB2.newRow.quantity).toBe(0);
      expect(resultB2.newRow.version).toBe(3);
    }
  });

  it("prevents negative stock even with correct version", () => {
    const row: InventoryRow = {
      productId: "CEM-001", warehouseId: "WH1",
      quantity: 100, version: 1,
      updatedAt: new Date().toISOString(),
    };
    const result = applyStockDelta(row, -200, 1, "user");
    expect(result.success).toBe(false);
  });

  it("checkOptimisticVersion detects mismatch", () => {
    const row = {
      productId: "P1", warehouseId: "W1",
      quantity: 100, version: 5,
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    };
    expect(checkOptimisticVersion(row, 5)).toBeNull();
    expect(checkOptimisticVersion(row, 3)?.code).toBe("VERSION_CONFLICT");
  });
});
