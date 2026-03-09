import { todayTrip } from "../data/mockDeliveryData";
import { useNavigate } from "react-router-dom";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DH";

export default function CashSummaryScreen() {
  const navigate = useNavigate();
  const stopsWithCash = todayTrip.stops.filter((s) => s.cashCollection);

  const totalCollected = stopsWithCash.reduce((s, stop) => s + (stop.cashCollection?.collectedAmount ?? 0), 0);
  const totalExpected = stopsWithCash.reduce((s, stop) => s + (stop.cashCollection?.invoiceAmount ?? 0), 0);

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-6">
      <h1 className="text-lg font-bold">💰 Caisse</h1>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Encaissé</p>
          <p className="text-lg font-bold text-primary">{currency(totalCollected)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Écart</p>
          <p className={`text-lg font-bold ${totalCollected - totalExpected < 0 ? "text-destructive" : "text-primary"}`}>
            {currency(totalCollected - totalExpected)}
          </p>
        </div>
      </div>

      {/* Per-stop breakdown */}
      <div className="space-y-2">
        {stopsWithCash.map((stop) => {
          const c = stop.cashCollection!;
          const diff = c.collectedAmount - c.invoiceAmount;
          return (
            <button
              key={stop.id}
              onClick={() => navigate(`/delivery/stop/${stop.id}`)}
              className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                {stop.sequence}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{stop.customerName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {c.method === "cash" ? "💵 Espèces" : c.method === "check" ? "📝 Chèque" : "🏦 Virement"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{currency(c.collectedAmount)}</p>
                {diff !== 0 && (
                  <p className={`text-[10px] font-medium ${diff < 0 ? "text-destructive" : "text-primary"}`}>
                    {diff > 0 ? "+" : ""}{currency(diff)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {stopsWithCash.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun encaissement</p>
      )}
    </div>
  );
}
