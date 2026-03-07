import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2, Save, CheckCircle2, Warehouse, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { warehouses } from "@/data/mockData";

type PickingStrategy = "FIFO" | "FEFO" | "LIFO";

interface WarehouseStrategy {
  warehouseId: string; warehouseName: string; strategy: PickingStrategy;
  autoAssign: boolean; batchPicking: boolean; zonePriority: boolean;
}

const STRATEGY_INFO: Record<PickingStrategy, { label: string; desc: string; color: string }> = {
  FIFO: { label: "FIFO — First In, First Out", desc: "Priority to oldest lots (reception date)", color: "text-info" },
  FEFO: { label: "FEFO — First Expiry, First Out", desc: "Priority to nearest expiry (food products)", color: "text-warning" },
  LIFO: { label: "LIFO — Last In, First Out", desc: "Priority to newest lots (exceptional)", color: "text-muted-foreground" },
};

export default function PickingStrategyPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const [strategies, setStrategies] = useState<WarehouseStrategy[]>(
    warehouses.map((w) => ({
      warehouseId: w.id, warehouseName: w.name, strategy: "FEFO",
      autoAssign: true, batchPicking: w.id === "WH01", zonePriority: true,
    }))
  );

  const updateStrategy = (warehouseId: string, updates: Partial<WarehouseStrategy>) => {
    setStrategies((prev) => prev.map((s) => (s.warehouseId === warehouseId ? { ...s, ...updates } : s)));
  };

  const handleSave = () => {
    setSaved(true);
    toast({ title: t("pickingStrategy.strategiesSaved"), description: t("pickingStrategy.strategiesSavedDesc") });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><ArrowDownUp className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("pickingStrategy.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("pickingStrategy.subtitle")}</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          {saved ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          {saved ? t("pickingStrategy.saved") : t("pickingStrategy.save")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["FIFO", "FEFO", "LIFO"] as PickingStrategy[]).map((s) => (
          <Card key={s} className="border-border/50">
            <CardContent className="p-4">
              <p className={`text-sm font-bold ${STRATEGY_INFO[s].color}`}>{s}</p>
              <p className="text-xs text-muted-foreground mt-1">{STRATEGY_INFO[s].desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {strategies.map((ws) => (
          <Card key={ws.warehouseId}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Warehouse className="h-4 w-4 text-primary" /> {ws.warehouseName}
                <span className="text-xs font-mono text-muted-foreground ml-2">{ws.warehouseId}</span>
              </CardTitle>
              <CardDescription>{t("pickingStrategy.settingsFor")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("pickingStrategy.pickingStrategyLabel")}</Label>
                  <Select value={ws.strategy} onValueChange={(v) => updateStrategy(ws.warehouseId, { strategy: v as PickingStrategy })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["FIFO", "FEFO", "LIFO"] as PickingStrategy[]).map((s) => <SelectItem key={s} value={s}>{STRATEGY_INFO[s].label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between"><Label className="text-xs">{t("pickingStrategy.autoAssign")}</Label><Switch checked={ws.autoAssign} onCheckedChange={(v) => updateStrategy(ws.warehouseId, { autoAssign: v })} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">{t("pickingStrategy.batchPicking")}</Label><Switch checked={ws.batchPicking} onCheckedChange={(v) => updateStrategy(ws.warehouseId, { batchPicking: v })} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">{t("pickingStrategy.zonePriority")}</Label><Switch checked={ws.zonePriority} onCheckedChange={(v) => updateStrategy(ws.warehouseId, { zonePriority: v })} /></div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <strong>{t("pickingStrategy.summary")} :</strong> {t("pickingStrategy.summaryText", { warehouse: ws.warehouseName })}{" "}
                <span className={`font-bold ${STRATEGY_INFO[ws.strategy].color}`}>{ws.strategy}</span>
                {ws.autoAssign ? t("pickingStrategy.withAutoAssign") : ""}
                {ws.batchPicking ? t("pickingStrategy.withBatchPicking") : ""}
                {ws.zonePriority ? t("pickingStrategy.withZonePriority") : ""}.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
