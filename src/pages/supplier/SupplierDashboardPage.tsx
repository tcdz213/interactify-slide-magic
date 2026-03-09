/**
 * Supplier Dashboard — KPIs + charts for the logged-in supplier.
 */
import { useMemo } from "react";
import {
  Package, ClipboardList, FileText, TrendingUp, Clock, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  supplierPOs, supplierInvoices, supplierProducts, supplierPerformance,
} from "@/supplier/data/mockSupplierData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/shared/components";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Confirmed: "bg-info/15 text-info border-info/30",
  Shipped: "bg-primary/15 text-primary border-primary/30",
  Delivered: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const PIE_COLORS = [
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
];

export default function SupplierDashboardPage() {
  const navigate = useNavigate();

  const kpis = useMemo(() => {
    const activeProducts = supplierProducts.filter((p) => p.available).length;
    const totalOrders = supplierPOs.length;
    const revenue = supplierPOs
      .filter((po) => po.status === "Delivered")
      .reduce((s, po) => s + po.totalAmount, 0);
    const pendingOrders = supplierPOs.filter((po) => po.status === "Pending").length;
    const pendingPayment = supplierInvoices
      .filter((i) => i.status !== "Paid")
      .reduce((s, i) => s + i.balance, 0);

    return [
      { icon: Package, label: "Produits actifs", value: String(activeProducts), color: "text-primary", bg: "bg-primary/10" },
      { icon: ClipboardList, label: "Commandes reçues", value: String(totalOrders), color: "text-info", bg: "bg-info/10" },
      { icon: TrendingUp, label: "Revenus générés", value: currency(revenue), color: "text-success", bg: "bg-success/10" },
      { icon: Clock, label: "En attente", value: String(pendingOrders), color: "text-warning", bg: "bg-warning/10" },
      { icon: FileText, label: "Solde impayé", value: currency(pendingPayment), color: "text-destructive", bg: "bg-destructive/10" },
      { icon: CheckCircle2, label: "Score qualité", value: `${supplierPerformance.globalScore}/5`, color: "text-primary", bg: "bg-primary/10" },
    ];
  }, []);

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    supplierPOs.forEach((po) => { counts[po.status] = (counts[po.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const monthlySales = supplierPerformance.monthlyOrders;

  const recentPOs = supplierPOs.slice(0, 5);

  return (
    <PageShell title="Tableau de bord fournisseur" description="Vue d'ensemble de votre activité">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border">
            <CardContent className="p-4 space-y-2">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${k.bg}`}>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Monthly Sales */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Ventes mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} className="text-xs" />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Dernières commandes</CardTitle>
          <button onClick={() => navigate("/my/orders")} className="text-xs text-primary hover:underline">
            Voir tout →
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 font-medium">Commande</th>
                  <th className="text-left py-2 font-medium">Entrepôt</th>
                  <th className="text-right py-2 font-medium">Montant</th>
                  <th className="text-left py-2 font-medium">Statut</th>
                  <th className="text-left py-2 font-medium">Livraison</th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po) => (
                  <tr key={po.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono text-xs">{po.id}</td>
                    <td className="py-2.5 text-xs">{po.warehouseName}</td>
                    <td className="py-2.5 text-xs text-right font-medium">{currency(po.totalAmount)}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[po.status] || ""}`}>
                        {po.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">
                      {new Date(po.expectedDelivery).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Taux de livraison à temps", value: supplierPerformance.onTimeDeliveryRate, target: supplierPerformance.contractTargets.onTime },
            { label: "Conformité qualité", value: supplierPerformance.qualityConformityRate, target: supplierPerformance.contractTargets.quality },
            { label: "Taux d'acceptation", value: supplierPerformance.acceptanceRate, target: supplierPerformance.contractTargets.acceptance },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-semibold">
                  {m.value}% <span className="text-muted-foreground font-normal">/ {m.target}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${m.value >= m.target ? "bg-success" : "bg-warning"}`}
                  style={{ width: `${Math.min(m.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quality Claims Alert */}
      {supplierPerformance.qualityClaims.some((c) => c.status === "Open") && (
        <Card className="mt-6 border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Réclamations qualité ouvertes</p>
              {supplierPerformance.qualityClaims
                .filter((c) => c.status === "Open")
                .map((c) => (
                  <p key={c.id} className="text-xs text-muted-foreground mt-1">
                    {c.id} — {c.description}
                  </p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
