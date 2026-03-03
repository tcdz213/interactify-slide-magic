/**
 * Phase 10.6 — Dashboard Rentabilité
 * Profitability by product, client, and period.
 */
import { useMemo, useState } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/rbac";
import { currency } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, TrendingUp, Users, Package, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(160,84%,39%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(340,75%,55%)", "hsl(217,91%,60%)", "#06b6d4", "#ec4899"];

export default function ProfitabilityDashboard() {
  const { salesOrders, products } = useWMSData();
  const { currentUser } = useAuth();
  const showFinancials = currentUser ? canViewFinancials(currentUser) : false;

  const completedOrders = useMemo(
    () => salesOrders.filter((o: any) => ["Delivered", "Invoiced", "Shipped"].includes(o.status)),
    [salesOrders]
  );

  // --- By Product ---
  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; cost: number; qty: number }>();
    completedOrders.forEach((o: any) => {
      o.lines.forEach((l: any) => {
        const product = products.find((p: any) => p.id === l.productId);
        const costAtSale = l.unitCostAtSale ?? product?.unitCost ?? 0;
        const existing = map.get(l.productId) || { name: l.productName, revenue: 0, cost: 0, qty: 0 };
        existing.revenue += l.lineTotal;
        existing.cost += l.orderedQty * costAtSale;
        existing.qty += l.orderedQty;
        map.set(l.productId, existing);
      });
    });
    return Array.from(map.values())
      .map((v) => ({ ...v, profit: v.revenue - v.cost, margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit);
  }, [completedOrders, products]);

  // --- By Client ---
  const byClient = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; cost: number; orders: number }>();
    completedOrders.forEach((o: any) => {
      const existing = map.get(o.customerId) || { name: o.customerName, revenue: 0, cost: 0, orders: 0 };
      existing.orders++;
      o.lines.forEach((l: any) => {
        const product = products.find((p: any) => p.id === l.productId);
        const costAtSale = l.unitCostAtSale ?? product?.unitCost ?? 0;
        existing.revenue += l.lineTotal;
        existing.cost += l.orderedQty * costAtSale;
      });
      map.set(o.customerId, existing);
    });
    return Array.from(map.values())
      .map((v) => ({ ...v, profit: v.revenue - v.cost, margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit);
  }, [completedOrders, products]);

  // --- By Period ---
  const byPeriod = useMemo(() => {
    const map = new Map<string, { period: string; revenue: number; cost: number; orders: number }>();
    completedOrders.forEach((o: any) => {
      const month = o.orderDate.slice(0, 7);
      const existing = map.get(month) || { period: month, revenue: 0, cost: 0, orders: 0 };
      existing.orders++;
      o.lines.forEach((l: any) => {
        const product = products.find((p: any) => p.id === l.productId);
        const costAtSale = l.unitCostAtSale ?? product?.unitCost ?? 0;
        existing.revenue += l.lineTotal;
        existing.cost += l.orderedQty * costAtSale;
      });
      map.set(month, existing);
    });
    return Array.from(map.values())
      .map((v) => ({ ...v, profit: v.revenue - v.cost, margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0 }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [completedOrders, products]);

  const totalRevenue = byProduct.reduce((s, p) => s + p.revenue, 0);
  const totalProfit = byProduct.reduce((s, p) => s + p.profit, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  if (!showFinancials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldAlert className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Accès restreint</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Ce dashboard est réservé aux rôles financiers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rentabilité</h1>
        <p className="text-muted-foreground text-sm">Analyse par produit, client et période</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">CA Total</p>
          <p className="text-xl font-bold">{currency(totalRevenue)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Marge Brute</p>
          <p className="text-xl font-bold text-green-600">{currency(totalProfit)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Marge Moyenne</p>
          <p className={`text-xl font-bold ${avgMargin < 20 ? "text-destructive" : "text-green-600"}`}>{avgMargin.toFixed(1)}%</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Commandes livrées</p>
          <p className="text-xl font-bold">{completedOrders.length}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="product">
        <TabsList>
          <TabsTrigger value="product" className="gap-1"><Package className="h-3.5 w-3.5" /> Par Produit</TabsTrigger>
          <TabsTrigger value="client" className="gap-1"><Users className="h-3.5 w-3.5" /> Par Client</TabsTrigger>
          <TabsTrigger value="period" className="gap-1"><Calendar className="h-3.5 w-3.5" /> Par Période</TabsTrigger>
        </TabsList>

        {/* By Product */}
        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Marge par produit</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byProduct.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => currency(v)} />
                    <Bar dataKey="profit" name="Marge" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Qté vendue</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Coût</TableHead>
                <TableHead className="text-right">Marge</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byProduct.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">{p.qty.toLocaleString("fr-DZ")}</TableCell>
                  <TableCell className="text-right">{currency(p.revenue)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{currency(p.cost)}</TableCell>
                  <TableCell className="text-right font-bold">{currency(p.profit)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={p.margin < 15 ? "destructive" : p.margin < 30 ? "secondary" : "default"}>{p.margin.toFixed(1)}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* By Client */}
        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Rentabilité par client</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byClient.slice(0, 8)} dataKey="profit" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {byClient.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => currency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Commandes</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Marge</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byClient.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">{c.orders}</TableCell>
                  <TableCell className="text-right">{currency(c.revenue)}</TableCell>
                  <TableCell className="text-right font-bold">{currency(c.profit)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={c.margin < 15 ? "destructive" : c.margin < 30 ? "secondary" : "default"}>{c.margin.toFixed(1)}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* By Period */}
        <TabsContent value="period" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Tendance mensuelle</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => currency(v)} />
                    <Bar dataKey="revenue" name="CA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Marge" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead className="text-right">Commandes</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Coût</TableHead>
                <TableHead className="text-right">Marge</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byPeriod.map((p) => (
                <TableRow key={p.period}>
                  <TableCell className="font-medium">{p.period}</TableCell>
                  <TableCell className="text-right">{p.orders}</TableCell>
                  <TableCell className="text-right">{currency(p.revenue)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{currency(p.cost)}</TableCell>
                  <TableCell className="text-right font-bold">{currency(p.profit)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={p.margin < 15 ? "destructive" : p.margin < 30 ? "secondary" : "default"}>{p.margin.toFixed(1)}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
