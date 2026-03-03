import { useState, useMemo, useCallback } from "react";
import type { Product } from "@/data/mockData";
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
}

export function useProductCRUD({
  products, setProducts, stockTotals, purchaseOrders, salesOrders, onCostChanged, currentUserName = "system"
}: UseProductCRUDOptions) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Compute delete block reasons for a product */
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
    setForm({ name: p.name, sku: p.sku, category: p.category, uom: p.uom, baseUnitId: p.baseUnitId ?? "", unitCost: p.unitCost, unitPrice: p.unitPrice, reorderPoint: p.reorderPoint, isActive: p.isActive });
    setFormErrors({});
    setShowForm(true);
  }, []);

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
      setProducts(prev => prev.map(p => p.id === editing.id ? {
        ...p, name: form.name, sku: form.sku, category: form.category, uom: form.uom,
        baseUnitId: form.baseUnitId || undefined,
        unitCost: form.unitCost ?? p.unitCost, unitPrice: form.unitPrice ?? p.unitPrice,
        reorderPoint: form.reorderPoint ?? p.reorderPoint, isActive: form.isActive,
      } : p));
      if (oldCost !== newCost && onCostChanged) {
        onCostChanged(editing.id, oldCost, newCost, currentUserName);
      }
      toast({ title: "Produit modifié", description: form.name });
    } else {
      const id = `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const newProduct: Product = {
        id, name: form.name, sku: form.sku, category: form.category, uom: form.uom,
        baseUnitId: form.baseUnitId || undefined,
        isActive: form.isActive, unitCost: form.unitCost ?? 0, unitPrice: form.unitPrice ?? 0,
        reorderPoint: form.reorderPoint ?? 0,
      };
      setProducts(prev => [...prev, newProduct]);
      toast({ title: "Produit créé", description: form.name });
    }
    setIsSubmitting(false);
    setShowForm(false);
  }, [form, products, editing, setProducts, onCostChanged, currentUserName]);

  const handleDelete = useCallback(() => {
    if (!deleteConfirm) return;
    const reasons = getDeleteBlockReasons(deleteConfirm);
    if (reasons.length > 0) {
      toast({ title: "Suppression impossible", description: reasons.join(". "), variant: "destructive" });
      setDeleteConfirm(null);
      return;
    }
    setProducts(prev => prev.map(p => p.id === deleteConfirm.id ? { ...p, isActive: false, isDeleted: true } : p));
    toast({ title: "Produit archivé", description: `${deleteConfirm.name} a été désactivé et archivé (soft delete).` });
    setDeleteConfirm(null);
  }, [deleteConfirm, getDeleteBlockReasons, setProducts]);

  const handleToggleActive = useCallback((product: Product) => {
    const newStatus = !product.isActive;
    if (!newStatus) {
      const openSOs = salesOrders.filter(so =>
        !["Delivered", "Invoiced", "Cancelled"].includes(so.status) &&
        so.lines.some((l: any) => l.productId === product.id)
      );
      if (openSOs.length > 0) {
        toast({ title: "Désactivation impossible", description: `${openSOs.length} commande(s) de vente en cours pour ce produit.`, variant: "destructive" });
        return;
      }
    }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
    toast({ title: newStatus ? "Produit activé" : "Produit désactivé", description: product.name });
  }, [salesOrders, setProducts]);

  return {
    showForm, setShowForm,
    editing, form, setForm,
    formErrors, setFormErrors,
    deleteConfirm, setDeleteConfirm,
    isSubmitting, deleteReasons,
    openCreate, openEdit,
    handleSave, handleDelete, handleToggleActive,
  };
}
