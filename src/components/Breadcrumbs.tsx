import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const ROUTE_LABELS: Record<string, string> = {
  wms: "WMS",
  sales: "Ventes",
  distribution: "Distribution",
  accounting: "Comptabilité",
  bi: "BI & Rapports",
  settings: "Admin",
  reports: "Rapports",
  grn: "Réception (GRN)",
  inventory: "Inventaire",
  products: "Produits",
  categories: "Catégories",
  uom: "Unités de mesure",
  barcodes: "Codes-barres",
  vendors: "Fournisseurs",
  carriers: "Transporteurs",
  warehouses: "Entrepôts",
  locations: "Emplacements",
  "purchase-orders": "Bons de commande",
  "quality-control": "Contrôle qualité",
  putaway: "Rangement",
  "cross-docking": "Cross Docking",
  "supplier-contracts": "Contrats fournisseurs",
  waves: "Vagues",
  picking: "Picking",
  packing: "Packing",
  shipping: "Expédition",
  "replenishment-rules": "Réapprovisionnement",
  reservations: "Réservations",
  movements: "Journal mouvements",
  "cycle-count": "Inventaire tournant",
  adjustments: "Ajustements",
  transfers: "Transferts",
  "stock-block": "Blocage stock",
  "lot-batch": "Lots / Batch",
  "serial-numbers": "N° de série",
  "stock-valuation": "Valorisation stock",
  kitting: "Kitting",
  repacking: "Reconditionnement",
  returns: "Retours",
  "supplier-returns": "Retours fournisseurs",
  tasks: "File de tâches",
  "yard-dock": "Yard & Dock",
  orders: "Commandes",
  customers: "Clients",
  routes: "Tournées",
  deliveries: "Livraisons",
  invoices: "Factures",
  payments: "Paiements",
  performance: "Performance",
  alerts: "Alertes",
  users: "Utilisateurs",
  "audit-log": "Journal d'audit",
  "picking-strategy": "Stratégie picking",
  "approval-workflows": "Workflows",
  "putaway-rules": "Règles putaway",
  "alert-rules": "Règles alertes",
  "location-types": "Types emplacements",
  integrations: "Intégrations",
  system: "Paramètres système",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = ROUTE_LABELS[seg] || seg;
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c) => (
        <span key={c.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {c.isLast ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link to={c.path} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
