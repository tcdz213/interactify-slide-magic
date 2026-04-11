import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminDashboard from "./pages/super-admin/AdminDashboard";
import TenantsPage from "./pages/super-admin/TenantsPage";
import SubscriptionsPage from "./pages/super-admin/SubscriptionsPage";
import BusinessLayout from "./layouts/BusinessLayout";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import ProductsPage from "./pages/business/ProductsPage";
import OrdersPage from "./pages/business/OrdersPage";
import CustomersPage from "./pages/business/CustomersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          </Route>

          {/* Business Manager */}
          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<BusinessDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
