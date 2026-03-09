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
import { Plus, Search, Eye, ArrowRightLeft, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CrossDock, CrossDockStatus } from "@/data/mockData";

export default function CrossDockingPage() {
  const { t } = useTranslation();
  const { crossDocks: data, setCrossDocks: setData, grns, salesOrders, warehouses, products } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<CrossDockStatus | "all">("all");
  const [selected, setSelected] = useState<CrossDock | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ grnId: "", salesOrderId: "", productId: "", qty: 0, warehouseId: "", fromDock: "", toDock: "", notes: "" });

  const scopedData = useMemo(() => {
    let d = data.filter((x) => canOperateOn(x.warehouseId));
    if (filterStatus !== "all") d = d.filter((x) => x.status === filterStatus);
    if (search) {
      const s = search.toLowerCase();
      d = d.filter((x) => x.id.toLowerCase().includes(s) || x.productName.toLowerCase().includes(s));
    }
    return d;
  }, [data, canOperateOn, filterStatus, search]);

  const { paginatedItems, currentPage, totalPages, setCurrentPage, pageSize, setPageSize } = usePagination(scopedData, 10);

  const handleCreate = () => {
    if (!newForm.grnId || !newForm.salesOrderId || !newForm.productId || !newForm.warehouseId || newForm.qty <= 0) {
      toast({ title: t("common.error"), description: t("crossDocking.errorRequired"), variant: "destructive" });
      return;
    }
    const wh = warehouses.find((w) => w.id === newForm.warehouseId);
    const prod = products.find((p) => p.id === newForm.productId);
    const newXD: CrossDock = {
      id: `XD-${String(data.length + 1).padStart(3, "0")}`,
      grnId: newForm.grnId, salesOrderId: newForm.salesOrderId,
      productId: newForm.productId, productName: prod?.name ?? newForm.productId,
      qty: newForm.qty, warehouseId: newForm.warehouseId, warehouseName: wh?.name ?? newForm.warehouseId,
      fromDock: newForm.fromDock || "Quai 1", toDock: newForm.toDock || "Quai 2",
      status: "Pending", createdBy: "Utilisateur courant", createdAt: new Date().toISOString().slice(0, 10), notes: newForm.notes,
    };
    setData((prev) => [newXD, ...prev]);
    setShowCreate(false);
    setNewForm({ grnId: "", salesOrderId: "", productId: "", qty: 0, warehouseId: "", fromDock: "", toDock: "", notes: "" });
    toast({ title: t("crossDocking.created"), description: newXD.id });
  };

  const handleAction = (id: string, action: "start" | "complete" | "cancel") => {
    setData((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        if (action === "start") return { ...x, status: "In_Progress" as const };
        if (action === "complete") return { ...x, status: "Completed" as const, completedAt: new Date().toISOString().slice(0, 10) };
        return { ...x, status: "Cancelled" as const };
      })
    );
    toast({ title: action === "complete" ? t("crossDocking.completed") : action === "start" ? t("crossDocking.started") : t("crossDocking.cancelled") });
  };

  const statuses: CrossDockStatus[] = ["Pending", "In_Progress", "Completed", "Cancelled"];

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("crossDocking.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("crossDocking.subtitle")}</p>
        </div>
        {canCreate("grn") && (
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />{t("crossDocking.newCrossDock")}</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((s) => {
          const count = data.filter((x) => x.status === s && canOperateOn(x.warehouseId)).length;
          return (
            <Card key={s} className="cursor-pointer hover:ring-2 ring-primary/30" onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.replace("_", " ")}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("crossDocking.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t("crossDocking.product")}</TableHead>
              <TableHead>GRN</TableHead>
              <TableHead>{t("serialNumbers.order")}</TableHead>
              <TableHead>{t("crossDocking.quantity")}</TableHead>
              <TableHead>{t("crossDocking.fromTo")}</TableHead>
              <TableHead>{t("crossDocking.status")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((xd) => (
              <TableRow key={xd.id}>
                <TableCell className="font-mono text-xs">{xd.id}</TableCell>
                <TableCell>{xd.productName}</TableCell>
                <TableCell className="font-mono text-xs">{xd.grnId}</TableCell>
                <TableCell className="font-mono text-xs">{xd.salesOrderId}</TableCell>
                <TableCell>{xd.qty}</TableCell>
                <TableCell className="text-xs">{xd.fromDock} → {xd.toDock}</TableCell>
                <TableCell><StatusBadge status={xd.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(xd)}><Eye className="h-3.5 w-3.5" /></Button>
                    {xd.status === "Pending" && canOperateOn(xd.warehouseId) && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(xd.id, "start")}><ArrowRightLeft className="h-3.5 w-3.5" /></Button>
                    )}
                    {xd.status === "In_Progress" && canOperateOn(xd.warehouseId) && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(xd.id, "complete")}><CheckCircle className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t("crossDocking.noCrossDockFound")}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={scopedData.length} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("crossDocking.detail", { id: selected?.id })}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <p><strong>{t("crossDocking.productLabel")}</strong> {selected.productName}</p>
              <p><strong>{t("crossDocking.qtyLabel")}</strong> {selected.qty}</p>
              <p><strong>{t("crossDocking.grnLabel")}</strong> {selected.grnId}</p>
              <p><strong>{t("crossDocking.orderLabel")}</strong> {selected.salesOrderId}</p>
              <p><strong>{t("crossDocking.warehouseLabel")}</strong> {selected.warehouseName}</p>
              <p><strong>{t("crossDocking.dockLabel")}</strong> {selected.fromDock} → {selected.toDock}</p>
              <p><strong>{t("crossDocking.statusLabel")}</strong> <StatusBadge status={selected.status} /></p>
              <p><strong>{t("crossDocking.createdByLabel")}</strong> {selected.createdBy} le {selected.createdAt}</p>
              {selected.completedAt && <p><strong>{t("crossDocking.completedLabel")}</strong> {selected.completedAt}</p>}
              {selected.notes && <p><strong>{t("crossDocking.notesLabel")}</strong> {selected.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("crossDocking.createTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormSection title={t("crossDocking.info")}>
              <FormField label={t("crossDocking.warehouse")}>
                <select className={formSelectClass} value={newForm.warehouseId} onChange={(e) => setNewForm({ ...newForm, warehouseId: e.target.value })}>
                  <option value="">{t("crossDocking.selectPlaceholder")}</option>
                  {operationalWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </FormField>
              <FormField label={t("crossDocking.product")}>
                <select className={formSelectClass} value={newForm.productId} onChange={(e) => setNewForm({ ...newForm, productId: e.target.value })}>
                  <option value="">{t("crossDocking.selectPlaceholder")}</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FormField>
              <FormField label={t("crossDocking.grnSource")}>
                <Input className={formInputClass} value={newForm.grnId} onChange={(e) => setNewForm({ ...newForm, grnId: e.target.value })} placeholder="GRN-..." />
              </FormField>
              <FormField label={t("crossDocking.orderDest")}>
                <Input className={formInputClass} value={newForm.salesOrderId} onChange={(e) => setNewForm({ ...newForm, salesOrderId: e.target.value })} placeholder="SO-..." />
              </FormField>
              <FormField label={t("crossDocking.qty")}>
                <Input type="number" className={formInputClass} value={newForm.qty} onChange={(e) => setNewForm({ ...newForm, qty: Number(e.target.value) })} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("crossDocking.dockFrom")}>
                  <Input className={formInputClass} value={newForm.fromDock} onChange={(e) => setNewForm({ ...newForm, fromDock: e.target.value })} placeholder="Quai 1" />
                </FormField>
                <FormField label={t("crossDocking.dockTo")}>
                  <Input className={formInputClass} value={newForm.toDock} onChange={(e) => setNewForm({ ...newForm, toDock: e.target.value })} placeholder="Quai 2" />
                </FormField>
              </div>
              <FormField label={t("crossDocking.notes")}>
                <Input className={formInputClass} value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
              </FormField>
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
