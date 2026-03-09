/**
 * Supplier Statistics — CA mensuel, top produits, commandes par statut.
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { supplierPOs, supplierPerformance, supplierProducts } from "@/supplier/data/mockSupplierData";
import { PageShell } from "@/shared/components";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const PIE_COLORS = [
  "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--primary))",
  "hsl(var(--success))", "hsl(var(--destructive))",
];

export default function SupplierStatsPage() {
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    supplierPOs.forEach((po) => { counts[po.status] = (counts[po.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  // Top products by total revenue across all POs
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; qty: number }>();
    supplierPOs.forEach((po) => {
      po.lines.forEach((l) => {
        const existing = map.get(l.productId) || { name: l.productName, revenue: 0, qty: 0 };
        existing.revenue += l.qty * l.unitPrice;
        existing.qty += l.qty;
        map.set(l.productId, existing);
      });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, []);

  const monthlySales = supplierPerformance.monthlyOrders;

  return (
    <PageShell title="Statistiques" description="Analyse de performance et ventes">
      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Chiffre d'affaires mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} className="text-xs" />
              <Tooltip formatter={(v: number) => currency(v)} />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top produits par revenu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} className="text-xs" />
                <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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

      {/* Monthly Orders Count */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Volume de commandes mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageShell>
  );
}
