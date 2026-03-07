import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders, REP_PROFILE } from "@/mobile/data/mockSalesData";
import { ArrowLeft, LogOut, ClipboardList, WifiOff, Settings, User, ChevronRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPendingActions } from "@/services/offlineSync";
import { useTranslation } from "react-i18next";

const currency = (v: number) => v.toLocaleString("fr-DZ", { maximumFractionDigits: 0 }) + " DZD";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Pending: "bg-amber-500/10 text-amber-700",
  Approved: "bg-blue-500/10 text-blue-700",
  Rejected: "bg-destructive/10 text-destructive",
  Picking: "bg-purple-500/10 text-purple-700",
  Shipped: "bg-cyan-500/10 text-cyan-700",
  Delivered: "bg-emerald-500/10 text-emerald-700",
  Cancelled: "bg-muted text-muted-foreground",
};

export default function MobileMoreScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getPendingActions().then(items => setPendingCount(items.length));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mobile_auth");
    navigate("/mobile/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-foreground">{t("mobile.more.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">{REP_PROFILE.avatar}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{REP_PROFILE.name}</p>
            <p className="text-xs text-muted-foreground">Zone: {REP_PROFILE.zone}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            {t("mobile.more.recentOrders")}
          </h3>
          <div className="space-y-2">
            {mockOrders.map(o => (
              <div key={o.id} className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{o.id}</span>
                  <Badge className={cn("text-[10px] border-0", STATUS_COLORS[o.status])}>{o.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-foreground">{o.customerName}</span>
                  <span className="text-sm font-semibold">{currency(o.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {[
            { icon: History, label: t("mobile.more.orderHistory"), onClick: () => navigate("/mobile/orders") },
            { icon: WifiOff, label: t("mobile.more.offlineQueue"), badge: String(pendingCount), onClick: () => navigate("/mobile/offline-queue") },
            { icon: Settings, label: t("mobile.more.settings") },
            { icon: User, label: t("mobile.more.myProfile") },
          ].map(({ icon: Icon, label, badge, onClick }) => (
            <button key={label} onClick={onClick} className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-3 active:bg-muted transition-colors">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1 text-left">{label}</span>
              {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-destructive font-semibold text-sm py-3 active:opacity-70 min-h-[48px]">
          <LogOut className="h-4 w-4" />
          {t("mobile.more.logout")}
        </button>
      </div>
    </div>
  );
}
