import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="px-4 pt-4 pb-6 space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-14 rounded-xl" />
    </div>
  );
}

export function CustomerListSkeleton() {
  return (
    <div className="px-4 pt-1 space-y-2 animate-in fade-in duration-300">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="px-4 pt-3 space-y-2 animate-in fade-in duration-300">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-[72px] rounded-xl" />
      ))}
    </div>
  );
}

export function RouteListSkeleton() {
  return (
    <div className="px-4 pt-3 space-y-3 animate-in fade-in duration-300">
      <Skeleton className="h-2 rounded-full" />
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function CustomerDetailSkeleton() {
  return (
    <div className="px-4 pt-4 space-y-4 animate-in fade-in duration-300">
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

// Aliases used by mobile screens
export const MobileSkeletonDashboard = DashboardSkeleton;
export const MobileSkeletonList = CustomerListSkeleton;
