import { useState } from "react";
import { ArrowRightLeft, Plus, CheckCircle, XCircle, Eye, Truck, Search, FileText, Lock, Package, MapPin, Calendar, MessageSquare, AlertTriangle, RotateCcw, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DateFilter } from "@/components/DateFilter";
import { products, currency, warehouseLocations } from "@/data/mockData";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import type { StockTransfer } from "@/data/mockData";
import type { InventoryItem } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormField, FormSection, formSelectClass, formInputClass, formTextareaClass } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { toBaseUnits } from "@/lib/unitConversion";

export default function StockTransfersPage() {
  const { t } = useTranslation();
  const { stockTransfers: data, setStockTransfers: setData, inventory, setInventory, warehouses } = useWMSData();
  const { currentUser, accessibleWarehouseIds, isFullAccess } = useAuth();
  const { canOperateOn, operationalWarehouses, defaultWarehouseId, canCreateTransferFrom, canDispatchTransfer, canReceiveTransfer, isOperationalRole } = useWarehouseScope();

  const [selectedTrf, setSelectedTrf] = useState<StockTransfer | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [exportOpen, setExportOpen] = useState(false);

  const trfExportCols: ExportColumn<StockTransfer>[] = [
    { key: "id", label: t("stockTransfers.colID") }, { key: "productName", label: t("stockTransfers.colProduct") },
    { key: "fromWarehouseName", label: t("stockTransfers.colFrom") }, { key: "toWarehouseName", label: t("stockTransfers.colTo") },
    { key: "qty", label: t("stockTransfers.colQty") }, { key: "status", label: t("stockTransfers.colStatus") },
    { key: "date", label: t("stockTransfers.detailDate") }, { key: "expectedDate", label: t("stockTransfers.colExpectedDate") },
    { key: "createdBy", label: t("stockTransfers.detailCreatedBy") }, { key: "reason", label: t("stockTransfers.reason") },
  ];

  const defaultFromWH = defaultWarehouseId;
  const defaultToWH = warehouses.find(w => w.id !== defaultFromWH)?.id ?? "WH02";
  const { getUnitsForProduct, getBaseUnitAbbr } = useUnitConversion();
  const [newForm, setNewForm] = useState({ productId: "", fromWH: defaultFromWH, toWH: defaultToWH, fromLocId: "", toLocId: "", qty: 0, reason: "", expectedDate: "", unitId: "", unitFactor: 1 });

  const scopedData = isFullAccess ? data : data.filter(trf => accessibleWarehouseIds?.includes(trf.fromWarehouseId) || accessibleWarehouseIds?.includes(trf.toWarehouseId));
  const filtered = scopedData.filter(trf => filterStatus === "all" || trf.status === filterStatus);
  const fromLocations = warehouseLocations.filter(l => l.warehouseId === newForm.fromWH);
  const toLocations = warehouseLocations.filter(l => l.warehouseId === newForm.toWH);
  const availableAtSource = newForm.productId && newForm.fromWH
    ? inventory.filter((i: InventoryItem) => i.productId === newForm.productId && i.warehouseId === newForm.fromWH).reduce((s: number, i: InventoryItem) => s + i.qtyAvailable, 0)
    : 0;
  const stockWarning = newForm.qty > 0 && availableAtSource < newForm.qty ? `${t("stockTransfers.stockAvailableSource")} : ${availableAtSource}` : null;
  const canCreate = isOperationalRole && operationalWarehouses.length > 0;

  const handleCreate = () => {
    if (!canCreateTransferFrom(newForm.fromWH)) {
      toast({ title: t("stockTransfers.accessDenied"), description: t("stockTransfers.noAuthoritySource"), variant: "destructive" });
      return;
    }
    const prod = products.find(p => p.id === newForm.productId);
    const fromWH = warehouses.find(w => w.id === newForm.fromWH);
    const toWH = warehouses.find(w => w.id === newForm.toWH);
    if (!prod || !fromWH || !toWH || !newForm.qty) return;
    const fromLoc = newForm.fromLocId || fromLocations[0]?.id || `${fromWH.id}-A1-01`;
    const toLoc = newForm.toLocId || toLocations[0]?.id || `${toWH.id}-A1-01`;
    const baseQty = Math.round(toBaseUnits(newForm.qty, newForm.unitFactor));
    const newTrf: StockTransfer = {
      id: `TRF-${String(data.length + 1).padStart(3, "0")}`,
      productId: prod.id, productName: prod.name,
      fromWarehouseId: fromWH.id, fromWarehouseName: fromWH.name, fromLocationId: fromLoc,
      toWarehouseId: toWH.id, toWarehouseName: toWH.name, toLocationId: toLoc,
      qty: baseQty, reason: newForm.reason, createdBy: currentUser?.name ?? "—",
      date: new Date().toISOString().split("T")[0], expectedDate: newForm.expectedDate || new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setData([newTrf, ...data]);
    setShowCreate(false);
    setNewForm({ productId: "", fromWH: defaultFromWH, toWH: defaultToWH, fromLocId: "", toLocId: "", qty: 0, reason: "", expectedDate: "", unitId: "", unitFactor: 1 });
    toast({ title: t("stockTransfers.transferCreated"), description: newTrf.id });
  };

  const applyTransferShip = (trf: StockTransfer) => {
    const fromLocShort = trf.fromLocationId.replace(/^WH\d+-/, "") || trf.fromLocationId;
    setInventory(prev => {
      const next = [...prev];
      const idx = next.findIndex((i: InventoryItem) => i.productId === trf.productId && i.warehouseId === trf.fromWarehouseId && (i.locationId === fromLocShort || `${i.warehouseId}-${i.locationId}` === trf.fromLocationId));
      if (idx >= 0) {
        const item = next[idx];
        const newQty = Math.max(0, item.qtyOnHand - trf.qty);
        next[idx] = { ...item, qtyOnHand: newQty, qtyAvailable: Math.max(0, item.qtyAvailable - trf.qty) };
      }
      return next;
    });
  };

  const applyTransferReceive = (trf: StockTransfer) => {
    const toLocShort = trf.toLocationId.replace(/^WH\d+-/, "") || trf.toLocationId;
    const prod = products.find(p => p.id === trf.productId);
    setInventory(prev => {
      const next = [...prev];
      const existing = next.find((i: InventoryItem) => i.productId === trf.productId && i.warehouseId === trf.toWarehouseId && (i.locationId === toLocShort || `${i.warehouseId}-${i.locationId}` === trf.toLocationId));
      if (existing) {
        const idx = next.indexOf(existing);
        next[idx] = { ...existing, qtyOnHand: existing.qtyOnHand + trf.qty, qtyAvailable: existing.qtyAvailable + trf.qty };
      } else {
        const id = `INV-TRF-${Date.now()}-${trf.productId}`;
        next.push({ id, productId: trf.productId, productName: trf.productName, sku: prod?.sku ?? "", category: prod?.category ?? "", warehouseId: trf.toWarehouseId, warehouseName: trf.toWarehouseName, locationId: toLocShort, batchNumber: `TRF-${trf.id}`, expiryDate: "", qtyOnHand: trf.qty, qtyReserved: 0, qtyAvailable: trf.qty, qtyInTransit: 0, unitCostAvg: prod?.unitCost ?? 0, reorderPoint: prod?.reorderPoint ?? 0, minStockLevel: 0, lastCountedAt: new Date().toISOString().slice(0, 10), daysToExpiry: 365, daysSinceMovement: 0, baseUnitId: `DEFAULT-${trf.productId}`, baseUnitAbbr: "Pce", version: 1 });
      }
      return next;
    });
  };

  const handleAction = (id: string, action: "approve" | "ship" | "receive" | "cancel") => {
    const trf = data.find(t => t.id === id);
    if (!trf) return;
    if (action === "approve" || action === "ship" || action === "cancel") {
      if (!canDispatchTransfer(trf.fromWarehouseId)) {
        toast({ title: t("stockTransfers.accessDenied"), description: t("stockTransfers.noAuthorityDispatch"), variant: "destructive" });
        return;
      }
    }
    if (action === "receive") {
      if (!canReceiveTransfer(trf.toWarehouseId)) {
        toast({ title: t("stockTransfers.accessDenied"), description: t("stockTransfers.noAuthorityDest"), variant: "destructive" });
        return;
      }
    }
    if (action === "ship") applyTransferShip(trf);
    if (action === "receive") applyTransferReceive(trf);
    setData(prev => prev.map(t => {
      if (t.id !== id) return t;
      switch (action) {
        case "approve": return { ...t, status: "Approved" as const, approvedBy: currentUser?.name ?? "—" };
        case "ship": return { ...t, status: "In_Transit" as const };
        case "receive": return { ...t, status: "Received" as const };
        case "cancel": return { ...t, status: "Cancelled" as const };
      }
    }));
    const labels: Record<string, string> = { approve: t("stockTransfers.transferApproved"), ship: t("stockTransfers.transferShipped"), receive: t("stockTransfers.transferReceived"), cancel: t("stockTransfers.transferCancelled") };
    toast({ title: labels[action] });
  };

  const canDoAction = (trf: StockTransfer, action: "approve" | "ship" | "receive" | "cancel") => {
    if (action === "approve" || action === "ship" || action === "cancel") return canDispatchTransfer(trf.fromWarehouseId);
    if (action === "receive") return canReceiveTransfer(trf.toWarehouseId);
    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("stockTransfers.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("stockTransfers.subtitle", { count: scopedData.length })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> {t("stockTransfers.export")}</Button>
          {canCreate ? (
            <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("stockTransfers.newTransfer")}</Button>
          ) : (
            <Button disabled className="gap-2 opacity-50"><Lock className="h-4 w-4" /> {t("stockTransfers.newTransfer")}</Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "Draft", "Pending_Approval", "Approved", "In_Transit", "Received", "Cancelled"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? t("stockTransfers.all") : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("stockTransfers.noTransfer")}</p>
            <p className="text-sm mt-1">{t("stockTransfers.noTransferHint")}</p>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colID")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colProduct")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colFrom")}</th>
              <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">→</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colTo")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colQty")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colExpectedDate")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colStatus")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockTransfers.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(trf => (
              <tr key={trf.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{trf.id}</td>
                <td className="px-4 py-3 font-medium text-xs">{trf.productName}</td>
                <td className="px-4 py-3 text-xs">{trf.fromWarehouseName.replace("Entrepôt ", "")}</td>
                <td className="px-4 py-3 text-center"><ArrowRightLeft className="h-3 w-3 text-muted-foreground inline" /></td>
                <td className="px-4 py-3 text-xs">{trf.toWarehouseName.replace("Entrepôt ", "")}</td>
                <td className="px-4 py-3 text-right font-medium">{trf.qty}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{trf.expectedDate}</td>
                <td className="px-4 py-3"><StatusBadge status={trf.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedTrf(trf)} className="p-1.5 rounded-md hover:bg-muted"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    {trf.status === "Draft" && canDoAction(trf, "approve") && (
                      <button onClick={() => handleAction(trf.id, "approve")} className="p-1.5 rounded-md hover:bg-success/10"><CheckCircle className="h-3.5 w-3.5 text-success" /></button>
                    )}
                    {trf.status === "Pending_Approval" && canDoAction(trf, "approve") && (
                      <button onClick={() => handleAction(trf.id, "approve")} className="p-1.5 rounded-md hover:bg-success/10"><CheckCircle className="h-3.5 w-3.5 text-success" /></button>
                    )}
                    {trf.status === "Approved" && canDoAction(trf, "ship") && (
                      <button onClick={() => handleAction(trf.id, "ship")} className="p-1.5 rounded-md hover:bg-info/10"><Truck className="h-3.5 w-3.5 text-info" /></button>
                    )}
                    {trf.status === "In_Transit" && canDoAction(trf, "receive") && (
                      <button onClick={() => handleAction(trf.id, "receive")} className="p-1.5 rounded-md hover:bg-success/10"><CheckCircle className="h-3.5 w-3.5 text-success" /></button>
                    )}
                    {(trf.status === "Draft" || trf.status === "Pending_Approval") && canDoAction(trf, "cancel") && (
                      <button onClick={() => handleAction(trf.id, "cancel")} className="p-1.5 rounded-md hover:bg-destructive/10"><XCircle className="h-3.5 w-3.5 text-destructive" /></button>
                    )}
                    {trf.status !== "Received" && trf.status !== "Cancelled" && !canDoAction(trf, trf.status === "In_Transit" ? "receive" : "approve") && (
                      <span className="p-1.5" title={t("stockTransfers.outOfScope")}><Lock className="h-3.5 w-3.5 text-muted-foreground/40" /></span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title={t("stockTransfers.changeStatus")}>
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(["Draft", "Pending_Approval", "Approved", "In_Transit", "Received", "Cancelled"] as const).filter(s => s !== trf.status).map(s => (
                          <DropdownMenuItem key={s} onClick={() => { setData(prev => prev.map(t => t.id === trf.id ? { ...t, status: s } : t)); toast({ title: t("stockTransfers.statusChanged"), description: `${trf.id} → ${s}` }); }}>
                            <StatusBadge status={s} />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTrf} onOpenChange={() => setSelectedTrf(null)}>
        <DialogContent>
          {selectedTrf && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3"><span className="font-mono">{selectedTrf.id}</span> <StatusBadge status={selectedTrf.status} /></DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("stockTransfers.detailProduct")} :</span> <span className="font-medium">{selectedTrf.productName}</span></div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailQty")} :</span> <span className="font-medium">{selectedTrf.qty}</span></div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailFrom")} :</span> {selectedTrf.fromWarehouseName} <span className="font-mono text-xs">({selectedTrf.fromLocationId})</span></div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailTo")} :</span> {selectedTrf.toWarehouseName} <span className="font-mono text-xs">({selectedTrf.toLocationId})</span></div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailCreatedBy")} :</span> {selectedTrf.createdBy}</div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailApprovedBy")} :</span> {selectedTrf.approvedBy || "—"}</div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailDate")} :</span> {selectedTrf.date}</div>
                <div><span className="text-muted-foreground">{t("stockTransfers.detailExpectedDate")} :</span> {selectedTrf.expectedDate}</div>
                <div className="col-span-2"><span className="text-muted-foreground">{t("stockTransfers.detailReason")} :</span> {selectedTrf.reason}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
              </div>
              {t("stockTransfers.newTransferTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <FormField label={t("stockTransfers.product")} icon={<Package className="h-3.5 w-3.5" />} required>
              <select value={newForm.productId} onChange={e => setNewForm({ ...newForm, productId: e.target.value })} className={formSelectClass}>
                <option value="">{t("stockTransfers.selectProduct")}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </FormField>

            <FormSection title={t("stockTransfers.source")} icon={<MapPin className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("stockTransfers.sourceWarehouse")} required hint={t("stockTransfers.sourceWarehouseHint")}>
                  <select value={newForm.fromWH} onChange={e => setNewForm({ ...newForm, fromWH: e.target.value, fromLocId: "" })} className={formSelectClass}>
                    {operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </FormField>
                <FormField label={t("stockTransfers.sourceLocation")}>
                  <select value={newForm.fromLocId} onChange={e => setNewForm({ ...newForm, fromLocId: e.target.value })} className={formSelectClass}>
                    <option value="">{t("stockTransfers.firstAvailable")}</option>
                    {fromLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.id}</option>)}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">{t("stockTransfers.transferTo")}</span>
              </div>
            </div>

            <FormSection title={t("stockTransfers.destination")} icon={<MapPin className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("stockTransfers.destWarehouse")} required>
                  <select value={newForm.toWH} onChange={e => setNewForm({ ...newForm, toWH: e.target.value, toLocId: "" })} className={formSelectClass}>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </FormField>
                <FormField label={t("stockTransfers.destLocation")}>
                  <select value={newForm.toLocId} onChange={e => setNewForm({ ...newForm, toLocId: e.target.value })} className={formSelectClass}>
                    <option value="">{t("stockTransfers.firstAvailable")}</option>
                    {toLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.id}</option>)}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title={t("stockTransfers.details")} icon={<Calendar className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-3 gap-3">
                <FormField label={t("stockTransfers.quantity")} required error={stockWarning}>
                  <input type="number" min={1} value={newForm.qty || ""} onChange={e => setNewForm({ ...newForm, qty: Number(e.target.value) })}
                    placeholder="0" className={cn(formInputClass, "text-right font-semibold", stockWarning && "border-destructive")} />
                </FormField>
                <FormField label={t("stockTransfers.unit")}>
                  {(() => {
                    const units = getUnitsForProduct(newForm.productId, "buy");
                    if (!newForm.productId || units.length <= 1) {
                      return <span className="text-xs text-muted-foreground pt-2 block">{newForm.productId ? getBaseUnitAbbr(newForm.productId) || "unité" : "—"}</span>;
                    }
                    const sel = units.find(u => u.id === newForm.unitId) ?? units.find(u => u.isStockUnit) ?? units[0];
                    const baseEquiv = newForm.qty > 0 && sel ? Math.round(toBaseUnits(newForm.qty, sel.conversionFactor)) : 0;
                    return (
                      <div>
                        <select value={newForm.unitId || sel?.id || ""} onChange={e => { const u = units.find(u => u.id === e.target.value); if (u) setNewForm({ ...newForm, unitId: u.id, unitFactor: u.conversionFactor }); }} className={formSelectClass}>
                          {units.map(u => (<option key={u.id} value={u.id}>{u.unitAbbreviation} {u.conversionFactor === 1 ? "(base)" : `(×${u.conversionFactor})`}</option>))}
                        </select>
                        {sel && !sel.isStockUnit && baseEquiv > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">= {baseEquiv.toLocaleString("fr-FR")} {getBaseUnitAbbr(newForm.productId)}</p>
                        )}
                      </div>
                    );
                  })()}
                </FormField>
                <FormField label={t("stockTransfers.expectedArrival")}>
                  <DateFilter value={newForm.expectedDate} onChange={(v) => setNewForm({ ...newForm, expectedDate: v })} placeholder={t("stockTransfers.chooseDate")} />
                </FormField>
              </div>
              {newForm.productId && newForm.qty > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-primary">
                    {t("stockTransfers.stockAvailableSource")} : <strong>{availableAtSource}</strong> {getBaseUnitAbbr(newForm.productId) || "unités"} (base)
                  </p>
                </div>
              )}
              <FormField label={t("stockTransfers.reason")} icon={<MessageSquare className="h-3.5 w-3.5" />}>
                <textarea value={newForm.reason} onChange={e => setNewForm({ ...newForm, reason: e.target.value })}
                  placeholder={t("stockTransfers.reasonPlaceholder")} className={formTextareaClass} />
              </FormField>
            </FormSection>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel", "Annuler")}</Button>
            <Button onClick={handleCreate} disabled={!newForm.productId || !newForm.qty || !!stockWarning} className="gap-1.5">
              <Plus className="h-4 w-4" /> {t("stockTransfers.createTransfer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={trfExportCols} filename="transferts-stock" dateKey="date" statusKey="status" statusOptions={["Draft", "Pending_Approval", "Approved", "In_Transit", "Received", "Cancelled"]} />
    </div>
  );
}
