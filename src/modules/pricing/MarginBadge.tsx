import { cn } from "@/lib/utils";
import { calcMargin } from "./pricing.types";

interface MarginBadgeProps {
  unitPrice: number;
  cost: number;
  className?: string;
}

export function MarginBadge({ unitPrice, cost, className }: MarginBadgeProps) {
  const margin = calcMargin(unitPrice, cost);
  const isNegative = margin < 0;
  const isLow = margin >= 0 && margin < 10;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
        isNegative
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : isLow
          ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
          : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
        className
      )}
    >
      {isNegative ? "⚠ " : ""}
      {margin.toFixed(1)}%
      {isNegative && " Marge négative"}
    </span>
  );
}
