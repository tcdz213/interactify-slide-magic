import { cn } from "@/lib/utils";

interface CreditGaugeProps {
  used: number;
  limit: number;
  className?: string;
}

export default function CreditGauge({ used, limit, className }: CreditGaugeProps) {
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const available = limit - used;
  const color = pct > 90 ? "bg-destructive" : pct > 70 ? "bg-amber-500" : "bg-primary";
  const textColor = pct > 90 ? "text-destructive" : pct > 70 ? "text-amber-500" : "text-primary";

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">💳 Crédit disponible</span>
        <span className={cn("text-xs font-bold", textColor)}>{pct}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Utilisé: {fmt(used)} DZD</span>
        <span className={cn("font-semibold", textColor)}>Reste: {fmt(available)} DZD</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Limite: {fmt(limit)} DZD</p>
    </div>
  );
}
