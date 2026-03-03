import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MOCK_DRIVER, vehicles } from "../data/mockDeliveryData";

export default function DriverLoginScreen() {
  const [pin, setPin] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (pin !== MOCK_DRIVER.pin) {
      toast({ title: "PIN incorrect", variant: "destructive" });
      return;
    }
    if (!vehicleId) {
      toast({ title: "Sélectionnez un véhicule", variant: "destructive" });
      return;
    }
    localStorage.setItem("delivery_auth", JSON.stringify({ driverId: MOCK_DRIVER.id, vehicleId }));
    toast({ title: "✅ Connecté", description: `Bonjour ${MOCK_DRIVER.name}` });
    navigate("/delivery/vehicle-check", { replace: true });
  };

  const availableVehicles = vehicles.filter((v) => v.status === "available");

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-primary mx-auto flex items-center justify-center">
            <span className="text-2xl">🚚</span>
          </div>
          <h1 className="text-xl font-bold">JAWDA Livraison</h1>
          <p className="text-sm text-muted-foreground">Application Chauffeur</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {/* PIN input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Code PIN</label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-12 rounded-lg border-2 border-border flex items-center justify-center text-xl font-bold"
                >
                  {pin[i] ? "●" : ""}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === null) return;
                    if (key === "⌫") setPin((p) => p.slice(0, -1));
                    else if (pin.length < 4) setPin((p) => p + key);
                  }}
                  className={`h-12 rounded-lg text-lg font-semibold transition-colors ${
                    key === null
                      ? ""
                      : "border border-border hover:bg-muted active:bg-muted/80"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">PIN démo : 1234</p>
          </div>

          {/* Vehicle selector */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Véhicule</label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.plate} — {v.model} ({v.capacity}kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleLogin} className="w-full" disabled={pin.length !== 4 || !vehicleId}>
            Commencer la journée →
          </Button>
        </div>
      </div>
    </div>
  );
}
