/**
 * Phase 1 — E-06: 3-Way Match Engine (PO vs GRN vs Invoice)
 * All matching happens in BASE UNITS to eliminate unit confusion.
 * 
 * Business Rule BR-U12: 3-way match in base units
 */

import { toBaseUnits } from "./unitConversion";
import type { ProductUnitConversion } from "./unitConversion";

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
  // Variances
  grnVariance: number;       // grnBase - poBase
  grnVariancePct: number;    // % diff
  invoiceVariance: number;   // invoiceBase - poBase
  invoiceVariancePct: number;
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
  matchedAt?: string;
}

const DEFAULT_TOLERANCE_PCT = 5; // 5% variance tolerance (BR-U14)

/**
 * Convert a transaction line to base units using conversion data.
 */
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
  return qty; // assume already in base units
}

/**
 * Perform 3-way matching on a PO+GRN pair (and optional invoice).
 */
export function performThreeWayMatch(
  po: { id: string; lines: Array<{ productId: string; productName: string; qty: number; uom?: string; unitAbbr?: string; conversionFactor?: number; unitCost: number; lineTotal: number }> },
  grn: { id: string; lines: Array<{ productId: string; productName: string; orderedQty: number; receivedQty: number; rejectedQty: number; unitAbbr?: string; conversionFactor?: number }> },
  invoice: { id: string; lines: Array<{ productId: string; qty: number; unitAbbr?: string; conversionFactor?: number; unitCost: number; lineTotal: number }> } | null,
  conversions: ProductUnitConversion[],
  tolerancePct: number = DEFAULT_TOLERANCE_PCT
): ThreeWayMatchSummary {
  const matchLines: MatchResult[] = [];
  let totalPoBase = 0;
  let totalGrnBase = 0;
  let totalInvoiceBase = 0;

  for (const poLine of po.lines) {
    const poBase = resolveBaseQty(poLine.qty, poLine.unitAbbr ?? poLine.uom, poLine.productId, conversions, poLine.conversionFactor);
    totalPoBase += poBase;

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

    // Calculate variances
    const grnVariance = grnBase - poBase;
    const grnVariancePct = poBase > 0 ? (grnVariance / poBase) * 100 : 0;
    const invoiceVariance = invBase > 0 ? invBase - poBase : 0;
    const invoiceVariancePct = poBase > 0 && invBase > 0 ? (invoiceVariance / poBase) * 100 : 0;

    const issues: string[] = [];
    let status: MatchResult["status"] = "matched";

    // Check GRN variance
    if (Math.abs(grnVariancePct) > tolerancePct) {
      status = "mismatch";
      issues.push(`GRN variance ${grnVariancePct > 0 ? "+" : ""}${grnVariancePct.toFixed(1)}% dépasse la tolérance de ${tolerancePct}%`);
    } else if (Math.abs(grnVariancePct) > 0.1) {
      status = "within_tolerance";
      issues.push(`GRN variance ${grnVariancePct > 0 ? "+" : ""}${grnVariancePct.toFixed(1)}% — dans la tolérance`);
    }

    // Check invoice variance
    if (invBase > 0) {
      if (Math.abs(invoiceVariancePct) > tolerancePct) {
        status = "mismatch";
        issues.push(`Facture variance ${invoiceVariancePct > 0 ? "+" : ""}${invoiceVariancePct.toFixed(1)}% dépasse la tolérance`);
      } else if (Math.abs(invoiceVariancePct) > 0.1) {
        if (status !== "mismatch") status = "within_tolerance";
        issues.push(`Facture variance ${invoiceVariancePct > 0 ? "+" : ""}${invoiceVariancePct.toFixed(1)}%`);
      }
    }

    matchLines.push({
      productId: poLine.productId,
      productName: poLine.productName,
      poBaseQty: poBase,
      grnBaseQty: grnBase,
      invoiceBaseQty: invBase,
      grnVariance,
      grnVariancePct,
      invoiceVariance,
      invoiceVariancePct,
      status,
      issues,
    });
  }

  const overallStatus = matchLines.some(l => l.status === "mismatch")
    ? "mismatch"
    : matchLines.some(l => l.status === "within_tolerance")
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
    matchedAt: new Date().toISOString(),
  };
}

/**
 * Validate variance against tolerance threshold.
 * BR-U14: Variance > 5% requires manager approval.
 */
export function requiresManagerApproval(variancePct: number, tolerancePct: number = DEFAULT_TOLERANCE_PCT): boolean {
  return Math.abs(variancePct) > tolerancePct;
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
