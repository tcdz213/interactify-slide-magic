import { describe, it, expect } from "vitest";
import {
  getRate,
  getAllRates,
  computeFxGainLoss,
  generateFxJournal,
  generateAutoRates,
} from "@/lib/fxEngine";



describe("fxEngine", () => {
  describe("getRate", () => {
    it("returns 1.0 for same currency", () => {
      expect(getRate("DZD", "DZD", "2026-03-01")).toBe(1.0);
      expect(getRate("EUR", "EUR", "2026-03-01")).toBe(1.0);
    });

    it("returns correct EUR→DZD spot rate for date", () => {
      const rate = getRate("EUR", "DZD", "2026-03-01");
      expect(rate).toBe(146.80);
    });

    it("returns most recent rate ≤ date", () => {
      const rate = getRate("EUR", "DZD", "2026-02-20");
      expect(rate).toBe(147.00);
    });

    it("returns inverse rate for DZD→EUR", () => {
      const rate = getRate("DZD", "EUR", "2026-03-01");
      expect(rate).toBeCloseTo(1 / 146.80, 6);
    });

    it("returns budget rate when requested", () => {
      const rate = getRate("EUR", "DZD", "2026-03-01", "budget");
      expect(rate).toBe(148.00);
    });

    it("returns 1.0 for unknown currency pair", () => {
      const rate = getRate("JPY", "DZD", "2026-03-01");
      expect(rate).toBe(1.0);
    });

    it("uses additional rates", () => {
      const rate = getRate("CNY", "DZD", "2026-03-01", "spot", [
        { fromCurrency: "CNY", toCurrency: "DZD", rate: 18.5, effectiveDate: "2026-03-01", rateType: "spot" },
      ]);
      expect(rate).toBe(18.5);
    });
  });

  describe("getAllRates", () => {
    it("returns non-empty array of rates", () => {
      const rates = getAllRates();
      expect(rates.length).toBeGreaterThan(0);
      expect(rates[0]).toHaveProperty("fromCurrency");
      expect(rates[0]).toHaveProperty("rate");
    });
  });

  describe("computeFxGainLoss", () => {
    it("computes gain when settlement rate is higher", () => {
      const result = computeFxGainLoss("EUR", 1000, "2025-12-01", "2026-03-01");
      expect(result.transactionRate).toBe(144.20);
      expect(result.settlementRate).toBe(146.80);
      expect(result.transactionAmountDZD).toBe(144200);
      expect(result.settlementAmountDZD).toBe(146800);
      expect(result.gainLossDZD).toBe(2600);
      expect(result.isGain).toBe(true);
    });

    it("computes loss when settlement rate is lower", () => {
      const result = computeFxGainLoss("EUR", 500, "2026-02-15", "2026-03-01");
      expect(result.gainLossDZD).toBeLessThan(0);
      expect(result.isGain).toBe(false);
    });

    it("returns zero gain/loss for same date", () => {
      const result = computeFxGainLoss("EUR", 1000, "2026-03-01", "2026-03-01");
      expect(result.gainLossDZD).toBe(0);
      expect(result.isGain).toBe(true);
    });
  });

  describe("generateFxJournal", () => {
    it("generates gain journal entry with correct account", () => {
      const fxResult = computeFxGainLoss("EUR", 1000, "2025-12-01", "2026-03-01");
      const journal = generateFxJournal("PO-001", "Ciment", fxResult, "2026-03-01", 1);
      expect(journal.id).toBe("VAR-FX-001");
      expect(journal.account).toContain("Gains de change");
      expect(journal.amount).toBe(fxResult.gainLossDZD);
      expect(journal.foreignCurrency).toBe("EUR");
    });

    it("generates loss journal entry with correct account", () => {
      const fxResult = computeFxGainLoss("EUR", 500, "2026-02-15", "2026-03-01");
      const journal = generateFxJournal("PO-002", "Huile", fxResult, "2026-03-01", 2);
      expect(journal.account).toContain("Pertes de change");
    });
  });

  describe("generateAutoRates", () => {
    it("generates correct number of rates", () => {
      const rates = generateAutoRates([{ from: "EUR", to: "DZD", baseRate: 146 }], "2026-01-01", 10);
      expect(rates).toHaveLength(10);
      rates.forEach((r) => {
        expect(r.fromCurrency).toBe("EUR");
        expect(r.toCurrency).toBe("DZD");
        expect(r.rateType).toBe("spot");
        expect(r.rate).toBeGreaterThan(0);
      });
    });

    it("generates rates for multiple pairs", () => {
      const rates = generateAutoRates(
        [
          { from: "EUR", to: "DZD", baseRate: 146 },
          { from: "USD", to: "DZD", baseRate: 135 },
        ],
        "2026-01-01",
        5
      );
      expect(rates).toHaveLength(10);
    });
  });
});
