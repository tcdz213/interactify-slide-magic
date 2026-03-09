/**
 * Phase 6 — Activity Timeline: real-time feed of recent system events.
 */
import { useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Truck, AlertTriangle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  icon: typeof Package;
  color: string;
  title: string;
  detail: string;
  time: string;
}

export default function ActivityTimeline() {
  const { salesOrders, deliveryTrips, alerts } = useWMSData();
  const { t } = useTranslation();

  const events = useMemo<TimelineEvent[]>(() => {
    const items: TimelineEvent[] = [];

    // Recent orders
    for (const o of salesOrders.slice(-3)) {
      items.push({
        id: `order-${o.id}`,
        icon: ShoppingCart,
        color: "text-info",
        title: `${t("dashboard.orders", "Commande")} ${o.id}`,
        detail: `${o.customerName} — ${o.status}`,
        time: o.orderDate ?? "",
      });
    }

    // Recent deliveries
    for (const d of deliveryTrips.slice(-2)) {
      items.push({
        id: `trip-${d.id}`,
        icon: Truck,
        color: "text-primary",
        title: `${t("dashboard.deliveriesInProgress", "Livraison")} ${d.id}`,
        detail: `${d.driverName} — ${d.status}`,
        time: d.date ?? "",
      });
    }

    // Recent alerts
    for (const a of alerts.filter((al: any) => !al.isRead).slice(0, 2)) {
      items.push({
        id: `alert-${a.id}`,
        icon: AlertTriangle,
        color: "text-warning",
        title: a.title,
        detail: a.message,
        time: a.timestamp ?? "",
      });
    }

    return items.sort((a, b) => (b.time || "").localeCompare(a.time || "")).slice(0, 6);
  }, [salesOrders, deliveryTrips, alerts, t]);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("dashboard.activityTimeline", "Activité récente")}</h3>
      </div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">{t("common.noResults")}</p>
          ) : (
            events.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-start gap-3 relative"
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card border border-border z-10 ${ev.color}`}>
                  <ev.icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{ev.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{ev.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                  {formatDate(ev.time)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
