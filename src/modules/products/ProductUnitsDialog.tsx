import { useState, useMemo } from "react";
import UnitTimelineDrawer from "./UnitTimelineDrawer";
import { Plus, Trash2, Package, ArrowRightLeft, Ruler, Square, Lock, History, ShieldAlert, Check, ChevronsUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { toast } from "@/hooks/use-toast";
import { generateId } from "@/services/crudService";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import type { ProductUnitConversion, ProductDimensions } from "@/lib/unitConversion";
import { cn } from "@/lib/utils";
import { canEditFactor } from "@/lib/unitConversion";
import type { ProductBaseUnit } from "@/data/productUnitConversions";
import type { Product } from "@/data/mockData";
import { calculateBreakdown, formatBreakdown, areaPieceM2, calculateAreaBreakdown, formatAreaInfo } from "@/lib/unitConversion";
import { logFactorChange, logDimensionChange, validateUniqueAbbreviation } from "@/lib/factorAudit";

interface ProductUnitsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyConv = { unitName: "", unitAbbreviation: "", conversionFactor: 1, allowBuy: true, allowSell: true, selectedUomId: "" };

export default function ProductUnitsDialog({ product, open, onOpenChange }: ProductUnitsDialogProps) {
  const { productUnitConversions, setProductUnitConversions, productBaseUnits, setProductBaseUnits, productDimensions, setProductDimensions, inventory, unitsOfMeasure } = useWMSData();
  const { currentUser } = useAuth();

  // Sprint 6.3: Check product stock for base unit change protection
  const productStock = useMemo(() => {
    if (!product) return 0;
    return inventory.filter(i => i.productId === product.id).reduce((sum, i) => sum + i.qtyOnHand, 0);
  }, [product, inventory]);
  const hasStock = productStock > 0;
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyConv);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uomComboOpen, setUomComboOpen] = useState(false);
  const [useCustomUnit, setUseCustomUnit] = useState(false);
  // Phase 3 — Task 3.5: Timeline drawer state
  const [timelineUnit, setTimelineUnit] = useState<string | null>(null);

  // Breakdown calculator state
  const [breakdownQty, setBreakdownQty] = useState<number>(0);
  const [breakdownMode, setBreakdownMode] = useState<"sell" | "buy">("sell");
  const [breakdownUnit, setBreakdownUnit] = useState<"base" | "m2">("base");

  // Dimension editor state
  const [showDimForm, setShowDimForm] = useState(false);
  const [dimForm, setDimForm] = useState({ widthCm: 0, heightCm: 0, allowPartialCarton: true });

  const conversions = useMemo(
    () => product ? productUnitConversions.filter(c => c.productId === product.id).sort((a, b) => a.conversionFactor - b.conversionFactor) : [],
    [product, productUnitConversions]
  );

  const baseUnit = useMemo(
    () => product ? productBaseUnits.find(b => b.productId === product.id) : undefined,
    [product, productBaseUnits]
  );

  const dimensions = useMemo(
    () => product ? productDimensions.find(d => d.productId === product.id) : undefined,
    [product, productDimensions]
  );

  // Available UoMs not yet added as conversions for this product
  const availableUoms = useMemo(() => {
    if (!product) return [];
    const usedAbbrs = new Set(conversions.map(c => c.unitAbbreviation.toLowerCase()));
    return unitsOfMeasure
      .filter(u => !(u as any).isDeleted && !usedAbbrs.has(u.abbreviation.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [product, unitsOfMeasure, conversions]);

  const breakdownResult = useMemo(() => {
    if (!breakdownQty || breakdownQty <= 0 || conversions.length === 0) return null;
    if (breakdownUnit === "m2" && dimensions) {
      return calculateAreaBreakdown(breakdownQty, dimensions, conversions, breakdownMode);
    }
    return calculateBreakdown(breakdownQty, conversions, breakdownMode);
  }, [breakdownQty, conversions, breakdownMode, breakdownUnit, dimensions]);

  // Check if area breakdown result
  const isAreaResult = breakdownResult && "areaPerPiece" in breakdownResult;

  if (!product) return null;

  const isDimensional = !!dimensions;

  const handleSetBaseUnit = (unitName: string, unitAbbr: string) => {
    // Sprint 6.3: Block base unit change if stock > 0
    if (hasStock && baseUnit) {
      toast({ title: "⚠️ Changement interdit", description: `Impossible de changer l'unité de base car du stock existe (${productStock} unités)`, variant: "destructive" });
      return;
    }
    const existing = productBaseUnits.find(b => b.productId === product.id);
    if (existing) {
      setProductBaseUnits(prev => prev.map(b => b.productId === product.id ? { ...b, baseUnitName: unitName, baseUnitAbbreviation: unitAbbr } : b));
    } else {
      setProductBaseUnits(prev => [...prev, { productId: product.id, baseUnitName: unitName, baseUnitAbbreviation: unitAbbr }]);
    }
    toast({ title: "Unité de base définie", description: `${unitName} (${unitAbbr})` });
  };

  const handleAddConversion = () => {
    const errors: Record<string, string> = {};
    if (!form.unitName.trim()) errors.unitName = "Nom requis";
    if (!form.unitAbbreviation.trim()) errors.unitAbbreviation = "Abréviation requise";
    if (form.conversionFactor <= 0) errors.conversionFactor = "Facteur doit être > 0";
    // S-04/BR-U7: Duplicate abbreviation prevention
    const abbrCheck = validateUniqueAbbreviation(productUnitConversions, product.id, form.unitAbbreviation.trim());
    if (!abbrCheck.valid) errors.unitAbbreviation = abbrCheck.error!;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newConv: ProductUnitConversion = {
      id: generateId("PUC"),
      productId: product.id,
      unitName: form.unitName.trim(),
      unitAbbreviation: form.unitAbbreviation.trim(),
      conversionFactor: form.conversionFactor,
      allowBuy: form.allowBuy,
      allowSell: form.allowSell,
      sortOrder: conversions.length + 1,
      // Phase 0 defaults
      usedInTransactions: false,
      decimalPlaces: form.conversionFactor === 1 ? 2 : 0,
      roundingMode: "round",
      validFrom: new Date().toISOString().slice(0, 10),
    };
    setProductUnitConversions(prev => [...prev, newConv]);

    // BR-U15: Audit trail
    logFactorChange("FACTOR_CREATED", newConv, currentUser?.name ?? "system");

    if (form.conversionFactor === 1 && !baseUnit) {
      handleSetBaseUnit(form.unitName.trim(), form.unitAbbreviation.trim());
    }

    setForm(emptyConv);
    setShowAddForm(false);
    toast({ title: "Unité ajoutée", description: `${newConv.unitName} (×${newConv.conversionFactor})` });
  };

  const handleDeleteConversion = (convId: string) => {
    const conv = conversions.find(c => c.id === convId);
    if (!conv) return;
    // S-03: Prevent deleting the base unit
    if (baseUnit && conv.unitAbbreviation === baseUnit.baseUnitAbbreviation) {
      toast({ title: "⚠️ Suppression interdite", description: "Impossible de supprimer l'unité de base", variant: "destructive" });
      return;
    }
    // S-02: Prevent deleting locked factors
    const editCheck = canEditFactor(conv);
    if (!editCheck.editable) {
      toast({ title: "🔒 Facteur verrouillé", description: editCheck.reason, variant: "destructive" });
      return;
    }
    setProductUnitConversions(prev => prev.filter(c => c.id !== convId));
    logFactorChange("FACTOR_DELETED", conv, currentUser?.name ?? "system");
    toast({ title: "Unité supprimée" });
  };

  const handleToggle = (convId: string, field: "allowBuy" | "allowSell") => {
    setProductUnitConversions(prev => prev.map(c => c.id === convId ? { ...c, [field]: !c[field] } : c));
  };

  const handleSaveDimensions = () => {
    if (dimForm.widthCm <= 0 || dimForm.heightCm <= 0) {
      toast({ title: "Erreur", description: "Les dimensions doivent être > 0", variant: "destructive" });
      return;
    }
    const oldDims = dimensions ?? null;
    const newDim: ProductDimensions = {
      productId: product.id,
      widthCm: dimForm.widthCm,
      heightCm: dimForm.heightCm,
      allowPartialCarton: dimForm.allowPartialCarton,
    };
    const exists = productDimensions.some(d => d.productId === product.id);
    if (exists) {
      setProductDimensions(prev => prev.map(d => d.productId === product.id ? newDim : d));
    } else {
      setProductDimensions(prev => [...prev, newDim]);
    }
    // BR-U15: Audit
    logDimensionChange(product.id, currentUser?.name ?? "system", oldDims ? { widthCm: oldDims.widthCm, heightCm: oldDims.heightCm } : null, { widthCm: dimForm.widthCm, heightCm: dimForm.heightCm });
    setShowDimForm(false);
    toast({ title: "Dimensions enregistrées", description: formatAreaInfo(dimForm.widthCm, dimForm.heightCm) });
  };

  const handleRemoveDimensions = () => {
    setProductDimensions(prev => prev.filter(d => d.productId !== product.id));
    toast({ title: "Dimensions supprimées" });
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Conversions d'unités — {product.name}
          </DialogTitle>
        </DialogHeader>

        {/* Base Unit Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Unité de base</p>
              <p className="text-lg font-bold">
                {baseUnit ? `${baseUnit.baseUnitName} (${baseUnit.baseUnitAbbreviation})` : <span className="text-destructive">Non définie</span>}
              </p>
              <p className="text-xs text-muted-foreground">Tout le stock est stocké dans cette unité</p>
            </div>
            <Package className="h-8 w-8 text-primary/40" />
          </div>
        </div>

        {/* Dimensional Info Panel */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Ruler className="h-4 w-4 text-primary" />
              Dimensions (produit surfacique)
            </h4>
            {isDimensional ? (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => {
                  setDimForm({ widthCm: dimensions!.widthCm, heightCm: dimensions!.heightCm, allowPartialCarton: dimensions!.allowPartialCarton });
                  setShowDimForm(true);
                }}>Modifier</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={handleRemoveDimensions}>Supprimer</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => {
                setDimForm({ widthCm: 0, heightCm: 0, allowPartialCarton: true });
                setShowDimForm(true);
              }}>
                <Plus className="h-3 w-3 mr-1" /> Ajouter dimensions
              </Button>
            )}
          </div>

          {isDimensional && !showDimForm && (
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-md bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Largeur</p>
                <p className="font-bold text-sm">{dimensions!.widthCm} cm</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Hauteur</p>
                <p className="font-bold text-sm">{dimensions!.heightCm} cm</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Surface/pièce</p>
                <p className="font-bold text-sm">{areaPieceM2(dimensions!.widthCm, dimensions!.heightCm).toFixed(4)} m²</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Carton partiel</p>
                <p className={`font-bold text-sm ${dimensions!.allowPartialCarton ? "text-emerald-600" : "text-orange-600"}`}>
                  {dimensions!.allowPartialCarton ? "Oui" : "Non"}
                </p>
              </div>
            </div>
          )}

          {!isDimensional && !showDimForm && (
            <p className="text-xs text-muted-foreground">
              Activez les dimensions pour les produits vendus au m² (carrelage, panneaux, tissu…)
            </p>
          )}

          {showDimForm && (
            <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Largeur (cm)" required>
                  <input type="number" min="1" step="1" className={formInputClass} value={dimForm.widthCm || ""} onChange={e => setDimForm({ ...dimForm, widthCm: +e.target.value })} placeholder="ex: 50" />
                </FormField>
                <FormField label="Hauteur (cm)" required>
                  <input type="number" min="1" step="1" className={formInputClass} value={dimForm.heightCm || ""} onChange={e => setDimForm({ ...dimForm, heightCm: +e.target.value })} placeholder="ex: 50" />
                </FormField>
              </div>
              {dimForm.widthCm > 0 && dimForm.heightCm > 0 && (
                <div className="rounded-md bg-accent/10 p-2 flex items-center gap-2">
                  <Square className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {dimForm.widthCm}×{dimForm.heightCm} cm = <strong>{areaPieceM2(dimForm.widthCm, dimForm.heightCm).toFixed(4)} m²</strong>/pièce
                  </span>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={dimForm.allowPartialCarton} onChange={e => setDimForm({ ...dimForm, allowPartialCarton: e.target.checked })} className="rounded" />
                Autoriser la vente de pièces individuelles (carton partiel)
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowDimForm(false)}>Annuler</Button>
                <Button size="sm" onClick={handleSaveDimensions}>Enregistrer</Button>
              </div>
            </div>
          )}
        </div>

        {/* Conversion Table */}
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Unité</TableHead>
                <TableHead>Abrév.</TableHead>
                <TableHead className="text-right">Facteur</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                {isDimensional && <TableHead className="text-right">m²/unité</TableHead>}
                <TableHead className="text-center">Achat</TableHead>
                <TableHead className="text-center">Vente</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isDimensional ? 8 : 7} className="text-center text-muted-foreground py-8">
                    Aucune conversion définie. Ajoutez l'unité de base (facteur = 1) puis les emballages.
                  </TableCell>
                </TableRow>
              ) : conversions.map(c => {
                const editCheck = canEditFactor(c);
                const isBase = baseUnit && c.unitAbbreviation === baseUnit.baseUnitAbbreviation;
                return (
                <TableRow key={c.id} className={c.usedInTransactions ? "bg-muted/20" : ""}>
                  <TableCell className="font-medium">
                    {c.unitName}
                    {isBase && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">BASE</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">{c.unitAbbreviation}</TableCell>
                  <TableCell className="text-right font-mono">
                    ×{c.conversionFactor}
                    {baseUnit && c.conversionFactor > 1 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        = {c.conversionFactor} {baseUnit.baseUnitAbbreviation}
                      </span>
                    )}
                  </TableCell>
                  {/* S-02: Factor lock status */}
                  <TableCell className="text-center">
                    {isBase ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Lock className="h-3 w-3" /> Base
                      </span>
                    ) : c.usedInTransactions ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" title={`Verrouillé depuis ${c.lockedAt ?? "N/A"}`}>
                        <Lock className="h-3 w-3" /> Verrouillé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        ✏️ Modifiable
                      </span>
                    )}
                  </TableCell>
                  {isDimensional && (
                    <TableCell className="text-right font-mono text-xs">
                      {(c.conversionFactor * areaPieceM2(dimensions!.widthCm, dimensions!.heightCm)).toFixed(2)} m²
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggle(c.id, "allowBuy")}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${c.allowBuy ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                    >
                      {c.allowBuy ? "Oui" : "Non"}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggle(c.id, "allowSell")}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${c.allowSell ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted text-muted-foreground"}`}
                    >
                      {c.allowSell ? "Oui" : "Non"}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Phase 3 — Task 3.5: History button */}
                      <button
                        onClick={() => setTimelineUnit(c.unitAbbreviation)}
                        className="p-1.5 rounded-md hover:bg-primary/10 text-primary"
                        title="Historique des versions"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>
                      {!isBase && !editCheck.editable ? (
                        <span className="text-[10px] text-muted-foreground" title={editCheck.reason}>🔒</span>
                      ) : isBase ? (
                        <span className="text-[10px] text-muted-foreground" title="Unité de base — suppression interdite">🔒</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteConversion(c.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>

        {/* Add Form */}
        {showAddForm ? (
          <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Ajouter une unité de conversion</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setUseCustomUnit(false); setForm({ ...emptyConv }); }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    !useCustomUnit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Choisir existante
                </button>
                <button
                  type="button"
                  onClick={() => { setUseCustomUnit(true); setForm({ ...emptyConv }); }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    useCustomUnit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Personnalisée
                </button>
              </div>
            </div>

            {!useCustomUnit ? (
              /* ── Selector from existing UoMs ── */
              <div className="space-y-3">
                <FormField label="Sélectionner une unité" required error={formErrors.unitName}>
                  <Popover open={uomComboOpen} onOpenChange={setUomComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={uomComboOpen}
                        className="w-full justify-between font-normal"
                      >
                        {form.selectedUomId
                          ? (() => {
                              const u = unitsOfMeasure.find(u => u.id === form.selectedUomId);
                              return u ? `${u.name} (${u.abbreviation})` : "Sélectionner…";
                            })()
                          : "Sélectionner une unité…"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher une unité…" />
                        <CommandList>
                          <CommandEmpty>Aucune unité trouvée.</CommandEmpty>
                          <CommandGroup heading="Unités disponibles">
                            {availableUoms.map(u => (
                              <CommandItem
                                key={u.id}
                                value={`${u.name} ${u.abbreviation}`}
                                onSelect={() => {
                                  const factor = u.conversionFactor ?? 1;
                                  setForm({
                                    ...form,
                                    selectedUomId: u.id,
                                    unitName: u.name,
                                    unitAbbreviation: u.abbreviation,
                                    conversionFactor: factor,
                                  });
                                  setUomComboOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", form.selectedUomId === u.id ? "opacity-100" : "opacity-0")} />
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="font-medium">{u.name}</span>
                                  <span className="font-mono text-xs text-muted-foreground">({u.abbreviation})</span>
                                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{u.type}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={() => { setUseCustomUnit(true); setUomComboOpen(false); }}>
                              <Plus className="mr-2 h-4 w-4" />
                              <span className="text-primary font-medium">Créer une unité personnalisée</span>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormField>
              </div>
            ) : (
              /* ── Custom unit inputs ── */
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Nom de l'unité" required error={formErrors.unitName}>
                  <input className={formInputClass} value={form.unitName} onChange={e => setForm({ ...form, unitName: e.target.value })} placeholder="ex: Carton" />
                </FormField>
                <FormField label="Abréviation" required error={formErrors.unitAbbreviation}>
                  <input className={formInputClass} value={form.unitAbbreviation} onChange={e => setForm({ ...form, unitAbbreviation: e.target.value })} placeholder="ex: Ctn" maxLength={10} />
                </FormField>
              </div>
            )}

            <FormField label={`Facteur de conversion (1 unité = X ${baseUnit?.baseUnitAbbreviation ?? "base"})`} required error={formErrors.conversionFactor}>
              <input type="number" step="0.001" min="0.001" className={formInputClass} value={form.conversionFactor} onChange={e => setForm({ ...form, conversionFactor: +e.target.value })} />
            </FormField>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.allowBuy} onChange={e => setForm({ ...form, allowBuy: e.target.checked })} className="rounded" />
                Autorisé à l'achat
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.allowSell} onChange={e => setForm({ ...form, allowSell: e.target.checked })} className="rounded" />
                Autorisé à la vente
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); setFormErrors({}); setUseCustomUnit(false); }}>Annuler</Button>
              <Button size="sm" onClick={handleAddConversion}>Ajouter</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="gap-2 w-full" onClick={() => { setShowAddForm(true); setUseCustomUnit(false); setForm(emptyConv); }}>
            <Plus className="h-4 w-4" /> Ajouter une unité de conversion
          </Button>
        )}

        {/* Breakdown Calculator */}
        {conversions.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3 bg-accent/5">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Calculateur de ventilation
            </h4>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">
                  Quantité ({breakdownUnit === "m2" ? "m²" : baseUnit?.baseUnitAbbreviation ?? "base"})
                </label>
                <input
                  type="number"
                  min="0"
                  step={breakdownUnit === "m2" ? "0.01" : "1"}
                  className={formInputClass}
                  value={breakdownQty || ""}
                  onChange={e => setBreakdownQty(+e.target.value)}
                  placeholder={breakdownUnit === "m2" ? "ex: 1" : "ex: 50"}
                />
              </div>
              {isDimensional && (
                <div>
                  <label className="text-xs text-muted-foreground">Saisie en</label>
                  <select className={formSelectClass} value={breakdownUnit} onChange={e => { setBreakdownUnit(e.target.value as "base" | "m2"); setBreakdownQty(0); }}>
                    <option value="base">{baseUnit?.baseUnitAbbreviation ?? "Base"}</option>
                    <option value="m2">m²</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Mode</label>
                <select className={formSelectClass} value={breakdownMode} onChange={e => setBreakdownMode(e.target.value as "sell" | "buy")}>
                  <option value="sell">Vente</option>
                  <option value="buy">Achat</option>
                </select>
              </div>
            </div>
            {breakdownResult && breakdownResult.lines.length > 0 && (
              <div className="rounded-lg bg-background border p-3 space-y-2">
                {isAreaResult && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-b pb-2 mb-2">
                    <Square className="h-3 w-3" />
                    <span>
                      {breakdownQty} m² demandés → <strong>{(breakdownResult as any).piecesNeeded} pièces</strong> nécessaires
                      ({((breakdownResult as any).areaPerPiece as number).toFixed(4)} m²/pièce)
                      {!(dimensions?.allowPartialCarton) && (
                        <span className="text-orange-600 ml-1">
                          • Arrondi au carton complet → {(breakdownResult as any).actualM2.toFixed(2)} m² réels
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <p className="text-xs font-medium text-muted-foreground">Ventilation optimale :</p>
                <div className="flex flex-wrap gap-2">
                  {breakdownResult.lines.map((line, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {line.quantity} {line.unitAbbreviation}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({line.baseEquivalent} {baseUnit?.baseUnitAbbreviation}
                        {isDimensional && ` = ${(line.baseEquivalent * areaPieceM2(dimensions!.widthCm, dimensions!.heightCm)).toFixed(2)} m²`})
                      </span>
                    </span>
                  ))}
                </div>
                {breakdownResult.remainder > 0 && (
                  <p className="text-xs text-destructive">⚠ Reste non couvert : {breakdownResult.remainder} {baseUnit?.baseUnitAbbreviation}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBreakdown(breakdownResult)} = {breakdownResult.totalBaseUnits} {baseUnit?.baseUnitAbbreviation}
                  {isDimensional && ` = ${(breakdownResult.totalBaseUnits * areaPieceM2(dimensions!.widthCm, dimensions!.heightCm)).toFixed(2)} m²`}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Phase 3 — Task 3.5: Unit Timeline Drawer */}
    {product && timelineUnit && (
      <UnitTimelineDrawer
        open={!!timelineUnit}
        onOpenChange={(open) => { if (!open) setTimelineUnit(null); }}
        productId={product.id}
        productName={product.name}
        unitAbbreviation={timelineUnit}
      />
    )}
    </>
  );
}
