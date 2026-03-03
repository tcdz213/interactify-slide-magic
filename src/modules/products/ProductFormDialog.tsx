import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/data/mockData";
import type { ProductFormValues } from "./product.schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useWMSData } from "@/contexts/WMSDataContext";
import { generateId } from "@/services/crudService";
import { toast } from "@/hooks/use-toast";
import type { ProductUnitConversion } from "@/lib/unitConversion";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Product | null;
  form: ProductFormValues;
  setForm: (form: ProductFormValues) => void;
  formErrors: Record<string, string>;
  setFormErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  showFinancials: boolean;
  productCategories: { id: string; name: string; status: string }[];
  unitsOfMeasure: { id: string; name: string; abbreviation: string }[];
  onSave: () => void;
}

interface InlineUnit {
  id: string;
  unitName: string;
  unitAbbreviation: string;
  conversionFactor: number;
  allowBuy: boolean;
  allowSell: boolean;
  isBase: boolean;
}

export function ProductFormDialog({
  open, onOpenChange, editing, form, setForm, formErrors, setFormErrors,
  isSubmitting, showFinancials, productCategories, unitsOfMeasure, onSave,
}: ProductFormDialogProps) {
  const { productUnitConversions, setProductUnitConversions, productBaseUnits, setProductBaseUnits, inventory } = useWMSData();

  // Sprint 6.3: Check if product has stock > 0 (block base unit change)
  const productStock = useMemo(() => {
    if (!editing) return 0;
    return inventory.filter(i => i.productId === editing.id).reduce((sum, i) => sum + i.qtyOnHand, 0);
  }, [editing, inventory]);
  const hasStock = productStock > 0;
  
  // Step management: 1 = basic info, 2 = unit conversions
  const [step, setStep] = useState(1);

  // Inline unit form
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitForm, setUnitForm] = useState({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true });

  // Get existing conversions for editing product
  const existingConversions = useMemo(() => {
    if (!editing) return [];
    return productUnitConversions
      .filter(c => c.productId === editing.id)
      .sort((a, b) => a.conversionFactor - b.conversionFactor);
  }, [editing, productUnitConversions]);

  const existingBaseUnit = useMemo(() => {
    if (!editing) return null;
    return productBaseUnits.find(b => b.productId === editing.id) ?? null;
  }, [editing, productBaseUnits]);

  // Selected base unit info
  const selectedBaseUom = useMemo(() => {
    if (!form.baseUnitId) return null;
    return unitsOfMeasure.find(u => u.id === form.baseUnitId) ?? null;
  }, [form.baseUnitId, unitsOfMeasure]);

  // Reset step when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setStep(1);
    onOpenChange(isOpen);
  };

  const handleAddUnit = () => {
    if (!unitForm.unitName.trim() || !unitForm.unitAbbreviation.trim() || unitForm.conversionFactor <= 0) {
      toast({ title: "Erreur", description: "Remplissez tous les champs de l'unité", variant: "destructive" });
      return;
    }
    if (!editing) {
      toast({ title: "Info", description: "Sauvegardez le produit d'abord, puis ajoutez les conversions via le bouton Unités" });
      return;
    }
    // Check duplicate
    if (existingConversions.some(c => c.unitAbbreviation.toLowerCase() === unitForm.unitAbbreviation.trim().toLowerCase())) {
      toast({ title: "Erreur", description: "Cette abréviation existe déjà", variant: "destructive" });
      return;
    }
    const newConv: ProductUnitConversion = {
      id: generateId("PUC"),
      productId: editing.id,
      unitName: unitForm.unitName.trim(),
      unitAbbreviation: unitForm.unitAbbreviation.trim(),
      conversionFactor: unitForm.conversionFactor,
      allowBuy: unitForm.allowBuy,
      allowSell: unitForm.allowSell,
      sortOrder: existingConversions.length + 1,
    };
    setProductUnitConversions(prev => [...prev, newConv]);
    
    // If factor=1 and no base unit yet, auto-set as base
    if (unitForm.conversionFactor === 1 && !existingBaseUnit) {
      const existing = productBaseUnits.find(b => b.productId === editing.id);
      if (!existing) {
        setProductBaseUnits(prev => [...prev, { productId: editing.id, baseUnitName: unitForm.unitName.trim(), baseUnitAbbreviation: unitForm.unitAbbreviation.trim() }]);
      }
    }
    
    setUnitForm({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true });
    setShowUnitForm(false);
    toast({ title: "Unité ajoutée", description: `${newConv.unitName} (×${newConv.conversionFactor})` });
  };

  const handleDeleteUnit = (convId: string) => {
    setProductUnitConversions(prev => prev.filter(c => c.id !== convId));
    toast({ title: "Unité supprimée" });
  };

  // Auto-add base unit conversion when selecting baseUnitId on create
  const handleBaseUnitChange = (unitId: string) => {
    const uom = unitsOfMeasure.find(u => u.id === unitId);
    if (uom) {
      setForm({ ...form, baseUnitId: unitId, uom: uom.name });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier le produit" : "Nouveau produit"}
            {editing && step === 2 && " — Conversions d'unités"}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator for editing */}
        {editing && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              1. Infos de base
            </button>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              2. Unités ({existingConversions.length})
            </button>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <FormField label="Nom" required error={formErrors.name}>
              <input className={formInputClass} value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: "" }); }} />
            </FormField>
            <FormField label="SKU" required error={formErrors.sku}>
              <input className={formInputClass} value={form.sku} onChange={e => { setForm({ ...form, sku: e.target.value }); setFormErrors({ ...formErrors, sku: "" }); }} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Catégorie" required error={formErrors.category}>
                <select className={formSelectClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">—</option>
                  {productCategories.filter(c => c.status === "Active").map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Unité de base" required error={formErrors.uom}>
                <select 
                  className={formSelectClass} 
                  value={form.baseUnitId ?? ""} 
                  onChange={e => handleBaseUnitChange(e.target.value)}
                  disabled={editing && hasStock}
                >
                  <option value="">—</option>
                  {unitsOfMeasure.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                  ))}
                </select>
                {editing && hasStock && (
                  <p className="text-[10px] text-destructive mt-1">
                    ⚠️ Impossible de changer l'unité de base — stock existant ({productStock} unités)
                  </p>
                )}
              </FormField>
            </div>
            {selectedBaseUom && (
              <div className="rounded-md p-2 text-xs bg-primary/5 border border-primary/20 text-foreground">
                📦 Unité de base : <strong>{selectedBaseUom.name} ({selectedBaseUom.abbreviation})</strong> — tout le stock, coût et prix seront exprimés dans cette unité.
              </div>
            )}
            {showFinancials && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label={`Coût unitaire (DZD${selectedBaseUom ? `/${selectedBaseUom.abbreviation}` : ""})`} error={formErrors.unitCost}>
                  <input type="number" className={formInputClass} value={form.unitCost ?? 0} onChange={e => setForm({ ...form, unitCost: Number(e.target.value) })} />
                </FormField>
                <FormField label={`Prix unitaire (DZD${selectedBaseUom ? `/${selectedBaseUom.abbreviation}` : ""})`} error={formErrors.unitPrice}>
                  <input type="number" className={formInputClass} value={form.unitPrice ?? 0} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} />
                </FormField>
              </div>
            )}
            <FormField label="Seuil de réappro." error={formErrors.reorderPoint}>
              <input type="number" className={formInputClass} value={form.reorderPoint ?? 0} onChange={e => setForm({ ...form, reorderPoint: Number(e.target.value) })} />
            </FormField>
            <FormField label="Statut">
              <select className={formSelectClass} value={form.isActive ? "active" : "inactive"} onChange={e => setForm({ ...form, isActive: e.target.value === "active" })}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </FormField>
          </div>
        )}

        {/* Step 2: Unit Conversions (only for editing) */}
        {step === 2 && editing && (
          <div className="space-y-4">
            {/* Base unit info */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">Unité de base</p>
              <p className="text-lg font-bold">
                {existingBaseUnit ? `${existingBaseUnit.baseUnitName} (${existingBaseUnit.baseUnitAbbreviation})` : selectedBaseUom ? `${selectedBaseUom.name} (${selectedBaseUom.abbreviation})` : <span className="text-destructive">Non définie</span>}
              </p>
            </div>

            {/* Conversion table */}
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Unité</TableHead>
                    <TableHead>Abrév.</TableHead>
                    <TableHead className="text-right">Facteur</TableHead>
                    <TableHead className="text-center">Achat</TableHead>
                    <TableHead className="text-center">Vente</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingConversions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        Aucune conversion. Ajoutez l'unité de base (facteur=1) puis les emballages.
                      </TableCell>
                    </TableRow>
                  ) : existingConversions.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.unitName}
                        {existingBaseUnit && c.unitAbbreviation === existingBaseUnit.baseUnitAbbreviation && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">BASE</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{c.unitAbbreviation}</TableCell>
                      <TableCell className="text-right font-mono">×{c.conversionFactor}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.allowBuy ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                          {c.allowBuy ? "Oui" : "Non"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.allowSell ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted text-muted-foreground"}`}>
                          {c.allowSell ? "Oui" : "Non"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <button onClick={() => handleDeleteUnit(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="Supprimer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add unit form */}
            {showUnitForm ? (
              <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Nom de l'unité" required>
                    <input className={formInputClass} value={unitForm.unitName} onChange={e => setUnitForm({ ...unitForm, unitName: e.target.value })} placeholder="ex: Carton" />
                  </FormField>
                  <FormField label="Abréviation" required>
                    <input className={formInputClass} value={unitForm.unitAbbreviation} onChange={e => setUnitForm({ ...unitForm, unitAbbreviation: e.target.value })} placeholder="ex: Ctn" maxLength={10} />
                  </FormField>
                </div>
                <FormField label={`Facteur (1 unité = X ${existingBaseUnit?.baseUnitAbbreviation ?? "base"})`} required>
                  <input type="number" step="0.001" min="0.001" className={formInputClass} value={unitForm.conversionFactor} onChange={e => setUnitForm({ ...unitForm, conversionFactor: +e.target.value })} />
                </FormField>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.allowBuy} onChange={e => setUnitForm({ ...unitForm, allowBuy: e.target.checked })} className="rounded" /> Achat</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unitForm.allowSell} onChange={e => setUnitForm({ ...unitForm, allowSell: e.target.checked })} className="rounded" /> Vente</label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowUnitForm(false)}>Annuler</Button>
                  <Button size="sm" onClick={handleAddUnit}>Ajouter</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowUnitForm(true)} className="gap-1">
                <Plus className="h-3 w-3" /> Ajouter une unité
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>Annuler</Button>
          {step === 1 && (
            <Button onClick={onSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enregistrement…
                </span>
              ) : (
                editing ? "Enregistrer" : "Créer"
              )}
            </Button>
          )}
          {step === 2 && (
            <Button onClick={() => handleOpenChange(false)}>Terminé</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
