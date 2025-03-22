
import React from 'react';
import { FilterX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CourseCard from '../CourseCard';
import { Course } from '../hooks/useFilteredCourses';

interface CourseListContentProps {
  courses: Course[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  filterCategory?: string;
  filterCenterId?: number;
}

const CourseListContent: React.FC<CourseListContentProps> = ({
  courses,
  viewMode,
  isLoading,
  filterCategory,
  filterCenterId
}) => {
  if (isLoading) {
    // Show loading skeleton cards
    return viewMode === "grid" ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map((i) => (
          <CourseCard 
            key={i} 
            course={{
              id: i,
              name: "Loading...",
              category: "Loading...",
              rating: 0,
              reviews: 0,
              duration: "Loading...",
              image: "",
              price: "$0",
              featured: false,
              description: "Loading...",
              centerId: 0,
              centerName: "Loading...",
              centerLocation: "Loading..."
            }} 
            viewMode="grid" 
            isLoading={true} 
          />
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        {[1,2,3,4].map((i) => (
          <CourseCard 
            key={i} 
            course={{
              id: i,
              name: "Loading...",
              category: "Loading...",
              rating: 0,
              reviews: 0,
              duration: "Loading...",
              image: "",
              price: "$0",
              featured: false,
              description: "Loading...",
              centerId: 0,
              centerName: "Loading...",
              centerLocation: "Loading..."
            }} 
            viewMode="list" 
            isLoading={true} 
          />
        ))}
      </div>
    );
  }
  
  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium mb-2">No courses found</h3>
        <p className="text-muted-foreground mb-4">Try changing your filters or check back later for new courses.</p>
        {(filterCategory || filterCenterId) && (
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/courses'}
            className="flex items-center gap-2"
          >
            <FilterX className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    );
  }
  
  return viewMode === "grid" ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} viewMode="grid" />
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} viewMode="list" />
      ))}
    </div>
  );
};

export default CourseListContent;
