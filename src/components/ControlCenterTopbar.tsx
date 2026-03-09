import { useLocation, Link } from "react-router-dom";
import { Bell, LogOut, Building2, ChevronRight, Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getRoleBadgeStyle, getWarehouseShortName } from "@/lib/rbac";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import SpotlightSearch from "./SpotlightSearch";
import { useState, useMemo } from "react";

/* ── Breadcrumbs (elegant inline) ── */
const ROUTE_LABELS: Record<string, string> = {
  wms: "WMS", sales: "Ventes", distribution: "Distribution", accounting: "Comptabilité",
  bi: "BI & Rapports", settings: "Admin", reports: "Rapports", grn: "Réception (GRN)",
  inventory: "Inventaire", products: "Produits", categories: "Catégories", uom: "UdM",
  vendors: "Fournisseurs", warehouses: "Entrepôts", locations: "Emplacements",
  "purchase-orders": "Bons de commande", "quality-control": "Contrôle qualité",
  putaway: "Rangement", waves: "Vagues", picking: "Picking", packing: "Packing",
  shipping: "Expédition", movements: "Mouvements", "cycle-count": "Inventaire tournant",
  adjustments: "Ajustements", transfers: "Transferts", "lot-batch": "Lots",
  orders: "Commandes", customers: "Clients", routes: "Tournées", invoices: "Factures",
  payments: "Paiements", performance: "Performance", alerts: "Alertes", users: "Utilisateurs",
  "audit-log": "Audit", system: "Système", barcodes: "Codes-barres", carriers: "Transporteurs",
  "payment-terms": "Conditions", currencies: "Devises", "tax-config": "Fiscalité",
  "stock-dashboard": "Stock", "stock-block": "Blocage", "serial-numbers": "Séries",
  "stock-valuation": "Valorisation", "price-history": "Prix", kitting: "Kitting",
  repacking: "Repack", returns: "Retours", "credit-notes": "Avoirs", "quality-claims": "Réclamations",
  "vendor-scorecard": "Scorecard", tasks: "Tâches", "yard-dock": "Yard", "cross-docking": "Cross-Dock",
  "supplier-contracts": "Contrats", "replenishment-rules": "Réappro", reservations: "Réservations",
  "supplier-returns": "Ret. fournisseurs", "match-exceptions": "Exceptions",
  closing: "Clôture", "route-plan": "Tournées", "payment-runs": "Lots paiement",
  "bank-reconciliation": "Banque", "chart-of-accounts": "Plan comptable", budgets: "Budget",
  builder: "Générateur", "margin-history": "Marges", profitability: "Rentabilité",
  "picking-strategy": "Picking", "approval-workflows": "Workflows", "putaway-rules": "Putaway",
  "alert-rules": "Alertes", "location-types": "Emplacements", integrations: "Intégrations",
  pricing: "Tarification", "client-types": "Types clients", prices: "Grille",
  deliveries: "Livraisons",
};

function InlineBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return <span className="text-ds-sm text-muted-foreground/50">Dashboard</span>;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-ds-xs text-muted-foreground/60">
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-3 w-3" />
      </Link>
      {segments.map((seg, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const label = ROUTE_LABELS[seg] || seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-2.5 w-2.5 opacity-40" />
            {isLast ? (
              <span className="font-medium text-foreground/80">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ── Pulsing notification bell ── */
function NotificationBell() {
  const { alerts } = useWMSData();
  const unread = alerts.filter(a => !a.isRead).length;
  const lastAlerts = alerts.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl" aria-label="Notifications">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unread > 0 && (
            <motion.span
              className="absolute top-1 end-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-ds-sm font-semibold">Alertes</span>
          <Link to="/bi/alerts" className="text-ds-xs text-primary hover:underline">Voir tout →</Link>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {lastAlerts.length === 0 ? (
            <p className="p-4 text-ds-sm text-muted-foreground text-center">Aucune alerte</p>
          ) : (
            lastAlerts.map(a => (
              <Link key={a.id} to="/bi/alerts" className="block px-3 py-2.5 text-sm border-b border-border/30 last:border-0 hover:bg-muted/50 transition-colors">
                <p className={cn("font-medium text-ds-sm", !a.isRead ? "text-foreground" : "text-muted-foreground")}>{a.title}</p>
                <p className="text-ds-xs text-muted-foreground/60 truncate mt-0.5">{a.message}</p>
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Reset data button ── */
function ResetButton() {
  const { resetData } = useWMSData();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setConfirmOpen(true)} aria-label="Reset">
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Réinitialiser les données</TooltipContent>
      </Tooltip>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les données ?</AlertDialogTitle>
            <AlertDialogDescription>Toutes les données seront restaurées aux valeurs de démo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { resetData(); toast({ title: "Données réinitialisées" }); setConfirmOpen(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ── User Profile Pill ── */
function UserPill() {
  const { currentUser, logout, isFullAccess, accessibleWarehouseIds } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2 border-s border-border/40 ps-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-ds-xs font-bold text-primary">{currentUser.avatar ?? "—"}</span>
      </div>
      <div className="hidden lg:flex flex-col gap-0.5 min-w-0">
        <p className="text-ds-sm font-semibold leading-none truncate max-w-[110px]">{currentUser.name}</p>
        <span className={cn("inline-flex w-fit items-center px-1.5 py-px rounded text-[10px] font-semibold border", getRoleBadgeStyle(currentUser.role))}>
          {currentUser.roleLabel}
        </span>
      </div>
      {/* Warehouse chips */}
      <div className="hidden xl:flex items-center gap-1">
        {isFullAccess ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10px] font-medium border bg-primary/5 text-primary border-primary/20">
            <Building2 className="h-2.5 w-2.5" /> Tous
          </span>
        ) : accessibleWarehouseIds?.slice(0, 2).map(id => (
          <span key={id} className="inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10px] font-medium border bg-muted/50 text-muted-foreground border-border/40">
            <Building2 className="h-2.5 w-2.5" /> {getWarehouseShortName(id)}
          </span>
        ))}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={logout} aria-label="Déconnexion">
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Déconnexion</TooltipContent>
      </Tooltip>
    </div>
  );
}

/* ── Main Topbar Export ── */
interface ControlCenterTopbarProps {
  isMobile: boolean;
}

export default function ControlCenterTopbar({ isMobile }: ControlCenterTopbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <header
        className={cn(
          "sticky top-2 z-30 mx-2 flex h-14 items-center justify-between rounded-2xl border border-border/40 bg-background/70 backdrop-blur-xl",
          isMobile ? "px-4 ms-10" : "px-5"
        )}
        style={{ boxShadow: "0 4px 24px -6px hsl(var(--foreground) / 0.06)" }}
      >
        <div className="flex items-center gap-4">
          <SpotlightSearch />
          <InlineBreadcrumbs />
        </div>
        <div className="flex items-center gap-1.5">
          <ResetButton />
          <NotificationBell />
          <UserPill />
        </div>
      </header>
    </TooltipProvider>
  );
}
