
import { useState } from 'react';
import { coursesData } from '@/components/courses';

export type CourseFilters = {
  searchTerm: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
};

export const useCourseFilters = (initialFilters: Partial<CourseFilters> = {}) => {
  const [filters, setFilters] = useState<CourseFilters>({
    searchTerm: '',
    ...initialFilters,
  });

  const filterCourses = () => {
    return coursesData.filter(course => {
      // Filter by search term
      if (filters.searchTerm && !course.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !course.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filters.category && course.category !== filters.category) {
        return false;
      }
      
      // Filter by price
      if (filters.priceMin !== undefined) {
        const coursePrice = parseFloat(course.price.replace(/[^0-9.]/g, ''));
        if (coursePrice < filters.priceMin) {
          return false;
        }
      }
      
      if (filters.priceMax !== undefined) {
        const coursePrice = parseFloat(course.price.replace(/[^0-9.]/g, ''));
        if (coursePrice > filters.priceMax) {
          return false;
        }
      }
      
      // Filter by rating
      if (filters.rating !== undefined && course.rating < filters.rating) {
        return false;
      }
      
      return true;
    });
  };

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
    });
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    filterCourses,
  };
};
