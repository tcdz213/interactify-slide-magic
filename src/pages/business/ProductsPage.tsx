import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories, getCustomers, createProduct, updateProduct, deleteProduct, restoreProduct, getPriceHistory, addPriceHistoryEntry } from '@/lib/fake-api';
import type { Product, Category, ProductUnit, CustomerSpecificPrice, PriceHistoryEntry, Customer, CustomerSegment } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Package, Eye, LayoutGrid, List, Copy, Upload, Download, Barcode, Edit, Trash2, ChevronLeft, ChevronRight, History, X, RotateCcw, DollarSign, Users, ArrowUpDown, AlertTriangle } from 'lucide-react';
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
  { value: 'ton', label: { en: 'Ton', fr: 'Tonne', ar: 'طن' } },
  { value: 'litre', label: { en: 'Litre', fr: 'Litre', ar: 'لتر' } },
  { value: 'bottle', label: { en: 'Bottle', fr: 'Bouteille', ar: 'زجاجة' } },
  { value: 'bag', label: { en: 'Bag', fr: 'Sac', ar: 'كيس' } },
  { value: 'carton', label: { en: 'Carton', fr: 'Carton', ar: 'كرتون' } },
  { value: 'palette', label: { en: 'Palette', fr: 'Palette', ar: 'لوح' } },
  { value: 'can', label: { en: 'Can', fr: 'Boîte', ar: 'علبة' } },
  { value: 'brick', label: { en: 'Brick', fr: 'Brique', ar: 'طوب' } },
  { value: 'sachet', label: { en: 'Sachet', fr: 'Sachet', ar: 'كيس صغير' } },
  { value: 'meter', label: { en: 'Meter', fr: 'Mètre', ar: 'متر' } },
  { value: 'sqm', label: { en: 'Square Meter', fr: 'Mètre carré', ar: 'متر مربع' } },
];

const ALL_SEGMENTS: CustomerSegment[] = ['depot', 'wholesale', 'retail', 'small_trader', 'special_client'];

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
  { key: 'description', label: 'Description', defaultSelected: true },
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
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState<Product | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<Product | null>(null);
  const [priceHistoryData, setPriceHistoryData] = useState<PriceHistoryEntry[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBaseUnit, setFormBaseUnit] = useState('piece');
  const [formActive, setFormActive] = useState(true);
  const [formUnits, setFormUnits] = useState<UnitFormEntry[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitConversion, setNewUnitConversion] = useState('');

  // Customer-specific pricing form state
  const [showCustomerPriceDialog, setShowCustomerPriceDialog] = useState(false);
  const [cpProductId, setCpProductId] = useState('');
  const [cpCustomerId, setCpCustomerId] = useState('');
  const [cpUnitId, setCpUnitId] = useState('');
  const [cpPrice, setCpPrice] = useState('');
  const [cpFrom, setCpFrom] = useState(new Date().toISOString().split('T')[0]);
  const [cpTo, setCpTo] = useState('');

  const load = async () => {
    const [p, c, cust] = await Promise.all([getProducts(), getCategories(), getCustomers()]);
    setProducts(p); setCategories(c); setAllCustomers(cust); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => products.filter(p => {
    if (!showDeleted && p.isDeleted) return false;
    if (showDeleted && !p.isDeleted) return false;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
    const matchStock = stockFilter === 'all' ||
      (stockFilter === 'in_stock' && p.stockBase > 0) ||
      (stockFilter === 'out_of_stock' && p.stockBase === 0) ||
      (stockFilter === 'low_stock' && p.stockBase > 0 && p.stockBase < 100);
    return matchSearch && matchCategory && matchStatus && matchStock;
  }), [products, search, categoryFilter, statusFilter, stockFilter, showDeleted]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter, stockFilter, showDeleted]);

  const getBaseUnitLabel = (value: string) => {
    const found = PREDEFINED_BASE_UNITS.find(u => u.value === value);
    return found ? found.label[lang] || found.label.en : value;
  };

  const resetForm = () => {
    setFormName(''); setFormDescription(''); setFormSku(''); setFormCategory(''); setFormBaseUnit('piece');
    setFormActive(true); setEditProduct(null); setFormUnits([]);
    setNewUnitName(''); setNewUnitConversion('');
  };

  const openEditForm = (p: Product) => {
    setFormName(p.name); setFormDescription(p.description || ''); setFormSku(p.sku); setFormCategory(p.category);
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
          name: formName, description: formDescription, sku: formSku,
          category: formCategory || editProduct.category,
          baseUnit: formBaseUnit, isActive: formActive, units,
        });
        toast.success(t('products.productUpdated'));
      } else {
        await createProduct({
          name: formName, description: formDescription, sku: formSku,
          category: formCategory || 'Basics',
          baseUnit: formBaseUnit, units, pricingRules: [], customerPrices: [],
          stockBase: 0, isActive: formActive, isDeleted: false, updatedAt: new Date().toISOString().split('T')[0],
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
      await deleteProduct(deleteTarget.id, true);
      toast.success(t('products.productArchived'));
      await load();
    } catch (e: any) { toast.error(e.message); }
    setDeleteTarget(null);
  };

  const handleRestore = async (p: Product) => {
    await restoreProduct(p.id);
    toast.success(t('products.productRestored'));
    await load();
  };

  const handleDuplicate = async (p: Product) => {
    await createProduct({
      name: `${p.name} (${t('common.copy') || 'copie'})`,
      description: p.description, sku: `${p.sku}-DUP`, category: p.category, baseUnit: p.baseUnit,
      units: p.units, pricingRules: p.pricingRules, customerPrices: [],
      stockBase: 0, isActive: p.isActive, isDeleted: false, updatedAt: new Date().toISOString().split('T')[0],
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
        const [name, sku, category, baseUnit, description] = line.split(',').map(s => s.replace(/"/g, '').trim());
        if (!name || !sku) continue;
        await createProduct({
          name, description: description || '', sku, category: category || 'Basics', baseUnit: baseUnit || 'piece',
          units: [{ id: `u${Date.now()}_${count}`, name: getBaseUnitLabel(baseUnit || 'piece'), conversionToBase: 1 }],
          pricingRules: [], customerPrices: [], stockBase: 0, isActive: true, isDeleted: false,
          updatedAt: new Date().toISOString().split('T')[0],
        });
        count++;
      }
      toast.success(`${count} ${t('products.imported')}`);
      await load();
      setShowImportDialog(false);
    };
    reader.readAsText(file);
  };

  const openPriceHistory = async (p: Product) => {
    setShowPriceHistory(p);
    const history = await getPriceHistory(p.id);
    setPriceHistoryData(history);
  };

  // Customer-specific price save
  const handleSaveCustomerPrice = async () => {
    if (!cpProductId || !cpCustomerId || !cpUnitId || !cpPrice) { toast.error(t('common.error')); return; }
    const product = products.find(p => p.id === cpProductId);
    const customer = allCustomers.find(c => c.id === cpCustomerId);
    const unit = product?.units.find(u => u.id === cpUnitId);
    if (!product || !customer || !unit) return;

    const newCp: CustomerSpecificPrice = {
      id: `cp${Date.now()}`, customerId: cpCustomerId, customerName: customer.name,
      unitId: cpUnitId, unitName: unit.name, price: Math.round(parseFloat(cpPrice) * 100),
      effectiveFrom: cpFrom, effectiveTo: cpTo || undefined,
    };
    const updatedPrices = [...(product.customerPrices || []), newCp];
    await updateProduct(cpProductId, { customerPrices: updatedPrices });
    await addPriceHistoryEntry({
      productId: product.id, productName: product.name, customerId: cpCustomerId,
      customerName: customer.name, unitId: cpUnitId, unitName: unit.name,
      oldPrice: 0, newPrice: newCp.price, changedBy: 'Manager', reason: 'Prix client spécifique',
    });
    toast.success(t('products.customerPriceAdded'));
    await load();
    setShowCustomerPriceDialog(false);
    setCpProductId(''); setCpCustomerId(''); setCpUnitId(''); setCpPrice(''); setCpTo('');
  };

  const removeCustomerPrice = async (productId: string, cpId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const updatedPrices = product.customerPrices.filter(cp => cp.id !== cpId);
    await updateProduct(productId, { customerPrices: updatedPrices });
    toast.success(t('products.customerPriceRemoved'));
    await load();
    if (selectedProduct?.id === productId) {
      setSelectedProduct(products.find(p => p.id === productId) || null);
    }
  };

  const exportData = useMemo(() => filtered.map(p => ({
    name: p.name, sku: p.sku, category: p.category, description: p.description,
    baseUnit: getBaseUnitLabel(p.baseUnit), stockBase: p.stockBase,
    isActive: p.isActive ? t('common.active') : t('common.inactive'),
    units: p.units.map(u => u.name).join(', '), createdAt: p.createdAt,
  })), [filtered, lang]);

  const activeCount = products.filter(p => !p.isDeleted && p.isActive).length;
  const outOfStockCount = products.filter(p => !p.isDeleted && p.stockBase === 0).length;
  const deletedCount = products.filter(p => p.isDeleted).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{products.filter(p => !p.isDeleted).length}</p><p className="text-xs text-muted-foreground">{t('products.totalProducts')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Package className="h-5 w-5 text-success" /></div>
          <div><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">{t('common.active')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold">{outOfStockCount}</p><p className="text-xs text-muted-foreground">{t('products.outOfStock')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Trash2 className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold">{deletedCount}</p><p className="text-xs text-muted-foreground">{t('products.archived')}</p></div>
        </CardContent></Card>
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
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('products.allStock')}</SelectItem>
                <SelectItem value="in_stock">{t('products.inStock')}</SelectItem>
                <SelectItem value="out_of_stock">{t('products.outOfStock')}</SelectItem>
                <SelectItem value="low_stock">{t('products.lowStock')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={showDeleted} onCheckedChange={setShowDeleted} />
              <Label className="text-xs text-muted-foreground">{t('products.showArchived')}</Label>
            </div>
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
                  <TableRow key={p.id} className={p.isDeleted ? 'opacity-50 bg-muted/30' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-9 w-9 rounded-lg object-cover" /> : <Package className="h-4 w-4 text-accent" />}
                        </div>
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {p.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {p.units.map(u => <Badge key={u.id} variant="outline" className="text-xs">{u.name}{u.conversionToBase > 1 ? ` (=${u.conversionToBase})` : ''}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${p.stockBase === 0 ? 'text-destructive' : p.stockBase < 100 ? 'text-warning' : ''}`}>
                        {p.stockBase.toLocaleString()} {getBaseUnitLabel(p.baseUnit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.isDeleted ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{t('products.archived')}</Badge>
                      ) : (
                        <Switch checked={p.isActive} onCheckedChange={() => handleToggleActive(p)} />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {p.isDeleted ? (
                          <Button variant="ghost" size="sm" onClick={() => handleRestore(p)} className="gap-1">
                            <RotateCcw className="h-3.5 w-3.5" />{t('products.restore')}
                          </Button>
                        ) : (
                          <>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPriceHistory(p)} title={t('products.priceHistory')}>
                              <History className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p)} title={t('common.delete')}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map(p => (
                <Card key={p.id} className={`hover:shadow-md transition-shadow cursor-pointer ${p.isDeleted ? 'opacity-50' : ''}`} onClick={() => !p.isDeleted && setSelectedProduct(p)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{p.sku}</p>
                        {p.description && <p className="text-xs text-muted-foreground truncate">{p.description}</p>}
                      </div>
                      <Badge variant="outline" className={p.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                        {p.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.category}</span>
                      <span className={`font-medium ${p.stockBase === 0 ? 'text-destructive' : ''}`}>{p.stockBase.toLocaleString()} {getBaseUnitLabel(p.baseUnit)}</span>
                    </div>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {p.units.map(u => <Badge key={u.id} variant="outline" className="text-xs">{u.name}</Badge>)}
                    </div>
                    {p.customerPrices.length > 0 && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-chart-5/10 text-chart-5 border-chart-5/20 text-xs">
                          <Users className="h-3 w-3 me-1" />{p.customerPrices.length} {t('products.specificPrices')}
                        </Badge>
                      </div>
                    )}
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
              <Label>{t('products.description')}</Label>
              <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder={t('products.descriptionPlaceholder')} rows={2} />
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedProduct && (
            <ProductDetailDialog
              product={selectedProduct}
              customers={allCustomers}
              t={t}
              getBaseUnitLabel={getBaseUnitLabel}
              onAddCustomerPrice={() => { setCpProductId(selectedProduct.id); setShowCustomerPriceDialog(true); }}
              onRemoveCustomerPrice={(cpId) => removeCustomerPrice(selectedProduct.id, cpId)}
              onViewPriceHistory={() => openPriceHistory(selectedProduct)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Customer-Specific Price Dialog */}
      <Dialog open={showCustomerPriceDialog} onOpenChange={setShowCustomerPriceDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('products.addCustomerPrice')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('customers.title')}</Label>
              <Select value={cpCustomerId} onValueChange={setCpCustomerId}>
                <SelectTrigger><SelectValue placeholder={t('products.selectCustomer')} /></SelectTrigger>
                <SelectContent>
                  {allCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.segment})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('products.unit')}</Label>
              <Select value={cpUnitId} onValueChange={setCpUnitId}>
                <SelectTrigger><SelectValue placeholder={t('products.unit')} /></SelectTrigger>
                <SelectContent>
                  {products.find(p => p.id === cpProductId)?.units.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('products.price')} (DZD)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={cpPrice} onChange={e => setCpPrice(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('products.effectiveFrom')}</Label>
                <Input type="date" value={cpFrom} onChange={e => setCpFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('pricing.effectiveTo')}</Label>
                <Input type="date" value={cpTo} onChange={e => setCpTo(e.target.value)} />
              </div>
            </div>
            <div className="rounded-lg bg-info/5 border border-info/20 p-3">
              <p className="text-xs text-info">{t('products.customerPricePriorityHint')}</p>
            </div>
            <Button className="w-full" onClick={handleSaveCustomerPrice}>{t('common.save')}</Button>
          </div>
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
        <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
          {showPriceHistory && (
            <>
              <DialogHeader><DialogTitle>{t('products.priceHistory')} — {showPriceHistory.name}</DialogTitle></DialogHeader>
              {priceHistoryData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('products.noPriceHistory')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('products.segment')}</TableHead>
                      <TableHead>{t('products.unit')}</TableHead>
                      <TableHead>{t('products.oldPrice')}</TableHead>
                      <TableHead>{t('products.newPrice')}</TableHead>
                      <TableHead>{t('products.changedBy')}</TableHead>
                      <TableHead>{t('products.reason')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistoryData.map(h => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs">{new Date(h.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>{h.segment ? <SegmentBadge segment={h.segment} /> : h.customerName || '—'}</TableCell>
                        <TableCell className="text-xs">{h.unitName}</TableCell>
                        <TableCell className="text-muted-foreground">{(h.oldPrice / 100).toFixed(2)} DZD</TableCell>
                        <TableCell className="font-medium">{(h.newPrice / 100).toFixed(2)} DZD</TableCell>
                        <TableCell className="text-xs">{h.changedBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{h.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
        description={t('products.softDeleteHint')}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ─── Product Detail with Pricing Tabs ───
function ProductDetailDialog({
  product: p, customers, t, getBaseUnitLabel, onAddCustomerPrice, onRemoveCustomerPrice, onViewPriceHistory,
}: {
  product: Product;
  customers: Customer[];
  t: (key: string, opts?: Record<string, unknown>) => string;
  getBaseUnitLabel: (v: string) => string;
  onAddCustomerPrice: () => void;
  onRemoveCustomerPrice: (cpId: string) => void;
  onViewPriceHistory: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          {p.name}
          <Badge variant="outline" className="ms-2 font-mono text-xs">{p.sku}</Badge>
        </DialogTitle>
        {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
      </DialogHeader>
      <Tabs defaultValue="units" className="mt-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="units">{t('products.units')}</TabsTrigger>
          <TabsTrigger value="segment_pricing">{t('products.segmentPricing')}</TabsTrigger>
          <TabsTrigger value="customer_pricing">{t('products.customerPricing')}</TabsTrigger>
          <TabsTrigger value="stock">{t('products.stock')}</TabsTrigger>
        </TabsList>

        {/* Units Tab */}
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
          <div className="rounded-lg bg-info/5 border border-info/20 p-3">
            <p className="text-xs text-info"><ArrowUpDown className="h-3 w-3 inline me-1" />{t('products.unitConversionNote')}</p>
          </div>
        </TabsContent>

        {/* Segment Pricing Tab */}
        <TabsContent value="segment_pricing" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('products.dynamicPricing')}</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={onViewPriceHistory}>
              <History className="h-3.5 w-3.5" /> {t('products.priceHistory')}
            </Button>
          </div>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t('products.segment')}</TableHead>
              <TableHead>{t('products.unit')}</TableHead>
              <TableHead>{t('products.costPrice')}</TableHead>
              <TableHead>{t('products.price')}</TableHead>
              <TableHead>{t('products.margin')}</TableHead>
              <TableHead>{t('products.effectiveFrom')}</TableHead>
              <TableHead>{t('products.promo')}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {p.pricingRules.map(r => {
                const margin = r.costPrice ? (((r.price - r.costPrice) / r.costPrice) * 100).toFixed(1) : null;
                const isExpired = r.effectiveTo && new Date(r.effectiveTo) < new Date();
                return (
                  <TableRow key={r.id} className={isExpired ? 'opacity-50' : ''}>
                    <TableCell><SegmentBadge segment={r.segment} /></TableCell>
                    <TableCell>{r.unitName}</TableCell>
                    <TableCell className="text-muted-foreground">{r.costPrice ? `${(r.costPrice / 100).toFixed(2)} DZD` : '—'}</TableCell>
                    <TableCell className="font-bold">{(r.price / 100).toFixed(2)} DZD</TableCell>
                    <TableCell>{margin ? <span className="text-success">+{margin}%</span> : '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{r.effectiveFrom}{r.effectiveTo ? ` → ${r.effectiveTo}` : ''}</TableCell>
                    <TableCell>
                      {r.isPromo && <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs">{r.promoLabel || 'Promo'}</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Customer-Specific Pricing Tab */}
        <TabsContent value="customer_pricing" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('products.customerSpecificPrices')}</p>
              <p className="text-xs text-muted-foreground">{t('products.customerPricePriority')}</p>
            </div>
            <Button size="sm" className="gap-1" onClick={onAddCustomerPrice}>
              <Plus className="h-3.5 w-3.5" /> {t('products.addCustomerPrice')}
            </Button>
          </div>
          {p.customerPrices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('products.noCustomerPrices')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('customers.title')}</TableHead>
                <TableHead>{t('products.unit')}</TableHead>
                <TableHead>{t('products.price')}</TableHead>
                <TableHead>{t('products.effectiveFrom')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {p.customerPrices.map(cp => (
                  <TableRow key={cp.id}>
                    <TableCell className="font-medium">{cp.customerName}</TableCell>
                    <TableCell>{cp.unitName}</TableCell>
                    <TableCell className="font-bold">{(cp.price / 100).toFixed(2)} DZD</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{cp.effectiveFrom}{cp.effectiveTo ? ` → ${cp.effectiveTo}` : ''}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onRemoveCustomerPrice(cp.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
            <p className="text-xs text-warning font-medium">{t('products.pricingPriorityExplainer')}</p>
          </div>
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('products.totalStockBase')}</p>
              <p className={`text-2xl font-bold ${p.stockBase === 0 ? 'text-destructive' : ''}`}>{p.stockBase.toLocaleString()}</p>
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
          <div className="mt-4 rounded-lg bg-info/5 border border-info/20 p-3">
            <p className="text-xs text-info">{t('products.stockConversionNote')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
