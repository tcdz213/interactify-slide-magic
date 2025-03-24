
import React, { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import ThemeIcon from "./ThemeIcon";
import ThemeOption from "./ThemeOption";

const ThemeControls = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const systemTheme = useSystemTheme();
  
  // Theme options - memoized to prevent recreating on every render
  const themeOptions = useMemo(() => [
    {
      value: "light",
      label: "Light",
      shortcutKey: "Alt+Shift+L",
    },
    {
      value: "dark",
      label: "Dark",
      shortcutKey: "Alt+Shift+D",
    },
    {
      value: "high-contrast",
      label: "High Contrast",
      shortcutKey: "Alt+Shift+H",
    },
    {
      value: "system",
      label: "System",
      shortcutKey: "Alt+Shift+S",
    },
  ], []);

  // System preference indicator
  const SystemPreferenceIndicator = useMemo(() => {
    if (theme !== "system") return null;
    return (
      <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center">
        <ThemeIcon 
          theme={systemTheme} 
          className="h-3 w-3 text-primary" 
        />
      </span>
    );
  }, [theme, systemTheme]);

  // Find current theme option
  const currentThemeOption = themeOptions.find(option => option.value === theme);

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative focus-ring"
                aria-label={`Current theme: ${theme}. Press to change theme.`}
              >
                {/* Show the current theme icon */}
                <ThemeIcon theme={theme} className="h-5 w-5 transition-all" />
                {/* System preference indicator badge */}
                {SystemPreferenceIndicator}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex flex-col space-y-1">
              <p>Current theme: {currentThemeOption?.label}</p>
              <p className="text-xs text-muted-foreground">{currentThemeOption?.shortcutKey}</p>
            </div>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-52">
          {themeOptions.map((option) => (
            <ThemeOption
              key={option.value}
              value={option.value}
              label={option.label}
              shortcutKey={option.shortcutKey}
              isActive={theme === option.value}
              systemTheme={systemTheme}
              onClick={() => {
                setTheme(option.value as "light" | "dark" | "high-contrast" | "system");
              }}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default ThemeControls;
