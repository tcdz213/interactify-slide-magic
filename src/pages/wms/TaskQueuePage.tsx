import { useMemo, useState } from "react";
import { ClipboardList, Search, CheckCircle2, Clock, User, Package, ArrowDownToLine, Hand, RotateCcw, UserPlus } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface UnifiedTask {
  id: string;
  type: "Putaway" | "Picking" | "Replenishment" | "Count" | "Return";
  priority: "High" | "Medium" | "Low";
  productName: string;
  locationId: string;
  qty: number;
  assignedTo?: string;
  status: "Pending" | "Assigned" | "In_Progress" | "Completed";
  createdAt: string;
  dueBy?: string;
}

const OPERATORS = ["Ahmed B.", "Fatima Z.", "Karim M.", "Nour S.", "Yassine D."];

export default function TaskQueuePage() {
  const { putawayTasks, salesOrders } = useWMSData();
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<UnifiedTask>>>({});
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState("");

  const baseTasks: UnifiedTask[] = useMemo(() => {
    const result: UnifiedTask[] = [];
    putawayTasks.forEach((t: any) => {
      result.push({
        id: t.id,
        type: "Putaway",
        priority: t.status === "Pending" ? "High" : "Medium",
        productName: t.productName,
        locationId: t.suggestedLocationId,
        qty: t.qty,
        assignedTo: t.assignedToName,
        status: t.status === "Completed" ? "Completed" : t.status === "In_Progress" ? "In_Progress" : t.assignedTo ? "Assigned" : "Pending",
        createdAt: t.createdAt,
      });
    });
    salesOrders.filter((o: any) => o.status === "Picking").forEach((o: any) => {
      o.lines.forEach((l: any) => {
        if (l.shippedQty < l.orderedQty) {
          result.push({
            id: `PICK-${o.id}-${l.lineId}`,
            type: "Picking",
            priority: "High",
            productName: l.productName,
            locationId: "—",
            qty: l.orderedQty - l.shippedQty,
            status: "Pending",
            createdAt: o.orderDate,
            dueBy: o.deliveryDate,
          });
        }
      });
    });
    return result;
  }, [putawayTasks, salesOrders]);

  const tasks = baseTasks.map((t) => ({ ...t, ...localOverrides[t.id] }));

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = tasks
    .filter((t) =>
      t.productName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    )
    .filter((t) => filter === "all" || t.type === filter);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In_Progress" || t.status === "Assigned").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  }), [tasks]);

  const typeIcons: Record<string, React.ElementType> = {
    Putaway: ArrowDownToLine,
    Picking: Hand,
    Replenishment: Package,
    Count: ClipboardList,
    Return: RotateCcw,
  };

  const priorityColors: Record<string, string> = {
    High: "bg-destructive/10 text-destructive",
    Medium: "bg-warning/10 text-warning",
    Low: "bg-muted text-muted-foreground",
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-muted text-muted-foreground",
    Assigned: "bg-info/10 text-info",
    In_Progress: "bg-warning/10 text-warning",
    Completed: "bg-success/10 text-success",
  };

  const assignTask = () => {
    if (!assignDialog || !selectedOperator) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [assignDialog]: { assignedTo: selectedOperator, status: "Assigned" },
    }));
    toast({ title: "Tâche assignée", description: `${assignDialog} → ${selectedOperator}` });
    setAssignDialog(null);
    setSelectedOperator("");
  };

  const startTask = (taskId: string) => {
    setLocalOverrides((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: "In_Progress" },
    }));
    toast({ title: "Tâche démarrée", description: taskId });
  };

  const completeTask = (taskId: string) => {
    setLocalOverrides((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: "Completed" },
    }));
    toast({ title: "Tâche terminée", description: taskId });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">File de tâches unifiée</h1>
          <p className="text-sm text-muted-foreground">Putaway + Picking + Replenishment + Comptage</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total tâches</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En attente</p>
          <p className="text-xl font-semibold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En cours</p>
          <p className="text-xl font-semibold text-info">{stats.inProgress}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Terminées</p>
          <p className="text-xl font-semibold text-success">{stats.completed}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
        </div>
        <div className="flex gap-1">
          {["all", "Putaway", "Picking", "Replenishment", "Count"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
              onClick={() => setFilter(f)}>
              {f === "all" ? "Toutes" : f}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucune tâche.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Priorité</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Emplacement</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qté</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Assigné à</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const Icon = typeIcons[t.type] ?? ClipboardList;
                return (
                  <tr key={t.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs">
                        <Icon className="h-3 w-3" /> {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{t.productName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.locationId}</td>
                    <td className="px-4 py-3 text-right">{t.qty}</td>
                    <td className="px-4 py-3 text-xs">
                      {t.assignedTo ? (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {t.assignedTo}</span>
                      ) : (
                        <span className="text-muted-foreground">Non assigné</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {t.status === "Pending" && (
                          <Button variant="outline" size="sm" onClick={() => setAssignDialog(t.id)}>
                            <UserPlus className="h-3 w-3 mr-1" /> Assigner
                          </Button>
                        )}
                        {t.status === "Assigned" && (
                          <Button variant="outline" size="sm" onClick={() => startTask(t.id)}>
                            <Clock className="h-3 w-3 mr-1" /> Démarrer
                          </Button>
                        )}
                        {t.status === "In_Progress" && (
                          <Button variant="outline" size="sm" onClick={() => completeTask(t.id)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Terminer
                          </Button>
                        )}
                        {t.status === "Completed" && (
                          <span className="text-xs text-success">✓</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={(o) => !o && setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner la tâche {assignDialog}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sélectionnez un opérateur :</p>
            <select
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
            >
              <option value="">— Choisir —</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Annuler</Button>
            <Button onClick={assignTask} disabled={!selectedOperator}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
