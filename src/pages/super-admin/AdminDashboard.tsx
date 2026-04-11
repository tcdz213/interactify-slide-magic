import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPlatformStats, getTenants, getRevenueData } from '@/lib/fake-api';
import type { PlatformStats, Tenant } from '@/lib/fake-api/types';
import { StatCard } from '@/components/StatCard';
import { PlanBadge, TenantStatusBadge } from '@/components/StatusBadges';
import { Building2, DollarSign, Users, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => {
    getPlatformStats().then(setStats);
    getTenants().then(setTenants);
    getRevenueData().then(setRevenue);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.platformOverview')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.monitorPlatform')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.totalTenants')} value={stats.totalTenants} subtitle={`${stats.activeTenants} ${t('common.active').toLowerCase()}`} icon={Building2} variant="primary" trend={{ value: 12, label: t('dashboard.vsLastMonth') }} />
        <StatCard title={t('dashboard.monthlyRevenue')} value={`$${stats.mrr.toLocaleString()}`} subtitle={t('admin.mrr')} icon={DollarSign} variant="accent" trend={{ value: 8.5, label: t('admin.growth') }} />
        <StatCard title={t('admin.totalUsers')} value={stats.totalUsers.toLocaleString()} subtitle={t('admin.acrossTenants')} icon={Users} />
        <StatCard title={t('dashboard.totalOrders')} value={stats.totalOrders.toLocaleString()} subtitle={`${stats.churnRate}% ${t('admin.churnRate').toLowerCase()}`} icon={ShoppingCart} trend={{ value: -stats.churnRate, label: t('admin.churnRate').toLowerCase() }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('admin.revenueChart')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, t('dashboard.revenue')]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {t('admin.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <p className="text-sm font-medium">{t('admin.trialExpiring')}</p>
              <p className="text-xs text-muted-foreground">MediterranéeSupply — 3 {t('admin.daysLeft')}</p>
            </div>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm font-medium">{t('admin.paymentFailed')}</p>
              <p className="text-xs text-muted-foreground">Kabylie Fresh — {t('admin.retryScheduled')}</p>
            </div>
            <div className="rounded-lg border border-info/20 bg-info/5 p-3">
              <p className="text-sm font-medium">{t('admin.newSignup')}</p>
              <p className="text-xs text-muted-foreground">MediterranéeSupply {t('admin.startedTrial')}</p>
            </div>
            <div className="rounded-lg border border-success/20 bg-success/5 p-3">
              <p className="text-sm font-medium">{t('admin.milestone')}</p>
              <p className="text-xs text-muted-foreground">Aurès Trading {t('admin.hitOrders')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.recentTenants')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.company')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('admin.plan')}</TableHead>
                <TableHead>{t('admin.usersCount')}</TableHead>
                <TableHead>{t('dashboard.revenue')}</TableHead>
                <TableHead>{t('common.created')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.slice(0, 6).map(t_row => (
                <TableRow key={t_row.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{t_row.name}</TableCell>
                  <TableCell><TenantStatusBadge status={t_row.status} /></TableCell>
                  <TableCell><PlanBadge plan={t_row.plan} /></TableCell>
                  <TableCell>{t_row.usersCount}</TableCell>
                  <TableCell>${t_row.monthlyRevenue}/mo</TableCell>
                  <TableCell className="text-muted-foreground">{t_row.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
