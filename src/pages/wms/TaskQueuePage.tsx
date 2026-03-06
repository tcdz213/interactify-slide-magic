import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Search, CheckCircle2, Clock, User, Package, ArrowDownToLine, Hand, RotateCcw, UserPlus } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  const { t } = useTranslation();
  const { putawayTasks, salesOrders } = useWMSData();
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<UnifiedTask>>>({});
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState("");

  const baseTasks: UnifiedTask[] = useMemo(() => {
    const result: UnifiedTask[] = [];
    putawayTasks.forEach((pt: any) => {
      result.push({
        id: pt.id, type: "Putaway", priority: pt.status === "Pending" ? "High" : "Medium",
        productName: pt.productName, locationId: pt.suggestedLocationId, qty: pt.qty,
        assignedTo: pt.assignedToName,
        status: pt.status === "Completed" ? "Completed" : pt.status === "In_Progress" ? "In_Progress" : pt.assignedTo ? "Assigned" : "Pending",
        createdAt: pt.createdAt,
      });
    });
    salesOrders.filter((o: any) => o.status === "Picking").forEach((o: any) => {
      o.lines.forEach((l: any) => {
        if (l.shippedQty < l.orderedQty) {
          result.push({ id: `PICK-${o.id}-${l.lineId}`, type: "Picking", priority: "High", productName: l.productName, locationId: "—", qty: l.orderedQty - l.shippedQty, status: "Pending", createdAt: o.orderDate, dueBy: o.deliveryDate });
        }
      });
    });
    return result;
  }, [putawayTasks, salesOrders]);

  const tasks = baseTasks.map((tsk) => ({ ...tsk, ...localOverrides[tsk.id] }));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = tasks
    .filter((tsk) => tsk.productName.toLowerCase().includes(search.toLowerCase()) || tsk.id.toLowerCase().includes(search.toLowerCase()))
    .filter((tsk) => filter === "all" || tsk.type === filter);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((tsk) => tsk.status === "Pending").length,
    inProgress: tasks.filter((tsk) => tsk.status === "In_Progress" || tsk.status === "Assigned").length,
    completed: tasks.filter((tsk) => tsk.status === "Completed").length,
  }), [tasks]);

  const typeIcons: Record<string, React.ElementType> = { Putaway: ArrowDownToLine, Picking: Hand, Replenishment: Package, Count: ClipboardList, Return: RotateCcw };
  const priorityColors: Record<string, string> = { High: "bg-destructive/10 text-destructive", Medium: "bg-warning/10 text-warning", Low: "bg-muted text-muted-foreground" };
  const statusColors: Record<string, string> = { Pending: "bg-muted text-muted-foreground", Assigned: "bg-info/10 text-info", In_Progress: "bg-warning/10 text-warning", Completed: "bg-success/10 text-success" };

  const assignTask = () => {
    if (!assignDialog || !selectedOperator) return;
    setLocalOverrides((prev) => ({ ...prev, [assignDialog]: { assignedTo: selectedOperator, status: "Assigned" } }));
    toast({ title: t("taskQueue.taskAssigned"), description: t("taskQueue.taskAssignedDesc", { id: assignDialog, operator: selectedOperator }) });
    setAssignDialog(null); setSelectedOperator("");
  };

  const startTask = (taskId: string) => {
    setLocalOverrides((prev) => ({ ...prev, [taskId]: { ...prev[taskId], status: "In_Progress" } }));
    toast({ title: t("taskQueue.taskStarted"), description: taskId });
  };

  const completeTask = (taskId: string) => {
    setLocalOverrides((prev) => ({ ...prev, [taskId]: { ...prev[taskId], status: "Completed" } }));
    toast({ title: t("taskQueue.taskCompleted"), description: taskId });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><ClipboardList className="h-5 w-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("taskQueue.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("taskQueue.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("taskQueue.totalTasks")}</p><p className="text-xl font-semibold">{stats.total}</p></div>
        <div className="glass-card rounded-lg p-3 border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("taskQueue.pending")}</p><p className="text-xl font-semibold text-warning">{stats.pending}</p></div>
        <div className="glass-card rounded-lg p-3 border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("taskQueue.inProgress")}</p><p className="text-xl font-semibold text-info">{stats.inProgress}</p></div>
        <div className="glass-card rounded-lg p-3 border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("taskQueue.completed")}</p><p className="text-xl font-semibold text-success">{stats.completed}</p></div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("taskQueue.searchPlaceholder")} className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
        </div>
        <div className="flex gap-1">
          {["all", "Putaway", "Picking", "Replenishment", "Count"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? t("taskQueue.all") : f}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><ClipboardList className="h-12 w-12 mb-3 opacity-50" /><p className="font-medium">{t("taskQueue.noTask")}</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.id")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.type")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.priority")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.product")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.location")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("taskQueue.qty")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.assignedTo")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.status")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("taskQueue.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tsk) => {
                const Icon = typeIcons[tsk.type] ?? ClipboardList;
                return (
                  <tr key={tsk.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{tsk.id}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1 text-xs"><Icon className="h-3 w-3" /> {tsk.type}</span></td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[tsk.priority]}`}>{tsk.priority}</span></td>
                    <td className="px-4 py-3 font-medium">{tsk.productName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{tsk.locationId}</td>
                    <td className="px-4 py-3 text-right">{tsk.qty}</td>
                    <td className="px-4 py-3 text-xs">
                      {tsk.assignedTo ? <span className="flex items-center gap-1"><User className="h-3 w-3" /> {tsk.assignedTo}</span> : <span className="text-muted-foreground">{t("taskQueue.notAssigned")}</span>}
                    </td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[tsk.status]}`}>{tsk.status.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {tsk.status === "Pending" && <Button variant="outline" size="sm" onClick={() => setAssignDialog(tsk.id)}><UserPlus className="h-3 w-3 mr-1" /> {t("taskQueue.assign")}</Button>}
                        {tsk.status === "Assigned" && <Button variant="outline" size="sm" onClick={() => startTask(tsk.id)}><Clock className="h-3 w-3 mr-1" /> {t("taskQueue.start")}</Button>}
                        {tsk.status === "In_Progress" && <Button variant="outline" size="sm" onClick={() => completeTask(tsk.id)}><CheckCircle2 className="h-3 w-3 mr-1" /> {t("taskQueue.complete")}</Button>}
                        {tsk.status === "Completed" && <span className="text-xs text-success">✓</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!assignDialog} onOpenChange={(o) => !o && setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("taskQueue.assignTitle", { id: assignDialog })}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("taskQueue.selectOperator")}</p>
            <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)}>
              <option value="">{t("taskQueue.choosePlaceholder")}</option>
              {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>{t("common.cancel")}</Button>
            <Button onClick={assignTask} disabled={!selectedOperator}>{t("taskQueue.assign")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
