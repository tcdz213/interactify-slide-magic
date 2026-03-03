import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Plus, Eye, Trash2, CheckCircle, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { KitRecipe, KitOrder, KitComponent, KitStatus } from "@/data/mockData";

export default function KittingPage() {
  const { kitRecipes, setKitRecipes, kitOrders, setKitOrders, products, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [tab, setTab] = useState("recipes");
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<KitRecipe | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<KitOrder | null>(null);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  // Recipe form
  const [recipeForm, setRecipeForm] = useState({ name: "", sku: "", description: "", outputQty: 1, outputUom: "Kit", components: [] as KitComponent[] });
  const [compForm, setCompForm] = useState({ productId: "", qty: 1 });

  // Order form
  const [orderForm, setOrderForm] = useState({ recipeId: "", qty: 1, warehouseId: "", notes: "" });

  // Filtered data
  const filteredRecipes = useMemo(() => {
    if (!search) return kitRecipes;
    const s = search.toLowerCase();
    return kitRecipes.filter((r) => r.name.toLowerCase().includes(s) || r.sku.toLowerCase().includes(s));
  }, [kitRecipes, search]);

  const filteredOrders = useMemo(() => {
    let d = kitOrders.filter((o) => canOperateOn(o.warehouseId));
    if (search) {
      const s = search.toLowerCase();
      d = d.filter((o) => o.id.toLowerCase().includes(s) || o.recipeName.toLowerCase().includes(s));
    }
    return d;
  }, [kitOrders, canOperateOn, search]);

  const recipePagination = usePagination(filteredRecipes, 10);
  const orderPagination = usePagination(filteredOrders, 10);

  // Recipe CRUD
  const handleAddComponent = () => {
    const prod = products.find((p) => p.id === compForm.productId);
    if (!prod || compForm.qty <= 0) return;
    setRecipeForm((prev) => ({
      ...prev,
      components: [...prev.components, { productId: prod.id, productName: prod.name, qty: compForm.qty, uom: prod.uom }],
    }));
    setCompForm({ productId: "", qty: 1 });
  };

  const handleCreateRecipe = () => {
    if (!recipeForm.name || recipeForm.components.length === 0) {
      toast({ title: "Erreur", description: "Nom et composants requis", variant: "destructive" });
      return;
    }
    const newRecipe: KitRecipe = {
      id: `KR-${String(kitRecipes.length + 1).padStart(3, "0")}`,
      ...recipeForm,
      isActive: true,
    };
    setKitRecipes((prev) => [newRecipe, ...prev]);
    setShowCreateRecipe(false);
    setRecipeForm({ name: "", sku: "", description: "", outputQty: 1, outputUom: "Kit", components: [] });
    toast({ title: "Recette créée", description: newRecipe.name });
  };

  const handleDeleteRecipe = (id: string) => {
    setKitRecipes((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Recette supprimée" });
  };

  // Order CRUD
  const handleCreateOrder = () => {
    const recipe = kitRecipes.find((r) => r.id === orderForm.recipeId);
    const wh = warehouses.find((w) => w.id === orderForm.warehouseId);
    if (!recipe || !wh || orderForm.qty <= 0) {
      toast({ title: "Erreur", description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    const newOrder: KitOrder = {
      id: `KO-${String(kitOrders.length + 1).padStart(3, "0")}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      qty: orderForm.qty,
      warehouseId: wh.id,
      warehouseName: wh.name,
      status: "Draft",
      createdBy: "Utilisateur courant",
      createdAt: new Date().toISOString().slice(0, 10),
      notes: orderForm.notes,
    };
    setKitOrders((prev) => [newOrder, ...prev]);
    setShowCreateOrder(false);
    setOrderForm({ recipeId: "", qty: 1, warehouseId: "", notes: "" });
    toast({ title: "Ordre de kitting créé", description: newOrder.id });
  };

  const handleOrderAction = (id: string, action: "start" | "complete" | "cancel") => {
    setKitOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (action === "start") return { ...o, status: "In_Progress" as KitStatus };
        if (action === "complete") return { ...o, status: "Completed" as KitStatus, completedAt: new Date().toISOString().slice(0, 10) };
        return { ...o, status: "Cancelled" as KitStatus };
      })
    );
    toast({ title: action === "complete" ? "Kitting terminé" : action === "start" ? "Kitting démarré" : "Kitting annulé" });
  };

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kitting / Assemblage</h1>
          <p className="text-sm text-muted-foreground">Recettes BOM et ordres d'assemblage</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="recipes">Recettes ({kitRecipes.length})</TabsTrigger>
          <TabsTrigger value="orders">Ordres ({filteredOrders.length})</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {tab === "recipes" && (
            <Button onClick={() => setShowCreateRecipe(true)}><Plus className="h-4 w-4 mr-2" />Nouvelle recette</Button>
          )}
          {tab === "orders" && canCreate("grn") && (
            <Button onClick={() => setShowCreateOrder(true)}><Plus className="h-4 w-4 mr-2" />Nouvel ordre</Button>
          )}
        </div>

        <TabsContent value="recipes" className="space-y-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Composants</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipePagination.paginatedItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-xs">{r.sku}</TableCell>
                    <TableCell>{r.components.length} produits</TableCell>
                    <TableCell>{r.outputQty} {r.outputUom}</TableCell>
                    <TableCell><StatusBadge status={r.isActive ? "Active" : "Inactive"} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedRecipe(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteRecipe(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {recipePagination.paginatedItems.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune recette</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...recipePagination} totalItems={filteredRecipes.length} onPageChange={recipePagination.setCurrentPage} onPageSizeChange={recipePagination.setPageSize} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Recette</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderPagination.paginatedItems.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>{o.recipeName}</TableCell>
                    <TableCell>{o.qty}</TableCell>
                    <TableCell className="text-xs">{o.warehouseName}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-xs">{o.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(o)}><Eye className="h-3.5 w-3.5" /></Button>
                        {o.status === "Draft" && canOperateOn(o.warehouseId) && (
                          <Button size="sm" variant="outline" onClick={() => handleOrderAction(o.id, "start")}>Démarrer</Button>
                        )}
                        {o.status === "In_Progress" && canOperateOn(o.warehouseId) && (
                          <Button size="sm" variant="outline" onClick={() => handleOrderAction(o.id, "complete")}><CheckCircle className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {orderPagination.paginatedItems.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun ordre</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...orderPagination} totalItems={filteredOrders.length} onPageChange={orderPagination.setCurrentPage} onPageSizeChange={orderPagination.setPageSize} />
        </TabsContent>
      </Tabs>

      {/* Recipe Detail */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedRecipe?.name}</DialogTitle></DialogHeader>
          {selectedRecipe && (
            <div className="space-y-3 text-sm">
              <p><strong>SKU :</strong> {selectedRecipe.sku}</p>
              <p><strong>Description :</strong> {selectedRecipe.description}</p>
              <p><strong>Output :</strong> {selectedRecipe.outputQty} {selectedRecipe.outputUom}</p>
              <div>
                <strong>Composants :</strong>
                <ul className="mt-1 space-y-1">
                  {selectedRecipe.components.map((c, i) => (
                    <li key={i} className="flex justify-between bg-muted/50 rounded px-3 py-1.5">
                      <span>{c.productName}</span>
                      <span className="text-muted-foreground">{c.qty} {c.uom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ordre {selectedOrder?.id}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 text-sm">
              <p><strong>Recette :</strong> {selectedOrder.recipeName}</p>
              <p><strong>Quantité :</strong> {selectedOrder.qty}</p>
              <p><strong>Entrepôt :</strong> {selectedOrder.warehouseName}</p>
              <p><strong>Statut :</strong> <StatusBadge status={selectedOrder.status} /></p>
              <p><strong>Créé par :</strong> {selectedOrder.createdBy} le {selectedOrder.createdAt}</p>
              {selectedOrder.completedAt && <p><strong>Terminé :</strong> {selectedOrder.completedAt}</p>}
              {selectedOrder.notes && <p><strong>Notes :</strong> {selectedOrder.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Recipe Dialog */}
      <Dialog open={showCreateRecipe} onOpenChange={setShowCreateRecipe}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle recette</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormSection title="Informations">
              <FormField label="Nom">
                <Input className={formInputClass} value={recipeForm.name} onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })} />
              </FormField>
              <FormField label="SKU">
                <Input className={formInputClass} value={recipeForm.sku} onChange={(e) => setRecipeForm({ ...recipeForm, sku: e.target.value })} />
              </FormField>
              <FormField label="Description">
                <Input className={formInputClass} value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Qté output">
                  <Input type="number" className={formInputClass} value={recipeForm.outputQty} onChange={(e) => setRecipeForm({ ...recipeForm, outputQty: Number(e.target.value) })} />
                </FormField>
                <FormField label="UOM output">
                  <Input className={formInputClass} value={recipeForm.outputUom} onChange={(e) => setRecipeForm({ ...recipeForm, outputUom: e.target.value })} />
                </FormField>
              </div>
            </FormSection>
            <FormSection title="Composants">
              {recipeForm.components.map((c, i) => (
                <div key={i} className="flex justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                  <span>{c.productName}</span>
                  <span>{c.qty} {c.uom}</span>
                </div>
              ))}
              <div className="flex gap-2">
                <select className={formSelectClass + " flex-1"} value={compForm.productId} onChange={(e) => setCompForm({ ...compForm, productId: e.target.value })}>
                  <option value="">Produit…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input type="number" className="w-20" value={compForm.qty} onChange={(e) => setCompForm({ ...compForm, qty: Number(e.target.value) })} />
                <Button variant="outline" size="sm" onClick={handleAddComponent}>+</Button>
              </div>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRecipe(false)}>Annuler</Button>
            <Button onClick={handleCreateRecipe}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouvel ordre de kitting</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Recette">
              <select className={formSelectClass} value={orderForm.recipeId} onChange={(e) => setOrderForm({ ...orderForm, recipeId: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {kitRecipes.filter((r) => r.isActive).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </FormField>
            <FormField label="Quantité">
              <Input type="number" className={formInputClass} value={orderForm.qty} onChange={(e) => setOrderForm({ ...orderForm, qty: Number(e.target.value) })} />
            </FormField>
            <FormField label="Entrepôt">
              <select className={formSelectClass} value={orderForm.warehouseId} onChange={(e) => setOrderForm({ ...orderForm, warehouseId: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {operationalWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </FormField>
            <FormField label="Notes">
              <Input className={formInputClass} value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrder(false)}>Annuler</Button>
            <Button onClick={handleCreateOrder}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}