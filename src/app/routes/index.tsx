import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileRoutes } from "./mobileRoutes";
import { DeliveryRoutes } from "./deliveryRoutes";
import { PortalRoutes } from "./portalRoutes";
import { SupplierRoutes } from "./supplierRoutes";
import { OwnerRoutes } from "./ownerRoutes";
import { AdminRoutes } from "./adminRoutes";
import { lazy } from "react";

const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-muted-foreground">
            Chargement…
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* 📱 Mobile Sales App */}
          {MobileRoutes()}

          {/* 🚚 Delivery Driver App */}
          {DeliveryRoutes()}

          {/* 🏪 Client Portal */}
          {PortalRoutes()}

          {/* 📦 Supplier Portal */}
          {SupplierRoutes()}

          {/* 👑 Owner Dashboard */}
          {OwnerRoutes()}

          {/* 💻 Admin Dashboard */}
          {AdminRoutes()}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
