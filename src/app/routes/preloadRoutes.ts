/**
 * Phase 7 — Route preloader: eagerly loads critical route chunks
 * after initial render to ensure instant navigation.
 */
export function preloadCriticalRoutes() {
  // Fire after idle to avoid blocking initial render
  const load = () => {
    // Dashboard (most visited after login)
    import("@/features/dashboard/DashboardPage");
    // Login (needed on logout)
    import("@/pages/Login");
    // Most common WMS pages
    import("@/pages/wms/ProductsPage");
    import("@/pages/wms/PurchaseOrdersPage");
    // Sales
    import("@/pages/sales");
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(load, { timeout: 3000 });
  } else {
    setTimeout(load, 2000);
  }
}
