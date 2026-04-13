import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories } from '@/lib/fake-api';
import type { Product, Category } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Package, Eye, LayoutGrid, List, Copy, Upload, Download, Barcode, Edit, Trash2, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SegmentBadge } from '@/components/StatusBadges';
import { toast } from 'sonner';

const PAGE_SIZE = 8;

function generateBarcode(sku: string) {
  // Simple EAN-13 style visual
  return `200${sku.replace(/[^0-9]/g, '').padEnd(9, '0').slice(0, 9)}0`;
}

export default function ProductsPage() {
  const { t } = useTranslation();
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

  // Add form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBaseUnit, setFormBaseUnit] = useState('');
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    getProducts().then(setProducts);
    getCategories().then(setCategories);
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
    return matchSearch && matchCategory && matchStatus;
  }), [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter]);

  const resetForm = () => {
    setFormName(''); setFormSku(''); setFormCategory(''); setFormBaseUnit(''); setFormActive(true);
    setEditProduct(null);
  };

  const openEditForm = (p: Product) => {
    setFormName(p.name); setFormSku(p.sku); setFormCategory(p.category); setFormBaseUnit(p.baseUnit); setFormActive(p.isActive);
    setEditProduct(p);
    setShowAddSheet(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formSku.trim()) {
      toast.error(t('common.required'));
      return;
    }
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id
        ? { ...p, name: formName, sku: formSku, category: formCategory || p.category, baseUnit: formBaseUnit || p.baseUnit, isActive: formActive }
        : p
      ));
      toast.success(t('products.productUpdated') || 'Produit mis à jour');
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`, tenantId: 't1', name: formName, sku: formSku,
        category: formCategory || 'Basics', baseUnit: formBaseUnit || 'piece',
        units: [{ id: `u${Date.now()}`, name: 'Piece', conversionToBase: 1 }],
        pricingRules: [], stockBase: 0, isActive: formActive, createdAt: new Date().toISOString().split('T')[0],
      };
      setProducts(prev => [newProduct, ...prev]);
      toast.success(t('products.productAdded') || 'Produit ajouté');
    }
    setShowAddSheet(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success(t('products.productDeleted') || 'Produit supprimé');
  };

  const handleDuplicate = (p: Product) => {
    const dup: Product = {
      ...p,
      id: `p${Date.now()}`,
      name: `${p.name} (copie)`,
      sku: `${p.sku}-DUP`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [dup, ...prev]);
    toast.success(t('products.productDuplicated') || 'Produit dupliqué');
  };

  const handleToggleActive = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleExportCSV = () => {
    const header = 'Name,SKU,Category,BaseUnit,Stock,Active\n';
    const rows = products.map(p => `"${p.name}","${p.sku}","${p.category}","${p.baseUnit}",${p.stockBase},${p.isActive}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click();
    toast.success('CSV exporté');
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1).filter(l => l.trim());
      const imported: Product[] = lines.map((line, i) => {
        const [name, sku, category, baseUnit] = line.split(',').map(s => s.replace(/"/g, '').trim());
        return {
          id: `pimp${Date.now()}_${i}`, tenantId: 't1', name, sku, category: category || 'Basics',
          baseUnit: baseUnit || 'piece', units: [{ id: `u${Date.now()}_${i}`, name: 'Piece', conversionToBase: 1 }],
          pricingRules: [], stockBase: 0, isActive: true, createdAt: new Date().toISOString().split('T')[0],
        };
      });
      setProducts(prev => [...imported, ...prev]);
      toast.success(`${imported.length} produits importés`);
      setShowImportDialog(false);
    };
    reader.readAsText(file);
  };

  // Mock price history
  const priceHistory = showPriceHistory ? showPriceHistory.pricingRules.flatMap(r => [
    { date: '2024-01-01', segment: r.segment, unit: r.unitName, price: r.price, change: 0 },
    { date: '2024-06-01', segment: r.segment, unit: r.unitName, price: Math.round(r.price * 0.95), change: -5 },
    { date: '2024-09-01', segment: r.segment, unit: r.unitName, price: r.price, change: 5.3 },
  ]) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('products.productCatalog')}</h1>
          <p className="text-sm text-muted-foreground">{t('products.manageProducts')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1">
            <Download className="h-3.5 w-3.5" />{t('common.export') || 'Export'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="gap-1">
            <Upload className="h-3.5 w-3.5" />{t('common.import') || 'Import CSV'}
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
                    <TableCell className="font-medium">{p.stockBase.toLocaleString()} {p.baseUnit}s</TableCell>
                    <TableCell>
                      <Switch checked={p.isActive} onCheckedChange={() => handleToggleActive(p.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedProduct(p)} title={t('common.details')}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(p)} title={t('common.edit') || 'Modifier'}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(p)} title="Dupliquer">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowBarcodeDialog(p)} title="Code-barres">
                          <Barcode className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPriceHistory(p)} title="Historique prix">
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)} title={t('common.delete') || 'Supprimer'}>
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
                      <span className="font-medium">{p.stockBase.toLocaleString()} {p.baseUnit}s</span>
                    </div>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {p.units.map(u => <Badge key={u.id} variant="outline" className="text-xs">{u.name}</Badge>)}
                    </div>
                    <div className="mt-3 flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditForm(p); }}>
                        <Edit className="h-3 w-3 me-1" />{t('common.edit') || 'Modifier'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDuplicate(p); }}>
                        <Copy className="h-3 w-3 me-1" />Dupliquer
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
          <SheetHeader><SheetTitle>{editProduct ? (t('common.edit') || 'Modifier') : t('products.addProduct')}</SheetTitle></SheetHeader>
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
            <div className="space-y-2">
              <Label>{t('products.baseUnit')}</Label>
              <Input value={formBaseUnit} onChange={e => setFormBaseUnit(e.target.value)} placeholder="e.g. piece, bottle, bag" />
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
            <Button className="w-full" onClick={handleSave}>{editProduct ? (t('common.save') || 'Enregistrer') : t('products.addProduct')}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && <ProductDetailDialog product={selectedProduct} t={t} />}
        </DialogContent>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={!!showBarcodeDialog} onOpenChange={(open) => { if (!open) setShowBarcodeDialog(null); }}>
        <DialogContent className="max-w-sm">
          {showBarcodeDialog && (
            <>
              <DialogHeader><DialogTitle>Code-barres — {showBarcodeDialog.sku}</DialogTitle></DialogHeader>
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
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generateBarcode(showBarcodeDialog.sku)); toast.success('Code copié'); }}>
                  Copier le code
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
              <DialogHeader><DialogTitle>Historique des prix — {showPriceHistory.name}</DialogTitle></DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Variation</TableHead>
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
          <DialogHeader><DialogTitle>Importer des produits (CSV)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Format attendu : Name, SKU, Category, BaseUnit (une ligne par produit, avec en-tête).</p>
            <Input type="file" accept=".csv" onChange={e => { if (e.target.files?.[0]) handleImportCSV(e.target.files[0]); }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductDetailDialog({ product: p, t }: { product: Product; t: (key: string, opts?: Record<string, unknown>) => string }) {
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
          <p className="text-sm text-muted-foreground">{t('products.baseUnit')}: <span className="font-medium text-foreground">{p.baseUnit}</span></p>
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
                  <TableCell>{u.conversionToBase} {p.baseUnit}{u.conversionToBase > 1 ? 's' : ''}</TableCell>
                  <TableCell>{Math.floor(p.stockBase / u.conversionToBase).toLocaleString()} {u.name.toLowerCase()}s</TableCell>
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
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">{t('products.totalStockBase')}</p>
              <p className="text-2xl font-bold">{p.stockBase.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{p.baseUnit}s</p>
            </div>
            {p.units.filter(u => u.conversionToBase > 1).map(u => (
              <div key={u.id} className="stat-card">
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