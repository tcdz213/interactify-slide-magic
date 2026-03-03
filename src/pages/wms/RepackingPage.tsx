import { useState, useMemo } from "react";
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
import { Plus, Eye, CheckCircle, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { RepackOrder, RepackStatus } from "@/data/mockData";

export default function RepackingPage() {
  const { repackOrders: data, setRepackOrders: setData, products, warehouses, warehouseLocations } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RepackStatus | "all">("all");
  const [selected, setSelected] = useState<RepackOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ productId: "", warehouseId: "", locationId: "", sourceUom: "", targetUom: "", sourceQty: 0, targetQty: 0, reason: "", notes: "" });

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

  const locationsForWh = warehouseLocations.filter((l) => l.warehouseId === newForm.warehouseId);

  const handleCreate = () => {
    if (!newForm.productId || !newForm.warehouseId || !newForm.sourceUom || !newForm.targetUom || newForm.sourceQty <= 0) {
      toast({ title: "Erreur", description: "Remplissez tous les champs obligatoires", variant: "destructive" });
      return;
    }
    const prod = products.find((p) => p.id === newForm.productId);
    const wh = warehouses.find((w) => w.id === newForm.warehouseId);
    const newRP: RepackOrder = {
      id: `RPK-${String(data.length + 1).padStart(3, "0")}`,
      productId: newForm.productId,
      productName: prod?.name ?? newForm.productId,
      warehouseId: newForm.warehouseId,
      warehouseName: wh?.name ?? newForm.warehouseId,
      locationId: newForm.locationId || "—",
      sourceUom: newForm.sourceUom,
      targetUom: newForm.targetUom,
      sourceQty: newForm.sourceQty,
      targetQty: newForm.targetQty,
      status: "Pending",
      createdBy: "Utilisateur courant",
      createdAt: new Date().toISOString().slice(0, 10),
      reason: newForm.reason,
      notes: newForm.notes,
    };
    setData((prev) => [newRP, ...prev]);
    setShowCreate(false);
    setNewForm({ productId: "", warehouseId: "", locationId: "", sourceUom: "", targetUom: "", sourceQty: 0, targetQty: 0, reason: "", notes: "" });
    toast({ title: "Ordre de reconditionnement créé", description: newRP.id });
  };

  const handleAction = (id: string, action: "start" | "complete" | "cancel") => {
    setData((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        if (action === "start") return { ...x, status: "In_Progress" as RepackStatus };
        if (action === "complete") return { ...x, status: "Completed" as RepackStatus, completedAt: new Date().toISOString().slice(0, 10) };
        return { ...x, status: "Cancelled" as RepackStatus };
      })
    );
    toast({ title: action === "complete" ? "Reconditionnement terminé" : action === "start" ? "Reconditionnement démarré" : "Reconditionnement annulé" });
  };

  const statuses: RepackStatus[] = ["Pending", "In_Progress", "Completed", "Cancelled"];

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reconditionnement (Repacking)</h1>
          <p className="text-sm text-muted-foreground">Changer l'unité de mesure ou l'emballage des produits</p>
        </div>
        {canCreate("stockAdjustment") && (
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Nouveau reconditionnement</Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((s) => {
          const count = data.filter((x) => x.status === s && canOperateOn(x.warehouseId)).length;
          return (
            <Card key={s} className="cursor-pointer hover:ring-2 ring-primary/30" onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s === "Pending" ? "En attente" : s === "In_Progress" ? "En cours" : s === "Completed" ? "Terminé" : "Annulé"}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Cible</TableHead>
              <TableHead>Qté source</TableHead>
              <TableHead>Qté cible</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((rp) => (
              <TableRow key={rp.id}>
                <TableCell className="font-mono text-xs">{rp.id}</TableCell>
                <TableCell>{rp.productName}</TableCell>
                <TableCell className="text-xs">{rp.sourceUom}</TableCell>
                <TableCell className="text-xs">{rp.targetUom}</TableCell>
                <TableCell>{rp.sourceQty}</TableCell>
                <TableCell>{rp.targetQty}</TableCell>
                <TableCell className="text-xs max-w-[120px] truncate">{rp.reason}</TableCell>
                <TableCell><StatusBadge status={rp.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(rp)}><Eye className="h-3.5 w-3.5" /></Button>
                    {rp.status === "Pending" && canOperateOn(rp.warehouseId) && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(rp.id, "start")}>Démarrer</Button>
                    )}
                    {rp.status === "In_Progress" && canOperateOn(rp.warehouseId) && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(rp.id, "complete")}><CheckCircle className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Aucun reconditionnement trouvé</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={scopedData.length} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reconditionnement {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <p><strong>Produit :</strong> {selected.productName}</p>
              <p><strong>Entrepôt :</strong> {selected.warehouseName}</p>
              <p><strong>Emplacement :</strong> {selected.locationId}</p>
              <p><strong>Source :</strong> {selected.sourceQty} × {selected.sourceUom}</p>
              <p><strong>Cible :</strong> {selected.targetQty} × {selected.targetUom}</p>
              <p><strong>Raison :</strong> {selected.reason}</p>
              <p><strong>Statut :</strong> <StatusBadge status={selected.status} /></p>
              <p><strong>Créé par :</strong> {selected.createdBy} le {selected.createdAt}</p>
              {selected.completedAt && <p><strong>Terminé :</strong> {selected.completedAt}</p>}
              {selected.notes && <p><strong>Notes :</strong> {selected.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouveau reconditionnement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormSection title="Informations">
              <FormField label="Entrepôt">
                <select className={formSelectClass} value={newForm.warehouseId} onChange={(e) => setNewForm({ ...newForm, warehouseId: e.target.value, locationId: "" })}>
                  <option value="">— Sélectionner —</option>
                  {operationalWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </FormField>
              <FormField label="Produit">
                <select className={formSelectClass} value={newForm.productId} onChange={(e) => setNewForm({ ...newForm, productId: e.target.value })}>
                  <option value="">— Sélectionner —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FormField>
              {locationsForWh.length > 0 && (
                <FormField label="Emplacement">
                  <select className={formSelectClass} value={newForm.locationId} onChange={(e) => setNewForm({ ...newForm, locationId: e.target.value })}>
                    <option value="">— Sélectionner —</option>
                    {locationsForWh.map((l) => <option key={l.id} value={l.id}>{l.id}</option>)}
                  </select>
                </FormField>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="UOM source">
                  <Input className={formInputClass} value={newForm.sourceUom} onChange={(e) => setNewForm({ ...newForm, sourceUom: e.target.value })} placeholder="Ex: Sac 25kg" />
                </FormField>
                <FormField label="UOM cible">
                  <Input className={formInputClass} value={newForm.targetUom} onChange={(e) => setNewForm({ ...newForm, targetUom: e.target.value })} placeholder="Ex: Sac 5kg" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Qté source">
                  <Input type="number" className={formInputClass} value={newForm.sourceQty} onChange={(e) => setNewForm({ ...newForm, sourceQty: Number(e.target.value) })} />
                </FormField>
                <FormField label="Qté cible">
                  <Input type="number" className={formInputClass} value={newForm.targetQty} onChange={(e) => setNewForm({ ...newForm, targetQty: Number(e.target.value) })} />
                </FormField>
              </div>
              <FormField label="Raison">
                <Input className={formInputClass} value={newForm.reason} onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })} placeholder="Ex: Vente détail, promo…" />
              </FormField>
              <FormField label="Notes">
                <Input className={formInputClass} value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
              </FormField>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}