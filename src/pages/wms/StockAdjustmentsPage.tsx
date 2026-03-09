import { useState } from "react";
import { Settings2, Plus, CheckCircle, XCircle, Eye, ArrowUpCircle, ArrowDownCircle, Search, FileText, ShieldCheck, Lock, Package, MapPin, AlertTriangle, MessageSquare, RotateCcw, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { products, warehouseLocations, currency } from "@/data/mockData";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import type { StockAdjustment } from "@/data/mockData";
import type { InventoryItem } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getApprovalRequirement } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { FormField, FormSection, formSelectClass, formInputClass, formTextareaClass } from "@/components/ui/form-field";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { toBaseUnits } from "@/lib/unitConversion";

export default function StockAdjustmentsPage() {
  const { t } = useTranslation();
  const { stockAdjustments: data, setStockAdjustments: setData, inventory, setInventory, warehouses: warehousesList } = useWMSData();
  const { currentUser, accessibleWarehouseIds, isFullAccess } = useAuth();
  const { canOperateOn, operationalWarehouses, defaultWarehouseId, isOperationalRole } = useWarehouseScope();

  const [selectedAdj, setSelectedAdj] = useState<StockAdjustment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [exportOpen, setExportOpen] = useState(false);

  const adjExportCols: ExportColumn<StockAdjustment>[] = [
    { key: "id", label: t("stockAdjustments.colID") }, { key: "productName", label: t("stockAdjustments.colProduct") }, { key: "warehouseName", label: t("stockAdjustments.warehouse") },
    { key: "type", label: t("stockAdjustments.colType") }, { key: "direction", label: t("stockAdjustments.colDirection") }, { key: "qty", label: t("stockAdjustments.colQty") },
    { key: "valueLoss", label: t("stockAdjustments.colLoss") }, { key: "status", label: t("stockAdjustments.colStatus") }, { key: "date", label: t("stockAdjustments.colDate") },
    { key: "createdBy", label: t("stockAdjustments.detailCreatedBy") }, { key: "reason", label: t("stockAdjustments.reason") },
  ];

  const { getUnitsForProduct, getBaseUnitAbbr } = useUnitConversion();
  const [newForm, setNewForm] = useState({ productId: "", warehouseId: defaultWarehouseId, locationId: "", type: "Damage" as StockAdjustment["type"], qty: 0, direction: "Decrease" as "Increase" | "Decrease", reason: "", unitId: "", unitFactor: 1 });

  const scopeFiltered = isFullAccess ? data : data.filter(a => accessibleWarehouseIds?.includes(a.warehouseId));
  const filtered = scopeFiltered.filter(a => filterType === "all" || a.type === filterType);
  const locationsForWh = warehouseLocations.filter(loc => loc.warehouseId === newForm.warehouseId);
  const canCreate = isOperationalRole && operationalWarehouses.length > 0;

  const handleCreate = () => {
    if (!canOperateOn(newForm.warehouseId)) {
      toast({ title: t("stockAdjustments.accessDenied"), description: t("stockAdjustments.noAuthority"), variant: "destructive" });
      return;
    }
    const prod = products.find(p => p.id === newForm.productId);
    const wh = warehousesList.find(w => w.id === newForm.warehouseId);
    if (!prod || !wh || !newForm.qty || !newForm.reason) return;
    const baseQty = Math.round(toBaseUnits(newForm.qty, newForm.unitFactor));
    const newAdj: StockAdjustment = {
      id: `ADJ-${String(data.length + 1).padStart(3, "0")}`,
      productId: prod.id, productName: prod.name,
      warehouseId: wh.id, warehouseName: wh.name,
      locationId: newForm.locationId || `${wh.id}-A1-01`,
      type: newForm.type, qty: baseQty, direction: newForm.direction,
      reason: newForm.reason, createdBy: currentUser?.name ?? "—",
      date: new Date().toISOString().split("T")[0], status: "Draft",
      valueLoss: newForm.direction === "Decrease" ? baseQty * prod.unitCost : 0,
    };
    setData([newAdj, ...data]);
    setShowCreate(false);
    setNewForm({ productId: "", warehouseId: defaultWarehouseId, locationId: "", type: "Damage", qty: 0, direction: "Decrease", reason: "", unitId: "", unitFactor: 1 });
    toast({ title: t("stockAdjustments.adjustmentCreated"), description: newAdj.id });
  };

  const applyAdjustmentToInventory = (adj: StockAdjustment) => {
    const locShort = adj.locationId.replace(/^WH\d+-/, "") || adj.locationId;
    setInventory(prev => {
      const next = [...prev];
      const idx = next.findIndex((i: InventoryItem) => i.productId === adj.productId && i.warehouseId === adj.warehouseId && (i.locationId === locShort || i.locationId === adj.locationId || `${i.warehouseId}-${i.locationId}` === adj.locationId));
      if (idx < 0) {
        if (adj.direction === "Increase") {
          const prod = products.find(p => p.id === adj.productId);
          const id = `INV-ADJ-${Date.now()}-${adj.productId}`;
          next.push({ id, productId: adj.productId, productName: adj.productName, sku: prod?.sku ?? "", category: prod?.category ?? "", warehouseId: adj.warehouseId, warehouseName: adj.warehouseName, locationId: locShort, batchNumber: `ADJ-${adj.id}`, expiryDate: "", qtyOnHand: adj.qty, qtyReserved: 0, qtyAvailable: adj.qty, qtyInTransit: 0, unitCostAvg: 0, reorderPoint: prod?.reorderPoint ?? 0, minStockLevel: 0, lastCountedAt: new Date().toISOString().slice(0, 10), daysToExpiry: 365, daysSinceMovement: 0, baseUnitId: `DEFAULT-${adj.productId}`, baseUnitAbbr: "Pce", version: 1 });
        }
        return next;
      }
      const item = next[idx];
      const delta = adj.direction === "Increase" ? adj.qty : -adj.qty;
      const newQty = Math.max(0, item.qtyOnHand + delta);
      next[idx] = { ...item, qtyOnHand: newQty, qtyAvailable: Math.max(0, item.qtyAvailable + delta) };
      return next;
    });
  };

  const handleAction = (id: string, action: "approve" | "reject") => {
    const adj = data.find(a => a.id === id);
    if (!adj) return;
    if (!canOperateOn(adj.warehouseId)) {
      toast({ title: t("stockAdjustments.accessDenied"), description: t("stockAdjustments.noAuthority"), variant: "destructive" });
      return;
    }
    if (action === "approve") applyAdjustmentToInventory(adj);
    setData(prev => prev.map(a => {
      if (a.id !== id) return a;
      return { ...a, status: action === "approve" ? "Approved" as const : "Rejected" as const, approvedBy: action === "approve" ? (currentUser?.name ?? "—") : undefined };
    }));
    toast({ title: action === "approve" ? t("stockAdjustments.adjustmentApproved") : t("stockAdjustments.adjustmentRejected") });
  };

  const submitForApproval = (id: string) => {
    const adj = data.find(a => a.id === id);
    if (adj && !canOperateOn(adj.warehouseId)) {
      toast({ title: t("stockAdjustments.accessDenied"), description: t("stockAdjustments.outOfScope"), variant: "destructive" });
      return;
    }
    setData(prev => prev.map(a => a.id === id ? { ...a, status: "Pending_Approval" as const } : a));
    toast({ title: t("stockAdjustments.submittedForApproval") });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("stockAdjustments.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("stockAdjustments.subtitle", { count: scopeFiltered.length, loss: currency(scopeFiltered.filter(a => a.status === "Approved").reduce((s, a) => s + a.valueLoss, 0)) })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> {t("stockAdjustments.export")}</Button>
          {canCreate ? (
            <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("stockAdjustments.newAdjustment")}</Button>
          ) : (
            <Button disabled className="gap-2 opacity-50"><Lock className="h-4 w-4" /> {t("stockAdjustments.newAdjustment")}</Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: "all", label: t("stockAdjustments.all") },
          { key: "Damage", label: t("stockAdjustments.damage") },
          { key: "Expiry", label: t("stockAdjustments.expiry") },
          { key: "Correction", label: t("stockAdjustments.correction") },
          { key: "Theft", label: t("stockAdjustments.theft") },
          { key: "Shrinkage", label: t("stockAdjustments.shrinkage") },
          { key: "Found", label: t("stockAdjustments.found") },
        ].map(item => (
          <button key={item.key} onClick={() => setFilterType(item.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === item.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("stockAdjustments.noAdjustment")}</p>
            <p className="text-sm mt-1">{t("stockAdjustments.noAdjustmentHint")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colID")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colProduct")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colType")}</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colDirection")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colQty")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colLoss")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colApproval")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colDate")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colStatus")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("stockAdjustments.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(adj => {
                const invItem = inventory.find(i => i.productId === adj.productId && i.warehouseId === adj.warehouseId);
                const variancePct = invItem && invItem.qtyOnHand > 0 ? (adj.qty / invItem.qtyOnHand) * 100 : null;
                const approvalReq = getApprovalRequirement(adj.direction === "Decrease" ? -(variancePct ?? 0) : null);
                const userCanAct = canOperateOn(adj.warehouseId);
                return (
                  <tr key={adj.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{adj.id}</td>
                    <td className="px-4 py-3 font-medium text-xs">{adj.productName}</td>
                    <td className="px-4 py-3"><StatusBadge status={adj.type} /></td>
                    <td className="px-4 py-3 text-center">
                      {adj.direction === "Increase" ? <ArrowUpCircle className="h-4 w-4 text-success inline" /> : <ArrowDownCircle className="h-4 w-4 text-destructive inline" />}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{adj.qty}</td>
                    <td className="px-4 py-3 text-right text-xs">{adj.valueLoss > 0 ? <span className="text-destructive">{currency(adj.valueLoss)}</span> : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border", approvalReq.badgeColor)}>
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {approvalReq.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{adj.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={adj.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedAdj(adj)} className="p-1.5 rounded-md hover:bg-muted"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        {adj.status === "Draft" && userCanAct && (
                          <button onClick={() => submitForApproval(adj.id)} className="p-1.5 rounded-md hover:bg-info/10" title={t("stockAdjustments.submit")}><CheckCircle className="h-3.5 w-3.5 text-info" /></button>
                        )}
                        {adj.status === "Pending_Approval" && userCanAct && (
                          <>
                            <button onClick={() => handleAction(adj.id, "approve")} className="p-1.5 rounded-md hover:bg-success/10"><CheckCircle className="h-3.5 w-3.5 text-success" /></button>
                            <button onClick={() => handleAction(adj.id, "reject")} className="p-1.5 rounded-md hover:bg-destructive/10"><XCircle className="h-3.5 w-3.5 text-destructive" /></button>
                          </>
                        )}
                        {(adj.status === "Draft" || adj.status === "Pending_Approval") && !userCanAct && (
                          <span className="p-1.5" title={t("stockAdjustments.outOfScope")}><Lock className="h-3.5 w-3.5 text-muted-foreground/40" /></span>
                        )}
                        {userCanAct && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title={t("stockAdjustments.changeStatus")}>
                                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(["Draft", "Pending_Approval", "Approved", "Rejected"] as const).filter(s => s !== adj.status).map(s => (
                                <DropdownMenuItem key={s} onClick={() => { setData(prev => prev.map(a => a.id === adj.id ? { ...a, status: s } : a)); toast({ title: t("stockAdjustments.statusChanged"), description: `${adj.id} → ${s}` }); }}>
                                  <StatusBadge status={s} />
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAdj} onOpenChange={() => setSelectedAdj(null)}>
        <DialogContent>
          {selectedAdj && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><Settings2 className="h-4 w-4" /></div>
                  <div>
                    <span className="block font-mono">{selectedAdj.id}</span>
                    <span className="text-xs font-normal text-muted-foreground">{selectedAdj.warehouseName}</span>
                  </div>
                  <div className="ml-auto"><StatusBadge status={selectedAdj.status} /></div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailProduct")} :</span> <span className="font-medium">{selectedAdj.productName}</span></div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailLocation")} :</span> <span className="font-mono">{selectedAdj.locationId}</span></div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailType")} :</span> {selectedAdj.type}</div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailDirection")} :</span> {selectedAdj.direction === "Increase" ? t("stockAdjustments.increase") : t("stockAdjustments.decrease")}</div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailQty")} :</span> <span className="font-medium">{selectedAdj.qty}</span></div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailLoss")} :</span> {selectedAdj.valueLoss > 0 ? <span className="text-destructive font-medium">{currency(selectedAdj.valueLoss)}</span> : "—"}</div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailCreatedBy")} :</span> {selectedAdj.createdBy}</div>
                <div><span className="text-muted-foreground">{t("stockAdjustments.detailApprovedBy")} :</span> {selectedAdj.approvedBy || "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">{t("stockAdjustments.detailReason")} :</span> {selectedAdj.reason}</div>
                {selectedAdj.cycleCountRef && <div className="col-span-2"><span className="text-muted-foreground">{t("stockAdjustments.detailCycleCountRef")} :</span> <span className="font-mono">{selectedAdj.cycleCountRef}</span></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="dialog-icon-primary"><Settings2 className="h-4 w-4" /></div>
              {t("stockAdjustments.newAdjTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <FormSection title={t("stockAdjustments.locationSection")} icon={<MapPin className="h-3.5 w-3.5" />}>
              <FormField label={t("stockAdjustments.warehouse")} icon={<Package className="h-3.5 w-3.5" />} required hint={t("stockAdjustments.warehouseHint")}>
                <select value={newForm.warehouseId} onChange={e => setNewForm({ ...newForm, warehouseId: e.target.value, locationId: "" })}
                  className={formSelectClass}>
                  {operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("stockAdjustments.product")} required>
                  <select value={newForm.productId} onChange={e => setNewForm({ ...newForm, productId: e.target.value })}
                    className={formSelectClass}>
                    <option value="">{t("stockAdjustments.selectProduct")}</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </FormField>
                <FormField label={t("stockAdjustments.location")} hint={t("stockAdjustments.locationHint")}>
                  <select value={newForm.locationId} onChange={e => setNewForm({ ...newForm, locationId: e.target.value })}
                    className={formSelectClass}>
                    <option value="">{t("stockAdjustments.defaultLocation")}</option>
                    {locationsForWh.map(loc => <option key={loc.id} value={loc.id}>{loc.id}</option>)}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title={t("stockAdjustments.adjustmentDetails")} icon={<AlertTriangle className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-3 gap-3">
                <FormField label={t("stockAdjustments.type")} required>
                  <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value as any })}
                    className={formSelectClass}>
                    <option value="Damage">{t("stockAdjustments.damage")}</option>
                    <option value="Expiry">{t("stockAdjustments.expiry")}</option>
                    <option value="Correction">{t("stockAdjustments.correction")}</option>
                    <option value="Theft">{t("stockAdjustments.theft")}</option>
                    <option value="Shrinkage">{t("stockAdjustments.shrinkage")}</option>
                    <option value="Found">{t("stockAdjustments.found")}</option>
                  </select>
                </FormField>
                <FormField label={t("stockAdjustments.direction")} required>
                  <select value={newForm.direction} onChange={e => setNewForm({ ...newForm, direction: e.target.value as any })}
                    className={cn(formSelectClass, newForm.direction === "Decrease" ? "text-destructive" : "text-emerald-600")}>
                    <option value="Decrease">{t("stockAdjustments.decrease")}</option>
                    <option value="Increase">{t("stockAdjustments.increase")}</option>
                  </select>
                </FormField>
                <FormField label={t("stockAdjustments.quantity")} required>
                  <input type="number" min={1} value={newForm.qty || ""} onChange={e => setNewForm({ ...newForm, qty: Number(e.target.value) })}
                    placeholder="0"
                    className={cn(formInputClass, "text-right font-semibold")} />
                </FormField>
              </div>
              {newForm.productId && (() => {
                const units = getUnitsForProduct(newForm.productId, "buy");
                if (units.length <= 1) return null;
                const sel = units.find(u => u.id === newForm.unitId) ?? units.find(u => u.isStockUnit) ?? units[0];
                const baseEquiv = newForm.qty > 0 && sel ? Math.round(toBaseUnits(newForm.qty, sel.conversionFactor)) : 0;
                return (
                  <FormField label={t("stockAdjustments.unitInput")} hint={t("stockAdjustments.unitInputHint")}>
                    <select
                      value={newForm.unitId || sel?.id || ""}
                      onChange={e => {
                        const u = units.find(u => u.id === e.target.value);
                        if (u) setNewForm({ ...newForm, unitId: u.id, unitFactor: u.conversionFactor });
                      }}
                      className={formSelectClass}
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.unitAbbreviation} {u.conversionFactor === 1 ? "(base)" : `(×${u.conversionFactor})`}</option>
                      ))}
                    </select>
                    {sel && !sel.isStockUnit && baseEquiv > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">= {baseEquiv.toLocaleString("fr-FR")} {getBaseUnitAbbr(newForm.productId)}</p>
                    )}
                  </FormField>
                );
              })()}
              {newForm.productId && newForm.qty > 0 && newForm.direction === "Decrease" && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{t("stockAdjustments.estimatedLoss")} : <strong>{currency(Math.round(toBaseUnits(newForm.qty, newForm.unitFactor)) * (products.find(p => p.id === newForm.productId)?.unitCost ?? 0))}</strong></p>
                </div>
              )}
            </FormSection>

            <FormSection title={t("stockAdjustments.justification")} icon={<MessageSquare className="h-3.5 w-3.5" />}>
              <FormField label={t("stockAdjustments.reason")} required hint={t("stockAdjustments.reasonHint")}>
                <textarea value={newForm.reason} onChange={e => setNewForm({ ...newForm, reason: e.target.value })}
                  placeholder={t("stockAdjustments.reasonPlaceholder")}
                  className={formTextareaClass} />
              </FormField>
            </FormSection>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel", "Annuler")}</Button>
            <Button onClick={handleCreate} disabled={!newForm.productId || !newForm.qty || !newForm.reason} className="gap-1.5">
              <Plus className="h-4 w-4" /> {t("stockAdjustments.createAdjustment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={adjExportCols} filename="ajustements-stock" dateKey="date" statusKey="status" statusOptions={["Draft", "Pending_Approval", "Approved", "Rejected"]} />
    </div>
  );
}
