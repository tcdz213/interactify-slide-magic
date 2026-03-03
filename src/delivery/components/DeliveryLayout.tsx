import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Truck, List, Camera, Banknote, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_DRIVER } from "../data/mockDeliveryData";

const NAV_ITEMS = [
  { path: "/delivery/trip", icon: Truck, label: "Tournée" },
  { path: "/delivery/stops", icon: List, label: "Arrêts" },
  { path: "/delivery/proofs", icon: Camera, label: "Preuves" },
  { path: "/delivery/cash", icon: Banknote, label: "Caisse" },
  { path: "/delivery/more", icon: Menu, label: "Plus" },
];

export default function DeliveryLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Top header */}
      <header className="shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold cursor-pointer"
          onClick={() => navigate("/delivery/trip")}
        >
          🚚
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{MOCK_DRIVER.name}</p>
          <p className="text-[10px] text-muted-foreground">Chauffeur · En service</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="GPS actif" />
      </header>

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
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
