import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute, FinancialRoute } from "@/app/guards";
import AppLayout from "@/components/AppLayout";

// ─── WMS Pages ───
const Dashboard = lazy(() => import("@/features/dashboard/DashboardPage"));
const GrnPage = lazy(() => import("@/pages/wms").then((m) => ({ default: m.GrnPage })));
const InventoryPage = lazy(() => import("@/pages/wms").then((m) => ({ default: m.InventoryPage })));
const ReturnsPage = lazy(() => import("@/pages/wms").then((m) => ({ default: m.ReturnsPage })));
const PurchaseOrdersPage = lazy(() => import("@/pages/wms/PurchaseOrdersPage"));
const VendorsPage = lazy(() => import("@/pages/wms/VendorsPage"));
const WarehousesPage = lazy(() => import("@/pages/wms/WarehousesPage"));
const CycleCountPage = lazy(() => import("@/pages/wms/CycleCountPage"));
const StockAdjustmentsPage = lazy(() => import("@/pages/wms/StockAdjustmentsPage"));
const StockTransfersPage = lazy(() => import("@/pages/wms/StockTransfersPage"));
const ProductsPage = lazy(() => import("@/pages/wms/ProductsPage"));
const CategoriesPage = lazy(() => import("@/pages/wms/CategoriesPage"));
const UomPage = lazy(() => import("@/pages/wms/UomPage"));
const PaymentTermsPage = lazy(() => import("@/pages/wms/PaymentTermsPage"));
const CarriersPage = lazy(() => import("@/pages/wms/CarriersPage"));
const BarcodesPage = lazy(() => import("@/pages/wms/BarcodesPage"));
const LocationsPage = lazy(() => import("@/pages/wms/LocationsPage"));
const QualityControlPage = lazy(() => import("@/pages/wms/QualityControlPage"));
const PutawayPage = lazy(() => import("@/pages/wms/PutawayPage"));
const MovementJournalPage = lazy(() => import("@/pages/wms/MovementJournalPage"));
const WavesPage = lazy(() => import("@/pages/wms/WavesPage"));
const PickingPage = lazy(() => import("@/pages/wms/PickingPage"));
const PackingPage = lazy(() => import("@/pages/wms/PackingPage"));
const ShippingPage = lazy(() => import("@/pages/wms/ShippingPage"));
const ReplenishmentRulesPage = lazy(() => import("@/pages/wms/ReplenishmentRulesPage"));
const ReservationsPage = lazy(() => import("@/pages/wms/ReservationsPage"));
const CreditNotesPage = lazy(() => import("@/pages/wms/CreditNotesPage"));
const QualityClaimsPage = lazy(() => import("@/pages/wms/QualityClaimsPage"));
const VendorScorecardPage = lazy(() => import("@/pages/wms/VendorScorecardPage"));
const TaskQueuePage = lazy(() => import("@/pages/wms/TaskQueuePage"));
const CrossDockingPage = lazy(() => import("@/pages/wms/CrossDockingPage"));
const KittingPage = lazy(() => import("@/pages/wms/KittingPage"));
const StockBlockPage = lazy(() => import("@/pages/wms/StockBlockPage"));
const RepackingPage = lazy(() => import("@/pages/wms/RepackingPage"));
const LotBatchPage = lazy(() => import("@/pages/wms/LotBatchPage"));
const SerialNumbersPage = lazy(() => import("@/pages/wms/SerialNumbersPage"));
const StockValuationPage = lazy(() => import("@/pages/wms/StockValuationPage"));
const WarehouseStockDashboard = lazy(() => import("@/pages/wms/WarehouseStockDashboard"));
const YardDockPage = lazy(() => import("@/pages/wms/YardDockPage"));
const SupplierContractsPage = lazy(() => import("@/pages/wms/SupplierContractsPage"));
const MatchExceptionsPage = lazy(() => import("@/pages/wms/MatchExceptionsPage"));
const PriceHistoryPage = lazy(() => import("@/pages/wms/PriceHistoryPage"));
const AutomationApiPage = lazy(() => import("@/pages/wms/AutomationApiPage"));

// ─── Sales Pages ───
const OrdersPage = lazy(() => import("@/pages/sales").then((m) => ({ default: m.OrdersPage })));
const CustomersPage = lazy(() => import("@/pages/sales").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("@/pages/sales/CustomerDetailPage"));
const RoutePlanPage = lazy(() => import("@/pages/sales/RoutePlanPage"));

// ─── Distribution Pages ───
const RoutesPage = lazy(() => import("@/pages/distribution").then((m) => ({ default: m.RoutesPage })));
const DeliveriesPage = lazy(() => import("@/pages/distribution").then((m) => ({ default: m.DeliveriesPage })));

// ─── Accounting Pages ───
const InvoicesPage = lazy(() => import("@/pages/accounting").then((m) => ({ default: m.InvoicesPage })));
const PaymentsPage = lazy(() => import("@/pages/accounting").then((m) => ({ default: m.PaymentsPage })));
const AccountingReportsPage = lazy(() => import("@/pages/accounting").then((m) => ({ default: m.AccountingReportsPage })));
const ChartOfAccountsPage = lazy(() => import("@/pages/accounting/ChartOfAccountsPage"));
const BudgetCostCentersPage = lazy(() => import("@/pages/accounting/BudgetCostCentersPage"));
const GrniReportPage = lazy(() => import("@/pages/accounting/GrniReportPage"));
const PaymentRunsPage = lazy(() => import("@/pages/accounting/PaymentRunsPage"));
const BankReconciliationPage = lazy(() => import("@/pages/accounting/BankReconciliationPage"));

// ─── BI Pages ───
const PerformancePage = lazy(() => import("@/pages/bi").then((m) => ({ default: m.PerformancePage })));
const AlertsPage = lazy(() => import("@/pages/bi").then((m) => ({ default: m.AlertsPage })));
const ProfitabilityDashboard = lazy(() => import("@/pages/bi/ProfitabilityDashboard"));
const CategoryDistributionPage = lazy(() => import("@/pages/bi/CategoryDistributionPage"));

// ─── Reports Pages ───
const ReportsOverviewPage = lazy(() => import("@/pages/reports/ReportsOverviewPage"));
const ReportBuilderPage = lazy(() => import("@/pages/reports/ReportBuilderPage"));
const MarginHistoryPage = lazy(() => import("@/pages/reports/MarginHistoryPage"));

// ─── Settings Pages ───
const AuditLogPage = lazy(() => import("@/pages/settings/AuditLogPage"));
const PickingStrategyPage = lazy(() => import("@/pages/settings/PickingStrategyPage"));
const ApprovalWorkflowsPage = lazy(() => import("@/pages/settings/ApprovalWorkflowsPage"));
const PutawayRulesPage = lazy(() => import("@/pages/settings/PutawayRulesPage"));
const AlertRulesPage = lazy(() => import("@/pages/settings/AlertRulesPage"));
const LocationTypesPage = lazy(() => import("@/pages/settings/LocationTypesPage"));
const IntegrationsPage = lazy(() => import("@/pages/settings/IntegrationsPage"));
const UserManagementPage = lazy(() => import("@/pages/settings/UserManagementPage"));
const SystemSettingsPage = lazy(() => import("@/pages/settings/SystemSettingsPage"));
const CurrencyRatesPage = lazy(() => import("@/pages/settings/CurrencyRatesPage"));
const TaxConfigPage = lazy(() => import("@/pages/settings/TaxConfigPage"));

// ─── Module Pages ───
const DailyClosingPage = lazy(() => import("@/pages/DailyClosingPage"));
const ClientTypesPage = lazy(() => import("@/modules/client-types/ClientTypesPage"));
const PricingPage = lazy(() => import("@/modules/pricing/PricingPage"));

// ─── Supplier Portal Pages ───
const SupplierDashboardPage = lazy(() => import("@/pages/supplier/SupplierDashboardPage"));
const SupplierProductsPage = lazy(() => import("@/pages/supplier/SupplierProductsPage"));
const SupplierOrdersPage = lazy(() => import("@/pages/supplier/SupplierOrdersPage"));
const SupplierInvoicesPage = lazy(() => import("@/pages/supplier/SupplierInvoicesPage"));
const SupplierStatsPage = lazy(() => import("@/pages/supplier/SupplierStatsPage"));
const SupplierProfilePage = lazy(() => import("@/pages/supplier/SupplierProfilePage"));

export function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />

        {/* ─── WMS ─── */}
        <Route path="/wms/grn" element={<GrnPage />} />
        <Route path="/wms/inventory" element={<InventoryPage />} />
        <Route path="/wms/returns" element={<ReturnsPage />} />
        <Route path="/wms/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/wms/vendors" element={<VendorsPage />} />
        <Route path="/wms/warehouses" element={<WarehousesPage />} />
        <Route path="/wms/cycle-count" element={<CycleCountPage />} />
        <Route path="/wms/adjustments" element={<StockAdjustmentsPage />} />
        <Route path="/wms/transfers" element={<StockTransfersPage />} />
        <Route path="/wms/products" element={<ProductsPage />} />
        <Route path="/wms/categories" element={<CategoriesPage />} />
        <Route path="/wms/uom" element={<UomPage />} />
        <Route path="/wms/payment-terms" element={<PaymentTermsPage />} />
        <Route path="/wms/carriers" element={<CarriersPage />} />
        <Route path="/wms/barcodes" element={<BarcodesPage />} />
        <Route path="/wms/locations" element={<LocationsPage />} />
        <Route path="/wms/quality-control" element={<QualityControlPage />} />
        <Route path="/wms/putaway" element={<PutawayPage />} />
        <Route path="/wms/movements" element={<MovementJournalPage />} />
        <Route path="/wms/waves" element={<WavesPage />} />
        <Route path="/wms/picking" element={<PickingPage />} />
        <Route path="/wms/packing" element={<PackingPage />} />
        <Route path="/wms/shipping" element={<ShippingPage />} />
        <Route path="/wms/replenishment-rules" element={<ReplenishmentRulesPage />} />
        <Route path="/wms/reservations" element={<ReservationsPage />} />
        <Route path="/wms/supplier-returns" element={<ReturnsPage />} />
        <Route path="/wms/credit-notes" element={<CreditNotesPage />} />
        <Route path="/wms/quality-claims" element={<QualityClaimsPage />} />
        <Route path="/wms/vendor-scorecard" element={<VendorScorecardPage />} />
        <Route path="/wms/tasks" element={<TaskQueuePage />} />
        <Route path="/wms/cross-docking" element={<CrossDockingPage />} />
        <Route path="/wms/kitting" element={<KittingPage />} />
        <Route path="/wms/stock-block" element={<StockBlockPage />} />
        <Route path="/wms/repacking" element={<RepackingPage />} />
        <Route path="/wms/lot-batch" element={<LotBatchPage />} />
        <Route path="/wms/serial-numbers" element={<SerialNumbersPage />} />
        <Route path="/wms/stock-valuation" element={<StockValuationPage />} />
        <Route path="/wms/stock-dashboard" element={<WarehouseStockDashboard />} />
        <Route path="/wms/yard-dock" element={<YardDockPage />} />
        <Route path="/wms/supplier-contracts" element={<SupplierContractsPage />} />
        <Route path="/wms/match-exceptions" element={<MatchExceptionsPage />} />
        <Route path="/wms/price-history" element={<PriceHistoryPage />} />
        <Route path="/wms/automation" element={<AutomationApiPage />} />

        {/* ─── Sales ─── */}
        <Route path="/sales/orders" element={<OrdersPage />} />
        <Route path="/sales/customers" element={<CustomersPage />} />
        <Route path="/sales/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/sales/route-plan" element={<RoutePlanPage />} />

        {/* ─── Distribution ─── */}
        <Route path="/distribution/routes" element={<RoutesPage />} />
        <Route path="/distribution/deliveries" element={<DeliveriesPage />} />

        {/* ─── Accounting (Financial-protected) ─── */}
        <Route element={<FinancialRoute />}>
          <Route path="/accounting/invoices" element={<InvoicesPage />} />
          <Route path="/accounting/payments" element={<PaymentsPage />} />
          <Route path="/accounting/reports" element={<AccountingReportsPage />} />
          <Route path="/accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
          <Route path="/accounting/budgets" element={<BudgetCostCentersPage />} />
          <Route path="/accounting/grni" element={<GrniReportPage />} />
          <Route path="/accounting/payment-runs" element={<PaymentRunsPage />} />
          <Route path="/accounting/bank-reconciliation" element={<BankReconciliationPage />} />
        </Route>

        {/* ─── BI ─── */}
        <Route path="/bi/performance" element={<PerformancePage />} />
        <Route path="/bi/alerts" element={<AlertsPage />} />
        <Route path="/bi/profitability" element={<ProfitabilityDashboard />} />
        <Route path="/bi/categories" element={<CategoryDistributionPage />} />

        {/* ─── Reports ─── */}
        <Route path="/reports" element={<ReportsOverviewPage />} />
        <Route path="/reports/builder" element={<ReportBuilderPage />} />
        <Route path="/reports/margin-history" element={<MarginHistoryPage />} />

        {/* ─── Settings ─── */}
        <Route path="/settings" element={<Navigate to="/settings/users" replace />} />
        <Route path="/settings/audit-log" element={<AuditLogPage />} />
        <Route path="/settings/picking-strategy" element={<PickingStrategyPage />} />
        <Route path="/settings/approval-workflows" element={<ApprovalWorkflowsPage />} />
        <Route path="/settings/putaway-rules" element={<PutawayRulesPage />} />
        <Route path="/settings/alert-rules" element={<AlertRulesPage />} />
        <Route path="/settings/location-types" element={<LocationTypesPage />} />
        <Route path="/settings/integrations" element={<IntegrationsPage />} />
        <Route path="/settings/currencies" element={<CurrencyRatesPage />} />
        <Route path="/settings/tax-config" element={<TaxConfigPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/settings/users" element={<UserManagementPage />} />
          <Route path="/settings/system" element={<SystemSettingsPage />} />
        </Route>

        {/* ─── Other ─── */}
        <Route path="/closing" element={<DailyClosingPage />} />
        <Route path="/pricing/client-types" element={<ClientTypesPage />} />
        <Route path="/pricing/prices" element={<PricingPage />} />

        {/* ─── Supplier Portal (inside main layout) ─── */}
        <Route path="/my/dashboard" element={<SupplierDashboardPage />} />
        <Route path="/my/products" element={<SupplierProductsPage />} />
        <Route path="/my/orders" element={<SupplierOrdersPage />} />
        <Route path="/my/invoices" element={<SupplierInvoicesPage />} />
        <Route path="/my/stats" element={<SupplierStatsPage />} />
        <Route path="/my/profile" element={<SupplierProfilePage />} />
      </Route>
    </Route>
  );
}
