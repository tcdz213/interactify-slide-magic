/**
 * Supplier Products — CRUD table filtered by supplier_id.
 */
import { useState, useMemo } from "react";
import { Package, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supplierProducts } from "@/supplier/data/mockSupplierData";
import type { SupplierProduct } from "@/supplier/types/supplier";
import { PageShell } from "@/shared/components";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const CATEGORIES = [...new Set(supplierProducts.map((p) => p.category))];

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<SupplierProduct[]>(supplierProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const activeCount = products.filter((p) => p.available).length;

  const toggleAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available, lastUpdated: new Date().toISOString().slice(0, 10) } : p))
    );
    toast({ title: "Statut mis à jour" });
  };

  const openAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (p: SupplierProduct) => {
    setEditingProduct(p);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      unitPrice: Number(fd.get("unitPrice")),
      unit: fd.get("unit") as string,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data, lastUpdated: new Date().toISOString().slice(0, 10) } : p))
      );
      toast({ title: "Produit modifié" });
    } else {
      const newP: SupplierProduct = {
        id: `P${String(products.length + 1).padStart(3, "0")}`,
        ...data,
        available: true,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };
      setProducts((prev) => [newP, ...prev]);
      toast({ title: "Produit ajouté" });
    }
    setDialogOpen(false);
  };

  return (
    <PageShell title="Mes Produits" description={`${activeCount} produits actifs sur ${products.length}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Ajouter un produit
        </Button>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground text-xs">
                  <th className="text-left p-3 font-medium">Produit</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Catégorie</th>
                  <th className="text-right p-3 font-medium">Prix unitaire</th>
                  <th className="text-left p-3 font-medium">Unité</th>
                  <th className="text-center p-3 font-medium">Statut</th>
                  <th className="text-left p-3 font-medium">Modifié</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                    </td>
                    <td className="p-3 text-right font-medium">{currency(p.unitPrice)}</td>
                    <td className="p-3 text-muted-foreground">{p.unit}</td>
                    <td className="p-3 text-center">
                      <Switch checked={p.available} onCheckedChange={() => toggleAvailability(p.id)} />
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{p.lastUpdated}</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="text-xs">
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Aucun produit trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" name="name" defaultValue={editingProduct?.name ?? ""} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input id="category" name="category" defaultValue={editingProduct?.category ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Input id="unit" name="unit" defaultValue={editingProduct?.unit ?? ""} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Prix unitaire (DZD)</Label>
              <Input id="unitPrice" name="unitPrice" type="number" defaultValue={editingProduct?.unitPrice ?? ""} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingProduct ? "Enregistrer" : "Ajouter"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
