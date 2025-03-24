
import React from "react";
import { Sun, Moon, Monitor, Contrast } from "lucide-react";

interface ThemeIconProps {
  theme: string;
  systemTheme?: 'light' | 'dark';
  className?: string;
  showSystemIndicator?: boolean;
  size?: number;
}

const ThemeIcon: React.FC<ThemeIconProps> = ({ 
  theme, 
  systemTheme, 
  className = "h-5 w-5",
  showSystemIndicator = false,
  size
}) => {
  const props = { className, size };
  
  if (theme === "light") return <Sun {...props} />;
  if (theme === "dark") return <Moon {...props} />;
  if (theme === "high-contrast") return <Contrast {...props} />;
  
  // System theme with optional indicator
  if (theme === "system" && showSystemIndicator && systemTheme) {
    return systemTheme === "dark" ? <Moon {...props} /> : <Sun {...props} />;
  }
  
  return <Monitor {...props} />;
};

export default ThemeIcon;
