import { useState, useMemo } from "react";
import { Ruler, Plus, Pencil, Trash2, Search, AlertTriangle, Download, Upload, ArrowRightLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { UnitOfMeasure } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import { exportToCSV, type ExportColumn } from "@/lib/exportUtils";
import { areaPieceM2, piecesForArea } from "@/lib/unitConversion";

const empty: Omit<UnitOfMeasure, "id"> = { name: "", abbreviation: "", type: "Count", unitKind: "PHYSICAL" };

interface QuickConversion { fromAbbr: string; toAbbr: string; factor: number; }
const emptyQuickConv: QuickConversion = { fromAbbr: "", toAbbr: "", factor: 1 };

export default function UomPage() {
  const { t } = useTranslation();
  const { unitsOfMeasure: data, setUnitsOfMeasure: setData, products, setProducts, productUnitConversions, setProductUnitConversions } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<UnitOfMeasure | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState("");
  const [showQuickConv, setShowQuickConv] = useState(false);
  const [quickConv, setQuickConv] = useState<QuickConversion>(emptyQuickConv);

  const filtered = useMemo(() => data.filter(u => {
    if ((u as any).isDeleted) return false;
    if (filterType !== "all" && u.type !== filterType) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.abbreviation.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search, filterType]);

  const usageCountMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(u => {
      const count = products.filter(p => p.uom === u.abbreviation || p.uom === u.name).length;
      map.set(u.id, count);
    });
    return map;
  }, [data, products]);

  const getProductsUsingUom = (uom: UnitOfMeasure) =>
    products.filter(p => p.uom === uom.abbreviation || p.uom === uom.name);

  const getDerivedUoms = (uom: UnitOfMeasure) =>
    data.filter(u => u.baseUnit === uom.abbreviation);

  const getDeleteBlockers = (uom: UnitOfMeasure) => {
    const usedByProducts = getProductsUsingUom(uom);
    const derivedUoms = getDerivedUoms(uom);
    return { usedByProducts, derivedUoms, blocked: usedByProducts.length > 0 || derivedUoms.length > 0 };
  };

  const wouldCreateCycle = (abbreviation: string, baseUnit: string): boolean => {
    const visited = new Set<string>();
    let current = baseUnit;
    while (current) {
      if (visited.has(current)) return true;
      if (current === abbreviation) return true;
      visited.add(current);
      const parent = data.find(u => u.abbreviation === current);
      current = parent?.baseUnit ?? "";
    }
    return false;
  };

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (u: UnitOfMeasure) => { setEditing(u); setForm({ name: u.name, abbreviation: u.abbreviation, type: u.type, unitKind: u.unitKind, baseUnit: u.baseUnit, conversionFactor: u.conversionFactor }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.abbreviation) return;
    if (form.baseUnit && (!form.conversionFactor || form.conversionFactor <= 0)) {
      toast({ title: t("uom.validationError"), description: t("uom.factorRequired"), variant: "destructive" });
      return;
    }
    if (form.baseUnit && editing && wouldCreateCycle(form.abbreviation, form.baseUnit)) {
      toast({ title: t("common.error"), description: t("uom.circularRef"), variant: "destructive" });
      return;
    }
    const duplicate = data.find(u => u.abbreviation.toLowerCase() === form.abbreviation.toLowerCase() && u.id !== editing?.id);
    if (duplicate) {
      toast({ title: t("uom.duplicateAbbr"), description: t("uom.duplicateAbbrDesc", { abbr: form.abbreviation, name: duplicate.name }), variant: "destructive" });
      return;
    }
    if (editing) {
      const oldAbbr = editing.abbreviation;
      const newAbbr = form.abbreviation.trim();
      const oldName = editing.name;
      const newName = form.name.trim();
      
      setData(prev => prev.map(u => u.id === editing.id ? { ...u, ...form, name: newName, abbreviation: newAbbr } : u));
      
      if (oldAbbr !== newAbbr) {
        let cascadeCount = 0;
        const affectedProducts = products.filter(p => p.uom === oldAbbr || p.uom === oldName);
        if (affectedProducts.length > 0) {
          setProducts(prev => prev.map(p => (p.uom === oldAbbr || p.uom === oldName) ? { ...p, uom: newAbbr } : p));
          cascadeCount += affectedProducts.length;
        }
        const affectedConvs = productUnitConversions.filter(c => c.unitAbbreviation === oldAbbr);
        if (affectedConvs.length > 0) {
          setProductUnitConversions(prev => prev.map(c => c.unitAbbreviation === oldAbbr ? { ...c, unitAbbreviation: newAbbr } : c));
          cascadeCount += affectedConvs.length;
        }
        const derivedUdms = data.filter(u => u.baseUnit === oldAbbr);
        if (derivedUdms.length > 0) {
          setData(prev => prev.map(u => u.baseUnit === oldAbbr ? { ...u, baseUnit: newAbbr } : u));
          cascadeCount += derivedUdms.length;
        }
        toast({ title: t("uom.uomModified"), description: t("uom.cascadeUpdate", { name: newName, count: cascadeCount }) });
      } else if (oldName !== newName) {
        const affectedProducts = products.filter(p => p.uom === oldName);
        if (affectedProducts.length > 0) {
          setProducts(prev => prev.map(p => p.uom === oldName ? { ...p, uom: newName } : p));
        }
        toast({ title: t("uom.uomModified"), description: newName });
      } else {
        toast({ title: t("uom.uomModified"), description: form.name });
      }
    } else {
      setData(prev => [...prev, { id: `UOM-${String(prev.length + 1).padStart(3, "0")}`, ...form }]);
      toast({ title: t("uom.uomCreated"), description: form.name });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const { blocked } = getDeleteBlockers(deleteConfirm);
    if (blocked) return;
    setData(prev => prev.filter(u => u.id !== deleteConfirm.id));
    toast({ title: t("uom.uomDeleted") }); setDeleteConfirm(null);
  };

  const baseUoms = data.filter(u => !u.baseUnit && !(u as any).isDeleted);

  const handleExportCSV = () => {
    const cols: ExportColumn<UnitOfMeasure>[] = [
      { key: "abbreviation", label: t("uom.abbreviationFull") },
      { key: "name", label: t("common.name") },
      { key: "type", label: t("common.type") },
      { key: "baseUnit", label: t("uom.baseUom") },
      { key: "conversionFactor", label: t("uom.factor") },
    ];
    exportToCSV(filtered, cols, "unites-de-mesure");
    toast({ title: t("common.exportCSV"), description: t("uom.exportDesc", { count: filtered.length }) });
  };

  const handleImportCSV = () => {
    const lines = importText.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) {
      toast({ title: t("uom.importEmpty"), description: t("uom.importEmptyDesc"), variant: "destructive" });
      return;
    }
    const header = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
    const abbrIdx = header.findIndex(h => h.includes("abrév") || h.includes("abbreviation") || h === "abbr");
    const nameIdx = header.findIndex(h => h === "nom" || h === "name");
    const typeIdx = header.findIndex(h => h === "type");
    const baseIdx = header.findIndex(h => h.includes("base"));
    const factorIdx = header.findIndex(h => h.includes("facteur") || h.includes("factor"));
    if (abbrIdx === -1 || nameIdx === -1) {
      toast({ title: t("uom.importInvalidFormat"), description: t("uom.importColumnsRequired"), variant: "destructive" });
      return;
    }
    const validTypes = ["Weight", "Volume", "Count", "Length", "Area"];
    let imported = 0, skipped = 0;
    const newUoms: UnitOfMeasure[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.replace(/"/g, "").trim());
      const abbr = cols[abbrIdx];
      const name = cols[nameIdx];
      if (!abbr || !name) { skipped++; continue; }
      if (data.some(u => u.abbreviation.toLowerCase() === abbr.toLowerCase()) || newUoms.some(u => u.abbreviation.toLowerCase() === abbr.toLowerCase())) { skipped++; continue; }
      const type = (typeIdx >= 0 && validTypes.includes(cols[typeIdx])) ? cols[typeIdx] as UnitOfMeasure["type"] : "Count";
      const baseUnit = baseIdx >= 0 ? cols[baseIdx] || undefined : undefined;
      const conversionFactor = factorIdx >= 0 ? (parseFloat(cols[factorIdx]) || undefined) : undefined;
      newUoms.push({ id: `UOM-IMP-${Date.now()}-${i}`, name, abbreviation: abbr, type, unitKind: "PHYSICAL", baseUnit, conversionFactor });
      imported++;
    }
    if (newUoms.length > 0) setData(prev => [...prev, ...newUoms]);
    toast({ title: t("uom.importDone"), description: t("uom.importResult", { imported, skipped }) });
    setShowImportDialog(false);
    setImportText("");
  };

  const handleQuickConversion = () => {
    if (!quickConv.fromAbbr || !quickConv.toAbbr || quickConv.factor <= 0) return;
    if (quickConv.fromAbbr === quickConv.toAbbr) {
      toast({ title: t("common.error"), description: t("uom.sameUomError"), variant: "destructive" });
      return;
    }
    const fromUom = data.find(u => u.abbreviation === quickConv.fromAbbr);
    const toUom = data.find(u => u.abbreviation === quickConv.toAbbr);
    if (!fromUom || !toUom) return;
    const exists = data.some(u => u.abbreviation === quickConv.fromAbbr && u.baseUnit === quickConv.toAbbr);
    if (exists) {
      toast({ title: t("uom.alreadyExists"), description: t("uom.alreadyExistsDesc", { from: fromUom.name, to: toUom.name }), variant: "destructive" });
      return;
    }
    setData(prev => prev.map(u => u.abbreviation === quickConv.fromAbbr
      ? { ...u, baseUnit: quickConv.toAbbr, conversionFactor: quickConv.factor }
      : u
    ));
    toast({ title: t("uom.conversionSaved"), description: `1 ${fromUom.name} = ${quickConv.factor} ${toUom.name}` });
    setQuickConv(emptyQuickConv);
    setShowQuickConv(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Ruler className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">{t("uom.title")}</h1><p className="text-sm text-muted-foreground">{t("uom.subtitle", { count: data.filter(u => !(u as any).isDeleted).length })}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5"><Download className="h-3.5 w-3.5" /> {t("common.exportCSV")}</Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="gap-1.5"><Upload className="h-3.5 w-3.5" /> {t("common.importCSV")}</Button>
          <Button variant="outline" size="sm" onClick={() => setShowQuickConv(true)} className="gap-1.5"><ArrowRightLeft className="h-3.5 w-3.5" /> {t("common.conversion")}</Button>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t("uom.newUom")}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("common.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">{t("common.allTypes")}</option>
          <option value="Weight">{t("uom.typeWeight")}</option><option value="Volume">{t("uom.typeVolume")}</option><option value="Count">{t("uom.typeCount")}</option><option value="Length">{t("uom.typeLength")}</option><option value="Area">{t("uom.typeArea")}</option>
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("uom.abbreviation")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.name")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.type")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("uom.baseUom")}</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("uom.factor")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("uom.productsCol")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.actions")}</th>
          </tr></thead>
          <tbody>
            {filtered.map(u => {
              const prodCount = usageCountMap.get(u.id) ?? 0;
              return (
                <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{u.abbreviation}</td>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{u.type}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.baseUnit ? data.find(b => b.abbreviation === u.baseUnit)?.name ?? u.baseUnit : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono">{u.conversionFactor ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-semibold ${prodCount > 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{prodCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(u)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">{t("uom.noUomFound")}</div>}
      </div>

      {/* m² Calculator */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" />
          {t("uom.m2Calculator")}
        </h3>
        <p className="text-xs text-muted-foreground">{t("uom.m2Hint")}</p>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("uom.width")}</label>
            <input type="number" min="1" className={`${formInputClass} w-24`} placeholder="50" id="calc-w" />
          </div>
          <span className="pb-2 text-muted-foreground">×</span>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("uom.height")}</label>
            <input type="number" min="1" className={`${formInputClass} w-24`} placeholder="50" id="calc-h" />
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            const w = +(document.getElementById("calc-w") as HTMLInputElement)?.value || 0;
            const h = +(document.getElementById("calc-h") as HTMLInputElement)?.value || 0;
            if (w <= 0 || h <= 0) { toast({ title: t("common.error"), description: t("uom.invalidDimensions"), variant: "destructive" }); return; }
            const area = areaPieceM2(w, h);
            const pieces = piecesForArea(1, w, h, false);
            toast({ title: `${w}×${h} cm = ${area.toFixed(4)} m²/pièce`, description: `1 m² = ${pieces} pièces` });
          }}>
            {t("common.calculate")}
          </Button>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("uom.editUom") : t("uom.newUom")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={t("common.name")} required><input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
            <FormField label={t("uom.abbreviationFull")} required><input className={formInputClass} value={form.abbreviation} onChange={e => setForm({ ...form, abbreviation: e.target.value })} maxLength={10} /></FormField>
            <FormField label={t("common.type")}>
              <select className={formSelectClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as UnitOfMeasure["type"] })}>
                <option value="Weight">{t("uom.typeWeight")}</option><option value="Volume">{t("uom.typeVolume")}</option><option value="Count">{t("uom.typeCount")}</option><option value="Length">{t("uom.typeLength")}</option><option value="Area">{t("uom.typeArea")}</option>
              </select>
            </FormField>
            <FormField label={t("uom.baseUomOptional")}>
              <select className={formSelectClass} value={form.baseUnit ?? ""} onChange={e => setForm({ ...form, baseUnit: e.target.value || undefined })}>
                <option value="">{t("uom.noneBase")}</option>
                {baseUoms.filter(b => b.id !== editing?.id).map(b => <option key={b.id} value={b.abbreviation}>{b.name} ({b.abbreviation})</option>)}
              </select>
            </FormField>
            {form.baseUnit && <FormField label={t("uom.conversionFactor")}><input type="number" step="0.001" className={formInputClass} value={form.conversionFactor ?? ""} onChange={e => setForm({ ...form, conversionFactor: +e.target.value || undefined })} /></FormField>}
            <FormField label={t("uom.roundingPrecision")} hint={t("uom.roundingHint")}>
              <input type="number" step="0.001" min="0.001" className={formInputClass} value={(form as any).roundingPrecision ?? (form.unitKind === "PHYSICAL" ? 1 : 0.001)} onChange={e => setForm({ ...form, roundingPrecision: +e.target.value || undefined } as any)} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.abbreviation}>{editing ? t("common.save") : t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("uom.deleteUom")}</DialogTitle></DialogHeader>
          {deleteConfirm && (() => {
            const { usedByProducts, derivedUoms, blocked } = getDeleteBlockers(deleteConfirm);
            return (
              <div className="space-y-3">
                {blocked ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-medium text-sm"><AlertTriangle className="h-4 w-4" /> {t("uom.deleteImpossible")}</div>
                    {usedByProducts.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t("uom.productsUsing", { count: usedByProducts.length })} : <span className="font-mono text-xs">{usedByProducts.slice(0, 5).map(p => p.sku).join(", ")}{usedByProducts.length > 5 ? "…" : ""}</span>
                      </p>
                    )}
                    {derivedUoms.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t("uom.derivedUoms", { count: derivedUoms.length })} : <span className="font-mono text-xs">{derivedUoms.map(u => u.abbreviation).join(", ")}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("uom.deleteConfirm", { name: deleteConfirm.name })}</p>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{deleteConfirm && getDeleteBlockers(deleteConfirm).blocked ? t("common.close") : t("common.cancel")}</Button>
            {deleteConfirm && !getDeleteBlockers(deleteConfirm).blocked && (
              <Button variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("uom.importTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("uom.importHint")}</p>
            <textarea
              className="w-full h-40 rounded-lg border border-input bg-muted/50 p-3 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder={`"Abréviation","Nom","Type","UDM de base","Facteur"\n"PCE","Pièce","Count","",""\n"DZ","Douzaine","Count","PCE","12"`}
              value={importText} onChange={e => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportText(""); }}>{t("common.cancel")}</Button>
            <Button onClick={handleImportCSV} disabled={!importText.trim()}>{t("common.import")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Conversion Dialog */}
      <Dialog open={showQuickConv} onOpenChange={setShowQuickConv}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-primary" /> {t("uom.conversionTitle")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("uom.conversionHint")}</p>
          <div className="space-y-4">
            <FormField label={t("uom.sourceUom")} required>
              <select className={formSelectClass} value={quickConv.fromAbbr} onChange={e => setQuickConv({ ...quickConv, fromAbbr: e.target.value })}>
                <option value="">{t("common.select")}</option>
                {data.filter(u => !(u as any).isDeleted).map(u => <option key={u.id} value={u.abbreviation}>{u.name} ({u.abbreviation})</option>)}
              </select>
            </FormField>
            <FormField label={t("uom.conversionFactor")} required hint={t("uom.factorHint")}>
              <input type="number" step="0.001" min="0.001" className={formInputClass} value={quickConv.factor || ""} onChange={e => setQuickConv({ ...quickConv, factor: +e.target.value })} placeholder="ex: 50" />
            </FormField>
            <FormField label={t("uom.destUom")} required>
              <select className={formSelectClass} value={quickConv.toAbbr} onChange={e => setQuickConv({ ...quickConv, toAbbr: e.target.value })}>
                <option value="">{t("common.select")}</option>
                {data.filter(u => !(u as any).isDeleted && u.abbreviation !== quickConv.fromAbbr).map(u => <option key={u.id} value={u.abbreviation}>{u.name} ({u.abbreviation})</option>)}
              </select>
            </FormField>
            {quickConv.fromAbbr && quickConv.toAbbr && quickConv.factor > 0 && (
              <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 text-sm font-medium text-center">
                1 {data.find(u => u.abbreviation === quickConv.fromAbbr)?.name} = <strong>{quickConv.factor}</strong> {data.find(u => u.abbreviation === quickConv.toAbbr)?.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowQuickConv(false); setQuickConv(emptyQuickConv); }}>{t("common.cancel")}</Button>
            <Button onClick={handleQuickConversion} disabled={!quickConv.fromAbbr || !quickConv.toAbbr || quickConv.factor <= 0}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}