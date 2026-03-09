import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { todayTrip } from "../data/mockDeliveryData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DH";

export default function EndOfDayScreen() {
  const navigate = useNavigate();
  const trip = todayTrip;

  const delivered = trip.stops.filter((s) => s.status === "delivered" || s.status === "partially_delivered").length;
  const refused = trip.stops.filter((s) => s.status === "refused").length;
  const pending = trip.stops.filter((s) => s.status === "pending" || s.status === "in_progress").length;

  // Cash breakdown
  const cashTotal = trip.stops
    .filter((s) => s.cashCollection?.method === "cash")
    .reduce((s, stop) => s + (stop.cashCollection?.collectedAmount ?? 0), 0);
  const checkTotal = trip.stops
    .filter((s) => s.cashCollection?.method === "check")
    .reduce((s, stop) => s + (stop.cashCollection?.collectedAmount ?? 0), 0);
  const totalCollected = trip.totalCollected;
  const shortage = totalCollected - trip.totalExpectedAmount;

  // Returns
  const returnLines = trip.stops
    .flatMap((s) => s.deliveryResult?.lines ?? [])
    .filter((l) => l.returnedQty > 0);

  const handleClose = () => {
    toast({ title: "✅ Journée clôturée", description: "Bon repos !" });
    localStorage.removeItem("delivery_auth");
    navigate("/delivery/login", { replace: true });
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-6">
      <div>
        <h1 className="text-lg font-bold">Fin de journée</h1>
        <p className="text-xs text-muted-foreground">
          {new Date(trip.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold">{trip.stops.length}</p>
          <p className="text-[10px] text-muted-foreground">Arrêts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{delivered}</p>
          <p className="text-[10px] text-muted-foreground">Livrés</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{refused}</p>
          <p className="text-[10px] text-muted-foreground">Retours</p>
        </div>
      </div>

      {pending > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
          ⚠️ {pending} arrêt(s) non effectué(s)
        </div>
      )}

      {/* Cash summary */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold">💰 Encaissements</h2>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Espèces</span>
            <span>{currency(cashTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chèques</span>
            <span>{currency(checkTotal)}</span>
          </div>
          <div className="border-t border-border/50 pt-1 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{currency(totalCollected)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Attendu</span>
            <span>{currency(trip.totalExpectedAmount)}</span>
          </div>
          {shortage !== 0 && (
            <div className={`flex justify-between text-sm font-semibold ${shortage < 0 ? "text-destructive" : "text-primary"}`}>
              <span>Écart</span>
              <span>{shortage > 0 ? "+" : ""}{currency(shortage)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Returns */}
      {returnLines.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h2 className="text-sm font-semibold">↩️ Retours</h2>
          {returnLines.map((l, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{l.returnedQty}x {l.productName}</span>
              <span className="text-[10px] text-destructive">{l.returnReason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Trip stats */}
      <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground">🚚 Km départ</p>
          <p className="text-sm font-semibold">{trip.startKm?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">⏱️ Début</p>
          <p className="text-sm font-semibold">{trip.startedAt ? new Date(trip.startedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
        </div>
      </div>

      <Button onClick={handleClose} className="w-full min-h-14 text-base" variant="destructive">
        Clôturer journée ✅
      </Button>
    </div>
  );
}
