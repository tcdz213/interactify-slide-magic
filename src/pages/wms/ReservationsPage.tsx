import { useMemo, useState } from "react";
import { Lock, Search, Unlock, ShoppingCart, Package, Plus } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency, products } from "@/data/mockData";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";

interface StockReservation {
  id: string;
  orderId: string;
  customerName: string;
  productId: string;
  productName: string;
  warehouseId: string;
  locationId: string;
  reservedQty: number;
  status: "Active" | "Released" | "Expired" | "Cancelled";
  reservedAt: string;
  expiresAt: string;
}

const INITIAL_RESERVATIONS: StockReservation[] = [
  { id: "RSV-001", orderId: "ORD-20260220-0042", customerName: "Carrefour Algerie", productId: "P001", productName: "Lait UHT 1L", warehouseId: "WH01", locationId: "WH01-A1-01", reservedQty: 200, status: "Active", reservedAt: "2026-02-20 09:15", expiresAt: "2026-02-22" },
  { id: "RSV-002", orderId: "ORD-20260220-0042", customerName: "Algérie Télécom", productId: "P003", productName: "Cartouche Toner HP", warehouseId: "WH01", locationId: "WH01-B1-01", reservedQty: 150, status: "Active", reservedAt: "2026-02-20 09:15", expiresAt: "2026-02-22" },
  { id: "RSV-003", orderId: "ORD-20260220-0042", customerName: "Algérie Télécom", productId: "P009", productName: "Palette EUR 1200x800", warehouseId: "WH01", locationId: "WH01-E1-01", reservedQty: 100, status: "Active", reservedAt: "2026-02-20 09:15", expiresAt: "2026-02-22" },
  { id: "RSV-004", orderId: "ORD-20260220-0041", customerName: "Bureau Plus", productId: "P004", productName: "Ramette Papier A4", warehouseId: "WH01", locationId: "WH01-B1-02", reservedQty: 300, status: "Active", reservedAt: "2026-02-20 08:45", expiresAt: "2026-02-22" },
  { id: "RSV-005", orderId: "ORD-20260220-0041", customerName: "Bureau Plus", productId: "P005", productName: "Gant Sécurité L", warehouseId: "WH01", locationId: "WH01-C1-01", reservedQty: 50, status: "Active", reservedAt: "2026-02-20 08:45", expiresAt: "2026-02-22" },
  { id: "RSV-006", orderId: "ORD-20260219-0036", customerName: "BatiGroup", productId: "P001", productName: "Écran LED 24\"", warehouseId: "WH01", locationId: "WH01-A1-01", reservedQty: 400, status: "Released", reservedAt: "2026-02-19 09:00", expiresAt: "2026-02-21" },
];

export default function ReservationsPage() {
  const { salesOrders, inventory } = useWMSData();
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRes, setNewRes] = useState({ orderId: "", productId: "", warehouseId: "WH01", locationId: "", qty: 0, expiresAt: "" });

  const filtered = reservations.filter(
    (r) =>
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    total: reservations.length,
    active: reservations.filter((r) => r.status === "Active").length,
    totalQty: reservations.filter((r) => r.status === "Active").reduce((s, r) => s + r.reservedQty, 0),
    released: reservations.filter((r) => r.status === "Released").length,
  }), [reservations]);

  const releaseReservation = (id: string) => {
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "Released" as const } : r));
    toast({ title: "Réservation libérée", description: `${id} — stock rendu disponible` });
  };

  const statusColors: Record<string, string> = {
    Active: "bg-info/10 text-info",
    Released: "bg-success/10 text-success",
    Expired: "bg-warning/10 text-warning",
    Cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Réservations de stock</h1>
            <p className="text-sm text-muted-foreground">Stock réservé pour les commandes clients</p>
          </div>
        </div>
        <Button onClick={() => { setNewRes({ orderId: "", productId: "", warehouseId: "WH01", locationId: "", qty: 0, expiresAt: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) }); setShowCreate(true); }} className="gap-2"><Plus className="h-4 w-4" /> Créer réservation</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Réservations</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Actives</p>
          <p className="text-xl font-semibold text-info">{stats.active}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Qté réservée</p>
          <p className="text-xl font-semibold text-primary">{stats.totalQty.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Libérées</p>
          <p className="text-xl font-semibold text-success">{stats.released}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Commande</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Emplacement</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qté</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Expire</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.orderId}</td>
                <td className="px-4 py-3 text-xs">{r.customerName}</td>
                <td className="px-4 py-3 font-medium text-sm">{r.productName}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.locationId}</td>
                <td className="px-4 py-3 text-right font-medium">{r.reservedQty}</td>
                <td className="px-4 py-3 text-xs">{r.expiresAt}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status === "Active" && (
                    <Button variant="ghost" size="sm" onClick={() => releaseReservation(r.id)}>
                      <Unlock className="h-3 w-3 mr-1" /> Libérer
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Create reservation dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Créer une réservation</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <FormField label="Commande">
              <select value={newRes.orderId} onChange={e => { const o = salesOrders.find(x => x.id === e.target.value); setNewRes(p => ({ ...p, orderId: e.target.value, ...(o ? {} : {}) })); }} className={formSelectClass}>
                <option value="">Sélectionner...</option>
                {salesOrders.filter(o => ["Approved", "Picking", "Packed"].includes(o.status)).map(o => (
                  <option key={o.id} value={o.id}>{o.id} — {o.customerName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Produit">
              <select value={newRes.productId} onChange={e => setNewRes(p => ({ ...p, productId: e.target.value }))} className={formSelectClass}>
                <option value="">Sélectionner...</option>
                {products.filter(p => p.isActive).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Quantité">
              <input type="number" min={1} value={newRes.qty} onChange={e => setNewRes(p => ({ ...p, qty: Number(e.target.value) }))} className={formInputClass} />
            </FormField>
            <FormField label="Date d'expiration">
              <input type="date" value={newRes.expiresAt} onChange={e => setNewRes(p => ({ ...p, expiresAt: e.target.value }))} className={formInputClass} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={() => {
              if (!newRes.orderId || !newRes.productId || newRes.qty <= 0) return;
              const product = products.find(p => p.id === newRes.productId);
              const order = salesOrders.find(o => o.id === newRes.orderId);
              // Check available stock
              const available = inventory.filter((i: any) => i.productId === newRes.productId).reduce((s: number, i: any) => s + i.qtyAvailable, 0);
              if (newRes.qty > available) {
                toast({ title: "Stock insuffisant", description: `Disponible: ${available}`, variant: "destructive" });
                return;
              }
              const newId = `RSV-${String(reservations.length + 1).padStart(3, "0")}`;
              setReservations(prev => [...prev, {
                id: newId,
                orderId: newRes.orderId,
                customerName: order?.customerName || "—",
                productId: newRes.productId,
                productName: product?.name || "—",
                warehouseId: "WH01",
                locationId: "WH01-A1-01",
                reservedQty: newRes.qty,
                status: "Active" as const,
                reservedAt: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
                expiresAt: newRes.expiresAt,
              }]);
              toast({ title: "Réservation créée", description: `${newId} — ${newRes.qty} unités réservées` });
              setShowCreate(false);
            }}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
