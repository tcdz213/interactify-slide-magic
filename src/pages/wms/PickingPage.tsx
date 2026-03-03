import { useMemo, useState } from "react";
import { Hand, Search, CheckCircle2, MapPin, Package, Plus, Trash2, Download } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";

export default function PickingPage() {
  const { salesOrders, setSalesOrders, inventory } = useWMSData();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");

  // Orders eligible for picking creation (Approved status → move to Picking)
  const approvedOrders = useMemo(
    () => salesOrders.filter((o) => o.status === "Approved"),
    [salesOrders]
  );

  const pickingOrders = useMemo(
    () => salesOrders.filter((o) => ["Picking"].includes(o.status)),
    [salesOrders]
  );

  const lines = useMemo(
    () =>
      pickingOrders.flatMap((o) =>
        o.lines.map((l) => ({
          orderId: o.id,
          customerName: o.customerName,
          deliveryDate: o.deliveryDate,
          productId: l.productId,
          productName: l.productName,
          orderedQty: l.orderedQty,
          reservedQty: l.reservedQty,
          shippedQty: l.shippedQty,
          remaining: Math.max(l.orderedQty - l.shippedQty, 0),
          location: inventory.find((i: any) => i.productId === l.productId)?.locationId ?? "—",
        }))
      ),
    [pickingOrders, inventory]
  );

  const filteredLines = lines.filter(
    (l) =>
      l.productName.toLowerCase().includes(search.toLowerCase()) ||
      l.orderId.toLowerCase().includes(search.toLowerCase()) ||
      l.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    orders: pickingOrders.length,
    lines: lines.length,
    qtyToPick: lines.reduce((s, l) => s + l.remaining, 0),
  }), [pickingOrders.length, lines]);

  const confirmPick = (orderId: string, productId: string) => {
    setSalesOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedLines = o.lines.map((l) =>
          l.productId === productId ? { ...l, shippedQty: l.orderedQty } : l
        );
        const allPicked = updatedLines.every((l) => l.shippedQty >= l.orderedQty);
        return { ...o, lines: updatedLines, status: allPicked ? "Packed" as const : o.status };
      })
    );
    toast({ title: "Ligne prélevée", description: `${productId} — commande ${orderId}` });
  };

  const confirmAllOrder = (orderId: string) => {
    setSalesOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          lines: o.lines.map((l) => ({ ...l, shippedQty: l.orderedQty })),
          status: "Packed" as const,
        };
      })
    );
    toast({ title: "Commande prélevée", description: `${orderId} — passée en Packed` });
  };

  const createPickingTask = () => {
    if (!selectedOrder) return;
    setSalesOrders((prev) =>
      prev.map((o) => o.id === selectedOrder ? { ...o, status: "Picking" as const } : o)
    );
    toast({ title: "Picking créé", description: `${selectedOrder} passée en Picking` });
    setCreateOpen(false);
    setSelectedOrder("");
  };

  const cancelPicking = () => {
    if (!deleteTarget) return;
    setSalesOrders((prev) =>
      prev.map((o) => o.id === deleteTarget ? {
        ...o,
        status: "Approved" as const,
        lines: o.lines.map((l) => ({ ...l, shippedQty: 0 })),
      } : o)
    );
    toast({ title: "Picking annulé", description: `${deleteTarget} — retour en Approved` });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Hand className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Prélèvement (Picking)</h1>
            <p className="text-sm text-muted-foreground">Validation ligne par ligne avec emplacement source</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-1" /> Exporter</Button>
          <Button onClick={() => setCreateOpen(true)} disabled={approvedOrders.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Créer Picking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Commandes en picking</p>
          <p className="text-xl font-semibold">{stats.orders}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Lignes à préparer</p>
          <p className="text-xl font-semibold">{stats.lines}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Qté restante à prélever</p>
          <p className="text-xl font-semibold text-primary">{stats.qtyToPick.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer par produit / commande…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm"
        />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filteredLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Hand className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucune ligne en picking.</p>
            <p className="text-sm">Créez un picking ou libérez une vague.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Commande</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Emplacement</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Commandé</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Prélevé</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Restant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLines.map((l) => (
                <tr key={`${l.orderId}-${l.productId}`} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{l.orderId}</td>
                  <td className="px-4 py-3 text-xs">{l.customerName}</td>
                  <td className="px-4 py-3 text-sm font-medium">{l.productName}</td>
                  <td className="px-4 py-3 text-xs font-mono flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />{l.location}
                  </td>
                  <td className="px-4 py-3 text-right">{l.orderedQty}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{l.shippedQty}</td>
                  <td className="px-4 py-3 text-right font-medium">{l.remaining > 0 ? l.remaining : <CheckCircle2 className="h-4 w-4 text-success inline" />}</td>
                  <td className="px-4 py-3">
                    {l.remaining > 0 ? (
                      <Button variant="outline" size="sm" onClick={() => confirmPick(l.orderId, l.productId)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Valider
                      </Button>
                    ) : (
                      <span className="text-xs text-success">✓ Prélevé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pickingOrders.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-border/60">
          <h2 className="text-sm font-semibold mb-3">Actions rapides par commande</h2>
          <div className="flex flex-wrap gap-2">
            {pickingOrders.map((o) => (
              <div key={o.id} className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => confirmAllOrder(o.id)}>
                  <Package className="h-3 w-3 mr-1" /> Tout prélever {o.id}
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget(o.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Picking Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un picking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sélectionnez une commande approuvée pour lancer le picking :</p>
            <select
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              <option value="">— Choisir une commande —</option>
              {approvedOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.customerName} ({currency(o.totalAmount)})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={createPickingTask} disabled={!selectedOrder}>Lancer le picking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Picking Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler le picking ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande {deleteTarget} sera remise en statut "Approved" et les quantités prélevées seront réinitialisées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={cancelPicking}>Oui, annuler</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportDialog
        open={exportOpen} onOpenChange={setExportOpen}
        data={filteredLines}
        columns={[
          { key: "orderId" as const, label: "Commande" }, { key: "customerName" as const, label: "Client" },
          { key: "productName" as const, label: "Produit" }, { key: "location" as const, label: "Emplacement" },
          { key: "orderedQty" as const, label: "Commandé" }, { key: "shippedQty" as const, label: "Prélevé" },
          { key: "remaining" as const, label: "Restant" },
        ]}
        filename="picking"
      />
    </div>
  );
}
