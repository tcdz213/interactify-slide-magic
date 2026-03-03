import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, MapPin, Trash2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { LocationType } from "@/data/mockDataPhase20_22";

export default function LocationTypesPage() {
  const { locationTypes, setLocationTypes } = useWMSData();
  const { isSystemAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editType, setEditType] = useState<LocationType | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", allowPicking: false, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, maxWeight: "", color: "#3b82f6" });

  const filtered = useMemo(() => {
    let d = locationTypes as LocationType[];
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s) || x.code.toLowerCase().includes(s)); }
    return d;
  }, [locationTypes, search]);
  const pag = usePagination(filtered, 10);

  const openCreate = () => { setEditType(null); setForm({ name: "", code: "", description: "", allowPicking: false, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, maxWeight: "", color: "#3b82f6" }); setShowForm(true); };
  const openEdit = (t: LocationType) => { setEditType(t); setForm({ name: t.name, code: t.code, description: t.description, allowPicking: t.allowPicking, allowPutaway: t.allowPutaway, allowStorage: t.allowStorage, isQuarantine: t.isQuarantine, temperatureControlled: t.temperatureControlled, maxWeight: t.maxWeight?.toString() || "", color: t.color }); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.code) { toast({ title: "Erreur", description: "Nom et code obligatoires", variant: "destructive" }); return; }
    if (editType) {
      setLocationTypes((prev: LocationType[]) => prev.map(t => t.id === editType.id ? { ...t, ...form, maxWeight: form.maxWeight ? Number(form.maxWeight) : undefined, isActive: true } : t));
      toast({ title: "Type modifié" });
    } else {
      const nt: LocationType = { id: `LT-${String(Date.now()).slice(-4)}`, ...form, maxWeight: form.maxWeight ? Number(form.maxWeight) : undefined, isActive: true };
      setLocationTypes((prev: LocationType[]) => [nt, ...prev]);
      toast({ title: "Type créé" });
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) => setLocationTypes((prev: LocationType[]) => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  const deleteType = (id: string) => { setLocationTypes((prev: LocationType[]) => prev.filter(t => t.id !== id)); toast({ title: "Type supprimé" }); };

  const BoolIcon = ({ val }: { val: boolean }) => val ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground/30" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><MapPin className="h-6 w-6" /> Types d'Emplacements</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuration des types (Bulk, Picking, Staging, Quarantine, Dock…)</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          {isSystemAdmin && <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouveau type</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(locationTypes as LocationType[]).length}</div><p className="text-xs text-muted-foreground">Types configurés</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{(locationTypes as LocationType[]).filter(t => t.isActive).length}</div><p className="text-xs text-muted-foreground">Actifs</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-cyan-600">{(locationTypes as LocationType[]).filter(t => t.temperatureControlled).length}</div><p className="text-xs text-muted-foreground">Temp. contrôlée</p></CardContent></Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Couleur</TableHead><TableHead>Nom</TableHead><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead>Picking</TableHead><TableHead>Putaway</TableHead><TableHead>Stockage</TableHead><TableHead>Quarantaine</TableHead><TableHead>Temp.</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pag.paginatedItems.map(t => (
              <TableRow key={t.id} className={!t.isActive ? "opacity-50" : ""}>
                <TableCell><div className="h-5 w-5 rounded-full border" style={{ backgroundColor: t.color }} /></TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="font-mono text-xs">{t.code}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{t.description}</TableCell>
                <TableCell><BoolIcon val={t.allowPicking} /></TableCell>
                <TableCell><BoolIcon val={t.allowPutaway} /></TableCell>
                <TableCell><BoolIcon val={t.allowStorage} /></TableCell>
                <TableCell><BoolIcon val={t.isQuarantine} /></TableCell>
                <TableCell><BoolIcon val={t.temperatureControlled} /></TableCell>
                <TableCell><Switch checked={t.isActive} onCheckedChange={() => toggleActive(t.id)} /></TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteType(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination {...pag} totalItems={filtered.length} onPageChange={pag.setCurrentPage} onPageSizeChange={pag.setPageSize} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent><DialogHeader><DialogTitle>{editType ? "Modifier type" : "Nouveau type"}</DialogTitle></DialogHeader>
          <FormSection title="Configuration type">
            <FormField label="Nom"><Input className={formInputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Code"><Input className={formInputClass} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="ex: BULK, PICK" /></FormField>
            <FormField label="Description"><Input className={formInputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></FormField>
            <FormField label="Couleur"><Input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-10 w-20" /></FormField>
            <FormField label="Poids max (kg)"><Input className={formInputClass} type="number" value={form.maxWeight} onChange={e => setForm(p => ({ ...p, maxWeight: e.target.value }))} /></FormField>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.allowPicking} onCheckedChange={v => setForm(p => ({ ...p, allowPicking: !!v }))} /> Picking autorisé</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.allowPutaway} onCheckedChange={v => setForm(p => ({ ...p, allowPutaway: !!v }))} /> Putaway autorisé</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.allowStorage} onCheckedChange={v => setForm(p => ({ ...p, allowStorage: !!v }))} /> Stockage autorisé</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.isQuarantine} onCheckedChange={v => setForm(p => ({ ...p, isQuarantine: !!v }))} /> Quarantaine</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.temperatureControlled} onCheckedChange={v => setForm(p => ({ ...p, temperatureControlled: !!v }))} /> Temp. contrôlée</label>
            </div>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button><Button onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
