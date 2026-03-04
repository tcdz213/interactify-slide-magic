import { useState, useMemo } from "react";
import { FolderTree, Plus, Pencil, Trash2, Search, AlertTriangle, Download, Upload, RotateCcw, ChevronRight, ChevronDown, Building2, Layers } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { Sector, ProductCategory, SubCategory } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { exportToCSV, type ExportColumn } from "@/lib/exportUtils";
import { Badge } from "@/components/ui/badge";

type EditTarget = 
  | { level: "sector"; data: Sector }
  | { level: "category"; data: ProductCategory }
  | { level: "subcategory"; data: SubCategory };

export default function CategoriesPage() {
  const {
    sectors, setSectors,
    productCategories: categories, setProductCategories: setCategories,
    subCategories, setSubCategories,
    products, setProducts,
  } = useWMSData();

  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState<string>("all");
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set(sectors.map(s => s.id)));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Dialogs
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  // Sector form
  const [sectorForm, setSectorForm] = useState<{ name: string; code: string; description: string; icon: string; status: "Active" | "Inactive" }>({ name: "", code: "", description: "", icon: "📦", status: "Active" });
  // Category form
  const [catForm, setCatForm] = useState<{ name: string; code: string; sectorId: string; description: string; status: "Active" | "Inactive" }>({ name: "", code: "", sectorId: "", description: "", status: "Active" });
  // SubCategory form
  const [subForm, setSubForm] = useState<{ name: string; categoryId: string; status: "Active" | "Inactive" }>({ name: "", categoryId: "", status: "Active" });

  const [deleteConfirm, setDeleteConfirm] = useState<EditTarget | null>(null);

  // Counts
  const productCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach(c => {
      map.set(c.id, products.filter(p => p.category === c.name && !p.isDeleted).length);
    });
    return map;
  }, [categories, products]);

  const categoryCountBySector = useMemo(() => {
    const map = new Map<string, number>();
    sectors.forEach(s => {
      map.set(s.id, categories.filter(c => c.sectorId === s.id && !c.isDeleted).length);
    });
    return map;
  }, [sectors, categories]);

  const subCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach(c => {
      map.set(c.id, subCategories.filter(sc => sc.categoryId === c.id && !sc.isDeleted).length);
    });
    return map;
  }, [categories, subCategories]);

  const productCountBySector = useMemo(() => {
    const map = new Map<string, number>();
    sectors.forEach(s => {
      const sectorCats = categories.filter(c => c.sectorId === s.id);
      const count = sectorCats.reduce((sum, c) => sum + (productCountByCategory.get(c.id) ?? 0), 0);
      map.set(s.id, count);
    });
    return map;
  }, [sectors, categories, productCountByCategory]);

  // Filtered tree
  const filteredSectors = useMemo(() => {
    let result = sectors.filter(s => s.status === "Active");
    if (filterSector !== "all") result = result.filter(s => s.id === filterSector);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => {
        if (s.name.toLowerCase().includes(q)) return true;
        const cats = categories.filter(c => c.sectorId === s.id);
        return cats.some(c => c.name.toLowerCase().includes(q)) ||
          subCategories.some(sc => cats.some(c => c.id === sc.categoryId) && sc.name.toLowerCase().includes(q));
      });
    }
    return result;
  }, [sectors, categories, subCategories, filterSector, search]);

  const toggleSector = (id: string) => {
    setExpandedSectors(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // CRUD Handlers
  const openCreateSector = () => {
    setEditTarget(null);
    setSectorForm({ name: "", code: "", description: "", icon: "📦", status: "Active" });
    setShowSectorForm(true);
  };
  const openEditSector = (s: Sector) => {
    setEditTarget({ level: "sector", data: s });
    setSectorForm({ name: s.name, code: s.code, description: s.description, icon: s.icon, status: s.status });
    setShowSectorForm(true);
  };
  const saveSector = () => {
    if (!sectorForm.name || !sectorForm.code) return;
    if (editTarget?.level === "sector") {
      setSectors(prev => prev.map(s => s.id === editTarget.data.id ? { ...s, ...sectorForm } : s));
      toast({ title: "Secteur modifié", description: sectorForm.name });
    } else {
      setSectors(prev => [...prev, { id: `SEC-${Date.now()}`, color: "hsl(200, 50%, 50%)", ...sectorForm }]);
      toast({ title: "Secteur créé", description: sectorForm.name });
    }
    setShowSectorForm(false);
  };

  const openCreateCategory = (sectorId?: string) => {
    setEditTarget(null);
    setCatForm({ name: "", code: "", sectorId: sectorId || sectors[0]?.id || "", description: "", status: "Active" });
    setShowCategoryForm(true);
  };
  const openEditCategory = (c: ProductCategory) => {
    setEditTarget({ level: "category", data: c });
    setCatForm({ name: c.name, code: c.code, sectorId: c.sectorId, description: c.description, status: c.status });
    setShowCategoryForm(true);
  };
  const saveCategory = () => {
    if (!catForm.name || !catForm.code || !catForm.sectorId) return;
    if (editTarget?.level === "category") {
      const oldName = (editTarget.data as ProductCategory).name;
      setCategories(prev => prev.map(c => c.id === editTarget.data.id ? { ...c, ...catForm, productCount: c.productCount } : c));
      if (oldName !== catForm.name) {
        const count = products.filter(p => p.category === oldName).length;
        setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: catForm.name } : p));
        toast({ title: "Catégorie modifiée", description: `${catForm.name}. ${count} produit(s) mis à jour.` });
      } else {
        toast({ title: "Catégorie modifiée", description: catForm.name });
      }
    } else {
      setCategories(prev => [...prev, { id: `CAT-${Date.now()}`, ...catForm, productCount: 0 }]);
      toast({ title: "Catégorie créée", description: catForm.name });
    }
    setShowCategoryForm(false);
  };

  const openCreateSubCategory = (categoryId?: string) => {
    setEditTarget(null);
    setSubForm({ name: "", categoryId: categoryId || "", status: "Active" });
    setShowSubCategoryForm(true);
  };
  const openEditSubCategory = (sc: SubCategory) => {
    setEditTarget({ level: "subcategory", data: sc });
    setSubForm({ name: sc.name, categoryId: sc.categoryId, status: sc.status });
    setShowSubCategoryForm(true);
  };
  const saveSubCategory = () => {
    if (!subForm.name || !subForm.categoryId) return;
    if (editTarget?.level === "subcategory") {
      setSubCategories(prev => prev.map(sc => sc.id === editTarget.data.id ? { ...sc, ...subForm } : sc));
      toast({ title: "Sous-catégorie modifiée", description: subForm.name });
    } else {
      setSubCategories(prev => [...prev, { id: `SUB-${Date.now()}`, ...subForm }]);
      toast({ title: "Sous-catégorie créée", description: subForm.name });
    }
    setShowSubCategoryForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const { level, data } = deleteConfirm;
    if (level === "sector") {
      const catCount = categoryCountBySector.get(data.id) ?? 0;
      if (catCount > 0) {
        toast({ title: "Impossible", description: `Ce secteur contient ${catCount} catégorie(s). Supprimez-les d'abord.`, variant: "destructive" });
        setDeleteConfirm(null);
        return;
      }
      setSectors(prev => prev.filter(s => s.id !== data.id));
      toast({ title: "Secteur supprimé" });
    } else if (level === "category") {
      const prodCount = productCountByCategory.get(data.id) ?? 0;
      if (prodCount > 0) {
        toast({ title: "Impossible", description: `Cette catégorie contient ${prodCount} produit(s). Réassignez-les d'abord.`, variant: "destructive" });
        setDeleteConfirm(null);
        return;
      }
      setSubCategories(prev => prev.filter(sc => sc.categoryId !== data.id));
      setCategories(prev => prev.map(c => c.id === data.id ? { ...c, isDeleted: true, status: "Inactive" as const } : c));
      toast({ title: "Catégorie archivée" });
    } else {
      setSubCategories(prev => prev.map(sc => sc.id === data.id ? { ...sc, isDeleted: true, status: "Inactive" as const } : sc));
      toast({ title: "Sous-catégorie archivée" });
    }
    setDeleteConfirm(null);
  };

  // Export
  const handleExportCSV = () => {
    const rows = categories.filter(c => !c.isDeleted).map(c => {
      const sector = sectors.find(s => s.id === c.sectorId);
      return { ...c, sectorName: sector?.name ?? "" };
    });
    const cols: ExportColumn<typeof rows[0]>[] = [
      { key: "code" as any, label: "Code" },
      { key: "sectorName" as any, label: "Secteur" },
      { key: "name", label: "Catégorie" },
      { key: "description", label: "Description" },
      { key: "status", label: "Statut" },
    ];
    exportToCSV(rows, cols as any, "categories-hierarchy");
    toast({ title: "Export CSV", description: `${rows.length} catégories exportées.` });
  };

  // Stats
  const totalSectors = sectors.filter(s => s.status === "Active").length;
  const totalCategories = categories.filter(c => !c.isDeleted).length;
  const totalSubCategories = subCategories.filter(sc => !sc.isDeleted).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FolderTree className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Architecture des Catégories</h1>
            <p className="text-sm text-muted-foreground">
              {totalSectors} secteurs · {totalCategories} catégories · {totalSubCategories} sous-catégories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={openCreateSector} className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Secteur
          </Button>
          <Button variant="outline" size="sm" onClick={() => openCreateCategory()} className="gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Catégorie
          </Button>
          <Button onClick={() => openCreateSubCategory()} className="gap-2">
            <Plus className="h-4 w-4" /> Sous-catégorie
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Secteurs</p>
          <p className="text-2xl font-bold mt-1">{totalSectors}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Catégories</p>
          <p className="text-2xl font-bold mt-1">{totalCategories}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Sous-catégories</p>
          <p className="text-2xl font-bold mt-1">{totalSubCategories}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Produits actifs</p>
          <p className="text-2xl font-bold mt-1">{products.filter(p => !p.isDeleted && p.isActive).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous les secteurs</option>
          {sectors.filter(s => s.status === "Active").map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
        </select>
        <Button variant="ghost" size="sm" onClick={() => setExpandedSectors(new Set(sectors.map(s => s.id)))}>Tout ouvrir</Button>
        <Button variant="ghost" size="sm" onClick={() => { setExpandedSectors(new Set()); setExpandedCategories(new Set()); }}>Tout fermer</Button>
      </div>

      {/* Tree View */}
      <div className="space-y-3">
        {filteredSectors.map(sector => {
          const sectorCats = categories.filter(c => c.sectorId === sector.id && !c.isDeleted);
          const isExpanded = expandedSectors.has(sector.id);
          const prodCount = productCountBySector.get(sector.id) ?? 0;

          return (
            <div key={sector.id} className="glass-card rounded-xl overflow-hidden">
              {/* Sector row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/30"
                onClick={() => toggleSector(sector.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <span className="text-xl">{sector.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{sector.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{sector.code}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sector.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{sectorCats.length} catégories</span>
                  <span>·</span>
                  <span>{prodCount} produits</span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={e => { e.stopPropagation(); openEditSector(sector); }} className="p-1.5 rounded-md hover:bg-muted" title="Modifier">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); openCreateCategory(sector.id); }} className="p-1.5 rounded-md hover:bg-primary/10 text-primary" title="Ajouter catégorie">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ level: "sector", data: sector }); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              {isExpanded && (
                <div className="bg-muted/10">
                  {sectorCats.length === 0 && (
                    <div className="px-12 py-4 text-sm text-muted-foreground italic">Aucune catégorie dans ce secteur</div>
                  )}
                  {sectorCats.map(cat => {
                    const catSubs = subCategories.filter(sc => sc.categoryId === cat.id && !sc.isDeleted);
                    const isCatExpanded = expandedCategories.has(cat.id);
                    const catProdCount = productCountByCategory.get(cat.id) ?? 0;

                    return (
                      <div key={cat.id}>
                        {/* Category row */}
                        <div
                          className="flex items-center gap-3 px-8 py-2.5 cursor-pointer hover:bg-muted/20 transition-colors border-b border-border/20"
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {catSubs.length > 0 ? (
                            isCatExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : <span className="w-3.5" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{cat.name}</span>
                              <Badge variant="secondary" className="text-[10px] font-mono">{cat.code}</Badge>
                              <StatusBadge status={cat.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{catSubs.length} sous-cat.</span>
                            <span>·</span>
                            <span className={catProdCount > 0 ? "font-semibold text-foreground" : ""}>{catProdCount} produits</span>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button onClick={e => { e.stopPropagation(); openEditCategory(cat); }} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                            <button onClick={e => { e.stopPropagation(); openCreateSubCategory(cat.id); }} className="p-1.5 rounded-md hover:bg-primary/10 text-primary"><Plus className="h-3 w-3" /></button>
                            <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ level: "category", data: cat }); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>

                        {/* Subcategories */}
                        {isCatExpanded && catSubs.length > 0 && (
                          <div className="bg-muted/5">
                            {catSubs.map(sc => (
                              <div key={sc.id} className="flex items-center gap-3 px-14 py-2 hover:bg-muted/15 transition-colors border-b border-border/10">
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                <span className="text-sm flex-1">{sc.name}</span>
                                <StatusBadge status={sc.status} />
                                <div className="flex items-center gap-1 ml-2">
                                  <button onClick={() => openEditSubCategory(sc)} className="p-1 rounded-md hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                                  <button onClick={() => setDeleteConfirm({ level: "subcategory", data: sc })} className="p-1 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filteredSectors.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">Aucun résultat trouvé.</div>
        )}
      </div>

      {/* Sector Form Dialog */}
      <Dialog open={showSectorForm} onOpenChange={setShowSectorForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editTarget?.level === "sector" ? "Modifier le secteur" : "Nouveau secteur"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Code" required><input className={formInputClass} placeholder="SEC-XX" value={sectorForm.code} onChange={e => setSectorForm({ ...sectorForm, code: e.target.value })} /></FormField>
            <FormField label="Nom" required><input className={formInputClass} value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })} /></FormField>
            <FormField label="Icône"><input className={formInputClass} value={sectorForm.icon} onChange={e => setSectorForm({ ...sectorForm, icon: e.target.value })} /></FormField>
            <FormField label="Description"><input className={formInputClass} value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })} /></FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectorForm(false)}>Annuler</Button>
            <Button onClick={saveSector} disabled={!sectorForm.name || !sectorForm.code}>
              {editTarget?.level === "sector" ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editTarget?.level === "category" ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Secteur" required>
              <select className={formSelectClass} value={catForm.sectorId} onChange={e => setCatForm({ ...catForm, sectorId: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {sectors.filter(s => s.status === "Active").map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Code" required><input className={formInputClass} placeholder="CEM-01" value={catForm.code} onChange={e => setCatForm({ ...catForm, code: e.target.value })} /></FormField>
            <FormField label="Nom" required><input className={formInputClass} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} /></FormField>
            <FormField label="Description"><input className={formInputClass} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} /></FormField>
            <FormField label="Statut">
              <select className={formSelectClass} value={catForm.status} onChange={e => setCatForm({ ...catForm, status: e.target.value as "Active" | "Inactive" })}>
                <option value="Active">Active</option><option value="Inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryForm(false)}>Annuler</Button>
            <Button onClick={saveCategory} disabled={!catForm.name || !catForm.code || !catForm.sectorId}>
              {editTarget?.level === "category" ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubCategory Form Dialog */}
      <Dialog open={showSubCategoryForm} onOpenChange={setShowSubCategoryForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editTarget?.level === "subcategory" ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Catégorie parente" required>
              <select className={formSelectClass} value={subForm.categoryId} onChange={e => setSubForm({ ...subForm, categoryId: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {categories.filter(c => !c.isDeleted).map(c => {
                  const sector = sectors.find(s => s.id === c.sectorId);
                  return <option key={c.id} value={c.id}>{sector?.icon} {c.name}</option>;
                })}
              </select>
            </FormField>
            <FormField label="Nom" required><input className={formInputClass} value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} /></FormField>
            <FormField label="Statut">
              <select className={formSelectClass} value={subForm.status} onChange={e => setSubForm({ ...subForm, status: e.target.value as "Active" | "Inactive" })}>
                <option value="Active">Active</option><option value="Inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubCategoryForm(false)}>Annuler</Button>
            <Button onClick={saveSubCategory} disabled={!subForm.name || !subForm.categoryId}>
              {editTarget?.level === "subcategory" ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          {deleteConfirm && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              <span>
                Supprimer {deleteConfirm.level === "sector" ? "le secteur" : deleteConfirm.level === "category" ? "la catégorie" : "la sous-catégorie"}{" "}
                <strong>"{deleteConfirm.data.name}"</strong> ?
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
