
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Center } from '@/components/centers/types';

interface WishlistState {
  favorites: number[]; // Array of center IDs
}

const initialState: WishlistState = {
  favorites: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const centerId = action.payload;
      const index = state.favorites.indexOf(centerId);
      
      if (index === -1) {
        // Add to favorites
        state.favorites.push(centerId);
      } else {
        // Remove from favorites
        state.favorites.splice(index, 1);
      }
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = wishlistSlice.actions;

export default wishlistSlice.reducer;
