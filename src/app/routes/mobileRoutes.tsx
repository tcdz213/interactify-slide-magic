import { lazy } from "react";
import { Route } from "react-router-dom";

const MobileLayout = lazy(() => import("@/mobile/components/MobileLayout"));
const MobileAuthGuard = lazy(() => import("@/mobile/components/MobileAuthGuard"));
const MobileLoginScreen = lazy(() => import("@/mobile/screens/MobileLoginScreen"));
const MobileDashboardScreen = lazy(() => import("@/mobile/screens/MobileDashboardScreen"));
const MobileCustomerListScreen = lazy(() => import("@/mobile/screens/MobileCustomerListScreen"));
const MobileCustomerDetailScreen = lazy(() => import("@/mobile/screens/MobileCustomerDetailScreen"));
const MobileNewOrderScreen = lazy(() => import("@/mobile/screens/MobileNewOrderScreen"));
const MobileOrderHistoryScreen = lazy(() => import("@/mobile/screens/MobileOrderHistoryScreen"));
const MobileRouteScreen = lazy(() => import("@/mobile/screens/MobileRouteScreen"));
const MobileMoreScreen = lazy(() => import("@/mobile/screens/MobileMoreScreen"));
const MobileOfflineQueueScreen = lazy(() => import("@/mobile/screens/MobileOfflineQueueScreen"));

export function MobileRoutes() {
  return (
    <>
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
    </>
  );
}
