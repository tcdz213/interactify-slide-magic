import { useNavigate } from "react-router-dom";
import { LogOut, AlertTriangle, ClipboardCheck, MapPin, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQueueStats } from "../services/deliverySyncEngine";
import { useTranslation } from "react-i18next";

export default function DeliveryMoreScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const stats = getQueueStats();
  const isOnline = navigator.onLine;

  const handleLogout = () => {
    localStorage.removeItem("delivery_auth");
    navigate("/delivery/login", { replace: true });
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold">{t("delivery.more.title")}</h1>

      <div className="space-y-2">
        <button
          onClick={() => navigate("/delivery/end-of-day")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("delivery.more.endOfDay")}</p>
            <p className="text-[10px] text-muted-foreground">{t("delivery.more.endOfDayDesc")}</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/delivery/incident")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("delivery.more.reportIncident")}</p>
            <p className="text-[10px] text-muted-foreground">{t("delivery.more.incidentDesc")}</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/delivery/map")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("delivery.more.tripMap")}</p>
            <p className="text-[10px] text-muted-foreground">{t("delivery.more.tripMapDesc")}</p>
          </div>
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          {isOnline ? t("delivery.more.online") : t("delivery.more.offline")}
        </h2>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("delivery.more.pendingSync")}</span>
          <span className="font-medium">{stats.pending}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("delivery.more.totalSynced")}</span>
          <span className="font-medium">{stats.synced}</span>
        </div>
      </div>

      <Button variant="outline" onClick={handleLogout} className="w-full text-destructive border-destructive/30">
        <LogOut className="h-4 w-4 mr-2" /> {t("delivery.more.logout")}
      </Button>
    </div>
  );
}
