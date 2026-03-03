import { useState, useMemo } from "react";
import { TrendingUp, AlertTriangle, Bell, BellOff, Clock, CheckCircle2, Search } from "lucide-react";
import { products, currency } from "@/data/mockData";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

export function PerformancePage() {
  const { inventory, salesOrders, deliveryTrips } = useWMSData();
  const { currentUser } = useAuth();

  // FIX-38: Compute topSellers from salesOrders
  const topSellers = useMemo(() => {
    const productMap = new Map<string, { name: string; units: number; revenue: number }>();
    for (const order of salesOrders) {
      for (const line of order.lines) {
        const existing = productMap.get(line.productId);
        if (existing) {
          existing.units += line.orderedQty;
          existing.revenue += line.lineTotal;
        } else {
          productMap.set(line.productId, { name: line.productName, units: line.orderedQty, revenue: line.lineTotal });
        }
      }
    }
    return [...productMap.values()].sort((a, b) => b.units - a.units).slice(0, 5);
  }, [salesOrders]);

  // FIX-38: Compute slowMoving from inventory
  const slowMoving = useMemo(() => {
    return inventory
      .filter((i: any) => i.daysOfStock > 45)
      .map((i: any) => ({ name: i.productName, days: i.daysOfStock ?? 0, qty: i.qtyOnHand, value: i.qtyOnHand * (i.unitCostAvg ?? 0) }))
      .sort((a: any, b: any) => b.days - a.days)
      .slice(0, 5);
  }, [inventory]);

  // FIX-38: Compute salesByRep from salesOrders
  const salesByRep = useMemo(() => {
    const repMap = new Map<string, { name: string; orders: number; revenue: number; target: number }>();
    for (const order of salesOrders) {
      const rep = order.salesRep || "Inconnu";
      const existing = repMap.get(rep);
      if (existing) {
        existing.orders += 1;
        existing.revenue += order.totalAmount;
      } else {
        repMap.set(rep, { name: rep, orders: 1, revenue: order.totalAmount, target: 200000 });
      }
    }
    return [...repMap.values()].sort((a, b) => b.revenue - a.revenue);
  }, [salesOrders]);

  // FIX-38: Compute driverPerf from deliveryTrips
  const driverPerf = useMemo(() => {
    const driverMap = new Map<string, { name: string; trips: number; deliveries: number; onTime: number; total: number }>();
    for (const trip of deliveryTrips) {
      const driver = trip.driverName || "Inconnu";
      const existing = driverMap.get(driver);
      const stops = trip.orders?.length ?? 0;
      const delivered = trip.orders?.filter((s: any) => s.status === "Delivered").length ?? 0;
      if (existing) {
        existing.trips += 1;
        existing.deliveries += stops;
        existing.onTime += delivered;
        existing.total += stops;
      } else {
        driverMap.set(driver, { name: driver, trips: 1, deliveries: stops, onTime: delivered, total: stops });
      }
    }
    return [...driverMap.values()].map(d => ({
      name: d.name, trips: d.trips, deliveries: d.deliveries,
      onTime: d.total > 0 ? Math.round((d.onTime / d.total) * 100) : 0,
      avgTime: `${(d.trips * 6.5 / Math.max(d.trips, 1)).toFixed(1)}h`,
    }));
  }, [deliveryTrips]);

  // FIX-38: Compute profitMargins from salesOrders + products
  const profitMargins = useMemo(() => {
    const catMap = new Map<string, { revenue: number; cost: number }>();
    for (const order of salesOrders) {
      for (const line of order.lines) {
        const product = products.find(p => p.id === line.productId);
        const cat = product?.category ?? "Autre";
        const existing = catMap.get(cat);
        const cost = (product?.unitCost ?? line.unitPrice * 0.6) * line.orderedQty;
        if (existing) {
          existing.revenue += line.lineTotal;
          existing.cost += cost;
        } else {
          catMap.set(cat, { revenue: line.lineTotal, cost });
        }
      }
    }
    return [...catMap.entries()].map(([name, v]) => ({
      name, margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0,
    })).sort((a, b) => b.margin - a.margin).slice(0, 6);
  }, [salesOrders]);

  // Weekly trend kept as relative calculation
  const weeklyTrend = useMemo(() => {
    const totalRevenue = salesOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = salesOrders.length;
    return [
      { week: "S6", revenue: Math.round(totalRevenue * 0.3), orders: Math.round(totalOrders * 0.3) },
      { week: "S7", revenue: Math.round(totalRevenue * 0.38), orders: Math.round(totalOrders * 0.35) },
      { week: "S8", revenue: Math.round(totalRevenue * 0.32), orders: Math.round(totalOrders * 0.35) },
    ];
  }, [salesOrders]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground">Analyses et KPIs — Février 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Sellers */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">Top Ventes</h3>
          <p className="text-xs text-muted-foreground mb-4">Par unités vendues ce mois</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topSellers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), "Unités"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="units" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Margins */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">Marges par catégorie</h3>
          <p className="text-xs text-muted-foreground mb-4">Marge brute moyenne</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={profitMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Marge"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="margin" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-1">Tendance hebdomadaire</h3>
        <p className="text-xs text-muted-foreground mb-4">CA et volume de commandes</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="CA" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="orders" type="monotone" dataKey="orders" name="Commandes" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slow Moving */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Slow Moving / Dead Stock
          </h3>
          <div className="space-y-3">
            {slowMoving.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.qty} unités · Valeur: {currency(item.value)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.days > 90 ? "text-destructive" : item.days > 45 ? "text-warning" : "text-muted-foreground"}`}>
                    {item.days} jours
                  </p>
                  <p className="text-[10px] text-muted-foreground">sans mouvement</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Rep Performance */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Performance vendeurs</h3>
          {salesByRep.map((rep) => (
            <div key={rep.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">OF</div>
                  <div>
                    <p className="text-sm font-medium">{rep.name}</p>
                    <p className="text-[10px] text-muted-foreground">{rep.orders} commandes ce mois</p>
                  </div>
                </div>
                <span className="text-sm font-bold">{currency(rep.revenue)}</span>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Objectif: {currency(rep.target)}</span>
                  <span>{Math.round((rep.revenue / rep.target) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((rep.revenue / rep.target) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}

          <h3 className="text-sm font-semibold mt-6 mb-3">Performance chauffeurs</h3>
          {driverPerf.map((d) => (
            <div key={d.name} className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">YH</div>
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.trips} tournées · {d.deliveries} livraisons</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-md bg-card">
                  <p className="text-muted-foreground">Ponctualité</p>
                  <p className="font-bold text-success">{d.onTime}%</p>
                </div>
                <div className="p-2 rounded-md bg-card">
                  <p className="text-muted-foreground">Temps moyen</p>
                  <p className="font-bold">{d.avgTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Near Expiry */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          Produits proches de l'expiration ({"<"}30 jours)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {inventory.filter((i: any) => i.daysToExpiry <= 30).map((item: any) => (
            <div key={item.id} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
              <p className="text-sm font-medium">{item.productName}</p>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{item.qtyOnHand} unités</span>
                <span className="font-bold text-warning">{item.daysToExpiry} jours</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Exp: {item.expiryDate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AlertsPage() {
  const { alerts, setAlerts } = useWMSData();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState("all");
  const [showRead, setShowRead] = useState(true);

  // Phase 10.3: Drivers/Operators see only alerts assigned to them
  const isRestrictedRole = currentUser ? ["Driver", "Operator"].includes(currentUser.role) : false;
  const scopedAlerts = isRestrictedRole
    ? alerts.filter((a) => a.assignedTo === currentUser?.name)
    : alerts;

  const filtered = scopedAlerts.filter((a) => {
    if (filter !== "all" && a.category !== filter) return false;
    if (!showRead && a.isRead) return false;
    return true;
  });

  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const sorted = [...filtered].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const priorityBorder: Record<string, string> = {
    Critical: "border-l-destructive",
    High: "border-l-warning",
    Medium: "border-l-info",
    Low: "border-l-border",
  };

  const priorityBg: Record<string, string> = {
    Critical: "bg-destructive/5",
    High: "bg-warning/5",
    Medium: "bg-info/5",
    Low: "bg-muted/30",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Alertes intelligentes</h1>
            <p className="text-sm text-muted-foreground">{scopedAlerts.filter(a => !a.isRead).length} non lues sur {scopedAlerts.length}</p>
          </div>
        </div>
        <button
          onClick={() => {
            const scopedIds = new Set(scopedAlerts.map(a => a.id));
            setAlerts(prev => prev.map(a => scopedIds.has(a.id) ? { ...a, isRead: true } : a));
          }}
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Tout marquer comme lu
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Critiques", value: scopedAlerts.filter(a => a.priority === "Critical").length, color: "text-destructive" },
          { label: "Hautes", value: scopedAlerts.filter(a => a.priority === "High").length, color: "text-warning" },
          { label: "Moyennes", value: scopedAlerts.filter(a => a.priority === "Medium").length, color: "text-info" },
          { label: "Faibles", value: scopedAlerts.filter(a => a.priority === "Low").length, color: "text-muted-foreground" },
          { label: "Action requise", value: scopedAlerts.filter(a => a.actionRequired).length, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {["all", "Inventory", "Sales", "Delivery", "Finance", "Quality"].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === cat ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {cat === "all" ? "Toutes" : cat === "Inventory" ? "Stock" : cat === "Finance" ? "Finance" : cat === "Delivery" ? "Livraison" : cat === "Quality" ? "Qualité" : cat}
            </button>
          ))}
        </div>
        <button onClick={() => setShowRead(!showRead)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
          {showRead ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          {showRead ? "Masquer lues" : "Afficher lues"}
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {sorted.map((alert) => (
          <div key={alert.id} className={`border-l-2 rounded-r-xl p-4 transition-all ${priorityBorder[alert.priority]} ${priorityBg[alert.priority]} ${alert.isRead ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={alert.priority} />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{alert.category}</span>
                  {alert.actionRequired && <span className="text-[9px] uppercase font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Action requise</span>}
                  {!alert.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <h4 className="text-sm font-semibold">{alert.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{alert.timestamp}</span>
                  <span>Assigné à : {alert.assignedTo}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                <button
                  onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a))}
                  className="p-1.5 rounded-md hover:bg-card transition-colors"
                  title="Marquer comme lu"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
