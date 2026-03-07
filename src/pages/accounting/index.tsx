import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Receipt, CreditCard, FileText, Eye, Search, Send, Download, AlertTriangle, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { currency, users } from "@/data/mockData";
import { exportInvoicePDF } from "@/lib/pdfExport";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import type { Invoice } from "@/data/mockData";
import type { PaymentMethod } from "@/data/mockData";

function nextInvoiceId(invoices: Invoice[]): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `INV-${today}-`;
  const sameDay = invoices.filter((i) => i.id.startsWith(prefix));
  const nums = sameDay.map((i) => parseInt(i.id.slice(prefix.length), 10)).filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function dueDateFromTerms(issueDate: string, paymentTerms: string): string {
  const d = new Date(issueDate);
  if (paymentTerms === "Cash") return issueDate;
  if (paymentTerms === "Net_15") d.setDate(d.getDate() + 15);
  else if (paymentTerms === "Net_30") d.setDate(d.getDate() + 30);
  else if (paymentTerms === "Net_60") d.setDate(d.getDate() + 60);
  else d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function InvoicesPage() {
  const { t } = useTranslation();
  const { invoices, setInvoices, salesOrders, setSalesOrders } = useWMSData();
  const { canCreate: canCreateDoc } = useAuth();
  const canCreateInvoice = canCreateDoc("invoice");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const orderIdsWithInvoice = new Set(invoices.map((i) => i.orderId));
  const ordersEligibleForInvoice = salesOrders.filter(
    (o) => o.status === "Delivered" && !orderIdsWithInvoice.has(o.id)
  );

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (search && !inv.id.toLowerCase().includes(search.toLowerCase()) && !inv.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalOutstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const totalOverdue = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.balance, 0);

  const createInvoiceFromOrder = (order: (typeof salesOrders)[0]) => {
    const existing = invoices.find(i => i.orderId === order.id);
    if (existing) {
      toast({ title: t("accounting.invoicesPage.duplicateInvoice"), description: t("accounting.invoicesPage.duplicateInvoiceDesc", { id: existing.id, orderId: order.id }), variant: "destructive" });
      return;
    }

    const issueDate = new Date().toISOString().slice(0, 10);
    const dueDate = dueDateFromTerms(issueDate, order.paymentTerms);

    const previouslyInvoiced = invoices.filter(i => i.orderId === order.id).reduce((s, i) => s + i.totalAmount, 0);
    if (previouslyInvoiced + order.totalAmount > order.totalAmount * 1.05) {
      toast({ title: t("accounting.invoicesPage.overBillingBlocked"), description: t("accounting.invoicesPage.overBillingDesc"), variant: "destructive" });
      return;
    }

    const newInv: Invoice = {
      id: nextInvoiceId(invoices),
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      issueDate,
      dueDate,
      status: "Sent",
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      paidAmount: 0,
      balance: order.totalAmount,
      paymentTerms: order.paymentTerms.replace(/_/g, " "),
    };
    setInvoices((prev) => [...prev, newInv]);
    setSalesOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "Invoiced" as const } : o)));
    toast({ title: t("accounting.invoicesPage.invoiceCreated"), description: `${newInv.id} — ${order.customerName}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("accounting.invoicesPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("accounting.invoicesPage.subtitle", { count: invoices.length })}</p>
          </div>
        </div>
      </div>

      {ordersEligibleForInvoice.length > 0 && canCreateInvoice && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2">{t("accounting.invoicesPage.ordersToInvoice")}</h3>
          <p className="text-xs text-muted-foreground mb-3">{t("accounting.invoicesPage.ordersToInvoiceDesc")}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.order")}</th>
                <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.client")}</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.total")}</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {ordersEligibleForInvoice.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3 font-mono text-xs">{order.id}</td>
                  <td className="py-2 px-3 font-medium">{order.customerName}</td>
                  <td className="py-2 px-3 text-right font-medium">{currency(order.totalAmount)}</td>
                  <td className="py-2 px-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => createInvoiceFromOrder(order)}>
                      {t("accounting.invoicesPage.createInvoice")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t("accounting.invoicesPage.totalInvoiced"), value: currency(invoices.reduce((s, i) => s + i.totalAmount, 0)) },
          { label: t("accounting.invoicesPage.collected"), value: currency(invoices.reduce((s, i) => s + i.paidAmount, 0)), color: "text-success" },
          { label: t("accounting.invoicesPage.outstanding"), value: currency(totalOutstanding), color: "text-warning" },
          { label: t("accounting.invoicesPage.overdueAmount"), value: currency(totalOverdue), color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("common.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">{t("common.allStatuses")}</option>
          {["Draft","Sent","Partially_Paid","Paid","Overdue","Disputed","Cancelled"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.invoice")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.client")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.date")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.due")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.total")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.paid")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.balance")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.status")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{inv.id}</td>
                <td className="px-4 py-3 font-medium">{inv.customerName}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(inv.issueDate)}</td>
                <td className="px-4 py-3 text-xs">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(inv.totalAmount)}</td>
                <td className="px-4 py-3 text-right text-success">{currency(inv.paidAmount)}</td>
                <td className="px-4 py-3 text-right font-semibold">{currency(inv.balance)}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-md hover:bg-muted" title={t("accounting.invoicesPage.view")}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => {
                      if (inv.status === "Draft") {
                        setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Sent" as Invoice["status"] } : i));
                      }
                      toast({ title: t("accounting.invoicesPage.invoiceSent"), description: t("accounting.invoicesPage.invoiceSentDesc", { id: inv.id, customer: inv.customerName }) });
                    }} className="p-1.5 rounded-md hover:bg-muted" title={t("accounting.invoicesPage.send")}><Send className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => {
                      try {
                        exportInvoicePDF(inv);
                        toast({ title: t("accounting.invoicesPage.invoiceDownloaded"), description: inv.id });
                      } catch {
                        toast({ title: t("common.error"), description: t("accounting.invoicesPage.downloadError"), variant: "destructive" });
                      }
                    }} className="p-1.5 rounded-md hover:bg-muted" title={t("accounting.invoicesPage.download")}><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono">{selectedInvoice.id}</span>
                  <StatusBadge status={selectedInvoice.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailClient")}</span> <span className="font-medium">{selectedInvoice.customerName}</span></div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailOrder")}</span> <span className="font-mono text-xs">{selectedInvoice.orderId}</span></div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailDate")}</span> {selectedInvoice.issueDate}</div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailDue")}</span> {selectedInvoice.dueDate}</div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailSubtotal")}</span> {currency(selectedInvoice.subtotal)}</div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailTax")}</span> {currency(selectedInvoice.taxAmount)}</div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailPaid")}</span> <span className="text-success">{currency(selectedInvoice.paidAmount)}</span></div>
                <div><span className="text-muted-foreground">{t("accounting.invoicesPage.detailBalance")}</span> <span className="font-bold">{currency(selectedInvoice.balance)}</span></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PaymentsPage() {
  const { t } = useTranslation();
  const { invoices, setInvoices, payments, setPayments, purchaseOrders } = useWMSData();
  const { canCreate: canCreateDoc } = useAuth();
  const canCreatePayment = canCreateDoc("payment");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ invoiceId: "", amount: 0, method: "Cash" as PaymentMethod, reference: "", collectedBy: users.find(u => u.role === "Accountant")?.name ?? "Nadia Salim", notes: "", currency: "DZD" });

  const fxSummary = useMemo(() => {
    const fxPayments: { paymentId: string; vendorName: string; foreignCurrency: string; foreignAmount: number; poRate: number; payRate: number; poDate: string; payDate: string; gainLoss: number }[] = [];
    const foreignVendors: Record<string, { currency: string; rate: number }> = {
      "V007": { currency: "EUR", rate: 146.30 },
      "V008": { currency: "USD", rate: 134.60 },
    };

    for (const po of purchaseOrders) {
      const vendorFx = foreignVendors[po.vendorId];
      if (!vendorFx || po.status === "Draft") continue;
      const relatedInvoices = invoices.filter(i => i.orderId === po.id);
      for (const inv of relatedInvoices) {
        const relatedPayments = payments.filter(p => p.invoiceId === inv.id && p.status === "Completed");
        for (const pay of relatedPayments) {
          const drift = (Math.random() - 0.3) * 2.5;
          const payRate = Math.round((vendorFx.rate + drift) * 100) / 100;
          const foreignAmount = pay.amount / vendorFx.rate;
          const gainLoss = foreignAmount * (payRate - vendorFx.rate);
          fxPayments.push({
            paymentId: pay.id,
            vendorName: po.vendorName,
            foreignCurrency: vendorFx.currency,
            foreignAmount: Math.round(foreignAmount * 100) / 100,
            poRate: vendorFx.rate,
            payRate,
            poDate: po.orderDate,
            payDate: pay.date,
            gainLoss: Math.round(gainLoss * 100) / 100,
          });
        }
      }
    }

    const totalGain = fxPayments.filter(f => f.gainLoss > 0).reduce((s, f) => s + f.gainLoss, 0);
    const totalLoss = fxPayments.filter(f => f.gainLoss < 0).reduce((s, f) => s + Math.abs(f.gainLoss), 0);
    return { fxPayments, totalGain, totalLoss, netFx: totalGain - totalLoss };
  }, [payments, invoices, purchaseOrders]);

  const unpaidInvoices = invoices.filter(i => i.balance > 0 && !["Cancelled", "Disputed"].includes(i.status));

  const handleRecordPayment = () => {
    const inv = invoices.find(i => i.id === paymentForm.invoiceId);
    if (!inv || paymentForm.amount <= 0) return;
    if (paymentForm.amount > inv.balance) {
      toast({ title: t("accounting.paymentsPage.invalidAmount"), description: t("accounting.paymentsPage.invalidAmountDesc"), variant: "destructive" });
      return;
    }
    const newPaid = inv.paidAmount + paymentForm.amount;
    const newBalance = inv.balance - paymentForm.amount;
    const invStatus = newBalance <= 0 ? "Paid" : "Partially_Paid";
    setInvoices(prev => prev.map(i => i.id !== inv.id ? i : { ...i, paidAmount: newPaid, balance: newBalance, status: invStatus as Invoice["status"] }));
    const newPay: typeof payments[0] = {
      id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
      invoiceId: inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      date: new Date().toISOString().slice(0, 10),
      amount: paymentForm.amount,
      method: paymentForm.method,
      status: "Completed",
      reference: paymentForm.reference || `${paymentForm.method}-${Date.now()}`,
      collectedBy: paymentForm.collectedBy,
      notes: paymentForm.notes,
    };
    setPayments(prev => [newPay, ...prev]);
    setShowPayment(false);
    setPaymentForm({ invoiceId: "", amount: 0, method: "Cash", reference: "", collectedBy: users.find(u => u.role === "Accountant")?.name ?? "Nadia Salim", notes: "", currency: "DZD" });
    toast({ title: t("accounting.paymentsPage.paymentRegistered"), description: `${newPay.id} — ${currency(paymentForm.amount)}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("accounting.paymentsPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("accounting.paymentsPage.subtitle", { count: payments.length })}</p>
          </div>
        </div>
        {canCreatePayment && (
          <Button onClick={() => setShowPayment(true)} className="gap-2">
            {t("accounting.paymentsPage.registerPayment")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("accounting.paymentsPage.totalCollected"), value: currency(payments.filter(p => p.status === "Completed").reduce((s, p) => s + p.amount, 0)), color: "text-success" },
          { label: t("accounting.paymentsPage.pending"), value: currency(payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0)), color: "text-warning" },
          { label: t("accounting.paymentsPage.bounced"), value: currency(payments.filter(p => p.status === "Bounced").reduce((s, p) => s + p.amount, 0)), color: "text-destructive" },
          { label: t("accounting.paymentsPage.fxGains"), value: currency(fxSummary.totalGain), color: "text-emerald-600", icon: "up" },
          { label: t("accounting.paymentsPage.fxLosses"), value: currency(fxSummary.totalLoss), color: "text-destructive", icon: "down" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              {(s as any).icon === "up" && <TrendingUp className="h-3 w-3" />}
              {(s as any).icon === "down" && <TrendingDown className="h-3 w-3" />}
              {s.label}
            </p>
            <p className={`text-lg font-bold mt-1 ${s.color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.id")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.client")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.invoice")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.date")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.method")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.amount")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.reference")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.collectedBy")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.status")}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{p.id}</td>
                <td className="px-4 py-3 font-medium">{p.customerName}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.invoiceId}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3 text-xs">{p.method.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(p.amount)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                <td className="px-4 py-3 text-xs">{p.collectedBy}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status === "Completed" ? "Paid" : p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fxSummary.fxPayments.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              {t("accounting.paymentsPage.fxGainLoss")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("accounting.paymentsPage.fxNetDesc")} <span className={`font-semibold ${fxSummary.netFx >= 0 ? "text-emerald-600" : "text-destructive"}`}>{currency(fxSummary.netFx)}</span>
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.payment")}</th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.vendor")}</th>
                <th className="text-center px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.currency")}</th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.foreignAmount")}</th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.poRate")}</th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.settlementRate")}</th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.paymentsPage.gainLoss")}</th>
              </tr>
            </thead>
            <tbody>
              {fxSummary.fxPayments.map((fx) => (
                <tr key={fx.paymentId} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-2 font-mono text-xs">{fx.paymentId}</td>
                  <td className="px-4 py-2">{fx.vendorName}</td>
                  <td className="px-4 py-2 text-center font-mono font-semibold">{fx.foreignCurrency}</td>
                  <td className="px-4 py-2 text-right font-mono">{fx.foreignAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground">{fx.poRate.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-mono">{fx.payRate.toFixed(2)}</td>
                  <td className={`px-4 py-2 text-right font-mono font-bold ${fx.gainLoss >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {fx.gainLoss >= 0 ? "+" : ""}{currency(fx.gainLoss)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("accounting.paymentsPage.registerTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accounting.paymentsPage.invoice")}</label>
              <select value={paymentForm.invoiceId} onChange={e => { const inv = unpaidInvoices.find(i => i.id === e.target.value); setPaymentForm(prev => ({ ...prev, invoiceId: e.target.value, amount: inv?.balance ?? 0 })); }} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                <option value="">{t("accounting.paymentsPage.selectInvoice")}</option>
                {unpaidInvoices.map(inv => <option key={inv.id} value={inv.id}>{inv.id} — {inv.customerName} (solde {currency(inv.balance)})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accounting.paymentsPage.amount")}</label>
              <input type="number" min={0} step={0.01} value={paymentForm.amount || ""} onChange={e => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accounting.paymentsPage.method")}</label>
              <select value={paymentForm.method} onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value as PaymentMethod }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                {(["Cash", "Cheque", "Bank_Transfer", "Online"] as const).map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accounting.paymentsPage.reference")}</label>
              <input value={paymentForm.reference} onChange={e => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))} placeholder="Ex: VIR-20260220-001" className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accounting.paymentsPage.collectedBy")}</label>
              <input value={paymentForm.collectedBy} onChange={e => setPaymentForm(prev => ({ ...prev, collectedBy: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accounting.paymentsPage.notes")}</label>
              <input value={paymentForm.notes} onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleRecordPayment} disabled={!paymentForm.invoiceId || paymentForm.amount <= 0}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AccountingReportsPage() {
  const { t } = useTranslation();
  const { invoices, payments } = useWMSData();
  const today = new Date();

  const dueToDays = (dueDate: string) => Math.floor((new Date(dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const agingBuckets = { d15: 0, d30: 0, d45: 0, d60: 0, d90: 0 };
  invoices.forEach((inv) => {
    if (inv.balance <= 0 || ["Cancelled", "Disputed"].includes(inv.status)) return;
    const days = -dueToDays(inv.dueDate);
    if (days <= 15) agingBuckets.d15 += inv.balance;
    else if (days <= 30) agingBuckets.d30 += inv.balance;
    else if (days <= 45) agingBuckets.d45 += inv.balance;
    else if (days <= 60) agingBuckets.d60 += inv.balance;
    else agingBuckets.d90 += inv.balance;
  });
  const agingData = [
    { range: "0-15j", amount: Math.round(agingBuckets.d15) },
    { range: "16-30j", amount: Math.round(agingBuckets.d30) },
    { range: "31-45j", amount: Math.round(agingBuckets.d45) },
    { range: "46-60j", amount: Math.round(agingBuckets.d60) },
    { range: ">60j", amount: Math.round(agingBuckets.d90) },
  ];

  const byMethod: Record<string, number> = {};
  payments.filter((p) => p.status === "Completed").forEach((p) => {
    const key = p.method.replace(/_/g, " ");
    byMethod[key] = (byMethod[key] ?? 0) + p.amount;
  });
  const paymentMethodData = Object.entries(byMethod).map(([name, value]) => ({ name, value }));

  const COLORS = ["hsl(160, 84%, 39%)", "hsl(217, 91%, 60%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

  const byMonth: Record<string, { revenue: number; collected: number }> = {};
  invoices.forEach((inv) => {
    const monthKey = inv.issueDate.slice(0, 7);
    if (!byMonth[monthKey]) byMonth[monthKey] = { revenue: 0, collected: 0 };
    byMonth[monthKey].revenue += inv.totalAmount;
  });
  payments.filter((p) => p.status === "Completed").forEach((p) => {
    const inv = invoices.find((i) => i.id === p.invoiceId);
    const monthKey = (inv?.issueDate ?? p.date).slice(0, 7);
    if (!byMonth[monthKey]) byMonth[monthKey] = { revenue: 0, collected: 0 };
    byMonth[monthKey].collected += p.amount;
  });
  const monthLabels: Record<string, string> = { "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr", "05": "Mai", "06": "Juin", "07": "Juil", "08": "Août", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc" };
  const monthlyRevenue = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-5)
    .map(([ym, data]) => ({ month: monthLabels[ym.slice(5, 7)] || ym.slice(5, 7), revenue: data.revenue, collected: data.collected }));

  const clientAging: { name: string; total: number; d15: number; d30: number; d60: number; d90: number; risk: string }[] = [];
  const byCustomer: Record<string, { balance: number; dueDate: string }[]> = {};
  invoices.forEach((inv) => {
    if (inv.balance <= 0 || ["Cancelled", "Disputed"].includes(inv.status)) return;
    if (!byCustomer[inv.customerName]) byCustomer[inv.customerName] = [];
    byCustomer[inv.customerName].push({ balance: inv.balance, dueDate: inv.dueDate });
  });
  Object.entries(byCustomer).forEach(([name, arr]) => {
    const total = arr.reduce((s, x) => s + x.balance, 0);
    let d15 = 0, d30 = 0, d60 = 0, d90 = 0;
    arr.forEach(({ balance, dueDate }) => {
      const days = -dueToDays(dueDate);
      if (days <= 15) d15 += balance;
      else if (days <= 30) d30 += balance;
      else if (days <= 60) d60 += balance;
      else d90 += balance;
    });
    let risk = "Low";
    if (d90 > 0 || total > 500000) risk = "Critical";
    else if (d60 > 0 || total > 200000) risk = "High";
    else if (d30 > 0) risk = "Medium";
    clientAging.push({ name, total, d15, d30, d60, d90, risk });
  });
  clientAging.sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("accounting.reportsPage.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("accounting.reportsPage.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Aging */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">{t("accounting.reportsPage.agingReport")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("accounting.reportsPage.agingDesc")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [currency(v), t("common.amount")]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220, 13%, 91%)" }} />
              <Bar dataKey="amount" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">{t("accounting.reportsPage.paymentMethods")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("accounting.reportsPage.paymentMethodsDesc")}</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={paymentMethodData.length ? paymentMethodData : [{ name: "—", value: 0 }]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {(paymentMethodData.length ? paymentMethodData : [{ name: "—", value: 0 }]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [currency(v), ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {paymentMethodData.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("accounting.reportsPage.noPayments")}</p>
              ) : (
                paymentMethodData.map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{m.name}</span>
                    </div>
                    <span className="font-semibold">{currency(m.value)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue vs Collections */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-1">{t("accounting.reportsPage.revenueVsCollections")}</h3>
        <p className="text-xs text-muted-foreground mb-4">{t("accounting.reportsPage.last5Months")}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v: number) => [currency(v), ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220, 13%, 91%)" }} />
            <Bar dataKey="revenue" name={t("accounting.biProfitability.revenue")} fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="collected" name={t("accounting.invoicesPage.collected")} fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Client aging table — from context */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">{t("accounting.reportsPage.clientAging")}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.client")}</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.invoicesPage.total")}</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">0-15j</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">16-30j</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">31-60j</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{">"}60j</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("accounting.reportsPage.risk")}</th>
            </tr>
          </thead>
          <tbody>
            {clientAging.length === 0 ? (
              <tr><td colSpan={7} className="py-4 text-center text-muted-foreground text-sm">{t("common.noResults")}</td></tr>
            ) : (
              clientAging.map((c) => (
                <tr key={c.name} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3 font-medium">{c.name}</td>
                  <td className="py-2 px-3 text-right font-semibold">{currency(c.total)}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{c.d15 ? currency(c.d15) : "—"}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{c.d30 ? currency(c.d30) : "—"}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{c.d60 ? currency(c.d60) : "—"}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{c.d90 ? currency(c.d90) : "—"}</td>
                  <td className="py-2 px-3"><StatusBadge status={c.risk} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
