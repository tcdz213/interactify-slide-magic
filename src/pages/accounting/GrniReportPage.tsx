import { useMemo } from "react";
import { FileText, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrniEntry {
  poId: string;
  grnId: string;
  vendorName: string;
  productName: string;
  grnAmount: number;
  invoicedAmount: number;
  grniBalance: number;
  grnDate: string;
  status: "accrued" | "cleared" | "over_invoiced";
}

interface VarianceJournal {
  id: string;
  type: "PPV" | "IPV" | "QTY" | "FX";
  account: string;
  poId: string;
  productName: string;
  amount: number;
  date: string;
  description: string;
  foreignCurrency?: string;
  transactionRate?: number;
  settlementRate?: number;
}

export default function GrniReportPage() {
  const { grns, purchaseOrders, invoices, payments } = useWMSData();

  // Sprint 12: FX vendor mapping (vendors with foreign currency POs)
  const foreignVendors: Record<string, { currency: string; poRate: number; payRate: number }> = {
    "V007": { currency: "EUR", poRate: 146.30, payRate: 147.00 },
    "V008": { currency: "USD", poRate: 134.60, payRate: 135.20 },
  };

  const { grniEntries, varianceJournals, totalGrni, totalPpv, totalFx } = useMemo(() => {
    const entries: GrniEntry[] = [];
    const journals: VarianceJournal[] = [];
    let jIdx = 1;

    for (const grn of grns) {
      if (grn.status !== "Approved") continue;
      const po = purchaseOrders.find(p => p.id === grn.poId);
      if (!po) continue;

      const vendorFx = foreignVendors[po.vendorId];

      for (const line of grn.lines) {
        const acceptedQty = line.receivedQty - line.rejectedQty;
        const grnAmount = acceptedQty * line.unitCost;
        
        const inv = invoices.find(i => i.orderId === po.id);
        const poLine = po.lines.find(pl => pl.productId === line.productId);
        const invoicedAmount = inv ? (poLine?.lineTotal ?? 0) : 0;
        const grniBalance = grnAmount - invoicedAmount;

        entries.push({
          poId: po.id,
          grnId: grn.id,
          vendorName: grn.vendorName,
          productName: line.productName,
          grnAmount,
          invoicedAmount,
          grniBalance,
          grnDate: grn.receivedAt.split(" ")[0],
          status: grniBalance > 0 ? "accrued" : grniBalance < 0 ? "over_invoiced" : "cleared",
        });

        // PPV: invoice price vs standard cost
        if (inv && poLine && poLine.unitCost !== line.unitCost) {
          const ppvAmount = (poLine.unitCost - line.unitCost) * acceptedQty;
          journals.push({
            id: `VAR-PPV-${String(jIdx++).padStart(3, "0")}`,
            type: "PPV",
            account: "6500xx — Écart prix d'achat",
            poId: po.id,
            productName: line.productName,
            amount: ppvAmount,
            date: grn.receivedAt.split(" ")[0],
            description: `PO: ${poLine.unitCost} vs GRN: ${line.unitCost} × ${acceptedQty}`,
          });
        }

        // QTY variance
        if (poLine) {
          const orderedBase = poLine.qty * (poLine.conversionFactor ?? 1);
          const receivedBase = acceptedQty * (line.conversionFactor ?? 1);
          const diff = receivedBase - orderedBase;
          if (Math.abs(diff) > 0 && Math.abs(diff / orderedBase) > 0.02) {
            journals.push({
              id: `VAR-QTY-${String(jIdx++).padStart(3, "0")}`,
              type: "QTY",
              account: "6520xx — Écart quantité",
              poId: po.id,
              productName: line.productName,
              amount: diff * line.unitCost,
              date: grn.receivedAt.split(" ")[0],
              description: `Commandé: ${orderedBase} base, Reçu: ${receivedBase} base`,
            });
          }
        }

        // Sprint 12 — FX variance: PO rate vs invoice/payment rate
        if (vendorFx && inv) {
          const foreignAmount = grnAmount / vendorFx.poRate;
          const fxVariance = foreignAmount * (vendorFx.payRate - vendorFx.poRate);
          if (Math.abs(fxVariance) > 50) { // threshold: 50 DZD minimum
            const isGain = fxVariance >= 0;
            journals.push({
              id: `VAR-FX-${String(jIdx++).padStart(3, "0")}`,
              type: "FX",
              account: isGain ? "7560xx — Gains de change" : "7660xx — Pertes de change",
              poId: po.id,
              productName: line.productName,
              amount: fxVariance,
              date: grn.receivedAt.split(" ")[0],
              description: `${vendorFx.currency}: taux PO ${vendorFx.poRate} → règlement ${vendorFx.payRate}`,
              foreignCurrency: vendorFx.currency,
              transactionRate: vendorFx.poRate,
              settlementRate: vendorFx.payRate,
            });
          }
        }
      }
    }

    const totalGrni = entries.reduce((s, e) => s + Math.max(0, e.grniBalance), 0);
    const totalPpv = journals.filter(j => j.type === "PPV").reduce((s, j) => s + j.amount, 0);
    const totalFx = journals.filter(j => j.type === "FX").reduce((s, j) => s + j.amount, 0);

    return { grniEntries: entries, varianceJournals: journals, totalGrni, totalPpv, totalFx };
  }, [grns, purchaseOrders, invoices]);

  const accrued = grniEntries.filter(e => e.status === "accrued");
  const cleared = grniEntries.filter(e => e.status === "cleared");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> GRNI & Écritures de variance</h1>
        <p className="text-muted-foreground text-sm">Goods Received Not Invoiced — Rapprochement comptable et journaux de variance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Solde GRNI</div><div className="text-2xl font-bold">{currency(totalGrni)}</div><div className="text-xs text-muted-foreground">Biens reçus, factures en attente</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Entrées comptabilisées</div><div className="text-2xl font-bold text-amber-600">{accrued.length}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Entrées soldées</div><div className="text-2xl font-bold text-emerald-600">{cleared.length}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Total PPV</div><div className="text-2xl font-bold">{currency(Math.abs(totalPpv))}</div><div className="text-xs text-muted-foreground">Écart prix d'achat</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Variance FX</div><div className={`text-2xl font-bold ${totalFx >= 0 ? "text-emerald-600" : "text-destructive"}`}>{totalFx >= 0 ? "+" : ""}{currency(totalFx)}</div><div className="text-xs text-muted-foreground">Gains/pertes de change</div></CardContent></Card>
      </div>

      {/* GRNI Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Solde GRNI par ligne</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-3 py-2 text-left font-medium">PO</th>
                <th className="px-3 py-2 text-left font-medium">GRN</th>
                <th className="px-3 py-2 text-left font-medium">Fournisseur</th>
                <th className="px-3 py-2 text-left font-medium">Produit</th>
                <th className="px-3 py-2 text-right font-medium">Montant GRN</th>
                <th className="px-3 py-2 text-right font-medium">Montant facturé</th>
                <th className="px-3 py-2 text-right font-medium">Solde GRNI</th>
                <th className="px-3 py-2 text-center font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {grniEntries.map((e, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{e.poId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.grnId}</td>
                  <td className="px-3 py-2">{e.vendorName}</td>
                  <td className="px-3 py-2">{e.productName}</td>
                  <td className="px-3 py-2 text-right font-mono">{currency(e.grnAmount)}</td>
                  <td className="px-3 py-2 text-right font-mono">{currency(e.invoicedAmount)}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">{currency(e.grniBalance)}</td>
                  <td className="px-3 py-2 text-center">
                    {e.status === "accrued" && <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Provision</span>}
                    {e.status === "cleared" && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Soldé</span>}
                    {e.status === "over_invoiced" && <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Sur-facturé</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Journal entries */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Journaux de variance</h2>
        <p className="text-sm text-muted-foreground mb-3">Écritures générées automatiquement — PPV (prix), QTY (quantité), IPV (facture), FX (change)</p>
        {varianceJournals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
            <p>Aucune variance détectée</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-center font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Compte</th>
                  <th className="px-3 py-2 text-left font-medium">PO</th>
                  <th className="px-3 py-2 text-left font-medium">Produit</th>
                  <th className="px-3 py-2 text-right font-medium">Montant</th>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {varianceJournals.map(j => (
                  <tr key={j.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{j.id}</td>
                    <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${j.type === "PPV" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : j.type === "QTY" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : j.type === "FX" ? (j.amount >= 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300") : "bg-gray-100 text-gray-800"}`}>{j.type}</span></td>
                    <td className="px-3 py-2 text-xs">{j.account}</td>
                    <td className="px-3 py-2 font-mono text-xs">{j.poId}</td>
                    <td className="px-3 py-2">{j.productName}</td>
                    <td className="px-3 py-2 text-right font-mono">{currency(j.amount)}</td>
                    <td className="px-3 py-2 text-xs">{j.date}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[250px] truncate">{j.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accounting entries explanation */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-3">Schéma comptable</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Étape 2 — Réception (GRN)</CardTitle></CardHeader><CardContent className="text-xs space-y-1">
            <div className="flex justify-between"><span>DR Stocks (3100xx)</span><span className="font-mono">base_qty × coût std</span></div>
            <div className="flex justify-between"><span>CR GRNI (4080xx)</span><span className="font-mono">même montant</span></div>
          </CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Étape 3 — Facture comptabilisée</CardTitle></CardHeader><CardContent className="text-xs space-y-1">
            <div className="flex justify-between"><span>DR GRNI (4080xx)</span><span className="font-mono">solde la provision</span></div>
            <div className="flex justify-between"><span>DR TVA déductible (4450xx)</span><span className="font-mono">montant TVA</span></div>
            <div className="flex justify-between"><span>CR Fournisseurs (4010xx)</span><span className="font-mono">total TTC</span></div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
