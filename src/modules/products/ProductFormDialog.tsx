import { useState, useMemo } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Copy, AlertTriangle, Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product, ProductCategory, Sector, SubCategory, Vendor } from "@/data/mockData";
import type { ProductFormValues } from "./product.schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { generateId } from "@/services/crudService";
import { toast } from "@/hooks/use-toast";
import type { ProductUnitConversion } from "@/lib/unitConversion";
import { cn } from "@/lib/utils";

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
  const { t } = useTranslation();
  const { productUnitConversions, setProductUnitConversions, productBaseUnits, setProductBaseUnits, inventory, purchaseOrders, salesOrders, setProductCategories, setUnitsOfMeasure, sectors, subCategories, vendors } = useWMSData();
  const { operationalWarehouses, operationalWarehouseIds } = useWarehouseScope();

  // Map warehouse types to sector IDs for scope restriction
  const WAREHOUSE_TYPE_TO_SECTOR: Record<string, string> = {
    construction: "SEC-01",
    food: "SEC-02",
    technology: "SEC-03",
  };

  // Sectors the user can operate on (based on their warehouse scope)
  const allowedSectorIds = useMemo<string[] | null>(() => {
    // null = unrestricted (CEO, OpsDirector, etc.)
    if (operationalWarehouseIds === null) return null;
    if (operationalWarehouses.length === 0) return [];
    const sectorIds = new Set<string>();
    for (const wh of operationalWarehouses) {
      const sectorId = WAREHOUSE_TYPE_TO_SECTOR[wh.type];
      if (sectorId) sectorIds.add(sectorId);
    }
    return Array.from(sectorIds);
  }, [operationalWarehouses, operationalWarehouseIds]);

  // Filter sectors to user's operational scope
  const scopedSectors = useMemo(() => {
    const activeSectors = sectors.filter(s => s.status === "Active");
    if (allowedSectorIds === null) return activeSectors; // unrestricted
    return activeSectors.filter(s => allowedSectorIds.includes(s.id));
  }, [sectors, allowedSectorIds]);

  const isSectorRestricted = allowedSectorIds !== null;

  // Sector filter state — default to user's sector if restricted to one
  const [selectedSectorId, setSelectedSectorId] = useState<string>(() => {
    if (editing) {
      const cat = productCategories.find(c => c.name === editing.category) as ProductCategory | undefined;
      return cat?.sectorId ?? "all";
    }
    // If user is restricted to a single sector, auto-select it
    if (allowedSectorIds && allowedSectorIds.length === 1) return allowedSectorIds[0];
    return "all";
  });

  // Filtered categories by sector
  const filteredCategories = useMemo(() => {
    const cats = productCategories.filter(c => c.status === "Active" && !(c as any).isDeleted) as ProductCategory[];
    if (selectedSectorId === "all") {
      // If sector restricted, only show categories from allowed sectors
      if (allowedSectorIds !== null) {
        return cats.filter(c => allowedSectorIds.includes(c.sectorId));
      }
      return cats;
    }
    return cats.filter(c => c.sectorId === selectedSectorId);
  }, [productCategories, selectedSectorId, allowedSectorIds]);

  // Filtered subcategories by selected category
  const filteredSubcategories = useMemo(() => {
    const selectedCat = productCategories.find(c => c.name === form.category) as ProductCategory | undefined;
    if (!selectedCat) return [];
    return subCategories.filter(sc => sc.categoryId === selectedCat.id && sc.status === "Active" && !sc.isDeleted);
  }, [form.category, productCategories, subCategories]);

  // Sprint 6.3: Check if product has stock > 0
  const productStock = useMemo(() => {
    if (!editing) return 0;
    return inventory.filter(i => i.productId === editing.id).reduce((sum, i) => sum + i.qtyOnHand, 0);
  }, [editing, inventory]);
  const hasStock = productStock > 0;

  // Sprint 2: Unified form — collapsible conversions section
  const [showConversions, setShowConversions] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitForm, setUnitForm] = useState({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true, selectedUomId: "" });
  const [unitComboOpen, setUnitComboOpen] = useState(false);
  const [useCustomUnit, setUseCustomUnit] = useState(false);

  // Sprint 3: Inline creation states
  const [showInlineCategory, setShowInlineCategory] = useState(false);
  const [inlineCatForm, setInlineCatForm] = useState({ name: "", description: "", status: "Active" as const });
  const [showInlineUom, setShowInlineUom] = useState(false);
  const [inlineUomForm, setInlineUomForm] = useState({ name: "", abbreviation: "", type: "Count" as const });

  // Existing conversions for editing
  const existingConversions = useMemo(() => {
    if (!editing) return [];
    return productUnitConversions
      .filter(c => c.productId === editing.id)
      .sort((a, b) => a.conversionFactor - b.conversionFactor);
  }, [editing, productUnitConversions]);

  // Available UoMs not yet added as conversions for this product
  const availableUomsForConv = useMemo(() => {
    const usedAbbrs = new Set(existingConversions.map(c => c.unitAbbreviation.toLowerCase()));
    return unitsOfMeasure
      .filter(u => !(u as any).isDeleted && !usedAbbrs.has(u.abbreviation.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [unitsOfMeasure, existingConversions]);

  const existingBaseUnit = useMemo(() => {
    if (!editing) return null;
    return productBaseUnits.find(b => b.productId === editing.id) ?? null;
  }, [editing, productBaseUnits]);

  const selectedBaseUom = useMemo(() => {
    if (!form.baseUnitId) return null;
    return unitsOfMeasure.find(u => u.id === form.baseUnitId) ?? null;
  }, [form.baseUnitId, unitsOfMeasure]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowConversions(false);
      setShowInlineCategory(false);
      setShowInlineUom(false);
    } else if (editing) {
      // Reset sector when opening for edit
      const cat = productCategories.find(c => c.name === editing.category) as ProductCategory | undefined;
      setSelectedSectorId(cat?.sectorId ?? "all");
    }
    onOpenChange(isOpen);
  };

  // Sprint 1: Verify PO/SO before deleting conversion
  const handleDeleteUnit = (conv: ProductUnitConversion) => {
    const usedInPOs = purchaseOrders
      .filter(po => !["Received", "Cancelled"].includes(po.status))
      .flatMap((po: any) => po.lines)
      .some((l: any) => l.unitId === conv.id || l.unitAbbreviation === conv.unitAbbreviation);
    const usedInSOs = salesOrders
      .filter(so => !["Delivered", "Invoiced", "Cancelled"].includes(so.status))
      .flatMap((so: any) => so.lines)
      .some((l: any) => l.unitId === conv.id || l.unitAbbreviation === conv.unitAbbreviation);
    
    if (usedInPOs || usedInSOs) {
      toast({ title: t("productForm.deleteImpossible"), description: t("productForm.deleteImpossibleDesc"), variant: "destructive" });
      return;
    }
    setProductUnitConversions(prev => prev.filter(c => c.id !== conv.id));
    toast({ title: t("productForm.unitDeleted") });
  };

  const handleAddUnit = () => {
    if (!unitForm.unitName.trim() || !unitForm.unitAbbreviation.trim() || unitForm.conversionFactor <= 0) {
      toast({ title: t("productForm.unitError"), description: t("productForm.unitFillAll"), variant: "destructive" });
      return;
    }
    if (!editing) {
      toast({ title: t("common.info"), description: t("productForm.saveFirst") });
      return;
    }
    if (existingConversions.some(c => c.unitAbbreviation.toLowerCase() === unitForm.unitAbbreviation.trim().toLowerCase())) {
      toast({ title: t("productForm.unitError"), description: t("productForm.abbrExists"), variant: "destructive" });
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
    if (unitForm.conversionFactor === 1 && !existingBaseUnit) {
      const existing = productBaseUnits.find(b => b.productId === editing.id);
      if (!existing) {
        setProductBaseUnits(prev => [...prev, { productId: editing.id, baseUnitName: unitForm.unitName.trim(), baseUnitAbbreviation: unitForm.unitAbbreviation.trim() }]);
      }
    }
    setUnitForm({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true, selectedUomId: "" });
    setShowUnitForm(false);
    toast({ title: t("productForm.unitAdded"), description: t("productForm.unitAddedDesc", { name: newConv.unitName, factor: newConv.conversionFactor }) });
  };

  const handleBaseUnitChange = (unitId: string) => {
    const uom = unitsOfMeasure.find(u => u.id === unitId);
    if (uom) {
      setForm({ ...form, baseUnitId: unitId, uom: uom.name });
    }
  };

  // Sprint 3: Inline category creation
  const handleCreateInlineCategory = () => {
    if (!inlineCatForm.name.trim()) return;
    if (productCategories.some(c => c.name.toLowerCase() === inlineCatForm.name.trim().toLowerCase())) {
      toast({ title: t("productForm.unitError"), description: t("productForm.catExists"), variant: "destructive" });
      return;
    }
    const sectorForCat = selectedSectorId !== "all" ? selectedSectorId : "SEC-01";
    const newCat: ProductCategory = { id: `CAT-${Date.now()}`, code: `CUSTOM-${Date.now()}`, sectorId: sectorForCat, name: inlineCatForm.name.trim(), description: inlineCatForm.description, productCount: 0, status: inlineCatForm.status as "Active" | "Inactive" };
    setProductCategories(prev => [...prev, newCat]);
    setForm({ ...form, category: newCat.name, subcategoryId: undefined });
    setShowInlineCategory(false);
    setInlineCatForm({ name: "", description: "", status: "Active" });
    toast({ title: t("productForm.catCreated"), description: newCat.name });
  };

  // Sprint 3: Inline UDM creation
  const handleCreateInlineUom = () => {
    if (!inlineUomForm.name.trim() || !inlineUomForm.abbreviation.trim()) return;
    if (unitsOfMeasure.some(u => u.abbreviation.toLowerCase() === inlineUomForm.abbreviation.trim().toLowerCase())) {
      toast({ title: t("productForm.unitError"), description: t("productForm.uomExists"), variant: "destructive" });
      return;
    }
    const newUom = { id: `UOM-${Date.now()}`, name: inlineUomForm.name.trim(), abbreviation: inlineUomForm.abbreviation.trim(), type: inlineUomForm.type, unitKind: "PHYSICAL" as const };
    setUnitsOfMeasure(prev => [...prev, newUom]);
    setForm({ ...form, baseUnitId: newUom.id, uom: newUom.name });
    setShowInlineUom(false);
    setInlineUomForm({ name: "", abbreviation: "", type: "Count" });
    toast({ title: t("productForm.uomCreated"), description: newUom.name });
  };

  // Handle sector change — reset category and subcategory
  const handleSectorChange = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setForm({ ...form, category: "", subcategoryId: undefined });
  };

  // Handle category change — reset subcategory
  const handleCategoryChange = (categoryName: string) => {
    setForm({ ...form, category: categoryName, subcategoryId: undefined });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? t("productForm.titleEdit") : t("productForm.titleNew")}</DialogTitle>
        </DialogHeader>

        {/* Section 1: Infos de base */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("productForm.basicInfo")}</h3>
          <FormField label={t("productForm.name")} required error={formErrors.name}>
            <input className={formInputClass} value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: "" }); }} />
          </FormField>
          <FormField label={t("productForm.sku")} required error={formErrors.sku}>
            <input className={formInputClass} value={form.sku} onChange={e => { setForm({ ...form, sku: e.target.value }); setFormErrors({ ...formErrors, sku: "" }); }} />
          </FormField>

          {/* Sector → Category → Subcategory hierarchy */}
          <div className="space-y-3">
            <FormField label={t("productForm.sector")}>
              <select
                className={formSelectClass}
                value={selectedSectorId}
                onChange={e => handleSectorChange(e.target.value)}
                disabled={isSectorRestricted && scopedSectors.length <= 1}
              >
                {/* Only show "Tous les secteurs" if user is unrestricted */}
                {!isSectorRestricted && <option value="all">{t("productForm.allSectors")}</option>}
                {scopedSectors.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
              {isSectorRestricted && scopedSectors.length === 1 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{t("productForm.restrictedScope")}</p>
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              {/* Category filtered by sector */}
              <FormField label={t("productForm.category")} required error={formErrors.category}>
                {showInlineCategory ? (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                    <p className="text-xs font-medium text-primary">{t("productForm.newCategory")}</p>
                    <input className={formInputClass} placeholder={t("productForm.namePlaceholder")} value={inlineCatForm.name} onChange={e => setInlineCatForm({ ...inlineCatForm, name: e.target.value })} />
                    <input className={formInputClass} placeholder={t("productForm.description")} value={inlineCatForm.description} onChange={e => setInlineCatForm({ ...inlineCatForm, description: e.target.value })} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setShowInlineCategory(false)}>{t("common.cancel")}</Button>
                      <Button size="sm" onClick={handleCreateInlineCategory} disabled={!inlineCatForm.name.trim()}>{t("productForm.createAndSelect")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <select className={`${formSelectClass} flex-1`} value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                      <option value="">{t("productForm.choose")}</option>
                      {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <Button variant="outline" size="sm" onClick={() => setShowInlineCategory(true)} className="shrink-0 px-2" title={t("productForm.newCategory")}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </FormField>

              {/* Subcategory filtered by category */}
              <FormField label={t("productForm.subcategory")}>
                <select
                  className={formSelectClass}
                  value={form.subcategoryId ?? ""}
                  onChange={e => setForm({ ...form, subcategoryId: e.target.value || undefined })}
                  disabled={!form.category || filteredSubcategories.length === 0}
                >
                  <option value="">{t("productForm.none")}</option>
                  {filteredSubcategories.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
                {form.category && filteredSubcategories.length === 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t("productForm.noSubcategory")}</p>
                )}
              </FormField>
            </div>
          </div>

          {/* UDM with inline creation */}
          <FormField label={t("productForm.baseUnit")} required error={formErrors.uom}>
            {showInlineUom ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                <p className="text-xs font-medium text-primary">{t("productForm.newUdm")}</p>
                <input className={formInputClass} placeholder={t("productForm.nameStar")} value={inlineUomForm.name} onChange={e => setInlineUomForm({ ...inlineUomForm, name: e.target.value })} />
                <input className={formInputClass} placeholder={t("productForm.abbrStar")} maxLength={10} value={inlineUomForm.abbreviation} onChange={e => setInlineUomForm({ ...inlineUomForm, abbreviation: e.target.value })} />
                <select className={formSelectClass} value={inlineUomForm.type} onChange={e => setInlineUomForm({ ...inlineUomForm, type: e.target.value as any })}>
                  <option value="Count">{t("productForm.typeCount")}</option><option value="Weight">{t("productForm.typeWeight")}</option><option value="Volume">{t("productForm.typeVolume")}</option><option value="Length">{t("productForm.typeLength")}</option><option value="Area">{t("productForm.typeArea")}</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowInlineUom(false)}>{t("common.cancel")}</Button>
                  <Button size="sm" onClick={handleCreateInlineUom} disabled={!inlineUomForm.name.trim() || !inlineUomForm.abbreviation.trim()}>{t("productForm.createAndSelectUom")}</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-1">
                <select
                  className={`${formSelectClass} flex-1`}
                  value={form.baseUnitId ?? ""}
                  onChange={e => handleBaseUnitChange(e.target.value)}
                  disabled={editing !== null && hasStock}
                >
                  <option value="">—</option>
                  {unitsOfMeasure.filter(u => !(u as any).isDeleted).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                  ))}
                </select>
                {!(editing && hasStock) && (
                  <Button variant="outline" size="sm" onClick={() => setShowInlineUom(true)} className="shrink-0 px-2" title={t("productForm.createUdm")}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
            {editing && hasStock && (
              <p className="text-[10px] text-destructive mt-1">⚠️ {t("productForm.cannotChangeUnit", { stock: productStock })}</p>
            )}
          </FormField>

          {selectedBaseUom && (
            <div className="rounded-md p-2 text-xs bg-primary/5 border border-primary/20 text-foreground">
              📦 {t("productForm.baseUnitDisplay")} <strong>{selectedBaseUom.name} ({selectedBaseUom.abbreviation})</strong>
            </div>
          )}
          {showFinancials && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t("productForm.unitCost", { unit: selectedBaseUom ? `/${selectedBaseUom.abbreviation}` : "" })} error={formErrors.unitCost}>
                <input type="number" className={formInputClass} value={form.unitCost ?? 0} onChange={e => setForm({ ...form, unitCost: Number(e.target.value) })} />
              </FormField>
              <FormField label={t("productForm.unitPrice", { unit: selectedBaseUom ? `/${selectedBaseUom.abbreviation}` : "" })} error={formErrors.unitPrice}>
                <input type="number" className={formInputClass} value={form.unitPrice ?? 0} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} />
              </FormField>
            </div>
          )}
          <FormField label={t("productForm.reorderPoint")} error={formErrors.reorderPoint}>
            <input type="number" className={formInputClass} value={form.reorderPoint ?? 0} onChange={e => setForm({ ...form, reorderPoint: Number(e.target.value) })} />
          </FormField>
          <FormField label={t("productForm.statusLabel")}>
            <select className={formSelectClass} value={form.isActive ? "active" : "inactive"} onChange={e => setForm({ ...form, isActive: e.target.value === "active" })}>
              <option value="active">{t("common.active")}</option>
              <option value="inactive">{t("common.inactive")}</option>
            </select>
          </FormField>

          {/* ERP Purchasing Flags per ERP_PO_PREREQUISITES §1.2 */}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border/50">{t("productForm.purchaseConfig")}</h3>
          <div className="grid grid-cols-3 gap-3">
            <FormField label={t("productForm.productType")}>
              <select className={formSelectClass} value={(form as any).productType ?? "Storable"} onChange={e => setForm({ ...form, productType: e.target.value } as any)}>
                <option value="Storable">{t("productForm.storable")}</option>
                <option value="Consumable">{t("productForm.consumable")}</option>
                <option value="Service">{t("productForm.service")}</option>
              </select>
            </FormField>
            <FormField label={t("productForm.costMethod")}>
              <select className={formSelectClass} value={(form as any).costMethod ?? "Average"} onChange={e => setForm({ ...form, costMethod: e.target.value } as any)}>
                <option value="Standard">{t("productForm.standard")}</option>
                <option value="Average">{t("productForm.pmp")}</option>
                <option value="FIFO">{t("productForm.fifo")}</option>
              </select>
            </FormField>
            <FormField label={t("productForm.purchaseUom")}>
              <select className={formSelectClass} value={(form as any).purchaseUomId ?? ""} onChange={e => setForm({ ...form, purchaseUomId: e.target.value || undefined } as any)}>
                <option value="">{t("productForm.sameAsBase")}</option>
                {unitsOfMeasure.filter(u => !(u as any).isDeleted).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                ))}
              </select>
            </FormField>
          </div>
          {/* Default vendor */}
          <FormField label={t("productForm.defaultVendor")} hint={t("productForm.defaultVendorHint")}>
            <select className={formSelectClass} value={(form as any).defaultVendorId ?? ""} onChange={e => setForm({ ...form, defaultVendorId: e.target.value || undefined } as any)}>
              <option value="">{t("productForm.noVendor")}</option>
              {vendors.filter(v => v.status === "Active").map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
              ))}
            </select>
          </FormField>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(form as any).canBePurchased ?? true} onChange={e => setForm({ ...form, canBePurchased: e.target.checked } as any)} className="rounded border-input" />
              {t("productForm.purchasable")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(form as any).canBeSold ?? true} onChange={e => setForm({ ...form, canBeSold: e.target.checked } as any)} className="rounded border-input" />
              {t("productForm.sellable")}
            </label>
          </div>

          {/* Collapsible conversions section */}
          {editing && (
            <>
              <button
                onClick={() => setShowConversions(!showConversions)}
                className="flex items-center gap-2 w-full text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors pt-2 border-t border-border/50"
              >
                {showConversions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {t("productForm.conversions", { count: existingConversions.length })}
              </button>

              {showConversions && (
                <div className="space-y-3 pl-1">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                    <p className="text-xs font-medium text-muted-foreground">{t("productForm.baseUnitSection")}</p>
                    <p className="text-sm font-bold">
                      {existingBaseUnit ? `${existingBaseUnit.baseUnitName} (${existingBaseUnit.baseUnitAbbreviation})` : selectedBaseUom ? `${selectedBaseUom.name} (${selectedBaseUom.abbreviation})` : <span className="text-destructive">{t("productForm.notDefined")}</span>}
                    </p>
                  </div>

                  {existingConversions.length > 0 && (
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs">{t("productForm.unitCol")}</TableHead>
                            <TableHead className="text-xs">{t("productForm.abbrCol")}</TableHead>
                            <TableHead className="text-right text-xs">{t("productForm.factorCol")}</TableHead>
                            <TableHead className="text-center text-xs">{t("productForm.buyCol")}</TableHead>
                            <TableHead className="text-center text-xs w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {existingConversions.map(c => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium text-xs py-2">
                                {c.unitName}
                                {existingBaseUnit && c.unitAbbreviation === existingBaseUnit.baseUnitAbbreviation && (
                                  <span className="ml-1.5 text-[10px] px-1 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">BASE</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-[10px] font-semibold py-2">{c.unitAbbreviation}</TableCell>
                              <TableCell className="text-right font-mono text-xs py-2">×{c.conversionFactor}</TableCell>
                              <TableCell className="text-center py-2">
                                <div className="flex gap-0.5 justify-center">
                                  {c.allowBuy && <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">A</span>}
                                  {c.allowSell && <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">V</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-center py-2">
                                <button onClick={() => handleDeleteUnit(c)} className="p-1 rounded-md hover:bg-destructive/10 text-destructive" title={t("common.delete")}>
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Add unit form */}
                  {showUnitForm ? (
                    <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{t("productForm.addUnit")}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setUseCustomUnit(false); setUnitForm({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true, selectedUomId: "" }); }}
                            className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors", !useCustomUnit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                          >
                            {t("productForm.existing")}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUseCustomUnit(true); setUnitForm({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true, selectedUomId: "" }); }}
                            className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors", useCustomUnit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                          >
                            {t("productForm.custom")}
                          </button>
                        </div>
                      </div>

                      {!useCustomUnit ? (
                        <Popover open={unitComboOpen} onOpenChange={setUnitComboOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={unitComboOpen} className="w-full justify-between font-normal text-xs h-9">
                              {unitForm.selectedUomId
                                ? (() => { const u = unitsOfMeasure.find(u => u.id === unitForm.selectedUomId); return u ? `${u.name} (${u.abbreviation})` : t("common.select"); })()
                                : t("productForm.selectUnit")}
                              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder={t("productForm.searchDots")} />
                              <CommandList>
                                <CommandEmpty>{t("productForm.noUnitFound")}</CommandEmpty>
                                <CommandGroup heading={t("productForm.availableUnits")}>
                                  {availableUomsForConv.map(u => (
                                    <CommandItem
                                      key={u.id}
                                      value={`${u.name} ${u.abbreviation}`}
                                      onSelect={() => {
                                        setUnitForm({ ...unitForm, selectedUomId: u.id, unitName: u.name, unitAbbreviation: u.abbreviation, conversionFactor: (u as any).conversionFactor ?? 1 });
                                        setUnitComboOpen(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-3.5 w-3.5", unitForm.selectedUomId === u.id ? "opacity-100" : "opacity-0")} />
                                      <span className="font-medium text-xs">{u.name}</span>
                                      <span className="ml-1 font-mono text-[10px] text-muted-foreground">({u.abbreviation})</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  <CommandItem onSelect={() => { setUseCustomUnit(true); setUnitComboOpen(false); }}>
                                    <Plus className="mr-2 h-3.5 w-3.5" />
                                    <span className="text-primary font-medium text-xs">{t("productForm.customLabel")}</span>
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <input className={formInputClass} value={unitForm.unitName} onChange={e => setUnitForm({ ...unitForm, unitName: e.target.value })} placeholder={t("productForm.namePlaceholderUnit")} />
                          <input className={formInputClass} value={unitForm.unitAbbreviation} onChange={e => setUnitForm({ ...unitForm, unitAbbreviation: e.target.value })} placeholder={t("productForm.abbrPlaceholderUnit")} maxLength={10} />
                        </div>
                      )}

                      <input type="number" step="0.001" min="0.001" className={formInputClass} value={unitForm.conversionFactor} onChange={e => setUnitForm({ ...unitForm, conversionFactor: +e.target.value })} placeholder={t("productForm.factorPlaceholder")} />
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={unitForm.allowBuy} onChange={e => setUnitForm({ ...unitForm, allowBuy: e.target.checked })} className="rounded" /> {t("productForm.buy")}</label>
                        <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={unitForm.allowSell} onChange={e => setUnitForm({ ...unitForm, allowSell: e.target.checked })} className="rounded" /> {t("productForm.sell")}</label>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setShowUnitForm(false); setUseCustomUnit(false); }}>{t("common.cancel")}</Button>
                        <Button size="sm" onClick={handleAddUnit}>{t("common.add")}</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setShowUnitForm(true); setUseCustomUnit(false); setUnitForm({ unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true, selectedUomId: "" }); }} className="gap-1">
                      <Plus className="h-3 w-3" /> {t("productForm.addUnit")}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>{t("common.cancel")}</Button>
          <Button onClick={onSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("productForm.saving")}
              </span>
            ) : editing ? t("common.save") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
