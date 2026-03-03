import { useNavigate } from "react-router-dom";
import { LogOut, AlertTriangle, ClipboardCheck, MapPin, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQueueStats } from "../services/deliverySyncEngine";

export default function DeliveryMoreScreen() {
  const navigate = useNavigate();
  const stats = getQueueStats();
  const isOnline = navigator.onLine;

  const handleLogout = () => {
    localStorage.removeItem("delivery_auth");
    navigate("/delivery/login", { replace: true });
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold">Plus</h1>

      <div className="space-y-2">
        <button
          onClick={() => navigate("/delivery/end-of-day")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Fin de journée</p>
            <p className="text-[10px] text-muted-foreground">Résumé + clôture</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/delivery/incident")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Signaler un incident</p>
            <p className="text-[10px] text-muted-foreground">Panne, accident, route bloquée</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/delivery/map")}
          className="w-full rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Carte tournée</p>
            <p className="text-[10px] text-muted-foreground">Vue cartographique des arrêts</p>
          </div>
        </button>
      </div>

      {/* Sync status */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          {isOnline ? "En ligne" : "Hors ligne"}
        </h2>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>En attente de sync</span>
          <span className="font-medium">{stats.pending}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Total synchronisé</span>
          <span className="font-medium">{stats.synced}</span>
        </div>
      </div>

      <Button variant="outline" onClick={handleLogout} className="w-full text-destructive border-destructive/30">
        <LogOut className="h-4 w-4 mr-2" /> Déconnexion
      </Button>
    </div>
  );
}
