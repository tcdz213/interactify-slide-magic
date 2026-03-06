import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, CheckCircle, Package, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { RepackOrder, RepackStatus, LotBatch } from "@/data/mockData";

export default function RepackingPage() {
  const { t } = useTranslation();
  const { repackOrders: data, setRepackOrders: setData, products, warehouses, warehouseLocations, lotBatches, setLotBatches } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RepackStatus | "all">("all");
  const [selected, setSelected] = useState<RepackOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ productId: "", warehouseId: "", locationId: "", sourceUom: "", targetUom: "", sourceQty: 0, targetQty: 0, reason: "", notes: "", sourceLotId: "" });

  const scopedData = useMemo(() => {
    let d = data.filter((x) => canOperateOn(x.warehouseId));
    if (filterStatus !== "all") d = d.filter((x) => x.status === filterStatus);
    if (search) { const s = search.toLowerCase(); d = d.filter((x) => x.id.toLowerCase().includes(s) || x.productName.toLowerCase().includes(s)); }
    return d;
  }, [data, canOperateOn, filterStatus, search]);

  const { paginatedItems, currentPage, totalPages, setCurrentPage, pageSize, setPageSize } = usePagination(scopedData, 10);
  const locationsForWh = warehouseLocations.filter((l) => l.warehouseId === newForm.warehouseId);
  const availableLots = useMemo(() => {
    if (!newForm.productId || !newForm.warehouseId) return [];
    return lotBatches.filter((l) => l.productId === newForm.productId && l.warehouseId === newForm.warehouseId && l.status === "Active" && l.qty > 0);
  }, [lotBatches, newForm.productId, newForm.warehouseId]);

  const handleCreate = () => {
    if (!newForm.productId || !newForm.warehouseId || !newForm.sourceUom || !newForm.targetUom || newForm.sourceQty <= 0) {
      toast({ title: t("common.error"), description: t("repacking.errorRequired"), variant: "destructive" }); return;
    }
    const prod = products.find((p) => p.id === newForm.productId);
    const wh = warehouses.find((w) => w.id === newForm.warehouseId);
    const sourceLot = lotBatches.find((l) => l.id === newForm.sourceLotId);
    const newRP: RepackOrder = {
      id: `RPK-${String(data.length + 1).padStart(3, "0")}`, productId: newForm.productId, productName: prod?.name ?? newForm.productId,
      warehouseId: newForm.warehouseId, warehouseName: wh?.name ?? newForm.warehouseId, locationId: newForm.locationId || "—",
      sourceUom: newForm.sourceUom, targetUom: newForm.targetUom, sourceQty: newForm.sourceQty, targetQty: newForm.targetQty,
      status: "Pending", createdBy: "Utilisateur courant", createdAt: new Date().toISOString().slice(0, 10),
      reason: newForm.reason, notes: newForm.notes, sourceLotId: sourceLot?.id, sourceLotNumber: sourceLot?.lotNumber,
    };
    setData((prev) => [newRP, ...prev]);
    setShowCreate(false);
    setNewForm({ productId: "", warehouseId: "", locationId: "", sourceUom: "", targetUom: "", sourceQty: 0, targetQty: 0, reason: "", notes: "", sourceLotId: "" });
    toast({ title: t("repacking.created"), description: sourceLot ? t("repacking.createdWithLot", { id: newRP.id, lot: sourceLot.lotNumber }) : newRP.id });
  };

  const generateChildLots = (rp: RepackOrder): { lotIds: string[]; lotNumbers: string[] } => {
    const sourceLot = rp.sourceLotId ? lotBatches.find((l) => l.id === rp.sourceLotId) : null;
    const today = new Date().toISOString().slice(0, 10);
    const suffix = today.replace(/-/g, "").slice(2);
    const productCode = rp.productName.slice(0, 3).toUpperCase();
    const newLotId = `LOT-RPK-${String(lotBatches.length + 1).padStart(3, "0")}`;
    const newLotNumber = `LOT-RPK-${productCode}-${suffix}`;
    const newLot: LotBatch = {
      id: newLotId, lotNumber: newLotNumber, productId: rp.productId, productName: rp.productName,
      vendorId: sourceLot?.vendorId ?? "—", vendorName: sourceLot?.vendorName ?? "Reconditionnement interne",
      warehouseId: rp.warehouseId, warehouseName: rp.warehouseName, locationId: rp.locationId, qty: rp.targetQty,
      manufacturingDate: sourceLot?.manufacturingDate ?? today, expiryDate: sourceLot?.expiryDate ?? "2027-12-31",
      receivedDate: today, grnId: `RPK:${rp.id}`, status: "Active", qcStatus: "Passed",
      notes: `Issu du reconditionnement ${rp.id}${sourceLot ? ` — Lot source: ${sourceLot.lotNumber}` : ""}`,
    };
    setLotBatches((prev) => [newLot, ...prev]);
    if (sourceLot) { setLotBatches((prev) => prev.map((l) => l.id === sourceLot.id ? { ...l, qty: Math.max(0, l.qty - rp.sourceQty) } : l)); }
    return { lotIds: [newLotId], lotNumbers: [newLotNumber] };
  };

  const handleAction = (id: string, action: "start" | "complete" | "cancel") => {
    if (action === "complete") {
      const rp = data.find((x) => x.id === id);
      if (rp) {
        const { lotIds, lotNumbers } = generateChildLots(rp);
        setData((prev) => prev.map((x) => x.id !== id ? x : { ...x, status: "Completed" as RepackStatus, completedAt: new Date().toISOString().slice(0, 10), targetLotIds: lotIds, targetLotNumbers: lotNumbers }));
        toast({ title: t("repacking.completedSuccess"), description: t("repacking.completedLots", { id, lots: lotNumbers.join(", ") }) });
        return;
      }
    }
    setData((prev) => prev.map((x) => { if (x.id !== id) return x; if (action === "start") return { ...x, status: "In_Progress" as RepackStatus }; return { ...x, status: "Cancelled" as RepackStatus }; }));
    toast({ title: action === "start" ? t("repacking.started") : t("repacking.cancelled") });
  };

  const statuses: RepackStatus[] = ["Pending", "In_Progress", "Completed", "Cancelled"];
  const statusLabels: Record<RepackStatus, string> = { Pending: t("repacking.statusPending"), In_Progress: t("repacking.statusInProgress"), Completed: t("repacking.statusCompleted"), Cancelled: t("repacking.statusCancelled") };

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("repacking.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("repacking.subtitle")}</p>
        </div>
        {canCreate("stockAdjustment") && <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />{t("repacking.newRepack")}</Button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((s) => {
          const count = data.filter((x) => x.status === s && canOperateOn(x.warehouseId)).length;
          return (
            <Card key={s} className="cursor-pointer hover:ring-2 ring-primary/30" onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
              <CardContent className="p-4"><p className="text-xs text-muted-foreground">{statusLabels[s]}</p><p className="text-2xl font-bold">{count}</p></CardContent>
            </Card>
          );
        })}
      </div>

      <div className="relative max-w-sm"><Input placeholder={t("repacking.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t("repacking.id")}</TableHead><TableHead>{t("repacking.product")}</TableHead><TableHead>{t("repacking.sourceLot")}</TableHead>
            <TableHead>{t("repacking.source")}</TableHead><TableHead>{t("repacking.target")}</TableHead><TableHead>{t("repacking.sourceQty")}</TableHead>
            <TableHead>{t("repacking.targetQty")}</TableHead><TableHead>{t("repacking.generatedLots")}</TableHead><TableHead>{t("repacking.status")}</TableHead><TableHead>{t("repacking.actions")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {paginatedItems.map((rp) => (
              <TableRow key={rp.id}>
                <TableCell className="font-mono text-xs">{rp.id}</TableCell>
                <TableCell>{rp.productName}</TableCell>
                <TableCell>{rp.sourceLotNumber ? <Badge variant="outline" className="text-xs gap-1"><Link2 className="h-3 w-3" />{rp.sourceLotNumber}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                <TableCell className="text-xs">{rp.sourceUom}</TableCell>
                <TableCell className="text-xs">{rp.targetUom}</TableCell>
                <TableCell>{rp.sourceQty}</TableCell>
                <TableCell>{rp.targetQty}</TableCell>
                <TableCell>
                  {rp.targetLotNumbers && rp.targetLotNumbers.length > 0 ? (
                    <div className="flex flex-wrap gap-1">{rp.targetLotNumbers.map((ln) => <Badge key={ln} variant="secondary" className="text-[10px] gap-1"><Package className="h-3 w-3" />{ln}</Badge>)}</div>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell><StatusBadge status={rp.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(rp)}><Eye className="h-3.5 w-3.5" /></Button>
                    {rp.status === "Pending" && canOperateOn(rp.warehouseId) && <Button size="sm" variant="outline" onClick={() => handleAction(rp.id, "start")}>{t("repacking.start")}</Button>}
                    {rp.status === "In_Progress" && canOperateOn(rp.warehouseId) && <Button size="sm" variant="outline" onClick={() => handleAction(rp.id, "complete")}><CheckCircle className="h-3.5 w-3.5" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">{t("repacking.noRepackFound")}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={scopedData.length} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("repacking.detail", { id: selected?.id })}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p><strong>{t("repacking.productLabel")}</strong> {selected.productName}</p>
              <p><strong>{t("repacking.warehouseLabel")}</strong> {selected.warehouseName}</p>
              <p><strong>{t("repacking.locationLabel")}</strong> {selected.locationId}</p>
              <p><strong>{t("repacking.sourceLabel")}</strong> {selected.sourceQty} × {selected.sourceUom}</p>
              <p><strong>{t("repacking.targetLabel")}</strong> {selected.targetQty} × {selected.targetUom}</p>
              <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> {t("repacking.lotTraceability")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{t("repacking.sourceLotLabel")}</span>
                  {selected.sourceLotNumber ? <Badge variant="outline" className="text-xs">{selected.sourceLotNumber}</Badge> : <span className="text-xs text-muted-foreground italic">{t("repacking.notSpecified")}</span>}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs">{t("repacking.generatedLotsLabel")}</span>
                  {selected.targetLotNumbers && selected.targetLotNumbers.length > 0 ? (
                    <div className="flex flex-wrap gap-1">{selected.targetLotNumbers.map((ln) => <Badge key={ln} variant="secondary" className="text-xs gap-1"><Package className="h-3 w-3" /> {ln}</Badge>)}</div>
                  ) : <span className="text-xs text-muted-foreground italic">{selected.status === "Completed" ? t("common.none") : t("repacking.generatedOnComplete")}</span>}
                </div>
              </div>
              <p><strong>{t("repacking.reasonLabel")}</strong> {selected.reason}</p>
              <p><strong>{t("repacking.statusLabel")}</strong> <StatusBadge status={selected.status} /></p>
              <p><strong>{t("repacking.createdByLabel")}</strong> {selected.createdBy} le {selected.createdAt}</p>
              {selected.completedAt && <p><strong>{t("repacking.completedLabel")}</strong> {selected.completedAt}</p>}
              {selected.notes && <p><strong>{t("repacking.notesLabel")}</strong> {selected.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("repacking.createTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormSection title={t("repacking.info")}>
              <FormField label={t("repacking.warehouse")}>
                <select className={formSelectClass} value={newForm.warehouseId} onChange={(e) => setNewForm({ ...newForm, warehouseId: e.target.value, locationId: "", sourceLotId: "" })}>
                  <option value="">{t("repacking.selectPlaceholder")}</option>
                  {operationalWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </FormField>
              <FormField label={t("repacking.productField")}>
                <select className={formSelectClass} value={newForm.productId} onChange={(e) => setNewForm({ ...newForm, productId: e.target.value, sourceLotId: "" })}>
                  <option value="">{t("repacking.selectPlaceholder")}</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FormField>
              <FormField label={t("repacking.lotSourceField")}>
                <select className={formSelectClass} value={newForm.sourceLotId} onChange={(e) => setNewForm({ ...newForm, sourceLotId: e.target.value })} disabled={availableLots.length === 0}>
                  <option value="">{availableLots.length === 0 ? t("repacking.noLotAvailable") : t("repacking.selectLot")}</option>
                  {availableLots.map((l) => <option key={l.id} value={l.id}>{l.lotNumber} — {l.qty} unités — DLC: {l.expiryDate}</option>)}
                </select>
              </FormField>
              {locationsForWh.length > 0 && (
                <FormField label={t("repacking.location")}>
                  <select className={formSelectClass} value={newForm.locationId} onChange={(e) => setNewForm({ ...newForm, locationId: e.target.value })}>
                    <option value="">{t("repacking.selectPlaceholder")}</option>
                    {locationsForWh.map((l) => <option key={l.id} value={l.id}>{l.id}</option>)}
                  </select>
                </FormField>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("repacking.sourceUom")}><Input className={formInputClass} value={newForm.sourceUom} onChange={(e) => setNewForm({ ...newForm, sourceUom: e.target.value })} /></FormField>
                <FormField label={t("repacking.targetUom")}><Input className={formInputClass} value={newForm.targetUom} onChange={(e) => setNewForm({ ...newForm, targetUom: e.target.value })} /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("repacking.sourceQty")}><Input type="number" className={formInputClass} value={newForm.sourceQty} onChange={(e) => setNewForm({ ...newForm, sourceQty: Number(e.target.value) })} /></FormField>
                <FormField label={t("repacking.targetQty")}><Input type="number" className={formInputClass} value={newForm.targetQty} onChange={(e) => setNewForm({ ...newForm, targetQty: Number(e.target.value) })} /></FormField>
              </div>
              <FormField label={t("repacking.reason")}><Input className={formInputClass} value={newForm.reason} onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })} /></FormField>
              <FormField label={t("repacking.notes")}><Input className={formInputClass} value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} /></FormField>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
