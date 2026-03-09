import { useState } from "react";
import { mockRoutePlan, REP_PROFILE, type RoutePlan } from "@/mobile/data/mockSalesData";
import { ArrowLeft, MapPin, CheckCircle2, Circle, Clock, Navigation, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useGPS } from "@/mobile/hooks/useGPS";
import { logCheckIn, logCheckOut, getActiveVisit } from "@/mobile/services/visitLogService";

export default function MobileRouteScreen() {
  const navigate = useNavigate();
  const [route, setRoute] = useState<RoutePlan[]>(mockRoutePlan);
  const { getPosition, loading: gpsLoading } = useGPS();
  const [activeVisitIds, setActiveVisitIds] = useState<Record<string, string>>({});

  const completed = route.filter(r => r.checkedOut).length;
  const total = route.length;

  const handleCheckIn = async (stop: RoutePlan) => {
    const gps = await getPosition();
    const visit = logCheckIn(stop.customerId, stop.customerName, REP_PROFILE.id, gps);
    setActiveVisitIds(prev => ({ ...prev, [stop.id]: visit.id }));
    setRoute(prev => prev.map(r => r.id === stop.id ? { ...r, checkedIn: true } : r));
    toast({ title: "📍 Check-in enregistré", description: gps ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "Sans GPS" });
    navigator.vibrate?.(50);
  };

  const handleCheckOut = async (stop: RoutePlan) => {
    const gps = await getPosition();
    const visitId = activeVisitIds[stop.id] || getActiveVisit(stop.customerId)?.id;
    if (visitId) {
      logCheckOut(visitId, gps);
    }
    setRoute(prev => prev.map(r => r.id === stop.id ? { ...r, checkedOut: true } : r));
    toast({ title: "✅ Visite terminée" });
    navigator.vibrate?.(50);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-bold text-foreground">Tournée du jour</h1>
          <p className="text-xs text-muted-foreground">{completed}/{total} visites effectuées</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>

      {/* Route list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {route.map((stop, i) => {
          const isDone = stop.checkedOut;
          const isActive = stop.checkedIn && !stop.checkedOut;
          const isPending = !stop.checkedIn;

          return (
            <div key={stop.id} className={cn(
              "bg-card border rounded-xl p-4 transition-colors",
              isDone ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" :
              isActive ? "border-primary shadow-sm" : "border-border"
            )}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : isActive ? (
                    <Navigation className="h-5 w-5 text-primary animate-pulse" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                  {i < route.length - 1 && <div className="w-px h-6 bg-border" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("font-semibold text-sm", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                      {stop.customerName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {stop.plannedTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{stop.address}</span>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => handleCheckIn(stop)}
                      disabled={gpsLoading}
                      className="mt-3 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-xs font-semibold w-full active:opacity-90 min-h-[44px] flex items-center justify-center gap-2"
                    >
                      {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "📍"} Check-in
                    </button>
                  )}
                  {isActive && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/mobile/new-order?customer=${stop.customerId}`)}
                        className="flex-1 bg-card border border-primary text-primary rounded-lg px-3 py-2.5 text-xs font-semibold active:bg-primary/10 min-h-[44px]"
                      >
                        🛒 Commander
                      </button>
                      <button
                        onClick={() => handleCheckOut(stop)}
                        disabled={gpsLoading}
                        className="flex-1 bg-primary text-primary-foreground rounded-lg px-3 py-2.5 text-xs font-semibold active:opacity-90 min-h-[44px] flex items-center justify-center gap-2"
                      >
                        {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "✅"} Check-out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
