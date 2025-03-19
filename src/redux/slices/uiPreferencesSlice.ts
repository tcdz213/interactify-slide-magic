
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fr' | 'ar';

interface UIPreferencesState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  language: Language;
  navigationStyle: 'sidebar' | 'topbar';
}

// Get initial values from localStorage if available
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme;
  return savedTheme || 'system';
};

const getInitialLanguage = (): Language => {
  const savedLanguage = localStorage.getItem('i18nextLng') as Language;
  return savedLanguage || 'en';
};

const getInitialNavigationStyle = (): 'sidebar' | 'topbar' => {
  const savedStyle = localStorage.getItem('navigationStyle') as 'sidebar' | 'topbar';
  return savedStyle || 'topbar';
};

// Detect system preference
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: UIPreferencesState = {
  theme: getInitialTheme(),
  resolvedTheme: getInitialTheme() === 'system' ? getSystemTheme() : getInitialTheme() as 'light' | 'dark',
  language: getInitialLanguage(),
  navigationStyle: getInitialNavigationStyle(),
};

export const uiPreferencesSlice = createSlice({
  name: 'uiPreferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Update resolved theme based on system preference if needed
      if (action.payload === 'system') {
        state.resolvedTheme = getSystemTheme();
      } else {
        state.resolvedTheme = action.payload as 'light' | 'dark';
      }
      // Save to localStorage
      localStorage.setItem('theme', action.payload);
    },
    updateResolvedTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.resolvedTheme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      // We don't need to save to localStorage as i18next does this for us
    },
    setNavigationStyle: (state, action: PayloadAction<'sidebar' | 'topbar'>) => {
      state.navigationStyle = action.payload;
      localStorage.setItem('navigationStyle', action.payload);
    },
  },
});

export const { 
  setTheme, 
  updateResolvedTheme, 
  setLanguage,
  setNavigationStyle
} = uiPreferencesSlice.actions;

export default uiPreferencesSlice.reducer;
