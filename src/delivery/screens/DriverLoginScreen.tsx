import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MOCK_DRIVER, vehicles } from "../data/mockDeliveryData";
import { useTranslation } from "react-i18next";

export default function DriverLoginScreen() {
  const [pin, setPin] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = () => {
    if (pin !== MOCK_DRIVER.pin) {
      toast({ title: t("delivery.pinIncorrect"), variant: "destructive" });
      return;
    }
    if (!vehicleId) {
      toast({ title: t("delivery.selectVehicleError"), variant: "destructive" });
      return;
    }
    localStorage.setItem("delivery_auth", JSON.stringify({ driverId: MOCK_DRIVER.id, vehicleId }));
    toast({ title: t("delivery.connected"), description: t("delivery.welcomeDriver", { name: MOCK_DRIVER.name }) });
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
          <h1 className="text-xl font-bold">{t("delivery.driverLogin")}</h1>
          <p className="text-sm text-muted-foreground">{t("delivery.driverApp")}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("delivery.pinLabel")}</label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 w-10 rounded-lg border-2 border-border flex items-center justify-center text-xl font-bold"
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
                    else if (pin.length < 6) setPin((p) => p + key);
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
            <p className="text-[10px] text-muted-foreground mt-2 text-center">{t("delivery.demoPin")}</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("delivery.vehicle")}</label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder={t("delivery.selectVehicle")} />
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

          <Button onClick={handleLogin} className="w-full" disabled={pin.length !== 6 || !vehicleId}>
            {t("delivery.startDay")}
          </Button>
        </div>
      </div>
    </div>
  );
}
