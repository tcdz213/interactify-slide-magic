import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Percent, Target } from 'lucide-react';

const tenantGrowth = [
  { month: 'Nov', tenants: 28 }, { month: 'Dec', tenants: 31 }, { month: 'Jan', tenants: 34 },
  { month: 'Feb', tenants: 36 }, { month: 'Mar', tenants: 39 }, { month: 'Apr', tenants: 42 },
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
  { cohort: 'Q1 2024', signups: 12, retained3m: '83%', retained6m: '75%', revenue: '$45,600' },
  { cohort: 'Q2 2024', signups: 15, retained3m: '87%', retained6m: '73%', revenue: '$62,400' },
  { cohort: 'Q3 2024', signups: 8, retained3m: '88%', retained6m: '—', revenue: '$38,200' },
  { cohort: 'Q4 2024', signups: 7, retained3m: '86%', retained6m: '—', revenue: '$29,800' },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 300); return () => clearTimeout(timer); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.platformAnalytics')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.analyticsDescription')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.tenantGrowth')} value="+14" subtitle={t('admin.last6Months')} icon={TrendingUp} variant="primary" trend={{ value: 50, label: t('dashboard.vsLastMonth') }} />
        <StatCard title={t('admin.avgRetention')} value="85%" icon={Target} variant="accent" />
        <StatCard title={t('admin.churnRate')} value="1.5%" icon={Percent} trend={{ value: -53, label: t('admin.last6Months') }} />
        <StatCard title={t('admin.totalUsers')} value="342" icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.tenantGrowth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tenantGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="tenants" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.churnAnalysis')}</CardTitle></CardHeader>
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
        <CardHeader><CardTitle className="text-base">{t('admin.featureAdoption')}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureAdoption} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={80} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}