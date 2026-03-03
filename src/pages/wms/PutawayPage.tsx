import { useState, useMemo } from "react";
import { ArrowDownToLine, Search, Eye, CheckCircle, MapPin, ChevronDown, ChevronUp, User } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { PutawayTask, PutawayStatus } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { warehouseLocations, users } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "Pending", label: "En attente" },
  { value: "Assigned", label: "Assigné" },
  { value: "In_Progress", label: "En cours" },
  { value: "Completed", label: "Terminé" },
  { value: "Cancelled", label: "Annulé" },
];

export default function PutawayPage() {
  const { putawayTasks, setPutawayTasks } = useWMSData();
  const { operationalWarehouseIds } = useWarehouseScope();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTask, setSelectedTask] = useState<PutawayTask | null>(null);
  const [confirmLocation, setConfirmLocation] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = putawayTasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (search && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.productName.toLowerCase().includes(search.toLowerCase()) && !t.grnId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => mult * a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [putawayTasks, filterStatus, search, sortDir]);

  const stats = useMemo(() => ({
    pending: putawayTasks.filter(t => t.status === "Pending").length,
    assigned: putawayTasks.filter(t => t.status === "Assigned").length,
    inProgress: putawayTasks.filter(t => t.status === "In_Progress").length,
    completed: putawayTasks.filter(t => t.status === "Completed").length,
  }), [putawayTasks]);

  const handleStartTask = (task: PutawayTask) => {
    setPutawayTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: "In_Progress" as PutawayStatus } : t
    ));
    toast({ title: "Tâche démarrée", description: task.id });
  };

  const handleCompleteTask = () => {
    if (!selectedTask || !confirmLocation) return;
    setPutawayTasks(prev => prev.map(t =>
      t.id === selectedTask.id ? {
        ...t,
        status: "Completed" as PutawayStatus,
        actualLocationId: confirmLocation,
        completedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      } : t
    ));
    setSelectedTask(null);
    setConfirmLocation("");
    toast({ title: "Rangement confirmé", description: selectedTask.id });
  };

  const openConfirmDialog = (task: PutawayTask) => {
    setSelectedTask(task);
    setConfirmLocation(task.suggestedLocationId);
  };

  const strategyLabel: Record<string, string> = {
    FIFO: "FIFO (Premier entré)",
    FEFO: "FEFO (Expire en premier)",
    Zone_Match: "Zone compatible",
    Nearest_Available: "Plus proche disponible",
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
            <h1 className="text-xl font-bold tracking-tight">Rangement (Putaway)</h1>
            <p className="text-sm text-muted-foreground">Tâches de rangement, emplacements suggérés et confirmation</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En attente</p>
          <p className="text-xl font-semibold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Assignées</p>
          <p className="text-xl font-semibold text-info">{stats.assigned}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En cours</p>
          <p className="text-xl font-semibold text-primary">{stats.inProgress}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Terminées</p>
          <p className="text-xl font-semibold text-success">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher tâche, produit ou GRN..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="h-9 px-2 rounded-lg border border-input bg-muted/50">
          {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ArrowDownToLine className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucune tâche de rangement</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">GRN</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produit</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qté</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stratégie</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Emplacement suggéré</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Emplacement réel</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assigné à</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
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
                        <p className="text-[10px] text-muted-foreground">Lot: {task.batchNumber} · DLC: {task.expiryDate}</p>
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
                      ) : <span className="text-muted-foreground text-xs">Non assigné</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {(task.status === "Assigned") && (
                          <Button variant="outline" size="sm" onClick={() => handleStartTask(task)} className="text-xs gap-1">Démarrer</Button>
                        )}
                        {(task.status === "In_Progress" || task.status === "Assigned") && (
                          <Button size="sm" onClick={() => openConfirmDialog(task)} className="text-xs gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Confirmer
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

      {/* Confirm putaway dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Confirmer le rangement</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Produit :</span> <span className="font-medium">{selectedTask.productName}</span></div>
                <div><span className="text-muted-foreground">Quantité :</span> <span className="font-semibold">{selectedTask.qty}</span></div>
                <div><span className="text-muted-foreground">Lot :</span> <span className="font-mono">{selectedTask.batchNumber}</span></div>
                <div><span className="text-muted-foreground">Emplacement suggéré :</span> <span className="font-mono text-primary">{selectedTask.suggestedLocationId}</span></div>
                <FormField label="Emplacement réel de rangement" required>
                  <select value={confirmLocation} onChange={e => setConfirmLocation(e.target.value)} className={formSelectClass}>
                    {warehouseLocations.filter(l => l.warehouseId === selectedTask.warehouseId && l.status === "Available").map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.id} — {loc.zone}/{loc.aisle}-{loc.rack} ({loc.type})</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTask(null)}>Annuler</Button>
                <Button onClick={handleCompleteTask} disabled={!confirmLocation} className="gap-1">
                  <CheckCircle className="h-4 w-4" /> Confirmer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}