/**
 * B9 — Sortable table header with click + indicator.
 */
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "right" | "center";
}

export default function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className,
  align = "left",
}: SortableHeaderProps) {
  const isActive = currentSortKey === sortKey;

  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group",
        align === "right" && "text-right",
        align === "center" && "text-center",
        isActive && "text-foreground",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && currentDirection === "asc" && <ArrowUp className="h-3 w-3" />}
        {isActive && currentDirection === "desc" && <ArrowDown className="h-3 w-3" />}
        {!isActive && <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
      </span>
    </th>
  );
}

/** Hook for sortable state */
export function useSortableTable<T>(data: T[], defaultKey?: string) {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const onSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const mult = sortDir === "asc" ? 1 : -1;
      if (typeof aVal === "number" && typeof bVal === "number") return mult * (aVal - bVal);
      return mult * String(aVal ?? "").localeCompare(String(bVal ?? ""));
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, onSort };
}
