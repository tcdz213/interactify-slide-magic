
import React from 'react';
import CoursesList from './CoursesList';
import { FilterState } from '@/components/filters/types';
import { useFilteredCourses } from './hooks/useFilteredCourses';

interface CoursesListWithFiltersProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  clearFilters: () => void;
  isLoading?: boolean;
  filters: FilterState;
}

const CoursesListWithFilters: React.FC<CoursesListWithFiltersProps> = ({ 
  viewMode, 
  setViewMode,
  clearFilters,
  isLoading = false,
  filters
}) => {
  // Use the custom hook to get filtered courses
  const { filteredCourses } = useFilteredCourses(filters);

  return (
    <CoursesList 
      viewMode={viewMode}
      filterCategory={filters.category !== 'all' ? filters.category : undefined}
      filterCenterId={undefined}
      isLoading={isLoading}
    />
  );
};

export default CoursesListWithFilters;
