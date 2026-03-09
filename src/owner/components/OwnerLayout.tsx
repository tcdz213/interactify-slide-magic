import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  UserPlus,
  Activity,
  MessageSquare,
  Settings,
  Bell,
  Crown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OWNER_PROFILE, ownerAlerts } from "@/owner/data/mockOwnerData";
import { useState } from "react";
import { useOwnerAuth } from "./OwnerAuthGuard";

const SIDEBAR_ITEMS = [
  { path: "/owner", icon: LayoutDashboard, label: "Vue d'ensemble", exact: true },
  { path: "/owner/subscriptions", icon: Users, label: "Abonnements" },
  { path: "/owner/billing", icon: CreditCard, label: "Facturation" },
  { path: "/owner/onboarding", icon: UserPlus, label: "Onboarding" },
  { path: "/owner/monitoring", icon: Activity, label: "Monitoring" },
  { path: "/owner/support", icon: MessageSquare, label: "Support" },
  { path: "/owner/settings", icon: Settings, label: "Paramètres" },
];

export default function OwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useOwnerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const criticalAlerts = ownerAlerts.filter((a) => a.severity === "critical").length;

  const handleLogout = () => {
    logout();
    navigate("/owner/login", { replace: true });
  };

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "shrink-0 border-r border-border bg-card flex flex-col transition-all duration-300",
          sidebarOpen ? "w-56" : "w-14"
        )}
      >
        {/* Brand */}
        <div className="h-14 border-b border-border flex items-center gap-2.5 px-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 hover:bg-primary/25 transition-colors"
          >
            <Crown className="h-4 w-4" />
          </button>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">JAWDA SaaS</p>
              <p className="text-[9px] text-muted-foreground">Platform Owner</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ path, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname === path || location.pathname.startsWith(path + "/");
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "stroke-[2.5]")} />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-2 shrink-0 space-y-1">
          <div
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => navigate("/owner/settings")}
          >
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
              {OWNER_PROFILE.avatarInitials}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate">{OWNER_PROFILE.name}</p>
                <p className="text-[9px] text-muted-foreground">Fondateur</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors",
            )}
            title={!sidebarOpen ? "Déconnexion" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 shrink-0 border-b border-border bg-card px-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              {SIDEBAR_ITEMS.find(
                (i) =>
                  i.exact
                    ? location.pathname === i.path
                    : location.pathname.startsWith(i.path)
              )?.label || "Jawda"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              {criticalAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                  {criticalAlerts}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
