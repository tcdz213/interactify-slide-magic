/**
 * Phase K6 — Skeleton loading for charts matching final layout.
 */
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  height?: number;
  className?: string;
  variant?: "bar" | "pie" | "line";
}

export default function ChartSkeleton({ height = 300, className, variant = "bar" }: ChartSkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-3", className)}>
      {/* Title area */}
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      {/* Chart area */}
      <div className="flex items-end gap-1.5 justify-center" style={{ height: height - 80 }}>
        {variant === "bar" && (
          <>
            {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 max-w-[32px] rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </>
        )}
        {variant === "pie" && (
          <Skeleton className="h-32 w-32 rounded-full" />
        )}
        {variant === "line" && (
          <Skeleton className="w-full h-full rounded-md" />
        )}
      </div>
    </div>
  );
}
