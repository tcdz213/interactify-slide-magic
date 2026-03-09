import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ALERT_PRIORITY_STYLES } from "../constants";

interface Props {
  alerts: any[];
  unreadCount: number;
}

export default function AlertsFeed({ alerts, unreadCount }: Props) {
  const { t } = useTranslation();
  return (
    <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{t("notifications.alerts")}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        </div>
        <Link to="/bi/alerts" className="text-[11px] font-medium text-primary hover:underline">{t("dashboard.viewAll")} →</Link>
      </div>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("notifications.noAlerts")}</p>
        ) : (
          alerts.slice(0, 4).map((alert) => (
            <Link key={alert.id} to="/bi/alerts" className={`block border-l-2 rounded-r-lg px-3 py-2.5 ${ALERT_PRIORITY_STYLES[alert.priority] ?? "border-l-muted bg-muted/5"} hover:opacity-90`}>
              <p className={`text-xs font-medium leading-relaxed ${!alert.isRead ? "text-foreground" : "text-muted-foreground"}`}>{alert.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{alert.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {alert.timestamp}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
