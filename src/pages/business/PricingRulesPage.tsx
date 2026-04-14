import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCustomers, getPriceGroupRules, updatePriceGroupRule, regeneratePrices, addPriceHistoryEntry, updateProduct } from '@/lib/fake-api';
import type { Product, PricingRule, CustomerSegment, Customer, PriceGroupRule } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIWidget } from '@/components/KPIWidget';
import { SegmentBadge } from '@/components/StatusBadges';
import { Plus, Search, DollarSign, Tags, Calculator, Upload, Pencil, Trash2, TrendingUp, RefreshCw, Settings, BarChart3, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const ALL_SEGMENTS: CustomerSegment[] = ['depot', 'wholesale', 'retail', 'small_trader', 'special_client'];

interface FlatRule extends PricingRule {
  productName: string;
  productSku: string;
  productId: string;
}

export default function PricingRulesPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [priceGroups, setPriceGroups] = useState<PriceGroupRule[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FlatRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlatRule | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkSegment, setBulkSegment] = useState<string>('depot');
  const [bulkAdjustment, setBulkAdjustment] = useState<string>('0');
  const [bulkType, setBulkType] = useState<'percentage' | 'fixed'>('percentage');
  const [regenerating, setRegenerating] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareProductId, setCompareProductId] = useState('');

  const [formProductId, setFormProductId] = useState('');
  const [formSegment, setFormSegment] = useState<string>('depot');
  const [formUnitId, setFormUnitId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formEffectiveFrom, setFormEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [formEffectiveTo, setFormEffectiveTo] = useState('');
  const [formIsPromo, setFormIsPromo] = useState(false);
  const [formPromoLabel, setFormPromoLabel] = useState('');

  const load = async () => {
    const [p, pg] = await Promise.all([getProducts(), getPriceGroupRules()]);
    setProducts(p.filter(pr => !pr.isDeleted));
    setPriceGroups(pg);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

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
  const promoCount = allRules.filter(r => r.isPromo).length;
  const avgMargin = allRules.filter(r => r.costPrice).length > 0
    ? (allRules.filter(r => r.costPrice).reduce((s, r) => s + ((r.price - (r.costPrice || 0)) / (r.costPrice || 1)) * 100, 0) / allRules.filter(r => r.costPrice).length).toFixed(1)
    : '0';

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 2 }).format(n);

  const getSelectedProduct = () => products.find(p => p.id === formProductId);

  const resetForm = () => {
    setFormProductId(''); setFormSegment('depot'); setFormUnitId('');
    setFormPrice(''); setFormCostPrice(''); setFormEffectiveFrom(new Date().toISOString().split('T')[0]);
    setFormEffectiveTo(''); setEditingRule(null); setFormIsPromo(false); setFormPromoLabel('');
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (rule: FlatRule) => {
    setEditingRule(rule);
    setFormProductId(rule.productId);
    setFormSegment(rule.segment);
    setFormUnitId(rule.unitId);
    setFormPrice((rule.price / 100).toString());
    setFormCostPrice(rule.costPrice ? (rule.costPrice / 100).toString() : '');
    setFormEffectiveFrom(rule.effectiveFrom);
    setFormEffectiveTo(rule.effectiveTo || '');
    setFormIsPromo(rule.isPromo || false);
    setFormPromoLabel(rule.promoLabel || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formProductId || !formUnitId || !formPrice) {
      toast.error(t('common.error'));
      return;
    }
    const priceInCents = Math.round(parseFloat(formPrice) * 100);
    const costInCents = formCostPrice ? Math.round(parseFloat(formCostPrice) * 100) : undefined;
    const product = getSelectedProduct()!;
    const unit = product.units.find(u => u.id === formUnitId);

    let rules = [...product.pricingRules];
    if (editingRule) {
      const oldRule = rules.find(r => r.id === editingRule.id);
      if (oldRule && oldRule.price !== priceInCents) {
        await addPriceHistoryEntry({
          productId: product.id, productName: product.name, segment: formSegment as CustomerSegment,
          unitId: formUnitId, unitName: unit?.name || '', oldPrice: oldRule.price, newPrice: priceInCents,
          changedBy: 'Manager', reason: formIsPromo ? `Promo: ${formPromoLabel}` : 'Modification manuelle',
        });
      }
      rules = rules.map(r => r.id === editingRule.id ? {
        ...r, segment: formSegment as CustomerSegment, unitId: formUnitId,
        unitName: unit?.name || '', price: priceInCents, costPrice: costInCents,
        effectiveFrom: formEffectiveFrom, effectiveTo: formEffectiveTo || undefined,
        isPromo: formIsPromo, promoLabel: formIsPromo ? formPromoLabel : undefined,
      } : r);
    } else {
      rules.push({
        id: `pr${Date.now()}`, segment: formSegment as CustomerSegment,
        unitId: formUnitId, unitName: unit?.name || '', price: priceInCents, costPrice: costInCents,
        effectiveFrom: formEffectiveFrom, effectiveTo: formEffectiveTo || undefined,
        isPromo: formIsPromo, promoLabel: formIsPromo ? formPromoLabel : undefined,
      });
    }

    await updateProduct(product.id, { pricingRules: rules });
    toast.success(editingRule ? t('pricing.ruleUpdated') : t('pricing.ruleCreated'));
    await load();
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const product = products.find(p => p.id === deleteTarget.productId);
    if (!product) return;
    await updateProduct(product.id, {
      pricingRules: product.pricingRules.filter(r => r.id !== deleteTarget.id),
    });
    toast.success(t('pricing.ruleDeleted'));
    await load();
    setDeleteTarget(null);
  };

  const handleBulkUpdate = async () => {
    const adj = parseFloat(bulkAdjustment);
    if (isNaN(adj) || adj === 0) return;
    let count = 0;
    for (const product of products) {
      const updatedRules = product.pricingRules.map(r => {
        if (r.segment !== bulkSegment) return r;
        const newPrice = bulkType === 'percentage'
          ? Math.round(r.price * (1 + adj / 100))
          : r.price + Math.round(adj * 100);
        count++;
        return { ...r, price: newPrice, effectiveFrom: new Date().toISOString().split('T')[0] };
      });
      if (updatedRules !== product.pricingRules) {
        await updateProduct(product.id, { pricingRules: updatedRules });
      }
    }
    toast.success(t('pricing.bulkUpdated', { count }));
    await load();
    setBulkDialogOpen(false);
    setBulkAdjustment('0');
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const result = await regeneratePrices();
      toast.success(t('pricing.regenerated', { count: result.updated }));
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setRegenerating(false);
  };

  const handleUpdatePriceGroup = async (id: string, marginPercent: number) => {
    await updatePriceGroupRule(id, { marginPercent });
    toast.success(t('common.updated'));
    await load();
  };

  const handleExportCSV = () => {
    const header = 'Product,SKU,Segment,Unit,Cost Price,Sell Price,Margin %,Effective From,Status\n';
    const rows = filtered.map(r => {
      const margin = r.costPrice ? (((r.price - r.costPrice) / r.costPrice) * 100).toFixed(1) : 'N/A';
      const isExpired = r.effectiveTo && new Date(r.effectiveTo) < new Date();
      return `"${r.productName}","${r.productSku}","${r.segment}","${r.unitName}",${r.costPrice ? (r.costPrice / 100).toFixed(2) : ''},${(r.price / 100).toFixed(2)},${margin},${r.effectiveFrom},${isExpired ? 'Expired' : r.isPromo ? 'Promo' : 'Active'}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pricing-rules.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported'));
  };

  // Price comparison data
  const compareProduct = products.find(p => p.id === compareProductId);
  const compareData = compareProduct ? ALL_SEGMENTS.map(seg => {
    const rule = compareProduct.pricingRules.find(r => r.segment === seg);
    return {
      segment: seg,
      price: rule ? rule.price / 100 : 0,
      costPrice: rule?.costPrice ? rule.costPrice / 100 : 0,
      margin: rule?.costPrice ? (((rule.price - rule.costPrice) / rule.costPrice) * 100).toFixed(1) : 'N/A',
      hasRule: !!rule,
    };
  }) : [];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('pricing.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pricing.description')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />{t('common.export')}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => { setCompareProductId(products[0]?.id || ''); setCompareOpen(true); }}>
            <BarChart3 className="h-4 w-4" />{t('pricing.compare')}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleRegenerate} disabled={regenerating}>
            <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />{t('pricing.regenerate')}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setBulkDialogOpen(true)}>
            <Upload className="h-4 w-4" />{t('pricing.bulkUpdate')}
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />{t('pricing.createRule')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPIWidget title={t('pricing.activeRules')} value={allRules.length} icon={<Tags className="h-5 w-5" />} />
        <KPIWidget title={t('pricing.segments')} value={uniqueSegments.length} icon={<DollarSign className="h-5 w-5" />} />
        <KPIWidget title={t('pricing.productsWithPricing')} value={productsWithPricing} icon={<Calculator className="h-5 w-5" />} />
        <KPIWidget title={t('pricing.avgMargin')} value={`${avgMargin}%`} icon={<TrendingUp className="h-5 w-5" />} trend="up" trendValue={`${avgMargin}%`} />
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">{t('pricing.activeRules')}</TabsTrigger>
          <TabsTrigger value="groups">{t('pricing.priceGroups')}</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="ps-9" placeholder={t('pricing.searchRules')} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {ALL_SEGMENTS.map(s => <SelectItem key={s} value={s}><span className="capitalize">{s.replace('_', ' ')}</span></SelectItem>)}
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
                    <TableHead>{t('products.costPrice')}</TableHead>
                    <TableHead>{t('products.price')}</TableHead>
                    <TableHead>{t('products.margin')}</TableHead>
                    <TableHead>{t('products.effectiveFrom')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">{t('common.noResults')}</TableCell></TableRow>
                  ) : filtered.map(r => {
                    const margin = r.costPrice ? (((r.price - r.costPrice) / r.costPrice) * 100).toFixed(1) : null;
                    const isExpired = r.effectiveTo && new Date(r.effectiveTo) < new Date();
                    return (
                      <TableRow key={`${r.productSku}-${r.id}`} className={isExpired ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">{r.productName}</TableCell>
                        <TableCell><SegmentBadge segment={r.segment} /></TableCell>
                        <TableCell>{r.unitName}</TableCell>
                        <TableCell className="text-muted-foreground">{r.costPrice ? `${(r.costPrice / 100).toFixed(2)} DZD` : '—'}</TableCell>
                        <TableCell className="font-bold">{(r.price / 100).toFixed(2)} DZD</TableCell>
                        <TableCell>{margin ? <span className="flex items-center gap-1 text-success"><TrendingUp className="h-3 w-3" />+{margin}%</span> : '—'}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{r.effectiveFrom}{r.effectiveTo ? ` → ${r.effectiveTo}` : ''}</TableCell>
                        <TableCell>
                          {r.isPromo ? (
                            <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs">{r.promoLabel || 'Promo'}</Badge>
                          ) : (
                            <Badge variant="outline" className={isExpired ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success border-success/20'}>
                              {isExpired ? t('pricing.expired') : t('common.active')}
                            </Badge>
                          )}
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
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4 text-primary" />
                {t('pricing.priceGroups')} — {t('pricing.costPlusMargin')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t('pricing.regenerateDesc')}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('products.segment')}</TableHead>
                    <TableHead>{t('pricing.marginPercent')}</TableHead>
                    <TableHead>{t('products.description')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceGroups.map(pg => (
                    <PriceGroupRow key={pg.id} pg={pg} onSave={handleUpdatePriceGroup} t={t} />
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleRegenerate} disabled={regenerating} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                  {t('pricing.regenerate')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  {ALL_SEGMENTS.map(s => <SelectItem key={s} value={s}><span className="capitalize">{s.replace('_', ' ')}</span></SelectItem>)}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('products.costPrice')} (DZD)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={formCostPrice} onChange={e => setFormCostPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('products.price')} (DZD)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={e => setFormPrice(e.target.value)} />
              </div>
            </div>
            {formCostPrice && formPrice && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">{t('pricing.calculatedMargin')}: </span>
                <span className="font-bold text-success">
                  {((parseFloat(formPrice) - parseFloat(formCostPrice)) / parseFloat(formCostPrice) * 100).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ms-3">{t('pricing.profit')}: </span>
                <span className="font-bold">{(parseFloat(formPrice) - parseFloat(formCostPrice)).toFixed(2)} DZD</span>
              </div>
            )}
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
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={formIsPromo} onChange={e => setFormIsPromo(e.target.checked)} className="rounded" />
              <Label>{t('products.promo')}</Label>
              {formIsPromo && (
                <Input value={formPromoLabel} onChange={e => setFormPromoLabel(e.target.value)} placeholder="e.g. Promo été" className="flex-1" />
              )}
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
                  {ALL_SEGMENTS.map(s => <SelectItem key={s} value={s}><span className="capitalize">{s.replace('_', ' ')}</span></SelectItem>)}
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

      {/* Price Comparison Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('pricing.compare')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={compareProductId} onValueChange={setCompareProductId}>
              <SelectTrigger><SelectValue placeholder={t('pricing.selectProduct')} /></SelectTrigger>
              <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            {compareProduct && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('products.segment')}</TableHead>
                    <TableHead>{t('products.costPrice')}</TableHead>
                    <TableHead>{t('products.price')}</TableHead>
                    <TableHead>{t('products.margin')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compareData.map(d => (
                    <TableRow key={d.segment} className={!d.hasRule ? 'opacity-40' : ''}>
                      <TableCell><SegmentBadge segment={d.segment as CustomerSegment} /></TableCell>
                      <TableCell>{d.costPrice ? `${d.costPrice.toFixed(2)} DZD` : '—'}</TableCell>
                      <TableCell className="font-bold">{d.hasRule ? `${d.price.toFixed(2)} DZD` : '—'}</TableCell>
                      <TableCell>{d.margin !== 'N/A' ? <span className="text-success">+{d.margin}%</span> : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

function PriceGroupRow({ pg, onSave, t }: { pg: PriceGroupRule; onSave: (id: string, margin: number) => void; t: (k: string) => string }) {
  const [editing, setEditing] = useState(false);
  const [margin, setMargin] = useState(pg.marginPercent.toString());

  return (
    <TableRow>
      <TableCell><SegmentBadge segment={pg.segment} /></TableCell>
      <TableCell>
        {editing ? (
          <div className="flex items-center gap-2">
            <Input type="number" value={margin} onChange={e => setMargin(e.target.value)} className="w-20 h-8" />
            <span className="text-sm">%</span>
            <Button size="sm" variant="outline" onClick={() => { onSave(pg.id, parseFloat(margin)); setEditing(false); }}>OK</Button>
          </div>
        ) : (
          <span className="font-bold text-primary">{pg.marginPercent}%</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{pg.description}</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
