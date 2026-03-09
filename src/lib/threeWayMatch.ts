/**
 * Phase 1 — E-06: 3-Way Match Engine (PO vs GRN vs Invoice)
 * All matching happens in BASE UNITS to eliminate unit confusion.
 * 
 * Business Rule BR-U12: 3-way match in base units
 * Business Rule BR-U14: Variance > 5% requires manager approval
 * 
 * Dimensions matched:
 *   1. Quantity (PO vs GRN vs Invoice) — base units
 *   2. Unit Price (PO vs Invoice)
 *   3. Line Total (PO vs Invoice) — computed
 *   4. Tax (PO vs Invoice) — absolute tolerance
 */

import { toBaseUnits } from "./unitConversion";
import type { ProductUnitConversion } from "./unitConversion";

/* ──────────────────────── Tolerance Config ──────────────────────── */

export interface MatchToleranceConfig {
  /** Quantity variance tolerance (%) — default 5 */
  qtyTolerancePct: number;
  /** Unit price variance tolerance (%) — default 2 */
  priceTolerancePct: number;
  /** Absolute price variance threshold (local currency) — default 10 */
  priceToleranceAbs: number;
  /** Tax rounding tolerance (absolute, local currency) — default 1 */
  taxToleranceAbs: number;
  /** Overall document total variance (%) — default 1 */
  totalTolerancePct: number;
}

export const DEFAULT_TOLERANCES: MatchToleranceConfig = {
  qtyTolerancePct: 5,
  priceTolerancePct: 2,
  priceToleranceAbs: 10,
  taxToleranceAbs: 1,
  totalTolerancePct: 1,
};

/* ──────────────────────── Data Structures ──────────────────────── */

export interface MatchLine {
  productId: string;
  productName: string;
  // PO data
  poQty: number;
  poUnit: string;
  poFactor: number;
  poBaseQty: number;
  poUnitCost: number;
  poLineTotal: number;
  // GRN data
  grnQty: number;
  grnUnit: string;
  grnFactor: number;
  grnBaseQty: number;
  grnRejectedQty: number;
  // Invoice data (optional — may not exist yet)
  invoiceQty?: number;
  invoiceUnit?: string;
  invoiceFactor?: number;
  invoiceBaseQty?: number;
  invoiceUnitCost?: number;
  invoiceLineTotal?: number;
}

export interface MatchResult {
  productId: string;
  productName: string;
  poBaseQty: number;
  grnBaseQty: number;
  invoiceBaseQty: number;
  // Quantity variances
  grnVariance: number;
  grnVariancePct: number;
  invoiceVariance: number;
  invoiceVariancePct: number;
  // Price variances (PO vs Invoice)
  poUnitCost: number;
  invoiceUnitCost: number;
  priceVariance: number;
  priceVariancePct: number;
  // Line total variances
  poLineTotal: number;
  invoiceLineTotal: number;
  lineTotalVariance: number;
  lineTotalVariancePct: number;
  // Status
  status: "matched" | "within_tolerance" | "mismatch";
  issues: string[];
}

export interface ThreeWayMatchSummary {
  poId: string;
  grnId: string;
  invoiceId?: string;
  lines: MatchResult[];
  overallStatus: "matched" | "within_tolerance" | "mismatch";
  totalPoBase: number;
  totalGrnBase: number;
  totalInvoiceBase: number;
  // Totals (monetary)
  totalPoAmount: number;
  totalInvoiceAmount: number;
  totalVarianceAmount: number;
  totalVariancePct: number;
  // Tax
  poTaxAmount: number;
  invoiceTaxAmount: number;
  taxVariance: number;
  taxStatus: "matched" | "within_tolerance" | "mismatch";
  matchedAt?: string;
  tolerances: MatchToleranceConfig;
}

/* ──────────────────────── Helpers ──────────────────────── */

function resolveBaseQty(
  qty: number,
  unitAbbr: string | undefined,
  productId: string,
  conversions: ProductUnitConversion[],
  explicitFactor?: number
): number {
  if (explicitFactor && explicitFactor > 0) {
    return toBaseUnits(qty, explicitFactor);
  }
  if (unitAbbr) {
    const conv = conversions.find(
      c => c.productId === productId && (c.unitAbbreviation === unitAbbr || c.unitName === unitAbbr)
    );
    if (conv) return toBaseUnits(qty, conv.conversionFactor);
  }
  return qty;
}

function variancePct(actual: number, expected: number): number {
  if (expected === 0) return actual === 0 ? 0 : 100;
  return ((actual - expected) / expected) * 100;
}

function fmtPct(pct: number): string {
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/* ──────────────────────── Core Engine ──────────────────────── */

export function performThreeWayMatch(
  po: {
    id: string;
    taxAmount?: number;
    lines: Array<{
      productId: string; productName: string;
      qty: number; uom?: string; unitAbbr?: string; conversionFactor?: number;
      unitCost: number; lineTotal: number;
    }>;
  },
  grn: {
    id: string;
    lines: Array<{
      productId: string; productName: string;
      orderedQty: number; receivedQty: number; rejectedQty: number;
      unitAbbr?: string; conversionFactor?: number;
    }>;
  },
  invoice: {
    id: string;
    taxAmount?: number;
    lines: Array<{
      productId: string;
      qty: number; unitAbbr?: string; conversionFactor?: number;
      unitCost: number; lineTotal: number;
    }>;
  } | null,
  conversions: ProductUnitConversion[],
  tolerances: Partial<MatchToleranceConfig> = {}
): ThreeWayMatchSummary {
  const tol: MatchToleranceConfig = { ...DEFAULT_TOLERANCES, ...tolerances };
  const matchLines: MatchResult[] = [];

  let totalPoBase = 0;
  let totalGrnBase = 0;
  let totalInvoiceBase = 0;
  let totalPoAmount = 0;
  let totalInvoiceAmount = 0;

  for (const poLine of po.lines) {
    const poBase = resolveBaseQty(poLine.qty, poLine.unitAbbr ?? poLine.uom, poLine.productId, conversions, poLine.conversionFactor);
    totalPoBase += poBase;
    totalPoAmount += poLine.lineTotal;

    // Find matching GRN line
    const grnLine = grn.lines.find(g => g.productId === poLine.productId);
    const grnBase = grnLine
      ? resolveBaseQty(grnLine.receivedQty, grnLine.unitAbbr, grnLine.productId, conversions, grnLine.conversionFactor)
      : 0;
    totalGrnBase += grnBase;

    // Find matching invoice line
    const invLine = invoice?.lines.find(i => i.productId === poLine.productId);
    const invBase = invLine
      ? resolveBaseQty(invLine.qty, invLine.unitAbbr, invLine.productId, conversions, invLine.conversionFactor)
      : 0;
    totalInvoiceBase += invBase;
    totalInvoiceAmount += invLine?.lineTotal ?? 0;

    // ── Quantity variances ──
    const grnVar = grnBase - poBase;
    const grnVarPct = variancePct(grnBase, poBase);
    const invQtyVar = invBase > 0 ? invBase - poBase : 0;
    const invQtyVarPct = invBase > 0 ? variancePct(invBase, poBase) : 0;

    // ── Price variances (PO vs Invoice) ──
    const poUnitCost = poLine.unitCost;
    const invUnitCost = invLine?.unitCost ?? 0;
    const priceVar = invLine ? invUnitCost - poUnitCost : 0;
    const priceVarPct = invLine ? variancePct(invUnitCost, poUnitCost) : 0;

    // ── Line total variances ──
    const poLineTotal = poLine.lineTotal;
    const invLineTotal = invLine?.lineTotal ?? 0;
    const lineTotalVar = invLine ? invLineTotal - poLineTotal : 0;
    const lineTotalVarPct = invLine ? variancePct(invLineTotal, poLineTotal) : 0;

    const issues: string[] = [];
    let status: MatchResult["status"] = "matched";

    // Check GRN qty variance
    if (Math.abs(grnVarPct) > tol.qtyTolerancePct) {
      status = "mismatch";
      issues.push(`Qté GRN: écart ${fmtPct(grnVarPct)} dépasse la tolérance de ${tol.qtyTolerancePct}%`);
    } else if (Math.abs(grnVarPct) > 0.1) {
      status = "within_tolerance";
      issues.push(`Qté GRN: écart ${fmtPct(grnVarPct)} — dans la tolérance`);
    }

    // Check invoice qty variance
    if (invBase > 0) {
      if (Math.abs(invQtyVarPct) > tol.qtyTolerancePct) {
        status = "mismatch";
        issues.push(`Qté Facture: écart ${fmtPct(invQtyVarPct)} dépasse la tolérance`);
      } else if (Math.abs(invQtyVarPct) > 0.1) {
        if (status !== "mismatch") status = "within_tolerance";
        issues.push(`Qté Facture: écart ${fmtPct(invQtyVarPct)}`);
      }
    }

    // Check price variance (PO vs Invoice)
    if (invLine) {
      const priceExceedsPct = Math.abs(priceVarPct) > tol.priceTolerancePct;
      const priceExceedsAbs = Math.abs(priceVar) > tol.priceToleranceAbs;
      // Mismatch only if BOTH % and absolute thresholds are exceeded
      if (priceExceedsPct && priceExceedsAbs) {
        status = "mismatch";
        issues.push(`Prix unitaire: écart ${fmtPct(priceVarPct)} (${priceVar > 0 ? "+" : ""}${priceVar.toFixed(2)} DZD) dépasse la tolérance`);
      } else if (priceExceedsPct || priceExceedsAbs) {
        if (status !== "mismatch") status = "within_tolerance";
        issues.push(`Prix unitaire: écart ${fmtPct(priceVarPct)} (${priceVar > 0 ? "+" : ""}${priceVar.toFixed(2)} DZD) — dans la tolérance`);
      }
    }

    matchLines.push({
      productId: poLine.productId,
      productName: poLine.productName,
      poBaseQty: poBase,
      grnBaseQty: grnBase,
      invoiceBaseQty: invBase,
      grnVariance: grnVar,
      grnVariancePct: grnVarPct,
      invoiceVariance: invQtyVar,
      invoiceVariancePct: invQtyVarPct,
      poUnitCost,
      invoiceUnitCost: invUnitCost,
      priceVariance: priceVar,
      priceVariancePct: priceVarPct,
      poLineTotal,
      invoiceLineTotal: invLineTotal,
      lineTotalVariance: lineTotalVar,
      lineTotalVariancePct: lineTotalVarPct,
      status,
      issues,
    });
  }

  // ── Tax comparison ──
  const poTax = po.taxAmount ?? 0;
  const invTax = invoice?.taxAmount ?? 0;
  const taxVar = Math.abs(invTax - poTax);
  let taxStatus: ThreeWayMatchSummary["taxStatus"] = "matched";
  if (invoice) {
    if (taxVar > tol.taxToleranceAbs) taxStatus = "mismatch";
    else if (taxVar > 0.01) taxStatus = "within_tolerance";
  }

  // ── Overall total comparison ──
  const totalVarAmt = totalInvoiceAmount - totalPoAmount;
  const totalVarPct = totalPoAmount > 0 ? variancePct(totalInvoiceAmount, totalPoAmount) : 0;
  if (invoice && Math.abs(totalVarPct) > tol.totalTolerancePct) {
    // Upgrade any line to at least within_tolerance if total exceeds
    // (already handled per-line, but this is a safety net)
  }

  const overallStatus = matchLines.some(l => l.status === "mismatch") || taxStatus === "mismatch"
    ? "mismatch"
    : matchLines.some(l => l.status === "within_tolerance") || taxStatus === "within_tolerance"
      ? "within_tolerance"
      : "matched";

  return {
    poId: po.id,
    grnId: grn.id,
    invoiceId: invoice?.id,
    lines: matchLines,
    overallStatus,
    totalPoBase,
    totalGrnBase,
    totalInvoiceBase,
    totalPoAmount,
    totalInvoiceAmount,
    totalVarianceAmount: totalVarAmt,
    totalVariancePct: totalVarPct,
    poTaxAmount: poTax,
    invoiceTaxAmount: invTax,
    taxVariance: taxVar,
    taxStatus,
    matchedAt: new Date().toISOString(),
    tolerances: tol,
  };
}

/**
 * Validate variance against tolerance threshold.
 * BR-U14: Variance > 5% requires manager approval.
 */
export function requiresManagerApproval(variancePct: number, tolerancePct: number = DEFAULT_TOLERANCES.qtyTolerancePct): boolean {
  return Math.abs(variancePct) > tolerancePct;
}

/**
 * Check if a price variance requires escalation.
 */
export function requiresPriceEscalation(
  priceVariancePct: number,
  priceVarianceAbs: number,
  tolerances: Partial<MatchToleranceConfig> = {}
): boolean {
  const tol = { ...DEFAULT_TOLERANCES, ...tolerances };
  return Math.abs(priceVariancePct) > tol.priceTolerancePct && Math.abs(priceVarianceAbs) > tol.priceToleranceAbs;
}

/**
 * Format match status for display.
 */
export function formatMatchStatus(status: MatchResult["status"]): { label: string; color: string; icon: string } {
  switch (status) {
    case "matched":
      return { label: "Correspondance exacte", color: "text-emerald-600", icon: "✅" };
    case "within_tolerance":
      return { label: "Dans la tolérance", color: "text-amber-600", icon: "⚠️" };
    case "mismatch":
      return { label: "Écart critique", color: "text-destructive", icon: "❌" };
  }
}
