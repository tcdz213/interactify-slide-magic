import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Menu, X } from "lucide-react";
import { canViewFinancials } from "@/lib/rbac";
import {
  Warehouse, ShoppingCart, Truck, Calculator, BarChart3, LayoutDashboard,
  Package, ClipboardList, RotateCcw, Users, Route, Receipt, CreditCard,
  FileText, TrendingUp, AlertTriangle, Settings, ChevronDown, ChevronRight, LogOut,
  ShoppingBag, Building2, ClipboardCheck, Settings2, ArrowRightLeft, Globe,
  FolderTree, Ruler, ScanBarcode, MapPin, Database, ShieldCheck, ArrowDownToLine, ScrollText, Layers, Hand, Box,
  Lock, RefreshCw, ListTodo, ArrowDownUp, FileCheck, Combine, PackageOpen, ShieldOff, Repeat,
  Fingerprint, DollarSign, Boxes, DoorOpen, Bell, Plug, PackageCheck, History, ClipboardMinus,
  Tags, BadgeDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface WmsSubGroup {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  children: NavItem[];
}

interface NavSection {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
  wmsSubGroups?: WmsSubGroup[];
}

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export default function AppSidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, isSystemAdmin, currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("jawda-sidebar-collapsed");
    return saved === "true";
  });
  const [expanded, setExpanded] = useState<string[]>([]);
  const [expandedSubGroups, setExpandedSubGroups] = useState<string[]>([]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("jawda-sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  const wmsSubGroups: WmsSubGroup[] = useMemo(() => [
    {
      label: t("nav.wmsInbound", "Inbound"),
      icon: PackageCheck,
      colorClass: "text-emerald-400",
      children: [
        { label: t("nav.grn"), icon: Package, path: "/wms/grn" },
        { label: t("nav.qualityControl", "Contrôle Qualité"), icon: ShieldCheck, path: "/wms/quality-control" },
        { label: t("nav.putaway", "Rangement"), icon: ArrowDownToLine, path: "/wms/putaway" },
        { label: t("nav.crossDocking", "Cross Docking"), icon: Repeat, path: "/wms/cross-docking" },
        { label: t("nav.purchaseOrders"), icon: ShoppingBag, path: "/wms/purchase-orders" },
        { label: t("nav.supplierContracts", "Contrats fournisseurs"), icon: FileCheck, path: "/wms/supplier-contracts" },
      ],
    },
    {
      label: t("nav.wmsOutbound", "Outbound"),
      icon: Truck,
      colorClass: "text-blue-400",
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
      label: t("nav.wmsStock", "Stock"),
      icon: ClipboardList,
      colorClass: "text-violet-400",
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
      label: t("nav.wmsTraceability", "Traçabilité"),
      icon: Fingerprint,
      colorClass: "text-amber-400",
      children: [
        { label: t("nav.lotBatch", "Lots / Batch"), icon: Boxes, path: "/wms/lot-batch" },
        { label: t("nav.serialNumbers", "N° de Série"), icon: Fingerprint, path: "/wms/serial-numbers" },
        { label: t("nav.stockValuation", "Valorisation Stock"), icon: DollarSign, path: "/wms/stock-valuation" },
        { label: t("nav.priceHistory", "Historique Prix"), icon: History, path: "/wms/price-history" },
      ],
    },
    {
      label: t("nav.wmsInternalOps", "Opérations Internes"),
      icon: Combine,
      colorClass: "text-rose-400",
      children: [
        { label: t("nav.kitting", "Kitting / Assemblage"), icon: Combine, path: "/wms/kitting" },
        { label: t("nav.repacking", "Reconditionnement"), icon: PackageOpen, path: "/wms/repacking" },
        { label: t("nav.returns"), icon: RotateCcw, path: "/wms/returns" },
      ],
    },
    {
      label: t("nav.wmsFieldMgmt", "Gestion Terrain"),
      icon: ListTodo,
      colorClass: "text-cyan-400",
      children: [
        { label: t("nav.taskQueue", "File de tâches"), icon: ListTodo, path: "/wms/tasks" },
        { label: t("nav.yardDock", "Yard & Dock"), icon: DoorOpen, path: "/wms/yard-dock" },
      ],
    },
  ], [t]);

  /** Roles that can see the Admin section */
  const ADMIN_ROLES = new Set(["CEO", "SystemAdmin", "OpsDirector", "FinanceDirector", "RegionalManager"]);
  const canSeeAdmin = currentUser ? ADMIN_ROLES.has(currentUser.role) : false;
  const canSeeAccounting = currentUser ? canViewFinancials(currentUser) : false;

  const navigation: NavSection[] = useMemo(() => {
    const sections: NavSection[] = [
    { label: t("nav.dashboard"), icon: LayoutDashboard, path: "/" },
    {
      label: t("nav.masterData", "Données de base"), icon: Database,
      children: [
        { label: t("nav.products", "Produits"), icon: Package, path: "/wms/products" },
        { label: t("nav.categories", "Catégories"), icon: FolderTree, path: "/wms/categories" },
        { label: t("nav.uom", "Unités de mesure"), icon: Ruler, path: "/wms/uom" },
        { label: t("nav.barcodes", "Codes-barres"), icon: ScanBarcode, path: "/wms/barcodes" },
        { label: t("nav.vendors"), icon: Users, path: "/wms/vendors" },
        { label: t("nav.carriers", "Transporteurs"), icon: Truck, path: "/wms/carriers" },
        { label: t("nav.warehouses"), icon: Building2, path: "/wms/warehouses" },
        { label: t("nav.locations", "Emplacements"), icon: MapPin, path: "/wms/locations" },
      ],
    },
    {
      label: t("nav.wms"), icon: Warehouse,
      wmsSubGroups: wmsSubGroups,
    },
    {
      label: t("nav.sales"), icon: ShoppingCart,
      children: [
        { label: t("nav.orders"), icon: ShoppingCart, path: "/sales/orders" },
        { label: t("nav.customers"), icon: Users, path: "/sales/customers" },
        { label: "Plan de Tournée", icon: Route, path: "/sales/route-plan" },
      ],
    },
    {
      label: t("nav.pricing", "Tarification"), icon: BadgeDollarSign,
      children: [
        { label: t("nav.clientTypes", "Types de Clients"), icon: Tags, path: "/pricing/client-types" },
        { label: t("nav.priceManagement", "Grille Tarifaire"), icon: DollarSign, path: "/pricing/prices" },
      ],
    },
    {
      label: t("nav.distribution"), icon: Truck,
      children: [
        { label: t("nav.routes"), icon: Route, path: "/distribution/routes" },
        { label: t("nav.deliveries"), icon: Truck, path: "/distribution/deliveries" },
        { label: t("nav.dailyClosing", "Clôture Quotidienne"), icon: ClipboardMinus, path: "/closing" },
      ],
    },
    ...(canSeeAccounting ? [{
      label: t("nav.accounting"), icon: Calculator,
      children: [
        { label: t("nav.invoices"), icon: Receipt, path: "/accounting/invoices" },
        { label: t("nav.payments"), icon: CreditCard, path: "/accounting/payments" },
        { label: t("nav.reports"), icon: FileText, path: "/accounting/reports" },
      ],
    }] : []),
    {
      label: t("nav.bi"), icon: BarChart3,
      children: [
        { label: t("nav.wmsReports", "Rapports WMS"), icon: FileText, path: "/reports" },
        { label: "Générateur de rapports", icon: ClipboardList, path: "/reports/builder" },
        { label: "Marge Historique", icon: DollarSign, path: "/reports/margin-history" },
        { label: t("nav.performance"), icon: TrendingUp, path: "/bi/performance" },
        { label: "Rentabilité", icon: BarChart3, path: "/bi/profitability" },
        { label: t("nav.alerts"), icon: AlertTriangle, path: "/bi/alerts" },
      ],
    },
    ];

    // Only show Admin section for authorized roles
    if (canSeeAdmin) {
      sections.push({
        label: t("nav.admin", "Admin"),
        icon: Settings,
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

    return sections;
  }, [t, isSystemAdmin, wmsSubGroups, canSeeAdmin]);

  // Auto-expand active section + sub-group on mount and route change
  useEffect(() => {
    const path = location.pathname;
    for (const section of navigation) {
      if (section.path && section.path === path) {
        setExpanded((prev) => prev.includes(section.label) ? prev : [...prev, section.label]);
        return;
      }
      if (section.children?.some((c) => path.startsWith(c.path))) {
        setExpanded((prev) => prev.includes(section.label) ? prev : [...prev, section.label]);
        return;
      }
      if (section.wmsSubGroups) {
        for (const sg of section.wmsSubGroups) {
          if (sg.children.some((c) => path.startsWith(c.path))) {
            setExpanded((prev) => prev.includes(section.label) ? prev : [...prev, section.label]);
            setExpandedSubGroups((prev) => prev.includes(sg.label) ? prev : [...prev, sg.label]);
            return;
          }
        }
      }
    }
  }, [location.pathname, navigation]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  const toggleSection = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [label]
    );
    // Reset sub-groups when switching sections
    setExpandedSubGroups([]);
  };

  const toggleSubGroup = (label: string) => {
    setExpandedSubGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [label]
    );
  };

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("jawda-lang", code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = code;
  };

  const isActive = (path: string) => location.pathname === path;

  const isSectionActive = (section: NavSection) => {
    if (section.children?.some((c) => location.pathname.startsWith(c.path))) return true;
    if (section.wmsSubGroups?.some((sg) => sg.children.some((c) => location.pathname.startsWith(c.path)))) return true;
    return false;
  };

  const isSubGroupActive = (sg: WmsSubGroup) =>
    sg.children.some((c) => location.pathname.startsWith(c.path));

  const renderNavItem = (child: NavItem, indentClass = "ml-4 pl-3") => (
    <Link
      key={child.path}
      to={child.path}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-medium transition-all duration-150",
        isActive(child.path)
          ? "bg-primary/15 text-primary before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-primary"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <child.icon className="h-3.5 w-3.5 shrink-0" />
      {child.label}
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between gap-3 px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-sidebar-primary-foreground tracking-tight truncate">
                {t("app.name")}
              </h1>
              <p className="text-[10px] text-sidebar-foreground/60 font-medium truncate">
                {t("app.subtitle")}
              </p>
            </div>
          )}
        </div>
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md hover:bg-sidebar-accent">
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        ) : (
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", !collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-4 space-y-1", collapsed && !isMobile ? "px-1.5" : "px-3")}>
        {navigation.map((section) => {
          // Direct link (Dashboard)
          if (section.path) {
            return collapsed && !isMobile ? (
              <Link
                key={section.label}
                to={section.path}
                className={cn(
                  "flex items-center justify-center rounded-lg p-2.5 transition-all duration-150",
                  isActive(section.path)
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={section.label}
              >
                <section.icon className="h-4 w-4 shrink-0" />
              </Link>
            ) : (
              <Link
                key={section.label}
                to={section.path}
              className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  isActive(section.path)
                    ? "bg-primary/15 text-primary before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <section.icon className="h-4 w-4 shrink-0" />
                {section.label}
              </Link>
            );
          }

          const sectionActive = isSectionActive(section);
          const isExpanded = expanded.includes(section.label);

          if (collapsed && !isMobile) {
            return (
              <div key={section.label}>
                <Link
                  to={section.children?.[0]?.path ?? section.wmsSubGroups?.[0]?.children?.[0]?.path ?? "#"}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2.5 transition-all duration-150",
                    sectionActive
                      ? "text-primary bg-primary/10"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={section.label}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            );
          }

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  sectionActive
                    ? "text-primary bg-primary/10"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <section.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    !isExpanded && "-rotate-90"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                  {/* Regular children (non-WMS sections) */}
                  {section.children?.map((child) => renderNavItem(child))}

                  {/* WMS sub-groups */}
                  {section.wmsSubGroups?.map((sg) => {
                    const sgActive = isSubGroupActive(sg);
                    const sgExpanded = expandedSubGroups.includes(sg.label);

                    return (
                      <div key={sg.label}>
                        <button
                          onClick={() => toggleSubGroup(sg.label)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-medium transition-all duration-150",
                            sgActive
                              ? "bg-primary/5 text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <sg.icon className={cn("h-3.5 w-3.5 shrink-0", sgActive ? sg.colorClass : "")} />
                          <span className="flex-1 text-left">{sg.label}</span>
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 transition-transform duration-200",
                              sgExpanded && "rotate-90"
                            )}
                          />
                        </button>

                        {sgExpanded && (
                          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border/50 pl-2">
                            {sg.children.map((child) => renderNavItem(child, ""))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Language Switcher */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Globe className="h-3.5 w-3.5 text-sidebar-foreground/60" />
            <div className="flex gap-1">
              {LANGS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLang(lang.code)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                    i18n.language === lang.code
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  )}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={cn("border-t border-sidebar-border space-y-1", collapsed && !isMobile ? "p-1.5" : "p-3")}>
        <Link
          to="/settings"
          className={cn(
            "flex items-center rounded-lg text-[13px] font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all",
            collapsed && !isMobile ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          )}
          title={collapsed ? t("nav.settings") : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && t("nav.settings")}
        </Link>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className={cn(
            "flex w-full items-center rounded-lg text-[13px] font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-destructive transition-all",
            collapsed && !isMobile ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          )}
          title={collapsed ? t("nav.logout") : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && t("nav.logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border shadow-sm md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isMobile ? (mobileOpen ? "w-64" : "w-64 -translate-x-full") : (collapsed ? "w-16" : "w-64")
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
