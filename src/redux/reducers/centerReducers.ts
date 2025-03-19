import { CentersState } from '../types/centerSliceTypes';
import { PayloadAction } from '@reduxjs/toolkit';

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
    if (state.filters.searchTerm) {
      const searchLower = state.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(searchLower) || 
        (center.description && center.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (state.filters.category) {
      filtered = filtered.filter(center => center.category === state.filters.category);
    }
    
    // Apply subcategory filter (if category is selected)
    if (state.filters.subcategory && state.filters.category) {
      filtered = filtered.filter(center => center.subcategory === state.filters.subcategory);
    }
    
    // Apply location filter
    if (state.filters.location) {
      filtered = filtered.filter(center => center.location === state.filters.location);
    }
    
    // Apply rating filter
    if (state.filters.rating && state.filters.rating !== 'any') {
      const minRating = parseInt(state.filters.rating);
      filtered = filtered.filter(center => (center.rating || 0) >= minRating);
    }
    
    // Apply price range filter
    if (state.filters.priceRange && (state.filters.priceRange[0] > 0 || state.filters.priceRange[1] < 1000)) {
      filtered = filtered.filter(center => {
        if (!center.price) return false;
        
        // Extract numeric value from price string
        const priceMatch = center.price.match(/\d+/);
        if (!priceMatch) return false;
        
        const price = parseInt(priceMatch[0]);
        return price >= state.filters.priceRange[0] && price <= state.filters.priceRange[1];
      });
    }
    
    // Apply features filter
    if (state.filters.features && state.filters.features.length > 0) {
      filtered = filtered.filter(center => {
        if (!center.features) return false;
        
        // Center must have all selected features
        return state.filters.features.every(feature => 
          center.features?.includes(feature)
        );
      });
    }
    
    // Apply sorting
    if (state.filters.sort) {
      switch (state.filters.sort) {
        case 'featured':
          filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'price_low':
          filtered.sort((a, b) => {
            const aPrice = a.price ? parseInt(a.price.match(/\d+/)?.[0] || '0') : 0;
            const bPrice = b.price ? parseInt(b.price.match(/\d+/)?.[0] || '0') : 0;
            return aPrice - bPrice;
          });
          break;
        case 'price_high':
          filtered.sort((a, b) => {
            const aPrice = a.price ? parseInt(a.price.match(/\d+/)?.[0] || '0') : 0;
            const bPrice = b.price ? parseInt(b.price.match(/\d+/)?.[0] || '0') : 0;
            return bPrice - aPrice;
          });
          break;
        case 'newest':
          // Could add date field in future
          break;
      }
    }
    
    state.filteredItems = filtered;
  },
  
  // Add a new center
  addCenter: (state: CentersState, action: PayloadAction<any>) => {
    const newCenter = {
      id: state.items.length > 0 ? Math.max(...state.items.map(c => c.id)) + 1 : 1,
      name: action.payload.name,
      location: action.payload.location,
      description: action.payload.description || "",
      status: action.payload.status || 'active',
      category: action.payload.category || "General", // Add a default category
      subcategory: action.payload.subcategory || undefined,
      verified: false,
      rating: 0,
      reviews: 0,
      price: '$0',
      currency: 'USD', // Add default currency value
      image: '/placeholder.jpg',
      featured: false,
      features: []
    };
    
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
