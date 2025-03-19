
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from 'lucide-react';

interface CenterCardSkeletonProps {
  viewMode: 'grid' | 'list';
}

const CenterCardSkeleton: React.FC<CenterCardSkeletonProps> = ({ viewMode }) => {
  const [loadProgress, setLoadProgress] = React.useState(0);

  // Simulate progress for loading state demonstration
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  if (viewMode === 'grid') {
    return (
      <Card className="overflow-hidden border-0 rounded-xl shadow-sm">
        <div className="aspect-video bg-muted relative">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin opacity-70" />
          </div>
        </div>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <Progress value={loadProgress} className="mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 aspect-video md:aspect-square bg-muted relative">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin opacity-70" />
          </div>
        </div>
        <div className="p-4 flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <Progress value={loadProgress} className="mt-2" />
        </div>
      </div>
    </Card>
  );
};

export default CenterCardSkeleton;
