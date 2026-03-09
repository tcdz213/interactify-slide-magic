import { allSubscribers } from "../data/mockOwnerData";
import { cn } from "@/lib/utils";
import { Activity, Building2, Truck, ShoppingCart, Users, MapPin, Clock, TrendingUp } from "lucide-react";

const currency = (v: number) =>
  v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M DZD" : (v / 1_000).toFixed(0) + "K DZD";

const STATUS_DOT: Record<string, string> = {
  active: "bg-[hsl(var(--success))]",
  trial: "bg-[hsl(var(--info))]",
  suspended: "bg-destructive",
  pending: "bg-[hsl(var(--warning))]",
  cancelled: "bg-muted-foreground",
};

export default function OwnerMonitoringScreen() {
  const activeSubscribers = allSubscribers.filter(s => s.status === "active" || s.status === "trial");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-lg font-bold">Monitoring abonnés</h1>
        <p className="text-xs text-muted-foreground">{activeSubscribers.length} abonnés actifs sur la plateforme</p>
      </div>

      {/* Subscriber Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {allSubscribers.map((s) => (
          <div key={s.id} className={cn("rounded-xl border bg-card p-4 space-y-3 transition-colors", s.status === "suspended" ? "border-destructive/20 opacity-70" : "border-border")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", s.type === "entrepot" ? "bg-[hsl(var(--info))]/10" : "bg-[hsl(var(--warning))]/10")}>
                  {s.type === "entrepot" ? <Building2 className="h-4 w-4 text-[hsl(var(--info))]" /> : <Truck className="h-4 w-4 text-[hsl(var(--warning))]" />}
                </div>
                <div>
                  <p className="text-xs font-semibold">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />{s.city} · {s.sector}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn("h-2 w-2 rounded-full", STATUS_DOT[s.status])} />
                <span className="text-[9px] text-muted-foreground capitalize">{s.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ShoppingCart, label: "Commandes", value: s.totalOrders.toLocaleString() },
                { icon: Users, label: "Utilisateurs", value: `${s.userCount}/${s.maxUsers}` },
                { icon: TrendingUp, label: "CA", value: currency(s.totalRevenue) },
              ].map((m) => (
                <div key={m.label} className="text-center space-y-0.5">
                  <m.icon className="h-3 w-3 mx-auto text-muted-foreground" />
                  <p className="text-[10px] font-bold">{m.value}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Dernier accès : {s.lastActive ? new Date(s.lastActive).toLocaleDateString("fr-FR") : "—"}</span>
              <span className="font-medium capitalize px-1.5 py-0.5 rounded bg-muted">{s.plan}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
