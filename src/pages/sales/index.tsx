import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Users, Eye, Search, Plus, Copy, XCircle, History, CheckCircle, Package, Truck, Pencil, ShieldAlert, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/data/mockData";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SalesOrder, Customer } from "@/data/mockData";
import { NEXT_STATUS, NEXT_STATUS_TOOLTIP, STATUS_LABELS_FR, CHANNEL_LABELS } from "@/modules/sales/orderStatus";
import { useOrderForm } from "@/modules/sales/useOrderForm";
import { OrderFormDialog } from "@/modules/sales/OrderFormDialog";
import { OrderDetailDrawer } from "@/modules/sales/OrderDetailDrawer";
import { formatDate } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// OrdersPage — Orchestrator (Phase 8 refactoring)
// ═══════════════════════════════════════════════════════════

export function OrdersPage() {
  const hook = useOrderForm();
  const {
    salesOrders, filtered, canCreate, canApprove,
    search, setSearch, filterStatus, setFilterStatus,
    setSelectedOrder, setNewOrderOpen, setCancelDialogOrder,
    setHistoryDialogOrder, handleDuplicate, handleStatusChange, resetForm,
  } = hook;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Commandes</h1>
            <p className="text-sm text-muted-foreground">{salesOrders.length} commandes — Cycle complet de vente</p>
          </div>
        </div>
        {canCreate("salesOrder") && (
          <Button className="flex items-center gap-2" onClick={() => { resetForm(); setNewOrderOpen(true); }}>
            <Plus className="h-4 w-4" /> Nouvelle commande
          </Button>
        )}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: salesOrders.length, color: "" },
          { label: "En cours", value: salesOrders.filter((o) => ["Picking", "Packed", "Shipped"].includes(o.status)).length, color: "text-info" },
          { label: "Livrées", value: salesOrders.filter((o) => o.status === "Delivered").length, color: "text-success" },
          { label: "Bloquées", value: salesOrders.filter((o) => o.status === "Credit_Hold").length, color: "text-destructive" },
          { label: "CA Total", value: currency(salesOrders.reduce((s, o) => s + o.totalAmount, 0)), color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher commande ou client..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Tous les statuts</option>
          {["Draft","Credit_Hold","Approved","Picking","Packed","Shipped","Partially_Delivered","Delivered","Invoiced","Cancelled"].map((s) => (
            <option key={s} value={s}>{STATUS_LABELS_FR[s] ?? s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Commande</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Vendeur</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Livraison</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Canal</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Total</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{order.id}</td>
                <td className="px-4 py-3 font-medium">{order.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{order.salesRep}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(order.orderDate, true)}</td>
                <td className="px-4 py-3 text-xs">{formatDate(order.deliveryDate)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{CHANNEL_LABELS[order.channel] ?? order.channel}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(order.totalAmount)}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Voir les détails">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {order.status === "Draft" && canCreate("salesOrder") && (
                      <button onClick={() => {
                        // Pre-fill form with order data for editing
                        hook.setNewOrderCustomerId(order.customerId);
                        hook.setNewOrderSalesRep(order.salesRep);
                        hook.setNewOrderChannel(order.channel as any);
                        hook.setNewOrderDate(order.orderDate.split(" ")[0]);
                        hook.setNewOrderDeliveryDate(order.deliveryDate);
                        hook.setNewOrderPaymentTerms(order.paymentTerms as any);
                        hook.setNewOrderDiscountPct(order.discountPct);
                        hook.setNewOrderNotes(order.notes || "");
                        hook.setNewOrderLines(order.lines.map(l => ({
                          productId: l.productId, productName: l.productName,
                          orderedQty: l.orderedQty, unitPrice: l.unitPrice, unitCost: l.unitCostAtSale ?? 0,
                          unitAbbr: (l as any).unitAbbr ?? "", unitName: (l as any).unitName ?? "", conversionFactor: (l as any).conversionFactor ?? 1,
                        })));
                        hook.setEditingOrderId?.(order.id);
                        hook.setNewOrderOpen(true);
                      }} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Modifier la commande">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                    <button onClick={() => handleDuplicate(order)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Dupliquer la commande">
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => setHistoryDialogOrder(order)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Historique des statuts">
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {order.status !== "Cancelled" && order.status !== "Delivered" && order.status !== "Invoiced" && (
                      <button onClick={() => setCancelDialogOrder(order)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Annuler la commande">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {NEXT_STATUS[order.status] && canApprove("salesOrder") && (
                      <button
                        onClick={() => handleStatusChange(order.id, NEXT_STATUS[order.status]!)}
                        className="p-1.5 rounded-md hover:bg-success/10 text-success transition-colors"
                        title={NEXT_STATUS_TOOLTIP[order.status] ?? `Passer à ${STATUS_LABELS_FR[NEXT_STATUS[order.status]!] ?? NEXT_STATUS[order.status]}`}
                      >
                        {order.status === "Draft" ? <CheckCircle className="h-3.5 w-3.5" /> : order.status === "Packed" ? <Truck className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extracted dialogs */}
      <OrderFormDialog hook={hook} />
      <OrderDetailDrawer hook={hook} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CreditBadge — Sprint A2
// ═══════════════════════════════════════════════════════════

function CreditBadge({ pct, status }: { pct: number; status: string }) {
  if (status === "Credit_Hold" || status === "Blocked") {
    return (
      <Badge variant="destructive" className="gap-1 text-[10px]">
        <ShieldAlert className="h-3 w-3" /> Bloqué
      </Badge>
    );
  }
  if (pct > 100) {
    return <Badge variant="destructive" className="text-[10px]">{pct}% ⛔</Badge>;
  }
  if (pct > 80) {
    return <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">{pct}% ⚠️</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">{pct}% ✅</Badge>;
}

// ═══════════════════════════════════════════════════════════
// CustomersPage
// ═══════════════════════════════════════════════════════════

function nextCustomerId(customers: Customer[]): string {
  const nums = customers.map((c) => parseInt(c.id.replace("C", ""), 10)).filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `C${String(next).padStart(3, "0")}`;
}

export function CustomersPage() {
  const { customers, setCustomers, invoices } = useWMSData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const canModifyCustomers = currentUser ? ["CEO", "OpsDirector", "RegionalManager"].includes(currentUser.role) : false;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [geoSortActive, setGeoSortActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "", type: "Détaillant" as Customer["type"], zone: "", phone: "", email: "", creditLimit: 500000, paymentTerms: "Net_30" as Customer["paymentTerms"],
  });

  const now = new Date();

  // Auto-block detection: credit > 100% or overdue > 60 days
  const getAutoBlockStatus = (c: Customer) => {
    const pct = Math.round((c.creditUsed / c.creditLimit) * 100);
    const customerInvoices = invoices.filter((inv) => inv.customerId === c.id);
    const overdueInvoices = customerInvoices.filter((inv) => {
      if (inv.status === "Paid" || inv.status === "Cancelled") return false;
      return new Date(inv.dueDate) < now && inv.balance > 0;
    });
    const maxOverdueDays = overdueInvoices.length > 0
      ? Math.max(...overdueInvoices.map((inv) => Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000)))
      : 0;
    const shouldBlock = pct > 100 || maxOverdueDays >= 60;
    const reason = pct > 100 && maxOverdueDays >= 60
      ? `Crédit ${pct}% + ${maxOverdueDays}j impayés`
      : pct > 100
      ? `Crédit dépassé (${pct}%)`
      : maxOverdueDays >= 60
      ? `Impayés > 60j (${maxOverdueDays}j)`
      : null;
    return { shouldBlock, reason, overdueDays: maxOverdueDays };
  };

  // Geo-sort: request user location then sort by distance
  const handleGeoSort = () => {
    if (geoSortActive) { setGeoSortActive(false); return; }
    if (userLocation) { setGeoSortActive(true); return; }
    if (!navigator.geolocation) {
      toast({ title: "Géolocalisation non disponible", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoSortActive(true); },
      () => {
        // Fallback: use Alger centre
        setUserLocation({ lat: 36.7538, lng: 3.0588 });
        setGeoSortActive(true);
        toast({ title: "Position par défaut (Alger)", description: "Géolocalisation refusée — tri par distance depuis Alger" });
      }
    );
  };

  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filtered = customers.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (geoSortActive && userLocation) {
      const distA = haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    }
    return 0;
  });

  const creditPct = (c: Customer) => Math.round((c.creditUsed / c.creditLimit) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground">{customers.length} clients enregistrés</p>
          </div>
        </div>
        {canModifyCustomers && (
          <Button className="flex items-center gap-2" onClick={() => { setNewCustomerForm({ name: "", type: "Détaillant", zone: "", phone: "", email: "", creditLimit: 500000, paymentTerms: "Net_30" }); setNewCustomerOpen(true); }}>
            <Plus className="h-4 w-4" /> Nouveau client
          </Button>
        )}
      </div>

      <Dialog open={newCustomerOpen} onOpenChange={(open) => { setNewCustomerOpen(open); if (!open) setEditingCustomer(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingCustomer ? `Modifier ${editingCustomer.name}` : "Nouveau client"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-2">
              <Label>Nom</Label>
              <Input value={newCustomerForm.name} onChange={(e) => setNewCustomerForm((p) => ({ ...p, name: e.target.value }))} placeholder="Raison sociale ou nom" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newCustomerForm.type} onValueChange={(v) => setNewCustomerForm((p) => ({ ...p, type: v as Customer["type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Entreprise", "PME", "Grand Compte", "Détaillant", "Artisan", "Grossiste"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Zone</Label><Input value={newCustomerForm.zone} onChange={(e) => setNewCustomerForm((p) => ({ ...p, zone: e.target.value }))} placeholder="ex. Alger Nord" /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input value={newCustomerForm.phone} onChange={(e) => setNewCustomerForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+213-..." /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={newCustomerForm.email} onChange={(e) => setNewCustomerForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@..." /></div>
            <div className="space-y-2">
              <Label>Conditions de paiement</Label>
              <Select value={newCustomerForm.paymentTerms} onValueChange={(v) => setNewCustomerForm((p) => ({ ...p, paymentTerms: v as Customer["paymentTerms"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Comptant</SelectItem>
                  <SelectItem value="Net_15">Net 15</SelectItem>
                  <SelectItem value="Net_30">Net 30</SelectItem>
                  <SelectItem value="Net_60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Limite de crédit (DZD)</Label><Input type="number" min={0} value={newCustomerForm.creditLimit} onChange={(e) => setNewCustomerForm((p) => ({ ...p, creditLimit: Number(e.target.value) || 0 }))} /></div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setNewCustomerOpen(false); setEditingCustomer(null); }}>Annuler</Button>
              <Button onClick={() => {
                if (!newCustomerForm.name.trim()) { toast({ title: "Nom requis", variant: "destructive" }); return; }
                if (editingCustomer) {
                  setCustomers((prev) => prev.map((c) => c.id === editingCustomer.id ? {
                    ...c,
                    name: newCustomerForm.name.trim(), type: newCustomerForm.type,
                    zone: newCustomerForm.zone.trim() || "—", phone: newCustomerForm.phone.trim() || "—",
                    email: newCustomerForm.email.trim() || "—", creditLimit: newCustomerForm.creditLimit,
                    paymentTerms: newCustomerForm.paymentTerms,
                  } : c));
                  toast({ title: "Client modifié", description: editingCustomer.name });
                  setEditingCustomer(null);
                  setNewCustomerOpen(false);
                  return;
                }
                const newCustomer: Customer = {
                  id: nextCustomerId(customers), name: newCustomerForm.name.trim(), type: newCustomerForm.type,
                  zone: newCustomerForm.zone.trim() || "—", phone: newCustomerForm.phone.trim() || "—", email: newCustomerForm.email.trim() || "—",
                  creditLimit: newCustomerForm.creditLimit, creditUsed: 0, paymentTerms: newCustomerForm.paymentTerms,
                  status: "Active", lastOrder: "", totalOrders: 0, totalRevenue: 0, lat: 0, lng: 0,
                };
                setCustomers((prev) => [...prev, newCustomer]);
                toast({ title: "Client créé", description: `${newCustomer.name} (${newCustomer.id})` });
                setNewCustomerOpen(false);
              }}>{editingCustomer ? "Enregistrer" : "Créer le client"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher client..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Tous</option>
          <option value="Active">Actif</option>
          <option value="Credit_Hold">Crédit bloqué</option>
          <option value="Blocked">Bloqué</option>
        </select>
        <Button variant={geoSortActive ? "default" : "outline"} size="sm" className="gap-1.5" onClick={handleGeoSort}>
          <Navigation className={`h-3.5 w-3.5 ${geoSortActive ? "" : "text-muted-foreground"}`} />
          {geoSortActive ? "Tri GPS actif" : "Tri par distance"}
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Zone</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Conditions</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Crédit utilisé</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Limite</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">% Crédit</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">CA Total</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const blockInfo = getAutoBlockStatus(c);
              const dist = geoSortActive && userLocation ? haversineDistance(userLocation.lat, userLocation.lng, c.lat, c.lng) : null;
              return (
              <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${blockInfo.shouldBlock && c.status === "Active" ? "bg-destructive/5" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {blockInfo.shouldBlock && (
                      <Badge variant="destructive" className="gap-1 text-[10px] whitespace-nowrap">
                        <ShieldAlert className="h-3 w-3" /> Auto-bloqué
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {c.id} · {c.phone}
                    {blockInfo.reason && <span className="text-destructive ml-1">· {blockInfo.reason}</span>}
                    {dist !== null && <span className="ml-1">· <MapPin className="inline h-3 w-3" /> {dist.toFixed(0)} km</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3 text-xs">{c.zone}</td>
                <td className="px-4 py-3 text-xs">{c.paymentTerms.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(c.creditUsed)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{currency(c.creditLimit)}</td>
                <td className="px-4 py-3 text-right">
                  <CreditBadge pct={creditPct(c)} status={c.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium">{currency(c.totalRevenue)}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => navigate(`/sales/customers/${c.id}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Voir détails"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    {canModifyCustomers && (
                      <button onClick={() => {
                        setEditingCustomer(c);
                        setNewCustomerForm({ name: c.name, type: c.type, zone: c.zone, phone: c.phone, email: c.email, creditLimit: c.creditLimit, paymentTerms: c.paymentTerms });
                        setNewCustomerOpen(true);
                      }} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Modifier">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">{selectedCustomer.name} <StatusBadge status={selectedCustomer.status} /></DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div><span className="text-muted-foreground">ID :</span> {selectedCustomer.id}</div>
                <div><span className="text-muted-foreground">Type :</span> {selectedCustomer.type}</div>
                <div><span className="text-muted-foreground">Zone :</span> {selectedCustomer.zone}</div>
                <div><span className="text-muted-foreground">Tél :</span> {selectedCustomer.phone}</div>
                <div><span className="text-muted-foreground">Email :</span> {selectedCustomer.email}</div>
                <div><span className="text-muted-foreground">Conditions :</span> {selectedCustomer.paymentTerms.replace(/_/g, " ")}</div>
                <div><span className="text-muted-foreground">Crédit utilisé :</span> {currency(selectedCustomer.creditUsed)}</div>
                <div><span className="text-muted-foreground">Limite :</span> {currency(selectedCustomer.creditLimit)}</div>
                <div><span className="text-muted-foreground">Commandes :</span> {selectedCustomer.totalOrders}</div>
                <div><span className="text-muted-foreground">CA Total :</span> {currency(selectedCustomer.totalRevenue)}</div>
                <div><span className="text-muted-foreground">Dernière commande :</span> {selectedCustomer.lastOrder || "—"}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
