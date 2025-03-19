
import { useState, useEffect } from 'react';
import { FilterState } from '@/components/filters/types';
import { Center } from './types';
import { centersData } from './centersData';
import { categories } from '@/data/categories';

export const useFilteredCenters = (filters: FilterState) => {
  const [filteredCenters, setFilteredCenters] = useState<Center[]>(centersData);
  
  useEffect(() => {
    applyFilters();
  }, [filters]);
  
  const applyFilters = () => {
    let results = [...centersData];
    
    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(center => 
        center.name.toLowerCase().includes(query) || 
        center.description.toLowerCase().includes(query) ||
        center.category?.toLowerCase().includes(query) ||
        (center.subcategory && center.subcategory.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      // Get the actual category name using the ID
      const categoryObj = categories.find(c => c.id.toString() === filters.category);
      if (categoryObj) {
        results = results.filter(center => 
          center.category === categoryObj.name.en
        );
      }
    }
    
    // Apply subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all' && filters.category && filters.category !== 'all') {
      const categoryObj = categories.find(c => c.id.toString() === filters.category);
      if (categoryObj) {
        const subcategoryObj = categoryObj.subcategories.find(s => s.id.toString() === filters.subcategory);
        if (subcategoryObj) {
          results = results.filter(center => 
            center.subcategory === subcategoryObj.name.en
          );
        }
      }
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
      results = results.filter(center => 
        center.location === locationMap[filters.location]
      );
    }
    
    // Apply rating filter
    if (filters.rating !== 'any') {
      const minRating = parseFloat(filters.rating);
      results = results.filter(center => center.rating >= minRating);
    }
    
    // Apply price range filter (mock implementation - would need actual price data)
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      // Extract numeric price value from string
      results = results.filter(center => {
        if (!center.price) return true;
        const priceValue = parseInt(center.price.replace(/\D/g, ''));
        return priceValue >= filters.priceRange[0] && priceValue <= filters.priceRange[1];
      });
    }
    
    // Apply features filter
    if (filters.features.length > 0) {
      results = results.filter(center => 
        filters.features.every(feature => center.features?.includes(feature))
      );
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'rating_high':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'price_low':
          results.sort((a, b) => {
            const priceA = a.price ? parseInt(a.price.replace(/\D/g, '')) : 0;
            const priceB = b.price ? parseInt(b.price.replace(/\D/g, '')) : 0;
            return priceA - priceB;
          });
          break;
        case 'price_high':
          results.sort((a, b) => {
            const priceA = a.price ? parseInt(a.price.replace(/\D/g, '')) : 0;
            const priceB = b.price ? parseInt(b.price.replace(/\D/g, '')) : 0;
            return priceB - priceA;
          });
          break;
        case 'featured':
        default:
          results.sort((a, b) => {
            if ((a.featured && b.featured) || (!a.featured && !b.featured)) {
              return ((b.rating || 0) - (a.rating || 0));
            }
            return a.featured ? -1 : 1;
          });
      }
    }
    
    setFilteredCenters(results);
  };

  return { filteredCenters, applyFilters };
};
