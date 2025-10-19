import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const EnhancedCardSkeleton = () => {
  return (
    <Card className="overflow-hidden animate-scale-up">
      <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 animate-shimmer bg-[length:200%_100%]">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export const EnhancedListSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex gap-4 p-4">
            <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const EnhancedProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
