import { Link } from "react-router-dom";
import KpiCard from "@/components/KpiCard";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  TrendingUp,
  Clock,
  Building2,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { currency } from "@/data/mockData";
import { getWarehouseShortName, getWarehouseBadgeStyle, canViewFinancials } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// Constants for styling
const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
];

const statusColors: Record<string, string> = {
  Approved: "bg-info/10 text-info",
  Picking: "bg-warning/10 text-warning",
  Shipped: "bg-primary/10 text-primary",
  Delivered: "bg-success/10 text-success",
  Invoiced: "bg-muted text-muted-foreground",
  Draft: "bg-muted/50 text-muted-foreground",
};

const alertPriorityStyles: Record<string, string> = {
  Critical: "border-l-destructive bg-destructive/5",
  High: "border-l-destructive/80 bg-destructive/5",
  Medium: "border-l-warning bg-warning/5",
  Low: "border-l-info bg-info/5",
};

export default function Dashboard() {
  const { salesOrders, deliveryTrips, payments, invoices, alerts, inventory, warehouses, customers } = useWMSData();
  const { currentUser, accessibleWarehouseIds, isFullAccess } = useAuth();
  const showFinancials = currentUser ? canViewFinancials(currentUser) : false;
  const { t } = useTranslation();

  // ----- Stock scoping by warehouse (Layer 2) -----
  const scopedInventory = isFullAccess
    ? inventory
    : inventory.filter((i: any) => accessibleWarehouseIds?.includes(i.warehouseId));

  // ----- Dynamic sales series (last 7 days) from mock salesOrders -----
  const salesByDate = new Map<string, { ventes: number; commandes: number }>();
  for (const o of salesOrders) {
    const key = (o.orderDate || "").slice(0, 10);
    if (!key) continue;
    const prev = salesByDate.get(key) || { ventes: 0, commandes: 0 };
    prev.ventes += o.totalAmount;
    prev.commandes += 1;
    salesByDate.set(key, prev);
  }
  const dayLabels = [t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"), t("days.thu"), t("days.fri"), t("days.sat")];
  const today = new Date();
  const salesData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - idx));
    const key = d.toISOString().slice(0, 10);
    const dayName = dayLabels[d.getDay()];
    const entry = salesByDate.get(key);
    return { name: dayName, ventes: entry?.ventes ?? 0, commandes: entry?.commandes ?? 0 };
  });

  // ----- Sales KPIs from mock data -----
  const scopedSalesOrders = isFullAccess
    ? salesOrders
    : salesOrders.filter((o: any) =>
        o.items?.some((item: any) =>
          inventory.some(
            (inv: any) =>
              inv.productId === item.productId &&
              accessibleWarehouseIds?.includes(inv.warehouseId)
          )
        )
      );
  const totalSales = scopedSalesOrders.reduce(
    (s: number, o: any) => s + (o.totalAmount || 0),
    0
  );
  const activeOrders = scopedSalesOrders.filter(
    (o: any) =>
      o.status === "Approved" ||
      o.status === "Picking" ||
      o.status === "Shipped"
  );
  const pickingCount = activeOrders.filter(
    (o: any) => o.status === "Picking"
  ).length;

  // ----- Delivery trips (Layer 2 scoped) -----
  const allDeliveries = deliveryTrips;
  const inTransitDeliveries = allDeliveries.filter(
    (d: any) => d.status === "InProgress" || d.status === "InTransit"
  );

  // ----- Payments / Invoices (Financial) -----
  const totalCollected = payments
    .filter((p: any) => p.status === "Validated")
    .reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const totalInvoiced = invoices.reduce(
    (s: number, inv: any) => s + (inv.totalAmount || 0),
    0
  );
  const collectedPct =
    totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  // ----- Stock KPIs (scoped) -----
  const totalStockItems = scopedInventory.reduce(
    (s: number, i: any) => s + i.qtyOnHand,
    0
  );
  const lowStockCount = scopedInventory.filter(
    (i: any) => i.qtyAvailable < i.reorderPoint
  ).length;
  const expiringSoon = scopedInventory.filter(
    (i: any) => i.daysToExpiry <= 30
  ).length;

  // ----- Inventory pie data (Layer 2 scoped) -----
  const catMap = new Map<string, number>();
  scopedInventory.forEach((inv: any) => {
    const cat = inv.category ?? "Autre";
    catMap.set(cat, (catMap.get(cat) ?? 0) + inv.qtyOnHand);
  });
  const totalQty = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
  const inventoryByCategory = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({
      name,
      value: Math.round((qty / totalQty) * 100),
    }));

  // ----- Warehouse breakdown for full-access users -----
  const warehouseBreakdown = isFullAccess
    ? warehouses.map((wh: any) => {
        const whInv = inventory.filter((i: any) => i.warehouseId === wh.id);
        const value = whInv.reduce(
          (s: number, i: any) => s + i.qtyOnHand * i.unitCostAvg,
          0
        );
        return {
          name: wh.name,
          value,
          items: whInv.length,
          type: wh.type,
          utilization: wh.utilization ?? 0,
        };
      })
    : [];

  // Sprint A2 — Sales KPIs
  const deliveredOrders = scopedSalesOrders.filter(o => o.status === "Delivered" || o.status === "Invoiced");
  const draftOrders = scopedSalesOrders.filter(o => o.status === "Draft" || o.status === "Credit_Hold");
  const pipelineValue = draftOrders.reduce((s, o) => s + o.totalAmount, 0) + activeOrders.reduce((s, o) => s + o.totalAmount, 0);
  const conversionRate = scopedSalesOrders.length > 0 ? Math.round((deliveredOrders.length / scopedSalesOrders.length) * 100) : 0;
  const creditHoldCount = scopedSalesOrders.filter(o => o.status === "Credit_Hold").length;
  const avgOrderValue = scopedSalesOrders.length > 0 ? totalSales / scopedSalesOrders.length : 0;

  const recentOrders = [...salesOrders]
    .sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""))
    .slice(0, 5);
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* KPI Grid — financial vs operational */}
      <div className="kpi-grid">
        {showFinancials ? (
          <>
            <KpiCard title={t("dashboard.totalRevenue")} value={currency(totalSales)} change={`${scopedSalesOrders.length} ${t("dashboard.orders")}`} changeType="neutral" icon={TrendingUp} delay={0} />
            <KpiCard title={t("dashboard.activeOrders")} value={String(activeOrders.length)} change={pickingCount ? `${pickingCount} ${t("dashboard.inPicking")}` : "—"} changeType="neutral" icon={ShoppingCart} delay={50} />
            <KpiCard title={t("dashboard.deliveriesInProgress")} value={String(inTransitDeliveries.length)} change={`${allDeliveries.length} ${t("dashboard.total")}`} changeType="neutral" icon={Truck} delay={100} />
            <KpiCard title={t("dashboard.collections")} value={currency(totalCollected)} change={totalInvoiced > 0 ? `${collectedPct}% ${t("dashboard.ofInvoiced")}` : "—"} changeType="up" icon={CreditCard} delay={150} />
          </>
        ) : (
          <>
            <KpiCard title={t("dashboard.stockItems")} value={String(totalStockItems)} change={`${scopedInventory.length} ${t("dashboard.references")}`} changeType="neutral" icon={Package} delay={0} />
            <KpiCard title={t("dashboard.criticalStock")} value={String(lowStockCount)} change={lowStockCount > 0 ? t("dashboard.belowMinThreshold") : t("dashboard.allOk")} changeType={lowStockCount > 0 ? "down" : "neutral"} icon={AlertTriangle} delay={50} />
            <KpiCard title={t("dashboard.expiringSoon")} value={String(expiringSoon)} change={expiringSoon > 0 ? t("dashboard.attentionRequired") : t("dashboard.none")} changeType={expiringSoon > 0 ? "down" : "neutral"} icon={Clock} delay={100} />
            <KpiCard title={t("dashboard.activeOrders")} value={String(activeOrders.length)} change={pickingCount ? `${pickingCount} ${t("dashboard.inPicking")}` : "—"} changeType="neutral" icon={ShoppingCart} delay={150} />
          </>
        )}
      </div>

      {/* Sprint A2 — Sales Performance KPIs */}
      {showFinancials && (
        <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{t("dashboard.salesPerformance")}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.pipeline")}</p>
              <p className="text-lg font-bold text-primary">{currency(pipelineValue)}</p>
              <p className="text-[10px] text-muted-foreground">{draftOrders.length + activeOrders.length} {t("dashboard.orders")}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.conversionRate")}</p>
              <p className={`text-lg font-bold ${conversionRate >= 70 ? "text-success" : conversionRate >= 40 ? "text-warning" : "text-destructive"}`}>{conversionRate}%</p>
              <p className="text-[10px] text-muted-foreground">{deliveredOrders.length}/{scopedSalesOrders.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.avgBasket")}</p>
              <p className="text-lg font-bold">{currency(avgOrderValue)}</p>
              <p className="text-[10px] text-muted-foreground">{t("dashboard.perOrder")}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.creditBlocked")}</p>
              <p className={`text-lg font-bold ${creditHoldCount > 0 ? "text-destructive" : "text-success"}`}>{creditHoldCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("dashboard.orders")}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.activeClients")}</p>
              <p className="text-lg font-bold">{customers.filter(c => c.status === "Active").length}</p>
              <p className="text-[10px] text-muted-foreground">/{customers.length} {t("common.total").toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mon périmètre — warehouse-scoped KPIs for restricted users */}
      {!isFullAccess && accessibleWarehouseIds && accessibleWarehouseIds.length > 0 && (
        <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{t("dashboard.myScope")}</h3>
            <span className="text-xs text-muted-foreground">— {t("dashboard.stockByWarehouse")}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accessibleWarehouseIds.map(whId => {
              const wh = warehouses.find(w => w.id === whId);
              const whInventory = inventory.filter((i: any) => i.warehouseId === whId);
              const totalValue = whInventory.reduce((s: number, i: any) => s + i.qtyOnHand * i.unitCostAvg, 0);
              const totalItems = whInventory.length;
              const lowStock = whInventory.filter((i: any) => i.qtyAvailable < i.reorderPoint).length;
              const expiringSoon = whInventory.filter((i: any) => i.daysToExpiry <= 30).length;
              return (
                <div key={whId} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border", getWarehouseBadgeStyle(whId))}>
                      <Building2 className="h-3 w-3" />
                      {getWarehouseShortName(whId)}
                    </span>
                    <span className="text-xs text-muted-foreground">{wh?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">{t("dashboard.stockValue")}</p>
                      <p className="font-semibold text-sm">{currency(totalValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("dashboard.itemCount")}</p>
                      <p className="font-semibold text-sm">{totalItems}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        {lowStock > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                        {t("dashboard.lowStock")}
                      </p>
                      <p className={`font-semibold text-sm ${lowStock > 0 ? "text-warning" : ""}`}>{lowStock}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        {expiringSoon > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        {t("dashboard.expiring")}
                      </p>
                      <p className={`font-semibold text-sm ${expiringSoon > 0 ? "text-destructive" : ""}`}>{expiringSoon}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, (wh?.utilization ?? 0))}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">{wh?.utilization ?? 0}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart — financial only */}
        {showFinancials && <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">{t("dashboard.weeklySales")}</h3>
              <p className="text-xs text-muted-foreground">{t("dashboard.dailyRevenue")}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [currency(value), t("dashboard.weeklySales")]}
              />
              <Area type="monotone" dataKey="ventes" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>}

        {/* Inventory Pie */}
        <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "250ms" }}>
          <h3 className="text-sm font-semibold mb-1">{t("dashboard.stockByCategory")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("dashboard.currentDistribution")}</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={inventoryByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {inventoryByCategory.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {inventoryByCategory.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Breakdown Chart — only for full access + financial */}
      {warehouseBreakdown.length > 0 && isFullAccess && showFinancials && (
        <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "270ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">{t("dashboard.stockByCategory", "Stock par entrepôt")}</h3>
              <p className="text-xs text-muted-foreground">{t("dashboard.stockByWarehouse")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={warehouseBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [currency(value), t("dashboard.stockValue")]}
                />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {warehouseBreakdown.map((wh, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{wh.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{wh.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{currency(wh.value)}</span>
                    <span>{wh.items} {t("dashboard.itemCount").toLowerCase()}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, wh.utilization)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right mt-0.5">{wh.utilization}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">{t("dashboard.recentOrders")}</h3>
            </div>
            <Link to="/sales/orders" className="text-[11px] font-medium text-primary hover:underline">{t("dashboard.viewAll")} →</Link>
          </div>
          <div className="space-y-2.5">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">{t("common.noResults")}</p>
            ) : (
              recentOrders.map((order) => (
                <Link key={order.id} to="/sales/orders" className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded px-1 -mx-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono font-medium">{order.id}</p>
                    <p className="text-[11px] text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] ?? "bg-muted"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-semibold w-24 text-right">{currency(order.totalAmount)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "350ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{t("notifications.alerts")}</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadAlerts.length}
              </span>
            </div>
            <Link to="/bi/alerts" className="text-[11px] font-medium text-primary hover:underline">{t("dashboard.viewAll")} →</Link>
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">{t("notifications.noAlerts")}</p>
            ) : (
              alerts.slice(0, 4).map((alert) => (
                <Link key={alert.id} to="/bi/alerts" className={`block border-l-2 rounded-r-lg px-3 py-2.5 ${alertPriorityStyles[alert.priority] ?? "border-l-muted bg-muted/5"} hover:opacity-90`}>
                  <p className={`text-xs font-medium leading-relaxed ${!alert.isRead ? "text-foreground" : "text-muted-foreground"}`}>{alert.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {alert.timestamp}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
