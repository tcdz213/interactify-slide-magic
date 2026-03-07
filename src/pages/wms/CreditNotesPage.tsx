import { useMemo, useState } from "react";
import { CreditCard, Plus, Eye, CheckCircle, XCircle, Search, FileText } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import type { CreditNote, CreditNoteStatus, CreditNoteType } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function CreditNotesPage() {
  const { t } = useTranslation();
  const { creditNotes, setCreditNotes, returns } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState<CreditNote | null>(null);

  const DOC_TYPE_LABELS: Record<CreditNoteType, string> = {
    Vendor_Credit: t("creditNotes.typeVendorCredit"),
    Vendor_Debit: t("creditNotes.typeVendorDebit"),
    Customer_Credit: t("creditNotes.typeCustomerCredit"),
    Customer_Debit: t("creditNotes.typeCustomerDebit"),
  };

  const STATUS_LABELS: Record<CreditNoteStatus, string> = {
    Draft: t("creditNotes.statusDraft"),
    Validated: t("creditNotes.statusValidated"),
    Posted: t("creditNotes.statusPosted"),
    Applied: t("creditNotes.statusApplied"),
    Cancelled: t("creditNotes.statusCancelled"),
    Refunded: t("creditNotes.statusRefunded"),
  };

  const filtered = useMemo(() => creditNotes.filter((cn: CreditNote) => {
    if (filterType !== "all" && cn.documentType !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return cn.id.toLowerCase().includes(s) || cn.partyName.toLowerCase().includes(s) || cn.referenceId.toLowerCase().includes(s);
    }
    return true;
  }), [creditNotes, search, filterType]);

  const stats = useMemo(() => ({
    total: creditNotes.length,
    draft: creditNotes.filter((c: CreditNote) => c.status === "Draft").length,
    posted: creditNotes.filter((c: CreditNote) => c.status === "Posted" || c.status === "Applied").length,
    totalValue: creditNotes.reduce((s: number, c: CreditNote) => s + c.totalAmount, 0),
  }), [creditNotes]);

  const advanceStatus = (id: string, newStatus: CreditNoteStatus) => {
    setCreditNotes((prev: CreditNote[]) => prev.map(cn => cn.id === id ? { ...cn, status: newStatus } : cn));
    toast({ title: t("creditNotes.statusAdvanced", { status: STATUS_LABELS[newStatus] }), description: id });
    if (selected?.id === id) setSelected(null);
  };

  const generateFromReturn = (returnId: string) => {
    const ret = returns.find((r: any) => r.id === returnId);
    if (!ret) return;
    const existing = creditNotes.find((cn: CreditNote) => cn.referenceId === returnId);
    if (existing) {
      toast({ title: t("creditNotes.alreadyExists"), description: existing.id, variant: "destructive" });
      return;
    }
    const isCustomer = ret.type === "Customer";
    const netValue = ret.netCredit ?? ret.totalValue;
    const taxAmount = Math.round(netValue * 0.19);
    const newCN: CreditNote = {
      id: `CN-${String(creditNotes.length + 1).padStart(3, "0")}`,
      documentType: isCustomer ? "Customer_Credit" : "Vendor_Credit",
      partyId: ret.partyId || "",
      partyName: ret.partyName,
      referenceType: "Return",
      referenceId: ret.id,
      date: new Date().toISOString().slice(0, 10),
      lines: ret.items.map((item: any, idx: number) => ({
        lineId: idx + 1,
        productId: item.productId,
        productName: item.productName,
        qty: item.qty,
        unitPrice: item.unitCost || 0,
        lineTotal: item.lineValue || item.qty * (item.unitCost || 0),
        taxRate: 19,
        taxAmount: Math.round((item.lineValue || item.qty * (item.unitCost || 0)) * 0.19),
      })),
      subtotal: netValue,
      taxAmount,
      totalAmount: netValue + taxAmount,
      status: "Draft",
      createdBy: "Système",
      notes: `Auto-généré depuis ${ret.id}`,
    };
    setCreditNotes((prev: CreditNote[]) => [newCN, ...prev]);
    toast({ title: t("creditNotes.creditNoteCreated"), description: `${newCN.id} — ${currency(newCN.totalAmount)}` });
  };

  const returnsWithoutCN = useMemo(() => {
    const cnRefIds = new Set(creditNotes.map((cn: CreditNote) => cn.referenceId));
    return returns.filter((r: any) => (r.status === "Processed" || r.status === "Credited") && !cnRefIds.has(r.id));
  }, [returns, creditNotes]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("creditNotes.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("creditNotes.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("creditNotes.total")}</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("creditNotes.drafts")}</p>
          <p className="text-xl font-semibold text-warning">{stats.draft}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("creditNotes.posted")}</p>
          <p className="text-xl font-semibold text-success">{stats.posted}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("creditNotes.totalValue")}</p>
          <p className="text-xl font-semibold text-primary">{currency(stats.totalValue)}</p>
        </div>
      </div>

      {returnsWithoutCN.length > 0 && (
        <div className="glass-card rounded-lg p-3 border border-warning/30 bg-warning/5">
          <p className="text-sm font-medium mb-2">{t("creditNotes.returnsWithoutCN", { count: returnsWithoutCN.length })}</p>
          <div className="flex flex-wrap gap-2">
            {returnsWithoutCN.slice(0, 5).map((r: any) => (
              <Button key={r.id} variant="outline" size="sm" onClick={() => generateFromReturn(r.id)}>
                <FileText className="h-3 w-3 mr-1" /> {r.id} — {r.partyName}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("creditNotes.search")} value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm" />
        </div>
        {(["all", "Customer_Credit", "Vendor_Credit", "Vendor_Debit", "Customer_Debit"] as const).map(typ => (
          <button key={typ} onClick={() => setFilterType(typ)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === typ ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {typ === "all" ? t("creditNotes.all") : DOC_TYPE_LABELS[typ as CreditNoteType]}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CreditCard className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("creditNotes.noCreditNotes")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colId")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colType")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colParty")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colRef")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colDate")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colSubtotal")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colTax")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colTotal")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colStatus")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("creditNotes.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cn: CreditNote) => (
                <tr key={cn.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{cn.id}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cn.documentType.includes("Credit") ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {DOC_TYPE_LABELS[cn.documentType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{cn.partyName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cn.referenceId}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{cn.date}</td>
                  <td className="px-4 py-3 text-right">{currency(cn.subtotal)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{currency(cn.taxAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium">{currency(cn.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={cn.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelected(cn)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title={t("creditNotes.colActions")}>
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {cn.status === "Draft" && (
                        <button onClick={() => advanceStatus(cn.id, "Validated")} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title={t("creditNotes.validate")}>
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        </button>
                      )}
                      {cn.status === "Validated" && (
                        <button onClick={() => advanceStatus(cn.id, "Posted")} className="p-1.5 rounded-md hover:bg-primary/10 transition-colors" title={t("creditNotes.post")}>
                          <FileText className="h-3.5 w-3.5 text-primary" />
                        </button>
                      )}
                      {cn.status === "Posted" && (
                        <button onClick={() => advanceStatus(cn.id, "Applied")} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title={t("creditNotes.apply")}>
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono">{selected.id}</span>
                  <StatusBadge status={selected.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("creditNotes.detailType")}</span> <span className="font-medium">{DOC_TYPE_LABELS[selected.documentType]}</span></div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailParty")}</span> <span className="font-medium">{selected.partyName}</span></div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailRef")}</span> <span className="font-mono">{selected.referenceId}</span></div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailDate")}</span> {selected.date}</div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailSubtotal")}</span> <span className="font-medium">{currency(selected.subtotal)}</span></div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailTax")}</span> {currency(selected.taxAmount)}</div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailTotal")}</span> <span className="font-bold text-primary">{currency(selected.totalAmount)}</span></div>
                <div><span className="text-muted-foreground">{t("creditNotes.detailCreatedBy")}</span> {selected.createdBy}</div>
                {selected.notes && <div className="col-span-2"><span className="text-muted-foreground">{t("creditNotes.detailNotes")}</span> {selected.notes}</div>}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-semibold mb-2">{t("creditNotes.journalPreview")}</h4>
                {selected.documentType === "Customer_Credit" ? (
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="text-left py-1">{t("supplierReturns.colAccount")}</th><th className="text-right py-1">{t("supplierReturns.colDebit")}</th><th className="text-right py-1">{t("supplierReturns.colCredit")}</th></tr></thead>
                    <tbody>
                      <tr><td className="py-1">7050 — Retours sur ventes</td><td className="text-right">{currency(selected.subtotal)}</td><td className="text-right">—</td></tr>
                      <tr><td className="py-1">3400 — Clients (AR)</td><td className="text-right">—</td><td className="text-right">{currency(selected.subtotal)}</td></tr>
                      <tr><td className="py-1">3400 — Clients (TVA)</td><td className="text-right">{currency(selected.taxAmount)}</td><td className="text-right">—</td></tr>
                      <tr><td className="py-1">4470 — TVA collectée</td><td className="text-right">—</td><td className="text-right">{currency(selected.taxAmount)}</td></tr>
                    </tbody>
                  </table>
                ) : selected.documentType === "Vendor_Credit" ? (
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="text-left py-1">{t("supplierReturns.colAccount")}</th><th className="text-right py-1">{t("supplierReturns.colDebit")}</th><th className="text-right py-1">{t("supplierReturns.colCredit")}</th></tr></thead>
                    <tbody>
                      <tr><td className="py-1">4010 — Fournisseurs (AP)</td><td className="text-right">{currency(selected.subtotal)}</td><td className="text-right">—</td></tr>
                      <tr><td className="py-1">4080 — GRNI / Charges à payer</td><td className="text-right">—</td><td className="text-right">{currency(selected.subtotal)}</td></tr>
                      <tr><td className="py-1">4450 — TVA déductible</td><td className="text-right">{currency(selected.taxAmount)}</td><td className="text-right">—</td></tr>
                      <tr><td className="py-1">4010 — Fournisseurs (TVA)</td><td className="text-right">—</td><td className="text-right">{currency(selected.taxAmount)}</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("creditNotes.debitNoteJournal")}</p>
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">{t("creditNotes.lines")}</h4>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border"><th className="text-left py-2 px-2">{t("creditNotes.colProduct")}</th><th className="text-right py-2 px-2">{t("creditNotes.colQty")}</th><th className="text-right py-2 px-2">{t("creditNotes.colUnitPrice")}</th><th className="text-right py-2 px-2">{t("creditNotes.colLineTotal")}</th><th className="text-right py-2 px-2">{t("creditNotes.colLineTax")}</th></tr></thead>
                  <tbody>
                    {selected.lines.map(line => (
                      <tr key={line.lineId} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{line.productName}</td>
                        <td className="py-2 px-2 text-right">{line.qty}</td>
                        <td className="py-2 px-2 text-right">{currency(line.unitPrice)}</td>
                        <td className="py-2 px-2 text-right">{currency(line.lineTotal)}</td>
                        <td className="py-2 px-2 text-right text-muted-foreground">{currency(line.taxAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-2">
                {selected.status === "Draft" && <Button size="sm" onClick={() => advanceStatus(selected.id, "Validated")}>{t("creditNotes.validate")}</Button>}
                {selected.status === "Validated" && <Button size="sm" onClick={() => advanceStatus(selected.id, "Posted")}>{t("creditNotes.post")}</Button>}
                {selected.status === "Posted" && <Button size="sm" onClick={() => advanceStatus(selected.id, "Applied")}>{t("creditNotes.applyToInvoice")}</Button>}
                {selected.status !== "Cancelled" && selected.status !== "Applied" && selected.status !== "Refunded" && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => advanceStatus(selected.id, "Cancelled")}>{t("creditNotes.cancelNote")}</Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}