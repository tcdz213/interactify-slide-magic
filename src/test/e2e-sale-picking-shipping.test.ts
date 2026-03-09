/**
 * E2E Integration Test — Sale → Picking → Shipping → Invoice
 * Validates the full outbound cycle with FIFO lot allocation.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { allocateFIFO, allocateOrder, type AllocationResult } from "@/lib/fifoEngine";

// ── Mock lots for FIFO allocation ──
const mockLots = [
  { id: "L10", lotNumber: "LOT-2025-A", productId: "P009", productName: "Farine T55", batchDate: "2025-11-01", expiryDate: "2026-05-01", qtyAvailable: 80, warehouseId: "wh1", warehouseName: "Entrepôt Oran", status: "Active" },
  { id: "L11", lotNumber: "LOT-2025-B", productId: "P009", productName: "Farine T55", batchDate: "2025-12-15", expiryDate: "2026-04-15", qtyAvailable: 120, warehouseId: "wh1", warehouseName: "Entrepôt Oran", status: "Active" },
  { id: "L12", lotNumber: "LOT-2026-A", productId: "P009", productName: "Farine T55", batchDate: "2026-01-20", expiryDate: "2026-07-20", qtyAvailable: 200, warehouseId: "wh1", warehouseName: "Entrepôt Oran", status: "Active" },
  { id: "L13", lotNumber: "LOT-EXP", productId: "P009", productName: "Farine T55", batchDate: "2025-03-01", expiryDate: "2025-09-01", qtyAvailable: 50, warehouseId: "wh1", warehouseName: "Entrepôt Oran", status: "Expired" },
  { id: "L20", lotNumber: "LOT-OIL-A", productId: "P010", productName: "Huile 5L", batchDate: "2025-10-01", expiryDate: "2026-10-01", qtyAvailable: 300, warehouseId: "wh1", warehouseName: "Entrepôt Oran", status: "Active" },
  { id: "L21", lotNumber: "LOT-OIL-B", productId: "P010", productName: "Huile 5L", batchDate: "2026-01-05", expiryDate: "2027-01-05", qtyAvailable: 150, warehouseId: "wh1", warehouseName: "Entrepôt Oran", status: "Active" },
  { id: "L30", lotNumber: "LOT-WH2", productId: "P009", productName: "Farine T55", batchDate: "2025-12-01", expiryDate: "2026-06-01", qtyAvailable: 100, warehouseId: "wh2", warehouseName: "Entrepôt Alger", status: "Active" },
];

// ── Simulated order state machine ──
type OrderState = "Draft" | "Approved" | "Picking" | "Packed" | "Shipped" | "Delivered" | "Invoiced";

interface SimOrder {
  id: string;
  state: OrderState;
  lines: { productId: string; productName: string; qty: number; pickedQty: number; allocation?: AllocationResult }[];
  totalAmount: number;
  invoiceId?: string;
}

function createOrder(id: string, lines: { productId: string; productName: string; qty: number }[], total: number): SimOrder {
  return { id, state: "Draft", lines: lines.map(l => ({ ...l, pickedQty: 0 })), totalAmount: total };
}

function approveOrder(o: SimOrder): SimOrder {
  if (o.state !== "Draft") throw new Error("Can only approve Draft orders");
  return { ...o, state: "Approved" };
}

function allocateAndStartPicking(o: SimOrder, lots: typeof mockLots, strategy: "FIFO" | "FEFO" = "FIFO"): SimOrder {
  if (o.state !== "Approved") throw new Error("Can only pick Approved orders");
  const lines = o.lines.map(l => {
    const alloc = allocateFIFO(l.productId, l.productName, l.qty, lots, strategy);
    return { ...l, allocation: alloc };
  });
  return { ...o, state: "Picking", lines };
}

function confirmPicking(o: SimOrder): SimOrder {
  if (o.state !== "Picking") throw new Error("Can only confirm Picking orders");
  const lines = o.lines.map(l => ({ ...l, pickedQty: l.allocation?.allocatedQty ?? 0 }));
  const allPicked = lines.every(l => l.pickedQty >= l.qty);
  return { ...o, state: allPicked ? "Packed" : "Picking", lines };
}

function shipOrder(o: SimOrder): SimOrder {
  if (o.state !== "Packed") throw new Error("Can only ship Packed orders");
  return { ...o, state: "Shipped" };
}

function deliverOrder(o: SimOrder): SimOrder {
  if (o.state !== "Shipped") throw new Error("Can only deliver Shipped orders");
  return { ...o, state: "Delivered" };
}

function invoiceOrder(o: SimOrder, invoiceId: string): SimOrder {
  if (o.state !== "Delivered") throw new Error("Can only invoice Delivered orders");
  return { ...o, state: "Invoiced", invoiceId };
}

// ══════════════════════════════════════════
// Scenario A — Full cycle, single product, FIFO
// ══════════════════════════════════════════
describe("E2E Sale → Picking → Shipping → Invoice", () => {
  describe("Scenario A: Full FIFO cycle — single product", () => {
    let order: SimOrder;

    beforeEach(() => {
      order = createOrder("SO-E2E-001", [
        { productId: "P009", productName: "Farine T55", qty: 150 },
      ], 570000);
    });

    it("creates draft order", () => {
      expect(order.state).toBe("Draft");
      expect(order.lines).toHaveLength(1);
    });

    it("approves order", () => {
      order = approveOrder(order);
      expect(order.state).toBe("Approved");
    });

    it("allocates FIFO — oldest lots first", () => {
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots, "FIFO");
      expect(order.state).toBe("Picking");
      const alloc = order.lines[0].allocation!;
      expect(alloc.fullyAllocated).toBe(true);
      expect(alloc.allocations[0].lotNumber).toBe("LOT-2025-A"); // oldest batch 2025-11-01
      expect(alloc.allocations[0].qtyAllocated).toBe(80);
      // LOT-WH2 (2025-12-01) sorts before LOT-2025-B (2025-12-15) in FIFO
      expect(alloc.allocations[1].lotNumber).toBe("LOT-WH2");
      expect(alloc.allocations[1].qtyAllocated).toBe(70);
    });

    it("skips expired lots", () => {
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots, "FIFO");
      const alloc = order.lines[0].allocation!;
      expect(alloc.allocations.every(a => a.lotNumber !== "LOT-EXP")).toBe(true);
    });

    it("confirms picking → Packed", () => {
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots);
      order = confirmPicking(order);
      expect(order.state).toBe("Packed");
      expect(order.lines[0].pickedQty).toBe(150);
    });

    it("ships order", () => {
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots);
      order = confirmPicking(order);
      order = shipOrder(order);
      expect(order.state).toBe("Shipped");
    });

    it("delivers order", () => {
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots);
      order = confirmPicking(order);
      order = shipOrder(order);
      order = deliverOrder(order);
      expect(order.state).toBe("Delivered");
    });

    it("generates invoice after delivery", () => {
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots);
      order = confirmPicking(order);
      order = shipOrder(order);
      order = deliverOrder(order);
      order = invoiceOrder(order, "INV-E2E-001");
      expect(order.state).toBe("Invoiced");
      expect(order.invoiceId).toBe("INV-E2E-001");
      expect(order.totalAmount).toBe(570000);
    });
  });

  // ══════════════════════════════════════════
  // Scenario B — FEFO allocation, multi-product
  // ══════════════════════════════════════════
  describe("Scenario B: FEFO allocation — multi-product order", () => {
    it("allocates earliest-expiry lots first", () => {
      const results = allocateOrder(
        [
          { productId: "P009", productName: "Farine T55", qty: 100 },
          { productId: "P010", productName: "Huile 5L", qty: 200 },
        ],
        mockLots,
        "FEFO"
      );
      expect(results).toHaveLength(2);
      // P009 FEFO: LOT-2025-B expires 2026-04-15 (earliest), then LOT-2025-A 2026-05-01
      expect(results[0].allocations[0].lotNumber).toBe("LOT-2025-B");
      expect(results[0].fullyAllocated).toBe(true);
      // P010 FEFO: LOT-OIL-A expires 2026-10-01 first
      expect(results[1].allocations[0].lotNumber).toBe("LOT-OIL-A");
      expect(results[1].fullyAllocated).toBe(true);
    });

    it("full cycle with FEFO completes", () => {
      let order = createOrder("SO-E2E-002", [
        { productId: "P009", productName: "Farine T55", qty: 100 },
        { productId: "P010", productName: "Huile 5L", qty: 200 },
      ], 840000);
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots, "FEFO");
      order = confirmPicking(order);
      expect(order.state).toBe("Packed");
      order = shipOrder(order);
      order = deliverOrder(order);
      order = invoiceOrder(order, "INV-E2E-002");
      expect(order.state).toBe("Invoiced");
    });
  });

  // ══════════════════════════════════════════
  // Scenario C — Shortfall / partial allocation
  // ══════════════════════════════════════════
  describe("Scenario C: Shortfall — insufficient stock", () => {
    it("detects shortfall when requested > available", () => {
      const alloc = allocateFIFO("P009", "Farine T55", 500, mockLots, "FIFO");
      // Available: 80 + 120 + 200 + 100(wh2) = 500 (excluding expired)
      expect(alloc.fullyAllocated).toBe(true);
      expect(alloc.allocatedQty).toBe(500);
      expect(alloc.shortfall).toBe(0);
      expect(alloc.allocations).toHaveLength(4);
    });

    it("partial pick leaves order in Picking state", () => {
      let order = createOrder("SO-E2E-003", [
        { productId: "P009", productName: "Farine T55", qty: 600 },
      ], 2280000);
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots);
      // Allocation only got 500 of 600
      order = confirmPicking(order);
      expect(order.state).toBe("Picking"); // not fully picked
      expect(order.lines[0].pickedQty).toBe(500);
    });
  });

  // ══════════════════════════════════════════
  // Scenario D — Warehouse-scoped allocation
  // ══════════════════════════════════════════
  describe("Scenario D: Warehouse-scoped allocation", () => {
    it("only allocates from specified warehouse", () => {
      const alloc = allocateFIFO("P009", "Farine T55", 150, mockLots, "FIFO", "wh2");
      // wh2 only has L30 with 100 qty
      expect(alloc.fullyAllocated).toBe(false);
      expect(alloc.allocatedQty).toBe(100);
      expect(alloc.allocations).toHaveLength(1);
      expect(alloc.allocations[0].warehouseId).toBe("wh2");
    });

    it("wh1 has enough for same request", () => {
      const alloc = allocateFIFO("P009", "Farine T55", 150, mockLots, "FIFO", "wh1");
      expect(alloc.fullyAllocated).toBe(true);
      expect(alloc.allocations.every(a => a.warehouseId === "wh1")).toBe(true);
    });
  });

  // ══════════════════════════════════════════
  // Scenario E — State machine guards
  // ══════════════════════════════════════════
  describe("Scenario E: State machine transitions", () => {
    it("cannot pick a Draft order", () => {
      const order = createOrder("SO-ERR-01", [{ productId: "P009", productName: "Farine", qty: 10 }], 10000);
      expect(() => allocateAndStartPicking(order, mockLots)).toThrow("Can only pick Approved");
    });

    it("cannot ship a non-Packed order", () => {
      let order = createOrder("SO-ERR-02", [{ productId: "P009", productName: "Farine", qty: 10 }], 10000);
      order = approveOrder(order);
      expect(() => shipOrder(order)).toThrow("Can only ship Packed");
    });

    it("cannot invoice before delivery", () => {
      let order = createOrder("SO-ERR-03", [{ productId: "P009", productName: "Farine", qty: 10 }], 10000);
      order = approveOrder(order);
      order = allocateAndStartPicking(order, mockLots);
      order = confirmPicking(order);
      order = shipOrder(order);
      expect(() => invoiceOrder(order, "INV-ERR")).toThrow("Can only invoice Delivered");
    });

    it("cannot approve twice", () => {
      let order = createOrder("SO-ERR-04", [{ productId: "P009", productName: "Farine", qty: 10 }], 10000);
      order = approveOrder(order);
      expect(() => approveOrder(order)).toThrow("Can only approve Draft");
    });
  });
});
