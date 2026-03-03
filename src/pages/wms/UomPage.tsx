import { useState, useMemo } from "react";
import { Ruler, Plus, Pencil, Trash2, Search, AlertTriangle, Download, Upload } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { UnitOfMeasure } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import { exportToCSV, type ExportColumn } from "@/lib/exportUtils";

const empty: Omit<UnitOfMeasure, "id"> = { name: "", abbreviation: "", type: "Count", unitKind: "PHYSICAL" };

export default function UomPage() {
  const { unitsOfMeasure: data, setUnitsOfMeasure: setData, products } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<UnitOfMeasure | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState("");

  const filtered = useMemo(() => data.filter(u => {
    if (filterType !== "all" && u.type !== filterType) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.abbreviation.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search, filterType]);

  /** UOM-IMP-02: Count products using each UoM */
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

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (u: UnitOfMeasure) => { setEditing(u); setForm({ name: u.name, abbreviation: u.abbreviation, type: u.type, unitKind: u.unitKind, baseUnit: u.baseUnit, conversionFactor: u.conversionFactor }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.abbreviation) return;
    if (form.baseUnit && (!form.conversionFactor || form.conversionFactor <= 0)) {
      toast({ title: "Erreur de validation", description: "Le facteur de conversion doit être supérieur à 0.", variant: "destructive" });
      return;
    }
    const duplicate = data.find(u => u.abbreviation.toLowerCase() === form.abbreviation.toLowerCase() && u.id !== editing?.id);
    if (duplicate) {
      toast({ title: "Abréviation en doublon", description: `"${form.abbreviation}" est déjà utilisée par ${duplicate.name}.`, variant: "destructive" });
      return;
    }
    if (editing) {
      setData(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
      toast({ title: "UDM modifiée", description: form.name });
    } else {
      setData(prev => [...prev, { id: `UOM-${String(prev.length + 1).padStart(3, "0")}`, ...form }]);
      toast({ title: "UDM créée", description: form.name });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const { blocked } = getDeleteBlockers(deleteConfirm);
    if (blocked) return;
    setData(prev => prev.filter(u => u.id !== deleteConfirm.id));
    toast({ title: "UDM supprimée" }); setDeleteConfirm(null);
  };

  const baseUoms = data.filter(u => !u.baseUnit);

  /* ── UOM-IMP-03: CSV Export ── */
  const handleExportCSV = () => {
    const cols: ExportColumn<UnitOfMeasure>[] = [
      { key: "abbreviation", label: "Abréviation" },
      { key: "name", label: "Nom" },
      { key: "type", label: "Type" },
      { key: "baseUnit", label: "UDM de base" },
      { key: "conversionFactor", label: "Facteur" },
    ];
    exportToCSV(filtered, cols, "unites-de-mesure");
    toast({ title: "Export CSV", description: `${filtered.length} UDM exportées.` });
  };

  /* ── UOM-IMP-03: CSV Import ── */
  const handleImportCSV = () => {
    const lines = importText.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) {
      toast({ title: "Fichier vide", description: "Le CSV doit avoir un en-tête + au moins 1 ligne.", variant: "destructive" });
      return;
    }

    const header = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
    const abbrIdx = header.findIndex(h => h.includes("abrév") || h.includes("abbreviation") || h === "abbr");
    const nameIdx = header.findIndex(h => h === "nom" || h === "name");
    const typeIdx = header.findIndex(h => h === "type");
    const baseIdx = header.findIndex(h => h.includes("base"));
    const factorIdx = header.findIndex(h => h.includes("facteur") || h.includes("factor"));

    if (abbrIdx === -1 || nameIdx === -1) {
      toast({ title: "Format invalide", description: "Colonnes 'Abréviation' et 'Nom' requises.", variant: "destructive" });
      return;
    }

    const validTypes = ["Weight", "Volume", "Count", "Length", "Area"];
    let imported = 0;
    let skipped = 0;
    const newUoms: UnitOfMeasure[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.replace(/"/g, "").trim());
      const abbr = cols[abbrIdx];
      const name = cols[nameIdx];
      if (!abbr || !name) { skipped++; continue; }

      // Skip duplicates
      if (data.some(u => u.abbreviation.toLowerCase() === abbr.toLowerCase()) || newUoms.some(u => u.abbreviation.toLowerCase() === abbr.toLowerCase())) {
        skipped++;
        continue;
      }

      const type = (typeIdx >= 0 && validTypes.includes(cols[typeIdx])) ? cols[typeIdx] as UnitOfMeasure["type"] : "Count";
      const baseUnit = baseIdx >= 0 ? cols[baseIdx] || undefined : undefined;
      const conversionFactor = factorIdx >= 0 ? (parseFloat(cols[factorIdx]) || undefined) : undefined;

      newUoms.push({ id: `UOM-IMP-${Date.now()}-${i}`, name, abbreviation: abbr, type, unitKind: "PHYSICAL", baseUnit, conversionFactor });
      imported++;
    }

    if (newUoms.length > 0) {
      setData(prev => [...prev, ...newUoms]);
    }
    toast({ title: "Import terminé", description: `${imported} ajoutée(s), ${skipped} ignorée(s).` });
    setShowImportDialog(false);
    setImportText("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Ruler className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">Unités de mesure</h1><p className="text-sm text-muted-foreground">{data.length} UDM configurées</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle UDM</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous types</option>
          <option value="Weight">Poids</option><option value="Volume">Volume</option><option value="Count">Unité</option><option value="Length">Longueur</option><option value="Area">Surface</option>
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Abrév.</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">UDM de base</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Facteur</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Produits</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
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
                    <span className={`inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-semibold ${
                      prodCount > 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      {prodCount}
                    </span>
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
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">Aucune UDM trouvée.</div>}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Modifier l'UDM" : "Nouvelle UDM"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Nom" required><input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
            <FormField label="Abréviation" required><input className={formInputClass} value={form.abbreviation} onChange={e => setForm({ ...form, abbreviation: e.target.value })} /></FormField>
            <FormField label="Type">
              <select className={formSelectClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as UnitOfMeasure["type"] })}>
                <option value="Weight">Poids</option><option value="Volume">Volume</option><option value="Count">Unité</option><option value="Length">Longueur</option><option value="Area">Surface</option>
              </select>
            </FormField>
            <FormField label="UDM de base (optionnel)">
              <select className={formSelectClass} value={form.baseUnit ?? ""} onChange={e => setForm({ ...form, baseUnit: e.target.value || undefined })}>
                <option value="">Aucune (UDM de base)</option>
                {baseUoms.map(b => <option key={b.id} value={b.abbreviation}>{b.name} ({b.abbreviation})</option>)}
              </select>
            </FormField>
            {form.baseUnit && <FormField label="Facteur de conversion"><input type="number" step="0.001" className={formInputClass} value={form.conversionFactor ?? ""} onChange={e => setForm({ ...form, conversionFactor: +e.target.value || undefined })} /></FormField>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.abbreviation}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Supprimer l'UDM ?</DialogTitle></DialogHeader>
          {deleteConfirm && (() => {
            const { usedByProducts, derivedUoms, blocked } = getDeleteBlockers(deleteConfirm);
            return (
              <div className="space-y-3">
                {blocked ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                      <AlertTriangle className="h-4 w-4" /> Suppression impossible
                    </div>
                    {usedByProducts.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <strong>{usedByProducts.length}</strong> produit{usedByProducts.length > 1 ? "s" : ""} utilise{usedByProducts.length > 1 ? "nt" : ""} cette UDM :{" "}
                        <span className="font-mono text-xs">{usedByProducts.slice(0, 5).map(p => p.sku).join(", ")}{usedByProducts.length > 5 ? "…" : ""}</span>
                      </p>
                    )}
                    {derivedUoms.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <strong>{derivedUoms.length}</strong> UDM dérivée{derivedUoms.length > 1 ? "s" : ""} :{" "}
                        <span className="font-mono text-xs">{derivedUoms.map(u => u.abbreviation).join(", ")}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Supprimer <strong>{deleteConfirm.name}</strong> ?</p>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {deleteConfirm && getDeleteBlockers(deleteConfirm).blocked ? "Fermer" : "Annuler"}
            </Button>
            {deleteConfirm && !getDeleteBlockers(deleteConfirm).blocked && (
              <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Importer des UDM (CSV)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Collez le contenu CSV ci-dessous. Colonnes attendues : <strong>Abréviation, Nom, Type, UDM de base, Facteur</strong>.
              Les doublons d'abréviation seront ignorés.
            </p>
            <textarea
              className="w-full h-40 rounded-lg border border-input bg-muted/50 p-3 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder={`"Abréviation","Nom","Type","UDM de base","Facteur"\n"PCE","Pièce","Count","",""\n"DZ","Douzaine","Count","PCE","12"`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportText(""); }}>Annuler</Button>
            <Button onClick={handleImportCSV} disabled={!importText.trim()}>Importer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
