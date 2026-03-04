import { useState, useMemo } from "react";
import { BookOpen, Plus, Pencil, Trash2, Search, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
export type AccountSubType = "Current" | "Non-Current" | "Operating" | "Non-Operating" | "Control" | "Tax";

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subType?: AccountSubType;
  parentId?: string;
  isReconcilable: boolean;
  isActive: boolean;
  description?: string;
}

const INITIAL_ACCOUNTS: ChartAccount[] = [
  // AP Control
  { id: "ACC-001", code: "401000", name: "Fournisseurs — Compte de contrôle", type: "Liability", subType: "Control", isReconcilable: true, isActive: true, description: "Compte AP principal" },
  // Inventory
  { id: "ACC-002", code: "310000", name: "Stock de matières premières", type: "Asset", subType: "Current", isReconcilable: false, isActive: true, description: "Débité à la réception (storable)" },
  { id: "ACC-003", code: "311000", name: "Stock de marchandises", type: "Asset", subType: "Current", isReconcilable: false, isActive: true },
  // Expenses — Direct
  { id: "ACC-004", code: "610000", name: "Achats de matières et fournitures", type: "Expense", subType: "Operating", isReconcilable: false, isActive: true, description: "Consommables / services" },
  { id: "ACC-005", code: "611000", name: "Achats de marchandises", type: "Expense", subType: "Operating", isReconcilable: false, isActive: true },
  // Expenses — Indirect
  { id: "ACC-006", code: "620000", name: "Services extérieurs (fret, assurance)", type: "Expense", subType: "Operating", isReconcilable: false, isActive: true },
  // Tax Receivable (Input VAT)
  { id: "ACC-007", code: "445000", name: "TVA déductible sur achats", type: "Asset", subType: "Tax", isReconcilable: false, isActive: true },
  { id: "ACC-008", code: "445100", name: "TVA collectée sur ventes", type: "Liability", subType: "Tax", isReconcilable: false, isActive: true },
  // FX Gain / Loss
  { id: "ACC-009", code: "756000", name: "Gains de change", type: "Revenue", subType: "Non-Operating", isReconcilable: false, isActive: true },
  { id: "ACC-010", code: "766000", name: "Pertes de change", type: "Expense", subType: "Non-Operating", isReconcilable: false, isActive: true },
  // Accrued Liabilities (GRNI)
  { id: "ACC-011", code: "408000", name: "Fournisseurs — Factures non parvenues", type: "Liability", subType: "Current", isReconcilable: true, isActive: true, description: "GRN sans facture" },
  // Fixed Assets
  { id: "ACC-012", code: "200000", name: "Immobilisations corporelles", type: "Asset", subType: "Non-Current", isReconcilable: false, isActive: true },
  // Revenue
  { id: "ACC-013", code: "700000", name: "Ventes de marchandises", type: "Revenue", subType: "Operating", isReconcilable: false, isActive: true },
  // Bank
  { id: "ACC-014", code: "512000", name: "Banque (compte courant)", type: "Asset", subType: "Current", isReconcilable: true, isActive: true },
  // Cash
  { id: "ACC-015", code: "530000", name: "Caisse", type: "Asset", subType: "Current", isReconcilable: true, isActive: true },
];

const TYPE_COLORS: Record<AccountType, string> = {
  Asset: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Liability: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Equity: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Revenue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Expense: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const emptyForm = (): Omit<ChartAccount, "id"> => ({
  code: "", name: "", type: "Expense", subType: undefined, parentId: undefined,
  isReconcilable: false, isActive: true, description: "",
});

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartAccount[]>(INITIAL_ACCOUNTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChartAccount | null>(null);
  const [form, setForm] = useState<Omit<ChartAccount, "id">>(emptyForm());
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["Asset", "Liability", "Expense", "Revenue"]));
  const [deleteConfirm, setDeleteConfirm] = useState<ChartAccount | null>(null);

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      if (filterType !== "all" && a.type !== filterType) return false;
      if (search && !a.code.includes(search) && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts, filterType, search]);

  const grouped = useMemo(() => {
    const map = new Map<AccountType, ChartAccount[]>();
    for (const a of filtered) {
      if (!map.has(a.type)) map.set(a.type, []);
      map.get(a.type)!.push(a);
    }
    return map;
  }, [filtered]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (a: ChartAccount) => {
    setEditing(a);
    setForm({ code: a.code, name: a.name, type: a.type, subType: a.subType, parentId: a.parentId, isReconcilable: a.isReconcilable, isActive: a.isActive, description: a.description });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast({ title: "Erreur", description: "Code et nom requis", variant: "destructive" });
      return;
    }
    if (accounts.some(a => a.code === form.code.trim() && a.id !== editing?.id)) {
      toast({ title: "Erreur", description: "Ce code comptable existe déjà", variant: "destructive" });
      return;
    }
    if (editing) {
      setAccounts(prev => prev.map(a => a.id === editing.id ? { ...a, ...form, code: form.code.trim(), name: form.name.trim() } : a));
      toast({ title: "Compte modifié", description: form.code });
    } else {
      const id = `ACC-${Date.now()}`;
      setAccounts(prev => [...prev, { id, ...form, code: form.code.trim(), name: form.name.trim() }]);
      toast({ title: "Compte créé", description: `${form.code} — ${form.name}` });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setAccounts(prev => prev.filter(a => a.id !== deleteConfirm.id));
      toast({ title: "Compte supprimé", description: deleteConfirm.code });
      setDeleteConfirm(null);
    }
  };

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const typeOrder: AccountType[] = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
  const typeLabels: Record<AccountType, string> = {
    Asset: "Actifs", Liability: "Passifs", Equity: "Capitaux propres",
    Revenue: "Produits", Expense: "Charges",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Plan Comptable</h1>
            <p className="text-sm text-muted-foreground">{accounts.length} comptes • Structure PCG Algérien</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouveau compte</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {typeOrder.map(type => (
          <div key={type} className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{typeLabels[type]}</p>
            <p className="text-lg font-bold mt-1">{accounts.filter(a => a.type === type).length}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher code ou nom..." value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous les types</option>
          {typeOrder.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
        </select>
      </div>

      {/* Grouped account tree */}
      <div className="space-y-2">
        {typeOrder.filter(type => grouped.has(type)).map(type => (
          <div key={type} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleType(type)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              {expandedTypes.has(type) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[type]}`}>{typeLabels[type]}</span>
              <span className="text-xs text-muted-foreground ml-auto">{grouped.get(type)!.length} comptes</span>
            </button>
            {expandedTypes.has(type) && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground w-28">Code</th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Libellé</th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground w-28">Sous-type</th>
                    <th className="text-center px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground w-20">Lettrable</th>
                    <th className="text-center px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground w-16">Actif</th>
                    <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.get(type)!.map(acc => (
                    <tr key={acc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold">{acc.code}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium">{acc.name}</span>
                        {acc.description && <p className="text-[10px] text-muted-foreground mt-0.5">{acc.description}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{acc.subType ?? "—"}</td>
                      <td className="px-4 py-2.5 text-center">{acc.isReconcilable ? "✓" : "—"}</td>
                      <td className="px-4 py-2.5 text-center">{acc.isActive ? <span className="text-emerald-600">●</span> : <span className="text-muted-foreground">○</span>}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(acc)} className="p-1.5 rounded-md hover:bg-muted" title="Modifier"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => setDeleteConfirm(acc)} className="p-1.5 rounded-md hover:bg-destructive/10" title="Supprimer"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Modifier le compte" : "Nouveau compte"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Code *">
                <input className={formInputClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="401000" />
              </FormField>
              <FormField label="Type *" className="col-span-2">
                <select className={formSelectClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AccountType })}>
                  {typeOrder.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Libellé *">
              <input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Sous-type">
                <select className={formSelectClass} value={form.subType ?? ""} onChange={e => setForm({ ...form, subType: (e.target.value || undefined) as AccountSubType | undefined })}>
                  <option value="">—</option>
                  {["Current", "Non-Current", "Operating", "Non-Operating", "Control", "Tax"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Compte parent">
                <select className={formSelectClass} value={form.parentId ?? ""} onChange={e => setForm({ ...form, parentId: e.target.value || undefined })}>
                  <option value="">— Aucun —</option>
                  {accounts.filter(a => a.id !== editing?.id).map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Description">
              <input className={formInputClass} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} />
            </FormField>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isReconcilable} onChange={e => setForm({ ...form, isReconcilable: e.target.checked })} className="rounded border-input" />
                Lettrable (rapprochable)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded border-input" />
                Actif
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer le compte ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Le compte <strong>{deleteConfirm?.code}</strong> ({deleteConfirm?.name}) sera supprimé.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
