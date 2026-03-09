import { describe, it, expect } from "vitest";
import {
  performThreeWayMatch,
  requiresManagerApproval,
  requiresPriceEscalation,
  formatMatchStatus,
  DEFAULT_TOLERANCES,
} from "@/lib/threeWayMatch";

describe("threeWayMatch", () => {
  const conversions = [
    { id: "c1", productId: "P1", unitName: "Sac (50kg)", unitAbbreviation: "Sac", conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 2 },
    { id: "c2", productId: "P1", unitName: "Kilogramme", unitAbbreviation: "kg", conversionFactor: 1, allowBuy: true, allowSell: true, sortOrder: 1 },
  ];

  const basePo = {
    id: "PO-001",
    taxAmount: 1900,
    lines: [
      { productId: "P1", productName: "Ciment", qty: 100, unitAbbr: "Sac", conversionFactor: 50, unitCost: 500, lineTotal: 50000 },
    ],
  };

  const baseGrn = {
    id: "GRN-001",
    lines: [
      { productId: "P1", productName: "Ciment", orderedQty: 100, receivedQty: 100, rejectedQty: 0, unitAbbr: "Sac", conversionFactor: 50 },
    ],
  };

  const baseInvoice = {
    id: "INV-001",
    taxAmount: 1900,
    lines: [
      { productId: "P1", qty: 100, unitAbbr: "Sac", conversionFactor: 50, unitCost: 500, lineTotal: 50000 },
    ],
  };

  it("returns matched when all documents align", () => {
    const result = performThreeWayMatch(basePo, baseGrn, baseInvoice, conversions);
    expect(result.overallStatus).toBe("matched");
    expect(result.lines[0].status).toBe("matched");
    expect(result.taxStatus).toBe("matched");
  });

  it("returns within_tolerance for small GRN variance", () => {
    const grn = {
      ...baseGrn,
      lines: [{ ...baseGrn.lines[0], receivedQty: 99 }],
    };
    const result = performThreeWayMatch(basePo, grn, baseInvoice, conversions);
    expect(result.lines[0].status).toBe("within_tolerance");
    expect(result.overallStatus).toBe("within_tolerance");
  });

  it("returns mismatch for large GRN variance (>5%)", () => {
    const grn = {
      ...baseGrn,
      lines: [{ ...baseGrn.lines[0], receivedQty: 90 }],
    };
    const result = performThreeWayMatch(basePo, grn, baseInvoice, conversions);
    expect(result.lines[0].status).toBe("mismatch");
    expect(result.overallStatus).toBe("mismatch");
  });

  it("detects price variance between PO and invoice", () => {
    const invoice = {
      ...baseInvoice,
      lines: [{ ...baseInvoice.lines[0], unitCost: 530, lineTotal: 53000 }],
    };
    const result = performThreeWayMatch(basePo, baseGrn, invoice, conversions);
    expect(result.lines[0].priceVariance).toBe(30);
    expect(result.lines[0].priceVariancePct).toBeCloseTo(6, 0);
  });

  it("handles null invoice (2-way match)", () => {
    const result = performThreeWayMatch(basePo, baseGrn, null, conversions);
    expect(result.invoiceId).toBeUndefined();
    expect(result.totalInvoiceAmount).toBe(0);
    expect(result.lines[0].invoiceBaseQty).toBe(0);
  });

  it("detects tax variance", () => {
    const invoice = { ...baseInvoice, taxAmount: 2100 };
    const result = performThreeWayMatch(basePo, baseGrn, invoice, conversions);
    expect(result.taxVariance).toBe(200);
    expect(result.taxStatus).toBe("mismatch");
  });

  it("accepts tax within tolerance", () => {
    const invoice = { ...baseInvoice, taxAmount: 1900.5 };
    const result = performThreeWayMatch(basePo, baseGrn, invoice, conversions);
    expect(result.taxStatus).toBe("within_tolerance");
  });

  it("respects custom tolerances", () => {
    const grn = { ...baseGrn, lines: [{ ...baseGrn.lines[0], receivedQty: 90 }] };
    const result = performThreeWayMatch(basePo, grn, baseInvoice, conversions, { qtyTolerancePct: 15 });
    expect(result.lines[0].status).toBe("within_tolerance");
  });
});

describe("requiresManagerApproval", () => {
  it("returns true for variance above threshold", () => {
    expect(requiresManagerApproval(6)).toBe(true);
  });
  it("returns false for variance within threshold", () => {
    expect(requiresManagerApproval(3)).toBe(false);
  });
  it("checks absolute value", () => {
    expect(requiresManagerApproval(-6)).toBe(true);
  });
});

describe("requiresPriceEscalation", () => {
  it("returns true when both pct and abs thresholds exceeded", () => {
    expect(requiresPriceEscalation(5, 50)).toBe(true);
  });
  it("returns false when only pct exceeded", () => {
    expect(requiresPriceEscalation(5, 5)).toBe(false);
  });
});

describe("formatMatchStatus", () => {
  it("returns correct labels", () => {
    expect(formatMatchStatus("matched").icon).toBe("✅");
    expect(formatMatchStatus("mismatch").icon).toBe("❌");
    expect(formatMatchStatus("within_tolerance").icon).toBe("⚠️");
  });
});
