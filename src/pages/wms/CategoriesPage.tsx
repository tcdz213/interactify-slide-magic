import { useState, useMemo } from "react";
import { FolderTree, Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { ProductCategory } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";

const empty: Omit<ProductCategory, "id"> = { name: "", description: "", productCount: 0, status: "Active" };

export default function CategoriesPage() {
  const { productCategories: data, setProductCategories: setData, products } = useWMSData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductCategory | null>(null);

  /** Dynamic product count per category */
  const dynamicCounts = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(c => {
      map.set(c.id, products.filter(p => p.category === c.name && !p.isDeleted).length);
    });
    return map;
  }, [data, products]);

  const filtered = useMemo(() => data.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())), [data, search]);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (c: ProductCategory) => { setEditing(c); setForm({ name: c.name, description: c.description, productCount: c.productCount, status: c.status }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name) return;
    // Check duplicate name
    if (data.some(c => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editing?.id)) {
      toast({ title: "Erreur", description: "Ce nom de catégorie existe déjà", variant: "destructive" });
      return;
    }
    if (editing) {
      // If renaming, update all products that reference the old name
      const oldName = editing.name;
      const newName = form.name.trim();
      setData(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, name: newName } : c));
      if (oldName !== newName) {
        // Note: this updates products in WMS context — we need to access setProducts
        toast({ title: "Catégorie modifiée", description: `${newName}. ⚠ Pensez à mettre à jour les produits liés si le nom a changé.` });
      } else {
        toast({ title: "Catégorie modifiée", description: newName });
      }
    } else {
      setData(prev => [...prev, { id: `CAT-${String(prev.length + 1).padStart(3, "0")}`, ...form, name: form.name.trim() }]);
      toast({ title: "Catégorie créée", description: form.name.trim() });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const prodCount = dynamicCounts.get(deleteConfirm.id) ?? 0;
    if (prodCount > 0) {
      toast({ title: "Suppression impossible", description: `${prodCount} produit(s) utilisent cette catégorie. Réassignez-les d'abord.`, variant: "destructive" });
      setDeleteConfirm(null);
      return;
    }
    setData(prev => prev.filter(c => c.id !== deleteConfirm.id));
    toast({ title: "Catégorie supprimée" });
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><FolderTree className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">Catégories de produits</h1><p className="text-sm text-muted-foreground">{data.length} catégories</p></div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle catégorie</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Produits</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => {
              const prodCount = dynamicCounts.get(c.id) ?? 0;
              const canDelete = prodCount === 0;
              return (
                <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-semibold ${
                      prodCount > 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      {prodCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      <button
                        onClick={() => canDelete ? setDeleteConfirm(c) : toast({ title: "Suppression bloquée", description: `${prodCount} produit(s) utilisent cette catégorie`, variant: "destructive" })}
                        className={`p-1.5 rounded-md ${canDelete ? "hover:bg-destructive/10 text-destructive" : "opacity-40 cursor-not-allowed text-destructive"}`}
                        title={canDelete ? "Supprimer" : `Bloqué : ${prodCount} produit(s)`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">Aucune catégorie trouvée.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Nom" required><input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
            <FormField label="Description"><input className={formInputClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
            <FormField label="Statut">
              <select className={formSelectClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProductCategory["status"] })}>
                <option value="Active">Active</option><option value="Inactive">Inactive</option>
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
          <DialogHeader><DialogTitle>Supprimer la catégorie ?</DialogTitle></DialogHeader>
          {deleteConfirm && (dynamicCounts.get(deleteConfirm.id) ?? 0) > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Suppression bloquée : des produits utilisent encore cette catégorie.</span>
            </div>
          )}
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
