import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/fake-api';
import type { Product, Category, ProductUnit } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Package, Eye, LayoutGrid, List, Copy, Upload, Download, Barcode, Edit, Trash2, ChevronLeft, ChevronRight, History, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SegmentBadge } from '@/components/StatusBadges';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ExportDialog, ExportColumn } from '@/components/ExportDialog';
import { toast } from 'sonner';

const PAGE_SIZE = 8;

const PREDEFINED_BASE_UNITS = [
  { value: 'piece', label: { en: 'Piece', fr: 'Pièce', ar: 'قطعة' } },
  { value: 'kg', label: { en: 'Kilogram', fr: 'Kilogramme', ar: 'كيلوغرام' } },
  { value: 'litre', label: { en: 'Litre', fr: 'Litre', ar: 'لتر' } },
  { value: 'bottle', label: { en: 'Bottle', fr: 'Bouteille', ar: 'زجاجة' } },
  { value: 'bag', label: { en: 'Bag', fr: 'Sac', ar: 'كيس' } },
  { value: 'carton', label: { en: 'Carton', fr: 'Carton', ar: 'كرتون' } },
  { value: 'palette', label: { en: 'Palette', fr: 'Palette', ar: 'لوح' } },
  { value: 'can', label: { en: 'Can', fr: 'Boîte', ar: 'علبة' } },
  { value: 'brick', label: { en: 'Brick', fr: 'Brique', ar: 'طوب' } },
  { value: 'sachet', label: { en: 'Sachet', fr: 'Sachet', ar: 'كيس صغير' } },
];

function generateBarcode(sku: string) {
  return `200${sku.replace(/[^0-9]/g, '').padEnd(9, '0').slice(0, 9)}0`;
}

interface UnitFormEntry {
  tempId: string;
  name: string;
  conversionToBase: number;
}

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'name', label: 'Name', defaultSelected: true },
  { key: 'sku', label: 'SKU', defaultSelected: true },
  { key: 'category', label: 'Category', defaultSelected: true },
  { key: 'baseUnit', label: 'Base Unit', defaultSelected: true },
  { key: 'stockBase', label: 'Stock', defaultSelected: true },
  { key: 'isActive', label: 'Active', defaultSelected: true },
  { key: 'units', label: 'Units', defaultSelected: false },
  { key: 'createdAt', label: 'Created', defaultSelected: false },
];

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'en') as 'en' | 'fr' | 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState<Product | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<Product | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBaseUnit, setFormBaseUnit] = useState('piece');
  const [formActive, setFormActive] = useState(true);
  const [formUnits, setFormUnits] = useState<UnitFormEntry[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitConversion, setNewUnitConversion] = useState('');

  const load = async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    setProducts(p); setCategories(c); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
    return matchSearch && matchCategory && matchStatus;
  }), [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter]);

  const getBaseUnitLabel = (value: string) => {
    const found = PREDEFINED_BASE_UNITS.find(u => u.value === value);
    return found ? found.label[lang] || found.label.en : value;
  };

  const resetForm = () => {
    setFormName(''); setFormSku(''); setFormCategory(''); setFormBaseUnit('piece');
    setFormActive(true); setEditProduct(null); setFormUnits([]);
    setNewUnitName(''); setNewUnitConversion('');
  };

  const openEditForm = (p: Product) => {
    setFormName(p.name); setFormSku(p.sku); setFormCategory(p.category);
    setFormBaseUnit(p.baseUnit); setFormActive(p.isActive);
    setFormUnits(p.units.filter(u => u.conversionToBase > 1).map(u => ({
      tempId: u.id, name: u.name, conversionToBase: u.conversionToBase,
    })));
    setEditProduct(p);
    setShowAddSheet(true);
  };

  const addUnit = () => {
    if (!newUnitName.trim() || !newUnitConversion) return;
    const conv = parseFloat(newUnitConversion);
    if (isNaN(conv) || conv <= 1) { toast.error(t('products.conversionMustBeGreaterThan1')); return; }
    setFormUnits(prev => [...prev, { tempId: `tu${Date.now()}`, name: newUnitName.trim(), conversionToBase: conv }]);
    setNewUnitName(''); setNewUnitConversion('');
  };

  const removeUnit = (tempId: string) => {
    setFormUnits(prev => prev.filter(u => u.tempId !== tempId));
  };

  const buildUnits = (): ProductUnit[] => {
    const baseLabel = getBaseUnitLabel(formBaseUnit);
    const base: ProductUnit = { id: `u${Date.now()}`, name: baseLabel, conversionToBase: 1 };
    const extra: ProductUnit[] = formUnits.map(u => ({
      id: u.tempId.startsWith('tu') ? `u${Date.now()}_${Math.random().toString(36).slice(2, 6)}` : u.tempId,
      name: u.name, conversionToBase: u.conversionToBase,
    }));
    return [base, ...extra];
  };

  const handleSave = async () => {
    if (!formName.trim() || !formSku.trim()) { toast.error(t('common.error')); return; }
    setSaving(true);
    try {
      const units = buildUnits();
      if (editProduct) {
        await updateProduct(editProduct.id, {
          name: formName, sku: formSku, category: formCategory || editProduct.category,
          baseUnit: formBaseUnit, isActive: formActive, units,
        });
        toast.success(t('products.productUpdated'));
      } else {
        await createProduct({
          name: formName, sku: formSku, category: formCategory || 'Basics',
          baseUnit: formBaseUnit, units, pricingRules: [], stockBase: 0,
          isActive: formActive,
        });
        toast.success(t('products.productAdded'));
      }
      await load();
      setShowAddSheet(false); resetForm();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(t('products.productDeleted'));
      await load();
    } catch (e: any) { toast.error(e.message); }
    setDeleteTarget(null);
  };

  const handleDuplicate = async (p: Product) => {
    await createProduct({
      name: `${p.name} (${t('common.copy') || 'copie'})`,
      sku: `${p.sku}-DUP`, category: p.category, baseUnit: p.baseUnit,
      units: p.units, pricingRules: p.pricingRules, stockBase: 0,
      isActive: p.isActive,
    });
    toast.success(t('products.productDuplicated'));
    await load();
  };

  const handleToggleActive = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive });
    await load();
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1).filter(l => l.trim());
      let count = 0;
      for (const line of lines) {
        const [name, sku, category, baseUnit] = line.split(',').map(s => s.replace(/"/g, '').trim());
        if (!name || !sku) continue;
        await createProduct({
          name, sku, category: category || 'Basics', baseUnit: baseUnit || 'piece',
          units: [{ id: `u${Date.now()}_${count}`, name: getBaseUnitLabel(baseUnit || 'piece'), conversionToBase: 1 }],
          pricingRules: [], stockBase: 0, isActive: true,
        });
        count++;
      }
      toast.success(`${count} ${t('products.imported')}`);
      await load();
      setShowImportDialog(false);
    };
    reader.readAsText(file);
  };

  const exportData = useMemo(() => filtered.map(p => ({
    name: p.name, sku: p.sku, category: p.category, baseUnit: getBaseUnitLabel(p.baseUnit),
    stockBase: p.stockBase, isActive: p.isActive ? t('common.active') : t('common.inactive'),
    units: p.units.map(u => u.name).join(', '), createdAt: p.createdAt,
  })), [filtered, lang]);

  // Mock price history
  const priceHistory = showPriceHistory ? showPriceHistory.pricingRules.flatMap(r => [
    { date: '2024-01-01', segment: r.segment, unit: r.unitName, price: r.price, change: 0 },
    { date: '2024-06-01', segment: r.segment, unit: r.unitName, price: Math.round(r.price * 0.95), change: -5 },
    { date: '2024-09-01', segment: r.segment, unit: r.unitName, price: r.price, change: 5.3 },
  ]) : [];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('products.productCatalog')}</h1>
          <p className="text-sm text-muted-foreground">{t('products.manageProducts')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)} className="gap-1">
            <Download className="h-3.5 w-3.5" />{t('common.export')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="gap-1">
            <Upload className="h-3.5 w-3.5" />{t('common.import')}
          </Button>
          <Button className="gap-2" onClick={() => { resetForm(); setShowAddSheet(true); }}>
            <Plus className="h-4 w-4" />{t('products.addProduct')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('products.searchProducts')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-lg p-0.5">
              <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('table')}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="text-muted-foreground">{filtered.length} {t('nav.products').toLowerCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('products.productName')}</TableHead>
                  <TableHead>{t('products.sku')}</TableHead>
                  <TableHead>{t('products.category')}</TableHead>
                  <TableHead>{t('products.units')}</TableHead>
                  <TableHead>{t('products.stockBase')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-end">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-9 w-9 rounded-lg object-cover" /> : <Package className="h-4 w-4 text-accent" />}
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {p.units.map(u => <Badge key={u.id} variant="outline" className="text-xs">{u.name}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{p.stockBase.toLocaleString()} {getBaseUnitLabel(p.baseUnit)}</TableCell>
                    <TableCell>
                      <Switch checked={p.isActive} onCheckedChange={() => handleToggleActive(p)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedProduct(p)} title={t('common.details')}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(p)} title={t('common.edit')}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(p)} title={t('products.duplicate')}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowBarcodeDialog(p)} title={t('products.barcode')}>
                          <Barcode className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPriceHistory(p)} title={t('products.priceHistory')}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p)} title={t('common.delete')}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map(p => (
                <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProduct(p)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{p.sku}</p>
                      </div>
                      <Badge variant="outline" className={p.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                        {p.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.category}</span>
                      <span className="font-medium">{p.stockBase.toLocaleString()} {getBaseUnitLabel(p.baseUnit)}</span>
                    </div>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {p.units.map(u => <Badge key={u.id} variant="outline" className="text-xs">{u.name}</Badge>)}
                    </div>
                    <div className="mt-3 flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditForm(p); }}>
                        <Edit className="h-3 w-3 me-1" />{t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDuplicate(p); }}>
                        <Copy className="h-3 w-3 me-1" />{t('products.duplicate')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <Sheet open={showAddSheet} onOpenChange={(open) => { setShowAddSheet(open); if (!open) resetForm(); }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{editProduct ? t('common.edit') : t('products.addProduct')}</SheetTitle></SheetHeader>
          <div className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>{t('products.productName')} *</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Couscous Fin 1kg" />
            </div>
            <div className="space-y-2">
              <Label>{t('products.sku')} *</Label>
              <Input value={formSku} onChange={e => setFormSku(e.target.value)} placeholder="e.g. CSC-001" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>{t('products.category')}</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue placeholder={t('products.category')} /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.isActive).map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Base Unit Select */}
            <div className="space-y-2">
              <Label>{t('products.baseUnit')}</Label>
              <Select value={formBaseUnit} onValueChange={setFormBaseUnit} disabled={!!editProduct && (editProduct.stockBase > 0)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PREDEFINED_BASE_UNITS.map(u => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label[lang] || u.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editProduct && editProduct.stockBase > 0 && (
                <p className="text-xs text-muted-foreground">{t('products.baseUnitLocked')}</p>
              )}
            </div>

            {/* Dynamic Units Management */}
            <div className="space-y-3">
              <Label>{t('products.secondaryUnits')}</Label>
              {formUnits.length > 0 && (
                <div className="space-y-2">
                  {formUnits.map(u => (
                    <div key={u.tempId} className="flex items-center gap-2 rounded-md border p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">= {u.conversionToBase} {getBaseUnitLabel(formBaseUnit)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeUnit(u.tempId)}>
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder={t('products.unitNamePlaceholder')} className="flex-1" />
                <Input value={newUnitConversion} onChange={e => setNewUnitConversion(e.target.value)} type="number" min="2" step="1" placeholder={`= ? ${getBaseUnitLabel(formBaseUnit)}`} className="w-28" />
                <Button variant="outline" size="icon" onClick={addUnit} disabled={!newUnitName.trim() || !newUnitConversion}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('products.unitHint')}</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>{t('common.active')}</Label>
            </div>

            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">{t('products.uploadImage')}</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG — max 2 Mo</p>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? t('common.loading') : editProduct ? t('common.save') : t('products.addProduct')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && <ProductDetailDialog product={selectedProduct} t={t} getBaseUnitLabel={getBaseUnitLabel} />}
        </DialogContent>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={!!showBarcodeDialog} onOpenChange={(open) => { if (!open) setShowBarcodeDialog(null); }}>
        <DialogContent className="max-w-sm">
          {showBarcodeDialog && (
            <>
              <DialogHeader><DialogTitle>{t('products.barcode')} — {showBarcodeDialog.sku}</DialogTitle></DialogHeader>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex gap-px items-end h-16">
                    {generateBarcode(showBarcodeDialog.sku).split('').map((d, i) => (
                      <div key={i} className="bg-black" style={{ width: parseInt(d) % 2 === 0 ? 2 : 3, height: 48 + (parseInt(d) * 2) }} />
                    ))}
                  </div>
                  <p className="text-center font-mono text-xs mt-2">{generateBarcode(showBarcodeDialog.sku)}</p>
                </div>
                <p className="text-sm text-muted-foreground">{showBarcodeDialog.name}</p>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generateBarcode(showBarcodeDialog.sku)); toast.success(t('products.barcodeCopied')); }}>
                  {t('products.copyBarcode')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Price History Dialog */}
      <Dialog open={!!showPriceHistory} onOpenChange={(open) => { if (!open) setShowPriceHistory(null); }}>
        <DialogContent className="max-w-lg">
          {showPriceHistory && (
            <>
              <DialogHeader><DialogTitle>{t('products.priceHistory')} — {showPriceHistory.name}</DialogTitle></DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('products.segment')}</TableHead>
                    <TableHead>{t('products.unit')}</TableHead>
                    <TableHead>{t('products.price')}</TableHead>
                    <TableHead>{t('products.variation')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{h.date}</TableCell>
                      <TableCell><SegmentBadge segment={h.segment as any} /></TableCell>
                      <TableCell className="text-xs">{h.unit}</TableCell>
                      <TableCell className="font-medium">{(h.price / 100).toFixed(2)} DZD</TableCell>
                      <TableCell>
                        {h.change === 0 ? <Badge variant="outline">—</Badge> :
                          <Badge variant="outline" className={h.change > 0 ? 'text-destructive' : 'text-success'}>
                            {h.change > 0 ? '+' : ''}{h.change}%
                          </Badge>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('products.importCSV')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('products.importFormat')}</p>
            <Input type="file" accept=".csv" onChange={e => { if (e.target.files?.[0]) handleImportCSV(e.target.files[0]); }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title={t('products.exportProducts')}
        columns={EXPORT_COLUMNS}
        data={exportData}
        filename="products"
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={t('common.areYouSure')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ProductDetailDialog({ product: p, t, getBaseUnitLabel }: { product: Product; t: (key: string, opts?: Record<string, unknown>) => string; getBaseUnitLabel: (v: string) => string }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          {p.name}
          <Badge variant="outline" className="ms-2 font-mono text-xs">{p.sku}</Badge>
        </DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="units" className="mt-4">
        <TabsList>
          <TabsTrigger value="units">{t('products.units')}</TabsTrigger>
          <TabsTrigger value="pricing">{t('products.pricingRules')}</TabsTrigger>
          <TabsTrigger value="stock">{t('products.stock')}</TabsTrigger>
        </TabsList>
        <TabsContent value="units" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">{t('products.baseUnit')}: <span className="font-medium text-foreground">{getBaseUnitLabel(p.baseUnit)}</span></p>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t('products.unitName')}</TableHead>
              <TableHead>= {t('products.baseUnits')}</TableHead>
              <TableHead>{t('products.currentStock')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {p.units.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.conversionToBase} {getBaseUnitLabel(p.baseUnit)}{u.conversionToBase > 1 ? 's' : ''}</TableCell>
                  <TableCell>{Math.floor(p.stockBase / u.conversionToBase).toLocaleString()} {u.name.toLowerCase()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="pricing" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('products.dynamicPricing')}</p>
            <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {t('products.addRule')}</Button>
          </div>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t('products.segment')}</TableHead>
              <TableHead>{t('products.unit')}</TableHead>
              <TableHead>{t('products.price')}</TableHead>
              <TableHead>{t('products.effectiveFrom')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {p.pricingRules.map(r => (
                <TableRow key={r.id}>
                  <TableCell><SegmentBadge segment={r.segment} /></TableCell>
                  <TableCell>{r.unitName}</TableCell>
                  <TableCell className="font-bold">{(r.price / 100).toFixed(2)} DZD</TableCell>
                  <TableCell className="text-muted-foreground">{r.effectiveFrom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="stock" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('products.totalStockBase')}</p>
              <p className="text-2xl font-bold">{p.stockBase.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{getBaseUnitLabel(p.baseUnit)}</p>
            </div>
            {p.units.filter(u => u.conversionToBase > 1).map(u => (
              <div key={u.id} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t('products.inUnits', { unit: u.name })}</p>
                <p className="text-2xl font-bold">{Math.floor(p.stockBase / u.conversionToBase).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{u.name}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}