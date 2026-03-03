import { useMemo, useState } from "react";
import { Settings2, Search, Plus, AlertTriangle, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReplenishmentRule {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  minQty: number;
  maxQty: number;
  reorderQty: number;
  currentQty: number;
  strategy: "Min_Max" | "Reorder_Point" | "Kanban";
  status: "Active" | "Inactive";
  lastTriggered?: string;
}

const INITIAL_RULES: ReplenishmentRule[] = [
  { id: "RPL-R001", productId: "P001", productName: "Lait UHT 1L", warehouseId: "WH01", warehouseName: "Entrepôt Central Alger", locationId: "WH01-A1-01", minQty: 500, maxQty: 2000, reorderQty: 800, currentQty: 1200, strategy: "Min_Max", status: "Active", lastTriggered: "2026-02-18" },
  { id: "RPL-R002", productId: "P002", productName: "Yaourt Nature 170g", warehouseId: "WH01", warehouseName: "Entrepôt Central Alger", locationId: "WH01-A1-02", minQty: 300, maxQty: 1000, reorderQty: 500, currentQty: 580, strategy: "Min_Max", status: "Active" },
  { id: "RPL-R003", productId: "P007", productName: "Poulet surgelé 1kg", warehouseId: "WH01", warehouseName: "Entrepôt Central Alger", locationId: "WH01-D1-01", minQty: 150, maxQty: 500, reorderQty: 200, currentQty: 148, strategy: "Reorder_Point", status: "Active", lastTriggered: "2026-02-20" },
  { id: "RPL-R004", productId: "P008", productName: "Pizza surgelée 400g", warehouseId: "WH01", warehouseName: "Entrepôt Central Alger", locationId: "WH01-D1-02", minQty: 100, maxQty: 400, reorderQty: 150, currentQty: 85, strategy: "Reorder_Point", status: "Active", lastTriggered: "2026-02-20" },
  { id: "RPL-R005", productId: "P010", productName: "Huile de Tournesol 5L", warehouseId: "WH01", warehouseName: "Entrepôt Central Alger", locationId: "WH01-E1-02", minQty: 200, maxQty: 600, reorderQty: 250, currentQty: 180, strategy: "Min_Max", status: "Active", lastTriggered: "2026-02-19" },
  { id: "RPL-R006", productId: "P012", productName: "Beurre 500g", warehouseId: "WH01", warehouseName: "Entrepôt Central Alger", locationId: "WH01-A2-02", minQty: 100, maxQty: 300, reorderQty: 100, currentQty: 45, strategy: "Min_Max", status: "Active", lastTriggered: "2026-02-20" },
];

const emptyForm = (): Partial<ReplenishmentRule> => ({
  productName: "", locationId: "", minQty: 0, maxQty: 0, reorderQty: 0, currentQty: 0, strategy: "Min_Max", status: "Active",
});

export default function ReplenishmentRulesPage() {
  const { products } = useWMSData();
  const [rules, setRules] = useState<ReplenishmentRule[]>(INITIAL_RULES);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReplenishmentRule | null>(null);
  const [form, setForm] = useState<Partial<ReplenishmentRule>>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = rules.filter(
    (r) =>
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const belowMin = rules.filter((r) => r.currentQty < r.minQty);
    return {
      totalRules: rules.length,
      active: rules.filter((r) => r.status === "Active").length,
      belowMin: belowMin.length,
      alertValue: belowMin.reduce((s, r) => s + (r.minQty - r.currentQty) * 100, 0),
    };
  }, [rules]);

  const triggerReplenishment = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => r.id === ruleId ? { ...r, lastTriggered: new Date().toISOString().slice(0, 10) } : r)
    );
    toast({ title: "Réapprovisionnement déclenché", description: `Règle ${ruleId}` });
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (rule: ReplenishmentRule) => {
    setEditingRule(rule);
    setForm({ ...rule });
    setFormOpen(true);
  };

  const saveRule = () => {
    if (!form.productName || !form.locationId) {
      toast({ title: "Erreur", description: "Produit et emplacement requis", variant: "destructive" });
      return;
    }
    if (editingRule) {
      setRules((prev) => prev.map((r) => r.id === editingRule.id ? { ...r, ...form } as ReplenishmentRule : r));
      toast({ title: "Règle modifiée", description: editingRule.id });
    } else {
      const newRule: ReplenishmentRule = {
        id: `RPL-R${String(rules.length + 1).padStart(3, "0")}`,
        productId: form.productName?.slice(0, 4) ?? "",
        productName: form.productName ?? "",
        warehouseId: "WH01",
        warehouseName: "Entrepôt Central Alger",
        locationId: form.locationId ?? "",
        minQty: form.minQty ?? 0,
        maxQty: form.maxQty ?? 0,
        reorderQty: form.reorderQty ?? 0,
        currentQty: form.currentQty ?? 0,
        strategy: form.strategy ?? "Min_Max",
        status: form.status ?? "Active",
      };
      setRules((prev) => [...prev, newRule]);
      toast({ title: "Règle créée", description: newRule.id });
    }
    setFormOpen(false);
  };

  const deleteRule = () => {
    if (!deleteTarget) return;
    setRules((prev) => prev.filter((r) => r.id !== deleteTarget));
    toast({ title: "Règle supprimée", description: deleteTarget });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Règles de réapprovisionnement</h1>
            <p className="text-sm text-muted-foreground">Min/Max par produit, déclenchement auto</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Nouvelle règle
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Règles totales</p>
          <p className="text-xl font-semibold">{stats.totalRules}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Actives</p>
          <p className="text-xl font-semibold text-success">{stats.active}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Sous le minimum</p>
          <p className="text-xl font-semibold text-destructive">{stats.belowMin}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Valeur déficit</p>
          <p className="text-xl font-semibold text-warning">{currency(stats.alertValue)}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Emplacement</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stratégie</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Min</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Max</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actuel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">État</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const belowMin = r.currentQty < r.minQty;
              return (
                <tr key={r.id} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${belowMin ? "bg-destructive/5" : ""}`}>
                  <td className="px-4 py-3 font-medium">{r.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.locationId}</td>
                  <td className="px-4 py-3 text-xs">{r.strategy.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-right">{r.minQty}</td>
                  <td className="px-4 py-3 text-right">{r.maxQty}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.currentQty}</td>
                  <td className="px-4 py-3">
                    {belowMin ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" /> Sous min
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {belowMin && (
                        <Button variant="outline" size="sm" onClick={() => triggerReplenishment(r.id)}>
                          Déclencher
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget(r.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? "Modifier la règle" : "Nouvelle règle"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Produit</label>
              <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.productName ?? ""} onChange={(e) => setForm({ ...form, productName: e.target.value })}>
                <option value="">— Choisir —</option>
                {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emplacement</label>
              <input className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.locationId ?? ""} onChange={(e) => setForm({ ...form, locationId: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stratégie</label>
              <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.strategy ?? "Min_Max"} onChange={(e) => setForm({ ...form, strategy: e.target.value as any })}>
                <option value="Min_Max">Min / Max</option>
                <option value="Reorder_Point">Reorder Point</option>
                <option value="Kanban">Kanban</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Min</label>
              <input type="number" className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.minQty ?? 0} onChange={(e) => setForm({ ...form, minQty: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max</label>
              <input type="number" className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.maxQty ?? 0} onChange={(e) => setForm({ ...form, maxQty: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Qté réapprovisionnement</label>
              <input type="number" className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.reorderQty ?? 0} onChange={(e) => setForm({ ...form, reorderQty: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Statut</label>
              <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                value={form.status ?? "Active"} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button onClick={saveRule}>{editingRule ? "Modifier" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette règle ?</AlertDialogTitle>
            <AlertDialogDescription>La règle {deleteTarget} sera supprimée définitivement.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRule}>Oui, supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
