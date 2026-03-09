/**
 * Phase E2 — Redesigned KPI Card: icon left, value + label right, optional trend badge.
 */
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export default function KpiCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  subtitle,
  className,
  delay = 0,
  onClick,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 md:p-5 animate-slide-in transition-all duration-200",
        "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Phase E2: icon left, content right */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-overline text-muted-foreground">{title}</p>
          <p className="text-ds-xl md:text-ds-2xl font-bold tracking-tight text-foreground animate-count-up">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {changeType === "up" && <TrendingUp className="h-3 w-3 text-success" />}
              {changeType === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
              <span
                className={cn(
                  "text-ds-xs font-medium",
                  changeType === "up" && "text-success",
                  changeType === "down" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground",
                )}
              >
                {change}
              </span>
              {subtitle && (
                <span className="text-ds-xs text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
