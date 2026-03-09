import { describe, it, expect } from "vitest";
import {
  detectAnomalies,
  hasBlockingAnomaly,
  hasWarningAnomaly,
  getAnomalySeverityLabel,
  type AnomalyContext,
} from "@/lib/qtyAnomalyDetector";

const baseContext: AnomalyContext = {
  historicalOrders: [],
  unit: { isInteger: false, unitAbbreviation: "kg" },
};

describe("qtyAnomalyDetector", () => {
  describe("zero/negative checks", () => {
    it("blocks zero quantity", () => {
      const anomalies = detectAnomalies("P1", 0, "kg", 1, baseContext);
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe("ZERO");
      expect(anomalies[0].severity).toBe("blocking");
    });

    it("blocks negative quantity", () => {
      const anomalies = detectAnomalies("P1", -5, "kg", 1, baseContext);
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe("NEGATIVE");
      expect(anomalies[0].severity).toBe("blocking");
    });
  });

  describe("decimal on integer unit", () => {
    it("blocks decimal on integer unit", () => {
      const ctx: AnomalyContext = { ...baseContext, unit: { isInteger: true, unitAbbreviation: "Sac" } };
      const anomalies = detectAnomalies("P1", 5.5, "Sac", 50, ctx);
      expect(anomalies.some((a) => a.type === "DECIMAL_ON_INTEGER")).toBe(true);
    });

    it("allows integer on integer unit", () => {
      const ctx: AnomalyContext = { ...baseContext, unit: { isInteger: true, unitAbbreviation: "Sac" } };
      const anomalies = detectAnomalies("P1", 5, "Sac", 50, ctx);
      expect(anomalies.some((a) => a.type === "DECIMAL_ON_INTEGER")).toBe(false);
    });
  });

  describe("volume spike", () => {
    const historyCtx: AnomalyContext = {
      ...baseContext,
      historicalOrders: Array.from({ length: 6 }, (_, i) => ({
        baseQty: 100,
        unitId: "kg",
        date: `2026-01-0${i + 1}`,
      })),
    };

    it("warns on volume spike (>3x average)", () => {
      const anomalies = detectAnomalies("P1", 400, "kg", 1, historyCtx);
      expect(anomalies.some((a) => a.type === "VOLUME_SPIKE")).toBe(true);
    });

    it("no spike for normal order", () => {
      const anomalies = detectAnomalies("P1", 200, "kg", 1, historyCtx);
      expect(anomalies.some((a) => a.type === "VOLUME_SPIKE")).toBe(false);
    });

    it("skips spike check with insufficient history", () => {
      const ctx: AnomalyContext = {
        ...baseContext,
        historicalOrders: [{ baseQty: 10, unitId: "kg", date: "2026-01-01" }],
      };
      const anomalies = detectAnomalies("P1", 10000, "kg", 1, ctx);
      expect(anomalies.some((a) => a.type === "VOLUME_SPIKE")).toBe(false);
    });
  });

  describe("max order exceeded", () => {
    it("warns when exceeding max single order", () => {
      const ctx: AnomalyContext = { ...baseContext, maxSingleOrderBase: 500 };
      const anomalies = detectAnomalies("P1", 600, "kg", 1, ctx);
      expect(anomalies.some((a) => a.type === "MAX_ORDER_EXCEEDED")).toBe(true);
    });
  });

  describe("capacity exceeded", () => {
    it("blocks when exceeding warehouse capacity", () => {
      const ctx: AnomalyContext = { ...baseContext, warehouseCapacity: 1000 };
      const anomalies = detectAnomalies("P1", 1100, "kg", 1, ctx);
      expect(anomalies.some((a) => a.type === "CAPACITY_EXCEEDED")).toBe(true);
      expect(anomalies.find((a) => a.type === "CAPACITY_EXCEEDED")!.severity).toBe("blocking");
    });
  });

  describe("unit switch detection", () => {
    it("warns on unusual unit switch", () => {
      const ctx: AnomalyContext = {
        ...baseContext,
        historicalOrders: Array.from({ length: 6 }, (_, i) => ({
          baseQty: 100,
          unitId: "kg",
          date: `2026-01-0${i + 1}`,
        })),
      };
      const anomalies = detectAnomalies("P1", 5, "Sac", 50, ctx);
      expect(anomalies.some((a) => a.type === "UNIT_SWITCH")).toBe(true);
    });
  });

  describe("helpers", () => {
    it("hasBlockingAnomaly detects blocking", () => {
      expect(hasBlockingAnomaly([{ type: "ZERO", severity: "blocking", message: "", details: { value: 0 } }])).toBe(true);
      expect(hasBlockingAnomaly([{ type: "VOLUME_SPIKE", severity: "warning", message: "", details: { value: 0 } }])).toBe(false);
    });

    it("hasWarningAnomaly detects warning", () => {
      expect(hasWarningAnomaly([{ type: "VOLUME_SPIKE", severity: "warning", message: "", details: { value: 0 } }])).toBe(true);
    });

    it("getAnomalySeverityLabel returns correct labels", () => {
      expect(getAnomalySeverityLabel("blocking")).toContain("Bloquant");
      expect(getAnomalySeverityLabel("warning")).toContain("Avertissement");
    });
  });
});