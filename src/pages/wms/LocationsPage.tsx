import { useState, useMemo } from "react";
import { MapPin, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { WarehouseLocation } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { pct } from "@/data/mockData";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";

const TYPES: WarehouseLocation["type"][] = ["Ambient", "Chilled", "Frozen", "Dry"];
const STATUSES: WarehouseLocation["status"][] = ["Available", "Full", "Reserved", "Maintenance"];

const emptyLoc: Omit<WarehouseLocation, "id"> = { warehouseId: "", zone: "", aisle: "", rack: "", level: "1", type: "Ambient", capacity: 0, used: 0, status: "Available" };

export default function LocationsPage() {
  const { warehouseLocations: data, setWarehouseLocations: setData, warehouses } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterWh, setFilterWh] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WarehouseLocation | null>(null);
  const [form, setForm] = useState(emptyLoc);
  const [deleteConfirm, setDeleteConfirm] = useState<WarehouseLocation | null>(null);

  const filtered = useMemo(() => data.filter(l => {
    if (filterWh !== "all" && l.warehouseId !== filterWh) return false;
    if (filterType !== "all" && l.type !== filterType) return false;
    if (search && !l.id.toLowerCase().includes(search.toLowerCase()) && !l.zone.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search, filterWh, filterType]);

  const { paginatedItems, currentPage, totalPages, setCurrentPage, pageSize, setPageSize, totalItems } = usePagination(filtered, 10);

  const stats = useMemo(() => ({
    total: data.length,
    totalCapacity: data.reduce((s, l) => s + l.capacity, 0),
    totalUsed: data.reduce((s, l) => s + l.used, 0),
    maintenance: data.filter(l => l.status === "Maintenance").length,
  }), [data]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyLoc, warehouseId: warehouses[0]?.id ?? "" }); setShowForm(true); };
  const openEdit = (l: WarehouseLocation) => { setEditing(l); setForm({ warehouseId: l.warehouseId, zone: l.zone, aisle: l.aisle, rack: l.rack, level: l.level, type: l.type, capacity: l.capacity, used: l.used, status: l.status }); setShowForm(true); };

  const handleSave = () => {
    if (!form.warehouseId || !form.zone) return;
    if (editing) {
      setData(prev => prev.map(l => l.id === editing.id ? { ...l, ...form } : l));
      toast({ title: "Emplacement modifié" });
    } else {
      const id = `${form.warehouseId}-${form.zone}${form.aisle}-${form.rack}`;
      setData(prev => [...prev, { id, ...form }]);
      toast({ title: "Emplacement créé", description: id });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setData(prev => prev.filter(l => l.id !== deleteConfirm.id));
    toast({ title: "Emplacement supprimé" }); setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">Emplacements (Zones / Racks / Bins)</h1><p className="text-sm text-muted-foreground">{data.length} emplacements</p></div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvel emplacement</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total emplacements</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Capacité totale</p>
          <p className="text-xl font-semibold">{stats.totalCapacity.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Taux d'occupation</p>
          <p className="text-xl font-semibold">{pct(stats.totalCapacity ? (stats.totalUsed / stats.totalCapacity) * 100 : 0)}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En maintenance</p>
          <p className="text-xl font-semibold text-warning">{stats.maintenance}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher par ID ou zone..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterWh} onChange={e => setFilterWh(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous les entrepôts</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead><tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entrepôt</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Zone</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Allée</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Rack</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Niveau</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Capacité</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Utilisé</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {paginatedItems.map(l => {
                const wh = warehouses.find(w => w.id === l.warehouseId);
                const occupancy = l.capacity ? (l.used / l.capacity) * 100 : 0;
                return (
                  <tr key={l.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{l.id}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{wh?.name ?? l.warehouseId}</td>
                    <td className="px-4 py-3 text-center font-semibold">{l.zone}</td>
                    <td className="px-4 py-3 text-center">{l.aisle}</td>
                    <td className="px-4 py-3 text-center">{l.rack}</td>
                    <td className="px-4 py-3 text-center">{l.level}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{l.type}</span></td>
                    <td className="px-4 py-3 text-right">{l.capacity}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={occupancy > 90 ? "text-destructive font-semibold" : occupancy > 70 ? "text-warning font-medium" : ""}>{l.used}</span>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(l)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(l)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">Aucun emplacement trouvé.</div>}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={totalItems}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Modifier l'emplacement" : "Nouvel emplacement"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Entrepôt" required>
              <select className={formSelectClass} value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-4 gap-3">
              <FormField label="Zone" required><input className={formInputClass} value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} placeholder="A" /></FormField>
              <FormField label="Allée"><input className={formInputClass} value={form.aisle} onChange={e => setForm({ ...form, aisle: e.target.value })} placeholder="1" /></FormField>
              <FormField label="Rack"><input className={formInputClass} value={form.rack} onChange={e => setForm({ ...form, rack: e.target.value })} placeholder="01" /></FormField>
              <FormField label="Niveau"><input className={formInputClass} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="1" /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Type">
                <select className={formSelectClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as WarehouseLocation["type"] })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Statut">
                <select className={formSelectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as WarehouseLocation["status"] })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Capacité"><input type="number" className={formInputClass} value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></FormField>
              <FormField label="Utilisé"><input type="number" className={formInputClass} value={form.used} onChange={e => setForm({ ...form, used: +e.target.value })} /></FormField>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.warehouseId || !form.zone}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Supprimer l'emplacement ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer <strong>{deleteConfirm?.id}</strong> ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
