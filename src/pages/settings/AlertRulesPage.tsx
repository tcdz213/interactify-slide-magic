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
import { Plus, Search, Bell, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AlertRule } from "@/data/mockDataPhase20_22";

export default function AlertRulesPage() {
  const { alertRules, setAlertRules, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { isSystemAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<AlertRule | null>(null);
  const [form, setForm] = useState({ name: "", warehouseId: "", metric: "StockLevel" as AlertRule["metric"], condition: "Below" as AlertRule["condition"], threshold: "", channel: "InApp" as AlertRule["channel"], recipients: "", isActive: true, notes: "" });

  const filtered = useMemo(() => {
    let d = (alertRules as AlertRule[]).filter(x => canOperateOn(x.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s)); }
    return d;
  }, [alertRules, canOperateOn, search]);
  const pag = usePagination(filtered, 10);

  const openCreate = () => { setEditRule(null); setForm({ name: "", warehouseId: operationalWarehouses[0]?.id || "", metric: "StockLevel", condition: "Below", threshold: "", channel: "InApp", recipients: "", isActive: true, notes: "" }); setShowForm(true); };
  const openEdit = (r: AlertRule) => { setEditRule(r); setForm({ name: r.name, warehouseId: r.warehouseId, metric: r.metric, condition: r.condition, threshold: r.threshold, channel: r.channel, recipients: r.recipients, isActive: r.isActive, notes: r.notes }); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.warehouseId || !form.threshold) { toast({ title: "Erreur", description: "Champs obligatoires manquants", variant: "destructive" }); return; }
    const wh = warehouses.find(w => w.id === form.warehouseId);
    if (editRule) {
      setAlertRules((prev: AlertRule[]) => prev.map(r => r.id === editRule.id ? { ...r, ...form, warehouseName: wh?.name || "" } : r));
      toast({ title: "Règle d'alerte modifiée" });
    } else {
      const nr: AlertRule = { id: `ALR-${String(Date.now()).slice(-4)}`, ...form, warehouseName: wh?.name || "", triggerCount: 0, createdBy: "Utilisateur courant", createdAt: new Date().toISOString().slice(0, 10) };
      setAlertRules((prev: AlertRule[]) => [nr, ...prev]);
      toast({ title: "Règle d'alerte créée" });
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) => setAlertRules((prev: AlertRule[]) => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  const deleteRule = (id: string) => { setAlertRules((prev: AlertRule[]) => prev.filter(r => r.id !== id)); toast({ title: "Règle supprimée" }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Bell className="h-6 w-6" /> Règles d'Alertes</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuration des seuils, canaux et déclencheurs d'alertes</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          {isSystemAdmin && <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouvelle alerte</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(alertRules as AlertRule[]).length}</div><p className="text-xs text-muted-foreground">Total règles</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{(alertRules as AlertRule[]).filter(r => r.isActive).length}</div><p className="text-xs text-muted-foreground">Actives</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-orange-500">{(alertRules as AlertRule[]).reduce((s, r) => s + r.triggerCount, 0)}</div><p className="text-xs text-muted-foreground">Déclenchements total</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{new Set((alertRules as AlertRule[]).map(r => r.metric)).size}</div><p className="text-xs text-muted-foreground">Métriques couvertes</p></CardContent></Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Nom</TableHead><TableHead>Entrepôt</TableHead><TableHead>Métrique</TableHead><TableHead>Condition</TableHead><TableHead>Seuil</TableHead><TableHead>Canal</TableHead><TableHead>Décl.</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pag.paginatedItems.map(r => (
              <TableRow key={r.id} className={!r.isActive ? "opacity-50" : ""}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.warehouseName}</TableCell>
                <TableCell><StatusBadge status={r.metric} /></TableCell>
                <TableCell>{r.condition}</TableCell>
                <TableCell className="font-mono">{r.threshold}</TableCell>
                <TableCell><StatusBadge status={r.channel} /></TableCell>
                <TableCell className="text-center">{r.triggerCount}</TableCell>
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
        <DialogContent><DialogHeader><DialogTitle>{editRule ? "Modifier alerte" : "Nouvelle alerte"}</DialogTitle></DialogHeader>
          <FormSection title="Détails alerte">
            <FormField label="Nom"><Input className={formInputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Entrepôt"><select className={formSelectClass} value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label="Métrique"><select className={formSelectClass} value={form.metric} onChange={e => setForm(p => ({ ...p, metric: e.target.value as AlertRule["metric"] }))}>{(["StockLevel","ExpiryDate","Temperature","OrderDelay","CycleCountVariance","Custom"] as const).map(m => <option key={m} value={m}>{m}</option>)}</select></FormField>
            <FormField label="Condition"><select className={formSelectClass} value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value as AlertRule["condition"] }))}>{(["Below","Above","Equals","Within","Overdue"] as const).map(c => <option key={c} value={c}>{c}</option>)}</select></FormField>
            <FormField label="Seuil"><Input className={formInputClass} value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} placeholder="ex: 500, 7 jours, 2%" /></FormField>
            <FormField label="Canal"><select className={formSelectClass} value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value as AlertRule["channel"] }))}><option value="InApp">In-App</option><option value="Email">Email</option><option value="Both">Les deux</option></select></FormField>
            <FormField label="Destinataires"><Input className={formInputClass} value={form.recipients} onChange={e => setForm(p => ({ ...p, recipients: e.target.value }))} placeholder="Noms séparés par virgule" /></FormField>
            <FormField label="Notes"><Input className={formInputClass} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button><Button onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
