
import React from "react";
import { Check } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import ThemeIcon from "./ThemeIcon";
import ThemePreview from "./ThemePreview";

interface ThemeOptionProps {
  value: string;
  label: string;
  isActive: boolean;
  shortcutKey: string;
  systemTheme?: 'light' | 'dark';
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  value,
  label,
  isActive,
  shortcutKey,
  systemTheme,
  onClick
}) => {
  const isSystem = value === "system";
  
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <DropdownMenuItem
          onClick={onClick}
          className="gap-2 cursor-pointer focus-ring"
        >
          <ThemeIcon theme={value} className="h-4 w-4" />
          <span>{label}</span>
          
          {isActive && <Check className="h-4 w-4 ml-auto" />}
          
          {/* System preference result indicator */}
          {isSystem && (
            <span className="ml-auto flex h-4 w-4 items-center justify-center text-xs">
              <ThemeIcon 
                theme={systemTheme || "light"} 
                className="h-3 w-3" 
              />
            </span>
          )}
          
          {/* Display the shortcut as text */}
          {shortcutKey && !isActive && !isSystem && (
            <span className="ml-auto text-xs text-muted-foreground">
              {shortcutKey}
            </span>
          )}
        </DropdownMenuItem>
      </HoverCardTrigger>
      
      <HoverCardContent 
        side="left" 
        className={cn(
          "w-64 p-2", 
          value === "dark" ? "dark" : "",
          value === "high-contrast" ? "high-contrast" : ""
        )}
      >
        <ThemePreview 
          themeValue={value} 
          systemTheme={systemTheme}
        />
        
        <div className="mt-2 text-xs space-y-1">
          <div className="font-medium text-center">
            {isSystem ? (
              <>System preference: {systemTheme === "dark" ? "Dark" : "Light"}</>
            ) : (
              <>{label} Mode</>
            )}
          </div>
          <div className="text-center text-muted-foreground">
            Shortcut: <kbd className="px-1 bg-muted rounded">{shortcutKey}</kbd>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ThemeOption;
