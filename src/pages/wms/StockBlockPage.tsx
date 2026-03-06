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
import { Plus, Eye, Lock, Unlock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { StockBlock, StockBlockStatus } from "@/data/mockData";

export default function StockBlockPage() {
  const { t } = useTranslation();
  const { stockBlocks: data, setStockBlocks: setData, products, warehouses, warehouseLocations, inventory } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StockBlockStatus | "all">("all");
  const [selected, setSelected] = useState<StockBlock | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ productId: "", warehouseId: "", locationId: "", qty: 0, reason: "", notes: "" });

  const scopedData = useMemo(() => {
    let d = data.filter((x) => canOperateOn(x.warehouseId));
    if (filterStatus !== "all") d = d.filter((x) => x.status === filterStatus);
    if (search) {
      const s = search.toLowerCase();
      d = d.filter((x) => x.id.toLowerCase().includes(s) || x.productName.toLowerCase().includes(s) || x.reason.toLowerCase().includes(s));
    }
    return d;
  }, [data, canOperateOn, filterStatus, search]);

  const { paginatedItems, currentPage, totalPages, setCurrentPage, pageSize, setPageSize } = usePagination(scopedData, 10);

  const blockedCount = data.filter((x) => x.status === "Blocked" && canOperateOn(x.warehouseId)).length;
  const totalBlockedQty = data.filter((x) => x.status === "Blocked" && canOperateOn(x.warehouseId)).reduce((s, x) => s + x.qty, 0);

  const locationsForWh = warehouseLocations.filter((l) => l.warehouseId === newForm.warehouseId);

  const handleCreate = () => {
    if (!newForm.productId || !newForm.warehouseId || newForm.qty <= 0 || !newForm.reason) {
      toast({ title: t("stockBlock.error"), description: t("stockBlock.fillRequired"), variant: "destructive" });
      return;
    }
    const prod = products.find((p) => p.id === newForm.productId);
    const wh = warehouses.find((w) => w.id === newForm.warehouseId);
    const newBlock: StockBlock = {
      id: `BLK-${String(data.length + 1).padStart(3, "0")}`,
      productId: newForm.productId,
      productName: prod?.name ?? newForm.productId,
      warehouseId: newForm.warehouseId,
      warehouseName: wh?.name ?? newForm.warehouseId,
      locationId: newForm.locationId || "—",
      qty: newForm.qty,
      reason: newForm.reason,
      blockedBy: "Utilisateur courant",
      blockedAt: new Date().toISOString().slice(0, 10),
      status: "Blocked",
      notes: newForm.notes,
    };
    setData((prev) => [newBlock, ...prev]);
    setShowCreate(false);
    setNewForm({ productId: "", warehouseId: "", locationId: "", qty: 0, reason: "", notes: "" });
    toast({ title: t("stockBlock.stockBlocked"), description: t("stockBlock.stockBlockedDesc", { qty: newBlock.qty, product: newBlock.productName }) });
  };

  const handleUnblock = (id: string) => {
    setData((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, status: "Unblocked" as const, unblockedBy: "Utilisateur courant", unblockedAt: new Date().toISOString().slice(0, 10) }
          : x
      )
    );
    toast({ title: t("stockBlock.stockUnblocked") });
  };

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("stockBlock.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("stockBlock.subtitle")}</p>
        </div>
        {canCreate("stockAdjustment") && (
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />{t("stockBlock.blockStock")}</Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t("stockBlock.activeBlocks")}</p><p className="text-2xl font-bold">{blockedCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t("stockBlock.totalBlockedQty")}</p><p className="text-2xl font-bold">{totalBlockedQty}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t("stockBlock.totalHistory")}</p><p className="text-2xl font-bold">{scopedData.length}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "Blocked", "Unblocked"] as const).map((s) => (
          <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} onClick={() => setFilterStatus(s)}>
            {s === "all" ? t("stockBlock.all") : s === "Blocked" ? t("stockBlock.blocked") : t("stockBlock.unblocked")}
          </Button>
        ))}
        <div className="relative flex-1 max-w-sm">
          <Input placeholder={t("stockBlock.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("stockBlock.colID")}</TableHead>
              <TableHead>{t("stockBlock.colProduct")}</TableHead>
              <TableHead>{t("stockBlock.colWarehouse")}</TableHead>
              <TableHead>{t("stockBlock.colLocation")}</TableHead>
              <TableHead>{t("stockBlock.colQty")}</TableHead>
              <TableHead>{t("stockBlock.colReason")}</TableHead>
              <TableHead>{t("stockBlock.colStatus")}</TableHead>
              <TableHead>{t("stockBlock.colBlockedBy")}</TableHead>
              <TableHead>{t("stockBlock.colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell>{b.productName}</TableCell>
                <TableCell className="text-xs">{b.warehouseName}</TableCell>
                <TableCell className="font-mono text-xs">{b.locationId}</TableCell>
                <TableCell>{b.qty}</TableCell>
                <TableCell className="text-xs max-w-[150px] truncate">{b.reason}</TableCell>
                <TableCell>
                  {b.status === "Blocked" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><Lock className="h-3 w-3" />{t("stockBlock.blockedLabel")}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary"><Unlock className="h-3 w-3" />{t("stockBlock.unblockedLabel")}</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">{b.blockedBy}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(b)}><Eye className="h-3.5 w-3.5" /></Button>
                    {b.status === "Blocked" && canOperateOn(b.warehouseId) && (
                      <Button size="sm" variant="outline" onClick={() => handleUnblock(b.id)}><Unlock className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{t("stockBlock.noBlock")}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={scopedData.length} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("stockBlock.detailTitle", { id: selected?.id })}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <p><strong>{t("stockBlock.detailProduct")} :</strong> {selected.productName}</p>
              <p><strong>{t("stockBlock.detailQty")} :</strong> {selected.qty}</p>
              <p><strong>{t("stockBlock.detailWarehouse")} :</strong> {selected.warehouseName}</p>
              <p><strong>{t("stockBlock.detailLocation")} :</strong> {selected.locationId}</p>
              <p><strong>{t("stockBlock.detailReason")} :</strong> {selected.reason}</p>
              <p><strong>{t("stockBlock.detailBlockedBy")} :</strong> {selected.blockedBy} le {selected.blockedAt}</p>
              {selected.unblockedBy && <p><strong>{t("stockBlock.detailUnblockedBy")} :</strong> {selected.unblockedBy} le {selected.unblockedAt}</p>}
              {selected.notes && <p><strong>{t("stockBlock.detailNotes")} :</strong> {selected.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("stockBlock.blockTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormSection title={t("stockBlock.information")}>
              <FormField label={t("stockBlock.warehouse")}>
                <select className={formSelectClass} value={newForm.warehouseId} onChange={(e) => setNewForm({ ...newForm, warehouseId: e.target.value, locationId: "" })}>
                  <option value="">{t("stockBlock.select")}</option>
                  {operationalWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </FormField>
              <FormField label={t("stockBlock.product")}>
                <select className={formSelectClass} value={newForm.productId} onChange={(e) => setNewForm({ ...newForm, productId: e.target.value })}>
                  <option value="">{t("stockBlock.select")}</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FormField>
              {locationsForWh.length > 0 && (
                <FormField label={t("stockBlock.location")}>
                  <select className={formSelectClass} value={newForm.locationId} onChange={(e) => setNewForm({ ...newForm, locationId: e.target.value })}>
                    <option value="">{t("stockBlock.allLocations")}</option>
                    {locationsForWh.map((l) => <option key={l.id} value={l.id}>{l.id}</option>)}
                  </select>
                </FormField>
              )}
              <FormField label={t("stockBlock.quantity")}>
                <Input type="number" className={formInputClass} value={newForm.qty} onChange={(e) => setNewForm({ ...newForm, qty: Number(e.target.value) })} />
              </FormField>
              <FormField label={t("stockBlock.reason")}>
                <Input className={formInputClass} value={newForm.reason} onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })} placeholder={t("stockBlock.reasonPlaceholder")} />
              </FormField>
              <FormField label={t("stockBlock.notesLabel")}>
                <Input className={formInputClass} value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
              </FormField>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate}><Lock className="h-4 w-4 mr-2" />{t("stockBlock.block")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
