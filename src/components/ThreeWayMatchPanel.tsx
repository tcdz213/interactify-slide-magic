/**
 * Visual 3-Way Match Panel for GRN Detail Dialog.
 * Shows PO vs GRN vs Invoice variances with colored indicators.
 */
import { useMemo } from "react";
import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { currency } from "@/data/masterData";
import { performThreeWayMatch, formatMatchStatus, type ThreeWayMatchSummary, type MatchResult } from "@/lib/threeWayMatch";
import type { Grn, PurchaseOrder, Invoice } from "@/data/mockData";
import type { ProductUnitConversion } from "@/lib/unitConversion";

interface ThreeWayMatchPanelProps {
  grn: Grn;
  purchaseOrder?: PurchaseOrder;
  invoice?: Invoice;
  conversions: ProductUnitConversion[];
}

function StatusIcon({ status }: { status: MatchResult["status"] }) {
  switch (status) {
    case "matched": return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case "within_tolerance": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "mismatch": return <XCircle className="h-4 w-4 text-destructive" />;
  }
}

function VarianceBadge({ value, pct, invert }: { value: number; pct: number; invert?: boolean }) {
  const absPct = Math.abs(pct);
  let colorClass = "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
  if (absPct > 5) colorClass = "text-destructive bg-destructive/10";
  else if (absPct > 0.1) colorClass = "text-amber-600 bg-amber-50 dark:bg-amber-900/20";

  if (value === 0 && pct === 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>
      {value > 0 ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

export default function ThreeWayMatchPanel({ grn, purchaseOrder, invoice, conversions }: ThreeWayMatchPanelProps) {
  const matchResult = useMemo<ThreeWayMatchSummary | null>(() => {
    if (!purchaseOrder) return null;

    const poData = {
      id: purchaseOrder.id,
      taxAmount: (purchaseOrder as any).taxAmount ?? 0,
      lines: purchaseOrder.lines.map((l: any) => ({
        productId: l.productId,
        productName: l.productName,
        qty: l.qty,
        uom: l.uom,
        unitAbbr: l.unitAbbr,
        conversionFactor: l.conversionFactor,
        unitCost: l.unitCost,
        lineTotal: l.qty * l.unitCost,
      })),
    };

    const grnData = {
      id: grn.id,
      lines: grn.lines.map(l => ({
        productId: l.productId,
        productName: l.productName,
        orderedQty: l.orderedQty,
        receivedQty: l.receivedQty,
        rejectedQty: l.rejectedQty,
        unitAbbr: (l as any).unitAbbr,
        conversionFactor: (l as any).conversionFactor,
      })),
    };

    // For now, invoice matching is optional — pass null if no invoice linked
    const invData = invoice ? {
      id: invoice.id,
      taxAmount: invoice.taxAmount,
      lines: (invoice as any).lines?.map((l: any) => ({
        productId: l.productId,
        qty: l.qty,
        unitAbbr: l.unitAbbr,
        conversionFactor: l.conversionFactor,
        unitCost: l.unitCost,
        lineTotal: l.lineTotal ?? l.qty * l.unitCost,
      })) ?? [],
    } : null;

    return performThreeWayMatch(poData, grnData, invData, conversions);
  }, [grn, purchaseOrder, invoice, conversions]);

  if (!matchResult) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        PO introuvable — correspondance impossible
      </div>
    );
  }

  const overallFmt = formatMatchStatus(matchResult.overallStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          🔍 Rapprochement 3-Way Match
        </h4>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          matchResult.overallStatus === "matched" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
          matchResult.overallStatus === "within_tolerance" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
          "bg-destructive/10 text-destructive"
        }`}>
          <StatusIcon status={matchResult.overallStatus} />
          {overallFmt.label}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">PO Total</p>
          <p className="text-sm font-bold">{currency(matchResult.totalPoAmount)}</p>
          <p className="text-[10px] text-muted-foreground">{matchResult.totalPoBase} unités base</p>
        </div>
        <div className="rounded-lg border border-border/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">GRN Reçu</p>
          <p className="text-sm font-bold">{matchResult.totalGrnBase} unités base</p>
          <VarianceBadge value={matchResult.totalGrnBase - matchResult.totalPoBase} pct={matchResult.totalPoBase > 0 ? ((matchResult.totalGrnBase - matchResult.totalPoBase) / matchResult.totalPoBase) * 100 : 0} />
        </div>
        <div className="rounded-lg border border-border/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Facture</p>
          {matchResult.invoiceId ? (
            <>
              <p className="text-sm font-bold">{currency(matchResult.totalInvoiceAmount)}</p>
              <VarianceBadge value={matchResult.totalVarianceAmount} pct={matchResult.totalVariancePct} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">Non liée</p>
          )}
        </div>
      </div>

      {/* Tax row */}
      {matchResult.invoiceId && (
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
          matchResult.taxStatus === "matched" ? "bg-emerald-50 dark:bg-emerald-900/10" :
          matchResult.taxStatus === "within_tolerance" ? "bg-amber-50 dark:bg-amber-900/10" :
          "bg-destructive/5"
        }`}>
          <span className="flex items-center gap-1.5">
            <StatusIcon status={matchResult.taxStatus} />
            <span className="font-medium">Taxe</span>
          </span>
          <span>
            PO: {currency(matchResult.poTaxAmount)}
            <ArrowRight className="h-3 w-3 inline mx-1 text-muted-foreground" />
            Facture: {currency(matchResult.invoiceTaxAmount)}
            {matchResult.taxVariance > 0 && <span className="ml-1 text-destructive font-medium">(Δ {currency(matchResult.taxVariance)})</span>}
          </span>
        </div>
      )}

      {/* Per-line details */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2 text-muted-foreground">Produit</th>
              <th className="text-right px-3 py-2 text-muted-foreground">PO (base)</th>
              <th className="text-right px-3 py-2 text-muted-foreground">GRN (base)</th>
              <th className="text-center px-3 py-2 text-muted-foreground">Δ Qté</th>
              {matchResult.invoiceId && (
                <>
                  <th className="text-right px-3 py-2 text-muted-foreground">Inv. (base)</th>
                  <th className="text-center px-3 py-2 text-muted-foreground">Δ Prix</th>
                </>
              )}
              <th className="text-center px-3 py-2 text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody>
            {matchResult.lines.map(line => (
              <tr key={line.productId} className="border-b border-border/30 hover:bg-muted/10">
                <td className="px-3 py-2 font-medium">{line.productName}</td>
                <td className="px-3 py-2 text-right font-mono">{line.poBaseQty}</td>
                <td className="px-3 py-2 text-right font-mono">{line.grnBaseQty}</td>
                <td className="px-3 py-2 text-center">
                  <VarianceBadge value={line.grnVariance} pct={line.grnVariancePct} />
                </td>
                {matchResult.invoiceId && (
                  <>
                    <td className="px-3 py-2 text-right font-mono">{line.invoiceBaseQty || "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <VarianceBadge value={line.priceVariance} pct={line.priceVariancePct} />
                    </td>
                  </>
                )}
                <td className="px-3 py-2 text-center">
                  <StatusIcon status={line.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issues */}
      {matchResult.lines.some(l => l.issues.length > 0) && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Observations</p>
          {matchResult.lines.filter(l => l.issues.length > 0).map(l => (
            <div key={l.productId}>
              {l.issues.map((issue, i) => (
                <p key={i} className="text-[10px] text-amber-600 dark:text-amber-400/80">• {l.productName}: {issue}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
