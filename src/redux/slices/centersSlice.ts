
import { createSlice } from '@reduxjs/toolkit';
import { CentersState } from '../types/centerSliceTypes';
import { mockCenters } from '../data/mockCenters';
import { centerReducers } from '../reducers/centerReducers';
import { 
  fetchCenters,
  addCenterAsync,
  updateCenterAsync,
  deleteCenterAsync,
  toggleVerificationAsync
} from '../thunks/centerThunks';
import { Center } from '@/types/center.types';

const mockCentersWithCurrency = mockCenters.map((center): Center => ({
  ...center,
  currency: center.currency || 'USD',
  rating: center.rating || 0,
  reviews: center.reviews || 0,
  image: center.image || '',
  price: center.price || '$0',
  featured: center.featured || false,
  description: center.description || '',
  features: center.features || [],
  category: center.category || 'General',
  status: center.status || 'active',
  verified: center.verified !== undefined ? center.verified : false
}));

const initialState: CentersState = {
  items: mockCentersWithCurrency,
  filteredItems: mockCentersWithCurrency,
  status: 'idle',
  error: null,
  filters: {
    searchTerm: '',
    category: null,
    subcategory: null,
    location: null,
    rating: 'any',
    priceRange: [0, 1000],
    features: [],
    currency: 'USD',
    sort: 'featured'
  }
};

const centersSlice = createSlice({
  name: 'centers',
  initialState,
  reducers: {
    ...centerReducers,
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredItems = state.items;
    },
    setCurrency: (state, action) => {
      state.filters.currency = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCenters.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCenters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const centersWithCurrency = action.payload.map((center): Center => ({
          ...center,
          currency: center.currency || 'USD',
          rating: center.rating || 0,
          reviews: center.reviews || 0,
          image: center.image || '',
          price: center.price || '$0',
          featured: center.featured || false,
          description: center.description || '',
          features: center.features || [],
          category: center.category || 'General',
          status: center.status || 'active',
          verified: center.verified !== undefined ? center.verified : false
        }));
        state.items = centersWithCurrency;
        state.filteredItems = centersWithCurrency;
      })
      .addCase(fetchCenters.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch centers';
      })
      
      .addCase(addCenterAsync.fulfilled, (state, action) => {
        const payload = action.payload as Partial<Center> & { id: number; name: string; location: string; };
        
        const centerWithDefaults: Center = {
          id: payload.id,
          name: payload.name,
          location: payload.location,
          status: payload.status || 'active',
          verified: payload.verified !== undefined ? payload.verified : false,
          currency: payload.currency || 'USD',
          rating: payload.rating || 0,
          reviews: payload.reviews || 0,
          image: payload.image || '',
          price: payload.price || '$0',
          featured: payload.featured || false,
          description: payload.description || '',
          features: payload.features || [],
          category: payload.category || 'General',
        };
        
        state.items.push(centerWithDefaults);
        state.filteredItems = state.items;
      })
      
      .addCase(updateCenterAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          const payload = action.payload as Partial<Center> & { id: number };
          
          state.items[index] = {
            ...state.items[index],
            name: payload.name || state.items[index].name,
            location: payload.location || state.items[index].location,
            status: payload.status || state.items[index].status,
            verified: payload.verified !== undefined ? payload.verified : state.items[index].verified,
            currency: payload.currency || state.items[index].currency,
            category: payload.category || state.items[index].category,
            rating: payload.rating || state.items[index].rating,
            reviews: payload.reviews || state.items[index].reviews,
            image: payload.image || state.items[index].image,
            price: payload.price || state.items[index].price,
            featured: payload.featured !== undefined ? payload.featured : state.items[index].featured,
            description: payload.description || state.items[index].description,
            features: payload.features || state.items[index].features
          };
          
          state.filteredItems = state.items;
        }
      })
      
      .addCase(deleteCenterAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
        state.filteredItems = state.items;
      })
      
      .addCase(toggleVerificationAsync.fulfilled, (state, action) => {
        const center = state.items.find(c => c.id === action.payload.id);
        if (center) {
          center.verified = action.payload.verified;
        }
        state.filteredItems = state.items;
      });
  }
});

export const { 
  filterCenters, 
  addCenter, 
  updateCenter, 
  deleteCenter, 
  toggleVerification,
  resetFilters,
  setCurrency
} = centersSlice.actions;

export {
  fetchCenters,
  addCenterAsync,
  updateCenterAsync,
  deleteCenterAsync,
  toggleVerificationAsync
};

export default centersSlice.reducer;
