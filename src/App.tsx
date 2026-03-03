import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WMSDataProvider } from "@/contexts/WMSDataContext";
import { FinancialTrackingProvider } from "@/contexts/FinancialTrackingContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FinancialRoute from "./components/FinancialRoute";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const GrnPage = lazy(() => import("./pages/wms").then((m) => ({ default: m.GrnPage })));
const InventoryPage = lazy(() => import("./pages/wms").then((m) => ({ default: m.InventoryPage })));
const ReturnsPage = lazy(() => import("./pages/wms").then((m) => ({ default: m.ReturnsPage })));
const PurchaseOrdersPage = lazy(() => import("./pages/wms/PurchaseOrdersPage"));
const VendorsPage = lazy(() => import("./pages/wms/VendorsPage"));
const WarehousesPage = lazy(() => import("./pages/wms/WarehousesPage"));
const CycleCountPage = lazy(() => import("./pages/wms/CycleCountPage"));
const StockAdjustmentsPage = lazy(() => import("./pages/wms/StockAdjustmentsPage"));
const StockTransfersPage = lazy(() => import("./pages/wms/StockTransfersPage"));
const ProductsPage = lazy(() => import("./pages/wms/ProductsPage"));
const CategoriesPage = lazy(() => import("./pages/wms/CategoriesPage"));
const UomPage = lazy(() => import("./pages/wms/UomPage"));
const CarriersPage = lazy(() => import("./pages/wms/CarriersPage"));
const BarcodesPage = lazy(() => import("./pages/wms/BarcodesPage"));
const LocationsPage = lazy(() => import("./pages/wms/LocationsPage"));
const QualityControlPage = lazy(() => import("./pages/wms/QualityControlPage"));
const PutawayPage = lazy(() => import("./pages/wms/PutawayPage"));
const MovementJournalPage = lazy(() => import("./pages/wms/MovementJournalPage"));
const WavesPage = lazy(() => import("./pages/wms/WavesPage"));
const PickingPage = lazy(() => import("./pages/wms/PickingPage"));
const PackingPage = lazy(() => import("./pages/wms/PackingPage"));
const ShippingPage = lazy(() => import("./pages/wms/ShippingPage"));
const ReplenishmentRulesPage = lazy(() => import("./pages/wms/ReplenishmentRulesPage"));
const ReservationsPage = lazy(() => import("./pages/wms/ReservationsPage"));
// SupplierReturnsPage removed — unified into ReturnsPage at /wms/returns
const TaskQueuePage = lazy(() => import("./pages/wms/TaskQueuePage"));
const CrossDockingPage = lazy(() => import("./pages/wms/CrossDockingPage"));
const KittingPage = lazy(() => import("./pages/wms/KittingPage"));
const StockBlockPage = lazy(() => import("./pages/wms/StockBlockPage"));
const RepackingPage = lazy(() => import("./pages/wms/RepackingPage"));
const LotBatchPage = lazy(() => import("./pages/wms/LotBatchPage"));
const SerialNumbersPage = lazy(() => import("./pages/wms/SerialNumbersPage"));
const StockValuationPage = lazy(() => import("./pages/wms/StockValuationPage"));
const WarehouseStockDashboard = lazy(() => import("./pages/wms/WarehouseStockDashboard"));
const AuditLogPage = lazy(() => import("./pages/settings/AuditLogPage"));
const PickingStrategyPage = lazy(() => import("./pages/settings/PickingStrategyPage"));
const ApprovalWorkflowsPage = lazy(() => import("./pages/settings/ApprovalWorkflowsPage"));
const SupplierContractsPage = lazy(() => import("./pages/wms/SupplierContractsPage"));
const ReportsOverviewPage = lazy(() => import("./pages/reports/ReportsOverviewPage"));
// Phase 20-22
const YardDockPage = lazy(() => import("./pages/wms/YardDockPage"));
const PutawayRulesPage = lazy(() => import("./pages/settings/PutawayRulesPage"));
const AlertRulesPage = lazy(() => import("./pages/settings/AlertRulesPage"));
const LocationTypesPage = lazy(() => import("./pages/settings/LocationTypesPage"));
const IntegrationsPage = lazy(() => import("./pages/settings/IntegrationsPage"));
const OrdersPage = lazy(() => import("./pages/sales").then((m) => ({ default: m.OrdersPage })));
const CustomersPage = lazy(() => import("./pages/sales").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("./pages/sales/CustomerDetailPage"));
const RoutesPage = lazy(() => import("./pages/distribution").then((m) => ({ default: m.RoutesPage })));
const DeliveriesPage = lazy(() => import("./pages/distribution").then((m) => ({ default: m.DeliveriesPage })));
const InvoicesPage = lazy(() => import("./pages/accounting").then((m) => ({ default: m.InvoicesPage })));
const PaymentsPage = lazy(() => import("./pages/accounting").then((m) => ({ default: m.PaymentsPage })));
const AccountingReportsPage = lazy(() => import("./pages/accounting").then((m) => ({ default: m.AccountingReportsPage })));
const PerformancePage = lazy(() => import("./pages/bi").then((m) => ({ default: m.PerformancePage })));
const AlertsPage = lazy(() => import("./pages/bi").then((m) => ({ default: m.AlertsPage })));
const UserManagementPage = lazy(() => import("./pages/settings/UserManagementPage"));
const SystemSettingsPage = lazy(() => import("./pages/settings/SystemSettingsPage"));
const DailyClosingPage = lazy(() => import("./pages/DailyClosingPage"));
const PriceHistoryPage = lazy(() => import("./pages/wms/PriceHistoryPage"));
const ReportBuilderPage = lazy(() => import("./pages/reports/ReportBuilderPage"));
const ClientTypesPage = lazy(() => import("./modules/client-types/ClientTypesPage"));
const PricingPage = lazy(() => import("./modules/pricing/PricingPage"));
const MarginHistoryPage = lazy(() => import("./pages/reports/MarginHistoryPage"));
const ProfitabilityDashboard = lazy(() => import("./pages/bi/ProfitabilityDashboard"));
const RoutePlanPage = lazy(() => import("./pages/sales/RoutePlanPage"));

// Mobile Sales App screens
const MobileLayout = lazy(() => import("./mobile/components/MobileLayout"));
const MobileAuthGuard = lazy(() => import("./mobile/components/MobileAuthGuard"));
const MobileLoginScreen = lazy(() => import("./mobile/screens/MobileLoginScreen"));
const MobileDashboardScreen = lazy(() => import("./mobile/screens/MobileDashboardScreen"));
const MobileCustomerListScreen = lazy(() => import("./mobile/screens/MobileCustomerListScreen"));
const MobileCustomerDetailScreen = lazy(() => import("./mobile/screens/MobileCustomerDetailScreen"));
const MobileNewOrderScreen = lazy(() => import("./mobile/screens/MobileNewOrderScreen"));
const MobileOrderHistoryScreen = lazy(() => import("./mobile/screens/MobileOrderHistoryScreen"));
const MobileRouteScreen = lazy(() => import("./mobile/screens/MobileRouteScreen"));
const MobileMoreScreen = lazy(() => import("./mobile/screens/MobileMoreScreen"));
const MobileOfflineQueueScreen = lazy(() => import("./mobile/screens/MobileOfflineQueueScreen"));

// 🚚 Delivery Driver App screens
const DeliveryLayout = lazy(() => import("./delivery/components/DeliveryLayout"));
const DeliveryAuthGuard = lazy(() => import("./delivery/components/DeliveryAuthGuard"));
const DriverLoginScreen = lazy(() => import("./delivery/screens/DriverLoginScreen"));
const VehicleCheckScreen = lazy(() => import("./delivery/screens/VehicleCheckScreen"));
const TodayTripScreen = lazy(() => import("./delivery/screens/TodayTripScreen"));
const StopDetailScreen = lazy(() => import("./delivery/screens/StopDetailScreen"));
const DeliveryConfirmScreen = lazy(() => import("./delivery/screens/DeliveryConfirmScreen"));
const CashCollectionScreen = lazy(() => import("./delivery/screens/CashCollectionScreen"));
const EndOfDayScreen = lazy(() => import("./delivery/screens/EndOfDayScreen"));
const IncidentScreen = lazy(() => import("./delivery/screens/IncidentScreen"));
const DeliveryMoreScreen = lazy(() => import("./delivery/screens/DeliveryMoreScreen"));
const StopsListScreen = lazy(() => import("./delivery/screens/StopsListScreen"));
const ProofsScreen = lazy(() => import("./delivery/screens/ProofsScreen"));
const CashSummaryScreen = lazy(() => import("./delivery/screens/CashSummaryScreen"));
const TripMapScreen = lazy(() => import("./delivery/screens/TripMapScreen"));

// 🏪 Client Portal screens
const PortalLayout = lazy(() => import("./portal/components/PortalLayout"));
const PortalAuthGuard = lazy(() => import("./portal/components/PortalAuthGuard"));
const PortalLoginScreen = lazy(() => import("./portal/screens/PortalLoginScreen"));
const PortalDashboardScreen = lazy(() => import("./portal/screens/PortalDashboardScreen"));
const MyOrdersScreen = lazy(() => import("./portal/screens/MyOrdersScreen"));
const OrderDetailScreen = lazy(() => import("./portal/screens/OrderDetailScreen"));
const PlaceOrderScreen = lazy(() => import("./portal/screens/PlaceOrderScreen"));
const PortalInvoicesScreen = lazy(() => import("./portal/screens/InvoicesScreen"));
const PortalPaymentsScreen = lazy(() => import("./portal/screens/PaymentsScreen"));
const StatementScreen = lazy(() => import("./portal/screens/StatementScreen"));
const ReturnRequestScreen = lazy(() => import("./portal/screens/ReturnRequestScreen"));
const NotificationsScreen = lazy(() => import("./portal/screens/NotificationsScreen"));
const PortalMoreScreen = lazy(() => import("./portal/screens/PortalMoreScreen"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WMSDataProvider>
            <FinancialTrackingProvider>
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>}>
                <Routes>
                  <Route path="/login" element={<Login />} />

                  {/* 📱 Mobile Sales App routes */}
                  <Route path="/mobile/login" element={<MobileLoginScreen />} />
                  <Route element={<MobileAuthGuard />}>
                    <Route path="/mobile" element={<MobileLayout />}>
                      <Route path="dashboard" element={<MobileDashboardScreen />} />
                      <Route path="customers" element={<MobileCustomerListScreen />} />
                      <Route path="customers/:id" element={<MobileCustomerDetailScreen />} />
                      <Route path="new-order" element={<MobileNewOrderScreen />} />
                      <Route path="orders" element={<MobileOrderHistoryScreen />} />
                      <Route path="route" element={<MobileRouteScreen />} />
                      <Route path="more" element={<MobileMoreScreen />} />
                      <Route path="offline-queue" element={<MobileOfflineQueueScreen />} />
                    </Route>
                  </Route>

                  {/* 🚚 Delivery Driver App routes */}
                  <Route path="/delivery/login" element={<DriverLoginScreen />} />
                  <Route path="/delivery/vehicle-check" element={<VehicleCheckScreen />} />
                  <Route element={<DeliveryAuthGuard />}>
                    <Route path="/delivery" element={<DeliveryLayout />}>
                      <Route path="trip" element={<TodayTripScreen />} />
                      <Route path="stop/:stopId" element={<StopDetailScreen />} />
                      <Route path="confirm/:stopId" element={<DeliveryConfirmScreen />} />
                      <Route path="cash/:stopId" element={<CashCollectionScreen />} />
                      <Route path="stops" element={<StopsListScreen />} />
                      <Route path="proofs" element={<ProofsScreen />} />
                      <Route path="cash" element={<CashSummaryScreen />} />
                      <Route path="end-of-day" element={<EndOfDayScreen />} />
                      <Route path="incident" element={<IncidentScreen />} />
                      <Route path="map" element={<TripMapScreen />} />
                      <Route path="more" element={<DeliveryMoreScreen />} />
                    </Route>
                  </Route>

                  {/* 🏪 Client Portal routes */}
                  <Route path="/portal/login" element={<PortalLoginScreen />} />
                  <Route element={<PortalAuthGuard />}>
                    <Route path="/portal" element={<PortalLayout />}>
                      <Route path="dashboard" element={<PortalDashboardScreen />} />
                      <Route path="orders" element={<MyOrdersScreen />} />
                      <Route path="orders/:orderId" element={<OrderDetailScreen />} />
                      <Route path="place-order" element={<PlaceOrderScreen />} />
                      <Route path="invoices" element={<PortalInvoicesScreen />} />
                      <Route path="payments" element={<PortalPaymentsScreen />} />
                      <Route path="statement" element={<StatementScreen />} />
                      <Route path="return" element={<ReturnRequestScreen />} />
                      <Route path="notifications" element={<NotificationsScreen />} />
                      <Route path="more" element={<PortalMoreScreen />} />
                    </Route>
                  </Route>

                   {/* 💻 Admin Dashboard routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Dashboard />} />
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
                      <Route path="/reports" element={<ReportsOverviewPage />} />
                      <Route path="/settings/audit-log" element={<AuditLogPage />} />
                      <Route path="/settings/picking-strategy" element={<PickingStrategyPage />} />
                      <Route path="/settings/approval-workflows" element={<ApprovalWorkflowsPage />} />
                      <Route path="/settings/putaway-rules" element={<PutawayRulesPage />} />
                      <Route path="/settings/alert-rules" element={<AlertRulesPage />} />
                      <Route path="/settings/location-types" element={<LocationTypesPage />} />
                      <Route path="/settings/integrations" element={<IntegrationsPage />} />
                      <Route path="/wms/supplier-contracts" element={<SupplierContractsPage />} />
                      <Route path="/sales/orders" element={<OrdersPage />} />
                      <Route path="/sales/customers" element={<CustomersPage />} />
                      <Route path="/sales/customers/:id" element={<CustomerDetailPage />} />
                      <Route path="/distribution/routes" element={<RoutesPage />} />
                      <Route path="/distribution/deliveries" element={<DeliveriesPage />} />
                      {/* Financial-protected accounting routes */}
                      <Route element={<FinancialRoute />}>
                        <Route path="/accounting/invoices" element={<InvoicesPage />} />
                        <Route path="/accounting/payments" element={<PaymentsPage />} />
                        <Route path="/accounting/reports" element={<AccountingReportsPage />} />
                      </Route>
                      <Route path="/bi/performance" element={<PerformancePage />} />
                      <Route path="/bi/alerts" element={<AlertsPage />} />
                      {/* Admin-protected settings routes */}
                      <Route element={<AdminRoute />}>
                        <Route path="/settings/users" element={<UserManagementPage />} />
                        <Route path="/settings/system" element={<SystemSettingsPage />} />
                      </Route>
                      <Route path="/closing" element={<DailyClosingPage />} />
                      <Route path="/wms/price-history" element={<PriceHistoryPage />} />
                      <Route path="/reports/builder" element={<ReportBuilderPage />} />
                      <Route path="/pricing/client-types" element={<ClientTypesPage />} />
                      <Route path="/pricing/prices" element={<PricingPage />} />
                      <Route path="/reports/margin-history" element={<MarginHistoryPage />} />
                      <Route path="/bi/profitability" element={<ProfitabilityDashboard />} />
                      <Route path="/sales/route-plan" element={<RoutePlanPage />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            </FinancialTrackingProvider>
          </WMSDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
