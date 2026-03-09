import { useState } from "react";
import { allSubscribers as initialData } from "../data/mockOwnerData";
import type { Subscriber, SubscriberType, SubscriptionStatus, SubscriptionPlan } from "../types/owner";
import { Search, Building2, Truck, MapPin, Users, MoreHorizontal, Plus, Eye, ArrowUpCircle, ArrowDownCircle, Pause, Play, XCircle, Mail, Download, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CreateSubscriberDialog from "../components/CreateSubscriberDialog";
import ChangePlanDialog from "../components/ChangePlanDialog";
import SubscriberDetailDrawer from "../components/SubscriberDetailDrawer";
import OwnerConfirmDialog from "../components/OwnerConfirmDialog";
import { exportSubscribersCSV, exportSubscribersPDF } from "../utils/ownerExport";

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  trial: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border-[hsl(var(--info))]/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
};
const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Actif", trial: "Trial", suspended: "Suspendu", cancelled: "Résilié", pending: "En attente",
};
const PLAN_STYLES: Record<string, string> = {
  enterprise: "bg-primary/10 text-primary",
  pro: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  standard: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  trial: "bg-muted text-muted-foreground",
  basic: "bg-muted text-muted-foreground",
};
const currency = (v: number) =>
  v === 0 ? "Gratuit" : new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

export default function OwnerSubscriptionsScreen() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([...initialData]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | SubscriberType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>("all");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailSub, setDetailSub] = useState<Subscriber | null>(null);
  const [planSub, setPlanSub] = useState<Subscriber | null>(null);
  const [planDir, setPlanDir] = useState<"upgrade" | "downgrade">("upgrade");
  const [confirmAction, setConfirmAction] = useState<{ sub: Subscriber; action: "suspend" | "reactivate" | "cancel" } | null>(null);

  const filtered = subscribers.filter((s) => {
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalMrr = subscribers.filter(s => s.status === "active").reduce((a, s) => a + s.monthlyFee, 0);
  const activeCount = subscribers.filter(s => s.status === "active").length;
  const trialCount = subscribers.filter(s => s.status === "trial").length;

  const updateSub = (id: string, patch: Partial<Subscriber>) => {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const handleCreate = (newSub: Subscriber) => {
    setSubscribers(prev => [newSub, ...prev]);
    toast({ title: "Abonné créé", description: `${newSub.name} ajouté en plan ${newSub.plan}.` });
  };

  const handleChangePlan = (id: string, newPlan: SubscriptionPlan) => {
    const fees: Record<SubscriptionPlan, number> = { trial: 0, standard: 45_000, pro: 85_000, enterprise: 150_000 };
    const limits: Record<SubscriptionPlan, { maxUsers: number; maxWarehouses: number }> = {
      trial: { maxUsers: 3, maxWarehouses: 1 }, standard: { maxUsers: 10, maxWarehouses: 1 },
      pro: { maxUsers: 25, maxWarehouses: 3 }, enterprise: { maxUsers: 999, maxWarehouses: 999 },
    };
    updateSub(id, { plan: newPlan, monthlyFee: fees[newPlan], ...limits[newPlan] });
    toast({ title: "Plan mis à jour", description: `Nouveau plan : ${newPlan}` });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { sub, action } = confirmAction;
    if (action === "suspend") {
      updateSub(sub.id, { status: "suspended" });
      toast({ title: "Abonné suspendu", description: `${sub.name} a été suspendu.` });
    } else if (action === "reactivate") {
      updateSub(sub.id, { status: "active" });
      toast({ title: "Abonné réactivé", description: `${sub.name} est de nouveau actif.` });
    } else if (action === "cancel") {
      updateSub(sub.id, { status: "cancelled" });
      toast({ title: "Abonné résilié", description: `${sub.name} a été résilié définitivement.` });
    }
    setConfirmAction(null);
  };

  const confirmTitle = confirmAction?.action === "suspend" ? "Suspendre l'abonné"
    : confirmAction?.action === "reactivate" ? "Réactiver l'abonné"
    : "Résilier l'abonné";
  const confirmDesc = confirmAction?.action === "suspend"
    ? `Êtes-vous sûr de vouloir suspendre ${confirmAction.sub.name} ? L'accès sera coupé immédiatement.`
    : confirmAction?.action === "reactivate"
    ? `Réactiver ${confirmAction?.sub.name} ? L'accès sera rétabli.`
    : `Êtes-vous sûr de vouloir résilier définitivement ${confirmAction?.sub.name} ? Cette action est irréversible.`;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">Gestion des abonnements</h1>
          <p className="text-xs text-muted-foreground">{subscribers.length} abonnés · {activeCount} actifs · MRR : {currency(totalMrr)}/mois</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5 mr-1" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { exportSubscribersCSV(filtered); toast({ title: "CSV exporté", description: `${filtered.length} abonnés exportés.` }); }}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { exportSubscribersPDF(filtered); toast({ title: "PDF exporté", description: `${filtered.length} abonnés exportés.` }); }}>
                <FileText className="h-3.5 w-3.5 mr-2" /> Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Nouvel abonné
          </Button>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: subscribers.length },
          { label: "Actifs", value: activeCount, color: "text-[hsl(var(--success))]" },
          { label: "Trials", value: trialCount, color: "text-[hsl(var(--info))]" },
          { label: "MRR", value: currency(totalMrr), color: "text-primary" },
        ].map(k => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-2.5 text-center">
            <p className={cn("text-sm font-bold", k.color)}>{k.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom ou ville…" className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        {(["all", "entrepot", "fournisseur"] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors", typeFilter === t ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:bg-muted")}>
            {t === "all" ? "Tous" : t === "entrepot" ? "🏪 Entrepôts" : "📦 Fournisseurs"}
          </button>
        ))}
        {(["all", "active", "trial", "suspended", "pending", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors", statusFilter === s ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:bg-muted")}>
            {s === "all" ? "Tous statuts" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Abonné</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Ville</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Mensuel</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Users</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Commandes</th>
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.contactName}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1">
                      {s.type === "entrepot" ? <Building2 className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                      {s.type === "entrepot" ? "Entrepôt" : "Fournisseur"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium capitalize", PLAN_STYLES[s.plan] || "bg-muted text-muted-foreground")}>{s.plan}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", STATUS_STYLES[s.status])}>{STATUS_LABELS[s.status]}</span>
                  </td>
                  <td className="px-3 py-3"><span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{s.city}</span></td>
                  <td className="px-3 py-3 text-right font-medium">{currency(s.monthlyFee)}</td>
                  <td className="px-3 py-3 text-right"><span className="flex items-center gap-0.5 justify-end"><Users className="h-3 w-3 text-muted-foreground" />{s.userCount}/{s.maxUsers}</span></td>
                  <td className="px-3 py-3 text-right font-medium">{s.totalOrders.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setDetailSub(s)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> Voir détail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {s.status === "active" && (
                          <>
                            <DropdownMenuItem onClick={() => { setPlanSub(s); setPlanDir("upgrade"); }}>
                              <ArrowUpCircle className="h-3.5 w-3.5 mr-2" /> Upgrader plan
                            </DropdownMenuItem>
                            {s.plan !== "trial" && (
                              <DropdownMenuItem onClick={() => { setPlanSub(s); setPlanDir("downgrade"); }}>
                                <ArrowDownCircle className="h-3.5 w-3.5 mr-2" /> Downgrader plan
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setConfirmAction({ sub: s, action: "suspend" })}>
                              <Pause className="h-3.5 w-3.5 mr-2" /> Suspendre
                            </DropdownMenuItem>
                          </>
                        )}
                        {s.status === "suspended" && (
                          <DropdownMenuItem onClick={() => setConfirmAction({ sub: s, action: "reactivate" })}>
                            <Play className="h-3.5 w-3.5 mr-2" /> Réactiver
                          </DropdownMenuItem>
                        )}
                        {s.status !== "cancelled" && (
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmAction({ sub: s, action: "cancel" })}>
                            <XCircle className="h-3.5 w-3.5 mr-2" /> Résilier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast({ title: "Email ouvert", description: `Mailto: ${s.contactEmail}` })}>
                          <Mail className="h-3.5 w-3.5 mr-2" /> Contacter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucun abonné trouvé</div>
        )}
      </div>

      {/* Dialogs */}
      <CreateSubscriberDialog open={createOpen} onOpenChange={setCreateOpen} onConfirm={handleCreate} />
      <ChangePlanDialog open={!!planSub} onOpenChange={(v) => !v && setPlanSub(null)} subscriber={planSub} direction={planDir} onConfirm={handleChangePlan} />
      <SubscriberDetailDrawer open={!!detailSub} onOpenChange={(v) => !v && setDetailSub(null)} subscriber={detailSub} />
      <OwnerConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={confirmAction?.action === "cancel" ? "Résilier définitivement" : confirmAction?.action === "suspend" ? "Suspendre" : "Réactiver"}
        variant={confirmAction?.action === "cancel" ? "destructive" : confirmAction?.action === "suspend" ? "destructive" : "default"}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
