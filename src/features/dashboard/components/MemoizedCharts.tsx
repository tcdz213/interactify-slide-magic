/**
 * Phase 7 — React.memo wrappers for expensive chart components.
 * Prevents unnecessary re-renders when parent dashboard state changes.
 */
import React from "react";
import WeeklySalesChart from "./WeeklySalesChart";
import InventoryPieChart from "./InventoryPieChart";
import WarehouseBarChart from "./WarehouseBarChart";
import SalesPerformanceBar from "./SalesPerformanceBar";
import CashFlowSparkline from "./CashFlowSparkline";
import TopProducts from "./TopProducts";
import RecentOrdersTable from "./RecentOrdersTable";

export const MemoizedWeeklySalesChart = React.memo(WeeklySalesChart);
MemoizedWeeklySalesChart.displayName = "MemoizedWeeklySalesChart";

export const MemoizedInventoryPieChart = React.memo(InventoryPieChart);
MemoizedInventoryPieChart.displayName = "MemoizedInventoryPieChart";

export const MemoizedWarehouseBarChart = React.memo(WarehouseBarChart);
MemoizedWarehouseBarChart.displayName = "MemoizedWarehouseBarChart";

export const MemoizedSalesPerformanceBar = React.memo(SalesPerformanceBar);
MemoizedSalesPerformanceBar.displayName = "MemoizedSalesPerformanceBar";

export const MemoizedCashFlowSparkline = React.memo(CashFlowSparkline);
MemoizedCashFlowSparkline.displayName = "MemoizedCashFlowSparkline";

export const MemoizedTopProducts = React.memo(TopProducts);
MemoizedTopProducts.displayName = "MemoizedTopProducts";

export const MemoizedRecentOrdersTable = React.memo(RecentOrdersTable);
MemoizedRecentOrdersTable.displayName = "MemoizedRecentOrdersTable";
