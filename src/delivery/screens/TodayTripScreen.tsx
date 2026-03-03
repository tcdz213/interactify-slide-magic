import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Clock } from "lucide-react";
import { todayTrip } from "../data/mockDeliveryData";
import { StopStatusBadge, DeliveryProgressBar, SLABadge } from "../components/DeliveryComponents";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DH";

export default function TodayTripScreen() {
  const navigate = useNavigate();
  const trip = todayTrip;
  const delivered = trip.stops.filter((s) => s.status === "delivered" || s.status === "partially_delivered").length;
  const refused = trip.stops.filter((s) => s.status === "refused").length;

  return (
    <div className="p-4 space-y-4 pb-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold">Ma tournée</h1>
        <p className="text-xs text-muted-foreground">
          {new Date(trip.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" })} · {trip.stops.length} arrêts
        </p>
      </div>

      {/* Progress */}
      <DeliveryProgressBar delivered={delivered} total={trip.stops.length} />

      {/* Stops list */}
      <div className="space-y-2">
        {trip.stops.map((stop) => {
          const isCurrent = stop.status === "in_progress";
          const isDone = stop.status === "delivered" || stop.status === "partially_delivered" || stop.status === "refused";

          return (
            <button
              key={stop.id}
              onClick={() => navigate(`/delivery/stop/${stop.id}`)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Sequence */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? stop.status === "refused"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {stop.sequence}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{stop.customerName}</p>
                    <StopStatusBadge status={stop.status} />
                  </div>

                  {stop.address && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {stop.address}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-1">
                    {stop.plannedTime && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {stop.plannedTime}
                      </span>
                    )}
                    <SLABadge plannedTime={stop.plannedTime} actualTime={stop.actualTime} />
                  </div>

                  {isCurrent && (
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> Naviguer
                      </span>
                    </div>
                  )}
                </div>

                {stop.cashCollection && (
                  <p className="text-xs font-semibold text-muted-foreground shrink-0">
                    {currency(stop.cashCollection.collectedAmount)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="rounded-xl border border-border bg-card p-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-primary">{delivered}</p>
          <p className="text-[10px] text-muted-foreground">Livré</p>
        </div>
        <div>
          <p className="text-lg font-bold text-destructive">{refused}</p>
          <p className="text-[10px] text-muted-foreground">Retours</p>
        </div>
        <div>
          <p className="text-lg font-bold">{currency(trip.totalCollected)}</p>
          <p className="text-[10px] text-muted-foreground">Encaissé</p>
        </div>
      </div>
    </div>
  );
}
