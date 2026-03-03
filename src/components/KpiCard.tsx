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
        "glass-card rounded-xl p-3.5 md:p-5 animate-slide-in transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
        onClick && "cursor-pointer",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-lg md:text-2xl font-bold tracking-tight text-foreground animate-count-up">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1">
              {changeType === "up" && (
                <TrendingUp className="h-3 w-3 text-success" />
              )}
              {changeType === "down" && (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span
                className={cn(
                  "text-[11px] font-medium",
                  changeType === "up" && "text-success",
                  changeType === "down" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </span>
              {subtitle && (
                <span className="text-[11px] text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
