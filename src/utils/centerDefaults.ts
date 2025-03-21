
import { Center } from '@/types/center.types';

/**
 * Apply default values to center objects to ensure consistent data structure
 */
export const applyDefaultsToCenter = (center: Partial<Center>): Center => {
  return {
    id: center.id || 0,
    name: center.name || '',
    location: center.location || '',
    status: center.status || 'active',
    verified: center.verified !== undefined ? center.verified : false,
    currency: center.currency || 'USD',
    rating: center.rating !== undefined ? center.rating : 0,
    reviews: center.reviews !== undefined ? center.reviews : 0,
    image: center.image || '',
    price: center.price || '$0',
    featured: center.featured !== undefined ? center.featured : false,
    description: center.description || '',
    features: center.features || [],
    category: center.category || 'General',
    subcategory: center.subcategory,
  };
};

/**
 * Apply default values to an array of centers
 */
export const applyDefaultsToCenters = (centers: Partial<Center>[]): Center[] => {
  return centers.map(center => applyDefaultsToCenter(center));
};
