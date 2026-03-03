import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  Draft: { label: "Brouillon", class: "bg-muted text-muted-foreground" },
  Pending: { label: "En attente", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  Approved: { label: "Approuvé", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  Picking: { label: "Préparation", class: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  Shipped: { label: "🚚 En livraison", class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  Delivered: { label: "✅ Livré", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  Cancelled: { label: "❌ Annulé", class: "bg-destructive/10 text-destructive" },
  Credit_Hold: { label: "⛔ Bloqué crédit", class: "bg-destructive/10 text-destructive" },
  // Invoice statuses
  draft: { label: "Brouillon", class: "bg-muted text-muted-foreground" },
  issued: { label: "Émise", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  paid: { label: "✅ Payée", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  overdue: { label: "⚠️ Échue", class: "bg-destructive/10 text-destructive" },
  partially_paid: { label: "Partielle", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  cancelled: { label: "Annulée", class: "bg-muted text-muted-foreground" },
  // Payment
  pending: { label: "En attente", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  confirmed: { label: "✅ Confirmé", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  rejected: { label: "❌ Rejeté", class: "bg-destructive/10 text-destructive" },
  bounced: { label: "⛔ Rejeté", class: "bg-destructive/10 text-destructive" },
  // Return
  approved: { label: "✅ Approuvé", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  completed: { label: "✅ Complété", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function PortalStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, class: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap", cfg.class)}>
      {cfg.label}
    </span>
  );
}
