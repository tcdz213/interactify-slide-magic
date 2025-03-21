
import { CentersState } from '../types/centerSliceTypes';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  applySearchFilter,
  applyCategoryFilter,
  applySubcategoryFilter,
  applyLocationFilter,
  applyRatingFilter,
  applyPriceRangeFilter,
  applyFeaturesFilter,
  sortCenters
} from '@/utils/centerFilters';
import { applyDefaultsToCenter } from '@/utils/centerDefaults';

export const centerReducers = {
  // Filter centers based on provided filters
  filterCenters: (state: CentersState, action: PayloadAction<{ filters: Partial<CentersState['filters']> }>) => {
    // Update filters with new values
    state.filters = {
      ...state.filters,
      ...action.payload.filters
    };
    
    // Start with all items
    let filtered = [...state.items];
    
    // Apply search term filter
    filtered = applySearchFilter(filtered, state.filters.searchTerm);
    
    // Apply category filter
    filtered = applyCategoryFilter(filtered, state.filters.category);
    
    // Apply subcategory filter
    filtered = applySubcategoryFilter(
      filtered, 
      state.filters.subcategory, 
      state.filters.features || []
    );
    
    // Apply location filter
    filtered = applyLocationFilter(filtered, state.filters.location);
    
    // Apply rating filter
    filtered = applyRatingFilter(filtered, state.filters.rating);
    
    // Apply price range filter - ensure it's a tuple of [number, number]
    const priceRange: [number, number] = state.filters.priceRange.length === 2 
      ? [state.filters.priceRange[0], state.filters.priceRange[1]]
      : [0, 1000]; // Default if not properly formatted
    
    filtered = applyPriceRangeFilter(filtered, priceRange);
    
    // Apply features filter
    filtered = applyFeaturesFilter(filtered, state.filters.features);
    
    // Apply sorting
    filtered = sortCenters(filtered, state.filters.sort);
    
    state.filteredItems = filtered;
  },
  
  // Add a new center
  addCenter: (state: CentersState, action: PayloadAction<any>) => {
    const newCenterId = state.items.length > 0 ? Math.max(...state.items.map(c => c.id)) + 1 : 1;
    
    const newCenter = applyDefaultsToCenter({
      id: newCenterId,
      name: action.payload.name,
      location: action.payload.location,
      description: action.payload.description,
      status: action.payload.status,
      category: action.payload.category,
      subcategory: action.payload.subcategory,
    });
    
    state.items.push(newCenter);
    state.filteredItems = state.items;
  },
  
  // Update an existing center
  updateCenter: (state: CentersState, action: PayloadAction<{ id: number, formData: any }>) => {
    const { id, formData } = action.payload;
    const index = state.items.findIndex(c => c.id === id);
    
    if (index !== -1) {
      // Keep existing properties and update with formData
      state.items[index] = {
        ...state.items[index],
        name: formData.name,
        location: formData.location,
        description: formData.description || state.items[index].description,
        status: formData.status || state.items[index].status,
        category: formData.category || state.items[index].category,
        subcategory: formData.subcategory
      };
      
      state.filteredItems = state.items;
    }
  },
  
  // Delete a center
  deleteCenter: (state: CentersState, action: PayloadAction<number>) => {
    state.items = state.items.filter(c => c.id !== action.payload);
    state.filteredItems = state.items;
  },
  
  // Toggle center verification status
  toggleVerification: (state: CentersState, action: PayloadAction<number>) => {
    const center = state.items.find(c => c.id === action.payload);
    
    if (center) {
      center.verified = !center.verified;
      state.filteredItems = state.items;
    }
  }
};
