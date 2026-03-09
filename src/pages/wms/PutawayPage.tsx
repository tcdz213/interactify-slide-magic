import { useState, useMemo } from "react";
import { ArrowDownToLine, Search, CheckCircle, MapPin, ChevronDown, ChevronUp, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { PutawayTask, PutawayStatus } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formSelectClass } from "@/components/ui/form-field";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { warehouseLocations } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export default function PutawayPage() {
  const { t } = useTranslation();
  const { putawayTasks, setPutawayTasks } = useWMSData();
  const { operationalWarehouseIds } = useWarehouseScope();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTask, setSelectedTask] = useState<PutawayTask | null>(null);
  const [confirmLocation, setConfirmLocation] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const STATUS_OPTIONS = [
    { value: "all", label: t("putawayPage.all") },
    { value: "Pending", label: t("putawayPage.statusPending") },
    { value: "Assigned", label: t("putawayPage.statusAssigned") },
    { value: "In_Progress", label: t("putawayPage.statusInProgress") },
    { value: "Completed", label: t("putawayPage.statusCompleted") },
    { value: "Cancelled", label: t("putawayPage.statusCancelled") },
  ];

  const strategyLabel: Record<string, string> = {
    FIFO: t("putawayPage.strategyFIFO"),
    FEFO: t("putawayPage.strategyFEFO"),
    Zone_Match: t("putawayPage.strategyZone"),
    Nearest_Available: t("putawayPage.strategyNearest"),
  };

  const filtered = useMemo(() => {
    let list = putawayTasks.filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (search && !task.id.toLowerCase().includes(search.toLowerCase()) && !task.productName.toLowerCase().includes(search.toLowerCase()) && !task.grnId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => mult * a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [putawayTasks, filterStatus, search, sortDir]);

  const stats = useMemo(() => ({
    pending: putawayTasks.filter(task => task.status === "Pending").length,
    assigned: putawayTasks.filter(task => task.status === "Assigned").length,
    inProgress: putawayTasks.filter(task => task.status === "In_Progress").length,
    completed: putawayTasks.filter(task => task.status === "Completed").length,
  }), [putawayTasks]);

  const handleStartTask = (task: PutawayTask) => {
    setPutawayTasks(prev => prev.map(t2 =>
      t2.id === task.id ? { ...t2, status: "In_Progress" as PutawayStatus } : t2
    ));
    toast({ title: t("putawayPage.taskStarted"), description: task.id });
  };

  const handleCompleteTask = () => {
    if (!selectedTask || !confirmLocation) return;
    setPutawayTasks(prev => prev.map(t2 =>
      t2.id === selectedTask.id ? {
        ...t2,
        status: "Completed" as PutawayStatus,
        actualLocationId: confirmLocation,
        completedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      } : t2
    ));
    setSelectedTask(null);
    setConfirmLocation("");
    toast({ title: t("putawayPage.storageConfirmed"), description: selectedTask.id });
  };

  const openConfirmDialog = (task: PutawayTask) => {
    setSelectedTask(task);
    setConfirmLocation(task.suggestedLocationId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ArrowDownToLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("putawayPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("putawayPage.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("putawayPage.pending")}</p>
          <p className="text-xl font-semibold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("putawayPage.assigned")}</p>
          <p className="text-xl font-semibold text-info">{stats.assigned}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("putawayPage.inProgress")}</p>
          <p className="text-xl font-semibold text-primary">{stats.inProgress}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("putawayPage.completed")}</p>
          <p className="text-xl font-semibold text-success">{stats.completed}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("putawayPage.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="h-9 px-2 rounded-lg border border-input bg-muted/50">
          {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ArrowDownToLine className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("putawayPage.noTasks")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colId")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colGRN")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colProduct")}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("putawayPage.colQty")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colStrategy")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colSuggested")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colActual")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colAssigned")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("putawayPage.colStatus")}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("putawayPage.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{task.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{task.grnId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-xs">{task.productName}</p>
                        <p className="text-[10px] text-muted-foreground">{t("putawayPage.lot")}: {task.batchNumber} · {t("putawayPage.expiry")}: {task.expiryDate}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{task.qty}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border bg-muted/50">{strategyLabel[task.strategy] ?? task.strategy}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {task.suggestedLocationId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.actualLocationId ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-success">
                          <CheckCircle className="h-3 w-3" />
                          {task.actualLocationId}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {task.assignedToName ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {task.assignedToName}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">{t("putawayPage.notAssigned")}</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {(task.status === "Assigned") && (
                          <Button variant="outline" size="sm" onClick={() => handleStartTask(task)} className="text-xs gap-1">{t("putawayPage.start")}</Button>
                        )}
                        {(task.status === "In_Progress" || task.status === "Assigned") && (
                          <Button size="sm" onClick={() => openConfirmDialog(task)} className="text-xs gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> {t("putawayPage.confirm")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{t("putawayPage.confirmTitle")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">{t("putawayPage.product")}</span> <span className="font-medium">{selectedTask.productName}</span></div>
                <div><span className="text-muted-foreground">{t("putawayPage.quantity")}</span> <span className="font-semibold">{selectedTask.qty}</span></div>
                <div><span className="text-muted-foreground">{t("putawayPage.batchLabel")}</span> <span className="font-mono">{selectedTask.batchNumber}</span></div>
                <div><span className="text-muted-foreground">{t("putawayPage.suggestedLocation")}</span> <span className="font-mono text-primary">{selectedTask.suggestedLocationId}</span></div>
                <FormField label={t("putawayPage.actualLocation")} required>
                  <select value={confirmLocation} onChange={e => setConfirmLocation(e.target.value)} className={formSelectClass}>
                    {warehouseLocations.filter(l => l.warehouseId === selectedTask.warehouseId && l.status === "Available").map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.id} — {loc.zone}/{loc.aisle}-{loc.rack} ({loc.type})</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTask(null)}>{t("common.cancel")}</Button>
                <Button onClick={handleCompleteTask} disabled={!confirmLocation} className="gap-1">
                  <CheckCircle className="h-4 w-4" /> {t("putawayPage.confirm")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
