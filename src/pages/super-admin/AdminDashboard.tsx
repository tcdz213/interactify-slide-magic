import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPlatformStats, getTenants, getRevenueData } from '@/lib/fake-api';
import type { PlatformStats, Tenant } from '@/lib/fake-api/types';
import { StatCard } from '@/components/StatCard';
import { PlanBadge, TenantStatusBadge } from '@/components/StatusBadges';
import { Building2, DollarSign, Users, ShoppingCart, TrendingUp, AlertTriangle, Bell, CheckCircle, Calendar, Download, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface Alert {
  id: string; type: 'warning' | 'error' | 'info' | 'success'; title: string; description: string; resolved: boolean;
}

const PLAN_COLORS = { starter: 'hsl(var(--muted-foreground))', professional: 'hsl(var(--primary))', enterprise: 'hsl(var(--accent-foreground))' };

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this_month');
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'a1', type: 'warning', title: t('admin.trialExpiring'), description: 'MediterranéeSupply — 3 ' + t('admin.daysLeft'), resolved: false },
    { id: 'a2', type: 'error', title: t('admin.paymentFailed'), description: 'Kabylie Fresh — ' + t('admin.retryScheduled'), resolved: false },
    { id: 'a3', type: 'info', title: t('admin.newSignup'), description: 'MediterranéeSupply ' + t('admin.startedTrial'), resolved: false },
    { id: 'a4', type: 'success', title: t('admin.milestone'), description: 'Aurès Trading ' + t('admin.hitOrders'), resolved: false },
  ]);

  useEffect(() => {
    Promise.all([getPlatformStats(), getTenants(), getRevenueData()])
      .then(([s, t, r]) => { setStats(s); setTenants(t); setRevenue(r); setLoading(false); })
      .catch(() => { toast.error(t('common.error')); setLoading(false); });
  }, []);

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success(t('admin.alertResolved', 'Alert resolved'));
  };

  const alertBorder: Record<string, string> = {
    warning: 'border-warning/20 bg-warning/5', error: 'border-destructive/20 bg-destructive/5',
    info: 'border-info/20 bg-info/5', success: 'border-success/20 bg-success/5',
  };

  const handleExportPDF = () => {
    const csv = ['Metric,Value', `Total Tenants,${stats?.totalTenants}`, `MRR,$${stats?.mrr}`, `Total Users,${stats?.totalUsers}`, `Churn Rate,${stats?.churnRate}%`].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'admin-dashboard-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported', 'Exported'));
  };

  // Tenant health score
  const getHealthScore = (tenant: Tenant) => {
    let score = 50;
    if (tenant.status === 'active') score += 20;
    if (tenant.subscriptionStatus === 'active') score += 15;
    if (tenant.usersCount > 5) score += 10;
    if (tenant.monthlyRevenue > 100) score += 5;
    return Math.min(100, score);
  };

  const healthColor = (score: number) => score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';

  // Plan distribution for pie chart
  const planDist = tenants.reduce((acc, t) => { acc[t.plan] = (acc[t.plan] || 0) + 1; return acc; }, {} as Record<string, number>);
  const pieData = Object.entries(planDist).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-2" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!stats) return null;

  const mrrGoal = 30000;
  const mrrProgress = Math.min(100, Math.round((stats.mrr / mrrGoal) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.platformOverview')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.monitorPlatform')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[170px]"><Calendar className="h-4 w-4 me-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('dashboard.today', "Aujourd'hui")}</SelectItem>
              <SelectItem value="this_week">{t('dashboard.thisWeek', 'Cette semaine')}</SelectItem>
              <SelectItem value="this_month">{t('dashboard.thisMonth', 'Ce mois')}</SelectItem>
              <SelectItem value="last_month">{t('dashboard.lastMonth', 'Mois dernier')}</SelectItem>
              <SelectItem value="this_quarter">{t('dashboard.thisQuarter', 'Ce trimestre')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 me-1" />{t('common.export')}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.totalTenants')} value={stats.totalTenants} subtitle={`${stats.activeTenants} ${t('common.active').toLowerCase()}`} icon={Building2} variant="primary" trend={{ value: 12, label: t('dashboard.vsLastMonth') }} />
        <StatCard title={t('dashboard.monthlyRevenue')} value={`$${stats.mrr.toLocaleString()}`} subtitle={t('admin.mrr')} icon={DollarSign} variant="accent" trend={{ value: 8.5, label: t('admin.growth') }} />
        <StatCard title={t('admin.totalUsers')} value={stats.totalUsers.toLocaleString()} subtitle={t('admin.acrossTenants')} icon={Users} />
        <StatCard title={t('dashboard.totalOrders')} value={stats.totalOrders.toLocaleString()} subtitle={`${stats.churnRate}% ${t('admin.churnRate').toLowerCase()}`} icon={ShoppingCart} trend={{ value: -stats.churnRate, label: t('admin.churnRate').toLowerCase() }} />
      </div>

      {/* MRR Goal */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{t('admin.mrrGoal', 'Objectif MRR mensuel')}</span></div>
            <span className="text-sm font-semibold">${stats.mrr.toLocaleString()} / ${mrrGoal.toLocaleString()}</span>
          </div>
          <Progress value={mrrProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">{mrrProgress}% {t('dashboard.achieved', 'atteint')}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />{t('admin.revenueChart')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} formatter={(value: number) => [`$${value.toLocaleString()}`, t('dashboard.revenue')]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Plan Distribution */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{t('admin.planDistribution', 'Répartition plans')}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={30}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={PLAN_COLORS[entry.name as keyof typeof PLAN_COLORS] || 'hsl(var(--muted))'} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {pieData.map(p => (
                    <div key={p.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[p.name as keyof typeof PLAN_COLORS] || 'hsl(var(--muted))' }} />
                      <span className="capitalize">{p.name}</span>
                      <span className="font-semibold">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" />{t('admin.alerts')}
                <Badge variant="secondary" className="ms-auto">{alerts.filter(a => !a.resolved).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.filter(a => !a.resolved).map(alert => (
                <div key={alert.id} className={`rounded-lg border p-3 flex items-start justify-between ${alertBorder[alert.type]}`}>
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => resolveAlert(alert.id)}>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {alerts.every(a => a.resolved) && <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData')}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tenants with Health Score */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('admin.recentTenants')}</CardTitle>
          <Button variant="link" size="sm" onClick={() => navigate('/admin/tenants')}>{t('common.view')} →</Button>
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
                <TableHead>{t('admin.healthScore', 'Santé')}</TableHead>
                <TableHead>{t('common.created')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.slice(0, 6).map(t_row => {
                const health = getHealthScore(t_row);
                return (
                  <TableRow key={t_row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate('/admin/tenants')}>
                    <TableCell className="font-medium">{t_row.name}</TableCell>
                    <TableCell><TenantStatusBadge status={t_row.status} /></TableCell>
                    <TableCell><PlanBadge plan={t_row.plan} /></TableCell>
                    <TableCell>{t_row.usersCount}</TableCell>
                    <TableCell>${t_row.monthlyRevenue}/mo</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className={`h-3.5 w-3.5 ${healthColor(health)}`} />
                        <span className={`text-sm font-semibold ${healthColor(health)}`}>{health}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t_row.createdAt}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
