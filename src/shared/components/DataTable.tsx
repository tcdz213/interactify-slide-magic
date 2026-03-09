/**
 * Phase F — Enterprise DataTable with density, sticky header, checkbox selection,
 * bulk actions, sorting, pagination, column toggle, and empty state.
 */
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableDensity } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import SortableHeader, { useSortableTable, SortDirection } from "@/components/SortableHeader";
import DataTablePagination from "@/components/DataTablePagination";
import ColumnToggle, { ColumnDef, useColumnVisibility } from "@/components/ColumnToggle";
import ListEmptyState from "./ListEmptyState";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  defaultVisible?: boolean;
  alwaysVisible?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSizes?: number[];
  defaultPageSize?: number;
  showColumnToggle?: boolean;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
  noPagination?: boolean;
  /** Table density: compact (36px), default (44px), comfortable (52px) */
  density?: TableDensity;
  /** Sticky table header */
  stickyHeader?: boolean;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Bulk actions bar rendered when rows are selected */
  bulkActions?: (selectedKeys: string[], clearSelection: () => void) => ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  pageSizes = [10, 20, 50],
  defaultPageSize = 10,
  showColumnToggle = true,
  toolbar,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  className,
  noPagination = false,
  density = "default",
  stickyHeader = false,
  selectable = false,
  bulkActions,
}: DataTableProps<T>) {
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

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);

  const pagedData = noPagination
    ? sorted
    : sorted.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Selection (Phase F3)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const allPageKeys = useMemo(() => pagedData.map((row) => rowKey(row)), [pagedData, rowKey]);
  const allSelected = allPageKeys.length > 0 && allPageKeys.every((k) => selectedKeys.has(k));
  const someSelected = allPageKeys.some((k) => selectedKeys.has(k));

  const toggleRow = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        allPageKeys.forEach((k) => next.delete(k));
        return next;
      }
      return new Set([...prev, ...allPageKeys]);
    });
  }, [allSelected, allPageKeys]);

  const clearSelection = useCallback(() => setSelectedKeys(new Set()), []);

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      {/* Toolbar */}
      {(toolbar || showColumnToggle) && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 flex-wrap flex-1">{toolbar}</div>
          {showColumnToggle && (
            <ColumnToggle columns={colDefs} visible={visible} onToggle={toggle} />
          )}
        </div>
      )}

      {/* Bulk action bar (Phase F3) */}
      {selectable && selectedKeys.size > 0 && bulkActions && (
        <div className="table-bulk-bar">
          <span className="text-xs font-semibold">
            {selectedKeys.size} sélectionné{selectedKeys.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2 ms-auto">
            {bulkActions(Array.from(selectedKeys), clearSelection)}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table density={density} stickyHeader={stickyHeader}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className={cn(!allSelected && someSelected && "data-[state=unchecked]:bg-primary/20")}
                  />
                </TableHead>
              )}
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
          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleCols.length + (selectable ? 1 : 0)}>
                  <ListEmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((row, i) => {
                const key = rowKey(row);
                const isSelected = selectedKeys.has(key);
                return (
                  <TableRow
                    key={key}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(key)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select row ${key}`}
                        />
                      </TableCell>
                    )}
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
                          ? col.render(row, i)
                          : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (Phase F8) */}
      {!noPagination && sorted.length > 0 && (
        <DataTablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalItems={sorted.length}
        />
      )}
    </div>
  );
}
