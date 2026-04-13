import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getAccountingStats, getAgingBuckets, getTopDebtors } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { KPIWidget } from '@/components/KPIWidget';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import { DollarSign, TrendingUp, TrendingDown, Clock, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { TopDebtor, AgingBucket } from '@/lib/fake-api';

export default function AccountingPage() {
  const { t } = useTranslation();
  const { data: stats } = useQuery({ queryKey: ['accountingStats'], queryFn: getAccountingStats });
  const { data: aging = [] } = useQuery({ queryKey: ['agingBuckets'], queryFn: getAgingBuckets });
  const { data: debtors = [], isLoading } = useQuery({ queryKey: ['topDebtors'], queryFn: getTopDebtors });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const revenueData = [
    { month: 'Jul', revenue: 180000 }, { month: 'Aug', revenue: 210000 },
    { month: 'Sep', revenue: 195000 }, { month: 'Oct', revenue: 230000 },
    { month: 'Nov', revenue: 265000 }, { month: 'Dec', revenue: 310000 },
  ];

  const debtorCols: ColumnDef<TopDebtor>[] = [
    { accessorKey: 'customerName', header: t('common.name') },
    { accessorKey: 'outstanding', header: t('accounting.outstanding'), cell: ({ row }) => fmt(row.original.outstanding) },
    { accessorKey: 'daysOverdue', header: t('accounting.daysOverdue'), cell: ({ row }) => <span className={row.original.daysOverdue > 30 ? 'text-destructive font-medium' : ''}>{row.original.daysOverdue} {t('accounting.days')}</span> },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('accounting.title')} description={t('accounting.subtitle')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget title={t('accounting.revenue')} value={fmt(stats?.totalRevenue ?? 0)} icon={<DollarSign className="h-5 w-5" />} trend="up" trendValue="+18%" />
        <KPIWidget title={t('accounting.expenses')} value={fmt(stats?.totalExpenses ?? 0)} icon={<TrendingDown className="h-5 w-5" />} />
        <KPIWidget title={t('accounting.netProfit')} value={fmt(stats?.netProfit ?? 0)} icon={<TrendingUp className="h-5 w-5" />} trend="up" trendValue="+24%" />
        <KPIWidget title={t('accounting.dso')} value={`${stats?.dso ?? 0} ${t('accounting.days')}`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('accounting.monthlyRevenue')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Area type="monotone" dataKey="revenue" className="fill-primary/20 stroke-primary" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('accounting.agingReceivables')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={aging}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="amount" className="fill-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('accounting.topDebtors')}</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={debtorCols} data={debtors} isLoading={isLoading} pageSize={5} compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('accounting.taxSummary')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('accounting.tvaCollected')}</span><span className="font-medium">{fmt(stats?.tvaCollected ?? 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('accounting.tvaDue')}</span><span className="font-medium">{fmt(stats?.tvaDue ?? 0)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>{t('accounting.netTva')}</span><span>{fmt((stats?.tvaCollected ?? 0) - (stats?.tvaDue ?? 0))}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
