
import { Center } from '@/types/center.types';

/**
 * Apply search term filter to centers
 */
export const applySearchFilter = (centers: Center[], searchTerm: string): Center[] => {
  if (!searchTerm) return centers;
  
  const searchLower = searchTerm.toLowerCase();
  return centers.filter(center => 
    center.name.toLowerCase().includes(searchLower) || 
    (center.description && center.description.toLowerCase().includes(searchLower)) ||
    (center.category && center.category.toLowerCase().includes(searchLower)) ||
    (center.subcategory && center.subcategory.toLowerCase().includes(searchLower))
  );
};

/**
 * Apply category filter to centers
 */
export const applyCategoryFilter = (centers: Center[], category: string | null): Center[] => {
  if (!category || category === 'all') return centers;
  
  return centers.filter(center => center.category === category);
};

/**
 * Apply subcategory filter to centers
 */
export const applySubcategoryFilter = (
  centers: Center[], 
  subcategory: string | null, 
  subcategories: string[]
): Center[] => {
  // If neither subcategory nor subcategories array provided, return all centers
  if ((!subcategory || subcategory === 'all') && subcategories.length === 0) {
    return centers;
  }
  
  // If multiple subcategories selected
  if (subcategories.length > 0) {
    return centers.filter(center => 
      center.subcategory && subcategories.includes(center.subcategory)
    );
  }
  
  // If single subcategory selected (legacy support)
  return centers.filter(center => 
    center.subcategory === subcategory
  );
};

/**
 * Apply location filter to centers
 */
export const applyLocationFilter = (centers: Center[], location: string | null): Center[] => {
  if (!location || location === 'all') return centers;
  
  const locationMap: Record<string, string> = {
    'san_francisco': 'San Francisco, CA',
    'new_york': 'New York, NY',
    'chicago': 'Chicago, IL',
    'austin': 'Austin, TX', 
    'seattle': 'Seattle, WA',
    'portland': 'Portland, OR'
  };
  
  return centers.filter(center => 
    center.location === locationMap[location]
  );
};

/**
 * Apply rating filter to centers
 */
export const applyRatingFilter = (centers: Center[], rating: string): Center[] => {
  if (!rating || rating === 'any') return centers;
  
  const minRating = parseFloat(rating);
  return centers.filter(center => (center.rating || 0) >= minRating);
};

/**
 * Apply price range filter to centers
 */
export const applyPriceRangeFilter = (centers: Center[], priceRange: [number, number]): Center[] => {
  if (!priceRange || (priceRange[0] <= 0 && priceRange[1] >= 1000)) return centers;
  
  return centers.filter(center => {
    if (!center.price) return false;
    
    // Extract numeric value from price string
    const priceMatch = center.price.match(/\d+/);
    if (!priceMatch) return false;
    
    const price = parseInt(priceMatch[0]);
    return price >= priceRange[0] && price <= priceRange[1];
  });
};

/**
 * Apply features filter to centers
 */
export const applyFeaturesFilter = (centers: Center[], features: string[]): Center[] => {
  if (!features || features.length === 0) return centers;
  
  return centers.filter(center => {
    if (!center.features) return false;
    
    // Center must have all selected features
    return features.every(feature => 
      center.features?.includes(feature)
    );
  });
};

/**
 * Sort centers based on sort criteria
 */
export const sortCenters = (centers: Center[], sortBy: string): Center[] => {
  if (!sortBy) return centers;
  
  const sortedCenters = [...centers];
  
  switch (sortBy) {
    case 'featured':
      sortedCenters.sort((a, b) => {
        if ((a.featured && b.featured) || (!a.featured && !b.featured)) {
          return ((b.rating || 0) - (a.rating || 0));
        }
        return a.featured ? -1 : 1;
      });
      break;
    case 'rating':
    case 'rating_high':
      sortedCenters.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'price_low':
      sortedCenters.sort((a, b) => {
        const aPrice = a.price ? parseInt(a.price.match(/\d+/)?.[0] || '0') : 0;
        const bPrice = b.price ? parseInt(b.price.match(/\d+/)?.[0] || '0') : 0;
        return aPrice - bPrice;
      });
      break;
    case 'price_high':
      sortedCenters.sort((a, b) => {
        const aPrice = a.price ? parseInt(a.price.match(/\d+/)?.[0] || '0') : 0;
        const bPrice = b.price ? parseInt(b.price.match(/\d+/)?.[0] || '0') : 0;
        return bPrice - aPrice;
      });
      break;
  }
  
  return sortedCenters;
};
