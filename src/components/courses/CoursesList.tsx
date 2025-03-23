
import React, { useState, useEffect } from 'react';
import { Grid2X2, List, FilterX } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CourseCard from './CourseCard';
import { coursesData } from './coursesData';

interface CoursesListProps {
  filterCategory?: string;
  filterCenterId?: number;
  isLoading?: boolean;
  viewMode: 'grid' | 'list'; // Add viewMode prop to interface
}

const CoursesList: React.FC<CoursesListProps> = ({ 
  filterCategory,
  filterCenterId,
  isLoading = false,
  viewMode // Accept viewMode as a prop instead of managing it internally
}) => {
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  
  // Filter courses based on props
  useEffect(() => {
    let result = [...coursesData];
    
    if (filterCategory) {
      result = result.filter(course => course.category === filterCategory);
    }
    
    if (filterCenterId) {
      result = result.filter(course => course.centerId === filterCenterId);
    }
    
    setFilteredCourses(result);
  }, [filterCategory, filterCenterId]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Available Courses</h2>
      </div>
      
      {isLoading ? (
        // Show loading skeleton cards
        viewMode === "grid" ? (
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
        )
      ) : filteredCourses.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} viewMode="list" />
            ))}
          </div>
        )
      ) : (
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
      )}
    </>
  );
};

export default CoursesList;
