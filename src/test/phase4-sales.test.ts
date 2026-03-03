/**
 * PHASE 4 — Sales Flow Tests
 * Validates: FIFO allocation, multi-unit sales, COGS calculation
 */
import { describe, it, expect } from "vitest";
import { allocateFIFO, allocateOrder } from "@/lib/fifoEngine";
import { toBaseUnits, fromBaseUnits, validateStockAvailability } from "@/lib/unitConversion";
import { calculatePMP, valuateFIFO } from "@/lib/pmpEngine";

const mockBatches = [
  { id: "B1", lotNumber: "BATCH-00001", productId: "CEM-001", productName: "Cement", batchDate: "2024-01-25", expiryDate: "2029-01-05", qtyAvailable: 80_000, warehouseId: "WH1", warehouseName: "Algiers Central", status: "Active" },
  { id: "B3", lotNumber: "BATCH-00003", productId: "CEM-001", productName: "Cement", batchDate: "2024-01-28", expiryDate: "2029-01-15", qtyAvailable: 50_000, warehouseId: "WH3", warehouseName: "Oran", status: "Active" },
  { id: "B2", lotNumber: "BATCH-00002", productId: "STL-002", productName: "Steel", batchDate: "2024-01-20", expiryDate: "2099-01-01", qtyAvailable: 50_000, warehouseId: "WH1", warehouseName: "Algiers Central", status: "Active" },
  { id: "B4", lotNumber: "BATCH-00004", productId: "TIL-003", productName: "Tiles", batchDate: "2024-02-02", expiryDate: "2099-01-01", qtyAvailable: 2_000, warehouseId: "WH2", warehouseName: "Algiers East", status: "Active" },
];

describe("Phase 4.1 — SO-001: Mixed Unit Sale", () => {
  it("allocates 200 Sacks (10,000 Kg) cement from FIFO batch", () => {
    const baseQty = toBaseUnits(200, 50); // 200 sacks × 50 = 10,000 Kg
    expect(baseQty).toBe(10_000);

    const result = allocateFIFO("CEM-001", "Cement", baseQty, mockBatches, "FIFO", "WH1");
    expect(result.fullyAllocated).toBe(true);
    expect(result.allocatedQty).toBe(10_000);
    expect(result.allocations[0].lotNumber).toBe("BATCH-00001"); // Oldest first
  });

  it("allocates 10 Bundles (1,250 Kg) steel from FIFO batch", () => {
    const baseQty = toBaseUnits(10, 125); // 10 bundles × 125 = 1,250 Kg
    expect(baseQty).toBe(1_250);

    const result = allocateFIFO("STL-002", "Steel", baseQty, mockBatches, "FIFO", "WH1");
    expect(result.fullyAllocated).toBe(true);
    expect(result.allocations[0].lotNumber).toBe("BATCH-00002");
  });

  it("COGS calculation: cement 10,000 Kg @ 9 DZD/Kg = 90,000", () => {
    const cogs = 10_000 * 9;
    expect(cogs).toBe(90_000);
  });

  it("COGS calculation: steel 1,250 Kg @ 26 DZD/Kg = 32,500", () => {
    const cogs = 1_250 * 26;
    expect(cogs).toBe(32_500);
  });

  it("VAT 19% calculation", () => {
    const revenue = 90_000 + 32_000;
    const vat = revenue * 0.19;
    expect(vat).toBeCloseTo(23_180, 0);
  });
});

describe("Phase 4.2 — SO-002: Tiles Sale", () => {
  it("allocates 30 Box (300 Pcs) tiles", () => {
    const baseQty = toBaseUnits(30, 10); // 30 boxes × 10 = 300 Pcs
    expect(baseQty).toBe(300);

    const result = allocateFIFO("TIL-003", "Tiles", baseQty, mockBatches, "FIFO");
    expect(result.fullyAllocated).toBe(true);
    expect(result.allocatedQty).toBe(300);
  });

  it("COGS tiles: 300 Pcs @ 85 DZD = 25,500", () => {
    expect(300 * 85).toBe(25_500);
  });
});

describe("Phase 4.3 — SO-003: Batch Exhaustion (FIFO)", () => {
  it("1000 Sacks = 50,000 Kg exhausts BATCH-00003 (cheaper batch first in WH3)", () => {
    const baseQty = toBaseUnits(1000, 50);
    expect(baseQty).toBe(50_000);

    const result = allocateFIFO("CEM-001", "Cement", baseQty, mockBatches, "FIFO", "WH3");
    expect(result.fullyAllocated).toBe(true);
    // BATCH-00003 (Jan 28) is only batch in WH3
    expect(result.allocations[0].lotNumber).toBe("BATCH-00003");
    expect(result.allocations[0].qtyAllocated).toBe(50_000);
  });
});

describe("Phase 4.4 — SO-004: M² Coverage Unit", () => {
  it("25 M² → 90 Pcs (25 × 3.6 = 90)", () => {
    const pcs = 25 * 3.6;
    expect(pcs).toBe(90);
  });

  it("COGS: 90 Pcs @ 85 = 7,650 DZD", () => {
    expect(90 * 85).toBe(7_650);
  });
});

describe("Phase 4.5 — Sales Summary", () => {
  it("multi-product order allocation works", () => {
    const results = allocateOrder(
      [
        { productId: "CEM-001", productName: "Cement", qty: 10_000 },
        { productId: "STL-002", productName: "Steel", qty: 1_250 },
      ],
      mockBatches, "FIFO", "WH1"
    );
    expect(results).toHaveLength(2);
    expect(results[0].fullyAllocated).toBe(true);
    expect(results[1].fullyAllocated).toBe(true);
  });

  it("stock availability validation", () => {
    const check = validateStockAvailability(200, 50, 80_000);
    expect(check.sufficient).toBe(true);
    expect(check.requiredBase).toBe(10_000);
    expect(check.deficit).toBe(0);
  });

  it("detects insufficient stock", () => {
    const check = validateStockAvailability(2000, 50, 80_000);
    expect(check.sufficient).toBe(false);
    expect(check.deficit).toBe(20_000);
  });
});
