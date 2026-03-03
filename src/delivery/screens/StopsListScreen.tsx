import { todayTrip } from "../data/mockDeliveryData";
import { StopStatusBadge } from "../components/DeliveryComponents";
import { useNavigate } from "react-router-dom";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DH";

export default function StopsListScreen() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-3 animate-fade-in pb-6">
      <h1 className="text-lg font-bold">Tous les arrêts</h1>
      {todayTrip.stops.map((stop) => (
        <button
          key={stop.id}
          onClick={() => navigate(`/delivery/stop/${stop.id}`)}
          className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
            {stop.sequence}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{stop.customerName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{stop.address}</p>
          </div>
          <StopStatusBadge status={stop.status} />
        </button>
      ))}
    </div>
  );
}
