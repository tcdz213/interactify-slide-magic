import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers } from '@/lib/fake-api';
import type { Customer } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIWidget } from '@/components/KPIWidget';
import { ArrowLeft, Download, Users, TrendingUp, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CustomerReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => { getCustomers().then(setCustomers); }, []);

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  const bySegment = Object.entries(customers.reduce<Record<string, number>>((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/business/reports')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('reports.customers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('reports.customers.description')}</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t('common.export')}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('reports.totalCustomers')} value={customers.length} icon={<Users className="h-5 w-5" />} />
        <KPIWidget title={t('reports.totalRevenue')} value={`${totalSpent.toLocaleString()} DZD`} icon={<TrendingUp className="h-5 w-5" />} />
        <KPIWidget title={t('reports.totalOrders')} value={totalOrders} icon={<ShoppingCart className="h-5 w-5" />} />
        <KPIWidget title={t('reports.avgOrderValue')} value={`${avgOrderValue.toLocaleString()} DZD`} icon={<Star className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.customersBySegment')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bySegment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                  {bySegment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.topCustomersChart')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCustomers.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} DZD`} /><Bar dataKey="totalSpent" fill="hsl(var(--primary))" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('reports.topCustomers')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('customers.segment')}</TableHead>
                <TableHead>{t('customers.totalOrders')}</TableHead>
                <TableHead>{t('customers.totalSpent')}</TableHead>
                <TableHead>{t('reports.avgOrderValue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge variant="outline">{c.segment}</Badge></TableCell>
                  <TableCell>{c.totalOrders}</TableCell>
                  <TableCell className="font-medium">{c.totalSpent.toLocaleString()} DZD</TableCell>
                  <TableCell>{c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders).toLocaleString() : 0} DZD</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
