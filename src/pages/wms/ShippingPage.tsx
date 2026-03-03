import { useMemo, useState } from "react";
import { Truck, Search, FileText, CheckCircle2, Undo2, Plus, Download } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";

export default function ShippingPage() {
  const { salesOrders, setSalesOrders, deliveryTrips, carriers } = useWMSData();
  const [search, setSearch] = useState("");
  const [revertTarget, setRevertTarget] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const outboundOrders = useMemo(
    () => salesOrders.filter((o) => ["Shipped", "Partially_Delivered", "Delivered"].includes(o.status)),
    [salesOrders]
  );

  const packedOrders = useMemo(
    () => salesOrders.filter((o) => o.status === "Packed"),
    [salesOrders]
  );

  const filtered = [...packedOrders, ...outboundOrders].filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    toShip: packedOrders.length,
    inTransit: outboundOrders.filter((o) => o.status === "Shipped").length,
    delivered: outboundOrders.filter((o) => ["Delivered", "Partially_Delivered"].includes(o.status)).length,
    value: [...packedOrders, ...outboundOrders].reduce((s, o) => s + o.totalAmount, 0),
  }), [packedOrders, outboundOrders]);

  const shipOrder = (orderId: string) => {
    setSalesOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: "Shipped" as const } : o)
    );
    toast({ title: "Commande expédiée", description: `${orderId} — BL généré` });
  };

  const confirmDelivery = (orderId: string) => {
    setSalesOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: "Delivered" as const } : o)
    );
    toast({ title: "Livraison confirmée", description: `${orderId} — Delivered` });
  };

  const generateBL = (orderId: string) => {
    toast({ title: "Bon de livraison", description: `BL généré pour ${orderId}` });
  };

  const revertShipment = () => {
    if (!revertTarget) return;
    setSalesOrders((prev) =>
      prev.map((o) => o.id === revertTarget ? { ...o, status: "Packed" as const } : o)
    );
    toast({ title: "Expédition annulée", description: `${revertTarget} — retour en Packed` });
    setRevertTarget(null);
  };

  const statusColors: Record<string, string> = {
    Packed: "bg-info/10 text-info",
    Shipped: "bg-warning/10 text-warning",
    Delivered: "bg-success/10 text-success",
    Partially_Delivered: "bg-warning/10 text-warning",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Expédition / Shipping</h1>
            <p className="text-sm text-muted-foreground">BL, transporteur, tracking, confirmation livraison</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-1" /> Exporter</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">À expédier</p>
          <p className="text-xl font-semibold">{stats.toShip}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En transit</p>
          <p className="text-xl font-semibold text-warning">{stats.inTransit}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Livrées</p>
          <p className="text-xl font-semibold text-success">{stats.delivered}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Valeur totale</p>
          <p className="text-xl font-semibold text-primary">{currency(stats.value)}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Truck className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucune commande à expédier.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Commande</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Livraison</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Transporteur</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{o.customerName}</td>
                  <td className="px-4 py-3 text-xs">{o.deliveryDate}</td>
                  <td className="px-4 py-3">
                    {(o.status === "Packed" || o.status === "Shipped") ? (
                      <Select
                        value={(o as any).carrierId || ""}
                        onValueChange={(val) => {
                          const carrier = carriers.find((c: any) => c.id === val);
                          setSalesOrders((prev) =>
                            prev.map((x) => x.id === o.id ? { ...x, carrierId: val, carrierName: carrier?.name } as any : x)
                          );
                          toast({ title: "Transporteur assigné", description: `${carrier?.name} → ${o.id}` });
                        }}
                      >
                        <SelectTrigger className="h-7 w-[140px] text-xs">
                          <SelectValue placeholder="Assigner…" />
                        </SelectTrigger>
                        <SelectContent>
                          {carriers.filter((c: any) => c.status === "Active").map((c: any) => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">{(o as any).carrierName || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{currency(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] ?? "bg-muted"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {o.status === "Packed" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => generateBL(o.id)}>
                            <FileText className="h-3 w-3 mr-1" /> BL
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => shipOrder(o.id)}>
                            <Truck className="h-3 w-3 mr-1" /> Expédier
                          </Button>
                        </>
                      )}
                      {o.status === "Shipped" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => confirmDelivery(o.id)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Livré
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setRevertTarget(o.id)}>
                            <Undo2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {o.status === "Delivered" && (
                        <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Livré</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Carrier summary */}
      <div className="glass-card rounded-xl p-4 border border-border/60">
        <h2 className="text-sm font-semibold mb-3">Transporteurs disponibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {carriers.filter((c: any) => c.status === "Active").map((c: any) => (
            <div key={c.id} className="rounded-lg border border-border/40 p-3 text-xs">
              <p className="font-medium">{c.name}</p>
              <p className="text-muted-foreground">{c.city} — {c.vehicleCount} véhicules</p>
              <p className="text-muted-foreground">★ {c.rating}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery trips preview */}
      <div className="glass-card rounded-xl p-4 border border-border/60">
        <h2 className="text-sm font-semibold mb-2">Tournées de livraison</h2>
        {deliveryTrips.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune tournée.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {deliveryTrips.slice(0, 3).map((t: any) => (
              <div key={t.id} className="rounded-lg border border-border/60 bg-muted/40 p-2">
                <div className="font-mono text-[11px] mb-1">{t.id}</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.driverName}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {t.completedStops}/{t.totalStops} arrêts · {t.zone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revert shipment confirm */}
      <AlertDialog open={!!revertTarget} onOpenChange={(o) => !o && setRevertTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'expédition ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande {revertTarget} sera remise en statut "Packed".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={revertShipment}>Oui, annuler</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportDialog
        open={exportOpen} onOpenChange={setExportOpen}
        data={filtered}
        columns={[
          { key: "id" as const, label: "Commande" }, { key: "customerName" as const, label: "Client" },
          { key: "deliveryDate" as const, label: "Livraison" }, { key: "totalAmount" as const, label: "Total" },
          { key: "status" as const, label: "Statut" },
        ]}
        filename="expedition"
        statusKey="status"
        statusOptions={["Packed", "Shipped", "Delivered", "Partially_Delivered"]}
      />
    </div>
  );
}
