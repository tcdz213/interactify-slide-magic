import { describe, it, expect } from "vitest";
import { allocateFIFO, allocateOrder } from "./fifoEngine";

const mockLots = [
  { id: "L1", lotNumber: "LOT-2025-001", productId: "P009", productName: "Farine T55", batchDate: "2025-12-01", expiryDate: "2026-06-01", qtyAvailable: 100, warehouseId: "wh1", warehouseName: "WH1", status: "Active" },
  { id: "L2", lotNumber: "LOT-2025-002", productId: "P009", productName: "Farine T55", batchDate: "2025-12-15", expiryDate: "2026-05-15", qtyAvailable: 200, warehouseId: "wh1", warehouseName: "WH1", status: "Active" },
  { id: "L3", lotNumber: "LOT-2026-001", productId: "P009", productName: "Farine T55", batchDate: "2026-01-10", expiryDate: "2026-07-10", qtyAvailable: 150, warehouseId: "wh1", warehouseName: "WH1", status: "Active" },
  { id: "L4", lotNumber: "LOT-EXPIRED", productId: "P009", productName: "Farine T55", batchDate: "2025-06-01", expiryDate: "2025-12-01", qtyAvailable: 50, warehouseId: "wh1", warehouseName: "WH1", status: "Expired" },
];

describe("FIFO Engine", () => {
  it("allocates oldest lots first (FIFO)", () => {
    const result = allocateFIFO("P009", "Farine T55", 250, mockLots, "FIFO");
    expect(result.fullyAllocated).toBe(true);
    expect(result.allocatedQty).toBe(250);
    expect(result.allocations).toHaveLength(2);
    expect(result.allocations[0].lotNumber).toBe("LOT-2025-001"); // oldest first
    expect(result.allocations[0].qtyAllocated).toBe(100);
    expect(result.allocations[1].lotNumber).toBe("LOT-2025-002");
    expect(result.allocations[1].qtyAllocated).toBe(150);
  });

  it("allocates earliest expiry first (FEFO)", () => {
    const result = allocateFIFO("P009", "Farine T55", 150, mockLots, "FEFO");
    expect(result.fullyAllocated).toBe(true);
    // FEFO: L2 expires 2026-05-15, L1 expires 2026-06-01, L3 expires 2026-07-10
    expect(result.allocations[0].lotNumber).toBe("LOT-2025-002");
  });

  it("reports shortfall when not enough stock", () => {
    const result = allocateFIFO("P009", "Farine T55", 600, mockLots, "FIFO");
    expect(result.fullyAllocated).toBe(false);
    expect(result.shortfall).toBe(150); // 600 - (100+200+150) = 150
  });

  it("skips non-active lots", () => {
    const result = allocateFIFO("P009", "Farine T55", 500, mockLots, "FIFO");
    expect(result.allocations.every(a => a.lotNumber !== "LOT-EXPIRED")).toBe(true);
  });

  it("handles multi-product order allocation", () => {
    const results = allocateOrder(
      [{ productId: "P009", productName: "Farine T55", qty: 50 }],
      mockLots
    );
    expect(results).toHaveLength(1);
    expect(results[0].fullyAllocated).toBe(true);
  });
});
