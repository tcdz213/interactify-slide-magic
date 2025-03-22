
import { useState, useEffect } from 'react';
import { FilterState } from '@/components/filters/types';
import { coursesData } from '../coursesData';

export interface Course {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
  price: string;
  featured: boolean;
  description: string;
  centerId: number;
  centerName: string;
  centerLocation: string;
}

export const useFilteredCourses = (filters: FilterState) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(coursesData);
  
  // Filter courses based on filters prop
  useEffect(() => {
    let result = [...coursesData];
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(course => 
        course.name.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
      );
    }
    
    if (filters.category && filters.category !== 'all') {
      result = result.filter(course => {
        // Map category value to actual category names in the data
        const categoryMap: Record<string, string> = {
          'fitness': 'Fitness & Health',
          'programming': 'Programming',
          'language': 'Language Learning',
          'professional': 'Professional Skills',
          'arts': 'Arts & Design',
          'cooking': 'Cooking'
        };
        
        return course.category === categoryMap[filters.category] || course.category.toLowerCase().includes(filters.category.toLowerCase());
      });
    }
    
    // Apply location filter
    if (filters.location !== 'all') {
      const locationMap: Record<string, string> = {
        'san_francisco': 'San Francisco, CA',
        'new_york': 'New York, NY',
        'chicago': 'Chicago, IL',
        'austin': 'Austin, TX', 
        'seattle': 'Seattle, WA',
        'portland': 'Portland, OR'
      };
      result = result.filter(course => 
        course.centerLocation === locationMap[filters.location]
      );
    }
    
    // Apply rating filter
    if (filters.rating !== 'any') {
      const minRating = parseFloat(filters.rating);
      result = result.filter(course => course.rating >= minRating);
    }
    
    // Apply price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      result = result.filter(course => {
        if (!course.price) return true;
        const priceValue = parseInt(course.price.replace(/\D/g, ''));
        return priceValue >= filters.priceRange[0] && priceValue <= filters.priceRange[1];
      });
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'rating_high':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'price_low':
          result.sort((a, b) => {
            const priceA = a.price ? parseInt(a.price.replace(/\D/g, '')) : 0;
            const priceB = b.price ? parseInt(b.price.replace(/\D/g, '')) : 0;
            return priceA - priceB;
          });
          break;
        case 'price_high':
          result.sort((a, b) => {
            const priceA = a.price ? parseInt(a.price.replace(/\D/g, '')) : 0;
            const priceB = b.price ? parseInt(b.price.replace(/\D/g, '')) : 0;
            return priceB - priceA;
          });
          break;
        case 'featured':
        default:
          result.sort((a, b) => {
            if ((a.featured && b.featured) || (!a.featured && !b.featured)) {
              return (b.rating - a.rating);
            }
            return a.featured ? -1 : 1;
          });
      }
    }
    
    setFilteredCourses(result);
  }, [filters]);

  return {
    filteredCourses
  };
};
