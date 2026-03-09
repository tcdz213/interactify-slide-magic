import { useState, useMemo, useCallback } from "react";
import type { Product } from "@/data/mockData";
import type { ProductHistory } from "@/types/productHistory";
import { toast } from "@/hooks/use-toast";
import { productSchema, type ProductFormValues } from "./product.schema";

const emptyForm: ProductFormValues = { name: "", sku: "", category: "", uom: "", baseUnitId: "", unitCost: 0, unitPrice: 0, reorderPoint: 0, isActive: true };

interface UseProductCRUDOptions {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stockTotals: Map<string, number>;
  purchaseOrders: any[];
  salesOrders: any[];
  onCostChanged?: (productId: string, oldCost: number, newCost: number, userName: string) => void;
  currentUserName?: string;
  productHistory: ProductHistory[];
  setProductHistory: React.Dispatch<React.SetStateAction<ProductHistory[]>>;
}

export function useProductCRUD({
  products, setProducts, stockTotals, purchaseOrders, salesOrders, onCostChanged, currentUserName = "system",
  productHistory, setProductHistory,
}: UseProductCRUDOptions) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sprint 4: Audit trail helper
  const addHistory = useCallback((entry: Omit<ProductHistory, "id" | "changedAt">) => {
    const record: ProductHistory = {
      ...entry,
      id: `PH-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      changedAt: new Date().toISOString(),
    };
    setProductHistory(prev => [record, ...prev]);
  }, [setProductHistory]);

  const getDeleteBlockReasons = useCallback((product: Product): string[] => {
    const reasons: string[] = [];
    const stock = stockTotals.get(product.id) ?? 0;
    if (stock > 0) reasons.push(`Stock existant: ${stock} unités`);
    const openPOs = purchaseOrders.filter(po =>
      !["Received", "Cancelled"].includes(po.status) &&
      po.lines.some((l: any) => l.productId === product.id)
    );
    if (openPOs.length > 0) reasons.push(`${openPOs.length} commande(s) d'achat en cours`);
    const openSOs = salesOrders.filter(so =>
      !["Delivered", "Invoiced", "Cancelled"].includes(so.status) &&
      so.lines.some((l: any) => l.productId === product.id)
    );
    if (openSOs.length > 0) reasons.push(`${openSOs.length} commande(s) de vente en cours`);
    return reasons;
  }, [stockTotals, purchaseOrders, salesOrders]);

  const deleteReasons = useMemo(
    () => deleteConfirm ? getDeleteBlockReasons(deleteConfirm) : [],
    [deleteConfirm, getDeleteBlockReasons]
  );

  const openCreate = useCallback(() => {
    setEditing(null); setForm(emptyForm); setFormErrors({}); setShowForm(true);
  }, []);

  const openEdit = useCallback((p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, subcategoryId: p.subcategoryId, uom: p.uom, baseUnitId: p.baseUnitId ?? "", unitCost: p.unitCost, unitPrice: p.unitPrice, reorderPoint: p.reorderPoint, isActive: p.isActive, defaultVendorId: p.defaultVendorId });
    setFormErrors({});
    setShowForm(true);
  }, []);

  // Sprint 5: Clone product
  const handleClone = useCallback((product: Product) => {
    const id = `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const cloned: Product = {
      ...product,
      id,
      name: `${product.name} (copie)`,
      sku: `${product.sku}-COPY-${id.slice(2, 6)}`,
      isDeleted: undefined,
    };
    setProducts(prev => [...prev, cloned]);
    addHistory({ productId: id, action: "cloned", changedBy: currentUserName, reason: `Cloné depuis ${product.sku}` });
    toast({ title: "Produit cloné", description: `${cloned.name} créé à partir de ${product.name}` });
  }, [setProducts, addHistory, currentUserName]);

  const handleSave = useCallback(async () => {
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(i => { errors[i.path[0] as string] = i.message; });
      setFormErrors(errors);
      return;
    }

    const skuExists = products.some(p => p.sku === form.sku && p.id !== editing?.id);
    if (skuExists) {
      setFormErrors({ sku: "Ce SKU existe déjà" });
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 400));

    if (editing) {
      const oldCost = editing.unitCost;
      const newCost = form.unitCost ?? editing.unitCost;
      
      // Sprint 4: Detect changed fields for audit
      const changedFields: Record<string, { oldValue: any; newValue: any }> = {};
      if (editing.name !== form.name) changedFields.name = { oldValue: editing.name, newValue: form.name };
      if (editing.sku !== form.sku) changedFields.sku = { oldValue: editing.sku, newValue: form.sku };
      if (editing.category !== form.category) changedFields.category = { oldValue: editing.category, newValue: form.category };
      if (editing.unitCost !== (form.unitCost ?? 0)) changedFields.unitCost = { oldValue: editing.unitCost, newValue: form.unitCost };
      if (editing.unitPrice !== (form.unitPrice ?? 0)) changedFields.unitPrice = { oldValue: editing.unitPrice, newValue: form.unitPrice };
      if (editing.isActive !== form.isActive) changedFields.isActive = { oldValue: editing.isActive, newValue: form.isActive };

      setProducts(prev => prev.map(p => p.id === editing.id ? {
        ...p, name: form.name, sku: form.sku, category: form.category, uom: form.uom,
        subcategoryId: form.subcategoryId || undefined,
        baseUnitId: form.baseUnitId || undefined,
        defaultVendorId: form.defaultVendorId || undefined,
        unitCost: form.unitCost ?? p.unitCost, unitPrice: form.unitPrice ?? p.unitPrice,
        reorderPoint: form.reorderPoint ?? p.reorderPoint, isActive: form.isActive,
      } : p));
      
      if (Object.keys(changedFields).length > 0) {
        addHistory({ productId: editing.id, action: "modified", changedBy: currentUserName, changedFields });
      }
      
      if (oldCost !== newCost && onCostChanged) {
        onCostChanged(editing.id, oldCost, newCost, currentUserName);
      }
      toast({ title: "Produit modifié", description: form.name });
    } else {
      const id = `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const newProduct: Product = {
        id, name: form.name, sku: form.sku, category: form.category, uom: form.uom,
        subcategoryId: form.subcategoryId || undefined,
        baseUnitId: form.baseUnitId || undefined,
        defaultVendorId: form.defaultVendorId || undefined,
        isActive: form.isActive, unitCost: form.unitCost ?? 0, unitPrice: form.unitPrice ?? 0,
        reorderPoint: form.reorderPoint ?? 0,
      };
      setProducts(prev => [...prev, newProduct]);
      addHistory({ productId: id, action: "created", changedBy: currentUserName });
      toast({ title: "Produit créé", description: form.name });
    }
    setIsSubmitting(false);
    setShowForm(false);
  }, [form, products, editing, setProducts, onCostChanged, currentUserName, addHistory]);

  const handleDelete = useCallback(() => {
    if (!deleteConfirm) return;
    const reasons = getDeleteBlockReasons(deleteConfirm);
    if (reasons.length > 0) {
      toast({ title: "Suppression impossible", description: reasons.join(". "), variant: "destructive" });
      setDeleteConfirm(null);
      return;
    }
    setProducts(prev => prev.map(p => p.id === deleteConfirm.id ? { ...p, isActive: false, isDeleted: true } : p));
    addHistory({ productId: deleteConfirm.id, action: "deleted", changedBy: currentUserName });
    toast({ title: "Produit archivé", description: `${deleteConfirm.name} a été désactivé et archivé.` });
    setDeleteConfirm(null);
  }, [deleteConfirm, getDeleteBlockReasons, setProducts, addHistory, currentUserName]);

  const handleToggleActive = useCallback((product: Product) => {
    const newStatus = !product.isActive;
    if (!newStatus) {
      const openSOs = salesOrders.filter(so =>
        !["Delivered", "Invoiced", "Cancelled"].includes(so.status) &&
        so.lines.some((l: any) => l.productId === product.id)
      );
      if (openSOs.length > 0) {
        toast({ title: "Désactivation impossible", description: `${openSOs.length} commande(s) de vente en cours.`, variant: "destructive" });
        return;
      }
    }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
    addHistory({ productId: product.id, action: "modified", changedBy: currentUserName, changedFields: { isActive: { oldValue: !newStatus, newValue: newStatus } } });
    toast({ title: newStatus ? "Produit activé" : "Produit désactivé", description: product.name });
  }, [salesOrders, setProducts, addHistory, currentUserName]);

  return {
    showForm, setShowForm,
    editing, form, setForm,
    formErrors, setFormErrors,
    deleteConfirm, setDeleteConfirm,
    isSubmitting, deleteReasons,
    openCreate, openEdit,
    handleSave, handleDelete, handleToggleActive,
    handleClone,
  };
}
