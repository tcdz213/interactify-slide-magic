import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '@/lib/fake-api';
import type { Product, PricingRule, CustomerSegment } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIWidget } from '@/components/KPIWidget';
import { SegmentBadge } from '@/components/StatusBadges';
import { Plus, Search, DollarSign, Tags, Calculator, Upload, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

interface FlatRule extends PricingRule {
  productName: string;
  productSku: string;
  productId: string;
  basePrice?: number;
}

export default function PricingRulesPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FlatRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlatRule | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkSegment, setBulkSegment] = useState<string>('superette');
  const [bulkAdjustment, setBulkAdjustment] = useState<string>('0');
  const [bulkType, setBulkType] = useState<'percentage' | 'fixed'>('percentage');

  // Form state
  const [formProductId, setFormProductId] = useState('');
  const [formSegment, setFormSegment] = useState<string>('superette');
  const [formUnitId, setFormUnitId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formEffectiveFrom, setFormEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [formEffectiveTo, setFormEffectiveTo] = useState('');

  useEffect(() => {
    getProducts().then(data => { setProducts(data); setLoading(false); });
  }, []);

  const allRules: FlatRule[] = products.flatMap(p =>
    p.pricingRules.map(r => ({ ...r, productName: p.name, productSku: p.sku, productId: p.id }))
  );

  const filtered = allRules.filter(r => {
    const matchSearch = r.productName.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === 'all' || r.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const uniqueSegments = [...new Set(allRules.map(r => r.segment))];
  const productsWithPricing = new Set(allRules.map(r => r.productName)).size;

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 2 }).format(n);

  const getSelectedProduct = () => products.find(p => p.id === formProductId);

  const calcMargin = (rule: FlatRule) => {
    const product = products.find(p => p.id === rule.productId);
    if (!product) return null;
    const wholesaleRule = product.pricingRules.find(r => r.segment === 'wholesale' && r.unitId === rule.unitId);
    if (!wholesaleRule || rule.segment === 'wholesale') return null;
    const margin = ((rule.price - wholesaleRule.price) / wholesaleRule.price * 100).toFixed(1);
    return `${margin}%`;
  };

  const resetForm = () => {
    setFormProductId(''); setFormSegment('superette'); setFormUnitId('');
    setFormPrice(''); setFormEffectiveFrom(new Date().toISOString().split('T')[0]);
    setFormEffectiveTo(''); setEditingRule(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (rule: FlatRule) => {
    setEditingRule(rule);
    setFormProductId(rule.productId);
    setFormSegment(rule.segment);
    setFormUnitId(rule.unitId);
    setFormPrice((rule.price / 100).toString());
    setFormEffectiveFrom(rule.effectiveFrom);
    setFormEffectiveTo(rule.effectiveTo || '');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formProductId || !formUnitId || !formPrice) {
      toast.error(t('common.error'));
      return;
    }
    const priceInCents = Math.round(parseFloat(formPrice) * 100);
    const product = getSelectedProduct()!;
    const unit = product.units.find(u => u.id === formUnitId);

    setProducts(prev => prev.map(p => {
      if (p.id !== formProductId) return p;
      let rules = [...p.pricingRules];
      if (editingRule) {
        rules = rules.map(r => r.id === editingRule.id ? {
          ...r, segment: formSegment as CustomerSegment, unitId: formUnitId,
          unitName: unit?.name || '', price: priceInCents,
          effectiveFrom: formEffectiveFrom, effectiveTo: formEffectiveTo || undefined,
        } : r);
      } else {
        rules.push({
          id: `pr${Date.now()}`, segment: formSegment as CustomerSegment,
          unitId: formUnitId, unitName: unit?.name || '', price: priceInCents,
          effectiveFrom: formEffectiveFrom, effectiveTo: formEffectiveTo || undefined,
        });
      }
      return { ...p, pricingRules: rules };
    }));
    toast.success(editingRule ? t('pricing.ruleUpdated') : t('pricing.ruleCreated'));
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setProducts(prev => prev.map(p => {
      if (p.id !== deleteTarget.productId) return p;
      return { ...p, pricingRules: p.pricingRules.filter(r => r.id !== deleteTarget.id) };
    }));
    toast.success(t('pricing.ruleDeleted'));
    setDeleteTarget(null);
  };

  const handleBulkUpdate = () => {
    const adj = parseFloat(bulkAdjustment);
    if (isNaN(adj) || adj === 0) return;
    setProducts(prev => prev.map(p => ({
      ...p,
      pricingRules: p.pricingRules.map(r => {
        if (r.segment !== bulkSegment) return r;
        const newPrice = bulkType === 'percentage'
          ? Math.round(r.price * (1 + adj / 100))
          : r.price + Math.round(adj * 100);
        return { ...r, price: newPrice, effectiveFrom: new Date().toISOString().split('T')[0] };
      })
    })));
    toast.success(t('pricing.bulkUpdated', { count: allRules.filter(r => r.segment === bulkSegment).length }));
    setBulkDialogOpen(false);
    setBulkAdjustment('0');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('pricing.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pricing.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setBulkDialogOpen(true)}>
            <Upload className="h-4 w-4" />{t('pricing.bulkUpdate')}
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />{t('pricing.createRule')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPIWidget title={t('pricing.activeRules')} value={allRules.length} icon={<Tags className="h-5 w-5" />} />
        <KPIWidget title={t('pricing.segments')} value={uniqueSegments.length} icon={<DollarSign className="h-5 w-5" />} />
        <KPIWidget title={t('pricing.productsWithPricing')} value={productsWithPricing} icon={<Calculator className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('pricing.searchRules')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="superette">Superette</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.productName')}</TableHead>
                <TableHead>{t('products.segment')}</TableHead>
                <TableHead>{t('products.unit')}</TableHead>
                <TableHead>{t('products.price')}</TableHead>
                <TableHead>{t('pricing.margin')}</TableHead>
                <TableHead>{t('products.effectiveFrom')}</TableHead>
                <TableHead>{t('pricing.effectiveTo')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">{t('common.noResults')}</TableCell></TableRow>
              ) : filtered.map(r => {
                const margin = calcMargin(r);
                const isExpired = r.effectiveTo && new Date(r.effectiveTo) < new Date();
                return (
                  <TableRow key={`${r.productSku}-${r.id}`} className={isExpired ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{r.productName}</TableCell>
                    <TableCell><SegmentBadge segment={r.segment} /></TableCell>
                    <TableCell>{r.unitName}</TableCell>
                    <TableCell className="font-bold">{(r.price / 100).toFixed(2)} DZD</TableCell>
                    <TableCell>{margin ? <span className="flex items-center gap-1 text-success"><TrendingUp className="h-3 w-3" />{margin}</span> : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.effectiveFrom}</TableCell>
                    <TableCell className="text-muted-foreground">{r.effectiveTo || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={isExpired ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success border-success/20'}>
                        {isExpired ? t('pricing.expired') : t('common.active')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) resetForm(); setDialogOpen(v); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingRule ? t('pricing.editRule') : t('pricing.createRule')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('nav.products')}</Label>
              <Select value={formProductId} onValueChange={v => { setFormProductId(v); setFormUnitId(''); }} disabled={!!editingRule}>
                <SelectTrigger><SelectValue placeholder={t('pricing.selectProduct')} /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('products.segment')}</Label>
              <Select value={formSegment} onValueChange={setFormSegment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superette">Superette</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formProductId && (
              <div className="space-y-2">
                <Label>{t('products.unit')}</Label>
                <Select value={formUnitId} onValueChange={setFormUnitId}>
                  <SelectTrigger><SelectValue placeholder={t('pricing.selectUnit')} /></SelectTrigger>
                  <SelectContent>
                    {getSelectedProduct()?.units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('products.price')} (DZD)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={e => setFormPrice(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('products.effectiveFrom')}</Label>
                <Input type="date" value={formEffectiveFrom} onChange={e => setFormEffectiveFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('pricing.effectiveTo')}</Label>
                <Input type="date" value={formEffectiveTo} onChange={e => setFormEffectiveTo(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('pricing.bulkUpdate')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('products.segment')}</Label>
              <Select value={bulkSegment} onValueChange={setBulkSegment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superette">Superette</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('pricing.adjustmentType')}</Label>
              <Select value={bulkType} onValueChange={v => setBulkType(v as 'percentage' | 'fixed')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">{t('pricing.percentage')}</SelectItem>
                  <SelectItem value="fixed">{t('pricing.fixedAmount')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{bulkType === 'percentage' ? t('pricing.percentageValue') : t('pricing.fixedValue')}</Label>
              <Input type="number" step="0.1" value={bulkAdjustment} onChange={e => setBulkAdjustment(e.target.value)} placeholder={bulkType === 'percentage' ? '+5 / -3' : '+100 / -50'} />
            </div>
            <Button className="w-full" onClick={handleBulkUpdate}>{t('pricing.applyBulk')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => { if (!v) setDeleteTarget(null); }}
        title={t('common.areYouSure')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
      />
    </div>
  );
}
