/**
 * PHASE 2 — Purchasing Flow Tests
 * Validates: PO data, GRN receipts, unit conversion on transactions, batch creation
 */
import { describe, it, expect } from "vitest";
import { purchaseOrders, grns, inventory } from "@/data/transactionalData";
import { productUnitConversions } from "@/data/productUnitConversions";
import { toBaseUnits } from "@/lib/unitConversion";

describe("Phase 2.1 — Purchase Orders", () => {
  it("all PO lines have unitId and conversionFactor", () => {
    for (const po of purchaseOrders) {
      for (const line of po.lines) {
        expect(line.unitId, `PO ${po.id} line ${line.lineId} missing unitId`).toBeTruthy();
        expect(line.conversionFactor, `PO ${po.id} line ${line.lineId} missing factor`).toBeGreaterThan(0);
      }
    }
  });

  it("PO line baseQty matches qty × conversionFactor", () => {
    for (const po of purchaseOrders) {
      for (const line of po.lines) {
        if (line.baseQty && line.conversionFactor) {
          // baseQty should match either qty or receivedQty × factor
          const fromQty = line.qty * line.conversionFactor;
          const fromReceived = line.receivedQty * line.conversionFactor;
          const matchesQty = Math.abs(line.baseQty - fromQty) < 1;
          const matchesReceived = Math.abs(line.baseQty - fromReceived) < 1;
          expect(matchesQty || matchesReceived, 
            `PO ${po.id} line ${line.lineId}: baseQty=${line.baseQty} should match qty(${fromQty}) or received(${fromReceived})`
          ).toBe(true);
        }
      }
    }
  });

  it("PO totals are positive", () => {
    for (const po of purchaseOrders) {
      expect(po.totalAmount).toBeGreaterThan(0);
      expect(po.subtotal).toBeGreaterThan(0);
    }
  });

  it("PO tax rate is 19% (DZD standard)", () => {
    for (const po of purchaseOrders) {
      if (po.taxRatePct) {
        expect(po.taxRatePct).toBe(19);
      }
    }
  });

  it("PO tax amount = subtotal × 19%", () => {
    for (const po of purchaseOrders) {
      if (po.taxRatePct) {
        const expectedTax = po.subtotal * (po.taxRatePct / 100);
        expect(Math.abs(po.taxAmount - expectedTax)).toBeLessThan(1);
      }
    }
  });
});

describe("Phase 2.2 — Goods Receipt Notes (GRN)", () => {
  it("all GRN lines have batch numbers", () => {
    for (const grn of grns) {
      for (const line of grn.lines) {
        expect(line.batchNumber, `GRN ${grn.id} line ${line.lineId} missing batch`).toBeTruthy();
      }
    }
  });

  it("GRN lines have QC status", () => {
    for (const grn of grns) {
      for (const line of grn.lines) {
        expect(["Passed", "Failed", "Conditional"]).toContain(line.qcStatus);
      }
    }
  });

  it("GRN receivedQty ≤ orderedQty", () => {
    for (const grn of grns) {
      for (const line of grn.lines) {
        expect(line.receivedQty).toBeLessThanOrEqual(line.orderedQty);
      }
    }
  });

  it("GRN conversion to base units is correct", () => {
    for (const grn of grns) {
      for (const line of grn.lines) {
        if (line.conversionFactor && line.baseQty) {
          const expected = line.receivedQty * line.conversionFactor;
          expect(Math.abs(line.baseQty - expected)).toBeLessThan(1);
        }
      }
    }
  });

  it("expiry dates are in the future relative to production date", () => {
    for (const grn of grns) {
      for (const line of grn.lines) {
        if (line.expiryDate && line.productionDate) {
          expect(new Date(line.expiryDate).getTime()).toBeGreaterThan(
            new Date(line.productionDate).getTime()
          );
        }
      }
    }
  });
});

describe("Phase 2 — Inventory State", () => {
  it("all inventory rows have baseUnitId", () => {
    for (const row of inventory) {
      expect(row.baseUnitId).toBeTruthy();
    }
  });

  it("all inventory rows have version ≥ 1", () => {
    for (const row of inventory) {
      expect(row.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("no negative stock quantities", () => {
    for (const row of inventory) {
      expect(row.qtyOnHand).toBeGreaterThanOrEqual(0);
    }
  });
});
