import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, PlusCircle, Map, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import OfflineBanner from "./OfflineBanner";
import { startAutoSync, syncAll } from "@/services/offlineSync";
import { toast } from "@/hooks/use-toast";
import { useConflicts, useDeltaSync } from "@/mobile/hooks/useMobileData";
import SyncConflictDialog from "@/components/SyncConflictDialog";
import { startMockPushSimulation, requestPermission } from "@/services/pushNotificationService";

const NAV_ITEMS = [
  { path: "/mobile/dashboard", icon: Home, label: "Accueil" },
  { path: "/mobile/customers", icon: Users, label: "Clients" },
  { path: "/mobile/new-order", icon: PlusCircle, label: "Commande" },
  { path: "/mobile/route", icon: Map, label: "Tournée" },
  { path: "/mobile/more", icon: Menu, label: "Plus" },
];

/** Periodic sync interval: 15 minutes */
const PERIODIC_SYNC_MS = 15 * 60_000;

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const { data: conflicts = [] } = useConflicts();
  const { performDeltaSync } = useDeltaSync();
  const periodicRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wire auto-sync: flush queue on reconnect + every 60s
  useEffect(() => {
    const cleanup = startAutoSync((results) => {
      if (results.synced > 0 || results.conflicts > 0) {
        toast({
          title: "🔄 Synchronisation",
          description: `${results.synced} sync • ${results.conflicts} conflits • ${results.failed} erreurs`,
        });
      }
      // Auto-open conflict dialog if there are unresolved conflicts
      if (results.conflicts > 0) {
        setConflictDialogOpen(true);
      }
    });
    return cleanup;
  }, []);

  // Mock push notification simulation
  useEffect(() => {
    requestPermission(); // Ask once
    const cleanup = startMockPushSimulation();
    return cleanup;
  }, []);

  // Periodic 15-min delta sync
  useEffect(() => {
    periodicRef.current = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await performDeltaSync();
          // Also flush queue
          await syncAll();
        } catch {
          // Silent fail for periodic sync
        }
      }
    }, PERIODIC_SYNC_MS);

    return () => {
      if (periodicRef.current) clearInterval(periodicRef.current);
    };
  }, [performDeltaSync]);

  // Show conflict indicator when there are unresolved conflicts
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Offline banner */}
      <OfflineBanner />

      {/* Conflict banner */}
      {hasConflicts && (
        <button
          onClick={() => setConflictDialogOpen(true)}
          className="bg-amber-500/10 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2 text-xs font-medium text-amber-700"
        >
          <span>⚠️ {conflicts.length} conflit(s) à résoudre</span>
          <span className="ml-auto text-amber-500 underline">Résoudre</span>
        </button>
      )}

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="shrink-0 border-t border-border bg-card safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + "/");
            return (
              <button
                key={path}
                onClick={() => { navigate(path); navigator.vibrate?.(10); }}
                className={cn(
                  "flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Conflict resolution dialog */}
      <SyncConflictDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        onResolved={() => {
          toast({ title: "✅ Tous les conflits résolus" });
        }}
      />
    </div>
  );
}
