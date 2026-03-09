/**
 * Phase J2 — Enhanced ChartCard with title, subtitle, legend, filters, empty state, responsive.
 */
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import EmptyChart from "./EmptyChart";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  legend?: ReactNode;
  height?: number;
  className?: string;
  /** When true, shows the EmptyChart placeholder instead of children */
  isEmpty?: boolean;
  emptyMessage?: string;
  /** ARIA label for accessibility (Phase M3) */
  ariaLabel?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  actions,
  legend,
  height = 300,
  className,
  isEmpty,
  emptyMessage,
  ariaLabel,
}: ChartCardProps) {
  return (
    <Card
      className={cn("overflow-hidden", className)}
      role="figure"
      aria-label={ariaLabel ?? title}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {subtitle && <CardDescription className="text-xs mt-0.5">{subtitle}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </CardHeader>
      <CardContent className="pb-4">
        <div style={{ height }}>
          {isEmpty ? <EmptyChart message={emptyMessage} height={height} /> : children}
        </div>
        {legend && <div className="mt-2">{legend}</div>}
      </CardContent>
    </Card>
  );
}
