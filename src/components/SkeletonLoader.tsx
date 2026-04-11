import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type SkeletonVariant = 'table' | 'card' | 'chart' | 'form';

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  rows?: number;
  className?: string;
}

function TableSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="grid grid-cols-5 gap-4 p-4 border-b border-border">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-20" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-border last:border-0">
          {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-4 w-full" />)}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ rows = 4 }: { rows: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="stat-card space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function FormSkeleton({ rows = 4 }: { rows: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLoader({ variant, rows, className }: SkeletonLoaderProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {variant === 'table' && <TableSkeleton rows={rows ?? 5} />}
      {variant === 'card' && <CardSkeleton rows={rows ?? 4} />}
      {variant === 'chart' && <ChartSkeleton />}
      {variant === 'form' && <FormSkeleton rows={rows ?? 4} />}
    </div>
  );
}
