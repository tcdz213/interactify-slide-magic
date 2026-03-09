/**
 * Phase 7 — Virtualized DataTable for large datasets (1000+ rows).
 * Uses @tanstack/react-virtual for smooth scrolling performance.
 */
import { ReactNode, useMemo, useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import SortableHeader, { useSortableTable } from "@/components/SortableHeader";
import ColumnToggle, { ColumnDef, useColumnVisibility } from "@/components/ColumnToggle";
import ListEmptyState from "./ListEmptyState";

export interface VirtualColumnDef<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  defaultVisible?: boolean;
  alwaysVisible?: boolean;
  className?: string;
  width?: number;
}

interface VirtualDataTableProps<T> {
  data: T[];
  columns: VirtualColumnDef<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  showColumnToggle?: boolean;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
  /** Height of the scrollable area in px, default 600 */
  height?: number;
  /** Estimated row height in px, default 48 */
  estimateRowHeight?: number;
  /** Overscan count, default 10 */
  overscan?: number;
}

export default function VirtualDataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  showColumnToggle = true,
  toolbar,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  className,
  height = 600,
  estimateRowHeight = 48,
  overscan = 10,
}: VirtualDataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Column visibility
  const colDefs: ColumnDef[] = columns.map((c) => ({
    key: c.key,
    label: c.label,
    defaultVisible: c.defaultVisible,
    alwaysVisible: c.alwaysVisible,
  }));
  const { visible, toggle, isVisible } = useColumnVisibility(colDefs);
  const visibleCols = columns.filter((c) => isVisible(c.key));

  // Sorting
  const { sorted, sortKey, sortDir, onSort } = useSortableTable(data);

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => estimateRowHeight, [estimateRowHeight]),
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      {/* Toolbar */}
      {(toolbar || showColumnToggle) && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 flex-wrap flex-1">{toolbar}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{sorted.length.toLocaleString()} lignes</span>
            {showColumnToggle && (
              <ColumnToggle columns={colDefs} visible={visible} onToggle={toggle} />
            )}
          </div>
        </div>
      )}

      {/* Virtualized Table */}
      {sorted.length === 0 ? (
        <ListEmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {visibleCols.map((col) =>
                  col.sortable !== false ? (
                    <SortableHeader
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      currentSortKey={sortKey}
                      currentDirection={sortDir}
                      onSort={onSort}
                      align={col.align}
                    />
                  ) : (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center"
                      )}
                    >
                      {col.label}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
          </Table>
          <div
            ref={parentRef}
            style={{ height, overflow: "auto" }}
          >
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              <Table>
                <TableBody>
                  {virtualItems.map((virtualRow) => {
                    const row = sorted[virtualRow.index];
                    return (
                      <TableRow
                        key={rowKey(row)}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className={cn(
                          "transition-colors",
                          onRowClick && "cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={() => onRowClick?.(row)}
                      >
                        {visibleCols.map((col) => (
                          <TableCell
                            key={col.key}
                            className={cn(
                              col.align === "right" && "text-right",
                              col.align === "center" && "text-center",
                              col.className
                            )}
                          >
                            {col.render
                              ? col.render(row, virtualRow.index)
                              : String((row as Record<string, unknown>)[col.key] ?? "—")}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
