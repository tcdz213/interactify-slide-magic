import { useState, useMemo } from "react";
import { Wallet, Plus, Pencil, Trash2, Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import { currency } from "@/data/masterData";
import { Progress } from "@/components/ui/progress";

export type BudgetControlAction = "None" | "Warn" | "Block";

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  manager: string;
  isActive: boolean;
}

export interface BudgetLine {
  id: string;
  costCenterId: string;
  accountCode: string;
  accountName: string;
  period: string; // e.g. "2026"
  allocatedAmount: number;
  committedAmount: number; // PO encumbrance
  actualAmount: number;    // invoiced / paid
  controlAction: BudgetControlAction;
}

const INITIAL_COST_CENTERS: CostCenter[] = [
  { id: "CC-001", code: "CC-ACHAT", name: "Département Achats", manager: "Karim Ben Ali", isActive: true },
  { id: "CC-002", code: "CC-PROD", name: "Production", manager: "Samir Rafik", isActive: true },
  { id: "CC-003", code: "CC-LOG", name: "Logistique & Transport", manager: "Hassan Nour", isActive: true },
  { id: "CC-004", code: "CC-ADM", name: "Administration Générale", manager: "Nadia Salim", isActive: true },
  { id: "CC-005", code: "CC-MAINT", name: "Maintenance", manager: "Tarek Daoui", isActive: true },
];

const INITIAL_BUDGETS: BudgetLine[] = [
  { id: "BL-001", costCenterId: "CC-001", accountCode: "610000", accountName: "Achats matières", period: "2026", allocatedAmount: 50000000, committedAmount: 18500000, actualAmount: 12300000, controlAction: "Block" },
  { id: "BL-002", costCenterId: "CC-001", accountCode: "620000", accountName: "Services extérieurs", period: "2026", allocatedAmount: 8000000, committedAmount: 3200000, actualAmount: 2100000, controlAction: "Warn" },
  { id: "BL-003", costCenterId: "CC-002", accountCode: "610000", accountName: "Achats matières", period: "2026", allocatedAmount: 30000000, committedAmount: 12000000, actualAmount: 8500000, controlAction: "Block" },
  { id: "BL-004", costCenterId: "CC-003", accountCode: "620000", accountName: "Transport & fret", period: "2026", allocatedAmount: 15000000, committedAmount: 7800000, actualAmount: 5200000, controlAction: "Warn" },
  { id: "BL-005", costCenterId: "CC-004", accountCode: "620000", accountName: "Fournitures bureau", period: "2026", allocatedAmount: 3000000, committedAmount: 1200000, actualAmount: 900000, controlAction: "None" },
  { id: "BL-006", costCenterId: "CC-005", accountCode: "610000", accountName: "Pièces détachées", period: "2026", allocatedAmount: 10000000, committedAmount: 4500000, actualAmount: 3800000, controlAction: "Warn" },
];

function getBudgetStatus(line: BudgetLine) {
  const consumed = line.committedAmount + line.actualAmount;
  const pct = line.allocatedAmount > 0 ? (consumed / line.allocatedAmount) * 100 : 0;
  if (pct >= 100) return { label: "Dépassé", color: "text-destructive", bgColor: "bg-destructive/10", pct };
  if (pct >= 80) return { label: "Critique", color: "text-warning", bgColor: "bg-warning/10", pct };
  if (pct >= 50) return { label: "En cours", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/10", pct };
  return { label: "OK", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/10", pct };
}

const emptyBudgetForm = (): Omit<BudgetLine, "id"> => ({
  costCenterId: "", accountCode: "", accountName: "", period: "2026",
  allocatedAmount: 0, committedAmount: 0, actualAmount: 0, controlAction: "Warn",
});

export default function BudgetCostCentersPage() {
  const [costCenters, setCostCenters] = useState(INITIAL_COST_CENTERS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [search, setSearch] = useState("");
  const [filterCC, setFilterCC] = useState("all");
  const [tab, setTab] = useState<"budgets" | "centers">("budgets");

  // Budget form
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetLine | null>(null);
  const [budgetForm, setBudgetForm] = useState<Omit<BudgetLine, "id">>(emptyBudgetForm());

  // CC form
  const [showCCForm, setShowCCForm] = useState(false);
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);
  const [ccForm, setCCForm] = useState({ code: "", name: "", manager: "", isActive: true });

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      if (filterCC !== "all" && b.costCenterId !== filterCC) return false;
      if (search && !b.accountName.toLowerCase().includes(search.toLowerCase()) && !b.accountCode.includes(search)) return false;
      return true;
    });
  }, [budgets, filterCC, search]);

  const totalAllocated = budgets.reduce((s, b) => s + b.allocatedAmount, 0);
  const totalCommitted = budgets.reduce((s, b) => s + b.committedAmount, 0);
  const totalActual = budgets.reduce((s, b) => s + b.actualAmount, 0);
  const totalAvailable = totalAllocated - totalCommitted - totalActual;

  const handleSaveBudget = () => {
    if (!budgetForm.costCenterId || !budgetForm.accountCode || budgetForm.allocatedAmount <= 0) {
      toast({ title: "Erreur", description: "Centre de coût, compte et montant requis", variant: "destructive" });
      return;
    }
    if (editingBudget) {
      setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...b, ...budgetForm } : b));
      toast({ title: "Ligne budgétaire modifiée" });
    } else {
      setBudgets(prev => [...prev, { id: `BL-${Date.now()}`, ...budgetForm }]);
      toast({ title: "Ligne budgétaire créée" });
    }
    setShowBudgetForm(false);
  };

  const handleSaveCC = () => {
    if (!ccForm.code.trim() || !ccForm.name.trim()) {
      toast({ title: "Erreur", description: "Code et nom requis", variant: "destructive" });
      return;
    }
    if (editingCC) {
      setCostCenters(prev => prev.map(c => c.id === editingCC.id ? { ...c, ...ccForm } : c));
      toast({ title: "Centre de coût modifié" });
    } else {
      setCostCenters(prev => [...prev, { id: `CC-${Date.now()}`, ...ccForm }]);
      toast({ title: "Centre de coût créé" });
    }
    setShowCCForm(false);
  };

  /** Simulate budget check for a PO amount */
  const checkBudget = (costCenterId: string, amount: number): { allowed: boolean; message: string } => {
    const lines = budgets.filter(b => b.costCenterId === costCenterId);
    if (lines.length === 0) return { allowed: true, message: "Aucun budget configuré" };
    const totalRemaining = lines.reduce((s, b) => s + (b.allocatedAmount - b.committedAmount - b.actualAmount), 0);
    if (amount > totalRemaining) {
      const blockingLines = lines.filter(b => b.controlAction === "Block");
      if (blockingLines.length > 0) return { allowed: false, message: `Budget dépassé — bloqué (disponible: ${currency(totalRemaining)})` };
      return { allowed: true, message: `⚠️ Budget dépassé — avertissement (disponible: ${currency(totalRemaining)})` };
    }
    return { allowed: true, message: `Budget disponible: ${currency(totalRemaining)}` };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Budget & Centres de Coûts</h1>
            <p className="text-sm text-muted-foreground">Contrôle budgétaire et allocation par centre</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "budgets" ? "default" : "outline"} size="sm" onClick={() => setTab("budgets")}>Budgets</Button>
          <Button variant={tab === "centers" ? "default" : "outline"} size="sm" onClick={() => setTab("centers")}>Centres de coûts</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Budget total alloué", value: currency(totalAllocated) },
          { label: "Engagé (PO)", value: currency(totalCommitted), color: "text-amber-600" },
          { label: "Consommé (facturé)", value: currency(totalActual), color: "text-blue-600" },
          { label: "Disponible", value: currency(totalAvailable), color: totalAvailable < 0 ? "text-destructive" : "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {tab === "budgets" ? (
        <>
          {/* Budget lines */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <select value={filterCC} onChange={e => setFilterCC(e.target.value)}
              className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
              <option value="all">Tous centres</option>
              {costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button onClick={() => { setEditingBudget(null); setBudgetForm(emptyBudgetForm()); setShowBudgetForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle ligne</Button>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Centre de coût</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Compte</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Alloué</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Engagé</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Consommé</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Disponible</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground w-40">Consommation</th>
                  <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Contrôle</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map(b => {
                  const cc = costCenters.find(c => c.id === b.costCenterId);
                  const status = getBudgetStatus(b);
                  const available = b.allocatedAmount - b.committedAmount - b.actualAmount;
                  return (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{cc?.name ?? b.costCenterId}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{b.accountCode}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">{b.accountName}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{currency(b.allocatedAmount)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{currency(b.committedAmount)}</td>
                      <td className="px-4 py-3 text-right text-blue-600">{currency(b.actualAmount)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${available < 0 ? "text-destructive" : "text-emerald-600"}`}>{currency(available)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(status.pct, 100)} className="h-2 flex-1" />
                          <span className={`text-xs font-medium ${status.color}`}>{status.pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.controlAction === "Block" && <span className="inline-flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3.5 w-3.5" /> Bloquer</span>}
                        {b.controlAction === "Warn" && <span className="inline-flex items-center gap-1 text-xs text-warning"><AlertTriangle className="h-3.5 w-3.5" /> Avertir</span>}
                        {b.controlAction === "None" && <span className="text-xs text-muted-foreground">Aucun</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setEditingBudget(b); setBudgetForm({ costCenterId: b.costCenterId, accountCode: b.accountCode, accountName: b.accountName, period: b.period, allocatedAmount: b.allocatedAmount, committedAmount: b.committedAmount, actualAmount: b.actualAmount, controlAction: b.controlAction }); setShowBudgetForm(true); }}
                          className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Cost Centers tab */}
          <div className="flex justify-end">
            <Button onClick={() => { setEditingCC(null); setCCForm({ code: "", name: "", manager: "", isActive: true }); setShowCCForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Nouveau centre</Button>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Nom</th>
                  <th className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">Responsable</th>
                  <th className="text-right px-4 py-3 text-xs uppercase text-muted-foreground">Budget alloué</th>
                  <th className="text-center px-4 py-3 text-xs uppercase text-muted-foreground">Actif</th>
                  <th className="text-right px-4 py-3 text-xs uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {costCenters.map(cc => {
                  const ccBudget = budgets.filter(b => b.costCenterId === cc.id).reduce((s, b) => s + b.allocatedAmount, 0);
                  return (
                    <tr key={cc.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs font-bold">{cc.code}</td>
                      <td className="px-4 py-3 font-medium">{cc.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{cc.manager}</td>
                      <td className="px-4 py-3 text-right font-medium">{currency(ccBudget)}</td>
                      <td className="px-4 py-3 text-center">{cc.isActive ? <span className="text-emerald-600">●</span> : <span className="text-muted-foreground">○</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setEditingCC(cc); setCCForm({ code: cc.code, name: cc.name, manager: cc.manager, isActive: cc.isActive }); setShowCCForm(true); }}
                          className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Budget form dialog */}
      <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingBudget ? "Modifier la ligne budgétaire" : "Nouvelle ligne budgétaire"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Centre de coût *">
              <select className={formSelectClass} value={budgetForm.costCenterId} onChange={e => setBudgetForm({ ...budgetForm, costCenterId: e.target.value })}>
                <option value="">— Choisir —</option>
                {costCenters.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Code compte *">
                <input className={formInputClass} value={budgetForm.accountCode} onChange={e => setBudgetForm({ ...budgetForm, accountCode: e.target.value })} placeholder="610000" />
              </FormField>
              <FormField label="Libellé compte *">
                <input className={formInputClass} value={budgetForm.accountName} onChange={e => setBudgetForm({ ...budgetForm, accountName: e.target.value })} placeholder="Achats matières" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Période">
                <input className={formInputClass} value={budgetForm.period} onChange={e => setBudgetForm({ ...budgetForm, period: e.target.value })} />
              </FormField>
              <FormField label="Montant alloué (DZD) *">
                <input type="number" className={formInputClass} value={budgetForm.allocatedAmount} onChange={e => setBudgetForm({ ...budgetForm, allocatedAmount: Number(e.target.value) })} />
              </FormField>
            </div>
            <FormField label="Action de contrôle">
              <select className={formSelectClass} value={budgetForm.controlAction} onChange={e => setBudgetForm({ ...budgetForm, controlAction: e.target.value as BudgetControlAction })}>
                <option value="None">Aucun contrôle</option>
                <option value="Warn">Avertissement</option>
                <option value="Block">Blocage</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetForm(false)}>Annuler</Button>
            <Button onClick={handleSaveBudget}>{editingBudget ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CC form dialog */}
      <Dialog open={showCCForm} onOpenChange={setShowCCForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingCC ? "Modifier le centre de coût" : "Nouveau centre de coût"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Code *"><input className={formInputClass} value={ccForm.code} onChange={e => setCCForm({ ...ccForm, code: e.target.value })} /></FormField>
            <FormField label="Nom *"><input className={formInputClass} value={ccForm.name} onChange={e => setCCForm({ ...ccForm, name: e.target.value })} /></FormField>
            <FormField label="Responsable"><input className={formInputClass} value={ccForm.manager} onChange={e => setCCForm({ ...ccForm, manager: e.target.value })} /></FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ccForm.isActive} onChange={e => setCCForm({ ...ccForm, isActive: e.target.checked })} className="rounded border-input" />
              Actif
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCCForm(false)}>Annuler</Button>
            <Button onClick={handleSaveCC}>{editingCC ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
