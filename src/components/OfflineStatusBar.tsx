/**
 * Offline Status Bar — shows sync queue status and online/offline indicator.
 * Also injects synced mobile orders into the WMS data context.
 */

import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQueue, syncAll, getConflicts, clearSynced, startAutoSync, onActionSynced, type QueuedAction } from "@/services/offlineSync";
import SyncConflictDialog from "./SyncConflictDialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { SalesOrder, SOLine } from "@/data/transactionalData";

export default function OfflineStatusBar() {
  const [online, setOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [conflictCount, setConflictCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const { salesOrders, setSalesOrders } = useWMSData();

  const refreshQueue = useCallback(async () => {
    const q = await getQueue();
    setQueue(q);
    const c = await getConflicts();
    setConflictCount(c.filter((x) => !x.resolvedWith).length);
  }, []);

  // Listen for synced create_order actions and inject into WMS context
  useEffect(() => {
    const unsub = onActionSynced((action) => {
      if (action.type === "create_order") {
        const p = action.payload as Record<string, unknown>;
        const lines = (p.lines as Array<Record<string, unknown>> || []).map((l, i): SOLine => ({
          lineId: i + 1,
          productId: String(l.productId || ""),
          productName: String(l.productName || ""),
          orderedQty: Number(l.baseQty || l.qty || 0),
          reservedQty: 0,
          shippedQty: 0,
          unitPrice: Number(l.unitPrice || 0),
          lineDiscount: 0,
          lineTotal: Number(l.qty || 0) * Number(l.factor || 1) * Number(l.unitPrice || 0),
          unitId: String(l.unitId || `DEFAULT-${l.productId}`),
          unitAbbr: String(l.unitAbbr || "Pce"),
          unitName: String(l.unitName || "Pièce"),
          conversionFactor: Number(l.factor || 1),
          baseQty: Number(l.baseQty || Number(l.qty || 0) * Number(l.factor || 1)),
        }));
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const newOrder: SalesOrder = {
          id: `ORD-${dateStr}-${String(salesOrders.length + 1).padStart(3, "0")}`,
          customerId: String(p.customerId || ""),
          customerName: String(p.customerName || ""),
          salesRep: "Yassine Khelifi",
          orderDate: now.toISOString().replace("T", " ").slice(0, 16),
          deliveryDate: new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10),
          status: "Draft",
          subtotal: Number(p.totalAmount || 0),
          discountPct: 0,
          taxAmount: 0,
          totalAmount: Number(p.totalAmount || 0),
          paymentTerms: "Net 30",
          channel: "Application mobile",
          notes: "Commande créée depuis l'application vendeur",
          lines,
          acceptPartial: Boolean(p.acceptPartial),
        };
        setSalesOrders(prev => [...prev, newOrder]);
      }
    });
    return unsub;
  }, [salesOrders.length, setSalesOrders]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const cleanup = startAutoSync((results) => {
      refreshQueue();
      if (results.synced > 0) {
        toast({ title: `${results.synced} action(s) synchronisée(s)` });
      }
      if (results.conflicts > 0) {
        setShowConflicts(true);
      }
    });

    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      cleanup();
      clearInterval(interval);
    };
  }, [refreshQueue]);

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const failedCount = queue.filter((q) => q.status === "failed").length;

  const handleSync = async () => {
    setSyncing(true);
    await syncAll((results) => {
      if (results.conflicts > 0) setShowConflicts(true);
      toast({
        title: "Synchronisation terminée",
        description: `${results.synced} réussi(s), ${results.failed} échoué(s), ${results.conflicts} conflit(s)`,
      });
    });
    await clearSynced();
    await refreshQueue();
    setSyncing(false);
  };

  if (pendingCount === 0 && failedCount === 0 && conflictCount === 0 && online) return null;

  return (
    <>
      <div className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm text-xs",
        online ? "bg-card/95 border-border" : "bg-amber-50 border-amber-200 dark:bg-amber-950/80 dark:border-amber-800"
      )}>
        {online ? (
          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-amber-500" />
        )}

        <span className="font-medium">
          {online ? "En ligne" : "Hors ligne"}
        </span>

        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5">
            {pendingCount} en attente
          </Badge>
        )}

        {failedCount > 0 && (
          <Badge variant="destructive" className="text-[10px] px-1.5">
            {failedCount} échoué(s)
          </Badge>
        )}

        {conflictCount > 0 && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-amber-600" onClick={() => setShowConflicts(true)}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {conflictCount} conflit(s)
          </Button>
        )}

        {online && pendingCount > 0 && (
          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
          </Button>
        )}

        {pendingCount === 0 && failedCount === 0 && conflictCount === 0 && (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        )}
      </div>

      <SyncConflictDialog
        open={showConflicts}
        onOpenChange={setShowConflicts}
        onResolved={refreshQueue}
      />
    </>
  );
}
