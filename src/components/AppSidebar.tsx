/**
 * Finder-Style Sidebar — macOS-inspired glassmorphic navigation.
 * Split into NavItem, NavGroup, WmsSubGroupNav, SidebarFooter.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/rbac";
import {
  Warehouse, ShoppingCart, Truck, Calculator, BarChart3, LayoutDashboard,
  Package, ClipboardList, RotateCcw, Users, Route, Receipt, CreditCard,
  FileText, TrendingUp, AlertTriangle, Settings, ChevronRight, Menu, X,
  ShoppingBag, Building2, ClipboardCheck, Settings2, ArrowRightLeft, Globe,
  FolderTree, Ruler, ScanBarcode, MapPin, Database, ShieldCheck, ArrowDownToLine, ScrollText, Layers, Hand, Box,
  Lock, RefreshCw, ListTodo, ArrowDownUp, FileCheck, Combine, PackageOpen, ShieldOff, Repeat, Banknote,
  Fingerprint, DollarSign, Boxes, DoorOpen, Bell, Plug, PackageCheck, History, ClipboardMinus,
  Tags, BadgeDollarSign, Percent, Coins, BookOpen, Wallet, Shield, Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import NavItem from "./sidebar/NavItem";
import NavGroup from "./sidebar/NavGroup";
import WmsSubGroupNav from "./sidebar/WmsSubGroupNav";
import SidebarFooter from "./sidebar/SidebarFooter";

type UserRole = string;

const ROLE_VISIBLE_SECTIONS: Record<UserRole, Set<string>> = {
  FinanceDirector: new Set(["dashboard", "masterData", "accounting", "bi", "admin"]),
  Operator: new Set(["dashboard", "wms"]),
  Supervisor: new Set(["dashboard", "masterData", "wms", "distribution"]),
  Driver: new Set(["dashboard", "distribution"]),
  QCOfficer: new Set(["dashboard", "masterData", "wms"]),
  Accountant: new Set(["dashboard", "masterData", "accounting", "bi"]),
  BIAnalyst: new Set(["dashboard", "masterData", "bi"]),
  Supplier: new Set(["supplierPortal"]),
};

const OPERATOR_WMS_PATHS = new Set([
  "/wms/grn", "/wms/cycle-count", "/wms/picking", "/wms/putaway", "/wms/packing", "/wms/tasks",
]);

function WmsCollapsedIcon({ icon: Icon, label, hasActive, onExpandSidebar }: {
  icon: React.ElementType;
  label: string;
  hasActive: boolean;
  onExpandSidebar?: (groupLabel?: string) => void;
}) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          onClick={() => onExpandSidebar?.(label)}
          className={cn(
            "relative flex items-center justify-center rounded-md p-2 w-full transition-all duration-200",
            hasActive
              ? "text-sidebar-primary bg-sidebar-primary/10"
              : "text-sidebar-foreground/50 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/40"
          )}
        >
          <Icon className="h-[16px] w-[16px]" />
          {hasActive && (
            <div className="absolute -end-0.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-sidebar-primary shadow-[0_0_6px_hsl(var(--sidebar-primary)/0.5)]" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-sidebar-border/25 shadow-xl"
      >
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Click to expand</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function AppSidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { isSystemAdmin, currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebar: sidebarTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("jawda-sidebar-collapsed") === "true");

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem("jawda-sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  // ── WMS sub-groups ──
  const wmsSubGroups = useMemo(() => [
    {
      label: t("nav.wmsInbound", "Inbound"), icon: PackageCheck, colorClass: "text-success",
      children: [
        { label: t("nav.grn"), icon: Package, path: "/wms/grn" },
        { label: t("nav.qualityControl", "Contrôle Qualité"), icon: ShieldCheck, path: "/wms/quality-control" },
        { label: t("nav.putaway", "Rangement"), icon: ArrowDownToLine, path: "/wms/putaway" },
        { label: t("nav.crossDocking", "Cross Docking"), icon: Repeat, path: "/wms/cross-docking" },
        { label: t("nav.purchaseOrders"), icon: ShoppingBag, path: "/wms/purchase-orders" },
        { label: t("nav.matchExceptions"), icon: AlertTriangle, path: "/wms/match-exceptions" },
        { label: t("nav.supplierContracts", "Contrats fournisseurs"), icon: FileCheck, path: "/wms/supplier-contracts" },
      ],
    },
    {
      label: t("nav.wmsOutbound", "Outbound"), icon: Truck, colorClass: "text-info",
      children: [
        { label: t("nav.waves", "Vagues"), icon: Layers, path: "/wms/waves" },
        { label: t("nav.picking", "Picking"), icon: Hand, path: "/wms/picking" },
        { label: t("nav.packing", "Packing"), icon: Box, path: "/wms/packing" },
        { label: t("nav.shipping", "Expédition"), icon: Truck, path: "/wms/shipping" },
        { label: t("nav.replenishment", "Réapprovisionnement"), icon: RefreshCw, path: "/wms/replenishment-rules" },
        { label: t("nav.reservations", "Réservations"), icon: Lock, path: "/wms/reservations" },
      ],
    },
    {
      label: t("nav.wmsStock", "Stock"), icon: ClipboardList, colorClass: "text-accent-purple",
      children: [
        { label: t("nav.stockDashboard", "Tableau de bord stock"), icon: ClipboardList, path: "/wms/stock-dashboard" },
        { label: t("nav.inventory"), icon: ClipboardList, path: "/wms/inventory" },
        { label: t("nav.movements", "Journal mouvements"), icon: ScrollText, path: "/wms/movements" },
        { label: t("nav.cycleCount"), icon: ClipboardCheck, path: "/wms/cycle-count" },
        { label: t("nav.adjustments"), icon: Settings2, path: "/wms/adjustments" },
        { label: t("nav.transfers"), icon: ArrowRightLeft, path: "/wms/transfers" },
        { label: t("nav.stockBlock", "Blocage stock"), icon: ShieldOff, path: "/wms/stock-block" },
      ],
    },
    {
      label: t("nav.wmsTraceability", "Traçabilité"), icon: Fingerprint, colorClass: "text-warning",
      children: [
        { label: t("nav.lotBatch", "Lots / Batch"), icon: Boxes, path: "/wms/lot-batch" },
        { label: t("nav.serialNumbers", "N° de Série"), icon: Fingerprint, path: "/wms/serial-numbers" },
        { label: t("nav.stockValuation", "Valorisation Stock"), icon: DollarSign, path: "/wms/stock-valuation" },
        { label: t("nav.priceHistory", "Historique Prix"), icon: History, path: "/wms/price-history" },
      ],
    },
    {
      label: t("nav.wmsInternalOps", "Opérations Internes"), icon: Combine, colorClass: "text-destructive",
      children: [
        { label: t("nav.kitting", "Kitting / Assemblage"), icon: Combine, path: "/wms/kitting" },
        { label: t("nav.repacking", "Reconditionnement"), icon: PackageOpen, path: "/wms/repacking" },
        { label: t("nav.returns"), icon: RotateCcw, path: "/wms/returns" },
        { label: t("nav.creditNotes"), icon: CreditCard, path: "/wms/credit-notes" },
        { label: t("nav.qualityClaims"), icon: AlertTriangle, path: "/wms/quality-claims" },
        { label: t("nav.vendorScorecard"), icon: BarChart3, path: "/wms/vendor-scorecard" },
      ],
    },
    {
      label: t("nav.wmsFieldMgmt", "Gestion Terrain"), icon: ListTodo, colorClass: "text-accent-cyan",
      children: [
        { label: t("nav.taskQueue", "File de tâches"), icon: ListTodo, path: "/wms/tasks" },
        { label: t("nav.yardDock", "Yard & Dock"), icon: DoorOpen, path: "/wms/yard-dock" },
        { label: t("nav.automation", "Automatisation & Robotique"), icon: Bot, path: "/wms/automation" },
      ],
    },
  ], [t]);

  const ADMIN_ROLES = new Set(["CEO", "SystemAdmin", "OpsDirector", "FinanceDirector", "RegionalManager"]);
  const canSeeAdmin = currentUser ? ADMIN_ROLES.has(currentUser.role) : false;
  const canSeeAccounting = currentUser ? canViewFinancials(currentUser) : false;

  // ── Sections with RBAC filtering ──
  const navigation = useMemo(() => {
    interface NavSection {
      label: string;
      icon: React.ElementType;
      sectionKey: string;
      path?: string;
      children?: { label: string; icon: React.ElementType; path: string }[];
      wmsSubGroups?: typeof wmsSubGroups;
    }

    const sections: NavSection[] = [
      { label: t("nav.dashboard"), icon: LayoutDashboard, path: "/", sectionKey: "dashboard" },
      {
        label: t("nav.masterData", "Données de base"), icon: Database, sectionKey: "masterData",
        children: [
          { label: t("nav.products", "Produits"), icon: Package, path: "/wms/products" },
          { label: t("nav.categories", "Catégories"), icon: FolderTree, path: "/wms/categories" },
          { label: t("nav.uom", "Unités de mesure"), icon: Ruler, path: "/wms/uom" },
          { label: t("nav.barcodes", "Codes-barres"), icon: ScanBarcode, path: "/wms/barcodes" },
          { label: t("nav.vendors"), icon: Users, path: "/wms/vendors" },
          { label: t("nav.carriers", "Transporteurs"), icon: Truck, path: "/wms/carriers" },
          { label: t("nav.paymentTerms"), icon: CreditCard, path: "/wms/payment-terms" },
          { label: t("nav.currencies", "Devises & Taux"), icon: Coins, path: "/settings/currencies" },
          { label: t("nav.taxConfig", "Configuration Fiscale"), icon: Percent, path: "/settings/tax-config" },
          { label: t("nav.warehouses"), icon: Building2, path: "/wms/warehouses" },
          { label: t("nav.locations", "Emplacements"), icon: MapPin, path: "/wms/locations" },
        ],
      },
      { label: t("nav.wms"), icon: Warehouse, sectionKey: "wms", wmsSubGroups },
      {
        label: t("nav.sales"), icon: ShoppingCart, sectionKey: "sales",
        children: [
          { label: t("nav.orders"), icon: ShoppingCart, path: "/sales/orders" },
          { label: t("nav.customers"), icon: Users, path: "/sales/customers" },
          { label: t("nav.routePlan", "Plan de Tournée"), icon: Route, path: "/sales/route-plan" },
        ],
      },
      {
        label: t("nav.pricing", "Tarification"), icon: BadgeDollarSign, sectionKey: "pricing",
        children: [
          { label: t("nav.clientTypes", "Types de Clients"), icon: Tags, path: "/pricing/client-types" },
          { label: t("nav.priceManagement", "Grille Tarifaire"), icon: DollarSign, path: "/pricing/prices" },
        ],
      },
      {
        label: t("nav.distribution"), icon: Truck, sectionKey: "distribution",
        children: [
          { label: t("nav.routes"), icon: Route, path: "/distribution/routes" },
          { label: t("nav.deliveries"), icon: Truck, path: "/distribution/deliveries" },
          { label: t("nav.dailyClosing", "Clôture Quotidienne"), icon: ClipboardMinus, path: "/closing" },
        ],
      },
      ...(canSeeAccounting ? [{
        label: t("nav.accounting"), icon: Calculator, sectionKey: "accounting",
        children: [
          { label: t("nav.invoices"), icon: Receipt, path: "/accounting/invoices" },
          { label: t("nav.payments"), icon: CreditCard, path: "/accounting/payments" },
          { label: t("nav.paymentRuns"), icon: Banknote, path: "/accounting/payment-runs" },
          { label: t("nav.grniReport"), icon: FileCheck, path: "/accounting/grni" },
          { label: t("nav.bankReconciliation"), icon: Building2, path: "/accounting/bank-reconciliation" },
          { label: t("nav.chartOfAccounts"), icon: BookOpen, path: "/accounting/chart-of-accounts" },
          { label: t("nav.budgetCostCenters"), icon: Wallet, path: "/accounting/budgets" },
          { label: t("nav.reports"), icon: FileText, path: "/accounting/reports" },
        ],
      }] : []),
      {
        label: t("nav.bi"), icon: BarChart3, sectionKey: "bi",
        children: [
          { label: t("nav.wmsReports", "Rapports WMS"), icon: FileText, path: "/reports" },
          { label: t("nav.reportBuilder"), icon: ClipboardList, path: "/reports/builder" },
          { label: t("nav.marginHistory"), icon: DollarSign, path: "/reports/margin-history" },
          { label: t("nav.performance"), icon: TrendingUp, path: "/bi/performance" },
          { label: t("nav.profitability"), icon: BarChart3, path: "/bi/profitability" },
          { label: t("nav.categoryDistribution"), icon: FolderTree, path: "/bi/categories" },
          { label: t("nav.alerts"), icon: AlertTriangle, path: "/bi/alerts" },
        ],
      },
    ];

    // Supplier Portal section (only visible to Supplier role)
    if (currentUser?.role === "Supplier") {
      sections.push({
        label: "Mon Espace Fournisseur", icon: Package, sectionKey: "supplierPortal",
        children: [
          { label: "Tableau de bord", icon: LayoutDashboard, path: "/my/dashboard" },
          { label: "Mes Produits", icon: Package, path: "/my/products" },
          { label: "Mes Commandes", icon: ClipboardList, path: "/my/orders" },
          { label: "Factures", icon: Receipt, path: "/my/invoices" },
          { label: "Statistiques", icon: TrendingUp, path: "/my/stats" },
          { label: "Mon Profil", icon: Users, path: "/my/profile" },
        ],
      });
    }

    if (canSeeAdmin) {
      sections.push({
        label: t("nav.admin", "Admin"), icon: Settings, sectionKey: "admin",
        children: [
          { label: t("nav.users", "Utilisateurs & Accès"), icon: Users, path: "/settings/users" },
          { label: t("nav.auditLog", "Journal d'audit"), icon: ScrollText, path: "/settings/audit-log" },
          { label: t("nav.pickingStrategy", "Stratégie picking"), icon: ArrowDownUp, path: "/settings/picking-strategy" },
          { label: t("nav.approvalWorkflows", "Workflows approbation"), icon: FileCheck, path: "/settings/approval-workflows" },
          { label: t("nav.putawayRules", "Règles putaway"), icon: ArrowDownToLine, path: "/settings/putaway-rules" },
          { label: t("nav.alertRules", "Règles alertes"), icon: Bell, path: "/settings/alert-rules" },
          { label: t("nav.locationTypes", "Types emplacements"), icon: MapPin, path: "/settings/location-types" },
          { label: t("nav.integrations", "Intégrations"), icon: Plug, path: "/settings/integrations" },
          ...(isSystemAdmin ? [{ label: t("nav.systemSettings", "Paramètres Système"), icon: Shield, path: "/settings/system" }] : []),
        ],
      });
    }

    // Role filtering
    const userRole = currentUser?.role;
    const allowedSections = userRole ? ROLE_VISIBLE_SECTIONS[userRole] : undefined;
    if (!allowedSections) return sections;

    return sections
      .filter(s => allowedSections.has(s.sectionKey))
      .map(s => {
        if (userRole === "Operator" && s.sectionKey === "wms" && s.wmsSubGroups) {
          const filtered = s.wmsSubGroups
            .map(sg => ({ ...sg, children: sg.children.filter(c => OPERATOR_WMS_PATHS.has(c.path)) }))
            .filter(sg => sg.children.length > 0);
          return { ...s, wmsSubGroups: filtered };
        }
        return s;
      });
  }, [t, isSystemAdmin, wmsSubGroups, canSeeAdmin, canSeeAccounting, currentUser?.role]);

  // ── Section group labels ──
  const sectionGroupLabels: Record<string, string> = {
    dashboard: t("nav.sectionMain", "MAIN"),
    masterData: t("nav.sectionMain", "MAIN"),
    wms: t("nav.sectionWarehouse", "WAREHOUSE"),
    sales: t("nav.sectionSales", "SALES"),
    pricing: t("nav.sectionSales", "SALES"),
    distribution: t("nav.sectionDistribution", "DISTRIBUTION"),
    accounting: t("nav.sectionFinance", "FINANCE"),
    bi: t("nav.sectionFinance", "FINANCE"),
    admin: t("nav.sectionSettings", "SETTINGS"),
    supplierPortal: "FOURNISSEUR",
  };

  const groupedSections = useMemo(() => {
    const groups: { label: string; sections: typeof navigation }[] = [];
    let lastGroup = "";
    for (const section of navigation) {
      const groupLabel = sectionGroupLabels[section.sectionKey ?? ""] ?? "";
      if (groupLabel !== lastGroup) {
        groups.push({ label: groupLabel, sections: [section] });
        lastGroup = groupLabel;
      } else {
        groups[groups.length - 1].sections.push(section);
      }
    }
    return groups;
  }, [navigation, sectionGroupLabels]);

  const effectiveCollapsed = collapsed && !isMobile;

  const [autoOpenGroup, setAutoOpenGroup] = useState<string | null>(null);

  const expandSidebar = useCallback((groupLabel?: string) => {
    setCollapsed(false);
    localStorage.setItem("jawda-sidebar-collapsed", "false");
    if (groupLabel) setAutoOpenGroup(groupLabel);
  }, []);

  const sidebarContent = (
    <TooltipProvider>
    <div className="flex flex-col h-full">
      {/* ── Logo header ── */}
      <div className={cn(
        "flex h-[52px] items-center justify-between gap-2 border-b border-sidebar-border/10",
        effectiveCollapsed ? "px-2" : "px-3.5"
      )}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className={cn(
            "flex items-center justify-center rounded-lg shrink-0 transition-all duration-300",
            "bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/5",
            "ring-1 ring-sidebar-primary/20 shadow-[0_0_12px_-4px_hsl(var(--sidebar-primary)/0.3)]",
            effectiveCollapsed ? "h-8 w-8" : "h-8 w-8"
          )}>
            <Package className="h-4 w-4 text-sidebar-primary drop-shadow-[0_0_4px_hsl(var(--sidebar-primary)/0.4)]" />
          </div>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-w-0 overflow-hidden"
              >
                <h1 className="text-[13px] font-bold tracking-wide text-sidebar-foreground truncate leading-tight">
                  {t("app.name")}
                </h1>
                <p className="text-[9px] text-sidebar-primary/60 truncate leading-tight mt-0.5 tracking-[0.18em] uppercase font-semibold">
                  {t("app.subtitle")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/40 transition-colors">
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={toggleCollapsed}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              "text-sidebar-foreground/20 hover:text-sidebar-foreground/60",
              "hover:bg-sidebar-accent/50 active:scale-95"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={cn(
              "h-3.5 w-3.5 transition-transform duration-300 ease-out",
              !collapsed && "rotate-180"
            )} />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-2 space-y-px",
        effectiveCollapsed ? "px-1.5" : "px-2"
      )}>
        {groupedSections.map((group, gi) => (
          <div key={gi}>
            {group.label && !effectiveCollapsed && (
              <p className={cn(
                "px-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/20",
                gi === 0 ? "pt-1" : "pt-5"
              )}>
                {group.label}
              </p>
            )}
            {effectiveCollapsed && gi > 0 && (
              <div className="mx-1.5 my-2.5 border-t border-sidebar-border/10" />
            )}

            {group.sections.map(section => {
              // Dashboard direct link
              if (section.path) {
                return <NavItem key={section.sectionKey} label={section.label} icon={section.icon} path={section.path} collapsed={effectiveCollapsed} />;
              }

              // WMS sub-groups — rendered inline
              if (section.wmsSubGroups) {
                if (effectiveCollapsed) {
                  const allWmsChildren = section.wmsSubGroups.flatMap(sg => sg.children);
                  const hasActive = allWmsChildren.some(c => location.pathname.startsWith(c.path));
                  return (
                    <WmsCollapsedIcon
                      key={section.sectionKey}
                      icon={section.icon}
                      label={section.label}
                      hasActive={hasActive}
                      onExpandSidebar={expandSidebar}
                    />
                  );
                }
                return (
                  <WmsSubGroupNav key={section.sectionKey} subGroups={section.wmsSubGroups} collapsed={effectiveCollapsed} />
                );
              }

              // Regular sections with children
              if (section.children) {
                const shouldAutoOpen = autoOpenGroup === section.label;
                return (
                  <NavGroup
                    key={section.sectionKey}
                    label={section.label}
                    icon={section.icon}
                    children={section.children}
                    collapsed={effectiveCollapsed}
                    onExpandSidebar={expandSidebar}
                    forceOpen={shouldAutoOpen}
                    onForceOpenHandled={() => setAutoOpenGroup(null)}
                  />
                );
              }

              return null;
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <SidebarFooter collapsed={effectiveCollapsed} />
    </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 start-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 backdrop-blur-lg border border-border/40 shadow-lg md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        layout
        animate={{
          width: isMobile
            ? 240
            : collapsed ? 56 : 240,
          x: isMobile && !mobileOpen ? -240 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        className={cn(
          "fixed inset-inline-start-0 top-0 z-50 flex h-screen flex-col",
          "bg-sidebar backdrop-blur-2xl border-e border-sidebar-border shadow-[1px_0_24px_-4px_rgb(0_0_0/0.08)]",
          sidebarTheme === "light" && "sidebar-light",
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
