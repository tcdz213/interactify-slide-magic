import { useState, useMemo } from "react";
import { Truck, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { Carrier } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { useTranslation } from "react-i18next";

const empty: Omit<Carrier, "id"> = { name: "", contact: "", phone: "", email: "", city: "", vehicleCount: 0, coverageZones: [], status: "Active", rating: 0 };

export default function CarriersPage() {
  const { t } = useTranslation();
  const { carriers: data, setCarriers: setData } = useWMSData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [form, setForm] = useState(empty);
  const [zonesInput, setZonesInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Carrier | null>(null);

  const filtered = useMemo(() => data.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())), [data, search]);

  const openCreate = () => { setEditing(null); setForm(empty); setZonesInput(""); setShowForm(true); };
  const openEdit = (c: Carrier) => { setEditing(c); setForm({ ...c }); setZonesInput(c.coverageZones.join(", ")); setShowForm(true); };

  const handleSave = () => {
    if (!form.name) return;
    const zones = zonesInput.split(",").map(z => z.trim()).filter(Boolean);
    if (editing) {
      setData(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, coverageZones: zones } : c));
      toast({ title: t("carriers.modified"), description: form.name });
    } else {
      setData(prev => [...prev, { id: `CR-${String(prev.length + 1).padStart(3, "0")}`, ...form, coverageZones: zones }]);
      toast({ title: t("carriers.created"), description: form.name });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setData(prev => prev.filter(c => c.id !== deleteConfirm.id));
    toast({ title: t("carriers.deleted") }); setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Truck className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">{t("carriers.title")}</h1><p className="text-sm text-muted-foreground">{t("carriers.subtitle", { count: data.length })}</p></div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t("carriers.newCarrier")}</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder={t("common.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.name")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.contact")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.city")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("carriers.vehicles")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("carriers.coverageZones")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.rating")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.status")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.actions")}</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.contact}<br /><span className="text-xs">{c.phone}</span></td>
                <td className="px-4 py-3">{c.city}</td>
                <td className="px-4 py-3 text-center font-semibold">{c.vehicleCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">{c.coverageZones.map(z => <span key={z} className="px-1.5 py-0.5 rounded bg-muted text-xs">{z}</span>)}</div>
                </td>
                <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 text-warning fill-warning" /><span className="text-sm font-medium">{c.rating}</span></div></td>
                <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(c)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">{t("carriers.noCarrierFound")}</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? t("carriers.editCarrier") : t("carriers.newCarrier")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={t("common.name")} required><input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t("common.contact")}><input className={formInputClass} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></FormField>
              <FormField label={t("common.phone")}><input className={formInputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t("common.email")}><input type="email" className={formInputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
              <FormField label={t("common.city")}><input className={formInputClass} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t("carriers.vehicleCount")}><input type="number" className={formInputClass} value={form.vehicleCount} onChange={e => setForm({ ...form, vehicleCount: +e.target.value })} /></FormField>
              <FormField label={t("common.rating")}><input type="number" step="0.1" min="0" max="5" className={formInputClass} value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })} /></FormField>
            </div>
            <FormField label={t("carriers.coverageZones")} hint={t("carriers.coverageHint")}><input className={formInputClass} value={zonesInput} onChange={e => setZonesInput(e.target.value)} placeholder="Alger, Blida, Oran" /></FormField>
            <FormField label={t("common.status")}>
              <select className={formSelectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Carrier["status"] })}>
                <option value="Active">{t("common.active")}</option><option value="Inactive">{t("common.inactive")}</option><option value="Suspended">{t("common.suspended")}</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editing ? t("common.save") : t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("carriers.deleteConfirm")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("carriers.deleteMsg", { name: deleteConfirm?.name })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
