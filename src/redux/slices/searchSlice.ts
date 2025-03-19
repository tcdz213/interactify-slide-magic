
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Center } from '@/components/centers/types';

export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    category: string;
    location: string;
    rating: string;
    priceRange: [number, number];
    features: string[];
    sort: string;
    searchQuery: string;
  };
  alertsEnabled: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'new_course' | 'alert_match' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedSearchId?: string;
  createdAt: string;
}

interface SearchState {
  recentSearches: string[];
  savedSearches: SavedSearch[];
  notifications: Notification[];
  searchResults: Center[] | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    location: string;
    rating: string;
    priceRange: [number, number];
    features: string[];
    sort: string;
    searchQuery: string;
  };
}

const initialState: SearchState = {
  recentSearches: [],
  savedSearches: [],
  notifications: [],
  searchResults: null,
  loading: false,
  error: null,
  filters: {
    category: 'all',
    location: 'all',
    rating: 'any',
    priceRange: [0, 1000],
    features: [],
    sort: 'featured',
    searchQuery: '',
  },
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      
      // Add to recent searches if not empty and not already in the list
      if (action.payload && !state.recentSearches.includes(action.payload)) {
        state.recentSearches = [action.payload, ...state.recentSearches.slice(0, 4)];
      }
    },
    setSearchResults: (state, action: PayloadAction<Center[] | null>) => {
      state.searchResults = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<SearchState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    saveSearch: (state, action: PayloadAction<{name: string, alertsEnabled: boolean}>) => {
      const { name, alertsEnabled } = action.payload;
      const newSavedSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        filters: { ...state.filters },
        alertsEnabled,
        createdAt: new Date().toISOString(),
      };
      state.savedSearches = [newSavedSearch, ...state.savedSearches];
    },
    updateSavedSearch: (state, action: PayloadAction<{id: string, changes: Partial<SavedSearch>}>) => {
      const { id, changes } = action.payload;
      state.savedSearches = state.savedSearches.map(search => 
        search.id === id ? { ...search, ...changes } : search
      );
    },
    deleteSavedSearch: (state, action: PayloadAction<string>) => {
      state.savedSearches = state.savedSearches.filter(search => search.id !== action.payload);
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'isRead' | 'createdAt'>>) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...action.payload,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications = [newNotification, ...state.notifications];
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map(notification => 
        notification.id === action.payload ? { ...notification, isRead: true } : notification
      );
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    deleteAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setSearchQuery,
  setSearchResults,
  setLoading,
  setError,
  updateFilters,
  clearFilters,
  clearRecentSearches,
  saveSearch,
  updateSavedSearch,
  deleteSavedSearch,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} = searchSlice.actions;

export default searchSlice.reducer;
