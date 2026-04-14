import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, Package, Truck, Receipt, Download, Clock, Calendar, Star, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';

const reportCategories = [
  { key: 'sales', icon: TrendingUp, route: '/business/reports/sales', color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  { key: 'tax', icon: Receipt, route: '/business/reports/tax', color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  { key: 'inventory', icon: Package, route: '/business/reports/inventory', color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  { key: 'customers', icon: Users, route: '/business/reports/customers', color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  { key: 'delivery', icon: Truck, route: '/business/reports/delivery', color: 'text-primary', bgColor: 'bg-primary/10' },
];

const recentReports = [
  { id: 'rr1', name: 'Rapport Ventes Décembre 2024', type: 'sales', date: '2024-12-15', format: 'PDF', size: '2.4 MB' },
  { id: 'rr2', name: 'Déclaration TVA Q4 2024', type: 'tax', date: '2024-12-10', format: 'PDF', size: '1.1 MB' },
  { id: 'rr3', name: 'État Stock Semaine 50', type: 'inventory', date: '2024-12-09', format: 'Excel', size: '3.8 MB' },
  { id: 'rr4', name: 'Analyse Clients Novembre', type: 'customers', date: '2024-12-01', format: 'PDF', size: '1.7 MB' },
  { id: 'rr5', name: 'Performance Livraisons Novembre', type: 'delivery', date: '2024-11-30', format: 'PDF', size: '980 KB' },
];

const scheduledReports = [
  { id: 'sr1', name: 'Rapport Ventes Hebdomadaire', frequency: 'weekly', nextRun: '2024-12-22', format: 'PDF', active: true },
  { id: 'sr2', name: 'Déclaration TVA Mensuelle (G50)', frequency: 'monthly', nextRun: '2025-01-05', format: 'PDF', active: true },
  { id: 'sr3', name: 'État Stock Quotidien', frequency: 'daily', nextRun: '2024-12-16', format: 'Excel', active: false },
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['sales', 'tax']));

  const toggleFavorite = (key: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredReports = reportCategories.filter(r =>
    !search || t(`reports.${r.key}.title`).toLowerCase().includes(search.toLowerCase()) || t(`reports.${r.key}.description`).toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (name: string) => toast.success(t('reports.downloading', { name }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('reports.title')} description={t('reports.subtitle')}>
        <div className="relative w-64">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('reports.searchReports')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
        </div>
      </PageHeader>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">{t('reports.catalog')}</TabsTrigger>
          <TabsTrigger value="recent">{t('reports.recentReports')}</TabsTrigger>
          <TabsTrigger value="scheduled">{t('reports.scheduledReports')}</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-4">
          {/* Favorites */}
          {favorites.size > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Star className="h-4 w-4" />{t('reports.favorites')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportCategories.filter(r => favorites.has(r.key)).map(r => (
                  <Card key={r.key} className="hover:shadow-md transition-shadow border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${r.bgColor} ${r.color}`}><r.icon className="h-5 w-5" /></div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{t(`reports.${r.key}.title`)}</CardTitle>
                          <CardDescription className="text-xs">{t(`reports.${r.key}.description`)}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(r.key)}>
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link to={r.route}><Button variant="outline" size="sm" className="w-full">{t('reports.generate')}</Button></Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Reports */}
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('reports.allReports')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(r => (
              <Card key={r.key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${r.bgColor} ${r.color}`}><r.icon className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{t(`reports.${r.key}.title`)}</CardTitle>
                      <CardDescription className="text-xs">{t(`reports.${r.key}.description`)}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(r.key)}>
                      <Star className={`h-3.5 w-3.5 ${favorites.has(r.key) ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={r.route}><Button variant="outline" size="sm" className="w-full">{t('reports.generate')}</Button></Link>
                </CardContent>
              </Card>
            ))}
            {filteredReports.length === 0 && <div className="col-span-3 text-center py-8 text-muted-foreground">{t('common.noResults')}</div>}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />{t('reports.recentReports')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('reports.format')}</TableHead>
                    <TableHead>{t('reports.size')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{r.name}</TableCell>
                      <TableCell><Badge variant="outline">{t(`reports.${r.type}.title`)}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="secondary">{r.format}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.size}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleDownload(r.name)}>
                          <Download className="h-3.5 w-3.5" />{t('common.download')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />{t('reports.scheduledReports')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('reports.frequency')}</TableHead>
                    <TableHead>{t('reports.nextRun')}</TableHead>
                    <TableHead>{t('reports.format')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell><Badge variant="outline">{t(`reports.${r.frequency}`)}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(r.nextRun).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="secondary">{r.format}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={r.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                          {r.active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
