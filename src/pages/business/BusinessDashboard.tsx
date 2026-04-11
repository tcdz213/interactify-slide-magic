import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBusinessStats, getOrders, getRevenueData } from '@/lib/fake-api';
import type { BusinessStats, Order } from '@/lib/fake-api/types';
import { StatCard } from '@/components/StatCard';
import { OrderStatusBadge } from '@/components/StatusBadges';
import { Package, ShoppingCart, Users, DollarSign, Truck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BusinessDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => {
    getBusinessStats().then(setStats);
    getOrders().then(setOrders);
    getRevenueData().then(setRevenue);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.businessOverview')}</h1>
        <p className="text-sm text-muted-foreground">Mama Foods — {t('dashboard.operationsDashboard')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('dashboard.monthlyRevenue')} value={`$${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} variant="accent" trend={{ value: 12, label: t('dashboard.vsLastMonth') }} />
        <StatCard title={t('dashboard.totalOrders')} value={stats.totalOrders} subtitle={`${stats.pendingOrders} ${t('dashboard.pending')}`} icon={ShoppingCart} variant="primary" />
        <StatCard title={t('nav.products')} value={stats.totalProducts} icon={Package} />
        <StatCard title={t('dashboard.deliveryRate')} value={`${stats.deliveryRate}%`} subtitle={`${stats.activeDrivers} ${t('dashboard.activeDrivers').toLowerCase()}`} icon={Truck} variant="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('dashboard.revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.quickStats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('nav.customers')}</span>
              <span className="font-bold">{stats.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('dashboard.inventoryValue')}</span>
              <span className="font-bold">${stats.inventoryValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('dashboard.activeDrivers')}</span>
              <span className="font-bold">{stats.activeDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('dashboard.pendingOrders')}</span>
              <span className="font-bold text-warning">{stats.pendingOrders}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.recentOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead>{t('orders.customer')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('orders.items')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium font-mono text-xs">{o.id.toUpperCase()}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                  <TableCell>{o.itemsCount}</TableCell>
                  <TableCell className="font-medium">${o.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
