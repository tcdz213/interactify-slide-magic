import { useState, useMemo } from "react";
import { ShieldCheck, Search, Eye, CheckCircle, XCircle, AlertTriangle, Thermometer, ChevronDown, ChevronUp } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { QCInspection, QCInspectionStatus } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function QualityControlPage() {
  const { t } = useTranslation();
  const { qcInspections, setQCInspections } = useWMSData();
  const { canOperateOn } = useWarehouseScope();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQC, setSelectedQC] = useState<QCInspection | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "vendor" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const STATUS_OPTIONS = [
    { value: "all", label: t("qc.allStatuses") },
    { value: "Pending", label: t("qc.statusPending") },
    { value: "In_Progress", label: t("qc.statusInProgress") },
    { value: "Passed", label: t("qc.statusPassed") },
    { value: "Failed", label: t("qc.statusFailed") },
    { value: "Conditional", label: t("qc.statusConditional") },
    { value: "On_Hold", label: t("qc.statusOnHold") },
  ];

  const filtered = useMemo(() => {
    let list = qcInspections.filter((qc) => {
      if (filterStatus !== "all" && qc.status !== filterStatus) return false;
      if (search && !qc.id.toLowerCase().includes(search.toLowerCase()) && !qc.vendorName.toLowerCase().includes(search.toLowerCase()) && !qc.grnId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortBy === "date") return mult * a.scheduledDate.localeCompare(b.scheduledDate);
      if (sortBy === "vendor") return mult * a.vendorName.localeCompare(b.vendorName);
      return mult * a.status.localeCompare(b.status);
    });
    return list;
  }, [qcInspections, filterStatus, search, sortBy, sortDir]);

  const stats = useMemo(() => ({
    pending: qcInspections.filter(q => q.status === "Pending" || q.status === "In_Progress").length,
    passed: qcInspections.filter(q => q.status === "Passed").length,
    failed: qcInspections.filter(q => q.status === "Failed").length,
    conditional: qcInspections.filter(q => q.status === "Conditional").length,
  }), [qcInspections]);

  const handleComplete = (qc: QCInspection, result: "Passed" | "Failed" | "Conditional") => {
    setQCInspections(prev => prev.map(q =>
      q.id === qc.id ? { ...q, status: result as QCInspectionStatus, overallResult: result, completedDate: new Date().toISOString().slice(0, 10) } : q
    ));
    setSelectedQC(null);
    const label = result === "Passed" ? t("qc.qcValidated") : result === "Failed" ? t("qc.qcRejected") : t("qc.qcConditional");
    toast({ title: label, description: qc.id });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("qc.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("qc.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("qc.pendingInProgress")}</p>
          <p className="text-xl font-semibold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("qc.passed")}</p>
          <p className="text-xl font-semibold text-success">{stats.passed}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("qc.failed")}</p>
          <p className="text-xl font-semibold text-destructive">{stats.failed}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("qc.conditional")}</p>
          <p className="text-xl font-semibold text-warning">{stats.conditional}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("qc.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="date">{t("qc.sortDate")}</option>
          <option value="vendor">{t("qc.sortVendor")}</option>
          <option value="status">{t("qc.sortStatus")}</option>
        </select>
        <button type="button" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="h-9 px-2 rounded-lg border border-input bg-muted/50">
          {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShieldCheck className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("qc.noInspections")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.id")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">GRN</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.vendor")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.warehouse")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("qc.inspector")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.date")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("qc.lines")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.status")}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((qc) => {
                  const failedLines = qc.lines.filter(l => l.result === "Failed").length;
                  const conditionalLines = qc.lines.filter(l => l.result === "Conditional").length;
                  const hasTemp = qc.lines.some(l => l.temperature !== undefined);
                  return (
                    <tr key={qc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedQC(qc)}>
                      <td className="px-4 py-3 font-mono text-xs">{qc.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{qc.grnId}</td>
                      <td className="px-4 py-3">{qc.vendorName}</td>
                      <td className="px-4 py-3 text-xs">{qc.warehouseName}</td>
                      <td className="px-4 py-3">{qc.inspectorName}</td>
                      <td className="px-4 py-3 text-xs">{qc.scheduledDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{qc.lines.length} {t("qc.lines")}</span>
                          {failedLines > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive">{t("qc.failedLines", { count: failedLines })}</span>}
                          {conditionalLines > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning">{t("qc.condLines", { count: conditionalLines })}</span>}
                          {hasTemp && <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={qc.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedQC(qc); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedQC} onOpenChange={() => setSelectedQC(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedQC && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("qc.inspection", { id: selectedQC.id })}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="text-muted-foreground">{t("qc.grn")}</span> <span className="font-mono text-primary">{selectedQC.grnId}</span></div>
                <div><span className="text-muted-foreground">{t("qc.vendorLabel")}</span> {selectedQC.vendorName}</div>
                <div><span className="text-muted-foreground">{t("qc.warehouseLabel")}</span> {selectedQC.warehouseName}</div>
                <div><span className="text-muted-foreground">{t("qc.inspector")}</span> {selectedQC.inspectorName}</div>
                <div><span className="text-muted-foreground">{t("qc.scheduledDate")}</span> {selectedQC.scheduledDate}</div>
                <div><span className="text-muted-foreground">{t("qc.completedDate")}</span> {selectedQC.completedDate ?? "—"}</div>
                <div><span className="text-muted-foreground">{t("qc.statusLabel")}</span> <StatusBadge status={selectedQC.status} /></div>
                {selectedQC.quarantineLocationId && (
                  <div><span className="text-muted-foreground">{t("qc.quarantineZone")}</span> <span className="font-mono text-warning">{selectedQC.quarantineLocationId}</span></div>
                )}
              </div>
              {selectedQC.notes && <p className="text-sm bg-muted/30 rounded-lg p-3 mb-4">{selectedQC.notes}</p>}

              {/* Inspection lines */}
              <h3 className="font-semibold text-sm mb-2">{t("qc.inspectionLines")}</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-2 text-left">{t("qc.productCol")}</th>
                      <th className="px-3 py-2 text-left">{t("qc.lotCol")}</th>
                      <th className="px-3 py-2 text-right">{t("qc.sampleCol")}</th>
                      <th className="px-3 py-2 text-right">{t("qc.okCol")}</th>
                      <th className="px-3 py-2 text-right">{t("qc.rejectedCol")}</th>
                      <th className="px-3 py-2 text-left">{t("qc.tempCol")}</th>
                      <th className="px-3 py-2 text-left">{t("qc.defectCol")}</th>
                      <th className="px-3 py-2 text-left">{t("qc.resultCol")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQC.lines.map((line) => (
                      <tr key={line.lineId} className="border-b border-border/50">
                        <td className="px-3 py-2">{line.productName}</td>
                        <td className="px-3 py-2 font-mono">{line.batchNumber}</td>
                        <td className="px-3 py-2 text-right">{line.sampleSize}</td>
                        <td className="px-3 py-2 text-right text-success font-medium">{line.passedQty}</td>
                        <td className="px-3 py-2 text-right text-destructive font-medium">{line.failedQty}</td>
                        <td className="px-3 py-2">
                          {line.temperature !== undefined ? (
                            <span className={`inline-flex items-center gap-1 ${line.temperatureOk ? "text-success" : "text-destructive"}`}>
                              <Thermometer className="h-3 w-3" />
                              {line.temperature}°C
                              {line.temperatureOk ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {line.defectType ? (
                            <span className="inline-flex items-center gap-1 text-warning">
                              <AlertTriangle className="h-3 w-3" />
                              {line.defectType}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2"><StatusBadge status={line.result} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions for in-progress inspections */}
              {(selectedQC.status === "Pending" || selectedQC.status === "In_Progress") && (
                <div className="flex gap-2 mt-4 justify-end">
                  <Button variant="destructive" size="sm" onClick={() => handleComplete(selectedQC, "Failed")} className="gap-1">
                    <XCircle className="h-4 w-4" /> {t("qc.reject")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleComplete(selectedQC, "Conditional")} className="gap-1 text-warning border-warning/50">
                    <AlertTriangle className="h-4 w-4" /> {t("qc.conditionalBtn")}
                  </Button>
                  <Button size="sm" onClick={() => handleComplete(selectedQC, "Passed")} className="gap-1">
                    <CheckCircle className="h-4 w-4" /> {t("qc.validate")}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
