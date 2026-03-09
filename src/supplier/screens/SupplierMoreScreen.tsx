import { useNavigate } from "react-router-dom";
import {
  Package,
  TrendingUp,
  Bell,
  Settings,
  FileText,
  Truck,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPLIER_PROFILE, supplierNotifications } from "../data/mockSupplierData";
import { useSupplierAuth } from "../components/SupplierAuthGuard";

const MENU_SECTIONS = [
  {
    title: "Gestion",
    items: [
      { path: "/supplier/products", icon: Package, label: "Catalogue produits" },
      { path: "/supplier/performance", icon: TrendingUp, label: "Performance & Qualité" },
    ],
  },
  {
    title: "Communication",
    items: [
      { path: "/supplier/notifications", icon: Bell, label: "Notifications", badge: true },
    ],
  },
  {
    title: "Compte",
    items: [
      { path: "/supplier/settings", icon: Settings, label: "Paramètres" },
    ],
  },
];

export default function SupplierMoreScreen() {
  const navigate = useNavigate();
  const { logout } = useSupplierAuth();
  const unread = supplierNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/supplier/login", { replace: true });
  };

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center text-primary font-bold">
          {SUPPLIER_PROFILE.companyName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{SUPPLIER_PROFILE.companyName}</p>
          <p className="text-xs text-muted-foreground">{SUPPLIER_PROFILE.contactName}</p>
          <p className="text-[10px] text-muted-foreground">{SUPPLIER_PROFILE.zone} · {SUPPLIER_PROFILE.category}</p>
        </div>
      </div>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 mb-1">{section.title}</p>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {section.items.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.badge && unread > 0 && (
                  <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">
                    {unread}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-center gap-3 text-left hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Se déconnecter</span>
      </button>
    </div>
  );
}
