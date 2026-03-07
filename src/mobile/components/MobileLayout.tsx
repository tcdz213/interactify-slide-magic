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
import { useTranslation } from "react-i18next";

const PERIODIC_SYNC_MS = 15 * 60_000;

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const { data: conflicts = [] } = useConflicts();
  const { performDeltaSync } = useDeltaSync();
  const periodicRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const NAV_ITEMS = [
    { path: "/mobile/dashboard", icon: Home, label: t("mobile.nav.home") },
    { path: "/mobile/customers", icon: Users, label: t("mobile.nav.clients") },
    { path: "/mobile/new-order", icon: PlusCircle, label: t("mobile.nav.order") },
    { path: "/mobile/route", icon: Map, label: t("mobile.nav.route") },
    { path: "/mobile/more", icon: Menu, label: t("mobile.nav.more") },
  ];

  useEffect(() => {
    const cleanup = startAutoSync((results) => {
      if (results.synced > 0 || results.conflicts > 0) {
        toast({
          title: t("mobile.sync.title"),
          description: t("mobile.sync.desc", { synced: results.synced, conflicts: results.conflicts, failed: results.failed }),
        });
      }
      if (results.conflicts > 0) {
        setConflictDialogOpen(true);
      }
    });
    return cleanup;
  }, [t]);

  useEffect(() => {
    requestPermission();
    const cleanup = startMockPushSimulation();
    return cleanup;
  }, []);

  useEffect(() => {
    periodicRef.current = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await performDeltaSync();
          await syncAll();
        } catch {
          // Silent fail
        }
      }
    }, PERIODIC_SYNC_MS);

    return () => {
      if (periodicRef.current) clearInterval(periodicRef.current);
    };
  }, [performDeltaSync]);

  const hasConflicts = conflicts.length > 0;

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      <OfflineBanner />

      {hasConflicts && (
        <button
          onClick={() => setConflictDialogOpen(true)}
          className="bg-amber-500/10 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2 text-xs font-medium text-amber-700"
        >
          <span>{t("mobile.conflicts.banner", { count: conflicts.length })}</span>
          <span className="ml-auto text-amber-500 underline">{t("mobile.conflicts.resolve")}</span>
        </button>
      )}

      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <Outlet />
      </main>

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
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <SyncConflictDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        onResolved={() => {
          toast({ title: t("mobile.conflicts.allResolved") });
        }}
      />
    </div>
  );
}
