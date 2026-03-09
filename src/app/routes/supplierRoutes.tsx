import { lazy } from "react";
import { Route } from "react-router-dom";

const SupplierLayout = lazy(() => import("@/supplier/components/SupplierLayout"));
const SupplierAuthGuard = lazy(() => import("@/supplier/components/SupplierAuthGuard"));
const SupplierLoginScreen = lazy(() => import("@/supplier/screens/SupplierLoginScreen"));
const SupplierDashboardScreen = lazy(() => import("@/supplier/screens/SupplierDashboardScreen"));
const SupplierOrdersScreen = lazy(() => import("@/supplier/screens/SupplierOrdersScreen"));
const SupplierOrderDetailScreen = lazy(() => import("@/supplier/screens/SupplierOrderDetailScreen"));
const SupplierDeliveriesScreen = lazy(() => import("@/supplier/screens/SupplierDeliveriesScreen"));
const SupplierInvoicesScreen = lazy(() => import("@/supplier/screens/SupplierInvoicesScreen"));
const SupplierProductsScreen = lazy(() => import("@/supplier/screens/SupplierProductsScreen"));
const SupplierPerformanceScreen = lazy(() => import("@/supplier/screens/SupplierPerformanceScreen"));
const SupplierNotificationsScreen = lazy(() => import("@/supplier/screens/SupplierNotificationsScreen"));
const SupplierSettingsScreen = lazy(() => import("@/supplier/screens/SupplierSettingsScreen"));
const SupplierMoreScreen = lazy(() => import("@/supplier/screens/SupplierMoreScreen"));

export function SupplierRoutes() {
  return (
    <>
      <Route path="/supplier/login" element={<SupplierLoginScreen />} />
      <Route element={<SupplierAuthGuard />}>
        <Route path="/supplier" element={<SupplierLayout />}>
          <Route index element={<SupplierDashboardScreen />} />
          <Route path="orders" element={<SupplierOrdersScreen />} />
          <Route path="orders/:id" element={<SupplierOrderDetailScreen />} />
          <Route path="deliveries" element={<SupplierDeliveriesScreen />} />
          <Route path="invoices" element={<SupplierInvoicesScreen />} />
          <Route path="products" element={<SupplierProductsScreen />} />
          <Route path="performance" element={<SupplierPerformanceScreen />} />
          <Route path="notifications" element={<SupplierNotificationsScreen />} />
          <Route path="settings" element={<SupplierSettingsScreen />} />
          <Route path="more" element={<SupplierMoreScreen />} />
        </Route>
      </Route>
    </>
  );
}
