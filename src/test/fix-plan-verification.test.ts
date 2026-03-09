/**
 * Phase 1-4 Verification Tests — fix-plan.md
 * 
 * Task 1.1.4: unitId FK on transaction lines
 * Task 1.2.4: Inventory normalization reconciliation
 * Task 2.5: Optimistic locking concurrent access
 * Task 3.7: Date range validation & historical resolution
 * Task 4.6: Anomaly detection engine
 */
import { describe, it, expect } from "vitest";
import { purchaseOrders, grns, salesOrders, stockAdjustments, inventory } from "@/data/transactionalData";
import { productUnitConversions } from "@/data/productUnitConversions";
import { checkOptimisticVersion, applyStockDelta, type InventoryRow } from "@/lib/optimisticLock";
import { validateDateRange, resolveConversionAtDate, type ProductUnitConversion } from "@/lib/unitConversion";
import { detectAnomalies, hasBlockingAnomaly, hasWarningAnomaly } from "@/lib/qtyAnomalyDetector";

// ── Phase 1.1 — unitId FK Verification ──

describe("Phase 1.1 — unitId FK on transaction lines", () => {
  it("all PO lines have non-null unitId", () => {
    for (const po of purchaseOrders) {
      for (const line of po.lines) {
        expect(line.unitId).toBeTruthy();
        expect(line.conversionFactor).toBeGreaterThan(0);
      }
    }
  });

  it("all SO lines have non-null unitId", () => {
    for (const so of salesOrders) {
      for (const line of so.lines) {
        expect(line.unitId).toBeTruthy();
        expect(line.conversionFactor).toBeGreaterThan(0);
      }
    }
  });

  it("all GRN lines have unitId or fallback", () => {
    for (const grn of grns) {
      for (const line of grn.lines) {
        // GRN lines have optional unitId (backfilled where possible)
        if (line.unitId) {
          expect(line.conversionFactor).toBeGreaterThan(0);
        }
      }
    }
  });

  it("baseQty equals qty × conversionFactor or receivedQty × factor (within tolerance)", () => {
    for (const po of purchaseOrders) {
      for (const line of po.lines) {
        if (line.baseQty && line.conversionFactor) {
          const expectedFromQty = line.qty * line.conversionFactor;
          const expectedFromReceived = line.receivedQty * line.conversionFactor;
          const matchesQty = Math.abs(line.baseQty - expectedFromQty) < 0.01;
          const matchesReceived = Math.abs(line.baseQty - expectedFromReceived) < 0.01;
          expect(matchesQty || matchesReceived).toBe(true);
        }
      }
    }
  });
});

// ── Phase 1.2 — Inventory Normalization ──

describe("Phase 1.2 — Inventory normalization", () => {
  it("all inventory rows have baseUnitId", () => {
    for (const row of inventory) {
      expect(row.baseUnitId).toBeTruthy();
      expect(row.baseUnitAbbr).toBeTruthy();
    }
  });

  it("all inventory rows have version >= 1", () => {
    for (const row of inventory) {
      expect(row.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("no negative quantities", () => {
    for (const row of inventory) {
      expect(row.qtyOnHand).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── Phase 2 — Optimistic Locking ──

describe("Phase 2 — Optimistic locking", () => {
  const makeRow = (qty: number, version: number): InventoryRow => ({
    productId: "P001",
    warehouseId: "wh-1",
    quantity: qty,
    version,
    updatedAt: new Date().toISOString(),
    updatedBy: "test",
  });

  it("succeeds when versions match", () => {
    const row = makeRow(100, 1);
    const result = applyStockDelta(row, -10, 1, "user-A");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newRow.quantity).toBe(90);
      expect(result.newRow.version).toBe(2);
    }
  });

  it("fails on version mismatch", () => {
    const row = makeRow(100, 2);
    const result = applyStockDelta(row, -10, 1, "user-B");
    expect(result.success).toBe(false);
    expect((result as any).error.code).toBe("VERSION_CONFLICT");
  });

  it("prevents negative stock", () => {
    const row = makeRow(10, 1);
    const result = applyStockDelta(row, -20, 1, "user-A");
    expect(result.success).toBe(false);
    expect((result as any).error.code).toBe("NEGATIVE_STOCK");
  });

  it("simulates concurrent access correctly", () => {
    // User A and B both read version 1
    let row = makeRow(1000, 1);

    // User A ships 100 → succeeds
    const resultA = applyStockDelta(row, -100, 1, "user-A");
    expect(resultA.success).toBe(true);
    if (resultA.success) row = resultA.newRow;

    // User B tries with old version 1 → fails
    const resultB = applyStockDelta(row, -50, 1, "user-B");
    expect(resultB.success).toBe(false);

    // User B retries with version 2 → succeeds
    const resultB2 = applyStockDelta(row, -50, 2, "user-B");
    expect(resultB2.success).toBe(true);
    if (resultB2.success) {
      expect(resultB2.newRow.quantity).toBe(850);
      expect(resultB2.newRow.version).toBe(3);
    }
  });

  it("checkOptimisticVersion returns null on match", () => {
    const row = makeRow(100, 5);
    expect(checkOptimisticVersion(row, 5)).toBeNull();
  });

  it("checkOptimisticVersion returns conflict on mismatch", () => {
    const row = makeRow(100, 5);
    const conflict = checkOptimisticVersion(row, 3);
    expect(conflict).not.toBeNull();
    expect(conflict!.code).toBe("VERSION_CONFLICT");
    expect(conflict!.expectedVersion).toBe(3);
    expect(conflict!.currentVersion).toBe(5);
  });
});

// ── Phase 3 — Effective-Date Validation ──

describe("Phase 3 — Date range validation", () => {
  const baseConversions: ProductUnitConversion[] = [
    {
      id: "v1", productId: "P001", unitName: "Sac v1", unitAbbreviation: "Sac",
      conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 1,
      validFrom: "2025-01-01", validTo: "2025-05-31",
    },
    {
      id: "v2", productId: "P001", unitName: "Sac v2", unitAbbreviation: "Sac",
      conversionFactor: 40, allowBuy: true, allowSell: true, sortOrder: 1,
      validFrom: "2025-06-01", validTo: undefined,
    },
  ];

  it("rejects overlapping date ranges", () => {
    const result = validateDateRange(baseConversions, {
      productId: "P001", unitAbbreviation: "Sac",
      validFrom: "2025-04-01", validTo: "2025-08-01",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Chevauchement");
  });

  it("accepts non-overlapping date range", () => {
    const conversionsWithEnd: ProductUnitConversion[] = [
      { ...baseConversions[0] },
      { ...baseConversions[1], validTo: "2025-12-31" },
    ];
    const result = validateDateRange(conversionsWithEnd, {
      productId: "P001", unitAbbreviation: "Sac",
      validFrom: "2026-01-01", validTo: undefined,
    });
    expect(result.valid).toBe(true);
  });

  it("resolves historical date to correct version", () => {
    const feb = new Date("2025-02-15");
    const resolved = resolveConversionAtDate(baseConversions, "Sac", feb);
    expect(resolved).toBeDefined();
    expect(resolved!.conversionFactor).toBe(50);
    expect(resolved!.id).toBe("v1");
  });

  it("resolves current date to latest version", () => {
    const jul = new Date("2025-07-15");
    const resolved = resolveConversionAtDate(baseConversions, "Sac", jul);
    expect(resolved).toBeDefined();
    expect(resolved!.conversionFactor).toBe(40);
    expect(resolved!.id).toBe("v2");
  });
});

// ── Phase 4 — Anomaly Detection ──

describe("Phase 4 — Anomaly detection", () => {
  it("blocks zero quantity", () => {
    const anomalies = detectAnomalies("P001", 0, "Sac", 50, {
      historicalOrders: [],
      unit: { unitAbbreviation: "Sac" },
    });
    expect(hasBlockingAnomaly(anomalies)).toBe(true);
    expect(anomalies[0].type).toBe("ZERO");
  });

  it("blocks negative quantity", () => {
    const anomalies = detectAnomalies("P001", -5, "Sac", 50, {
      historicalOrders: [],
      unit: { unitAbbreviation: "Sac" },
    });
    expect(hasBlockingAnomaly(anomalies)).toBe(true);
    expect(anomalies[0].type).toBe("NEGATIVE");
  });

  it("blocks decimal on integer unit", () => {
    const anomalies = detectAnomalies("P001", 3.5, "Pce", 1, {
      historicalOrders: [],
      unit: { isInteger: true, unitAbbreviation: "Pce" },
    });
    expect(anomalies.some(a => a.type === "DECIMAL_ON_INTEGER")).toBe(true);
  });

  it("warns on volume spike", () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      baseQty: 100, unitId: "Sac", date: `2025-0${(i % 9) + 1}-01`,
    }));
    const anomalies = detectAnomalies("P001", 500, "Sac", 50, {
      historicalOrders: history,
      unit: { unitAbbreviation: "Sac" },
    });
    expect(anomalies.some(a => a.type === "VOLUME_SPIKE")).toBe(true);
  });

  it("warns on max order exceeded", () => {
    const anomalies = detectAnomalies("P001", 100, "Sac", 50, {
      historicalOrders: [],
      unit: { unitAbbreviation: "Sac" },
      maxSingleOrderBase: 1000,
    });
    // 100 * 50 = 5000 > 1000
    expect(anomalies.some(a => a.type === "MAX_ORDER_EXCEEDED")).toBe(true);
  });

  it("blocks on capacity exceeded", () => {
    const anomalies = detectAnomalies("P001", 100, "Sac", 50, {
      historicalOrders: [],
      unit: { unitAbbreviation: "Sac" },
      warehouseCapacity: 2000,
    });
    // 100 * 50 = 5000 > 2000
    expect(anomalies.some(a => a.type === "CAPACITY_EXCEEDED")).toBe(true);
    expect(hasBlockingAnomaly(anomalies)).toBe(true);
  });

  it("passes clean order with no anomalies", () => {
    const anomalies = detectAnomalies("P001", 10, "Sac", 50, {
      historicalOrders: [],
      unit: { unitAbbreviation: "Sac" },
    });
    expect(anomalies.length).toBe(0);
  });
});
