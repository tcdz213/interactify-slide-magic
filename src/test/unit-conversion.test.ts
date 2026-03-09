import { describe, it, expect } from "vitest";
import {
  toBaseUnits,
  fromBaseUnits,
  applyRounding,
  canEditFactor,
  lockConversionFactor,
  resolveConversionAtDate,
  validateQuantity,
  calculateBreakdown,
  formatBreakdown,
  validateStockAvailability,
  validateDateRange,
  validatePackagingChange,
  validateOutboundStock,
  areaPieceM2,
  piecesForArea,
  type ProductUnitConversion,
} from "@/lib/unitConversion";

// ─── Sample conversions (Ciment CPJ 42.5) ───
const cimentConversions: ProductUnitConversion[] = [
  { id: "u1", productId: "P1", unitName: "Kilogramme", unitAbbreviation: "kg", conversionFactor: 1, allowBuy: true, allowSell: true, sortOrder: 1 },
  { id: "u2", productId: "P1", unitName: "Sac (50kg)", unitAbbreviation: "Sac", conversionFactor: 50, allowBuy: true, allowSell: true, sortOrder: 2, isInteger: true },
  { id: "u3", productId: "P1", unitName: "Tonne", unitAbbreviation: "T", conversionFactor: 1000, allowBuy: true, allowSell: true, sortOrder: 3 },
  { id: "u4", productId: "P1", unitName: "Palette (40 sacs)", unitAbbreviation: "Pal", conversionFactor: 2000, allowBuy: true, allowSell: true, sortOrder: 4, isInteger: true },
];

describe("unitConversion", () => {
  describe("toBaseUnits / fromBaseUnits", () => {
    it("converts Sac to kg correctly", () => {
      expect(toBaseUnits(10, 50)).toBe(500);
    });

    it("converts back from base units", () => {
      expect(fromBaseUnits(500, 50)).toBe(10);
    });

    it("handles zero conversion factor in fromBaseUnits", () => {
      expect(fromBaseUnits(100, 0)).toBe(0);
    });

    it("applies precision rounding", () => {
      expect(toBaseUnits(1, 3.333, 2)).toBe(3.33);
    });
  });

  describe("applyRounding", () => {
    it("rounds with ceil", () => {
      expect(applyRounding(3.141, 2, "ceil")).toBe(3.15);
    });

    it("rounds with floor", () => {
      expect(applyRounding(3.149, 2, "floor")).toBe(3.14);
    });

    it("rounds with round", () => {
      expect(applyRounding(3.145, 2, "round")).toBe(3.15);
    });
  });

  describe("canEditFactor / lockConversionFactor", () => {
    it("allows editing unused factor", () => {
      expect(canEditFactor(cimentConversions[1]).editable).toBe(true);
    });

    it("blocks editing base unit (factor=1)", () => {
      expect(canEditFactor(cimentConversions[0]).editable).toBe(false);
    });

    it("blocks editing locked factor", () => {
      const locked = lockConversionFactor(cimentConversions[1]);
      expect(locked.usedInTransactions).toBe(true);
      expect(canEditFactor(locked).editable).toBe(false);
    });
  });

  describe("resolveConversionAtDate", () => {
    const datedConversions: ProductUnitConversion[] = [
      { ...cimentConversions[1], id: "v1", validFrom: "2025-01-01", validTo: "2026-01-01", conversionFactor: 50 },
      { ...cimentConversions[1], id: "v2", validFrom: "2026-01-01", validTo: undefined, conversionFactor: 48 },
    ];

    it("returns correct version for date", () => {
      const conv = resolveConversionAtDate(datedConversions, "Sac", new Date("2025-06-15"));
      expect(conv?.conversionFactor).toBe(50);
    });

    it("returns newer version after effective date", () => {
      const conv = resolveConversionAtDate(datedConversions, "Sac", new Date("2026-03-01"));
      expect(conv?.conversionFactor).toBe(48);
    });
  });

  describe("validateQuantity", () => {
    it("rejects zero quantity", () => {
      expect(validateQuantity(0, cimentConversions[1]).valid).toBe(false);
    });

    it("rejects negative quantity", () => {
      expect(validateQuantity(-5, cimentConversions[1]).valid).toBe(false);
    });

    it("rejects decimal on integer unit", () => {
      const result = validateQuantity(5.5, cimentConversions[1]);
      expect(result.valid).toBe(false);
      expect(result.correctedQty).toBe(6);
    });

    it("accepts valid integer quantity", () => {
      expect(validateQuantity(10, cimentConversions[1]).valid).toBe(true);
    });
  });

  describe("calculateBreakdown", () => {
    it("breaks down 3200kg optimally", () => {
      const result = calculateBreakdown(3200, cimentConversions, "sell");
      expect(result.totalBaseUnits).toBe(3200);
      // 1 Pal (2000) + 1 T (1000) + 4 Sac (200)
      const palLine = result.lines.find((l) => l.unitAbbreviation === "Pal");
      const tLine = result.lines.find((l) => l.unitAbbreviation === "T");
      const sacLine = result.lines.find((l) => l.unitAbbreviation === "Sac");
      expect(palLine?.quantity).toBe(1);
      expect(tLine?.quantity).toBe(1);
      expect(sacLine?.quantity).toBe(4);
      expect(result.remainder).toBe(0);
    });

    it("handles exact single unit quantity", () => {
      const result = calculateBreakdown(2000, cimentConversions, "sell");
      expect(result.lines[0].unitAbbreviation).toBe("Pal");
      expect(result.lines[0].quantity).toBe(1);
    });
  });

  describe("formatBreakdown", () => {
    it("formats breakdown lines", () => {
      const result = calculateBreakdown(3200, cimentConversions, "sell");
      const formatted = formatBreakdown(result);
      expect(formatted).toContain("Pal");
      expect(formatted).toContain("+");
    });

    it("returns — for empty breakdown", () => {
      expect(formatBreakdown({ lines: [], totalBaseUnits: 0, remainder: 0 })).toBe("—");
    });
  });

  describe("validateStockAvailability", () => {
    it("returns sufficient when stock is enough", () => {
      const result = validateStockAvailability(10, 50, 600);
      expect(result.sufficient).toBe(true);
      expect(result.deficit).toBe(0);
    });

    it("returns insufficient with deficit", () => {
      const result = validateStockAvailability(10, 50, 400);
      expect(result.sufficient).toBe(false);
      expect(result.deficit).toBe(100);
    });
  });

  describe("validateDateRange", () => {
    const existing: ProductUnitConversion[] = [
      { ...cimentConversions[1], validFrom: "2025-01-01", validTo: "2026-01-01" },
    ];

    it("accepts non-overlapping range", () => {
      const result = validateDateRange(existing, { productId: "P1", unitAbbreviation: "Sac", validFrom: "2026-01-01", validTo: "2027-01-01" });
      expect(result.valid).toBe(true);
    });

    it("rejects overlapping range", () => {
      const result = validateDateRange(existing, { productId: "P1", unitAbbreviation: "Sac", validFrom: "2025-06-01", validTo: "2026-06-01" });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateOutboundStock", () => {
    it("returns empty array when stock sufficient", () => {
      const stockMap = new Map([["P1", 100]]);
      const factorMap = new Map([["P1", 1]]);
      const issues = validateOutboundStock([{ productId: "P1", qty: 50, conversionFactor: 1 }], stockMap, factorMap);
      expect(issues).toHaveLength(0);
    });

    it("returns deficit when stock insufficient", () => {
      const stockMap = new Map([["P1", 10]]);
      const factorMap = new Map([["P1", 1]]);
      const issues = validateOutboundStock([{ productId: "P1", qty: 50, conversionFactor: 1 }], stockMap, factorMap);
      expect(issues).toHaveLength(1);
      expect(issues[0].deficit).toBe(40);
    });
  });

  describe("area calculations", () => {
    it("calculates area per piece", () => {
      expect(areaPieceM2(30, 30)).toBeCloseTo(0.09, 4);
    });

    it("calculates pieces for area", () => {
      expect(piecesForArea(1, 30, 30, false)).toBe(12); // ceil(1/0.09) = 12
    });
  });
});