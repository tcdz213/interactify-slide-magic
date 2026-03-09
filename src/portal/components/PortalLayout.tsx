import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, FileText, CreditCard, Menu, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalNotifications } from "@/portal/data/mockPortalData";
import { PORTAL_CUSTOMER } from "@/portal/data/mockPortalData";
import { useTranslation } from "react-i18next";

export default function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const unreadCount = portalNotifications.filter((n) => !n.read).length;

  const NAV_ITEMS = [
    { path: "/portal/dashboard", icon: Home, label: t("portal.nav.home") },
    { path: "/portal/orders", icon: ShoppingCart, label: t("portal.nav.orders") },
    { path: "/portal/invoices", icon: FileText, label: t("portal.nav.invoices") },
    { path: "/portal/payments", icon: CreditCard, label: t("portal.nav.payments") },
    { path: "/portal/more", icon: Menu, label: t("portal.nav.more") },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold cursor-pointer"
          onClick={() => navigate("/portal/dashboard")}
        >
          {PORTAL_CUSTOMER.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{PORTAL_CUSTOMER.name}</p>
          <p className="text-[10px] text-muted-foreground">{PORTAL_CUSTOMER.zone} · {PORTAL_CUSTOMER.type}</p>
        </div>
        <button
          onClick={() => navigate("/portal/notifications")}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <Outlet />
      </main>

      <nav className="shrink-0 border-t border-border bg-card">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + "/");
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
