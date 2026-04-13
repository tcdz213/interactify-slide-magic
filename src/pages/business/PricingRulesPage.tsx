import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '@/lib/fake-api';
import type { Product, PricingRule } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIWidget } from '@/components/KPIWidget';
import { SegmentBadge } from '@/components/StatusBadges';
import { Plus, Search, DollarSign, Tags, Calculator, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface FlatRule extends PricingRule {
  productName: string;
  productSku: string;
}

export default function PricingRulesPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => { setProducts(data); setLoading(false); });
  }, []);

  const allRules: FlatRule[] = products.flatMap(p =>
    p.pricingRules.map(r => ({ ...r, productName: p.name, productSku: p.sku }))
  );

  const filtered = allRules.filter(r => {
    const matchSearch = r.productName.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === 'all' || r.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const uniqueSegments = [...new Set(allRules.map(r => r.segment))];
  const productsWithPricing = new Set(allRules.map(r => r.productName)).size;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('pricing.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pricing.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />{t('pricing.bulkImport')}</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{t('pricing.createRule')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('pricing.createRule')}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>{t('nav.products')}</Label>
                  <Select><SelectTrigger><SelectValue placeholder={t('pricing.selectProduct')} /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('products.segment')}</Label>
                  <Select><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superette">Superette</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('products.price')} (DZD)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <Button className="w-full">{t('common.save')}</Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <TableHead>{t('products.effectiveFrom')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={`${r.productSku}-${r.id}`}>
                  <TableCell className="font-medium">{r.productName}</TableCell>
                  <TableCell><SegmentBadge segment={r.segment} /></TableCell>
                  <TableCell>{r.unitName}</TableCell>
                  <TableCell className="font-bold">{(r.price / 100).toFixed(2)} DZD</TableCell>
                  <TableCell className="text-muted-foreground">{r.effectiveFrom}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('common.active')}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
