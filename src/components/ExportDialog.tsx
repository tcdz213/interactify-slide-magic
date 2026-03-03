import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileSpreadsheet, FileText, Calendar, Columns3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { exportToCSV, exportToExcel, type ExportColumn } from "@/lib/exportUtils";
import { exportToPDF } from "@/lib/pdfExport";

interface ExportDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  /** Optional: key in T that holds a date string for date-range filtering */
  dateKey?: keyof T;
  /** Optional: key in T that holds a status string for status filtering */
  statusKey?: keyof T;
  /** Available status values */
  statusOptions?: string[];
}

export default function ExportDialog<T>({
  open,
  onOpenChange,
  data,
  columns,
  filename,
  dateKey,
  statusKey,
  statusOptions = [],
}: ExportDialogProps<T>) {
  const { t } = useTranslation();

  // State
  const [format, setFormat] = useState<"excel" | "csv" | "pdf">("excel");
  const [selectedCols, setSelectedCols] = useState<Set<keyof T>>(
    () => new Set(columns.map((c) => c.key))
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    () => new Set(statusOptions)
  );

  // Reset on open
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setSelectedCols(new Set(columns.map((c) => c.key)));
      setDateFrom("");
      setDateTo("");
      setSelectedStatuses(new Set(statusOptions));
      setFormat("excel");
    }
    onOpenChange(v);
  };

  // Toggle column
  const toggleCol = (key: keyof T) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllCols = () => {
    if (selectedCols.size === columns.length) {
      // Keep at least first
      setSelectedCols(new Set([columns[0].key]));
    } else {
      setSelectedCols(new Set(columns.map((c) => c.key)));
    }
  };

  const toggleStatus = (s: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Date filter
    if (dateKey && (dateFrom || dateTo)) {
      result = result.filter((row) => {
        const val = row[dateKey];
        if (!val) return false;
        const d = String(val);
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      });
    }

    // Status filter
    if (statusKey && selectedStatuses.size < statusOptions.length) {
      result = result.filter((row) => {
        const val = String(row[statusKey] ?? "");
        return selectedStatuses.has(val);
      });
    }

    return result;
  }, [data, dateKey, dateFrom, dateTo, statusKey, selectedStatuses, statusOptions]);

  // Selected columns
  const activeCols = columns.filter((c) => selectedCols.has(c.key));

  const handleExport = () => {
    if (filteredData.length === 0) return;
    if (format === "excel") {
      exportToExcel(filteredData, activeCols, filename);
    } else if (format === "pdf") {
      exportToPDF(filteredData, activeCols, filename, filename);
    } else {
      exportToCSV(filteredData, activeCols, filename);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="dialog-icon-primary">
              <Download className="h-4 w-4" />
            </div>
            {t("export.title", "Export Data")}
          </DialogTitle>
          <DialogDescription>
            {t("export.description", "Configure your export parameters")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Format selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              {t("export.format", "Format")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat("excel")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  format === "excel"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel (.xls)
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  format === "csv"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <FileText className="h-4 w-4" />
                CSV (.csv)
              </button>
              <button
                onClick={() => setFormat("pdf")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  format === "pdf"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <FileText className="h-4 w-4" />
                PDF (.pdf)
              </button>
            </div>
          </div>

          {/* Column selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Columns3 className="h-3.5 w-3.5" />
                {t("export.columns", "Columns")} ({activeCols.length}/{columns.length})
              </label>
              <button
                onClick={toggleAllCols}
                className="text-xs text-primary hover:underline font-medium"
              >
                {selectedCols.size === columns.length
                  ? t("export.deselectAll", "Deselect all")
                  : t("export.selectAll", "Select all")}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto rounded-lg border border-border/50 bg-muted/20 p-2.5">
              {columns.map((col) => (
                <label
                  key={String(col.key)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedCols.has(col.key)}
                    onCheckedChange={() => toggleCol(col.key)}
                  />
                  <span className="truncate">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date range (only if dateKey provided) */}
          {dateKey && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {t("export.dateRange", "Date Range")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={t("common.from")}
                />
                <span className="text-muted-foreground text-xs">→</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={t("common.to")}
                />
              </div>
            </div>
          )}

          {/* Status filter (only if statusKey provided) */}
          {statusKey && statusOptions.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                {t("common.status")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      selectedStatuses.has(s)
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview count */}
          <div className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredData.length}</span>{" "}
            {t("export.rowsToExport", "rows will be exported")} · {activeCols.length}{" "}
            {t("export.columns", "columns")}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} disabled={filteredData.length === 0} className="gap-2">
            <Download className="h-4 w-4" />
            {t("common.export")} {format === "excel" ? "Excel" : format === "pdf" ? "PDF" : "CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
