/**
 * Phase I — Unified StatusBadge mapping business statuses to Badge variants.
 * I3: Maps all business statuses to visual states.
 */
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType = "success" | "warning" | "error" | "info" | "neutral" | "processing";

interface StatusConfig {
  label: string;
  type: StatusType;
}

const statusMap: Record<string, StatusConfig> = {
  // ── Success states ──
  Approved: { label: "Approuvé", type: "success" },
  Delivered: { label: "Livré", type: "success" },
  Completed: { label: "Terminé", type: "success" },
  Passed: { label: "Conforme", type: "success" },
  Active: { label: "Actif", type: "success" },
  Online: { label: "En ligne", type: "success" },
  Confirmed: { label: "Confirmée", type: "success" },
  Received: { label: "Reçue", type: "success" },
  Paid: { label: "Payée", type: "success" },
  Credited: { label: "Crédité", type: "success" },
  Found: { label: "Trouvé", type: "success" },
  Available: { label: "Disponible", type: "success" },
  Unblocked: { label: "Débloqué", type: "success" },
  Checked_Out: { label: "Sorti", type: "success" },
  Connected: { label: "Connecté", type: "success" },
  Completed_payment: { label: "Complété", type: "success" },
  "Entrée": { label: "Entrée", type: "success" },
  In_Stock: { label: "En stock", type: "success" },

  // ── Warning states ──
  QC_Pending: { label: "QC en attente", type: "warning" },
  Picking: { label: "Picking", type: "warning" },
  Partially_Delivered: { label: "Partiel", type: "warning" },
  Partial: { label: "Partiel", type: "warning" },
  Partially_Paid: { label: "Partiel", type: "warning" },
  Partially_Received: { label: "Partiel reçu", type: "warning" },
  Loading: { label: "Chargement", type: "warning" },
  Loaded: { label: "Chargé", type: "warning" },
  Pending_QC: { label: "QC en attente", type: "warning" },
  Pending_Review: { label: "Revue", type: "warning" },
  Conditional: { label: "Conditionnel", type: "warning" },
  High: { label: "Haute", type: "warning" },
  Reserved: { label: "Réservé", type: "warning" },
  Occupied: { label: "Occupé", type: "warning" },
  Unloading: { label: "Déchargement", type: "warning" },
  Pending_payment: { label: "En attente", type: "warning" },
  Expiry: { label: "Expiration", type: "warning" },
  Shrinkage: { label: "Perte", type: "warning" },
  StockLevel: { label: "Niveau stock", type: "warning" },
  OrderDelay: { label: "Retard cmd", type: "warning" },
  "Sortie": { label: "Sortie", type: "warning" },
  Below: { label: "En dessous", type: "warning" },
  Vendor: { label: "Fournisseur", type: "warning" },
  Vendors: { label: "Fournisseurs", type: "warning" },
  Outbound: { label: "Expédition", type: "warning" },
  Email: { label: "Email", type: "warning" },
  Carrier: { label: "Transporteur", type: "warning" },

  // ── Info states ──
  Approval_Pending: { label: "Approbation", type: "info" },
  Pending_Approval: { label: "Approbation", type: "info" },
  Packed: { label: "Emballé", type: "info" },
  Shipped: { label: "Expédié", type: "info" },
  In_Transit: { label: "En transit", type: "info" },
  In_Progress: { label: "En cours", type: "info" },
  Sent: { label: "Envoyée", type: "info" },
  Submitted: { label: "Soumis", type: "info" },
  Processed: { label: "Traité", type: "info" },
  Inbound: { label: "Réception", type: "info" },
  Checked_In: { label: "Enregistré", type: "info" },
  Docked: { label: "Au quai", type: "info" },
  Correction: { label: "Correction", type: "info" },
  Medium: { label: "Moyenne", type: "info" },
  Customer: { label: "Client", type: "info" },
  Customers: { label: "Clients", type: "info" },
  InApp: { label: "In-App", type: "info" },
  Inventory: { label: "Inventaire", type: "info" },
  CycleCountVariance: { label: "Variance", type: "info" },
  Category: { label: "Catégorie", type: "info" },
  Temperature: { label: "Température", type: "info" },
  "E-Commerce": { label: "E-Commerce", type: "info" },
  Above: { label: "Au dessus", type: "info" },
  Within: { label: "Dans", type: "info" },

  // ── Error states ──
  Rejected: { label: "Rejeté", type: "error" },
  Credit_Hold: { label: "Crédit bloqué", type: "error" },
  Failed: { label: "Échoué", type: "error" },
  Returned: { label: "Retourné", type: "error" },
  Overdue: { label: "En retard", type: "error" },
  Disputed: { label: "Contestée", type: "error" },
  Bounced: { label: "Rejeté", type: "error" },
  Requires_Investigation: { label: "Enquête", type: "error" },
  Damage: { label: "Dommage", type: "error" },
  Theft: { label: "Vol", type: "error" },
  Critical: { label: "Critique", type: "error" },
  Full: { label: "Plein", type: "error" },
  Blocked: { label: "Bloqué", type: "error" },
  Suspended: { label: "Suspendu", type: "error" },
  Error: { label: "Erreur", type: "error" },
  Return: { label: "Retour", type: "error" },
  Quarantine: { label: "Quarantaine", type: "error" },
  Expired: { label: "Expiré", type: "error" },
  Recalled: { label: "Rappelé", type: "error" },
  Defective: { label: "Défectueux", type: "error" },
  ExpiryDate: { label: "Date exp.", type: "error" },

  // ── Neutral states ──
  Draft: { label: "Brouillon", type: "neutral" },
  Cancelled: { label: "Annulé", type: "neutral" },
  Planning: { label: "Planification", type: "neutral" },
  Pending: { label: "En attente", type: "neutral" },
  Inactive: { label: "Inactif", type: "neutral" },
  Offline: { label: "Hors ligne", type: "neutral" },
  Scheduled: { label: "Planifié", type: "neutral" },
  Cancelled_payment: { label: "Annulé", type: "neutral" },
  Maintenance: { label: "Maintenance", type: "neutral" },
  Low: { label: "Faible", type: "neutral" },
  Weight: { label: "Poids", type: "neutral" },
  Custom: { label: "Custom", type: "neutral" },
  Disconnected: { label: "Déconnecté", type: "neutral" },
  Accounting: { label: "Comptabilité", type: "neutral" },
  Both: { label: "Les deux", type: "neutral" },
  Locations: { label: "Emplacements", type: "neutral" },
  Consumed: { label: "Consommé", type: "neutral" },
  Scrapped: { label: "Mis au rebut", type: "neutral" },
  Equals: { label: "Égal", type: "neutral" },

  // ── Processing states ──
  Syncing: { label: "Sync…", type: "processing" },
  Processing: { label: "Traitement", type: "processing" },
  Executing: { label: "Exécution", type: "processing" },
  Queued: { label: "En file", type: "neutral" },

  // ── Primary accent ──
  Invoiced: { label: "Facturé", type: "info" },
  ERP: { label: "ERP", type: "info" },
  Products: { label: "Produits", type: "info" },
  PurchaseOrders: { label: "Commandes", type: "info" },
  Sold: { label: "Vendu", type: "info" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  /** Show a dot indicator before the label */
  showDot?: boolean;
}

export default function StatusBadge({ status, className, showDot = false }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, type: "neutral" as StatusType };
  return (
    <Badge
      variant={config.type}
      size="sm"
      className={cn("gap-1.5", className)}
    >
      {showDot && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full flex-none",
          config.type === "success" && "bg-[hsl(var(--success))]",
          config.type === "warning" && "bg-[hsl(var(--warning))]",
          config.type === "error" && "bg-[hsl(var(--destructive))]",
          config.type === "info" && "bg-[hsl(var(--info))]",
          config.type === "neutral" && "bg-muted-foreground",
          config.type === "processing" && "bg-[hsl(var(--info))] animate-pulse",
        )} />
      )}
      {config.label}
    </Badge>
  );
}
