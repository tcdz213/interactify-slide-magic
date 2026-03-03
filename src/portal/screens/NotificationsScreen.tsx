import { useState } from "react";
import { portalNotifications } from "../data/mockPortalData";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const TYPE_ICONS: Record<string, string> = {
  order_status: "📦",
  invoice_issued: "🧾",
  invoice_due: "⚠️",
  payment_received: "💰",
  return_status: "↩️",
  credit_warning: "💳",
};

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(portalNotifications);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "✅ Toutes lues" });
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>
            <Check className="h-3 w-3 mr-1" /> Tout lire
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
              if (n.actionUrl) navigate(n.actionUrl);
            }}
            className={`w-full rounded-xl border p-3 text-left transition-colors ${
              n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
            } hover:bg-muted/50`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{TYPE_ICONS[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
