
import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setTheme, updateResolvedTheme } from "@/redux/slices/uiPreferencesSlice";

// Define the context type
type ThemeContextType = {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  resolvedTheme: "light" | "dark";
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component that wraps the app
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { theme, resolvedTheme } = useAppSelector(state => state.uiPreferences);
  const isDarkMode = resolvedTheme === "dark";

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        dispatch(updateResolvedTheme(e.matches ? "dark" : "light"));
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, dispatch]);

  // Update theme attribute on document when resolved theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (theme === "system") {
      dispatch(setTheme(resolvedTheme === "dark" ? "light" : "dark"));
    } else {
      dispatch(setTheme(theme === "light" ? "dark" : "light"));
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme: (newTheme) => dispatch(setTheme(newTheme)), 
        toggleTheme, 
        isDarkMode, 
        resolvedTheme 
      }}
    >
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
