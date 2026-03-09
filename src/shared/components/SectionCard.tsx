/**
 * Phase E4 — SectionCard: card with header bar (title + action buttons), used for grouped content.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** No inner padding for tables or full-bleed content */
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  contentClassName,
  noPadding = false,
}: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-[var(--shadow-card)]", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-ds-base font-semibold text-foreground truncate">{title}</h3>
            {subtitle && (
              <p className="text-ds-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {/* Content */}
      <div className={cn(!noPadding && "p-5", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
