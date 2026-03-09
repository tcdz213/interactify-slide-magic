import { lazy } from "react";
import { Route } from "react-router-dom";

const OwnerLayout = lazy(() => import("@/owner/components/OwnerLayout"));
const OwnerAuthGuard = lazy(() => import("@/owner/components/OwnerAuthGuard"));
const OwnerLoginScreen = lazy(() => import("@/owner/screens/OwnerLoginScreen"));
const OwnerDashboardScreen = lazy(() => import("@/owner/screens/OwnerDashboardScreen"));
const OwnerSubscriptionsScreen = lazy(() => import("@/owner/screens/OwnerSubscriptionsScreen"));
const OwnerBillingScreen = lazy(() => import("@/owner/screens/OwnerBillingScreen"));
const OwnerOnboardingScreen = lazy(() => import("@/owner/screens/OwnerOnboardingScreen"));
const OwnerMonitoringScreen = lazy(() => import("@/owner/screens/OwnerMonitoringScreen"));
const OwnerSupportScreen = lazy(() => import("@/owner/screens/OwnerSupportScreen"));
const OwnerSettingsScreen = lazy(() => import("@/owner/screens/OwnerSettingsScreen"));

export function OwnerRoutes() {
  return (
    <>
      <Route path="/owner/login" element={<OwnerLoginScreen />} />
      <Route element={<OwnerAuthGuard />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboardScreen />} />
          <Route path="subscriptions" element={<OwnerSubscriptionsScreen />} />
          <Route path="billing" element={<OwnerBillingScreen />} />
          <Route path="onboarding" element={<OwnerOnboardingScreen />} />
          <Route path="monitoring" element={<OwnerMonitoringScreen />} />
          <Route path="support" element={<OwnerSupportScreen />} />
          <Route path="settings" element={<OwnerSettingsScreen />} />
        </Route>
      </Route>
    </>
  );
}
