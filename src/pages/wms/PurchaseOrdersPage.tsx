import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Plus, Send, CheckCircle, XCircle, Search, Package, FileText, Pencil, Copy, Printer, ChevronDown, ChevronUp, Lock, MapPin, Calendar, MessageSquare, User, RotateCcw, Download } from "lucide-react";
import { DateFilter } from "@/components/DateFilter";
import { products, currency, users, warehouses } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCombobox, type ProductOption } from "@/components/ProductCombobox";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import type { PurchaseOrder, POLine } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormField, FormSection, formSelectClass, formInputClass, formTextareaClass } from "@/components/ui/form-field";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";

const PO_TAX_RATE = 0.19;
const PAYMENT_TERMS_LABELS: Record<string, string> = { Comptant: "Comptant", Net_15: "Net 15 jours", Net_30: "Net 30 jours", Net_45: "Net 45 jours", Net_60: "Net 60 jours", "30_jours_fin_mois": "30 jours fin de mois" };

export default function PurchaseOrdersPage() {
  const { purchaseOrders: data, setPurchaseOrders: setData, vendors } = useWMSData();
  const { canOperateOn, operationalWarehouses, operationalWarehouseIds, isOperationalRole } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "vendor" | "amount" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exportOpen, setExportOpen] = useState(false);

  const poExportCols: ExportColumn<PurchaseOrder>[] = [
    { key: "id", label: "N° PO" }, { key: "vendorName", label: "Fournisseur" },
    { key: "orderDate", label: "Date commande" }, { key: "expectedDate", label: "Livraison prévue" },
    { key: "totalAmount", label: "Total TTC" }, { key: "status", label: "Statut" },
  ];

  const [newVendor, setNewVendor] = useState("");
  const [newExpected, setNewExpected] = useState("");
  const [newOrderDate, setNewOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const { defaultWarehouseId } = useWarehouseScope();
  const [newWarehouse, setNewWarehouse] = useState(defaultWarehouseId);
  const [newNotes, setNewNotes] = useState("");
  const [newVendorRef, setNewVendorRef] = useState("");
  const [newLines, setNewLines] = useState<{ productId: string; qty: number }[]>([{ productId: "", qty: 0 }]);

  const productOptions: ProductOption[] = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: 0, unitPrice: p.unitPrice, unitCost: p.unitCost, isActive: p.isActive })),
    []
  );

  const filtered = useMemo(() => {
    let list = data.filter((po) => {
      if (filterStatus !== "all" && po.status !== filterStatus) return false;
      if (search && !po.id.toLowerCase().includes(search.toLowerCase()) && !po.vendorName.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom || dateTo) {
        const d = po.orderDate;
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
      }
      return true;
    });
    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortBy === "date") return mult * a.orderDate.localeCompare(b.orderDate);
      if (sortBy === "vendor") return mult * a.vendorName.localeCompare(b.vendorName);
      if (sortBy === "amount") return mult * (a.totalAmount - b.totalAmount);
      return mult * a.status.localeCompare(b.status);
    });
    return list;
  }, [data, filterStatus, search, dateFrom, dateTo, sortBy, sortDir]);

  const liveTotals = useMemo(() => {
    const lines = newLines.filter(l => l.productId && l.qty > 0).map(l => {
      const p = products.find(x => x.id === l.productId);
      return { ...l, lineTotal: (p?.unitCost ?? 0) * l.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const taxAmount = subtotal * PO_TAX_RATE;
    return { subtotal, taxAmount, totalAmount: subtotal + taxAmount };
  }, [newLines]);

  const selectedVendor = vendors.find(v => v.id === newVendor);

  const resetForm = () => {
    setEditingPO(null);
    setNewVendor("");
    setNewExpected("");
    setNewOrderDate(new Date().toISOString().split("T")[0]);
    setNewWarehouse(defaultWarehouseId);
    setNewNotes("");
    setNewVendorRef("");
    setNewLines([{ productId: "", qty: 0 }]);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setNewVendor(po.vendorId);
    setNewExpected(po.expectedDate);
    setNewOrderDate(po.orderDate);
    setNewWarehouse(po.deliveryWarehouseId || defaultWarehouseId);
    setNewNotes(po.notes || "");
    setNewVendorRef(po.vendorRef || "");
    setNewLines(po.lines.length ? po.lines.map(l => ({ productId: l.productId, qty: l.qty })) : [{ productId: "", qty: 0 }]);
    setShowCreate(true);
  };

  const openDuplicate = (po: PurchaseOrder) => {
    resetForm();
    setNewVendor(po.vendorId);
    setNewExpected("");
    setNewWarehouse(po.deliveryWarehouseId || "WH01");
    setNewNotes(po.notes || "");
    setNewVendorRef("");
    setNewLines(po.lines.map(l => ({ productId: l.productId, qty: l.qty })));
    setShowCreate(true);
  };

  const handleSave = () => {
    const vendor = vendors.find(v => v.id === newVendor);
    if (!vendor || !newExpected) return;
    const lines: POLine[] = newLines.filter(l => l.productId && l.qty > 0).map((l, i) => {
      const prod = products.find(p => p.id === l.productId)!;
      return {
        lineId: i + 1, productId: l.productId, productName: prod.name, sku: prod.sku, uom: prod.uom,
        qty: l.qty, receivedQty: editingPO ? (editingPO.lines.find(x => x.productId === l.productId)?.receivedQty ?? 0) : 0,
        unitCost: prod.unitCost, lineTotal: l.qty * prod.unitCost,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const taxAmount = subtotal * PO_TAX_RATE;
    const currentUser = users.find(u => u.role === "WarehouseManager")?.name ?? "Karim Ben Ali";
    const wh = warehouses.find(w => w.id === newWarehouse);

    if (editingPO) {
      const updated: PurchaseOrder = {
        ...editingPO, vendorId: vendor.id, vendorName: vendor.name, orderDate: newOrderDate, expectedDate: newExpected,
        subtotal, taxAmount, totalAmount: subtotal + taxAmount, taxRatePct: PO_TAX_RATE * 100, notes: newNotes.trim(),
        deliveryWarehouseId: newWarehouse, deliveryWarehouseName: wh?.name, paymentTerms: vendor.paymentTerms || "Net_30", vendorRef: newVendorRef.trim() || undefined,
        lines,
      };
      setData(prev => prev.map(p => p.id === editingPO.id ? updated : p));
      setShowCreate(false);
      resetForm();
      toast({ title: "PO mise à jour", description: updated.id });
      return;
    }

    const newPO: PurchaseOrder = {
      id: `PO-2026-${String(150 + data.length).padStart(4, "0")}`,
      vendorId: vendor.id, vendorName: vendor.name, createdBy: currentUser,
      orderDate: newOrderDate, expectedDate: newExpected,
      status: "Draft", subtotal, taxAmount, totalAmount: subtotal + taxAmount, taxRatePct: PO_TAX_RATE * 100,
      notes: newNotes.trim(), lines,
      deliveryWarehouseId: newWarehouse, deliveryWarehouseName: wh?.name,
      paymentTerms: vendor.paymentTerms || "Net_30", vendorRef: newVendorRef.trim() || undefined,
    };
    setData([newPO, ...data]);
    setShowCreate(false);
    resetForm();
    toast({ title: "Commande d'achat créée", description: newPO.id });
  };

  const handleAction = (poId: string, action: "send" | "approve" | "cancel") => {
    setData(prev => prev.map(po => {
      if (po.id !== poId) return po;
      if (action === "send") return { ...po, status: "Sent" as const };
      if (action === "approve") return { ...po, status: "Confirmed" as const, approvedBy: users.find(u => u.role === "CEO")?.name ?? "Ahmed Mansour" };
      return { ...po, status: "Cancelled" as const };
    }));
    toast({ title: action === "send" ? "PO envoyée" : action === "approve" ? "PO confirmée" : "PO annulée" });
  };

  const handlePrint = (po: PurchaseOrder) => {
    const vendor = vendors.find(v => v.id === po.vendorId);
    const w = window.open("", "_blank", "width=800,height=600");
    if (w) {
      const linesHtml = po.lines.map(l => `<tr><td>${l.productName} ${l.uom ? `(${l.uom})` : ""}</td><td>${l.qty}</td><td>${currency(l.unitCost)}</td><td>${currency(l.lineTotal)}</td></tr>`).join("");
      w.document.write(`<!DOCTYPE html><html><head><title>PO ${po.id}</title><style>body{font-family:system-ui;padding:24px;font-size:12px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;} th{background:#f5f5f5;} .right{text-align:right;}</style></head><body>
        <h1>Commande d'achat ${po.id}</h1>
        <p><strong>Fournisseur:</strong> ${po.vendorName} | <strong>Contact:</strong> ${vendor?.contact ?? ""} ${vendor?.phone ?? ""}</p>
        <p><strong>Date:</strong> ${po.orderDate} | <strong>Livraison prévue:</strong> ${po.expectedDate} | <strong>Livraison:</strong> ${po.deliveryWarehouseName ?? "—"} | <strong>Paiement:</strong> ${PAYMENT_TERMS_LABELS[po.paymentTerms ?? ""] ?? po.paymentTerms ?? "—"}</p>
        <table><thead><tr><th>Produit</th><th class="right">Qté</th><th class="right">Prix unit.</th><th class="right">Total</th></tr></thead><tbody>${linesHtml}</tbody></table>
        <p style="margin-top:16px;"><strong>Sous-total:</strong> ${currency(po.subtotal)} | <strong>TVA 19%:</strong> ${currency(po.taxAmount)} | <strong>Total TTC:</strong> ${currency(po.totalAmount)}</p>
        ${po.notes ? `<p><strong>Notes:</strong> ${po.notes}</p>` : ""}
        </body></html>`);
      w.document.close();
      w.focus();
      w.print();
      w.close();
    }
    toast({ title: "Impression", description: "Fenêtre d'impression ouverte." });
  };

  const dateValidationError = newOrderDate && newExpected && newOrderDate > newExpected ? "La date de livraison doit être ≥ date de commande" : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Commandes d'achat (PO)</h1>
            <p className="text-sm text-muted-foreground">{data.length} commandes — TVA 19%</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> Exporter</Button>
          {isOperationalRole && canCreate("purchaseOrder") && (operationalWarehouseIds === null || (operationalWarehouseIds?.length ?? 0) > 0) && (
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle PO</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Brouillons", value: data.filter(p => p.status === "Draft").length },
          { label: "Envoyées", value: data.filter(p => p.status === "Sent").length },
          { label: "Confirmées", value: data.filter(p => p.status === "Confirmed").length },
          { label: "En réception", value: data.filter(p => p.status === "Partially_Received").length },
          { label: "Reçues", value: data.filter(p => p.status === "Received").length },
        ].map(c => (
          <div key={c.label} className="glass-card rounded-xl p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className="text-lg font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher PO ou fournisseur..." value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <DateFilter value={dateFrom} onChange={setDateFrom} placeholder="Du" />
        <DateFilter value={dateTo} onChange={setDateTo} placeholder="Au" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous les statuts</option>
          <option value="Draft">Brouillon</option>
          <option value="Sent">Envoyée</option>
          <option value="Confirmed">Confirmée</option>
          <option value="Partially_Received">Partiellement reçue</option>
          <option value="Received">Reçue</option>
          <option value="Cancelled">Annulée</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="date">Tri: Date</option>
          <option value="vendor">Tri: Fournisseur</option>
          <option value="amount">Tri: Montant</option>
          <option value="status">Tri: Statut</option>
        </select>
        <button type="button" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="h-9 px-2 rounded-lg border border-input bg-muted/50" title={sortDir === "asc" ? "Descendant" : "Ascendant"}>{sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucune commande d'achat</p>
            <p className="text-sm mt-1">Ajustez les filtres ou créez une nouvelle PO.</p>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">PO #</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Fournisseur</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Livraison prévue</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Total TTC</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground sticky right-0 bg-muted/30 min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(po => (
              <tr key={po.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{po.id}</td>
                <td className="px-4 py-3 font-medium">{po.vendorName}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{po.orderDate}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{po.expectedDate}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(po.totalAmount)}</td>
                <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                <td className="px-4 py-3 text-right sticky right-0 bg-card/90 backdrop-blur-sm min-w-[140px]">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedPO(po)} className="p-1.5 rounded-md hover:bg-muted" title="Voir"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => handlePrint(po)} className="p-1.5 rounded-md hover:bg-muted" title="Imprimer"><Printer className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    {po.status === "Draft" && canOperateOn(po.deliveryWarehouseId || "") && (
                      <>
                        <button onClick={() => openEdit(po)} className="p-1.5 rounded-md hover:bg-muted" title="Modifier"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button onClick={() => handleAction(po.id, "send")} className="p-1.5 rounded-md hover:bg-info/10" title="Envoyer"><Send className="h-3.5 w-3.5 text-info" /></button>
                      </>
                    )}
                    {canOperateOn(po.deliveryWarehouseId || "") && (
                      <button onClick={() => openDuplicate(po)} className="p-1.5 rounded-md hover:bg-muted" title="Dupliquer"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    )}
                    {po.status === "Sent" && canOperateOn(po.deliveryWarehouseId || "") && (
                      <button onClick={() => handleAction(po.id, "approve")} className="p-1.5 rounded-md hover:bg-success/10" title="Confirmer"><CheckCircle className="h-3.5 w-3.5 text-success" /></button>
                    )}
                    {(po.status === "Draft" || po.status === "Sent") && canOperateOn(po.deliveryWarehouseId || "") && (
                      <button onClick={() => handleAction(po.id, "cancel")} className="p-1.5 rounded-md hover:bg-destructive/10" title="Annuler"><XCircle className="h-3.5 w-3.5 text-destructive" /></button>
                    )}
                    {!canOperateOn(po.deliveryWarehouseId || "") && (po.status === "Draft" || po.status === "Sent") && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Hors périmètre"><Lock className="h-3.5 w-3.5" /></span>
                    )}
                    {/* Change status dropdown */}
                    {canOperateOn(po.deliveryWarehouseId || "") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Changer statut">
                            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["Draft", "Sent", "Confirmed", "Partially_Received", "Received", "Cancelled"] as const).filter(s => s !== po.status).map(s => (
                            <DropdownMenuItem key={s} onClick={() => { setData(prev => prev.map(p => p.id === po.id ? { ...p, status: s } : p)); toast({ title: "Statut modifié", description: `${po.id} → ${s}` }); }}>
                              <StatusBadge status={s} />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      <Dialog open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPO && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3"><span className="font-mono">{selectedPO.id}</span><StatusBadge status={selectedPO.status} /></span>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handlePrint(selectedPO)}><Printer className="h-4 w-4" /> Imprimer</Button>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">Fournisseur :</span> <span className="font-medium">{selectedPO.vendorName}</span></div>
                <div><span className="text-muted-foreground">Contact :</span> {vendors.find(v => v.id === selectedPO.vendorId)?.contact} — {vendors.find(v => v.id === selectedPO.vendorId)?.phone}</div>
                <div><span className="text-muted-foreground">Créé par :</span> {selectedPO.createdBy}</div>
                <div><span className="text-muted-foreground">Date commande :</span> {selectedPO.orderDate}</div>
                <div><span className="text-muted-foreground">Livraison prévue :</span> {selectedPO.expectedDate}</div>
                <div><span className="text-muted-foreground">Livraison :</span> {selectedPO.deliveryWarehouseName ?? "—"}</div>
                <div><span className="text-muted-foreground">Paiement :</span> {PAYMENT_TERMS_LABELS[selectedPO.paymentTerms ?? ""] ?? selectedPO.paymentTerms ?? "—"}</div>
                <div><span className="text-muted-foreground">Réf. fournisseur :</span> {selectedPO.vendorRef ?? "—"}</div>
                <div><span className="text-muted-foreground">Approuvé par :</span> {selectedPO.approvedBy || "—"}</div>
                <div><span className="text-muted-foreground">Total TTC :</span> <span className="font-medium">{currency(selectedPO.totalAmount)}</span></div>
                {(selectedPO.status === "Sent" || selectedPO.status === "Confirmed") && selectedPO.lines.some((l: { receivedQty: number; qty: number }) => l.receivedQty < l.qty) && (
                  <div className="col-span-2">
                    <Link to="/wms/grn" className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <Package className="h-4 w-4" /> Créer une réception (GRN)
                    </Link>
                  </div>
                )}
                {selectedPO.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes :</span> {selectedPO.notes}</div>}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Lignes de commande</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">Produit</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">Unité</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Commandée</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Reçue</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Progression</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Coût unit.</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.lines.map(line => (
                      <tr key={line.lineId} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{line.productName}</td>
                        <td className="py-2 px-2 text-muted-foreground">{line.uom ?? "—"}</td>
                        <td className="py-2 px-2 text-right">{line.qty}</td>
                        <td className="py-2 px-2 text-right">{line.receivedQty > 0 ? line.receivedQty : "—"}</td>
                        <td className="py-2 px-2 text-right">
                          {line.qty > 0 && (
                            <span className={`font-medium ${line.receivedQty >= line.qty ? "text-success" : "text-warning"}`}>
                              {Math.round((line.receivedQty / line.qty) * 100)}%
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right">{currency(line.unitCost)}</td>
                        <td className="py-2 px-2 text-right font-medium">{currency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              {editingPO ? "Modifier la commande d'achat" : "Nouvelle commande d'achat"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <FormSection title="Fournisseur" icon={<User className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Fournisseur" required
                  hint={selectedVendor ? `Paiement: ${PAYMENT_TERMS_LABELS[selectedVendor.paymentTerms ?? ""] ?? selectedVendor.paymentTerms} | Délai: ${selectedVendor.avgLeadDays}j` : undefined}>
                  <select value={newVendor} onChange={e => setNewVendor(e.target.value)} className={formSelectClass}>
                    <option value="">Sélectionner un fournisseur...</option>
                    {vendors.filter(v => v.status === "Active").map(v => (
                      <option key={v.id} value={v.id}>{v.name} — {v.city}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Réf. fournisseur" hint="N° devis ou commande">
                  <input value={newVendorRef} onChange={e => setNewVendorRef(e.target.value)} placeholder="Ex: CEV-PO-12345" className={formInputClass} />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Planning" icon={<Calendar className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Date commande" required>
                  <DateFilter value={newOrderDate} onChange={setNewOrderDate} placeholder="Date commande" className="w-full" />
                </FormField>
                <FormField label="Livraison prévue" required error={dateValidationError}>
                  <DateFilter value={newExpected} onChange={setNewExpected} placeholder="Date livraison" className="w-full" />
                </FormField>
                <FormField label="Livraison à" icon={<MapPin className="h-3.5 w-3.5" />} required>
                  <select value={newWarehouse} onChange={e => setNewWarehouse(e.target.value)} className={formSelectClass}>
                    {(operationalWarehouseIds === null ? warehouses : operationalWarehouses).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Articles" icon={<Package className="h-3.5 w-3.5" />}>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground">{newLines.filter(l => l.productId).length} article(s)</span>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setNewLines([...newLines, { productId: "", qty: 0 }])}>
                    <Plus className="h-3 w-3" /> Ajouter
                  </Button>
                </div>
                <div className="divide-y divide-border/50">
                  {newLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1">
                        <ProductCombobox
                          products={productOptions}
                          value={line.productId}
                          onSelect={(p) => { const u = [...newLines]; u[i].productId = p.id; setNewLines(u); }}
                          placeholder="Rechercher un produit..."
                          className="w-full"
                        />
                      </div>
                      <div className="w-24">
                        <input type="number" min={1} placeholder="Qté" value={line.qty || ""} onChange={e => { const u = [...newLines]; u[i].qty = Number(e.target.value); setNewLines(u); }}
                          className={formInputClass + " text-right font-medium"} />
                      </div>
                      <div className="w-24 text-right text-xs text-muted-foreground font-medium">
                        {line.productId && line.qty > 0 ? currency((products.find(p => p.id === line.productId)?.unitCost ?? 0) * line.qty) : "—"}
                      </div>
                      {newLines.length > 1 && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setNewLines(newLines.filter((_, j) => j !== i))}>
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-5 text-sm pt-1 px-1">
                <span className="text-muted-foreground">Sous-total HT: <strong className="text-foreground">{currency(liveTotals.subtotal)}</strong></span>
                <span className="text-muted-foreground">TVA 19%: <strong className="text-foreground">{currency(liveTotals.taxAmount)}</strong></span>
                <span className="text-primary font-bold text-base">Total TTC: {currency(liveTotals.totalAmount)}</span>
              </div>
            </FormSection>

            <FormSection title="Notes" icon={<MessageSquare className="h-3.5 w-3.5" />}>
              <FormField label="Instructions / remarques">
                <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Instructions livraison, remarques..." className={formTextareaClass} />
              </FormField>
            </FormSection>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Annuler</Button>
            <Button onClick={handleSave} disabled={!newVendor || !newExpected || newLines.every(l => !l.productId) || !!dateValidationError} className="gap-1.5">
              {editingPO ? <><Pencil className="h-4 w-4" /> Enregistrer</> : <><Plus className="h-4 w-4" /> Créer PO</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={poExportCols} filename="commandes-achat" dateKey="orderDate" statusKey="status" statusOptions={["Draft", "Sent", "Confirmed", "Partially_Received", "Received", "Cancelled"]} />
    </div>
  );
}
