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

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous les statuts" },
  { value: "Pending", label: "En attente" },
  { value: "In_Progress", label: "En cours" },
  { value: "Passed", label: "Conforme" },
  { value: "Failed", label: "Non conforme" },
  { value: "Conditional", label: "Conditionnel" },
  { value: "On_Hold", label: "En suspens" },
];

const STATUS_STYLE: Record<QCInspectionStatus, string> = {
  Pending: "warning",
  In_Progress: "info",
  Passed: "success",
  Failed: "destructive",
  Conditional: "warning",
  On_Hold: "secondary",
};

export default function QualityControlPage() {
  const { qcInspections, setQCInspections } = useWMSData();
  const { canOperateOn } = useWarehouseScope();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQC, setSelectedQC] = useState<QCInspection | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "vendor" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
    toast({ title: `QC ${result === "Passed" ? "validé" : result === "Failed" ? "rejeté" : "conditionnel"}`, description: qc.id });
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
            <h1 className="text-xl font-bold tracking-tight">Contrôle Qualité (QC)</h1>
            <p className="text-sm text-muted-foreground">Inspections, quarantaine et rapports qualité</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En attente / En cours</p>
          <p className="text-xl font-semibold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Conformes</p>
          <p className="text-xl font-semibold text-success">{stats.passed}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Non conformes</p>
          <p className="text-xl font-semibold text-destructive">{stats.failed}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Conditionnels</p>
          <p className="text-xl font-semibold text-warning">{stats.conditional}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher QC, GRN ou fournisseur..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="date">Tri: Date</option>
          <option value="vendor">Tri: Fournisseur</option>
          <option value="status">Tri: Statut</option>
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
            <p className="font-medium">Aucune inspection QC</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">GRN</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fournisseur</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entrepôt</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Inspecteur</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lignes</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
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
                          <span className="text-xs">{qc.lines.length} lignes</span>
                          {failedLines > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive">{failedLines} échec</span>}
                          {conditionalLines > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning">{conditionalLines} cond.</span>}
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
                  Inspection {selectedQC.id}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="text-muted-foreground">GRN :</span> <span className="font-mono text-primary">{selectedQC.grnId}</span></div>
                <div><span className="text-muted-foreground">Fournisseur :</span> {selectedQC.vendorName}</div>
                <div><span className="text-muted-foreground">Entrepôt :</span> {selectedQC.warehouseName}</div>
                <div><span className="text-muted-foreground">Inspecteur :</span> {selectedQC.inspectorName}</div>
                <div><span className="text-muted-foreground">Date prévue :</span> {selectedQC.scheduledDate}</div>
                <div><span className="text-muted-foreground">Terminé le :</span> {selectedQC.completedDate ?? "—"}</div>
                <div><span className="text-muted-foreground">Statut :</span> <StatusBadge status={selectedQC.status} /></div>
                {selectedQC.quarantineLocationId && (
                  <div><span className="text-muted-foreground">Zone quarantaine :</span> <span className="font-mono text-warning">{selectedQC.quarantineLocationId}</span></div>
                )}
              </div>
              {selectedQC.notes && <p className="text-sm bg-muted/30 rounded-lg p-3 mb-4">{selectedQC.notes}</p>}

              {/* Inspection lines */}
              <h3 className="font-semibold text-sm mb-2">Lignes d'inspection</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-2 text-left">Produit</th>
                      <th className="px-3 py-2 text-left">Lot</th>
                      <th className="px-3 py-2 text-right">Échantillon</th>
                      <th className="px-3 py-2 text-right">OK</th>
                      <th className="px-3 py-2 text-right">Rejetés</th>
                      <th className="px-3 py-2 text-left">Temp.</th>
                      <th className="px-3 py-2 text-left">Défaut</th>
                      <th className="px-3 py-2 text-left">Résultat</th>
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
                    <XCircle className="h-4 w-4" /> Rejeter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleComplete(selectedQC, "Conditional")} className="gap-1 text-warning border-warning/50">
                    <AlertTriangle className="h-4 w-4" /> Conditionnel
                  </Button>
                  <Button size="sm" onClick={() => handleComplete(selectedQC, "Passed")} className="gap-1">
                    <CheckCircle className="h-4 w-4" /> Valider
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