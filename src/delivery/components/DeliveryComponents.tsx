import { cn } from "@/lib/utils";
import type { StopStatus } from "../types/trip";

const STATUS_CONFIG: Record<StopStatus, { label: string; className: string }> = {
  pending: { label: "À faire", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "En cours", className: "bg-primary/10 text-primary" },
  delivered: { label: "Livré ✅", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  partially_delivered: { label: "Partiel ⚠️", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  refused: { label: "Refusé ❌", className: "bg-destructive/10 text-destructive" },
  skipped: { label: "Sauté", className: "bg-muted text-muted-foreground" },
};

export function StopStatusBadge({ status }: { status: StopStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", config.className)}>
      {config.label}
    </span>
  );
}

export function DeliveryProgressBar({ delivered, total }: { delivered: number; total: number }) {
  const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{delivered}/{total} arrêts</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SLABadge({ plannedTime, actualTime }: { plannedTime?: string; actualTime?: string }) {
  if (!plannedTime || !actualTime) return null;
  const [ph, pm] = plannedTime.split(":").map(Number);
  const [ah, am] = actualTime.split(":").map(Number);
  const diffMin = (ah * 60 + am) - (ph * 60 + pm);
  
  if (diffMin <= 5) {
    return <span className="text-[9px] font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">✅ À l'heure</span>;
  }
  if (diffMin <= 15) {
    return <span className="text-[9px] font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">⚠️ +{diffMin}min</span>;
  }
  return <span className="text-[9px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">🔴 +{diffMin}min</span>;
}
