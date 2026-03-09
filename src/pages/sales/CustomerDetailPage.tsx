import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Phone, Mail, MapPin, AlertTriangle, CreditCard, ShoppingCart, FileText, TrendingUp, Ban } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, salesOrders, invoices, payments } = useWMSData();

  const customer = customers.find((c) => c.id === id);
  const customerOrders = useMemo(() => salesOrders.filter((o) => o.customerId === id).sort((a, b) => b.orderDate.localeCompare(a.orderDate)), [salesOrders, id]);
  const customerInvoices = useMemo(() => invoices.filter((inv) => inv.customerId === id).sort((a, b) => b.issueDate.localeCompare(a.issueDate)), [invoices, id]);
  const customerPayments = useMemo(() => payments.filter((p) => p.customerId === id).sort((a, b) => b.date.localeCompare(a.date)), [payments, id]);

  const now = new Date();
  const overdueInvoices = useMemo(() => customerInvoices.filter((inv) => {
    if (inv.status === "Paid" || inv.status === "Cancelled") return false;
    return new Date(inv.dueDate) < now && inv.balance > 0;
  }), [customerInvoices, now]);

  const overdueDays = useMemo(() => {
    if (overdueInvoices.length === 0) return 0;
    return Math.max(...overdueInvoices.map((inv) => Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000)));
  }, [overdueInvoices, now]);

  const totalOverdueAmount = useMemo(() => overdueInvoices.reduce((s, inv) => s + inv.balance, 0), [overdueInvoices]);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Ban className="h-12 w-12 mb-3 opacity-40" />
        <p>{t("customerDetail.notFound")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/sales/customers")}>{t("customerDetail.backToCustomers")}</Button>
      </div>
    );
  }

  const creditPct = Math.round((customer.creditUsed / customer.creditLimit) * 100);
  const creditColor = creditPct > 100 ? "text-destructive" : creditPct > 80 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sales/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">{customer.name}</h1>
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-sm text-muted-foreground">{customer.id} · {customer.type} · {customer.zone}</p>
        </div>
      </div>

      {/* Debt warning banner */}
      {overdueDays > 0 && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${overdueDays >= 60 ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"}`}>
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {overdueDays >= 60 ? t("customerDetail.accountBlocked") : t("customerDetail.lateInvoices")}
            </p>
            <p className="text-xs opacity-80">
              {t("customerDetail.invoiceSummary", { count: overdueInvoices.length, days: overdueDays, amount: currency(totalOverdueAmount) })}
            </p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: t("customerDetail.creditUsed"), value: currency(customer.creditUsed), sub: `/ ${currency(customer.creditLimit)}`, icon: CreditCard, color: creditColor },
          { label: t("customerDetail.creditPct"), value: `${creditPct}%`, sub: creditPct > 100 ? t("customerDetail.exceeded") : t("customerDetail.available"), icon: TrendingUp, color: creditColor },
          { label: t("customerDetail.orders"), value: String(customerOrders.length), sub: t("customerDetail.historical", { count: customer.totalOrders }), icon: ShoppingCart, color: "text-primary" },
          { label: t("customerDetail.totalRevenue"), value: currency(customer.totalRevenue), sub: customer.paymentTerms.replace(/_/g, " "), icon: FileText, color: "text-primary" },
          { label: t("customerDetail.unpaid"), value: currency(totalOverdueAmount), sub: overdueInvoices.length > 0 ? t("customerDetail.invoiceCount", { count: overdueInvoices.length }) : t("customerDetail.noUnpaid"), icon: AlertTriangle, color: totalOverdueAmount > 0 ? "text-destructive" : "text-emerald-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
            </div>
            <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Contact info */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">{t("customerDetail.contactInfo")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {customer.phone}</div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {customer.email}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {customer.zone}</div>
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> {customer.paymentTerms.replace(/_/g, " ")}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">{t("customerDetail.tabOrders", { count: customerOrders.length })}</TabsTrigger>
          <TabsTrigger value="invoices">{t("customerDetail.tabInvoices", { count: customerInvoices.length })}</TabsTrigger>
          <TabsTrigger value="payments">{t("customerDetail.tabPayments", { count: customerPayments.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colOrder")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colDate")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colSalesRep")}</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colTotal")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate("/sales/orders")}>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{o.id}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(o.orderDate, true)}</td>
                    <td className="px-4 py-3 text-xs">{o.salesRep}</td>
                    <td className="px-4 py-3 text-right font-medium">{currency(o.totalAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {customerOrders.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("customerDetail.noOrders")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colInvoice")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colIssueDate")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colDueDate")}</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colAmount")}</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colBalance")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.map((inv) => {
                  const isOverdue = inv.balance > 0 && new Date(inv.dueDate) < now;
                  return (
                    <tr key={inv.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isOverdue ? "bg-destructive/5" : ""}`}>
                      <td className="px-4 py-3 font-mono text-xs font-medium">{inv.id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-medium">{currency(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-right font-medium">{inv.balance > 0 ? <span className={isOverdue ? "text-destructive" : ""}>{currency(inv.balance)}</span> : "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    </tr>
                  );
                })}
                {customerInvoices.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("customerDetail.noInvoices")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colPayment")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colDate")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colMethod")}</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colAmount")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colStatus")}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("customerDetail.colReference")}</th>
                </tr>
              </thead>
              <tbody>
                {customerPayments.map((p) => (
                  <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${p.status === "Bounced" ? "bg-destructive/5" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{p.id}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-xs">{p.method.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-right font-medium">{currency(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{p.reference}</td>
                  </tr>
                ))}
                {customerPayments.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("customerDetail.noPayments")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
