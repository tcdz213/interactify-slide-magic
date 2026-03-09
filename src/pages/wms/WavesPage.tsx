import { useMemo, useState } from "react";
import { Layers, Search, Plus, Play, CheckCircle2, Clock, Package, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { SalesOrder } from "@/data/mockData";
import { currency } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface Wave {
  id: string;
  name: string;
  createdAt: string;
  status: "Draft" | "Released" | "In_Progress" | "Completed";
  orderIds: string[];
  totalLines: number;
  totalQty: number;
  totalValue: number;
}

export default function WavesPage() {
  const { t } = useTranslation();
  const { salesOrders, setSalesOrders } = useWMSData();
  const { canCreate } = useAuth();
  const [waves, setWaves] = useState<Wave[]>([
    {
      id: "WAVE-20260220-001", name: "Vague Alger Nord #1", createdAt: "2026-02-20 10:00",
      status: "Released", orderIds: ["ORD-20260220-0042"],
      totalLines: 3, totalQty: 450, totalValue: 116380,
    },
    {
      id: "WAVE-20260220-002", name: "Vague Est + Sud #2", createdAt: "2026-02-20 11:00",
      status: "In_Progress", orderIds: ["ORD-20260220-0041"],
      totalLines: 2, totalQty: 350, totalValue: 71960,
    },
  ]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const candidates = useMemo(
    () => salesOrders.filter((o) => ["Approved"].includes(o.status)),
    [salesOrders]
  );

  const filteredWaves = waves.filter(
    (w) =>
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    totalWaves: waves.length,
    released: waves.filter((w) => w.status === "Released").length,
    inProgress: waves.filter((w) => w.status === "In_Progress").length,
    totalValue: waves.reduce((s, w) => s + w.totalValue, 0),
  }), [waves]);

  const handleCreateWave = () => {
    if (selectedOrders.length === 0) return;
    const orders = salesOrders.filter((o) => selectedOrders.includes(o.id));
    const newWave: Wave = {
      id: `WAVE-${Date.now()}`,
      name: `Vague #${waves.length + 1}`,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "Draft",
      orderIds: selectedOrders,
      totalLines: orders.reduce((s, o) => s + o.lines.length, 0),
      totalQty: orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.orderedQty, 0), 0),
      totalValue: orders.reduce((s, o) => s + o.totalAmount, 0),
    };
    setWaves((prev) => [newWave, ...prev]);
    setShowCreate(false);
    setSelectedOrders([]);
    toast({ title: t("wavesPage.waveCreated"), description: t("wavesPage.waveCreatedDesc", { id: newWave.id, count: orders.length }) });
  };

  const releaseWave = (waveId: string) => {
    setWaves((prev) => prev.map((w) => w.id === waveId ? { ...w, status: "Released" as const } : w));
    const wave = waves.find((w) => w.id === waveId);
    if (wave) {
      setSalesOrders((prev) =>
        prev.map((o) => wave.orderIds.includes(o.id) ? { ...o, status: "Picking" as const } : o)
      );
    }
    toast({ title: t("wavesPage.waveReleased"), description: t("wavesPage.waveReleasedDesc", { id: waveId }) });
  };

  const deleteWave = (waveId: string) => {
    const wave = waves.find((w) => w.id === waveId);
    if (wave && wave.status !== "Draft") {
      toast({ title: t("wavesPage.deleteError"), description: t("wavesPage.deleteErrorDesc"), variant: "destructive" });
      return;
    }
    setWaves((prev) => prev.filter((w) => w.id !== waveId));
    toast({ title: t("wavesPage.waveDeleted"), description: waveId });
  };

  const waveStatusColors: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    Released: "bg-info/10 text-info",
    In_Progress: "bg-warning/10 text-warning",
    Completed: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("wavesPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("wavesPage.subtitle")}</p>
          </div>
        </div>
        {canCreate("salesOrder") && (
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> {t("wavesPage.createWave")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("wavesPage.totalWaves")}</p>
          <p className="text-xl font-semibold">{stats.totalWaves}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("wavesPage.released")}</p>
          <p className="text-xl font-semibold text-info">{stats.released}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("wavesPage.inProgress")}</p>
          <p className="text-xl font-semibold text-warning">{stats.inProgress}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("wavesPage.totalValue")}</p>
          <p className="text-xl font-semibold text-primary">{currency(stats.totalValue)}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t("wavesPage.searchPlaceholder")}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filteredWaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Layers className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("wavesPage.noWaves")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("wavesPage.colWaveId")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("wavesPage.colName")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("wavesPage.colCreatedAt")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("wavesPage.colOrders")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("wavesPage.colLines")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("wavesPage.colValue")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("wavesPage.colStatus")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("wavesPage.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWaves.map((w) => (
                <tr key={w.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{w.id}</td>
                  <td className="px-4 py-3 font-medium">{w.name}</td>
                  <td className="px-4 py-3 text-xs">{w.createdAt}</td>
                  <td className="px-4 py-3 text-right">{w.orderIds.length}</td>
                  <td className="px-4 py-3 text-right">{w.totalLines}</td>
                  <td className="px-4 py-3 text-right font-medium">{currency(w.totalValue)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${waveStatusColors[w.status]}`}>
                      {w.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {w.status === "Draft" && (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => releaseWave(w.id)}>
                          <Play className="h-3 w-3 mr-1" /> {t("wavesPage.release")}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteWave(w.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {w.status === "Released" && (
                      <span className="text-xs text-info flex items-center gap-1"><Clock className="h-3 w-3" /> {t("wavesPage.waitingPicking")}</span>
                    )}
                    {w.status === "In_Progress" && (
                      <span className="text-xs text-warning flex items-center gap-1"><Package className="h-3 w-3" /> {t("wavesPage.pickingInProgress")}</span>
                    )}
                    {w.status === "Completed" && (
                      <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t("wavesPage.completed")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("wavesPage.createWaveTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-3">{t("wavesPage.selectOrders")}</p>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">{t("wavesPage.noApprovedOrders")}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {candidates.map((o) => (
                <label key={o.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/20 cursor-pointer">
                  <Checkbox
                    checked={selectedOrders.includes(o.id)}
                    onCheckedChange={(checked) =>
                      setSelectedOrders((prev) =>
                        checked ? [...prev, o.id] : prev.filter((id) => id !== o.id)
                      )
                    }
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-mono text-xs">{o.id}</span>
                      <span className="text-xs font-medium">{currency(o.totalAmount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{o.customerName} — {o.lines.length} {t("wavesPage.colLines").toLowerCase()}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateWave} disabled={selectedOrders.length === 0}>
              {t("wavesPage.createCount", { count: selectedOrders.length })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
