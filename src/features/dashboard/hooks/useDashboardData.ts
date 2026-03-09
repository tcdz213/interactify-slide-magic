import { useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/rbac";
import { useTranslation } from "react-i18next";

export function useDashboardData() {
  const { salesOrders, deliveryTrips, payments, invoices, alerts, inventory, warehouses, customers } = useWMSData();
  const { currentUser, accessibleWarehouseIds, isFullAccess } = useAuth();
  const showFinancials = currentUser ? canViewFinancials(currentUser) : false;
  const { t } = useTranslation();

  const scopedInventory = useMemo(
    () => isFullAccess ? inventory : inventory.filter((i: any) => accessibleWarehouseIds?.includes(i.warehouseId)),
    [isFullAccess, inventory, accessibleWarehouseIds]
  );

  const salesData = useMemo(() => {
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
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - idx));
      const key = d.toISOString().slice(0, 10);
      const dayName = dayLabels[d.getDay()];
      const entry = salesByDate.get(key);
      return { name: dayName, ventes: entry?.ventes ?? 0, commandes: entry?.commandes ?? 0 };
    });
  }, [salesOrders, t]);

  const scopedSalesOrders = useMemo(
    () => isFullAccess
      ? salesOrders
      : salesOrders.filter((o: any) =>
          o.items?.some((item: any) =>
            inventory.some(
              (inv: any) => inv.productId === item.productId && accessibleWarehouseIds?.includes(inv.warehouseId)
            )
          )
        ),
    [isFullAccess, salesOrders, inventory, accessibleWarehouseIds]
  );

  const totalSales = useMemo(() => scopedSalesOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0), [scopedSalesOrders]);
  const activeOrders = useMemo(() => scopedSalesOrders.filter((o: any) => o.status === "Approved" || o.status === "Picking" || o.status === "Shipped"), [scopedSalesOrders]);
  const pickingCount = useMemo(() => activeOrders.filter((o: any) => o.status === "Picking").length, [activeOrders]);

  const inTransitDeliveries = useMemo(() => deliveryTrips.filter((d: any) => d.status === "InProgress" || d.status === "InTransit"), [deliveryTrips]);

  const { totalCollected, totalInvoiced, collectedPct } = useMemo(() => {
    const collected = payments.filter((p: any) => p.status === "Validated").reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const invoiced = invoices.reduce((s: number, inv: any) => s + (inv.totalAmount || 0), 0);
    return { totalCollected: collected, totalInvoiced: invoiced, collectedPct: invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0 };
  }, [payments, invoices]);

  const totalStockItems = useMemo(() => scopedInventory.reduce((s: number, i: any) => s + i.qtyOnHand, 0), [scopedInventory]);
  const lowStockCount = useMemo(() => scopedInventory.filter((i: any) => i.qtyAvailable < i.reorderPoint).length, [scopedInventory]);
  const expiringSoon = useMemo(() => scopedInventory.filter((i: any) => i.daysToExpiry <= 30).length, [scopedInventory]);

  const inventoryByCategory = useMemo(() => {
    const catMap = new Map<string, number>();
    scopedInventory.forEach((inv: any) => {
      const cat = inv.category ?? "Autre";
      catMap.set(cat, (catMap.get(cat) ?? 0) + inv.qtyOnHand);
    });
    const totalQty = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, value: Math.round((qty / totalQty) * 100) }));
  }, [scopedInventory]);

  const warehouseBreakdown = useMemo(
    () => isFullAccess
      ? warehouses.map((wh: any) => {
          const whInv = inventory.filter((i: any) => i.warehouseId === wh.id);
          const value = whInv.reduce((s: number, i: any) => s + i.qtyOnHand * i.unitCostAvg, 0);
          return { name: wh.name, value, items: whInv.length, type: wh.type, utilization: wh.utilization ?? 0 };
        })
      : [],
    [isFullAccess, warehouses, inventory]
  );

  const deliveredOrders = useMemo(() => scopedSalesOrders.filter((o: any) => o.status === "Delivered" || o.status === "Invoiced"), [scopedSalesOrders]);
  const draftOrders = useMemo(() => scopedSalesOrders.filter((o: any) => o.status === "Draft" || o.status === "Credit_Hold"), [scopedSalesOrders]);
  const pipelineValue = useMemo(() => draftOrders.reduce((s: number, o: any) => s + o.totalAmount, 0) + activeOrders.reduce((s: number, o: any) => s + o.totalAmount, 0), [draftOrders, activeOrders]);
  const conversionRate = useMemo(() => scopedSalesOrders.length > 0 ? Math.round((deliveredOrders.length / scopedSalesOrders.length) * 100) : 0, [deliveredOrders, scopedSalesOrders]);
  const creditHoldCount = useMemo(() => scopedSalesOrders.filter((o: any) => o.status === "Credit_Hold").length, [scopedSalesOrders]);
  const avgOrderValue = useMemo(() => scopedSalesOrders.length > 0 ? totalSales / scopedSalesOrders.length : 0, [totalSales, scopedSalesOrders]);

  const recentOrders = useMemo(() => [...salesOrders].sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || "")).slice(0, 5), [salesOrders]);
  const unreadAlerts = useMemo(() => alerts.filter((a) => !a.isRead), [alerts]);
  const activeClients = useMemo(() => customers.filter((c: any) => c.status === "Active").length, [customers]);

  return {
    showFinancials,
    isFullAccess,
    accessibleWarehouseIds,
    scopedInventory,
    salesData,
    scopedSalesOrders,
    totalSales,
    activeOrders,
    pickingCount,
    deliveryTrips,
    inTransitDeliveries,
    totalCollected,
    totalInvoiced,
    collectedPct,
    totalStockItems,
    lowStockCount,
    expiringSoon,
    inventoryByCategory,
    warehouseBreakdown,
    deliveredOrders,
    draftOrders,
    pipelineValue,
    conversionRate,
    creditHoldCount,
    avgOrderValue,
    recentOrders,
    unreadAlerts,
    alerts,
    warehouses,
    inventory,
    customers,
    activeClients,
  };
}
