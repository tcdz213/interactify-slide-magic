import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  BarChart3,
  Building2,
  Truck,
  CreditCard,
  UserPlus,
  Percent,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  OWNER_PROFILE,
  ownerSaaSKpis as k,
  mrrHistory,
  planDistribution,
  allSubscribers,
  ownerAlerts,
} from "../data/mockOwnerData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const shortCurrency = (v: number) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return String(v);
};

const SEVERITY_STYLES = {
  critical: "border-destructive/30 bg-destructive/5 text-destructive",
  warning: "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 text-[hsl(var(--warning))]",
  info: "border-[hsl(var(--info))]/30 bg-[hsl(var(--info))]/5 text-[hsl(var(--info))]",
};

export default function OwnerDashboardScreen() {
  const navigate = useNavigate();
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  // City distribution for bar chart
  const cityData = allSubscribers
    .filter(s => s.status === "active" || s.status === "trial")
    .reduce<Record<string, number>>((acc, s) => {
      acc[s.city] = (acc[s.city] || 0) + 1;
      return acc;
    }, {});
  const cityChart = Object.entries(cityData).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold">{greeting}, {OWNER_PROFILE.name}</h1>
          <p className="text-xs text-muted-foreground">
            {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" · "}Plateforme SaaS Jawda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            👑 Fondateur
          </span>
        </div>
      </div>

      {/* Primary SaaS KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: DollarSign, label: "MRR", value: currency(k.mrr),
            sub: `+${k.mrrGrowthPct}% vs mois dernier`,
            color: "text-primary", bg: "bg-primary/10",
          },
          {
            icon: Users, label: "Abonnés actifs", value: String(k.activeSubscribers),
            sub: `${k.totalEntrepots} entrepôts · ${k.totalFournisseurs} fournisseurs`,
            color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10",
          },
          {
            icon: UserPlus, label: "Nouveaux ce mois", value: String(k.newSubscribersThisMonth),
            sub: `${k.trialCount} en trial · ${k.pendingOnboarding} en attente`,
            color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10",
          },
          {
            icon: Percent, label: "Churn", value: `${k.churnRate}%`,
            sub: `ARPU : ${currency(k.arpu)}`,
            color: k.churnRate > 5 ? "text-destructive" : "text-[hsl(var(--warning))]",
            bg: k.churnRate > 5 ? "bg-destructive/10" : "bg-[hsl(var(--warning))]/10",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-3 md:p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className={`h-8 w-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-sm md:text-base font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Critical Alerts */}
      {ownerAlerts.filter((a) => a.severity === "critical").length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Alertes critiques
          </h2>
          {ownerAlerts
            .filter((a) => a.severity === "critical")
            .map((alert) => (
              <div key={alert.id} className={`rounded-xl border p-3 flex items-start gap-3 ${SEVERITY_STYLES[alert.severity]}`}>
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{alert.title}</p>
                  <p className="text-[10px] opacity-80">{alert.description}</p>
                  <p className="text-[9px] opacity-60 mt-0.5">{alert.module}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* MRR Chart + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Évolution MRR (7 mois)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrHistory}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => shortCurrency(v)} className="fill-muted-foreground" />
                <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#mrrGrad)" strokeWidth={2} name="MRR Total" />
                <Area type="monotone" dataKey="entrepots" stroke="hsl(var(--info))" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Entrepôts" />
                <Area type="monotone" dataKey="fournisseurs" stroke="hsl(var(--warning))" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Fournisseurs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Répartition par plan</h3>
          <div className="h-40 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="count" nameKey="plan" strokeWidth={2} stroke="hsl(var(--card))">
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {planDistribution.map((p) => (
              <div key={p.plan} className="flex items-center gap-2 text-[11px]">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="flex-1 text-muted-foreground">{p.plan}</span>
                <span className="font-semibold">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Building2, label: "Entrepôts", value: String(k.totalEntrepots) },
          { icon: Truck, label: "Fournisseurs", value: String(k.totalFournisseurs) },
          { icon: Activity, label: "Commandes totales", value: shortCurrency(k.platformOrders) },
          { icon: CreditCard, label: "GMV plateforme", value: shortCurrency(k.platformGmv) },
          { icon: AlertTriangle, label: "Tickets ouverts", value: String(k.openTickets), warn: k.openTickets > 3 },
          { icon: UserPlus, label: "Trials actifs", value: String(k.trialCount), warn: k.trialCount > 0 },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-3 text-center space-y-1">
            <item.icon className={`h-4 w-4 mx-auto ${item.warn ? "text-[hsl(var(--warning))]" : "text-muted-foreground"}`} />
            <p className={`text-sm font-bold ${item.warn ? "text-[hsl(var(--warning))]" : ""}`}>{item.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>

      {/* City Distribution + Quick Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Abonnés par ville</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis dataKey="city" type="category" tick={{ fontSize: 10 }} width={110} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Abonnés" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Accès rapide</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Abonnements", path: "/owner/subscriptions", icon: Users },
              { label: "Facturation", path: "/owner/billing", icon: CreditCard },
              { label: "Onboarding", path: "/owner/onboarding", icon: UserPlus },
              { label: "Monitoring", path: "/owner/monitoring", icon: Activity },
              { label: "Support", path: "/owner/support", icon: AlertTriangle },
              { label: "Paramètres", path: "/owner/settings", icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 rounded-lg border border-border p-2.5 hover:bg-muted transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium">{item.label}</span>
                <ArrowUpRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All Alerts */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Toutes les alertes</h3>
          <span className="text-[10px] text-muted-foreground">{ownerAlerts.length} alertes</span>
        </div>
        <div className="space-y-2">
          {ownerAlerts.map((alert) => (
            <div key={alert.id} className={`rounded-lg border p-2.5 flex items-start gap-2.5 text-xs ${SEVERITY_STYLES[alert.severity]}`}>
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{alert.title}</span>
                <span className="text-[10px] opacity-70 ml-2">{alert.module}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
