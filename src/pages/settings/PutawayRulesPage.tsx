import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, ArrowDownToLine, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { PutawayRule, PutawayRulePriority } from "@/data/mockDataPhase20_22";

// Priority colors now in global StatusBadge map

export default function PutawayRulesPage() {
  const { putawayRules, setPutawayRules, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { isSystemAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<PutawayRule | null>(null);
  const [form, setForm] = useState({ name: "", warehouseId: "", conditionType: "Category" as PutawayRule["conditionType"], conditionValue: "", targetZone: "", targetLocationType: "", priority: "Medium" as PutawayRulePriority, isActive: true, notes: "" });

  const filtered = useMemo(() => {
    let d = (putawayRules as PutawayRule[]).filter(x => canOperateOn(x.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s)); }
    return d;
  }, [putawayRules, canOperateOn, search]);
  const pag = usePagination(filtered, 10);

  const openCreate = () => { setEditRule(null); setForm({ name: "", warehouseId: operationalWarehouses[0]?.id || "", conditionType: "Category", conditionValue: "", targetZone: "", targetLocationType: "", priority: "Medium", isActive: true, notes: "" }); setShowForm(true); };
  const openEdit = (r: PutawayRule) => { setEditRule(r); setForm({ name: r.name, warehouseId: r.warehouseId, conditionType: r.conditionType, conditionValue: r.conditionValue, targetZone: r.targetZone, targetLocationType: r.targetLocationType, priority: r.priority, isActive: r.isActive, notes: r.notes }); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.warehouseId || !form.conditionValue || !form.targetZone) { toast({ title: "Erreur", description: "Champs obligatoires manquants", variant: "destructive" }); return; }
    const wh = warehouses.find(w => w.id === form.warehouseId);
    if (editRule) {
      setPutawayRules((prev: PutawayRule[]) => prev.map(r => r.id === editRule.id ? { ...r, ...form, warehouseName: wh?.name || "", condition: `${form.conditionType} = ${form.conditionValue}` } : r));
      toast({ title: "Règle modifiée" });
    } else {
      const nr: PutawayRule = { id: `PAR-${String(Date.now()).slice(-4)}`, ...form, warehouseName: wh?.name || "", condition: `${form.conditionType} = ${form.conditionValue}`, createdBy: "Utilisateur courant", createdAt: new Date().toISOString().slice(0, 10) };
      setPutawayRules((prev: PutawayRule[]) => [nr, ...prev]);
      toast({ title: "Règle créée" });
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) => setPutawayRules((prev: PutawayRule[]) => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  const deleteRule = (id: string) => { setPutawayRules((prev: PutawayRule[]) => prev.filter(r => r.id !== id)); toast({ title: "Règle supprimée" }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ArrowDownToLine className="h-6 w-6" /> Règles de Putaway</h1>
          <p className="text-sm text-muted-foreground mt-1">Moteur de règles pour assignation automatique des emplacements</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          {isSystemAdmin && <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouvelle règle</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(putawayRules as PutawayRule[]).length}</div><p className="text-xs text-muted-foreground">Total règles</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{(putawayRules as PutawayRule[]).filter(r => r.isActive).length}</div><p className="text-xs text-muted-foreground">Actives</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-muted-foreground">{(putawayRules as PutawayRule[]).filter(r => !r.isActive).length}</div><p className="text-xs text-muted-foreground">Inactives</p></CardContent></Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Nom</TableHead><TableHead>Entrepôt</TableHead><TableHead>Type</TableHead><TableHead>Condition</TableHead><TableHead>Zone cible</TableHead><TableHead>Priorité</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pag.paginatedItems.map(r => (
              <TableRow key={r.id} className={!r.isActive ? "opacity-50" : ""}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.warehouseName}</TableCell>
                <TableCell><StatusBadge status={r.conditionType} /></TableCell>
                <TableCell className="text-xs">{r.condition}</TableCell>
                <TableCell>Zone {r.targetZone} ({r.targetLocationType})</TableCell>
                <TableCell><StatusBadge status={r.priority} /></TableCell>
                <TableCell><Switch checked={r.isActive} onCheckedChange={() => toggleActive(r.id)} /></TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteRule(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination {...pag} totalItems={filtered.length} onPageChange={pag.setCurrentPage} onPageSizeChange={pag.setPageSize} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent><DialogHeader><DialogTitle>{editRule ? "Modifier règle" : "Nouvelle règle"}</DialogTitle></DialogHeader>
          <FormSection title="Détails règle">
            <FormField label="Nom"><Input className={formInputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Entrepôt"><select className={formSelectClass} value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label="Type de condition"><select className={formSelectClass} value={form.conditionType} onChange={e => setForm(p => ({ ...p, conditionType: e.target.value as PutawayRule["conditionType"] }))}>{(["Category","Vendor","Temperature","Weight","Custom"] as const).map(t => <option key={t} value={t}>{t}</option>)}</select></FormField>
            <FormField label="Valeur"><Input className={formInputClass} value={form.conditionValue} onChange={e => setForm(p => ({ ...p, conditionValue: e.target.value }))} placeholder="ex: Produits laitiers" /></FormField>
            <FormField label="Zone cible"><Input className={formInputClass} value={form.targetZone} onChange={e => setForm(p => ({ ...p, targetZone: e.target.value }))} placeholder="ex: A" /></FormField>
            <FormField label="Type emplacement"><select className={formSelectClass} value={form.targetLocationType} onChange={e => setForm(p => ({ ...p, targetLocationType: e.target.value }))}><option value="Chilled">Chilled</option><option value="Frozen">Frozen</option><option value="Ambient">Ambient</option><option value="Dry">Dry</option></select></FormField>
            <FormField label="Priorité"><select className={formSelectClass} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as PutawayRulePriority }))}>{(["High","Medium","Low"] as const).map(p => <option key={p} value={p}>{p}</option>)}</select></FormField>
            <FormField label="Notes"><Input className={formInputClass} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button><Button onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
