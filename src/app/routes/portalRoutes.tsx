import { lazy } from "react";
import { Route } from "react-router-dom";

const PortalLayout = lazy(() => import("@/portal/components/PortalLayout"));
const PortalAuthGuard = lazy(() => import("@/portal/components/PortalAuthGuard"));
const PortalLoginScreen = lazy(() => import("@/portal/screens/PortalLoginScreen"));
const PortalDashboardScreen = lazy(() => import("@/portal/screens/PortalDashboardScreen"));
const MyOrdersScreen = lazy(() => import("@/portal/screens/MyOrdersScreen"));
const OrderDetailScreen = lazy(() => import("@/portal/screens/OrderDetailScreen"));
const PlaceOrderScreen = lazy(() => import("@/portal/screens/PlaceOrderScreen"));
const PortalInvoicesScreen = lazy(() => import("@/portal/screens/InvoicesScreen"));
const PortalPaymentsScreen = lazy(() => import("@/portal/screens/PaymentsScreen"));
const StatementScreen = lazy(() => import("@/portal/screens/StatementScreen"));
const ReturnRequestScreen = lazy(() => import("@/portal/screens/ReturnRequestScreen"));
const NotificationsScreen = lazy(() => import("@/portal/screens/NotificationsScreen"));
const PortalMoreScreen = lazy(() => import("@/portal/screens/PortalMoreScreen"));

export function PortalRoutes() {
  return (
    <>
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
    </>
  );
}
