import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useDashboardData } from "./hooks/useDashboardData";
import { PageHeader } from "@/shared/components";
import { LayoutDashboard } from "lucide-react";
import SalesKpiGrid from "./components/SalesKpiGrid";
import StockKpiGrid from "./components/StockKpiGrid";
import WarehouseScopePanel from "./components/WarehouseScopePanel";
import AlertsFeed from "./components/AlertsFeed";
import QuickActions from "./components/QuickActions";
import ActivityTimeline from "./components/ActivityTimeline";
import {
  MemoizedSalesPerformanceBar as SalesPerformanceBar,
  MemoizedWeeklySalesChart as WeeklySalesChart,
  MemoizedInventoryPieChart as InventoryPieChart,
  MemoizedWarehouseBarChart as WarehouseBarChart,
  MemoizedRecentOrdersTable as RecentOrdersTable,
  MemoizedTopProducts as TopProducts,
  MemoizedCashFlowSparkline as CashFlowSparkline,
} from "./components/MemoizedCharts";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const d = useDashboardData();

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <PageHeader
          title={t("dashboard.title")}
          description={t("dashboard.subtitle")}
          icon={<LayoutDashboard className="h-5 w-5" />}
          hideBreadcrumbs
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <QuickActions />
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={fadeUp} className="kpi-grid">
        {d.showFinancials ? (
          <SalesKpiGrid
            totalSales={d.totalSales}
            orderCount={d.scopedSalesOrders.length}
            activeOrders={d.activeOrders.length}
            pickingCount={d.pickingCount}
            inTransitDeliveries={d.inTransitDeliveries.length}
            totalDeliveries={d.deliveryTrips.length}
            totalCollected={d.totalCollected}
            collectedPct={d.collectedPct}
            totalInvoiced={d.totalInvoiced}
          />
        ) : (
          <StockKpiGrid
            totalStockItems={d.totalStockItems}
            refCount={d.scopedInventory.length}
            lowStockCount={d.lowStockCount}
            expiringSoon={d.expiringSoon}
            activeOrders={d.activeOrders.length}
            pickingCount={d.pickingCount}
          />
        )}
      </motion.div>

      {/* Sales Performance */}
      {d.showFinancials && (
        <motion.div variants={fadeUp}>
          <SalesPerformanceBar
            pipelineValue={d.pipelineValue}
            pipelineCount={d.draftOrders.length + d.activeOrders.length}
            conversionRate={d.conversionRate}
            deliveredCount={d.deliveredOrders.length}
            totalCount={d.scopedSalesOrders.length}
            avgOrderValue={d.avgOrderValue}
            creditHoldCount={d.creditHoldCount}
            activeClients={d.activeClients}
            totalClients={d.customers.length}
          />
        </motion.div>
      )}

      {/* Warehouse Scope (restricted users) */}
      {!d.isFullAccess && d.accessibleWarehouseIds && d.accessibleWarehouseIds.length > 0 && (
        <motion.div variants={fadeUp}>
          <WarehouseScopePanel
            accessibleWarehouseIds={d.accessibleWarehouseIds}
            warehouses={d.warehouses}
            inventory={d.inventory}
          />
        </motion.div>
      )}

      {/* Cash Flow + Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {d.showFinancials && <WeeklySalesChart data={d.salesData} />}
        <InventoryPieChart data={d.inventoryByCategory} />
      </motion.div>

      {/* Cash Flow Sparkline */}
      {d.showFinancials && (
        <motion.div variants={fadeUp}>
          <CashFlowSparkline />
        </motion.div>
      )}

      {/* Warehouse Breakdown */}
      {d.warehouseBreakdown.length > 0 && d.isFullAccess && d.showFinancials && (
        <motion.div variants={fadeUp}>
          <WarehouseBarChart data={d.warehouseBreakdown} />
        </motion.div>
      )}

      {/* Bottom Row: Orders + Alerts + Top Products + Timeline */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrdersTable orders={d.recentOrders} />
        <AlertsFeed alerts={d.alerts} unreadCount={d.unreadAlerts.length} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProducts />
        <ActivityTimeline />
      </motion.div>
    </motion.div>
  );
}
