import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type ThemeMode = "light" | "dark";

interface ThemeState {
  sidebar: ThemeMode;
  dashboard: ThemeMode;
}

interface ThemeContextValue extends ThemeState {
  setSidebarTheme: (mode: ThemeMode) => void;
  setDashboardTheme: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  toggleDashboard: () => void;
}

const STORAGE_KEY = "jawda-theme";

function loadTheme(): ThemeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { sidebar: "dark", dashboard: "light" };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(loadTheme);

  const persist = useCallback((next: ThemeState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTheme(next);
  }, []);

  // Apply classes to DOM
  useEffect(() => {
    const root = document.documentElement;
    // Dashboard dark mode → .dark on <html>
    if (theme.dashboard === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme.dashboard]);

  const setSidebarTheme = useCallback((mode: ThemeMode) => {
    persist({ ...theme, sidebar: mode });
  }, [theme, persist]);

  const setDashboardTheme = useCallback((mode: ThemeMode) => {
    persist({ ...theme, dashboard: mode });
  }, [theme, persist]);

  const toggleSidebar = useCallback(() => {
    persist({ ...theme, sidebar: theme.sidebar === "dark" ? "light" : "dark" });
  }, [theme, persist]);

  const toggleDashboard = useCallback(() => {
    persist({ ...theme, dashboard: theme.dashboard === "dark" ? "light" : "dark" });
  }, [theme, persist]);

  return (
    <ThemeContext.Provider value={{ ...theme, setSidebarTheme, setDashboardTheme, toggleSidebar, toggleDashboard }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
