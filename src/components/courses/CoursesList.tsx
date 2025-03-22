
import React, { useState, useEffect } from 'react';
import { useFilteredCourses, Course } from './hooks/useFilteredCourses';
import CourseListContent from './components/CourseListContent';

interface CoursesListProps {
  filterCategory?: string;
  filterCenterId?: number;
  isLoading?: boolean;
  viewMode: 'grid' | 'list';
}

const CoursesList: React.FC<CoursesListProps> = ({ 
  filterCategory,
  filterCenterId,
  isLoading = false,
  viewMode
}) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const { filteredCourses: allCourses } = useFilteredCourses({
    searchQuery: "",
    category: filterCategory || "all",
    subcategory: null,
    subcategories: [],
    location: "all",
    rating: "any",
    priceRange: [0, 1000],
    sort: "featured",
    features: [],
  });
  
  // Filter courses based on props
  useEffect(() => {
    let result = [...allCourses];
    
    if (filterCenterId) {
      result = result.filter(course => course.centerId === filterCenterId);
    }
    
    setFilteredCourses(result);
  }, [filterCategory, filterCenterId, allCourses]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Available Courses</h2>
      </div>
      
      <CourseListContent
        courses={filteredCourses}
        viewMode={viewMode}
        isLoading={isLoading}
        filterCategory={filterCategory}
        filterCenterId={filterCenterId}
      />
    </>
  );
};

export default CoursesList;
