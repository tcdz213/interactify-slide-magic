import { useState } from "react";
import { Receipt, CreditCard, FileText, Eye, Search, Send, Download, AlertTriangle } from "lucide-react";
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
    const issueDate = new Date().toISOString().slice(0, 10);
    const dueDate = dueDateFromTerms(issueDate, order.paymentTerms);
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
    toast({ title: "Facture créée", description: `${newInv.id} — ${order.customerName}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Factures</h1>
            <p className="text-sm text-muted-foreground">{invoices.length} factures</p>
          </div>
        </div>
      </div>

      {ordersEligibleForInvoice.length > 0 && canCreateInvoice && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2">Commandes livrées à facturer</h3>
          <p className="text-xs text-muted-foreground mb-3">Créez une facture pour passer la commande en « Facturée ».</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Commande</th>
                <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
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
                      Créer facture
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
          { label: "Total facturé", value: currency(invoices.reduce((s, i) => s + i.totalAmount, 0)) },
          { label: "Encaissé", value: currency(invoices.reduce((s, i) => s + i.paidAmount, 0)), color: "text-success" },
          { label: "En souffrance", value: currency(totalOutstanding), color: "text-warning" },
          { label: "En retard", value: currency(totalOverdue), color: "text-destructive" },
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
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Tous</option>
          {["Draft","Sent","Partially_Paid","Paid","Overdue","Disputed","Cancelled"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Facture</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Échéance</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Total</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Payé</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Solde</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
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
                    <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-md hover:bg-muted" title="Voir"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => {
                      if (inv.status === "Draft") {
                        setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Sent" as Invoice["status"] } : i));
                      }
                      toast({ title: "Facture envoyée", description: `${inv.id} envoyée à ${inv.customerName}` });
                    }} className="p-1.5 rounded-md hover:bg-muted" title="Envoyer"><Send className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => {
                      try {
                        exportInvoicePDF(inv);
                        toast({ title: "Facture téléchargée", description: inv.id });
                      } catch {
                        toast({ title: "Erreur", description: "Impossible de générer le fichier", variant: "destructive" });
                      }
                    }} className="p-1.5 rounded-md hover:bg-muted" title="Télécharger"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
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
                <div><span className="text-muted-foreground">Client :</span> <span className="font-medium">{selectedInvoice.customerName}</span></div>
                <div><span className="text-muted-foreground">Commande :</span> <span className="font-mono text-xs">{selectedInvoice.orderId}</span></div>
                <div><span className="text-muted-foreground">Date :</span> {selectedInvoice.issueDate}</div>
                <div><span className="text-muted-foreground">Échéance :</span> {selectedInvoice.dueDate}</div>
                <div><span className="text-muted-foreground">Sous-total :</span> {currency(selectedInvoice.subtotal)}</div>
                <div><span className="text-muted-foreground">TVA :</span> {currency(selectedInvoice.taxAmount)}</div>
                <div><span className="text-muted-foreground">Payé :</span> <span className="text-success">{currency(selectedInvoice.paidAmount)}</span></div>
                <div><span className="text-muted-foreground">Solde :</span> <span className="font-bold">{currency(selectedInvoice.balance)}</span></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PaymentsPage() {
  const { invoices, setInvoices, payments, setPayments } = useWMSData();
  const { canCreate: canCreateDoc } = useAuth();
  const canCreatePayment = canCreateDoc("payment");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ invoiceId: "", amount: 0, method: "Cash" as PaymentMethod, reference: "", collectedBy: users.find(u => u.role === "Accountant")?.name ?? "Nadia Salim", notes: "" });

  const unpaidInvoices = invoices.filter(i => i.balance > 0 && !["Cancelled", "Disputed"].includes(i.status));

  const handleRecordPayment = () => {
    const inv = invoices.find(i => i.id === paymentForm.invoiceId);
    if (!inv || paymentForm.amount <= 0) return;
    if (paymentForm.amount > inv.balance) {
      toast({ title: "Montant invalide", description: "Le montant ne peut pas dépasser le solde.", variant: "destructive" });
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
    setPaymentForm({ invoiceId: "", amount: 0, method: "Cash", reference: "", collectedBy: users.find(u => u.role === "Accountant")?.name ?? "Nadia Salim", notes: "" });
    toast({ title: "Paiement enregistré", description: `${newPay.id} — ${currency(paymentForm.amount)}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Encaissements</h1>
            <p className="text-sm text-muted-foreground">{payments.length} paiements enregistrés</p>
          </div>
        </div>
        {canCreatePayment && (
          <Button onClick={() => setShowPayment(true)} className="gap-2">
            Enregistrer paiement
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total encaissé", value: currency(payments.filter(p => p.status === "Completed").reduce((s, p) => s + p.amount, 0)), color: "text-success" },
          { label: "En attente", value: currency(payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0)), color: "text-warning" },
          { label: "Rejetés", value: currency(payments.filter(p => p.status === "Bounced").reduce((s, p) => s + p.amount, 0)), color: "text-destructive" },
          { label: "Cash", value: currency(payments.filter(p => p.method === "Cash" && p.status === "Completed").reduce((s, p) => s + p.amount, 0)) },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Facture</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Méthode</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Montant</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Référence</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Collecté par</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
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

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Facture</label>
              <select value={paymentForm.invoiceId} onChange={e => { const inv = unpaidInvoices.find(i => i.id === e.target.value); setPaymentForm(prev => ({ ...prev, invoiceId: e.target.value, amount: inv?.balance ?? 0 })); }} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                <option value="">Sélectionner une facture...</option>
                {unpaidInvoices.map(inv => <option key={inv.id} value={inv.id}>{inv.id} — {inv.customerName} (solde {currency(inv.balance)})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Montant</label>
              <input type="number" min={0} step={0.01} value={paymentForm.amount || ""} onChange={e => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Méthode</label>
              <select value={paymentForm.method} onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value as PaymentMethod }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                {(["Cash", "Cheque", "Bank_Transfer", "Online"] as const).map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Référence</label>
              <input value={paymentForm.reference} onChange={e => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))} placeholder="Ex: VIR-20260220-001" className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Collecté par</label>
              <input value={paymentForm.collectedBy} onChange={e => setPaymentForm(prev => ({ ...prev, collectedBy: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <input value={paymentForm.notes} onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>Annuler</Button>
            <Button onClick={handleRecordPayment} disabled={!paymentForm.invoiceId || paymentForm.amount <= 0}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AccountingReportsPage() {
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

  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = payments.filter((p) => p.status === "Completed").reduce((s, p) => s + p.amount, 0);
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
          <h1 className="text-xl font-bold tracking-tight">Rapports comptables</h1>
          <p className="text-sm text-muted-foreground">Analyse financière et aging</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Aging */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">Rapport Aging</h3>
          <p className="text-xs text-muted-foreground mb-4">Créances par ancienneté</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [currency(v), "Montant"]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220, 13%, 91%)" }} />
              <Bar dataKey="amount" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">Méthodes de paiement</h3>
          <p className="text-xs text-muted-foreground mb-4">Répartition des encaissements</p>
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
                <p className="text-sm text-muted-foreground">Aucun encaissement enregistré</p>
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
        <h3 className="text-sm font-semibold mb-1">CA vs Encaissements</h3>
        <p className="text-xs text-muted-foreground mb-4">5 derniers mois</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v: number) => [currency(v), ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220, 13%, 91%)" }} />
            <Bar dataKey="revenue" name="CA" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="collected" name="Encaissé" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Client aging table — from context */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Détail Aging par client</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Client</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Total dû</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">0-15j</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">16-30j</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">31-60j</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">{">"}60j</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Risque</th>
            </tr>
          </thead>
          <tbody>
            {clientAging.length === 0 ? (
              <tr><td colSpan={7} className="py-4 text-center text-muted-foreground text-sm">Aucune créance en souffrance</td></tr>
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
