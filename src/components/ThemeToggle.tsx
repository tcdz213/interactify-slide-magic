
import { Moon, Sun, Monitor, Contrast } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isHighContrast = resolvedTheme === "high-contrast";

  return (
    <div className="flex items-center gap-2">
      {/* Theme Button Group */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-muted">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              variant="outline"
              size="sm"
              pressed={resolvedTheme === "light"}
              onPressedChange={() => setTheme("light")}
              aria-label="Light mode"
              className="focus-ring data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Sun className="h-4 w-4" />
              <span className="sr-only">Light</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Light mode (Alt+Shift+L)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              variant="outline"
              size="sm"
              pressed={resolvedTheme === "dark"}
              onPressedChange={() => setTheme("dark")}
              aria-label="Dark mode"
              className="focus-ring data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Moon className="h-4 w-4" />
              <span className="sr-only">Dark</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Dark mode (Alt+Shift+D)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              variant="outline"
              size="sm"
              pressed={resolvedTheme === "high-contrast"}
              onPressedChange={() => setTheme("high-contrast")}
              aria-label="High contrast mode"
              className="focus-ring data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Contrast className="h-4 w-4" />
              <span className="sr-only">High Contrast</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>High contrast mode (Alt+Shift+H)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              variant="outline"
              size="sm"
              pressed={theme === "system"}
              onPressedChange={() => setTheme("system")}
              aria-label="System preference"
              className="focus-ring data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Monitor className="h-4 w-4" />
              <span className="sr-only">System</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>System preference (Alt+Shift+S)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ThemeToggle;
