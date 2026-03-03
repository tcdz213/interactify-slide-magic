/**
 * Sync Conflict Resolution Dialog — shows offline sync conflicts
 * and lets users choose local or server version.
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Cloud, Smartphone, Check, ArrowRight } from "lucide-react";
import { getConflicts, resolveConflict, removeConflict, type SyncConflict } from "@/services/offlineSync";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SyncConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved?: () => void;
}

export default function SyncConflictDialog({ open, onOpenChange, onResolved }: SyncConflictDialogProps) {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      getConflicts().then((c) => setConflicts(c.filter((x) => !x.resolvedWith)));
    }
  }, [open]);

  const handleResolve = async (id: string, resolution: "local" | "server") => {
    setResolving(id);
    await resolveConflict(id, resolution);
    await removeConflict(id);
    setConflicts((prev) => prev.filter((c) => c.id !== id));
    setResolving(null);

    toast({
      title: "Conflit résolu",
      description: `Version ${resolution === "local" ? "locale" : "serveur"} conservée.`,
    });

    if (conflicts.length <= 1) {
      onOpenChange(false);
      onResolved?.();
    }
  };

  const handleResolveAll = async (resolution: "local" | "server") => {
    for (const c of conflicts) {
      await resolveConflict(c.id, resolution);
      await removeConflict(c.id);
    }
    setConflicts([]);
    onOpenChange(false);
    onResolved?.();

    toast({
      title: "Tous les conflits résolus",
      description: `${conflicts.length} conflit(s) résolu(s) avec la version ${resolution === "local" ? "locale" : "serveur"}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Conflits de synchronisation
            <Badge variant="secondary" className="ml-1">{conflicts.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        {conflicts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Check className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <p className="font-medium">Aucun conflit en attente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={cn(
                  "rounded-lg border p-3 space-y-2",
                  resolving === conflict.id && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-muted-foreground">Action:</span>
                  <Badge variant="outline">{conflict.actionId}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>Champ: <code className="text-xs bg-muted px-1 rounded">{conflict.field}</code></span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Local version */}
                  <button
                    onClick={() => handleResolve(conflict.id, "local")}
                    className="rounded-md border-2 border-transparent hover:border-primary p-2 text-left transition-colors bg-muted/50 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1">
                      <Smartphone className="h-3.5 w-3.5" />
                      Version locale
                    </div>
                    <pre className="text-[10px] text-muted-foreground overflow-hidden max-h-16 leading-tight">
                      {JSON.stringify(conflict.localData, null, 1).slice(0, 120)}…
                    </pre>
                  </button>

                  {/* Server version */}
                  <button
                    onClick={() => handleResolve(conflict.id, "server")}
                    className="rounded-md border-2 border-transparent hover:border-primary p-2 text-left transition-colors bg-muted/50 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                      <Cloud className="h-3.5 w-3.5" />
                      Version serveur
                    </div>
                    <pre className="text-[10px] text-muted-foreground overflow-hidden max-h-16 leading-tight">
                      {JSON.stringify(conflict.serverData, null, 1).slice(0, 120)}…
                    </pre>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {conflicts.length > 1 && (
          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleResolveAll("server")}>
              <Cloud className="h-3.5 w-3.5 mr-1" />
              Tout garder serveur
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleResolveAll("local")}>
              <Smartphone className="h-3.5 w-3.5 mr-1" />
              Tout garder local
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
