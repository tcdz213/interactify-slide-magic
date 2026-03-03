import { useState, useMemo } from "react";
import { Truck, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { Carrier } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";

const empty: Omit<Carrier, "id"> = { name: "", contact: "", phone: "", email: "", city: "", vehicleCount: 0, coverageZones: [], status: "Active", rating: 0 };

export default function CarriersPage() {
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
      toast({ title: "Transporteur modifié", description: form.name });
    } else {
      setData(prev => [...prev, { id: `CR-${String(prev.length + 1).padStart(3, "0")}`, ...form, coverageZones: zones }]);
      toast({ title: "Transporteur créé", description: form.name });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setData(prev => prev.filter(c => c.id !== deleteConfirm.id));
    toast({ title: "Transporteur supprimé" }); setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Truck className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">Transporteurs</h1><p className="text-sm text-muted-foreground">{data.length} transporteurs</p></div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouveau transporteur</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ville</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Véhicules</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Zones de couverture</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Note</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
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
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">Aucun transporteur trouvé.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Modifier le transporteur" : "Nouveau transporteur"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Nom" required><input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Contact"><input className={formInputClass} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></FormField>
              <FormField label="Téléphone"><input className={formInputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email"><input type="email" className={formInputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
              <FormField label="Ville"><input className={formInputClass} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nb véhicules"><input type="number" className={formInputClass} value={form.vehicleCount} onChange={e => setForm({ ...form, vehicleCount: +e.target.value })} /></FormField>
              <FormField label="Note"><input type="number" step="0.1" min="0" max="5" className={formInputClass} value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })} /></FormField>
            </div>
            <FormField label="Zones de couverture" hint="Séparées par des virgules"><input className={formInputClass} value={zonesInput} onChange={e => setZonesInput(e.target.value)} placeholder="Alger, Blida, Oran" /></FormField>
            <FormField label="Statut">
              <select className={formSelectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Carrier["status"] })}>
                <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Suspended">Suspendu</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Supprimer le transporteur ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer <strong>{deleteConfirm?.name}</strong> ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
