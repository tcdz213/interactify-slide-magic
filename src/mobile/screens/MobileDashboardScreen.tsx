import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, MapPin, Users, TrendingUp, ChevronRight, Clock, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import PullToRefresh from "@/mobile/components/PullToRefresh";
import { toast } from "@/hooks/use-toast";
import {
  useMobileOrders,
  useMobileCustomers,
  useMobileRoute,
  useOfflineQueue,
  useRepProfile,
  useTodayVisits,
  useDeltaSync,
} from "@/mobile/hooks/useMobileData";
import { MobileSkeletonDashboard } from "@/mobile/components/MobileSkeletons";
import { useTranslation } from "react-i18next";

const currency = (v: number) =>
  v.toLocaleString("fr-DZ", { maximumFractionDigits: 0 }) + " DZD";

export default function MobileDashboardScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders = [], isLoading: loadingOrders } = useMobileOrders();
  const { data: customers = [] } = useMobileCustomers();
  const { data: routePlan = [] } = useMobileRoute();
  const { data: pendingQueue = [] } = useOfflineQueue();
  const { data: rep } = useRepProfile();
  const { data: todayVisitLogs = [] } = useTodayVisits();
  const { performDeltaSync } = useDeltaSync();

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleRefresh = useCallback(async () => {
    await performDeltaSync();
    toast({ title: t("mobile.dashboard.refreshed") });
  }, [performDeltaSync, t]);

  if (loadingOrders || !rep) return <MobileSkeletonDashboard />;

  const todayOrders = orders.filter(o => o.createdAt.startsWith("2026-03-01")).length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const quotaPct = Math.round((rep.quotaCurrent / rep.quotaTarget) * 100);
  const visitsCompleted = routePlan.filter(r => r.checkedOut).length + todayVisitLogs.filter(v => v.checkOutTime).length;
  const visitsTotal = routePlan.length;
  const nextVisit = routePlan.find(r => !r.checkedIn);
  const pipelineValue = orders
    .filter(o => ["Pending", "Approved", "Picking"].includes(o.status))
    .reduce((s, o) => s + o.totalAmount, 0);
  const pendingSync = pendingQueue.filter(q => q.status === "pending").length;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 pt-4 pb-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{t("mobile.hello", { name: rep.name.split(" ")[0] })}</h1>
            <p className="text-xs text-muted-foreground capitalize">{today}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">{rep.avatar}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KpiTile icon={ShoppingCart} label={t("mobile.dashboard.orders")} value={String(todayOrders)} sub={`${pendingOrders} ${t("mobile.dashboard.pending")}`} color="primary" onClick={() => navigate("/mobile/more")} />
          <KpiTile icon={TrendingUp} label={t("mobile.dashboard.objective")} value={`${quotaPct}%`} sub={currency(rep.quotaCurrent)} color="info" />
          <KpiTile icon={MapPin} label={t("mobile.dashboard.visits")} value={`${visitsCompleted}/${visitsTotal}`} sub={t("mobile.dashboard.today")} color="success" onClick={() => navigate("/mobile/route")} />
          <KpiTile icon={Users} label={t("mobile.dashboard.clients")} value={String(customers.length)} sub={t("mobile.dashboard.portfolio")} color="warning" onClick={() => navigate("/mobile/customers")} />
        </div>

        {nextVisit && (
          <button
            onClick={() => navigate("/mobile/route")}
            className="w-full bg-card border border-border rounded-xl p-4 text-left active:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">{t("mobile.dashboard.nextVisit")}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{nextVisit.customerName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{nextVisit.address}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-sm font-medium">{nextVisit.plannedTime}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        )}

        {pipelineValue > 0 && (
          <div className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t("mobile.dashboard.dayPipeline")}</span>
            <span className="text-sm font-bold text-foreground">{currency(pipelineValue)}</span>
          </div>
        )}

        {pendingSync > 0 && (
          <button
            onClick={() => navigate("/mobile/offline-queue")}
            className="w-full bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3 active:bg-amber-500/20 transition-colors"
          >
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700 flex-1 text-left">
              {t("mobile.dashboard.pendingSync", { count: pendingSync })}
            </span>
            <ChevronRight className="h-4 w-4 text-amber-500" />
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/mobile/new-order")}
            className="bg-primary text-primary-foreground rounded-xl p-4 flex items-center gap-3 active:opacity-90 transition-opacity min-h-[56px]"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold text-sm">{t("mobile.dashboard.newOrder")}</span>
          </button>
          <button
            onClick={() => navigate("/mobile/customers")}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted transition-colors min-h-[56px]"
          >
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">{t("mobile.dashboard.myClients")}</span>
          </button>
        </div>
      </div>
    </PullToRefresh>
  );
}

function KpiTile({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ElementType; label: string; value: string; sub: string;
  color: "primary" | "info" | "success" | "warning"; onClick?: () => void;
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    info: "bg-blue-500/10 text-blue-600",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-3 text-left active:bg-muted transition-colors",
        !onClick && "cursor-default"
      )}
    >
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", colorMap[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label} • {sub}</p>
    </button>
  );
}
