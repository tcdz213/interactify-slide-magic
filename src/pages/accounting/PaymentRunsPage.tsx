import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Banknote, Play, CheckCircle, Clock, Download, Filter, Users, AlertTriangle } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type PaymentRunStatus = "draft" | "approved" | "submitted" | "cleared" | "reconciled";

interface PaymentRunLine {
  invoiceId: string;
  vendorName: string;
  invoiceAmount: number;
  discountAmount: number;
  paymentAmount: number;
  dueDate: string;
  currency: string;
}

interface PaymentRun {
  id: string;
  status: PaymentRunStatus;
  createdAt: string;
  dueDateFrom: string;
  dueDateTo: string;
  lines: PaymentRunLine[];
  totalAmount: number;
  totalDiscount: number;
  approvedBy?: string;
  submittedAt?: string;
}

function calculateDiscount(invoiceAmount: number, dueDate: string, paymentTerms: string): number {
  if (!paymentTerms.includes("Net")) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  const daysToDue = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (daysToDue > 20) return invoiceAmount * 0.02;
  return 0;
}

export default function PaymentRunsPage() {
  const { t } = useTranslation();
  const { invoices, payments, vendors } = useWMSData();
  const [runs, setRuns] = useState<PaymentRun[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [dueDateRange, setDueDateRange] = useState(7);
  const [selectedRun, setSelectedRun] = useState<PaymentRun | null>(null);
  const [minAmount, setMinAmount] = useState(1000);

  const APPROVAL_TIERS = [
    { max: 1000000, role: "AP Clerk", label: t("paymentRuns.autoApprove") },
    { max: 10000000, role: "AP Manager", label: "Responsable AP" },
    { max: 50000000, role: "Finance Controller", label: "Contrôleur financier" },
    { max: Infinity, role: "CFO", label: "Directeur financier" },
  ];

  function getApprovalTier(amount: number) {
    return APPROVAL_TIERS.find(tier => amount <= tier.max)!;
  }

  const eligibleInvoices = useMemo(() => {
    const inRuns = new Set(runs.flatMap(r => r.lines.map(l => l.invoiceId)));
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + dueDateRange);
    return invoices.filter(inv => {
      if (inRuns.has(inv.id)) return false;
      if (inv.status !== "Sent" && inv.status !== "Partially_Paid" && inv.status !== "Overdue") return false;
      if (inv.balance < minAmount) return false;
      const due = new Date(inv.dueDate);
      return due <= cutoff;
    });
  }, [invoices, runs, dueDateRange, minAmount]);

  const vendorGroups = useMemo(() => {
    const groups: Record<string, typeof eligibleInvoices> = {};
    for (const inv of eligibleInvoices) {
      const key = inv.customerName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(inv);
    }
    return groups;
  }, [eligibleInvoices]);

  const generateRun = () => {
    const lines: PaymentRunLine[] = [];
    for (const [vendorName, invs] of Object.entries(vendorGroups)) {
      const totalInv = invs.reduce((s, i) => s + i.balance, 0);
      const discount = invs.reduce((s, i) => s + calculateDiscount(i.balance, i.dueDate, i.paymentTerms), 0);
      lines.push({ invoiceId: invs.map(i => i.id).join(", "), vendorName, invoiceAmount: totalInv, discountAmount: discount, paymentAmount: totalInv - discount, dueDate: invs.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0].dueDate, currency: "DZD" });
    }
    if (lines.length === 0) { toast({ title: t("paymentRuns.noEligible"), variant: "destructive" }); return; }
    const totalAmount = lines.reduce((s, l) => s + l.paymentAmount, 0);
    const totalDiscount = lines.reduce((s, l) => s + l.discountAmount, 0);
    const run: PaymentRun = { id: `PAYRUN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(runs.length + 1).padStart(3, "0")}`, status: "draft", createdAt: new Date().toISOString(), dueDateFrom: new Date().toISOString().slice(0, 10), dueDateTo: new Date(Date.now() + dueDateRange * 86400000).toISOString().slice(0, 10), lines, totalAmount, totalDiscount };
    setRuns(prev => [...prev, run]);
    setShowGenerate(false);
    toast({ title: t("paymentRuns.batchGenerated"), description: t("paymentRuns.batchDesc", { id: run.id, count: lines.length, amount: currency(totalAmount) }) });
  };

  const approveRun = (runId: string) => {
    setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: "approved" as const, approvedBy: "Finance Controller" } : r));
    toast({ title: t("paymentRuns.batchApproved") });
  };

  const submitRun = (runId: string) => {
    setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: "submitted" as const, submittedAt: new Date().toISOString() } : r));
    toast({ title: t("paymentRuns.batchSubmitted") });
  };

  const exportSepa = (run: PaymentRun) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr><MsgId>${run.id}</MsgId><CreDtTm>${new Date().toISOString()}</CreDtTm><NbOfTxs>${run.lines.length}</NbOfTxs><CtrlSum>${run.totalAmount}</CtrlSum></GrpHdr>
${run.lines.map(l => `    <PmtInf><PmtInfId>${l.invoiceId.split(",")[0]}</PmtInfId><Cdtr><Nm>${l.vendorName}</Nm></Cdtr><Amt><InstdAmt Ccy="${l.currency}">${l.paymentAmount}</InstdAmt></Amt></PmtInf>`).join("\n")}
  </CstmrCdtTrfInitn>
</Document>`;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.id}_SEPA.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("paymentRuns.sepaExported") });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Banknote className="h-6 w-6 text-primary" /> {t("paymentRuns.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("paymentRuns.subtitle")}</p>
        </div>
        <Button onClick={() => setShowGenerate(true)}><Play className="h-4 w-4 mr-2" /> {t("paymentRuns.generateBatch")}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("paymentRuns.eligibleInvoices")}</div><div className="text-2xl font-bold">{eligibleInvoices.length}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("paymentRuns.amountToPay")}</div><div className="text-2xl font-bold">{currency(eligibleInvoices.reduce((s, i) => s + i.balance, 0))}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("paymentRuns.activeBatches")}</div><div className="text-2xl font-bold">{runs.filter(r => r.status !== "reconciled").length}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">{t("paymentRuns.vendors")}</div><div className="text-2xl font-bold">{Object.keys(vendorGroups).length}</div></CardContent></Card>
      </div>

      <div className="bg-muted/40 rounded-lg p-3">
        <h3 className="text-sm font-medium mb-2">{t("paymentRuns.approvalMatrix")}</h3>
        <div className="flex flex-wrap gap-3 text-xs">
          {APPROVAL_TIERS.map((tier, i) => (
            <span key={i} className="bg-background border rounded px-2 py-1">
              ≤ {tier.max === Infinity ? "∞" : currency(tier.max)} → <strong>{tier.label}</strong>
            </span>
          ))}
        </div>
      </div>

      {runs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("paymentRuns.paymentBatches")}</h2>
          <div className="space-y-3">
            {runs.map(run => {
              const tier = getApprovalTier(run.totalAmount);
              return (
                <div key={run.id} className="border rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono font-bold">{run.id}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${run.status === "draft" ? "bg-gray-100 text-gray-800" : run.status === "approved" ? "bg-emerald-100 text-emerald-800" : run.status === "submitted" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                        {run.status === "draft" ? t("paymentRuns.draft") : run.status === "approved" ? t("paymentRuns.approved") : run.status === "submitted" ? t("paymentRuns.submitted") : run.status}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">{t("paymentRuns.approvalRequired")} {tier.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {run.status === "draft" && <Button size="sm" onClick={() => approveRun(run.id)}><CheckCircle className="h-4 w-4 mr-1" /> {t("paymentRuns.approve")}</Button>}
                      {run.status === "approved" && <Button size="sm" onClick={() => submitRun(run.id)}><Banknote className="h-4 w-4 mr-1" /> {t("paymentRuns.submitToBank")}</Button>}
                      {(run.status === "approved" || run.status === "submitted") && <Button size="sm" variant="outline" onClick={() => exportSepa(run)}><Download className="h-4 w-4 mr-1" /> {t("paymentRuns.sepaXml")}</Button>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div><span className="text-muted-foreground">Total:</span> <strong>{currency(run.totalAmount)}</strong></div>
                    <div><span className="text-muted-foreground">{t("paymentRuns.discount")}:</span> <strong>{currency(run.totalDiscount)}</strong></div>
                    <div><span className="text-muted-foreground">{t("paymentRuns.vendors")}:</span> <strong>{run.lines.length}</strong></div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedRun(run)}>{t("paymentRuns.viewDetails")}</Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {runs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Banknote className="mx-auto h-12 w-12 mb-3 opacity-40" />
          <p>{t("paymentRuns.noBatches")}</p>
          <p className="text-sm">{t("paymentRuns.noBatchesDesc")}</p>
        </div>
      )}

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("paymentRuns.generateTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("paymentRuns.dueWithin")}</label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background" value={dueDateRange} onChange={e => setDueDateRange(Number(e.target.value))}>
                <option value={7}>{t("paymentRuns.days7")}</option>
                <option value={14}>{t("paymentRuns.days14")}</option>
                <option value={30}>{t("paymentRuns.days30")}</option>
                <option value={60}>{t("paymentRuns.days60")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("paymentRuns.minAmount")}</label>
              <input type="number" className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background" value={minAmount} onChange={e => setMinAmount(Number(e.target.value))} />
            </div>
            <div className="bg-muted/40 rounded p-3 text-sm">
              <p>{t("paymentRuns.invoicesEligible", { count: eligibleInvoices.length, amount: currency(eligibleInvoices.reduce((s, i) => s + i.balance, 0)) })}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("paymentRuns.groupByVendor")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>{t("common.cancel", "Annuler")}</Button>
            <Button onClick={generateRun}>{t("paymentRuns.generate")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t("paymentRuns.batchDetail", { id: selectedRun?.id ?? "" })}</DialogTitle></DialogHeader>
          {selectedRun && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">{t("paymentRuns.vendor")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("paymentRuns.invoices")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("paymentRuns.grossAmount")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("paymentRuns.discount")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("paymentRuns.netToPay")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedRun.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{l.vendorName}</td>
                      <td className="px-3 py-2 text-xs font-mono max-w-[200px] truncate">{l.invoiceId}</td>
                      <td className="px-3 py-2 text-right font-mono">{currency(l.invoiceAmount)}</td>
                      <td className="px-3 py-2 text-right font-mono text-emerald-600">{l.discountAmount > 0 ? `-${currency(l.discountAmount)}` : "—"}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">{currency(l.paymentAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40 font-bold">
                  <tr>
                    <td className="px-3 py-2" colSpan={2}>Total</td>
                    <td className="px-3 py-2 text-right font-mono">{currency(selectedRun.lines.reduce((s, l) => s + l.invoiceAmount, 0))}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-600">{currency(selectedRun.totalDiscount)}</td>
                    <td className="px-3 py-2 text-right font-mono">{currency(selectedRun.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
