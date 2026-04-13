import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import LazyLoadFallback from "@/components/shared/LazyLoadFallback";

// Layouts (loaded eagerly – small & always needed)
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import BusinessLayout from "./layouts/BusinessLayout";
import MobileLayout from "./layouts/MobileLayout";

// ── Lazy-loaded pages ───────────────────────────────────────
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Super Admin
const AdminDashboard = lazy(() => import("./pages/super-admin/AdminDashboard"));
const TenantsPage = lazy(() => import("./pages/super-admin/TenantsPage"));
const SubscriptionsPage = lazy(() => import("./pages/super-admin/SubscriptionsPage"));
const AccountsPage = lazy(() => import("./pages/super-admin/AccountsPage"));
const BillingPage = lazy(() => import("./pages/super-admin/BillingPage"));
const AuditLogsPage = lazy(() => import("./pages/super-admin/AuditLogsPage"));
const AnalyticsPage = lazy(() => import("./pages/super-admin/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/super-admin/SettingsPage"));
const WhiteLabelPage = lazy(() => import("./pages/super-admin/WhiteLabelPage"));

// Business
const BusinessDashboard = lazy(() => import("./pages/business/BusinessDashboard"));
const ProductsPage = lazy(() => import("./pages/business/ProductsPage"));
const CategoriesPage = lazy(() => import("./pages/business/CategoriesPage"));
const PricingRulesPage = lazy(() => import("./pages/business/PricingRulesPage"));
const InventoryPage = lazy(() => import("./pages/business/InventoryPage"));
const StockAdjustmentsPage = lazy(() => import("./pages/business/StockAdjustmentsPage"));
const WarehousesPage = lazy(() => import("./pages/business/WarehousesPage"));
const OrdersPage = lazy(() => import("./pages/business/OrdersPage"));
const CreateOrderPage = lazy(() => import("./pages/business/CreateOrderPage"));
const OrderDetailPage = lazy(() => import("./pages/business/OrderDetailPage"));
const DeliveriesPage = lazy(() => import("./pages/business/DeliveriesPage"));
const DriversPage = lazy(() => import("./pages/business/DriversPage"));
const RoutePlanningPage = lazy(() => import("./pages/business/RoutePlanningPage"));
const InvoicesPage = lazy(() => import("./pages/business/InvoicesPage"));
const InvoiceDetailPage = lazy(() => import("./pages/business/InvoiceDetailPage"));
const PaymentsPage = lazy(() => import("./pages/business/PaymentsPage"));
const AccountingPage = lazy(() => import("./pages/business/AccountingPage"));
const ReportsPage = lazy(() => import("./pages/business/ReportsPage"));
const SalesReportPage = lazy(() => import("./pages/business/SalesReportPage"));
const TaxReportPage = lazy(() => import("./pages/business/TaxReportPage"));
const CustomersPage = lazy(() => import("./pages/business/CustomersPage"));
const UsersPage = lazy(() => import("./pages/business/UsersPage"));
const BusinessSettingsPage = lazy(() => import("./pages/business/BusinessSettingsPage"));
const ActivityPage = lazy(() => import("./pages/business/ActivityPage"));
const NotificationsPage = lazy(() => import("./pages/business/NotificationsPage"));
const HelpPage = lazy(() => import("./pages/business/HelpPage"));
const AutomationPage = lazy(() => import("./pages/business/AutomationPage"));
const InsightsPage = lazy(() => import("./pages/business/InsightsPage"));
const ApiManagementPage = lazy(() => import("./pages/business/ApiManagementPage"));

// Mobile – Driver
const DriverHomePage = lazy(() => import("./pages/mobile/driver/DriverHomePage"));
const DriverRoutePage = lazy(() => import("./pages/mobile/driver/DriverRoutePage"));
const DeliveryStopPage = lazy(() => import("./pages/mobile/driver/DeliveryStopPage"));
const DriverHistoryPage = lazy(() => import("./pages/mobile/driver/DriverHistoryPage"));
const DriverProfilePage = lazy(() => import("./pages/mobile/driver/DriverProfilePage"));

// Mobile – Sales
const SalesHomePage = lazy(() => import("./pages/mobile/sales/SalesHomePage"));
const SalesCreateOrderPage = lazy(() => import("./pages/mobile/sales/SalesCreateOrderPage"));
const SalesCustomersPage = lazy(() => import("./pages/mobile/sales/SalesCustomersPage"));
const SalesCollectionsPage = lazy(() => import("./pages/mobile/sales/SalesCollectionsPage"));
const SalesProfilePage = lazy(() => import("./pages/mobile/sales/SalesProfilePage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<LazyLoadFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Super Admin */}
              <Route path="/admin" element={<SuperAdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="tenants" element={<TenantsPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="white-label" element={<WhiteLabelPage />} />
              </Route>

              {/* Business Manager */}
              <Route path="/business" element={<BusinessLayout />}>
                <Route index element={<BusinessDashboard />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="pricing" element={<PricingRulesPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/adjustments" element={<StockAdjustmentsPage />} />
                <Route path="warehouses" element={<WarehousesPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/create" element={<CreateOrderPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="deliveries" element={<DeliveriesPage />} />
                <Route path="drivers" element={<DriversPage />} />
                <Route path="routes" element={<RoutePlanningPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="accounting" element={<AccountingPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/sales" element={<SalesReportPage />} />
                <Route path="reports/tax" element={<TaxReportPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<BusinessSettingsPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="automation" element={<AutomationPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="api" element={<ApiManagementPage />} />
              </Route>

              {/* Mobile — Driver */}
              <Route path="/m/driver" element={<MobileLayout />}>
                <Route index element={<DriverHomePage />} />
                <Route path="route" element={<DriverRoutePage />} />
                <Route path="delivery/:id" element={<DeliveryStopPage />} />
                <Route path="history" element={<DriverHistoryPage />} />
                <Route path="profile" element={<DriverProfilePage />} />
              </Route>

              {/* Mobile — Sales Rep */}
              <Route path="/m/sales" element={<MobileLayout />}>
                <Route index element={<SalesHomePage />} />
                <Route path="orders/create" element={<SalesCreateOrderPage />} />
                <Route path="customers" element={<SalesCustomersPage />} />
                <Route path="collections" element={<SalesCollectionsPage />} />
                <Route path="profile" element={<SalesProfilePage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
