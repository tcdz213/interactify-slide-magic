import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '@/lib/fake-api';
import type { Product } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SegmentBadge } from '@/components/StatusBadges';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('products.productCatalog')}</h1>
          <p className="text-sm text-muted-foreground">{t('products.manageProducts')}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('products.addProduct')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('products.searchProducts')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
            </div>
            <Badge variant="outline" className="text-muted-foreground">{filtered.length} {t('nav.products').toLowerCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.productName')}</TableHead>
                <TableHead>{t('products.sku')}</TableHead>
                <TableHead>{t('products.category')}</TableHead>
                <TableHead>{t('products.units')}</TableHead>
                <TableHead>{t('products.stockBase')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {p.units.map(u => (
                        <Badge key={u.id} variant="outline" className="text-xs">{u.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.stockBase.toLocaleString()} {p.baseUnit}s</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={p.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                      {p.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedProduct(p)}>
                          <Eye className="h-3.5 w-3.5" />
                          {t('common.details')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
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
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('products.unitName')}</TableHead>
                                  <TableHead>= {t('products.baseUnits')}</TableHead>
                                  <TableHead>{t('products.currentStock')}</TableHead>
                                </TableRow>
                              </TableHeader>
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
                              <Button variant="outline" size="sm" className="gap-1">
                                <Plus className="h-3.5 w-3.5" /> {t('products.addRule')}
                              </Button>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('products.segment')}</TableHead>
                                  <TableHead>{t('products.unit')}</TableHead>
                                  <TableHead>{t('products.price')}</TableHead>
                                  <TableHead>{t('products.effectiveFrom')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {p.pricingRules.map(r => (
                                  <TableRow key={r.id}>
                                    <TableCell><SegmentBadge segment={r.segment} /></TableCell>
                                    <TableCell>{r.unitName}</TableCell>
                                    <TableCell className="font-bold">${(r.price / 100).toFixed(2)}</TableCell>
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
                      </DialogContent>
                    </Dialog>
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
