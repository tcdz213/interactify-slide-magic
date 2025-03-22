
import React from 'react';
import { Card } from "@/components/ui/card";

interface CourseSkeletonProps {
  viewMode: 'grid' | 'list';
}

const CourseSkeleton: React.FC<CourseSkeletonProps> = ({ viewMode }) => {
  return (
    <Card className="overflow-hidden border-0 rounded-xl shadow-sm">
      {viewMode === 'grid' ? (
        <div className="animate-pulse">
          <div className="h-48 bg-muted"></div>
          <div className="p-4">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-muted rounded w-full mb-3"></div>
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-9 bg-muted rounded"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row animate-pulse">
          <div className="md:w-1/3 h-48 md:h-auto bg-muted"></div>
          <div className="p-5 md:w-2/3">
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-9 bg-muted rounded w-1/3"></div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CourseSkeleton;
