
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Center } from '@/components/centers/types';

interface WishlistState {
  favorites: number[]; // Array of center IDs
  courseFavorites: number[]; // Array of course IDs
}

const initialState: WishlistState = {
  favorites: [],
  courseFavorites: [],
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
    toggleCourseFavorite: (state, action: PayloadAction<number>) => {
      const courseId = action.payload;
      const index = state.courseFavorites.indexOf(courseId);
      
      if (index === -1) {
        // Add to course favorites
        state.courseFavorites.push(courseId);
      } else {
        // Remove from course favorites
        state.courseFavorites.splice(index, 1);
      }
    },
    clearCourseFavorites: (state) => {
      state.courseFavorites = [];
    },
  },
});

export const { toggleFavorite, clearFavorites, toggleCourseFavorite, clearCourseFavorites } = wishlistSlice.actions;

export default wishlistSlice.reducer;
