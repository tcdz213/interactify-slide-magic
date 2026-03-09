/**
 * Phase 4 — Quantity Anomaly Detection Engine.
 * Detects suspicious order quantities to prevent human entry errors.
 * 
 * Checks: Volume spikes, capacity exceeded, unit switches,
 *         decimal on integer units, zero/negative quantities.
 */

// ── Types ──

export type AnomalyType =
  | "VOLUME_SPIKE"
  | "CAPACITY_EXCEEDED"
  | "UNIT_SWITCH"
  | "DECIMAL_ON_INTEGER"
  | "NEGATIVE"
  | "ZERO"
  | "MAX_ORDER_EXCEEDED";

export interface AnomalyCheck {
  type: AnomalyType;
  severity: "warning" | "blocking";
  message: string;
  details: {
    value: number;
    threshold?: number;
    expected?: string;
    actual?: string;
  };
}

export interface AnomalyConfig {
  volumeSpikeMultiplier: number;    // default: 3.0
  capacityCheckEnabled: boolean;     // default: true
  unitSwitchDetection: boolean;      // default: true
  minimumHistoryOrders: number;      // default: 5
}

export interface HistoricalOrder {
  baseQty: number;
  unitId: string;
  date: string;
}

export interface AnomalyContext {
  historicalOrders: HistoricalOrder[];
  warehouseCapacity?: number;        // in base units
  currentStock?: number;             // in base units
  unit: {
    isInteger?: boolean;
    unitAbbreviation: string;
  };
  maxSingleOrderBase?: number;       // from product threshold
  blockOnSpike?: boolean;
}

const DEFAULT_CONFIG: AnomalyConfig = {
  volumeSpikeMultiplier: 3.0,
  capacityCheckEnabled: true,
  unitSwitchDetection: true,
  minimumHistoryOrders: 5,
};

// ── Detection Engine ──

/**
 * Run all anomaly checks on a quantity/unit combination.
 * Returns array of detected anomalies (may be empty if all clear).
 */
export function detectAnomalies(
  productId: string,
  qty: number,
  unitId: string,
  conversionFactor: number,
  context: AnomalyContext,
  config: AnomalyConfig = DEFAULT_CONFIG
): AnomalyCheck[] {
  const anomalies: AnomalyCheck[] = [];
  const baseQty = qty * conversionFactor;

  // ── CHECK 1: Zero or negative ──
  if (qty <= 0) {
    anomalies.push({
      type: qty === 0 ? "ZERO" : "NEGATIVE",
      severity: "blocking",
      message: "La quantité doit être strictement positive",
      details: { value: qty },
    });
    return anomalies; // No point checking further
  }

  // ── CHECK 2: Decimal on integer unit ──
  if (context.unit.isInteger && !Number.isInteger(qty)) {
    anomalies.push({
      type: "DECIMAL_ON_INTEGER",
      severity: "blocking",
      message: `${context.unit.unitAbbreviation} exige un nombre entier`,
      details: { value: qty },
    });
  }

  // ── CHECK 3: Volume spike ──
  if (context.historicalOrders.length >= config.minimumHistoryOrders) {
    const avgBase = context.historicalOrders.reduce((s, o) => s + o.baseQty, 0)
                    / context.historicalOrders.length;
    if (avgBase > 0 && baseQty > avgBase * config.volumeSpikeMultiplier) {
      anomalies.push({
        type: "VOLUME_SPIKE",
        severity: context.blockOnSpike ? "blocking" : "warning",
        message: `Quantité ${(baseQty / avgBase).toFixed(1)}× supérieure à la moyenne historique`,
        details: { value: baseQty, threshold: avgBase * config.volumeSpikeMultiplier },
      });
    }
  }

  // ── CHECK 4: Max single order ──
  if (context.maxSingleOrderBase && baseQty > context.maxSingleOrderBase) {
    anomalies.push({
      type: "MAX_ORDER_EXCEEDED",
      severity: "warning",
      message: `Commande dépasse le max autorisé (${context.maxSingleOrderBase.toLocaleString("fr-FR")} unités base)`,
      details: { value: baseQty, threshold: context.maxSingleOrderBase },
    });
  }

  // ── CHECK 5: Warehouse capacity ──
  if (config.capacityCheckEnabled && context.warehouseCapacity) {
    if (baseQty > context.warehouseCapacity) {
      anomalies.push({
        type: "CAPACITY_EXCEEDED",
        severity: "blocking",
        message: `Commande dépasse la capacité entrepôt (${context.warehouseCapacity.toLocaleString("fr-FR")} unités base)`,
        details: { value: baseQty, threshold: context.warehouseCapacity },
      });
    }
  }

  // ── CHECK 6: Unusual unit switch ──
  if (config.unitSwitchDetection && context.historicalOrders.length >= config.minimumHistoryOrders) {
    const recentUnits = context.historicalOrders.slice(-10).map(o => o.unitId);
    const mostCommonUnit = mode(recentUnits);
    if (mostCommonUnit && unitId !== mostCommonUnit) {
      const switchCount = recentUnits.filter(u => u === unitId).length;
      if (switchCount === 0) {
        anomalies.push({
          type: "UNIT_SWITCH",
          severity: "warning",
          message: `Unité inhabituelle: ${context.unit.unitAbbreviation} (habituellement utilisée: ${mostCommonUnit})`,
          details: { value: qty, expected: mostCommonUnit, actual: unitId },
        });
      }
    }
  }

  return anomalies;
}

// ── Helpers ──

function mode(arr: string[]): string | null {
  const freq = new Map<string, number>();
  arr.forEach(v => freq.set(v, (freq.get(v) ?? 0) + 1));
  let max = 0;
  let result: string | null = null;
  freq.forEach((count, key) => {
    if (count > max) {
      max = count;
      result = key;
    }
  });
  return result;
}

/**
 * Check if any anomaly is blocking (prevents submission).
 */
export function hasBlockingAnomaly(anomalies: AnomalyCheck[]): boolean {
  return anomalies.some(a => a.severity === "blocking");
}

/**
 * Check if any anomaly requires user confirmation (warnings).
 */
export function hasWarningAnomaly(anomalies: AnomalyCheck[]): boolean {
  return anomalies.some(a => a.severity === "warning");
}

/**
 * Get user-friendly severity label.
 */
export function getAnomalySeverityLabel(severity: "warning" | "blocking"): string {
  return severity === "blocking" ? "⛔ Bloquant" : "⚠️ Avertissement";
}
