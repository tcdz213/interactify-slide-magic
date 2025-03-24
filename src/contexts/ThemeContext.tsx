
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setTheme as setReduxTheme, updateResolvedTheme } from "@/redux/slices/uiPreferencesSlice";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import { 
  ThemeMode, 
  ResolvedTheme, 
  applyThemeClass, 
  saveTheme, 
  resolveTheme, 
  getNextTheme 
} from "@/lib/theme-utils";

// Define the context type with stronger typing
type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  isHighContrastMode: boolean;
  resolvedTheme: ResolvedTheme;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component that wraps the app
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { theme: reduxTheme, resolvedTheme: reduxResolvedTheme } = useAppSelector(state => state.uiPreferences);
  const systemTheme = useSystemTheme();
  
  // Derive these values from Redux state
  const isDarkMode = reduxResolvedTheme === "dark" || reduxResolvedTheme === "high-contrast";
  const isHighContrastMode = reduxResolvedTheme === "high-contrast";

  // Listen for system preference changes
  useEffect(() => {
    if (reduxTheme === "system") {
      dispatch(updateResolvedTheme(systemTheme));
    }
  }, [systemTheme, reduxTheme, dispatch]);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Shift + L: Light theme
      if (e.altKey && e.shiftKey && e.key === 'L') {
        dispatch(setReduxTheme('light'));
      }
      // Alt + Shift + D: Dark theme
      else if (e.altKey && e.shiftKey && e.key === 'D') {
        dispatch(setReduxTheme('dark'));
      }
      // Alt + Shift + H: High contrast theme
      else if (e.altKey && e.shiftKey && e.key === 'H') {
        dispatch(setReduxTheme('high-contrast'));
      }
      // Alt + Shift + S: System theme
      else if (e.altKey && e.shiftKey && e.key === 'S') {
        dispatch(setReduxTheme('system'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  // Update theme attribute on document when resolved theme changes
  useEffect(() => {
    applyThemeClass(reduxResolvedTheme);
  }, [reduxResolvedTheme]);

  // Toggle between light and dark mode - memoized to prevent unnecessary re-renders
  const toggleTheme = useMemo(() => {
    return () => {
      const nextTheme = getNextTheme(reduxTheme, reduxResolvedTheme);
      dispatch(setReduxTheme(nextTheme));
    };
  }, [reduxTheme, reduxResolvedTheme, dispatch]);

  // Wrapper for setting theme that handles both Redux and local state
  const setTheme = (newTheme: ThemeMode) => {
    dispatch(setReduxTheme(newTheme));
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme: reduxTheme as ThemeMode, 
    setTheme, 
    toggleTheme, 
    isDarkMode,
    isHighContrastMode,
    resolvedTheme: reduxResolvedTheme as ResolvedTheme
  }), [reduxTheme, setTheme, toggleTheme, isDarkMode, isHighContrastMode, reduxResolvedTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to access the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
