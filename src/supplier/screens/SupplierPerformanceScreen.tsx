import { Star, TrendingUp, Truck, ShieldCheck, RotateCcw, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supplierPerformance, SUPPLIER_PROFILE } from "../data/mockSupplierData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function SupplierPerformanceScreen() {
  const perf = supplierPerformance;

  const metrics = [
    { icon: Truck, label: "Livraison à temps", value: `${perf.onTimeDeliveryRate}%`, target: `${perf.contractTargets.onTime}%`, pct: perf.onTimeDeliveryRate, ok: perf.onTimeDeliveryRate >= perf.contractTargets.onTime },
    { icon: ShieldCheck, label: "Conformité qualité", value: `${perf.qualityConformityRate}%`, target: `${perf.contractTargets.quality}%`, pct: perf.qualityConformityRate, ok: perf.qualityConformityRate >= perf.contractTargets.quality },
    { icon: TrendingUp, label: "Taux d'acceptation", value: `${perf.acceptanceRate}%`, target: `${perf.contractTargets.acceptance}%`, pct: perf.acceptanceRate, ok: perf.acceptanceRate >= perf.contractTargets.acceptance },
    { icon: RotateCcw, label: "Taux de retour", value: `${perf.returnRate}%`, target: "< 3%", pct: 100 - perf.returnRate * 10, ok: perf.returnRate < 3 },
    { icon: Clock, label: "Délai moyen livraison", value: `${perf.avgDeliveryDays}j`, target: "< 5j", pct: Math.max(0, 100 - (perf.avgDeliveryDays / 7) * 100), ok: perf.avgDeliveryDays <= 5 },
  ];

  return (
    <div className="p-4 space-y-4 pb-6">
      <h1 className="text-lg font-bold">Performance</h1>

      {/* Global Score */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Star className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-3xl font-bold">{SUPPLIER_PROFILE.rating}<span className="text-lg text-muted-foreground">/5</span></p>
          <p className="text-xs text-muted-foreground">Score global fournisseur</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">{m.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold", m.ok ? "text-emerald-600" : "text-amber-600")}>{m.value}</span>
                <span className="text-[10px] text-muted-foreground">obj. {m.target}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", m.ok ? "bg-emerald-500" : "bg-amber-500")}
                style={{ width: `${Math.min(100, m.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Évolution des commandes</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perf.monthlyOrders}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, "Commandes"]} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality Claims */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
          <h2 className="text-sm font-semibold">Réclamations qualité</h2>
        </div>
        <div className="divide-y divide-border">
          {perf.qualityClaims.map((claim) => (
            <div key={claim.id} className="px-4 py-3 flex items-center gap-3">
              {claim.status === "Open" ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{claim.description}</p>
                <p className="text-[10px] text-muted-foreground">{claim.id} · {new Date(claim.date).toLocaleDateString("fr-FR")}</p>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                claim.status === "Open" ? "bg-amber-500/15 text-amber-700" : "bg-emerald-500/15 text-emerald-700"
              )}>
                {claim.status === "Open" ? "Ouvert" : "Résolu"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
