import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInventoryItems } from '@/lib/fake-api';
import type { InventoryItem } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIWidget } from '@/components/KPIWidget';
import { PageHeader } from '@/components/PageHeader';
import { ArrowLeft, Download, Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const stockColors = { normal: 'bg-success/10 text-success', low: 'bg-warning/10 text-warning', out: 'bg-destructive/10 text-destructive' };

export default function InventoryReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => { getInventoryItems().then(setItems); }, []);

  const totalValue = items.reduce((s, i) => s + i.inventoryValue, 0);
  const lowStock = items.filter(i => i.stockStatus === 'low').length;
  const outOfStock = items.filter(i => i.stockStatus === 'out').length;
  const totalSKUs = new Set(items.map(i => i.productId)).size;

  const byCategory = Object.entries(items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.inventoryValue;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const byWarehouse = Object.entries(items.reduce<Record<string, number>>((acc, i) => {
    acc[i.warehouseName] = (acc[i.warehouseName] || 0) + i.quantity;
    return acc;
  }, {})).map(([name, qty]) => ({ name, qty }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/business/reports')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('reports.inventory.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('reports.inventory.description')}</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t('common.export')}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('reports.totalValue')} value={`${totalValue.toLocaleString()} DZD`} icon={<BarChart3 className="h-5 w-5" />} />
        <KPIWidget title={t('reports.totalSKUs')} value={totalSKUs} icon={<Package className="h-5 w-5" />} />
        <KPIWidget title={t('reports.lowStock')} value={lowStock} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPIWidget title={t('reports.outOfStock')} value={outOfStock} icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.valueByCategory')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} DZD`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.qtyByWarehouse')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byWarehouse}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="qty" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('reports.stockAlerts')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nav.products')}</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>{t('warehouses.title')}</TableHead>
                <TableHead>{t('inventory.quantity')}</TableHead>
                <TableHead>{t('inventory.reorderPoint')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.filter(i => i.stockStatus !== 'normal').map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.productName}</TableCell>
                  <TableCell className="font-mono text-xs">{i.sku}</TableCell>
                  <TableCell>{i.warehouseName}</TableCell>
                  <TableCell>{i.quantity.toLocaleString()}</TableCell>
                  <TableCell>{i.reorderPoint.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary" className={stockColors[i.stockStatus]}>{t(`inventory.${i.stockStatus}`)}</Badge></TableCell>
                </TableRow>
              ))}
              {items.filter(i => i.stockStatus !== 'normal').length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('reports.noAlerts')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
