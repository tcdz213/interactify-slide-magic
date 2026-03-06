import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import PageTransition from "./PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "./AppSidebar";
import Breadcrumbs from "./Breadcrumbs";
import { Bell, Search, RotateCcw, LogOut, Package, ShoppingCart, Users, FileText, Building2 } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { getRoleBadgeStyle, getWarehouseBadgeStyle, getWarehouseShortName } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import OfflineStatusBar from "./OfflineStatusBar";

function ResetDataButton() {
  const { resetData } = useWMSData();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleReset = () => {
    resetData();
    toast({ title: "Données réinitialisées", description: "Toutes les données ont été restaurées aux valeurs mock." });
    setConfirmOpen(false);
  };
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setConfirmOpen(true)} aria-label="Réinitialiser les données démo">
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset données</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Réinitialiser les données démo</TooltipContent>
      </Tooltip>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les données ?</AlertDialogTitle>
            <AlertDialogDescription>Toutes les données seront restaurées aux valeurs de démo. Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Réinitialiser</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type SearchHit = { type: "order"; id: string; label: string; path: string } | { type: "grn"; id: string; label: string; path: string } | { type: "customer"; id: string; label: string; path: string } | { type: "product"; id: string; label: string; path: string };

function GlobalSearch() {
  const navigate = useNavigate();
  const { salesOrders, grns, customers, products } = useWMSData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchHit[] = [];
    salesOrders.forEach((o) => {
      if (o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
        out.push({ type: "order", id: o.id, label: `${o.id} — ${o.customerName}`, path: "/sales/orders" });
    });
    grns.forEach((g) => {
      if (g.id.toLowerCase().includes(q) || g.vendorName.toLowerCase().includes(q))
        out.push({ type: "grn", id: g.id, label: `${g.id} — ${g.vendorName}`, path: "/wms/grn" });
    });
    customers.forEach((c) => {
      if (c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
        out.push({ type: "customer", id: c.id, label: `${c.name} (${c.id})`, path: "/sales/customers" });
    });
    products.forEach((p) => {
      if (p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)))
        out.push({ type: "product", id: p.id, label: `${p.name} (${p.sku})`, path: "/wms/inventory" });
    });
    return out.slice(0, 8);
  }, [query, salesOrders, grns, customers, products]);

  const icon = (h: SearchHit) => {
    switch (h.type) {
      case "order": return <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
      case "grn": return <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
      case "customer": return <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
      case "product": return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    }
  };

  const typeLabel = (h: SearchHit) => {
    switch (h.type) {
      case "order": return "Commande";
      case "grn": return "GRN";
      case "customer": return "Client";
      case "product": return "Produit";
    }
  };

  const handleSelect = useCallback((h: SearchHit) => {
    navigate(h.path);
    setQuery("");
    setOpen(false);
  }, [navigate]);

  return (
    <>
      {/* C2 — Mobile: icon only; Desktop: full search bar */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Rechercher"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 w-72 rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">Rechercher...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Command dialog overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-popover shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher commande, GRN, client, produit..."
                className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                  if (e.key === "Enter" && hits.length > 0) handleSelect(hits[0]);
                }}
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {query.length < 2 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Tapez au moins 2 caractères pour chercher</p>
              ) : hits.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun résultat pour « {query} »</p>
              ) : (
                <ul className="space-y-0.5">
                  {hits.map((h) => (
                    <li key={`${h.type}-${h.id}`}>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => handleSelect(h)}
                      >
                        {icon(h)}
                        <span className="flex-1 truncate">{h.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{typeLabel(h)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NotificationsPopover() {
  const { alerts } = useWMSData();
  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const lastAlerts = alerts.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications et alertes">
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Notifications</TooltipContent>
      </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5 border-b">
          <span className="text-sm font-semibold">Alertes</span>
          <Link to="/bi/alerts" className="text-xs text-primary hover:underline">Voir tout →</Link>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {lastAlerts.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Aucune alerte</p>
          ) : (
            lastAlerts.map((a) => (
              <Link key={a.id} to="/bi/alerts" className="block px-3 py-2 text-sm border-b border-border/50 last:border-0 hover:bg-muted">
                <p className={`font-medium ${!a.isRead ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{a.message}</p>
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AppLayout() {
  const { currentUser, logout, isFullAccess, accessibleWarehouseIds } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("jawda-sidebar-collapsed") === "true");

  // Listen for sidebar toggle via storage event + interval
  useEffect(() => {
    const check = () => {
      const val = localStorage.getItem("jawda-sidebar-collapsed") === "true";
      setSidebarCollapsed(val);
    };
    const interval = setInterval(check, 200);
    window.addEventListener("storage", check);
    return () => { clearInterval(interval); window.removeEventListener("storage", check); };
  }, []);

  // Scroll to top on route change (D7)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "ms-0" : sidebarCollapsed ? "ms-16" : "ms-64"
      )}>
        {/* Top bar */}
        <header className={cn("sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm", isMobile ? "px-4 ps-14" : "px-6")}>
          <GlobalSearch />
          <div className="flex items-center gap-3">
            <ResetDataButton />
            <NotificationCenter />

            {/* User identity area */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-2.5 border-s border-border ps-3">
                {/* Avatar with tooltip for full details */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 cursor-default">
                      <span className="text-xs font-semibold text-primary">{currentUser?.avatar ?? "—"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-medium">{currentUser?.name}</p>
                    <p className="text-muted-foreground">{currentUser?.roleLabel}</p>
                    {isFullAccess ? (
                      <p className="text-muted-foreground">Tous entrepôts</p>
                    ) : (
                      <p className="text-muted-foreground">{accessibleWarehouseIds?.map(id => getWarehouseShortName(id)).join(", ")}</p>
                    )}
                  </TooltipContent>
                </Tooltip>

                {/* Name + role badge — hidden below lg */}
                <div className="hidden lg:flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-medium leading-none truncate max-w-[120px]">{currentUser?.name ?? "—"}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {currentUser && (
                      <span className={cn(
                        "inline-flex items-center px-1.5 py-px rounded text-[10px] font-semibold border",
                        getRoleBadgeStyle(currentUser.role)
                      )}>
                        {currentUser.roleLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Warehouse chips — hidden below xl */}
                <div className="hidden xl:flex items-center gap-1">
                  {currentUser && (
                    isFullAccess ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10px] font-medium border bg-primary/5 text-primary border-primary/20">
                        <Building2 className="h-2.5 w-2.5" />
                        Tous entrepôts
                      </span>
                    ) : (
                      accessibleWarehouseIds?.slice(0, 2).map((whId) => (
                        <span
                          key={whId}
                          className={cn(
                            "inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10px] font-medium border",
                            getWarehouseBadgeStyle(whId)
                          )}
                        >
                          <Building2 className="h-2.5 w-2.5" />
                          {getWarehouseShortName(whId)}
                        </span>
                      ))
                    )
                  )}
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} aria-label="Déconnexion">
                      <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Déconnexion</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Breadcrumbs />
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <OfflineStatusBar />
    </div>
  );
}
