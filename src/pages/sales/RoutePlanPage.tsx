/**
 * Route / Visit Plan Page
 * Level 1: List of sales agents (vendeurs) filtered by warehouse
 * Level 2: When an agent is selected, show their route plan with map & check-in/out
 */

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin, Navigation, Clock, CheckCircle2, LogIn, LogOut,
  List, Map as MapIcon, MessageSquare, Users, ArrowLeft,
  Phone, Target, TrendingUp, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useWMSData } from "@/contexts/WMSDataContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { currency } from "@/data/masterData";
import { salesAgents, agentRoutePlans, type SalesAgent } from "@/data/salesAgentsData";
import {
  getAllVisits, checkIn, checkOut, getActiveVisit, seedDemoVisits,
  type VisitLog,
} from "@/services/visitLogService";
import { enqueue } from "@/services/offlineSync";
import type { PlannedVisit } from "./RouteMapView";

const RouteMapView = lazy(() => import("./RouteMapView"));

/* ─────────────── Agent Card ─────────────── */
function AgentCard({ agent, onSelect }: { agent: SalesAgent; onSelect: () => void }) {
  const quotaPct = Math.round((agent.quotaCurrent / agent.quotaTarget) * 100);
  const visitPct = agent.visitsToday > 0 ? Math.round((agent.visitsDone / agent.visitsToday) * 100) : 0;

  return (
    <Card
      className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {agent.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{agent.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {agent.zone}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {agent.visitsDone}/{agent.visitsToday} visites
          </Badge>
        </div>

        <div className="mt-3 space-y-2">
          {/* Quota */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" /> Quota
              </span>
              <span className="font-medium">{quotaPct}%</span>
            </div>
            <Progress value={quotaPct} className="h-1.5" />
          </div>
          {/* Visits */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Visites
              </span>
              <span className="font-medium">{visitPct}%</span>
            </div>
            <Progress value={visitPct} className="h-1.5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {agent.phone}</span>
          <span className="font-medium">{currency(agent.quotaCurrent)} / {currency(agent.quotaTarget)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function RoutePlanPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { warehouses } = useWMSData();

  // Level 1 state
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<SalesAgent | null>(null);

  // Level 2 state
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [activeVisit, setActiveVisit] = useState<VisitLog | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [checkInDialogCustomer, setCheckInDialogCustomer] = useState<PlannedVisit | null>(null);
  const [checkOutDialogVisit, setCheckOutDialogVisit] = useState<VisitLog | null>(null);
  const [visitNotes, setVisitNotes] = useState("");

  const filteredAgents = useMemo(() => {
    if (warehouseFilter === "all") return salesAgents;
    return salesAgents.filter((a) => a.warehouseId === warehouseFilter);
  }, [warehouseFilter]);

  // Warehouse options from agents
  const warehouseOptions = useMemo(() => {
    const ids = [...new Set(salesAgents.map((a) => a.warehouseId))];
    return ids.map((id) => {
      const wh = warehouses.find((w) => w.id === id);
      return { id, label: wh?.name ?? id };
    });
  }, [warehouses]);

  // ─── Level 2 logic ───
  const plannedVisits = useMemo(
    () => (selectedAgent ? agentRoutePlans[selectedAgent.id] ?? [] : []),
    [selectedAgent],
  );

  const repId = selectedAgent?.id ?? currentUser?.id ?? "AGT-001";

  const refreshVisits = useCallback(() => {
    seedDemoVisits(repId);
    setVisits(getAllVisits());
    setActiveVisit(getActiveVisit(repId));
  }, [repId]);

  useEffect(() => {
    if (selectedAgent) refreshVisits();
  }, [selectedAgent, refreshVisits]);

  const completedIds = useMemo(
    () => new Set(visits.filter((v) => v.status === "completed").map((v) => v.customerId)),
    [visits],
  );

  const handleCheckIn = async (planned: PlannedVisit) => {
    try {
      const visit = await checkIn(planned.customerId, planned.name, repId, visitNotes);
      await enqueue({ type: "check_in", payload: { visitId: visit.id, customerId: planned.customerId } });
      toast({ title: t("routePlan.checkInSuccess"), description: t("routePlan.checkInDesc", { name: planned.name }) });
      setCheckInDialogCustomer(null);
      setVisitNotes("");
      refreshVisits();
    } catch (err) {
      toast({ title: t("routePlan.error"), description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleCheckOut = async () => {
    if (!checkOutDialogVisit) return;
    try {
      await checkOut(checkOutDialogVisit.id, visitNotes);
      await enqueue({ type: "check_out", payload: { visitId: checkOutDialogVisit.id } });
      toast({ title: t("routePlan.checkOutSuccess"), description: t("routePlan.checkOutDesc", { name: checkOutDialogVisit.customerName }) });
      setCheckOutDialogVisit(null);
      setVisitNotes("");
      refreshVisits();
    } catch (err) {
      toast({ title: t("routePlan.error"), description: (err as Error).message, variant: "destructive" });
    }
  };

  const todayVisits = visits.filter((v) => {
    const d = new Date(v.checkInTime);
    return d.toDateString() === new Date().toDateString();
  });
  const completedToday = todayVisits.filter((v) => v.status === "completed").length;

  /* ═══════════════ LEVEL 2: Agent Route Plan ═══════════════ */
  if (selectedAgent) {
    return (
      <div className="space-y-4">
        {/* Header with back */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedAgent(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Navigation className="h-6 w-6 text-primary" />
                {t("routePlan.routePlanTitle", { name: selectedAgent.name })}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}{t("routePlan.plannedVisits", { count: plannedVisits.length })} · {t("routePlan.completed", { count: completedToday })}
                {" · "}{selectedAgent.zone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeVisit && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse">
                <MapPin className="h-3 w-3 mr-1" />
                {t("routePlan.inVisit", { name: activeVisit.customerName })}
              </Badge>
            )}
            <div className="flex rounded-lg border overflow-hidden">
              <Button variant={view === "map" ? "default" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("map")}>
                <MapIcon className="h-4 w-4" />
              </Button>
              <Button variant={view === "list" ? "default" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.plannedVisitsCard")}</div><div className="text-2xl font-bold">{plannedVisits.length}</div></Card>
          <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.completedCard")}</div><div className="text-2xl font-bold text-emerald-600">{completedToday}</div></Card>
          <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.remainingCard")}</div><div className="text-2xl font-bold text-amber-600">{plannedVisits.length - completedToday}</div></Card>
          <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.completionRate")}</div><div className="text-2xl font-bold">{plannedVisits.length > 0 ? Math.round((completedToday / plannedVisits.length) * 100) : 0}%</div></Card>
        </div>

        <div className={cn("grid gap-4", view === "map" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1")}>
          {view === "map" && (
            <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ height: 480 }}>
              <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">{t("routePlan.loadingMap")}</div>}>
                <RouteMapView
                  plannedVisits={plannedVisits}
                  activeVisit={activeVisit}
                  completedIds={completedIds}
                  onCheckIn={(pv) => { setCheckInDialogCustomer(pv); setVisitNotes(""); }}
                  onCheckOut={(visit) => { setCheckOutDialogVisit(visit); setVisitNotes(""); }}
                />
              </Suspense>
            </div>
          )}

          <div className={cn(view === "map" ? "lg:col-span-1" : "")}>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{t("routePlan.todayVisits")}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {plannedVisits.map((pv) => {
                  const isActive = activeVisit?.customerId === pv.customerId;
                  const isDone = completedIds.has(pv.customerId);
                  const visitLog = visits.find((v) => v.customerId === pv.customerId);
                  return (
                    <div key={pv.customerId} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", isActive && "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30", isDone && "opacity-60")}>
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", isDone ? "bg-emerald-100 text-emerald-700" : isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : isActive ? <MapPin className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pv.name}</p>
                        <p className="text-xs text-muted-foreground">{pv.time} · {pv.zone}</p>
                        {visitLog?.duration && <p className="text-xs text-emerald-600">{visitLog.duration} min</p>}
                      </div>
                      {!isDone && !isActive && (
                        <Button size="sm" variant="outline" onClick={() => { setCheckInDialogCustomer(pv); setVisitNotes(""); }}><LogIn className="h-3 w-3" /></Button>
                      )}
                      {isActive && (
                        <Button size="sm" variant="destructive" onClick={() => { setCheckOutDialogVisit(activeVisit); setVisitNotes(""); }}><LogOut className="h-3 w-3" /></Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {todayVisits.filter((v) => v.status === "completed").length > 0 && (
              <Card className="mt-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />{t("routePlan.visitNotes")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {todayVisits.filter((v) => v.status === "completed").map((v) => (
                    <div key={v.id} className="text-xs border rounded-md p-2">
                      <p className="font-medium">{v.customerName}</p>
                      <p className="text-muted-foreground">{v.notes || t("routePlan.noNotes")}</p>
                      {v.orderIds.length > 0 && <Badge variant="secondary" className="mt-1 text-[10px]">{t("routePlan.ordersCount", { count: v.orderIds.length })}</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Check-in Dialog */}
        <Dialog open={!!checkInDialogCustomer} onOpenChange={(o) => !o && setCheckInDialogCustomer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><LogIn className="h-5 w-5 text-primary" />{t("routePlan.checkInTitle", { name: checkInDialogCustomer?.name })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("routePlan.checkInZone", { zone: checkInDialogCustomer?.zone, time: checkInDialogCustomer?.time })}</p>
              <div>
                <label className="text-sm font-medium">{t("routePlan.checkInNotes")}</label>
                <Textarea value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} placeholder={t("routePlan.checkInNotesPlaceholder")} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCheckInDialogCustomer(null)}>{t("routePlan.checkInCancel")}</Button>
              <Button onClick={() => checkInDialogCustomer && handleCheckIn(checkInDialogCustomer)}><MapPin className="h-4 w-4 mr-1" />{t("routePlan.checkInConfirm")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check-out Dialog */}
        <Dialog open={!!checkOutDialogVisit} onOpenChange={(o) => !o && setCheckOutDialogVisit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><LogOut className="h-5 w-5 text-destructive" />{t("routePlan.checkOutTitle", { name: checkOutDialogVisit?.customerName })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("routePlan.checkOutStart", { time: checkOutDialogVisit ? new Date(checkOutDialogVisit.checkInTime).toLocaleTimeString("fr-FR") : "" })}</p>
              <div>
                <label className="text-sm font-medium">{t("routePlan.checkOutNotes")}</label>
                <Textarea value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} placeholder={t("routePlan.checkOutNotesPlaceholder")} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCheckOutDialogVisit(null)}>{t("routePlan.checkOutCancel")}</Button>
              <Button variant="destructive" onClick={handleCheckOut}><CheckCircle2 className="h-4 w-4 mr-1" />{t("routePlan.checkOutConfirm")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ═══════════════ LEVEL 1: Agent List by Warehouse ═══════════════ */
  // Summary KPIs
  const totalAgents = filteredAgents.length;
  const totalVisits = filteredAgents.reduce((s, a) => s + a.visitsToday, 0);
  const totalDone = filteredAgents.reduce((s, a) => s + a.visitsDone, 0);
  const totalQuota = filteredAgents.reduce((s, a) => s + a.quotaCurrent, 0);
  const totalTarget = filteredAgents.reduce((s, a) => s + a.quotaTarget, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t("routePlan.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}{t("routePlan.agentCount", { count: totalAgents })} · {t("routePlan.visitCount", { done: totalDone, total: totalVisits })}
          </p>
        </div>

        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-[260px]">
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t("routePlan.filterWarehouse")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("routePlan.allWarehouses")}</SelectItem>
            {warehouseOptions.map((wh) => (
              <SelectItem key={wh.id} value={wh.id}>{wh.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.activeAgents")}</div><div className="text-2xl font-bold">{totalAgents}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.visitsCompleted")}</div><div className="text-2xl font-bold text-emerald-600">{totalDone}/{totalVisits}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.visitRate")}</div><div className="text-2xl font-bold">{totalVisits > 0 ? Math.round((totalDone / totalVisits) * 100) : 0}%</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">{t("routePlan.globalQuota")}</div><div className="text-2xl font-bold">{totalTarget > 0 ? Math.round((totalQuota / totalTarget) * 100) : 0}%</div></Card>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onSelect={() => setSelectedAgent(agent)} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t("routePlan.noAgents")}</p>
        </div>
      )}
    </div>
  );
}
