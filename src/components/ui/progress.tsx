/**
 * Phase I5 — Progress bar with percentage label.
 */
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-1.5",
  default: "h-2.5",
  lg: "h-4",
};

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, showLabel = false, size = "default", ...props }, ref) => (
    <div className={cn("flex items-center gap-3", showLabel && "w-full")}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative w-full overflow-hidden rounded-full bg-secondary", sizeClasses[size], className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="text-xs font-medium tabular-nums text-muted-foreground min-w-[3ch] text-right">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
