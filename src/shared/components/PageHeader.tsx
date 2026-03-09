/**
 * Phase 5 — Unified page header with title, breadcrumb, description & action buttons.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  hideBreadcrumbs?: boolean;
}

export default function PageHeader({
  title,
  description,
  icon,
  actions,
  badge,
  className,
  hideBreadcrumbs = false,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {!hideBreadcrumbs && <Breadcrumbs />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">{actions}</div>
        )}
      </div>
    </div>
  );
}
