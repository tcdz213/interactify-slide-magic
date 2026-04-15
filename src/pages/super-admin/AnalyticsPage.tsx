import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Percent, Target, Calendar, Download, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';

const tenantGrowthFull = [
  { month: 'Jul', tenants: 22, newSignups: 3, churned: 1 }, { month: 'Aug', tenants: 24, newSignups: 3, churned: 1 },
  { month: 'Sep', tenants: 26, newSignups: 4, churned: 2 }, { month: 'Oct', tenants: 27, newSignups: 2, churned: 1 },
  { month: 'Nov', tenants: 28, newSignups: 3, churned: 2 }, { month: 'Dec', tenants: 31, newSignups: 5, churned: 2 },
  { month: 'Jan', tenants: 34, newSignups: 4, churned: 1 }, { month: 'Feb', tenants: 36, newSignups: 3, churned: 1 },
  { month: 'Mar', tenants: 39, newSignups: 5, churned: 2 }, { month: 'Apr', tenants: 42, newSignups: 4, churned: 1 },
];

const featureAdoption = [
  { feature: 'Orders', starter: 95, professional: 98, enterprise: 100 },
  { feature: 'Inventory', starter: 60, professional: 85, enterprise: 95 },
  { feature: 'Delivery', starter: 30, professional: 72, enterprise: 90 },
  { feature: 'Analytics', starter: 15, professional: 55, enterprise: 88 },
  { feature: 'API', starter: 5, professional: 25, enterprise: 75 },
];

const churnData = [
  { month: 'Nov', rate: 3.2 }, { month: 'Dec', rate: 2.8 }, { month: 'Jan', rate: 3.5 },
  { month: 'Feb', rate: 2.1 }, { month: 'Mar', rate: 1.8 }, { month: 'Apr', rate: 1.5 },
];

const cohorts = [
  { cohort: 'Q1 2024', signups: 12, retained3m: '83%', retained6m: '75%', revenue: '$45,600', ltv: '$3,800' },
  { cohort: 'Q2 2024', signups: 15, retained3m: '87%', retained6m: '73%', revenue: '$62,400', ltv: '$4,160' },
  { cohort: 'Q3 2024', signups: 8, retained3m: '88%', retained6m: '—', revenue: '$38,200', ltv: '$4,775' },
  { cohort: 'Q4 2024', signups: 7, retained3m: '86%', retained6m: '—', revenue: '$29,800', ltv: '$4,257' },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6m');
  const [drilldownData, setDrilldownData] = useState<{ month: string; detail: Record<string, number> } | null>(null);

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 300); return () => clearTimeout(timer); }, []);

  const growthData = period === '6m' ? tenantGrowthFull.slice(-6) : tenantGrowthFull;
  const growthDelta = growthData[growthData.length - 1].tenants - growthData[0].tenants;

  const handleExportChart = (chartName: string) => {
    toast.success(`${chartName} ${t('common.exported', 'exported')}`);
  };

  const handleDrilldown = (data: { month: string; tenants: number; newSignups: number; churned: number }) => {
    setDrilldownData({ month: data.month, detail: { [t('admin.totalTenants')]: data.tenants, [t('admin.newSignups', 'New Signups')]: data.newSignups, [t('admin.churned', 'Churned')]: data.churned, [t('admin.netGrowth', 'Net Growth')]: data.newSignups - data.churned } });
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-72" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.platformAnalytics')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.analyticsDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]"><Calendar className="h-4 w-4 me-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">{t('admin.last3Months', 'Last 3 months')}</SelectItem>
              <SelectItem value="6m">{t('admin.last6Months')}</SelectItem>
              <SelectItem value="all">{t('common.all')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.tenantGrowth')} value={`+${growthDelta}`} subtitle={period === '6m' ? t('admin.last6Months') : t('common.all')} icon={TrendingUp} variant="primary" trend={{ value: 50, label: t('dashboard.vsLastMonth') }} />
        <StatCard title={t('admin.avgRetention')} value="85%" icon={Target} variant="accent" />
        <StatCard title={t('admin.churnRate')} value="1.5%" icon={Percent} trend={{ value: -53, label: t('admin.last6Months') }} />
        <StatCard title={t('admin.totalUsers')} value="342" icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t('admin.tenantGrowth')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleExportChart('Tenant Growth')}><Download className="h-3.5 w-3.5 me-1" />{t('common.export')}</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData} onClick={(e) => e?.activePayload?.[0]?.payload && handleDrilldown(e.activePayload[0].payload)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="tenants" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name={t('admin.totalTenants')} />
                <Line type="monotone" dataKey="newSignups" stroke="hsl(var(--accent-foreground))" strokeWidth={1.5} strokeDasharray="4 2" name={t('admin.newSignups', 'New')} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><ZoomIn className="h-3 w-3" />{t('admin.clickToDrilldown', 'Click a data point to drill down')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t('admin.churnAnalysis')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleExportChart('Churn')}><Download className="h-3.5 w-3.5 me-1" />{t('common.export')}</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="rate" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('admin.featureAdoption')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => handleExportChart('Feature Adoption')}><Download className="h-3.5 w-3.5 me-1" />{t('common.export')}</Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureAdoption} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={80} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="starter" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} name="Starter" />
              <Bar dataKey="professional" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Professional" />
              <Bar dataKey="enterprise" fill="hsl(var(--accent-foreground))" radius={[0, 4, 4, 0]} name="Enterprise" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('admin.cohortAnalysis')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.cohort')}</TableHead>
                <TableHead>{t('admin.signups')}</TableHead>
                <TableHead>{t('admin.retained3m')}</TableHead>
                <TableHead>{t('admin.retained6m')}</TableHead>
                <TableHead>{t('dashboard.revenue')}</TableHead>
                <TableHead>LTV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohorts.map(c => (
                <TableRow key={c.cohort}>
                  <TableCell className="font-medium">{c.cohort}</TableCell>
                  <TableCell>{c.signups}</TableCell>
                  <TableCell>{c.retained3m}</TableCell>
                  <TableCell>{c.retained6m}</TableCell>
                  <TableCell className="font-medium">{c.revenue}</TableCell>
                  <TableCell className="font-medium">{c.ltv}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drilldown Dialog */}
      <Dialog open={!!drilldownData} onOpenChange={() => setDrilldownData(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.drilldown', 'Drill Down')} — {drilldownData?.month}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            {drilldownData && Object.entries(drilldownData.detail).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{key}</span>
                <span className="text-lg font-bold">{value}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
