import { useState, useMemo } from "react";
import { Building2, Plus, Pencil, Trash2, MapPin, User, Lock, AlertTriangle, Shield, Thermometer, Award, Tag } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Warehouse, WarehouseLocation, WarehouseType, WarehouseStatus } from "@/data/mockData";
import { currency } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { exportToCSV } from "@/lib/exportUtils";
import ExportDialog from "@/components/ExportDialog";
import { useTranslation } from "react-i18next";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";

const emptyWH: Omit<Warehouse, "id"> = { name: "", shortCode: "", type: "general", city: "", wilaya: "", zones: 1, capacity: 1000, utilization: 0, address: "", manager: "", phone: "", speciality: "", status: "active" };
const emptyLoc: Omit<WarehouseLocation, "id"> = { warehouseId: "", zone: "A", aisle: "1", rack: "01", level: "1", type: "Ambient", capacity: 100, used: 0, status: "Available" };

export default function WarehousesPage() {
  const { t } = useTranslation();
  const { warehouses, setWarehouses, warehouseLocations, setWarehouseLocations } = useWMSData();
  const { canAccessWarehouse, isFullAccess } = useAuth();

  /** Can the current user modify (edit/add/delete) this warehouse? */
  const canModifyWarehouse = (whId: string) => canAccessWarehouse(whId);
  /** Can the current user create new warehouses? Only full-access users */
  const canCreateWH = isFullAccess;

  const [selectedWH, setSelectedWH] = useState<Warehouse | null>(null);
  const [filterWH, setFilterWH] = useState("all");

  // CRUD warehouse
  const [whDialog, setWhDialog] = useState<{ mode: "create" | "edit"; data: Omit<Warehouse, "id"> & { id?: string } } | null>(null);
  const [deleteWH, setDeleteWH] = useState<Warehouse | null>(null);

  // CRUD location
  const [locDialog, setLocDialog] = useState<{ mode: "create" | "edit"; data: Omit<WarehouseLocation, "id"> & { id?: string } } | null>(null);
  const [deleteLoc, setDeleteLoc] = useState<WarehouseLocation | null>(null);
  const [exportWHOpen, setExportWHOpen] = useState(false);
  const [exportLocOpen, setExportLocOpen] = useState(false);

  const getLocations = (whId: string) => warehouseLocations.filter(l => l.warehouseId === whId);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Chilled": return "bg-info/10 text-info border-info/20";
      case "Frozen": return "bg-primary/10 text-primary border-primary/20";
      case "Ambient": return "bg-success/10 text-success border-success/20";
      case "Dry": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getWhTypeColor = (type: WarehouseType) => {
    switch (type) {
      case "construction": return "bg-warning/10 text-warning border-warning/20";
      case "food": return "bg-success/10 text-success border-success/20";
      case "technology": return "bg-info/10 text-info border-info/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getWhStatusColor = (status: WarehouseStatus) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "inactive": return "bg-muted text-muted-foreground border-border";
      case "maintenance": return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const filteredLocations = filterWH === "all" ? warehouseLocations : warehouseLocations.filter(l => l.warehouseId === filterWH);

  // Warehouse CRUD handlers
  const handleSaveWH = () => {
    if (!whDialog) return;
    const d = whDialog.data;
    if (!d.name || !d.city) return;
    if (whDialog.mode === "create") {
      const id = `WH${String(warehouses.length + 1).padStart(2, "0")}`;
      setWarehouses(prev => [...prev, { ...d, id } as Warehouse]);
      toast({ title: "Entrepôt créé", description: id });
    } else {
      setWarehouses(prev => prev.map(w => w.id === d.id ? { ...w, ...d } as Warehouse : w));
      toast({ title: "Entrepôt modifié", description: d.id });
    }
    setWhDialog(null);
  };

  const handleDeleteWH = () => {
    if (!deleteWH) return;
    setWarehouses(prev => prev.filter(w => w.id !== deleteWH.id));
    setWarehouseLocations(prev => prev.filter(l => l.warehouseId !== deleteWH.id));
    toast({ title: "Entrepôt supprimé", description: deleteWH.id });
    setDeleteWH(null);
  };

  // Location CRUD handlers
  const handleSaveLoc = () => {
    if (!locDialog) return;
    const d = locDialog.data;
    if (!d.warehouseId || !d.zone) return;
    if (locDialog.mode === "create") {
      const id = `${d.warehouseId}-${d.zone}${d.aisle}-${d.rack}`;
      setWarehouseLocations(prev => [...prev, { ...d, id } as WarehouseLocation]);
      toast({ title: "Emplacement créé", description: id });
    } else {
      setWarehouseLocations(prev => prev.map(l => l.id === d.id ? { ...l, ...d } as WarehouseLocation : l));
      toast({ title: "Emplacement modifié", description: d.id });
    }
    setLocDialog(null);
  };

  const handleDeleteLoc = () => {
    if (!deleteLoc) return;
    setWarehouseLocations(prev => prev.filter(l => l.id !== deleteLoc.id));
    toast({ title: "Emplacement supprimé", description: deleteLoc.id });
    setDeleteLoc(null);
  };

  const whExportColumns = [
    { key: "id" as const, label: "ID" },
    { key: "name" as const, label: t("common.name") },
    { key: "city" as const, label: t("warehouses.city") },
    { key: "zones" as const, label: t("warehouses.zones") },
    { key: "capacity" as const, label: t("warehouses.capacity") },
    { key: "utilization" as const, label: t("warehouses.utilization") },
    { key: "manager" as const, label: t("warehouses.manager") },
    { key: "phone" as const, label: t("warehouses.phone") },
  ];

  const locExportColumns = [
    { key: "id" as const, label: "ID" },
    { key: "warehouseId" as const, label: t("common.warehouse") },
    { key: "zone" as const, label: t("warehouses.zone") },
    { key: "aisle" as const, label: t("warehouses.aisle") },
    { key: "rack" as const, label: t("warehouses.rack") },
    { key: "level" as const, label: t("warehouses.level") },
    { key: "type" as const, label: t("common.type") },
    { key: "capacity" as const, label: t("warehouses.capacity") },
    { key: "used" as const, label: t("warehouses.used") },
    { key: "status" as const, label: t("common.status") },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("warehouses.title")}</h1>
            <p className="text-sm text-muted-foreground">{warehouses.length} entrepôts — {warehouseLocations.length} emplacements</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportWHOpen(true)}>{t("common.export")}</Button>
          {canCreateWH && (
            <Button onClick={() => setWhDialog({ mode: "create", data: { ...emptyWH } })} className="gap-2">
              <Plus className="h-4 w-4" /> {t("warehouses.newWarehouse")}
            </Button>
          )}
        </div>
      </div>

      {/* Warehouse Cards — scoped by user access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.filter(wh => canAccessWarehouse(wh.id) || isFullAccess).map(wh => {
          const locs = getLocations(wh.id);
          return (
            <div key={wh.id} className="glass-card rounded-xl p-5 space-y-3 hover:shadow-md hover:border-border/70 transition-all duration-200 cursor-pointer group" onClick={() => setSelectedWH(wh)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{wh.name}</h3>
                  <span className="text-[10px] font-mono text-muted-foreground">{wh.shortCode}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getWhTypeColor(wh.type)}`}>{wh.type}</span>
                  <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${getWhStatusColor(wh.status)}`}>{wh.status}</span>
                  {canModifyWarehouse(wh.id) ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setWhDialog({ mode: "edit", data: { ...wh } }); }} className="p-1 rounded hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"><Pencil className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteWH(wh); }} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3 w-3" /></button>
                    </>
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground/40 ml-1" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("warehouses.utilization")}</span>
                  <span className={`font-semibold ${wh.utilization > 80 ? "text-warning" : "text-success"}`}>{wh.utilization}%</span>
                </div>
                <Progress value={wh.utilization} className="h-1.5" />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{wh.speciality}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {wh.city} · {wh.wilaya}</div>
                <div><span className="text-muted-foreground">{t("warehouses.capacity")} :</span> <span className="font-medium">{wh.capacity.toLocaleString()} m²</span></div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {wh.certifications?.map(c => (
                  <span key={c} className="inline-flex items-center gap-0.5 rounded-full border border-success/20 bg-success/5 px-1.5 py-0.5 text-[9px] font-semibold text-success"><Award className="h-2.5 w-2.5" />{c}</span>
                ))}
                {wh.temperature && <span className="inline-flex items-center gap-0.5 rounded-full border border-info/20 bg-info/5 px-1.5 py-0.5 text-[9px] font-semibold text-info"><Thermometer className="h-2.5 w-2.5" />{wh.temperature}</span>}
                {wh.security && <span className="inline-flex items-center gap-0.5 rounded-full border border-warning/20 bg-warning/5 px-1.5 py-0.5 text-[9px] font-semibold text-warning"><Shield className="h-2.5 w-2.5" />{wh.security}</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" /> {wh.manager}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locations header + table */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("warehouses.locations")}</h2>
        <div className="flex items-center gap-2">
          <select value={filterWH} onChange={e => setFilterWH(e.target.value)}
            className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">{t("warehouses.allWarehouses")}</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => setExportLocOpen(true)}>{t("common.export")}</Button>
          {(filterWH === "all" ? canCreateWH : canModifyWarehouse(filterWH)) && (
            <Button size="sm" onClick={() => setLocDialog({ mode: "create", data: { ...emptyLoc, warehouseId: filterWH === "all" ? (warehouses[0]?.id ?? "") : filterWH } })} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> {t("warehouses.newLocation")}
            </Button>
          )}
        </div>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("common.id")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("warehouses.zone")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("warehouses.aisle")} / {t("warehouses.rack")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("warehouses.locType")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("warehouses.capacity")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("warehouses.used")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("warehouses.rate")}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("common.status")}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map(loc => (
              <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3 font-mono text-xs font-medium">{loc.id}</td>
                <td className="px-4 py-3 font-medium">{loc.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{loc.aisle}-{loc.rack} (Niv. {loc.level})</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTypeColor(loc.type)}`}>{loc.type}</span>
                </td>
                <td className="px-4 py-3 text-right">{loc.capacity}</td>
                <td className="px-4 py-3 text-right">{loc.used}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-medium ${loc.used / loc.capacity > 0.9 ? "text-destructive" : loc.used / loc.capacity > 0.7 ? "text-warning" : "text-success"}`}>
                    {Math.round(loc.used / loc.capacity * 100)}%
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={loc.status} /></td>
                <td className="px-4 py-3 text-right">
                  {canModifyWarehouse(loc.warehouseId) ? (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setLocDialog({ mode: "edit", data: { ...loc } })} className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => setDeleteLoc(loc)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground/40 inline-block" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Detail Dialog ── */}
      <Dialog open={!!selectedWH} onOpenChange={() => setSelectedWH(null)}>
        <DialogContent className="max-w-lg">
          {selectedWH && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><Building2 className="h-4 w-4" /></div>
                  <div>
                    <span className="block">{selectedWH.name}</span>
                    <span className="text-xs font-normal text-muted-foreground font-mono">{selectedWH.id} · {selectedWH.city}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Code", value: selectedWH.shortCode },
                  { label: "Type", value: selectedWH.type },
                  { label: t("warehouses.address"), value: selectedWH.address },
                  { label: "Wilaya", value: selectedWH.wilaya },
                  { label: t("warehouses.manager"), value: selectedWH.manager },
                  { label: t("warehouses.phone"), value: selectedWH.phone },
                  { label: "Spécialité", value: selectedWH.speciality },
                  { label: t("warehouses.zones"), value: String(selectedWH.zones) },
                  { label: t("warehouses.capacity"), value: `${selectedWH.capacity.toLocaleString()} m²` },
                  { label: t("warehouses.utilization"), value: `${selectedWH.utilization}%` },
                  ...(selectedWH.temperature ? [{ label: "Température", value: selectedWH.temperature }] : []),
                  ...(selectedWH.security ? [{ label: "Sécurité", value: selectedWH.security }] : []),
                  ...(selectedWH.certifications?.length ? [{ label: "Certifications", value: selectedWH.certifications.join(", ") }] : []),
                  { label: "Statut", value: selectedWH.status },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("warehouses.locations")} ({getLocations(selectedWH.id).length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getLocations(selectedWH.id).map(loc => (
                    <div key={loc.id} className="rounded-lg border border-border/50 bg-muted/20 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium">{loc.id.split("-").slice(1).join("-")}</span>
                        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${getTypeColor(loc.type)}`}>{loc.type}</span>
                      </div>
                      <div className="mt-1 flex justify-between text-muted-foreground">
                        <span>{loc.used}/{loc.capacity}</span>
                        <span className="font-medium">{Math.round(loc.used / loc.capacity * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create/Edit Warehouse Dialog ── */}
      <Dialog open={!!whDialog} onOpenChange={() => setWhDialog(null)}>
        <DialogContent className="max-w-md">
          {whDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><Building2 className="h-4 w-4" /></div>
                  {whDialog.mode === "create" ? t("warehouses.newWarehouse") : t("warehouses.editWarehouse")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t("common.name")} required>
                    <input type="text" value={(whDialog.data as Record<string, unknown>)["name"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, name: e.target.value } } : null)}
                      className={formInputClass} autoFocus />
                  </FormField>
                  <FormField label="Code court" required>
                    <input type="text" value={(whDialog.data as Record<string, unknown>)["shortCode"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, shortCode: e.target.value } } : null)}
                      className={formInputClass} placeholder="WH-XXX-YYY" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Type" required>
                    <select value={(whDialog.data as Record<string, unknown>)["type"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, type: e.target.value as WarehouseType } } : null)}
                      className={formSelectClass}>
                      {(["construction", "food", "technology", "general"] as WarehouseType[]).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Statut">
                    <select value={(whDialog.data as Record<string, unknown>)["status"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, status: e.target.value as WarehouseStatus } } : null)}
                      className={formSelectClass}>
                      {(["active", "inactive", "maintenance"] as WarehouseStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t("warehouses.city")} required>
                    <input type="text" value={(whDialog.data as Record<string, unknown>)["city"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, city: e.target.value } } : null)}
                      className={formInputClass} />
                  </FormField>
                  <FormField label="Wilaya">
                    <input type="text" value={(whDialog.data as Record<string, unknown>)["wilaya"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, wilaya: e.target.value } } : null)}
                      className={formInputClass} placeholder="ex: Alger (16)" />
                  </FormField>
                </div>
                <FormField label={t("warehouses.address")}>
                  <input type="text" value={(whDialog.data as Record<string, unknown>)["address"] as string}
                    onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, address: e.target.value } } : null)}
                    className={formInputClass} />
                </FormField>
                <FormField label="Spécialité">
                  <input type="text" value={(whDialog.data as Record<string, unknown>)["speciality"] as string}
                    onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, speciality: e.target.value } } : null)}
                    className={formInputClass} placeholder="ex: Matériaux de construction, ciment..." />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t("warehouses.manager")}>
                    <input type="text" value={(whDialog.data as Record<string, unknown>)["manager"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, manager: e.target.value } } : null)}
                      className={formInputClass} />
                  </FormField>
                  <FormField label={t("warehouses.phone")}>
                    <input type="text" value={(whDialog.data as Record<string, unknown>)["phone"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, phone: e.target.value } } : null)}
                      className={formInputClass} />
                  </FormField>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label={t("warehouses.zones")}>
                    <input type="number" value={(whDialog.data as Record<string, unknown>)["zones"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, zones: Number(e.target.value) } } : null)}
                      className={formInputClass} />
                  </FormField>
                  <FormField label={t("warehouses.capacity") + " (m²)"}>
                    <input type="number" value={(whDialog.data as Record<string, unknown>)["capacity"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, capacity: Number(e.target.value) } } : null)}
                      className={formInputClass} />
                  </FormField>
                  <FormField label={t("warehouses.utilization") + " %"}>
                    <input type="number" value={(whDialog.data as Record<string, unknown>)["utilization"] as string}
                      onChange={e => setWhDialog(prev => prev ? { ...prev, data: { ...prev.data, utilization: Number(e.target.value) } } : null)}
                      className={formInputClass} />
                  </FormField>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWhDialog(null)}>{t("common.cancel")}</Button>
                <Button onClick={handleSaveWH} disabled={!(whDialog.data.name) || !(whDialog.data.city)}>
                  {whDialog.mode === "create" ? <><Plus className="h-4 w-4" /> Créer</> : <><Pencil className="h-4 w-4" /> Enregistrer</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete WH Confirm ── */}
      <Dialog open={!!deleteWH} onOpenChange={() => setDeleteWH(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="dialog-icon-destructive"><Trash2 className="h-4 w-4" /></div>
              {t("warehouses.deleteConfirm")}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive/90">
              <strong>{deleteWH?.name}</strong> ({deleteWH?.id}) et tous ses emplacements associés seront définitivement supprimés. Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteWH(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDeleteWH}>
              <Trash2 className="h-4 w-4" /> {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create/Edit Location Dialog ── */}
      <Dialog open={!!locDialog} onOpenChange={() => setLocDialog(null)}>
        <DialogContent className="max-w-md">
          {locDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><MapPin className="h-4 w-4" /></div>
                  {locDialog.mode === "create" ? t("warehouses.newLocation") : t("warehouses.editLocation")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <FormField label="Entrepôt" required>
                  <select value={locDialog.data.warehouseId}
                    onChange={e => setLocDialog(prev => prev ? { ...prev, data: { ...prev.data, warehouseId: e.target.value } } : null)}
                    className={formSelectClass}>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { fieldKey: "zone", label: t("warehouses.zone") },
                    { fieldKey: "aisle", label: t("warehouses.aisle") },
                    { fieldKey: "rack", label: t("warehouses.rack") },
                    { fieldKey: "level", label: t("warehouses.level") },
                  ].map(f => (
                    <div key={f.fieldKey}>
                      <FormField label={f.label}>
                        <input value={(locDialog.data as Record<string, unknown>)[f.fieldKey] as string}
                          onChange={e => setLocDialog(prev => prev ? { ...prev, data: { ...prev.data, [f.fieldKey]: e.target.value } } : null)}
                          className={formInputClass} />
                      </FormField>
                    </div>
                  ))}
                </div>
                <FormField label={t("warehouses.locType")}>
                  <select value={locDialog.data.type}
                    onChange={e => setLocDialog(prev => prev ? { ...prev, data: { ...prev.data, type: e.target.value as WarehouseLocation["type"] } } : null)}
                    className={formSelectClass}>
                    {["Ambient", "Chilled", "Frozen", "Dry"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label={t("warehouses.capacity")}>
                    <input type="number" value={locDialog.data.capacity}
                      onChange={e => setLocDialog(prev => prev ? { ...prev, data: { ...prev.data, capacity: Number(e.target.value) } } : null)}
                      className={formInputClass} />
                  </FormField>
                  <FormField label={t("warehouses.used")}>
                    <input type="number" value={locDialog.data.used}
                      onChange={e => setLocDialog(prev => prev ? { ...prev, data: { ...prev.data, used: Number(e.target.value) } } : null)}
                      className={formInputClass} />
                  </FormField>
                  <FormField label={t("common.status")}>
                    <select value={locDialog.data.status}
                      onChange={e => setLocDialog(prev => prev ? { ...prev, data: { ...prev.data, status: e.target.value as WarehouseLocation["status"] } } : null)}
                      className={formSelectClass}>
                      {["Available", "Full", "Reserved", "Maintenance"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLocDialog(null)}>{t("common.cancel")}</Button>
                <Button onClick={handleSaveLoc}>
                  {locDialog.mode === "create" ? <><Plus className="h-4 w-4" /> Créer</> : <><Pencil className="h-4 w-4" /> Enregistrer</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Location Confirm ── */}
      <Dialog open={!!deleteLoc} onOpenChange={() => setDeleteLoc(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="dialog-icon-destructive"><Trash2 className="h-4 w-4" /></div>
              Supprimer cet emplacement ?
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive/90">
              L'emplacement <strong>{deleteLoc?.id}</strong> sera définitivement supprimé.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLoc(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDeleteLoc}>
              <Trash2 className="h-4 w-4" /> {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialogs */}
      <ExportDialog
        open={exportWHOpen}
        onOpenChange={setExportWHOpen}
        data={warehouses}
        columns={whExportColumns}
        filename="entrepots"
      />
      <ExportDialog
        open={exportLocOpen}
        onOpenChange={setExportLocOpen}
        data={filteredLocations}
        columns={locExportColumns}
        filename="emplacements"
        statusKey="status"
        statusOptions={["Available", "Full", "Reserved", "Blocked"]}
      />
    </div>
  );
}
