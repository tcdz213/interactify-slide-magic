/**
 * Phase 5 — Composable FilterBar with search, select dropdowns, date, and chips.
 */
import { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  /** Search input value */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Extra filter controls (selects, date pickers, etc.) */
  children?: ReactNode;
  /** Active filter count (shows reset button) */
  activeFilterCount?: number;
  onReset?: () => void;
  className?: string;
}

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher…",
  children,
  activeFilterCount = 0,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
      {children}
      {activeFilterCount > 0 && onReset && (
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs text-muted-foreground" onClick={onReset}>
          <X className="h-3.5 w-3.5" />
          Réinitialiser ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}

/** Small select filter chip */
interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({ value, onChange, options, placeholder, className }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/30",
        !value && "text-muted-foreground",
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
