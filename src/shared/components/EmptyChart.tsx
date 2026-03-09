/**
 * Phase J5 — Empty chart state: "No data" message with icon.
 */
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface EmptyChartProps {
  message?: string;
  height?: number;
  className?: string;
}

export default function EmptyChart({ message, height = 200, className }: EmptyChartProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-muted-foreground gap-2",
        className,
      )}
      style={{ height }}
      role="img"
      aria-label={message ?? t("common.noData", "Aucune donnée")}
    >
      <BarChart3 className="h-8 w-8 opacity-30" />
      <p className="text-ds-sm font-medium">{message ?? t("common.noData", "Aucune donnée")}</p>
    </div>
  );
}
