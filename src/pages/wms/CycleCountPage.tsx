import { useState } from "react";
import { ClipboardCheck, Eye, Play, CheckCircle, Plus, FileText, Lock, MapPin, Calendar, Package, RotateCcw, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DateFilter } from "@/components/DateFilter";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import type { CycleCount, CycleCountLine } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";
import { useUnitConversion } from "@/hooks/useUnitConversion";

export default function CycleCountPage() {
  const { t } = useTranslation();
  const { inventory, setInventory, cycleCounts: data, setCycleCounts: setData, warehouses } = useWMSData();
  const { currentUser, accessibleWarehouseIds, isFullAccess } = useAuth();
  const { canOperateOn, operationalWarehouses, defaultWarehouseId, isOperationalRole } = useWarehouseScope();
  const { getBaseUnitAbbr } = useUnitConversion();

  const scopedData = isFullAccess ? data : data.filter(cc => accessibleWarehouseIds?.includes(cc.warehouseId));
  const [selectedCC, setSelectedCC] = useState<CycleCount | null>(null);
  const [showCount, setShowCount] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [countingCC, setCountingCC] = useState<CycleCount | null>(null);
  const [countValues, setCountValues] = useState<Record<string, number>>({});
  const [newCC, setNewCC] = useState({ warehouseId: defaultWarehouseId, zone: "A", date: new Date().toISOString().slice(0, 10) });
  const [exportOpen, setExportOpen] = useState(false);

  const ccExportCols: ExportColumn<CycleCount>[] = [
    { key: "id", label: t("cycleCount.colID") }, { key: "warehouseName", label: t("cycleCount.colWarehouse") }, { key: "zone", label: t("cycleCount.colZone") },
    { key: "scheduledDate", label: t("cycleCount.colDate") }, { key: "totalItems", label: t("cycleCount.colItems") },
    { key: "itemsCounted", label: t("cycleCount.colCounted") }, { key: "totalVariance", label: t("cycleCount.colVariance") }, { key: "status", label: t("cycleCount.colStatus") },
  ];

  const canCreate = isOperationalRole && operationalWarehouses.length > 0;

  const getVarianceClass = (pct: number) => {
    const abs = Math.abs(pct);
    if (abs > 5) return "text-destructive font-bold";
    if (abs > 2) return "text-warning font-semibold";
    if (abs > 0.5) return "text-info font-medium";
    return "text-success";
  };

  const getApprovalLevel = (pct: number) => {
    const abs = Math.abs(pct);
    if (abs <= 0.5) return { level: t("cycleCount.autoApproval"), color: "text-success" };
    if (abs <= 2) return { level: t("cycleCount.whManagerReview"), color: "text-info" };
    if (abs <= 5) return { level: t("cycleCount.investigationDAF"), color: "text-warning" };
    return { level: t("cycleCount.adminDGInvestigation"), color: "text-destructive" };
  };

  const startCounting = (cc: CycleCount) => {
    if (!canOperateOn(cc.warehouseId)) {
      toast({ title: t("cycleCount.accessDenied"), description: t("cycleCount.outOfScope"), variant: "destructive" });
      return;
    }
    setCountingCC(cc);
    const vals: Record<string, number> = {};
    cc.lines.forEach(l => { vals[l.productId] = l.expectedQty; });
    setCountValues(vals);
    setShowCount(true);
  };

  const submitCount = () => {
    if (!countingCC) return;
    let updatedCC: CycleCount | null = null;
    setData(prev => prev.map(cc => {
      if (cc.id !== countingCC.id) return cc;
      const newLines = cc.lines.map(l => {
        const counted = countValues[l.productId] ?? l.expectedQty;
        const variance = counted - l.expectedQty;
        return { ...l, countedQty: counted, variance, variancePct: l.expectedQty > 0 ? (variance / l.expectedQty) * 100 : 0 };
      });
      const totalVariance = newLines.reduce((s, l) => s + l.variance, 0);
      const maxAbsPct = Math.max(...newLines.map(l => Math.abs(l.variancePct)), 0);
      let status: CycleCount["status"] = "Pending_Review";
      if (maxAbsPct <= 0.5) status = "Approved";
      else if (maxAbsPct > 5) status = "Requires_Investigation";
      updatedCC = { ...cc, lines: newLines, totalVariance, status, itemsCounted: newLines.length, countedBy: currentUser?.name ?? "—" };
      return updatedCC;
    }));
    if (updatedCC && (updatedCC as CycleCount).status === "Approved") applyCountToInventory(updatedCC as CycleCount);
    setShowCount(false);
    setCountingCC(null);
    toast({ title: t("cycleCount.countSubmitted"), description: countingCC.id });
  };

  const applyCountToInventory = (cc: CycleCount) => {
    setInventory(prev => {
      const next = [...prev];
      for (const line of cc.lines) {
        if (line.countedQty <= 0 && line.variance === 0) continue;
        const locShort = line.locationId.replace(/^WH\d+-/, "") || line.locationId;
        const idx = next.findIndex((i: { productId: string; warehouseId: string; locationId: string }) => i.productId === line.productId && i.warehouseId === cc.warehouseId && (i.locationId === locShort || `${i.warehouseId}-${i.locationId}` === line.locationId));
        if (idx >= 0) {
          const item = next[idx];
          const newQty = Math.max(0, line.countedQty);
          next[idx] = { ...item, qtyOnHand: newQty, qtyAvailable: Math.max(0, newQty - item.qtyReserved) };
        }
      }
      return next;
    });
  };

  const approveCount = (ccId: string) => {
    const cc = data.find(c => c.id === ccId);
    if (!cc) return;
    if (!canOperateOn(cc.warehouseId)) {
      toast({ title: t("cycleCount.accessDenied"), description: t("cycleCount.noAuthority"), variant: "destructive" });
      return;
    }
    if (cc.status === "Pending_Review" || cc.status === "Requires_Investigation") applyCountToInventory(cc);
    setData(prev => prev.map(c => c.id === ccId ? { ...c, status: "Approved" as const, reviewedBy: currentUser?.name ?? "—" } : c));
    toast({ title: t("cycleCount.countApproved") });
  };

  const handleCreateCC = () => {
    if (!canOperateOn(newCC.warehouseId)) {
      toast({ title: t("cycleCount.accessDenied"), description: t("cycleCount.outOfScope"), variant: "destructive" });
      return;
    }
    const wh = warehouses.find(w => w.id === newCC.warehouseId);
    if (!wh) return;
    const invItems = inventory.filter(i => i.warehouseId === newCC.warehouseId && i.locationId.startsWith(newCC.zone)).slice(0, 4);
    if (invItems.length === 0) { toast({ title: t("cycleCount.noStock"), description: t("cycleCount.noStockZone", { zone: newCC.zone }) }); return; }
    const lines: CycleCountLine[] = invItems.map(i => ({ productId: i.productId, productName: i.productName, locationId: `${i.warehouseId}-${i.locationId}`, expectedQty: i.qtyOnHand, countedQty: 0, variance: 0, variancePct: 0 }));
    const newCycle: CycleCount = { id: `CC-${newCC.date.replace(/-/g, "")}-${String(data.length + 1).padStart(3, "0")}`, warehouseId: wh.id, warehouseName: wh.name.replace("Entrepôt ", ""), zone: newCC.zone, scheduledDate: newCC.date, status: "Scheduled", totalItems: lines.length, itemsCounted: 0, totalVariance: 0, lines };
    setData([newCycle, ...data]);
    setShowCreate(false);
    toast({ title: t("cycleCount.countCreated"), description: newCycle.id });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("cycleCount.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("cycleCount.subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> {t("cycleCount.export")}</Button>
          {canCreate ? (
            <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("cycleCount.newCount")}</Button>
          ) : (
            <Button disabled className="gap-2 opacity-50"><Lock className="h-4 w-4" /> {t("cycleCount.newCount")}</Button>
          )}
        </div>
      </div>

      {/* Approval Scale */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t("cycleCount.approvalScale")}</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { range: "0% — 0.5%", action: t("cycleCount.autoApproval"), color: "bg-success/10 text-success" },
            { range: "0.5% — 2%", action: t("cycleCount.whManagerReview"), color: "bg-info/10 text-info" },
            { range: "2% — 5%", action: t("cycleCount.investigationDAF"), color: "bg-warning/10 text-warning" },
            { range: "> 5%", action: t("cycleCount.adminDGInvestigation"), color: "bg-destructive/10 text-destructive" },
          ].map(s => (
            <div key={s.range} className={`rounded-lg p-3 ${s.color}`}>
              <p className="text-xs font-bold">{s.range}</p>
              <p className="text-[10px] mt-1">{s.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {scopedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("cycleCount.noCount")}</p>
            <p className="text-sm mt-1">{t("cycleCount.noCountHint")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colID")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colWarehouse")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colZone")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colDate")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colItems")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colCounted")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colVariance")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colStatus")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("cycleCount.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {scopedData.map(cc => {
                const userCanAct = canOperateOn(cc.warehouseId);
                return (
                  <tr key={cc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => cc.status === "Scheduled" && userCanAct ? startCounting(cc) : setSelectedCC(cc)}>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{cc.id}</td>
                    <td className="px-4 py-3 text-xs">{cc.warehouseName}</td>
                    <td className="px-4 py-3 font-medium">{t("cycleCount.colZone")} {cc.zone}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{cc.scheduledDate}</td>
                    <td className="px-4 py-3 text-right">{cc.totalItems}</td>
                    <td className="px-4 py-3 text-right">{cc.itemsCounted}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cc.totalVariance !== 0 ? "text-warning font-medium" : "text-success"}>{cc.totalVariance}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={cc.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedCC(cc)} className="p-1.5 rounded-md hover:bg-muted"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        {cc.status === "Scheduled" && userCanAct && (
                          <button onClick={() => startCounting(cc)} className="p-1.5 rounded-md hover:bg-primary/10"><Play className="h-3.5 w-3.5 text-primary" /></button>
                        )}
                        {(cc.status === "Pending_Review" || cc.status === "Requires_Investigation") && userCanAct && (
                          <button onClick={() => approveCount(cc.id)} className="p-1.5 rounded-md hover:bg-success/10" title={cc.status === "Requires_Investigation" ? t("cycleCount.approveAfterInvestigation") : t("cycleCount.approve")}><CheckCircle className="h-3.5 w-3.5 text-success" /></button>
                        )}
                         {cc.status !== "Approved" && !userCanAct && (
                          <span className="p-1.5" title={t("cycleCount.outOfScope")}><Lock className="h-3.5 w-3.5 text-muted-foreground/40" /></span>
                        )}
                        {userCanAct && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title={t("cycleCount.changeStatus")}>
                                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(["Scheduled", "In_Progress", "Pending_Review", "Requires_Investigation", "Approved"] as const).filter(s => s !== cc.status).map(s => (
                                <DropdownMenuItem key={s} onClick={() => { setData(prev => prev.map(c => c.id === cc.id ? { ...c, status: s } : c)); toast({ title: t("cycleCount.statusChanged"), description: `${cc.id} → ${s}` }); }}>
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="dialog-icon-primary"><ClipboardCheck className="h-4 w-4" /></div>
              {t("cycleCount.newCountTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <FormSection title={t("cycleCount.location")} icon={<MapPin className="h-3.5 w-3.5" />}>
              <FormField label={t("cycleCount.warehouse")} icon={<Package className="h-3.5 w-3.5" />} required hint={t("cycleCount.warehouseHint")}>
                <select value={newCC.warehouseId} onChange={e => setNewCC(prev => ({ ...prev, warehouseId: e.target.value }))}
                  className={formSelectClass}>
                  {operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </FormField>
              <FormField label={t("cycleCount.zone")} required>
                <select value={newCC.zone} onChange={e => setNewCC(prev => ({ ...prev, zone: e.target.value }))}
                  className={formSelectClass}>
                  {["A", "B", "C", "D", "E", "F"].map(z => <option key={z} value={z}>{t("cycleCount.colZone")} {z}</option>)}
                </select>
              </FormField>
            </FormSection>

            <FormSection title={t("cycleCount.scheduling")} icon={<Calendar className="h-3.5 w-3.5" />}>
              <FormField label={t("cycleCount.scheduledDate")} required>
                <DateFilter value={newCC.date} onChange={(v) => setNewCC(prev => ({ ...prev, date: v }))} placeholder={t("cycleCount.chooseDate")} />
              </FormField>
            </FormSection>

            <div className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border/50 px-3 py-2.5">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">{t("cycleCount.autoLoadHint")} <strong>{t("cycleCount.colZone")} {newCC.zone}</strong></p>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel", "Annuler")}</Button>
            <Button onClick={handleCreateCC} className="gap-1.5">
              <Plus className="h-4 w-4" /> {t("cycleCount.createCount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCC} onOpenChange={() => setSelectedCC(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCC && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><ClipboardCheck className="h-4 w-4" /></div>
                  <div>
                    <span className="block font-mono">{selectedCC.id}</span>
                    <span className="text-xs font-normal text-muted-foreground">{selectedCC.warehouseName} — {t("cycleCount.colZone")} {selectedCC.zone}</span>
                  </div>
                  <div className="ml-auto"><StatusBadge status={selectedCC.status} /></div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("cycleCount.colWarehouse")} :</span> {selectedCC.warehouseName}</div>
                <div><span className="text-muted-foreground">{t("cycleCount.colZone")} :</span> {selectedCC.zone}</div>
                <div><span className="text-muted-foreground">{t("cycleCount.colDate")} :</span> {selectedCC.scheduledDate}</div>
                <div><span className="text-muted-foreground">{t("cycleCount.countedBy")} :</span> {selectedCC.countedBy || "—"}</div>
                <div><span className="text-muted-foreground">{t("cycleCount.reviewedBy")} :</span> {selectedCC.reviewedBy || "—"}</div>
                <div><span className="text-muted-foreground">{t("cycleCount.colVariance")} :</span> <span className="font-medium">{selectedCC.totalVariance}</span></div>
              </div>
              <table className="w-full text-xs mt-4">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground">{t("cycleCount.colProduct", "Produit")}</th>
                    <th className="text-left py-2 px-2 text-muted-foreground">{t("cycleCount.location", "Emplacement")}</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">{t("cycleCount.expectedBase")}</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">{t("cycleCount.countedBase")}</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">{t("cycleCount.variance")}</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">{t("cycleCount.variancePct")}</th>
                    <th className="text-left py-2 px-2 text-muted-foreground">{t("cycleCount.approval")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCC.lines.map(l => {
                    const approval = getApprovalLevel(l.variancePct);
                    return (
                      <tr key={l.productId} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{l.productName}</td>
                        <td className="py-2 px-2 font-mono">{l.locationId}</td>
                        <td className="py-2 px-2 text-right">{l.expectedQty}</td>
                        <td className="py-2 px-2 text-right font-medium">{l.countedQty || "—"}</td>
                        <td className={`py-2 px-2 text-right ${getVarianceClass(l.variancePct)}`}>{l.variance !== 0 ? l.variance : "—"}</td>
                        <td className={`py-2 px-2 text-right ${getVarianceClass(l.variancePct)}`}>{l.variancePct !== 0 ? l.variancePct.toFixed(2) + "%" : "—"}</td>
                        <td className={`py-2 px-2 ${approval.color}`}>{l.countedQty > 0 ? approval.level : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Counting Dialog */}
      <Dialog open={showCount} onOpenChange={setShowCount}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="dialog-icon-primary"><ClipboardCheck className="h-4 w-4" /></div>
              {t("cycleCount.countingTitle", { id: countingCC?.id ?? "" })}
            </DialogTitle>
          </DialogHeader>
          {countingCC && (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">{t("cycleCount.colZone")} {countingCC.zone} — {countingCC.warehouseName}</p>
              {countingCC.lines.map(l => (
                 <div key={l.productId} className="flex items-center gap-4 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{l.productName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{l.locationId}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{t("cycleCount.expected")} : {l.expectedQty} <span className="text-[10px]">{getBaseUnitAbbr(l.productId)}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input type="number" value={countValues[l.productId] || ""} onChange={e => setCountValues({ ...countValues, [l.productId]: Number(e.target.value) })}
                      className="w-24 h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm text-right font-medium"
                      placeholder="Qty" />
                    <span className="text-[10px] text-muted-foreground min-w-[24px]">{getBaseUnitAbbr(l.productId)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCount(false)}>{t("common.cancel", "Annuler")}</Button>
            <Button onClick={submitCount}>{t("cycleCount.submitCount")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={scopedData} columns={ccExportCols} filename="inventaire-cyclique" dateKey="scheduledDate" statusKey="status" statusOptions={["Scheduled", "In_Progress", "Pending_Review", "Requires_Investigation", "Approved"]} />
    </div>
  );
}
