
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
import { applyDefaultsToCenters, applyDefaultsToCenter } from '@/utils/centerDefaults';

// Apply defaults to mock centers once
const mockCentersWithDefaults = applyDefaultsToCenters(mockCenters);

const initialState: CentersState = {
  items: mockCentersWithDefaults,
  filteredItems: mockCentersWithDefaults,
  status: 'idle',
  error: null,
  filters: {
    searchTerm: '',
    category: null,
    subcategory: null,
    location: null,
    rating: 'any',
    priceRange: [0, 1000] as [number, number], // Ensure it's typed as a tuple
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
      // Handle fetchCenters states
      .addCase(fetchCenters.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCenters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const centersWithDefaults = applyDefaultsToCenters(action.payload);
        state.items = centersWithDefaults;
        state.filteredItems = centersWithDefaults;
      })
      .addCase(fetchCenters.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch centers';
      })
      
      // Handle addCenterAsync
      .addCase(addCenterAsync.fulfilled, (state, action) => {
        const centerWithDefaults = applyDefaultsToCenter(action.payload);
        state.items.push(centerWithDefaults);
        state.filteredItems = state.items;
      })
      
      // Handle updateCenterAsync
      .addCase(updateCenterAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload
          };
          
          state.filteredItems = state.items;
        }
      })
      
      // Handle deleteCenterAsync
      .addCase(deleteCenterAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
        state.filteredItems = state.items;
      })
      
      // Handle toggleVerificationAsync
      .addCase(toggleVerificationAsync.fulfilled, (state, action) => {
        const center = state.items.find(c => c.id === action.payload.id);
        if (center) {
          center.verified = action.payload.verified;
          state.filteredItems = state.items;
        }
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
