
// Theme type definitions
export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'system';
export type ResolvedTheme = 'light' | 'dark' | 'high-contrast';

// Function to get system theme preference
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Function to get initial theme from localStorage
export const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const savedTheme = localStorage.getItem('theme') as ThemeMode;
  return savedTheme || 'system';
};

// Function to resolve theme based on system preference
export const resolveTheme = (theme: ThemeMode, systemTheme: 'light' | 'dark'): ResolvedTheme => {
  if (theme === 'system') {
    return systemTheme;
  }
  return theme as ResolvedTheme;
};

// Apply theme class to document root
export const applyThemeClass = (theme: ResolvedTheme): void => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove('light', 'dark', 'high-contrast');
  
  // Add the appropriate class
  root.classList.add(theme);
};

// Save theme to localStorage
export const saveTheme = (theme: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
};

// Map theme to Sonner toast theme (which only supports light/dark/system)
export const mapToSonnerTheme = (theme: ThemeMode, resolvedTheme: ResolvedTheme): 'light' | 'dark' | 'system' => {
  if (resolvedTheme === 'high-contrast') return 'dark';
  return theme === 'system' ? 'system' : resolvedTheme as 'light' | 'dark';
};

// Get the next theme in rotation
export const getNextTheme = (currentTheme: ThemeMode, currentResolvedTheme: ResolvedTheme): ThemeMode => {
  if (currentTheme === 'system') {
    return currentResolvedTheme === 'dark' ? 'light' : 'dark';
  } else if (currentTheme === 'high-contrast') {
    return 'light';
  } else {
    return currentTheme === 'light' ? 'dark' : 'high-contrast';
  }
};
