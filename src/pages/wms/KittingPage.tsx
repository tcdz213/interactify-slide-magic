import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { kitRecipes, setKitRecipes, kitOrders, setKitOrders, products, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { canCreate } = useAuth();
  const [tab, setTab] = useState("recipes");
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<KitRecipe | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<KitOrder | null>(null);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [recipeForm, setRecipeForm] = useState({ name: "", sku: "", description: "", outputQty: 1, outputUom: "Kit", components: [] as KitComponent[] });
  const [compForm, setCompForm] = useState({ productId: "", qty: 1 });
  const [orderForm, setOrderForm] = useState({ recipeId: "", qty: 1, warehouseId: "", notes: "" });

  const filteredRecipes = useMemo(() => {
    if (!search) return kitRecipes;
    const s = search.toLowerCase();
    return kitRecipes.filter((r) => r.name.toLowerCase().includes(s) || r.sku.toLowerCase().includes(s));
  }, [kitRecipes, search]);

  const filteredOrders = useMemo(() => {
    let d = kitOrders.filter((o) => canOperateOn(o.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter((o) => o.id.toLowerCase().includes(s) || o.recipeName.toLowerCase().includes(s)); }
    return d;
  }, [kitOrders, canOperateOn, search]);

  const recipePagination = usePagination(filteredRecipes, 10);
  const orderPagination = usePagination(filteredOrders, 10);

  const handleAddComponent = () => {
    const prod = products.find((p) => p.id === compForm.productId);
    if (!prod || compForm.qty <= 0) return;
    setRecipeForm((prev) => ({ ...prev, components: [...prev.components, { productId: prod.id, productName: prod.name, qty: compForm.qty, uom: prod.uom }] }));
    setCompForm({ productId: "", qty: 1 });
  };

  const handleCreateRecipe = () => {
    if (!recipeForm.name || recipeForm.components.length === 0) {
      toast({ title: t("common.error"), description: t("kitting.errorRecipe"), variant: "destructive" }); return;
    }
    const newRecipe: KitRecipe = { id: `KR-${String(kitRecipes.length + 1).padStart(3, "0")}`, ...recipeForm, isActive: true };
    setKitRecipes((prev) => [newRecipe, ...prev]);
    setShowCreateRecipe(false);
    setRecipeForm({ name: "", sku: "", description: "", outputQty: 1, outputUom: "Kit", components: [] });
    toast({ title: t("kitting.recipeCreated"), description: newRecipe.name });
  };

  const handleDeleteRecipe = (id: string) => { setKitRecipes((prev) => prev.filter((r) => r.id !== id)); toast({ title: t("kitting.recipeDeleted") }); };

  const handleCreateOrder = () => {
    const recipe = kitRecipes.find((r) => r.id === orderForm.recipeId);
    const wh = warehouses.find((w) => w.id === orderForm.warehouseId);
    if (!recipe || !wh || orderForm.qty <= 0) { toast({ title: t("common.error"), description: t("kitting.errorOrder"), variant: "destructive" }); return; }
    const newOrder: KitOrder = { id: `KO-${String(kitOrders.length + 1).padStart(3, "0")}`, recipeId: recipe.id, recipeName: recipe.name, qty: orderForm.qty, warehouseId: wh.id, warehouseName: wh.name, status: "Draft", createdBy: "Utilisateur courant", createdAt: new Date().toISOString().slice(0, 10), notes: orderForm.notes };
    setKitOrders((prev) => [newOrder, ...prev]);
    setShowCreateOrder(false);
    setOrderForm({ recipeId: "", qty: 1, warehouseId: "", notes: "" });
    toast({ title: t("kitting.orderCreated"), description: newOrder.id });
  };

  const handleOrderAction = (id: string, action: "start" | "complete" | "cancel") => {
    setKitOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      if (action === "start") return { ...o, status: "In_Progress" as KitStatus };
      if (action === "complete") return { ...o, status: "Completed" as KitStatus, completedAt: new Date().toISOString().slice(0, 10) };
      return { ...o, status: "Cancelled" as KitStatus };
    }));
    toast({ title: action === "complete" ? t("kitting.kittingCompleted") : action === "start" ? t("kitting.kittingStarted") : t("kitting.kittingCancelled") });
  };

  return (
    <div className="space-y-6">
      <WarehouseScopeBanner />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("kitting.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("kitting.subtitle")}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="recipes">{t("kitting.recipesTab", { count: kitRecipes.length })}</TabsTrigger>
          <TabsTrigger value="orders">{t("kitting.ordersTab", { count: filteredOrders.length })}</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Input placeholder={t("kitting.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {tab === "recipes" && <Button onClick={() => setShowCreateRecipe(true)}><Plus className="h-4 w-4 mr-2" />{t("kitting.newRecipe")}</Button>}
          {tab === "orders" && canCreate("grn") && <Button onClick={() => setShowCreateOrder(true)}><Plus className="h-4 w-4 mr-2" />{t("kitting.newOrder")}</Button>}
        </div>

        <TabsContent value="recipes" className="space-y-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t("kitting.id")}</TableHead><TableHead>{t("kitting.name")}</TableHead><TableHead>{t("kitting.sku")}</TableHead>
                <TableHead>{t("kitting.components")}</TableHead><TableHead>{t("kitting.output")}</TableHead><TableHead>{t("kitting.active")}</TableHead><TableHead>{t("kitting.actions")}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {recipePagination.paginatedItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-xs">{r.sku}</TableCell>
                    <TableCell>{r.components.length} {t("kitting.products")}</TableCell>
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
                {recipePagination.paginatedItems.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("kitting.noRecipe")}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination {...recipePagination} totalItems={filteredRecipes.length} onPageChange={recipePagination.setCurrentPage} onPageSizeChange={recipePagination.setPageSize} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t("kitting.id")}</TableHead><TableHead>{t("kitting.recipe")}</TableHead><TableHead>{t("kitting.qty")}</TableHead>
                <TableHead>{t("kitting.warehouse")}</TableHead><TableHead>{t("kitting.status")}</TableHead><TableHead>{t("kitting.createdAt")}</TableHead><TableHead>{t("kitting.actions")}</TableHead>
              </TableRow></TableHeader>
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
                        {o.status === "Draft" && canOperateOn(o.warehouseId) && <Button size="sm" variant="outline" onClick={() => handleOrderAction(o.id, "start")}>{t("kitting.start")}</Button>}
                        {o.status === "In_Progress" && canOperateOn(o.warehouseId) && <Button size="sm" variant="outline" onClick={() => handleOrderAction(o.id, "complete")}><CheckCircle className="h-3.5 w-3.5" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {orderPagination.paginatedItems.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("kitting.noOrder")}</TableCell></TableRow>}
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
              <p><strong>{t("kitting.skuLabel")}</strong> {selectedRecipe.sku}</p>
              <p><strong>{t("kitting.descLabel")}</strong> {selectedRecipe.description}</p>
              <p><strong>{t("kitting.outputLabel")}</strong> {selectedRecipe.outputQty} {selectedRecipe.outputUom}</p>
              <div>
                <strong>{t("kitting.componentsLabel")}</strong>
                <ul className="mt-1 space-y-1">
                  {selectedRecipe.components.map((c, i) => (
                    <li key={i} className="flex justify-between bg-muted/50 rounded px-3 py-1.5"><span>{c.productName}</span><span className="text-muted-foreground">{c.qty} {c.uom}</span></li>
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
          <DialogHeader><DialogTitle>{t("kitting.orderDetail", { id: selectedOrder?.id })}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 text-sm">
              <p><strong>{t("kitting.recipeLabel")}</strong> {selectedOrder.recipeName}</p>
              <p><strong>{t("kitting.qtyLabel")}</strong> {selectedOrder.qty}</p>
              <p><strong>{t("kitting.warehouseLabel")}</strong> {selectedOrder.warehouseName}</p>
              <p><strong>{t("kitting.statusLabel")}</strong> <StatusBadge status={selectedOrder.status} /></p>
              <p><strong>{t("kitting.createdByLabel")}</strong> {selectedOrder.createdBy} le {selectedOrder.createdAt}</p>
              {selectedOrder.completedAt && <p><strong>{t("kitting.completedLabel")}</strong> {selectedOrder.completedAt}</p>}
              {selectedOrder.notes && <p><strong>{t("kitting.notesLabel")}</strong> {selectedOrder.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Recipe Dialog */}
      <Dialog open={showCreateRecipe} onOpenChange={setShowCreateRecipe}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("kitting.createRecipeTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormSection title={t("kitting.info")}>
              <FormField label={t("kitting.name")}><Input className={formInputClass} value={recipeForm.name} onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })} /></FormField>
              <FormField label={t("kitting.sku")}><Input className={formInputClass} value={recipeForm.sku} onChange={(e) => setRecipeForm({ ...recipeForm, sku: e.target.value })} /></FormField>
              <FormField label={t("kitting.description")}><Input className={formInputClass} value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} /></FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("kitting.outputQty")}><Input type="number" className={formInputClass} value={recipeForm.outputQty} onChange={(e) => setRecipeForm({ ...recipeForm, outputQty: Number(e.target.value) })} /></FormField>
                <FormField label={t("kitting.outputUom")}><Input className={formInputClass} value={recipeForm.outputUom} onChange={(e) => setRecipeForm({ ...recipeForm, outputUom: e.target.value })} /></FormField>
              </div>
            </FormSection>
            <FormSection title={t("kitting.componentsSection")}>
              {recipeForm.components.map((c, i) => (<div key={i} className="flex justify-between bg-muted/50 rounded px-3 py-1.5 text-sm"><span>{c.productName}</span><span>{c.qty} {c.uom}</span></div>))}
              <div className="flex gap-2">
                <select className={formSelectClass + " flex-1"} value={compForm.productId} onChange={(e) => setCompForm({ ...compForm, productId: e.target.value })}>
                  <option value="">{t("kitting.productPlaceholder")}</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input type="number" className="w-20" value={compForm.qty} onChange={(e) => setCompForm({ ...compForm, qty: Number(e.target.value) })} />
                <Button variant="outline" size="sm" onClick={handleAddComponent}>+</Button>
              </div>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRecipe(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateRecipe}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("kitting.createOrderTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={t("kitting.recipe")}>
              <select className={formSelectClass} value={orderForm.recipeId} onChange={(e) => setOrderForm({ ...orderForm, recipeId: e.target.value })}>
                <option value="">{t("kitting.selectPlaceholder")}</option>
                {kitRecipes.filter((r) => r.isActive).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </FormField>
            <FormField label={t("kitting.qty")}><Input type="number" className={formInputClass} value={orderForm.qty} onChange={(e) => setOrderForm({ ...orderForm, qty: Number(e.target.value) })} /></FormField>
            <FormField label={t("kitting.warehouse")}>
              <select className={formSelectClass} value={orderForm.warehouseId} onChange={(e) => setOrderForm({ ...orderForm, warehouseId: e.target.value })}>
                <option value="">{t("kitting.selectPlaceholder")}</option>
                {operationalWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </FormField>
            <FormField label={t("common.notes")}><Input className={formInputClass} value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} /></FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrder(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateOrder}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
