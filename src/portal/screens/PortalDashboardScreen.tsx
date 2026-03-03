import { useNavigate } from "react-router-dom";
import { ShoppingCart, FileText, Bell, TrendingUp, Package } from "lucide-react";
import CreditGauge from "../components/CreditGauge";
import PortalStatusBadge from "../components/PortalStatusBadge";
import { PORTAL_CUSTOMER, portalOrders, portalInvoices, portalNotifications } from "../data/mockPortalData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
};

export default function PortalDashboardScreen() {
  const navigate = useNavigate();
  const now = new Date();
  const greeting = now.getHours() < 12 ? "☀️ Bonjour" : now.getHours() < 18 ? "🌤 Bon après-midi" : "🌙 Bonsoir";
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

  const recentOrders = portalOrders.slice(0, 3);
  const pendingInvoices = portalInvoices.filter((i) => i.balance > 0);
  const pendingTotal = pendingInvoices.reduce((s, i) => s + i.balance, 0);
  const unreadNotifs = portalNotifications.filter((n) => !n.read);

  return (
    <div className="p-4 space-y-4 pb-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold">{greeting}, {PORTAL_CUSTOMER.name}</h1>
        <p className="text-xs text-muted-foreground capitalize">{dateStr}</p>
      </div>

      {/* Credit Gauge */}
      <CreditGauge used={PORTAL_CUSTOMER.creditUsed} limit={PORTAL_CUSTOMER.creditLimit} />

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: ShoppingCart, label: "Commandes", value: String(portalOrders.length), color: "text-primary", onClick: () => navigate("/portal/orders") },
          { icon: FileText, label: "Factures dues", value: currency(pendingTotal), color: pendingTotal > 0 ? "text-destructive" : "text-primary", onClick: () => navigate("/portal/invoices") },
        ].map((kpi) => (
          <button
            key={kpi.label}
            onClick={kpi.onClick}
            className="rounded-xl border border-border bg-card p-3 text-left hover:bg-muted/50 transition-colors"
          >
            <kpi.icon className={`h-4 w-4 ${kpi.color} mb-1`} />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Package className="h-4 w-4 text-muted-foreground" /> Dernières commandes
          </h2>
          <button onClick={() => navigate("/portal/orders")} className="text-xs text-primary hover:underline">
            Voir tout →
          </button>
        </div>
        <div className="space-y-2">
          {recentOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate(`/portal/orders/${o.id}`)}
              className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-medium">{o.id}</p>
                <p className="text-[10px] text-muted-foreground">{currency(o.totalAmount)} · {o.lines.length} art.</p>
                {o.eta && <p className="text-[10px] text-primary font-medium">ETA: {o.eta}</p>}
              </div>
              <PortalStatusBadge status={o.status} />
            </button>
          ))}
        </div>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" /> Factures en attente
            </h2>
            <button onClick={() => navigate("/portal/invoices")} className="text-xs text-primary hover:underline">
              Voir tout →
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{pendingInvoices.length} facture(s) · {currency(pendingTotal)}</p>
          </div>
        </div>
      )}

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <button
          onClick={() => navigate("/portal/notifications")}
          className="w-full rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 flex items-center gap-3 text-left"
        >
          <Bell className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{unreadNotifs.length} notification(s)</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-500">{unreadNotifs[0]?.title}</p>
          </div>
        </button>
      )}

      {/* Place Order CTA */}
      <button
        onClick={() => navigate("/portal/place-order")}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <ShoppingCart className="h-4 w-4" /> Passer une commande
      </button>
    </div>
  );
}
