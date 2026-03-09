import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* I2 — Badge variants: dot, pill (default), outlined, filled */
const badgeVariants = cva(
  "inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        /* Filled: strong bg */
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        /* Outlined: border only */
        outline: "border-current text-foreground",
        /* Subtle status variants (I1) */
        success: "border-transparent status-success",
        warning: "border-transparent status-warning",
        info: "border-transparent status-info",
        error: "border-transparent status-error",
        neutral: "border-transparent bg-muted text-muted-foreground",
        processing: "border-transparent status-info animate-pulse",
      },
      size: {
        default: "rounded-full px-2.5 py-0.5 text-xs",
        sm: "rounded-full px-2 py-px text-[10px]",
        lg: "rounded-full px-3 py-1 text-sm",
        /* Dot: small circle indicator (I2) */
        dot: "h-2 w-2 rounded-full p-0 border-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

/* I4 — Notification badge: red dot with count */
interface NotificationBadgeProps {
  count: number;
  className?: string;
  children: React.ReactNode;
}

function NotificationBadge({ count, className, children }: NotificationBadgeProps) {
  return (
    <span className="relative inline-flex">
      {children}
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-1.5 -end-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background",
            count > 99 && "min-w-5 px-1.5",
            className,
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

export { Badge, badgeVariants, NotificationBadge };
