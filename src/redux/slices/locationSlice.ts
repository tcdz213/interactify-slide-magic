
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Country } from '@/contexts/CountryContext';

interface LocationState {
  ip: string | null;
  country: Country | null;
  previousCountry: Country | null;
  lastDetected: string | null; // ISO date string
  isLoading: boolean;
}

const initialState: LocationState = {
  ip: null,
  country: null,
  previousCountry: null,
  lastDetected: null,
  isLoading: false
};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLocationInfo: (state, action: PayloadAction<{ ip: string; country: Country }>) => {
      // Store the previous country before updating
      if (state.country) {
        state.previousCountry = state.country;
      }
      
      state.ip = action.payload.ip;
      state.country = action.payload.country;
      state.lastDetected = new Date().toISOString();
      state.isLoading = false;
    },
    resetLocation: (state) => {
      state.ip = null;
      state.country = null;
      state.lastDetected = null;
      state.isLoading = false;
    },
    // Manual override for country selection
    updateCountry: (state, action: PayloadAction<Country>) => {
      // Store the previous country before updating
      if (state.country) {
        state.previousCountry = state.country;
      }
      
      state.country = action.payload;
      state.lastDetected = new Date().toISOString();
    }
  }
});

export const { setLoading, setLocationInfo, resetLocation, updateCountry } = locationSlice.actions;

export default locationSlice.reducer;
