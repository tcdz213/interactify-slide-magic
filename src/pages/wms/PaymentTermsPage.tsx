import { useState, useMemo } from "react";
import { CreditCard, Plus, Pencil, Trash2, Search, AlertTriangle, Percent } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { PaymentTerm } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";

const empty: Omit<PaymentTerm, "id"> = {
  name: "", code: "Net_30", description: "", dueDays: 30,
  discountPct: 0, discountDays: 0, isActive: true,
};

export default function PaymentTermsPage() {
  const { paymentTerms: data, setPaymentTerms: setData, vendors } = useWMSData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PaymentTerm | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<PaymentTerm | null>(null);

  const filtered = useMemo(() => data.filter(pt => {
    if (search && !pt.name.toLowerCase().includes(search.toLowerCase()) && !pt.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search]);

  const vendorCountMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(pt => {
      const count = vendors.filter(v => v.paymentTerms === pt.code).length;
      map.set(pt.id, count);
    });
    return map;
  }, [data, vendors]);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (pt: PaymentTerm) => { setEditing(pt); setForm({ name: pt.name, code: pt.code, description: pt.description, dueDays: pt.dueDays, discountPct: pt.discountPct, discountDays: pt.discountDays, isActive: pt.isActive }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (form.discountPct > 0 && form.discountDays <= 0) {
      toast({ title: "Erreur de validation", description: "Les jours d'escompte doivent être > 0 si un % est défini.", variant: "destructive" });
      return;
    }
    if (editing) {
      setData(prev => prev.map(pt => pt.id === editing.id ? { ...pt, ...form } : pt));
      toast({ title: "Condition modifiée", description: form.name });
    } else {
      const id = `PT-${String(data.length + 1).padStart(3, "0")}`;
      setData(prev => [...prev, { id, ...form }]);
      toast({ title: "Condition créée", description: form.name });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const usedBy = vendors.filter(v => v.paymentTerms === deleteConfirm.code);
    if (usedBy.length > 0) {
      toast({ title: "Suppression impossible", description: `${usedBy.length} fournisseur(s) utilisent cette condition.`, variant: "destructive" });
      setDeleteConfirm(null);
      return;
    }
    setData(prev => prev.filter(pt => pt.id !== deleteConfirm.id));
    toast({ title: "Condition supprimée" });
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Conditions de paiement</h1>
            <p className="text-sm text-muted-foreground">{data.length} conditions configurées</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle condition</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Jours</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Escompte</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Fournisseurs</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pt => {
              const vendorCount = vendorCountMap.get(pt.id) ?? 0;
              return (
                <tr key={pt.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{pt.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{pt.code}</td>
                  <td className="px-4 py-3 text-right font-mono">{pt.dueDays}j</td>
                  <td className="px-4 py-3 text-right">
                    {pt.discountPct > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-semibold">
                        <Percent className="h-3 w-3" /> {pt.discountPct}% / {pt.discountDays}j
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{pt.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-semibold ${vendorCount > 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
                      {vendorCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pt.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {pt.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(pt)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(pt)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">Aucune condition trouvée.</div>}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Modifier la condition" : "Nouvelle condition de paiement"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Nom" required>
              <input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ex: Net 30 jours" />
            </FormField>
            <FormField label="Code" required>
              <select className={formSelectClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value as PaymentTerm["code"] })}>
                <option value="Comptant">Comptant</option>
                <option value="Net_15">Net_15</option>
                <option value="Net_30">Net_30</option>
                <option value="Net_45">Net_45</option>
                <option value="Net_60">Net_60</option>
                <option value="30_jours_fin_mois">30_jours_fin_mois</option>
              </select>
            </FormField>
            <FormField label="Description">
              <input className={formInputClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description libre" />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Jours dus" required>
                <input type="number" className={formInputClass} value={form.dueDays} onChange={e => setForm({ ...form, dueDays: Number(e.target.value) })} min={0} />
              </FormField>
              <FormField label="Escompte %" hint="Remise anticipée">
                <input type="number" step="0.1" className={formInputClass} value={form.discountPct} onChange={e => setForm({ ...form, discountPct: Number(e.target.value) })} min={0} max={100} />
              </FormField>
              <FormField label="Jours escompte">
                <input type="number" className={formInputClass} value={form.discountDays} onChange={e => setForm({ ...form, discountDays: Number(e.target.value) })} min={0} />
              </FormField>
            </div>
            <FormField label="Statut">
              <select className={formSelectClass} value={form.isActive ? "true" : "false"} onChange={e => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Supprimer cette condition ?</DialogTitle></DialogHeader>
          {deleteConfirm && (() => {
            const usedBy = vendors.filter(v => v.paymentTerms === deleteConfirm.code);
            return usedBy.length > 0 ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm"><AlertTriangle className="h-4 w-4" /> Suppression impossible</div>
                <p className="text-sm text-muted-foreground">
                  <strong>{usedBy.length}</strong> fournisseur(s) utilisent cette condition : {usedBy.slice(0, 3).map(v => v.name).join(", ")}{usedBy.length > 3 ? "…" : ""}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Supprimer <strong>{deleteConfirm.name}</strong> ?</p>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
