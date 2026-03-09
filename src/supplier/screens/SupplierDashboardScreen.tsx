import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Truck,
  FileText,
  Star,
  Clock,
  TrendingUp,
  AlertTriangle,
  Bell,
  ArrowRight,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  SUPPLIER_PROFILE,
  supplierPOs,
  supplierInvoices,
  supplierDeliveries,
  supplierNotifications,
} from "../data/mockSupplierData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-warning/15 text-[hsl(var(--warning))]",
  Confirmed: "bg-info/15 text-[hsl(var(--info))]",
  Shipped: "bg-primary/15 text-primary",
  Delivered: "bg-success/15 text-[hsl(var(--success))]",
  Rejected: "bg-destructive/15 text-destructive",
};

export default function SupplierDashboardScreen() {
  const navigate = useNavigate();
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // KPI calculations
  const activePOs = supplierPOs.filter((po) => ["Pending", "Confirmed", "Shipped"].includes(po.status));
  const deliveredThisMonth = supplierPOs.filter(
    (po) => po.status === "Delivered" && new Date(po.createdAt).getMonth() === now.getMonth()
  );
  const pendingPayment = supplierInvoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.balance, 0);
  const inTransit = supplierDeliveries.filter((d) => d.status === "InTransit");
  const unreadNotifs = supplierNotifications.filter((n) => !n.read);
  const pendingConfirm = supplierPOs.filter((po) => po.status === "Pending");

  const kpis = [
    {
      icon: ClipboardList,
      label: "Commandes actives",
      value: String(activePOs.length),
      sub: `${pendingConfirm.length} à confirmer`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckCircle2,
      label: "Livrées ce mois",
      value: String(deliveredThisMonth.length),
      sub: `sur ${supplierPOs.length} total`,
      color: "text-[hsl(var(--success))]",
      bgColor: "bg-[hsl(var(--success))]/10",
    },
    {
      icon: FileText,
      label: "En attente paiement",
      value: currency(pendingPayment),
      sub: `${supplierInvoices.filter((i) => i.status !== "Paid").length} factures`,
      color: pendingPayment > 0 ? "text-[hsl(var(--warning))]" : "text-primary",
      bgColor: pendingPayment > 0 ? "bg-[hsl(var(--warning))]/10" : "bg-primary/10",
    },
    {
      icon: Star,
      label: "Score qualité",
      value: `${SUPPLIER_PROFILE.rating}/5`,
      sub: "Note fournisseur",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-lg font-bold">
          {greeting}, {SUPPLIER_PROFILE.contactName}
        </h1>
        <p className="text-xs text-muted-foreground capitalize">{dateStr}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-3 space-y-1"
          >
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </p>
            <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Urgent Actions */}
      {pendingConfirm.length > 0 && (
        <button
          onClick={() => navigate("/supplier/orders")}
          className="w-full rounded-xl border-2 border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-3 flex items-center gap-3 text-left transition-colors hover:bg-[hsl(var(--warning))]/10"
        >
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))] shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold">
              {pendingConfirm.length} commande{pendingConfirm.length > 1 ? "s" : ""} à confirmer
            </p>
            <p className="text-[10px] text-muted-foreground">
              Action requise avant 48h
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* In Transit */}
      {inTransit.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold">
              {inTransit.length} livraison{inTransit.length > 1 ? "s" : ""} en transit
            </p>
            <p className="text-[10px] text-muted-foreground">
              {inTransit.map((d) => d.poId).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Recent POs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Package className="h-4 w-4 text-muted-foreground" /> Dernières commandes
          </h2>
          <button
            onClick={() => navigate("/supplier/orders")}
            className="text-xs text-primary hover:underline"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-2">
          {supplierPOs.slice(0, 4).map((po) => (
            <div
              key={po.id}
              className="rounded-xl border border-border bg-card p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono font-medium">{po.id}</p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[po.status] || ""}`}
                  >
                    {po.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {currency(po.totalAmount)} · {po.warehouseName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-0.5" />
                  Livraison prévue : {formatDate(po.expectedDelivery)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <button
          onClick={() => navigate("/supplier/notifications")}
          className="w-full rounded-xl border border-[hsl(var(--info))]/30 bg-[hsl(var(--info))]/5 p-3 flex items-center gap-3 text-left"
        >
          <Bell className="h-5 w-5 text-[hsl(var(--info))]" />
          <div className="flex-1">
            <p className="text-xs font-semibold">
              {unreadNotifs.length} notification{unreadNotifs.length > 1 ? "s" : ""} non lue{unreadNotifs.length > 1 ? "s" : ""}
            </p>
            <p className="text-[10px] text-muted-foreground">{unreadNotifs[0]?.title}</p>
          </div>
        </button>
      )}

      {/* Performance Summary */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-muted-foreground" /> Performance
        </h2>
        <div className="space-y-2">
          {[
            { label: "Taux de livraison à temps", value: "92%", pct: 92 },
            { label: "Conformité qualité", value: "96%", pct: 96 },
            { label: "Taux d'acceptation", value: "88%", pct: 88 },
          ].map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-semibold">{metric.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${metric.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
