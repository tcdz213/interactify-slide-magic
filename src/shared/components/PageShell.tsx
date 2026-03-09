/**
 * Phase C4 — PageShell: consistent page wrapper with breadcrumb, title, and actions slots.
 * Enforces standard page padding and max content width.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  /** Hide the auto-generated breadcrumb trail */
  hideBreadcrumbs?: boolean;
  /** Remove max-width constraint for full-bleed layouts */
  fullWidth?: boolean;
}

export default function PageShell({
  children,
  title,
  description,
  icon,
  actions,
  badge,
  className,
  hideBreadcrumbs = false,
  fullWidth = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 md:px-6 md:py-4 w-full",
        !fullWidth && "max-w-[1400px] mx-auto",
        className,
      )}
    >
      {/* Breadcrumbs */}
      {!hideBreadcrumbs && <Breadcrumbs />}

      {/* Header row */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-heading-page text-foreground">{title}</h1>
                {badge}
              </div>
              {description && (
                <p className="text-body-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">{actions}</div>
          )}
        </div>
      )}

      {/* Page content */}
      {children}
    </div>
  );
}
