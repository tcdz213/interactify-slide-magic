/**
 * Phase 6 — Animated KPI Card wrapper with framer-motion stagger + count-up.
 */
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedKpiCardProps {
  title: string;
  value: string;
  /** Numeric value for count-up animation */
  numericValue?: number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
  index?: number;
  onClick?: () => void;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

export default function AnimatedKpiCard({
  title,
  value,
  numericValue,
  change,
  changeType = "neutral",
  icon: Icon,
  subtitle,
  className,
  index = 0,
  onClick,
}: AnimatedKpiCardProps) {
  const countedValue = useCountUp(numericValue ?? 0, 900);
  const displayValue = numericValue !== undefined ? String(countedValue) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className={cn(
        "glass-card rounded-xl p-3.5 md:p-5 transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
        onClick && "cursor-pointer",
        className
      )}
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
          <p className="text-lg md:text-2xl font-bold tracking-tight text-foreground">
            {numericValue !== undefined ? displayValue : value}
          </p>
          {change && (
            <div className="flex items-center gap-1">
              {changeType === "up" && <TrendingUp className="h-3 w-3 text-success" />}
              {changeType === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
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
                <span className="text-[11px] text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.06 + 0.2, type: "spring", stiffness: 300 }}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
}
