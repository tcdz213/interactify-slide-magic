import { lazy } from "react";
import { Route } from "react-router-dom";

const DeliveryLayout = lazy(() => import("@/delivery/components/DeliveryLayout"));
const DeliveryAuthGuard = lazy(() => import("@/delivery/components/DeliveryAuthGuard"));
const DriverLoginScreen = lazy(() => import("@/delivery/screens/DriverLoginScreen"));
const VehicleCheckScreen = lazy(() => import("@/delivery/screens/VehicleCheckScreen"));
const TodayTripScreen = lazy(() => import("@/delivery/screens/TodayTripScreen"));
const StopDetailScreen = lazy(() => import("@/delivery/screens/StopDetailScreen"));
const DeliveryConfirmScreen = lazy(() => import("@/delivery/screens/DeliveryConfirmScreen"));
const CashCollectionScreen = lazy(() => import("@/delivery/screens/CashCollectionScreen"));
const EndOfDayScreen = lazy(() => import("@/delivery/screens/EndOfDayScreen"));
const IncidentScreen = lazy(() => import("@/delivery/screens/IncidentScreen"));
const DeliveryMoreScreen = lazy(() => import("@/delivery/screens/DeliveryMoreScreen"));
const StopsListScreen = lazy(() => import("@/delivery/screens/StopsListScreen"));
const ProofsScreen = lazy(() => import("@/delivery/screens/ProofsScreen"));
const CashSummaryScreen = lazy(() => import("@/delivery/screens/CashSummaryScreen"));
const TripMapScreen = lazy(() => import("@/delivery/screens/TripMapScreen"));

export function DeliveryRoutes() {
  return (
    <>
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
    </>
  );
}
