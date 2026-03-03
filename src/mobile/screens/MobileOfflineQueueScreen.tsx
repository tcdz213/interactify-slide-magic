import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, WifiOff, RefreshCw, Check, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  syncAll,
  clearSynced,
  removeAction,
  type SyncStatus,
} from "@/services/offlineSync";
import { useOfflineQueue, useConflicts } from "@/mobile/hooks/useMobileData";
import { useQueryClient } from "@tanstack/react-query";
import SyncConflictDialog from "@/components/SyncConflictDialog";

const STATUS_MAP: Record<SyncStatus, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "En attente", color: "text-amber-600 bg-amber-500/10" },
  syncing: { icon: RefreshCw, label: "Synchro...", color: "text-blue-600 bg-blue-500/10" },
  synced: { icon: Check, label: "Synchronisé", color: "text-emerald-600 bg-emerald-500/10" },
  conflict: { icon: AlertTriangle, label: "Conflit", color: "text-destructive bg-destructive/10" },
  failed: { icon: AlertTriangle, label: "Échoué", color: "text-destructive bg-destructive/10" },
};

const ACTION_LABELS: Record<string, string> = {
  create_order: "Nouvelle commande",
  update_order: "Mise à jour commande",
  log_visit: "Journal de visite",
  update_customer: "Mise à jour client",
  check_in: "Check-in",
  check_out: "Check-out",
};

export default function MobileOfflineQueueScreen() {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: queue = [] } = useOfflineQueue();
  const { data: conflicts = [] } = useConflicts();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["mobile", "offlineQueue"] });
    queryClient.invalidateQueries({ queryKey: ["mobile", "conflicts"] });
  }, [queryClient]);

  const handleSync = async () => {
    setSyncing(true);
    await syncAll((results) => {
      toast({
        title: "Synchronisation terminée",
        description: `✅ ${results.synced} synchronisées • ⚠️ ${results.conflicts} conflits • ❌ ${results.failed} échouées`,
      });
      if (results.conflicts > 0) setConflictDialogOpen(true);
    });
    invalidate();
    setSyncing(false);
  };

  const handleClearSynced = async () => {
    await clearSynced();
    invalidate();
    toast({ title: "Éléments synchronisés supprimés" });
  };

  const handleRemove = async (id: string) => {
    await removeAction(id);
    invalidate();
  };

  const pendingCount = queue.filter(q => q.status === "pending").length;
  const conflictCount = queue.filter(q => q.status === "conflict").length;
  const syncedCount = queue.filter(q => q.status === "synced").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">File d'attente</h1>
            <p className="text-xs text-muted-foreground">{queue.length} action(s) en file</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing || pendingCount === 0}
            className={cn(
              "min-h-[44px] px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
              pendingCount > 0 && !syncing
                ? "bg-primary text-primary-foreground active:opacity-90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            Sync
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex gap-2">
        <div className="flex-1 bg-amber-500/10 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-amber-700">{pendingCount}</p>
          <p className="text-[10px] text-amber-600">En attente</p>
        </div>
        <button
          onClick={() => conflictCount > 0 && setConflictDialogOpen(true)}
          className="flex-1 bg-destructive/10 rounded-lg p-2 text-center"
        >
          <p className="text-lg font-bold text-destructive">{conflictCount}</p>
          <p className="text-[10px] text-destructive">Conflits</p>
        </button>
        <div className="flex-1 bg-emerald-500/10 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-emerald-700">{syncedCount}</p>
          <p className="text-[10px] text-emerald-600">Synchronisées</p>
        </div>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <WifiOff className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">Aucune action en file</p>
            <p className="text-xs mt-1">Les commandes hors ligne apparaîtront ici</p>
          </div>
        )}

        {queue.map(action => {
          const sm = STATUS_MAP[action.status];
          const Icon = sm.icon;
          return (
            <div key={action.id} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", sm.color.split(" ")[1])}>
                    <Icon className={cn("h-3.5 w-3.5", sm.color.split(" ")[0])} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ACTION_LABELS[action.type] || action.type}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(action.timestamp).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px] border-0", sm.color)}>{sm.label}</Badge>
                  {(action.status === "synced" || action.status === "failed") && (
                    <button onClick={() => handleRemove(action.id)} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {action.error && (
                <p className="text-[10px] text-destructive mt-2 bg-destructive/5 rounded p-1.5">{action.error}</p>
              )}
              {action.retries > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">Tentatives: {action.retries}/5</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Clear synced button */}
      {syncedCount > 0 && (
        <div className="px-4 py-3 border-t border-border bg-background">
          <button
            onClick={handleClearSynced}
            className="w-full bg-muted text-muted-foreground rounded-xl p-3 text-sm font-medium active:bg-border transition-colors"
          >
            Supprimer les éléments synchronisés ({syncedCount})
          </button>
        </div>
      )}

      {/* Conflict dialog */}
      <SyncConflictDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        onResolved={invalidate}
      />
    </div>
  );
}
