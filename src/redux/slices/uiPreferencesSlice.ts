
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getInitialTheme, getSystemTheme, resolveTheme, saveTheme, ThemeMode, ResolvedTheme } from '@/lib/theme-utils';

export type Language = 'en' | 'fr' | 'ar';

interface UIPreferencesState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  language: Language;
  navigationStyle: 'sidebar' | 'topbar';
}

// Get initial values from localStorage if available
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const savedLanguage = localStorage.getItem('i18nextLng') as Language;
  return savedLanguage || 'en';
};

const getInitialNavigationStyle = (): 'sidebar' | 'topbar' => {
  if (typeof window === 'undefined') return 'topbar';
  const savedStyle = localStorage.getItem('navigationStyle') as 'sidebar' | 'topbar';
  return savedStyle || 'topbar';
};

const initialState: UIPreferencesState = {
  theme: getInitialTheme(),
  resolvedTheme: (() => {
    const theme = getInitialTheme();
    return resolveTheme(theme, getSystemTheme());
  })(),
  language: getInitialLanguage(),
  navigationStyle: getInitialNavigationStyle(),
};

export const uiPreferencesSlice = createSlice({
  name: 'uiPreferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      // Update resolved theme based on system preference if needed
      if (action.payload === 'system') {
        state.resolvedTheme = getSystemTheme() as ResolvedTheme;
      } else {
        state.resolvedTheme = action.payload as ResolvedTheme;
      }
      // Save to localStorage
      saveTheme(action.payload);
    },
    updateResolvedTheme: (state, action: PayloadAction<ResolvedTheme>) => {
      state.resolvedTheme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      // We don't need to save to localStorage as i18next does this for us
    },
    setNavigationStyle: (state, action: PayloadAction<'sidebar' | 'topbar'>) => {
      state.navigationStyle = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('navigationStyle', action.payload);
      }
    },
  },
});

export const { 
  setTheme, 
  updateResolvedTheme, 
  setLanguage,
  setNavigationStyle
} = uiPreferencesSlice.actions;

export { type ThemeMode, type ResolvedTheme };
export default uiPreferencesSlice.reducer;
