import { useState } from "react";
import { Bell, ClipboardList, CreditCard, AlertTriangle, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { supplierNotifications } from "../data/mockSupplierData";
import type { SupplierNotification } from "../types/supplier";

const TYPE_META: Record<SupplierNotification["type"], { icon: React.ElementType; color: string }> = {
  po: { icon: ClipboardList, color: "text-primary bg-primary/10" },
  payment: { icon: CreditCard, color: "text-emerald-600 bg-emerald-500/10" },
  quality: { icon: AlertTriangle, color: "text-amber-600 bg-amber-500/10" },
  info: { icon: Info, color: "text-blue-600 bg-blue-500/10" },
};

export default function SupplierNotificationsScreen() {
  const [notifs, setNotifs] = useState(supplierNotifications);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notifications
          {unread > 0 && (
            <span className="ml-1 text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary flex items-center gap-1 hover:underline">
            <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.map((n) => {
          const meta = TYPE_META[n.type];
          const Icon = meta.icon;
          return (
            <button
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className={cn(
                "w-full rounded-xl border bg-card p-3.5 flex items-start gap-3 text-left transition-colors",
                n.read ? "border-border opacity-70" : "border-primary/20 bg-primary/[0.02]"
              )}
            >
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", meta.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-medium truncate", !n.read && "font-semibold")}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
