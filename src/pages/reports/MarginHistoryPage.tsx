/**
 * Phase 10.4 — Rapport Marge Historique
 * Shows margins at time of sale using cost snapshots stored in order lines.
 */
import { useMemo, useState } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/rbac";
import { currency, pct } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, DollarSign, ShieldAlert, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { calcMargin } from "@/modules/pricing/pricing.types";

interface MarginLine {
  orderId: string;
  customerName: string;
  orderDate: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  unitCostAtSale: number;
  lineTotal: number;
  costTotal: number;
  marginPct: number;
  grossProfit: number;
}

export default function MarginHistoryPage() {
  const { salesOrders, products } = useWMSData();
  const { currentUser } = useAuth();
  const showFinancials = currentUser ? canViewFinancials(currentUser) : false;
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<string>("all");

  // Build margin lines from delivered/invoiced orders
  const marginLines = useMemo(() => {
    const lines: MarginLine[] = [];
    const completedStatuses = ["Delivered", "Invoiced", "Shipped"];

    for (const order of salesOrders) {
      if (!completedStatuses.includes(order.status)) continue;
      if (period !== "all") {
        const orderMonth = order.orderDate.slice(0, 7); // YYYY-MM
        if (orderMonth !== period) continue;
      }

      for (const line of order.lines) {
        // Use unitCostAtSale if available, otherwise fall back to current product cost
        const product = products.find((p: any) => p.id === line.productId);
        const costAtSale = (line as any).unitCostAtSale ?? product?.unitCost ?? 0;
        const lineTotal = line.lineTotal;
        const costTotal = line.orderedQty * costAtSale;
        const grossProfit = lineTotal - costTotal;
        const marginPct = lineTotal > 0 ? (grossProfit / lineTotal) * 100 : 0;

        lines.push({
          orderId: order.id,
          customerName: order.customerName,
          orderDate: order.orderDate.split(" ")[0],
          productId: line.productId,
          productName: line.productName,
          qty: line.orderedQty,
          unitPrice: line.unitPrice,
          unitCostAtSale: costAtSale,
          lineTotal,
          costTotal,
          marginPct,
          grossProfit,
        });
      }
    }

    return lines.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [salesOrders, products, period]);

  const filtered = marginLines.filter(
    (l) => !search || l.productName.toLowerCase().includes(search.toLowerCase()) || l.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, l) => s + l.lineTotal, 0);
  const totalCost = filtered.reduce((s, l) => s + l.costTotal, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // By product chart
  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; cost: number; profit: number }>();
    filtered.forEach((l) => {
      const existing = map.get(l.productId) || { name: l.productName, revenue: 0, cost: 0, profit: 0 };
      existing.revenue += l.lineTotal;
      existing.cost += l.costTotal;
      existing.profit += l.grossProfit;
      map.set(l.productId, existing);
    });
    return Array.from(map.values())
      .map((v) => ({ ...v, margin: v.revenue > 0 ? (v.profit / v.revenue) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
  }, [filtered]);

  // Available periods
  const periods = useMemo(() => {
    const months = new Set<string>();
    salesOrders.forEach((o: any) => {
      if (["Delivered", "Invoiced", "Shipped"].includes(o.status)) {
        months.add(o.orderDate.slice(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [salesOrders]);

  if (!showFinancials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldAlert className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Accès restreint</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Ce rapport est réservé aux rôles financiers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marge Historique</h1>
        <p className="text-muted-foreground text-sm">Rentabilité par commande — coût au moment de la vente</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{currency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">CA Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <BarChart3 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold">{currency(totalCost)}</p>
              <p className="text-xs text-muted-foreground">Coût Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{currency(totalProfit)}</p>
              <p className="text-xs text-muted-foreground">Marge Brute</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className={`text-xl font-bold ${avgMargin < 15 ? "text-destructive" : avgMargin < 30 ? "text-warning" : "text-green-600"}`}>
                {avgMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Marge Moyenne</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 10 produits par marge brute</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProduct} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === "margin" ? `${v.toFixed(1)}%` : currency(v),
                    name === "profit" ? "Marge" : name === "revenue" ? "CA" : "% Marge",
                  ]}
                />
                <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg">Détail par ligne de commande</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher…" className="pl-9 w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes périodes</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">PV</TableHead>
                <TableHead className="text-right">Coût</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Marge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 50).map((l, i) => (
                <TableRow key={`${l.orderId}-${l.productId}-${i}`}>
                  <TableCell className="font-mono text-xs">{l.orderId}</TableCell>
                  <TableCell className="text-sm">{l.customerName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.orderDate}</TableCell>
                  <TableCell className="font-medium text-sm">{l.productName}</TableCell>
                  <TableCell className="text-right">{l.qty}</TableCell>
                  <TableCell className="text-right">{currency(l.unitPrice)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{currency(l.unitCostAtSale)}</TableCell>
                  <TableCell className="text-right font-medium">{currency(l.lineTotal)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={l.marginPct < 15 ? "destructive" : l.marginPct < 30 ? "secondary" : "default"} className="text-xs">
                      {l.marginPct.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Aucune donnée</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
