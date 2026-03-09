import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  FileText,
  Menu,
  Bell,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPLIER_PROFILE, supplierNotifications } from "@/supplier/data/mockSupplierData";

export default function SupplierLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = supplierNotifications.filter((n) => !n.read).length;

  const NAV_ITEMS = [
    { path: "/supplier", icon: LayoutDashboard, label: "Accueil", exact: true },
    { path: "/supplier/orders", icon: ClipboardList, label: "Commandes" },
    { path: "/supplier/deliveries", icon: Truck, label: "Livraisons" },
    { path: "/supplier/invoices", icon: FileText, label: "Factures" },
    { path: "/supplier/more", icon: Menu, label: "Plus" },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center text-primary text-sm font-bold cursor-pointer"
          onClick={() => navigate("/supplier")}
        >
          <Package className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{SUPPLIER_PROFILE.companyName}</p>
          <p className="text-[10px] text-muted-foreground">{SUPPLIER_PROFILE.zone} · Fournisseur</p>
        </div>
        <button
          onClick={() => navigate("/supplier/notifications")}
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

      {/* Content */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="shrink-0 border-t border-border bg-card">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ path, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname === path || location.pathname.startsWith(path + "/");
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
