import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getSalesReportData } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)'];

export default function SalesReportPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['salesReport'], queryFn: getSalesReportData });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const topProductCols: ColumnDef<{ name: string; revenue: number; quantity: number }>[] = [
    { accessorKey: 'name', header: t('products.title') },
    { accessorKey: 'revenue', header: t('accounting.revenue'), cell: ({ row }) => fmt(row.original.revenue) },
    { accessorKey: 'quantity', header: t('invoices.qty') },
  ];

  const topCustomerCols: ColumnDef<{ name: string; spent: number; orders: number }>[] = [
    { accessorKey: 'name', header: t('common.name') },
    { accessorKey: 'spent', header: t('reports.sales.spent'), cell: ({ row }) => fmt(row.original.spent) },
    { accessorKey: 'orders', header: t('orders.title') },
  ];

  const repCols: ColumnDef<{ name: string; orders: number; revenue: number; avgOrderValue: number }>[] = [
    { accessorKey: 'name', header: t('common.name') },
    { accessorKey: 'orders', header: t('orders.title') },
    { accessorKey: 'revenue', header: t('accounting.revenue'), cell: ({ row }) => fmt(row.original.revenue) },
    { accessorKey: 'avgOrderValue', header: t('reports.sales.avgOrder'), cell: ({ row }) => fmt(row.original.avgOrderValue) },
  ];

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('reports.sales.title')} description={t('reports.sales.description')}>
        <div className="flex gap-2">
          <Link to="/business/reports"><Button variant="outline"><ArrowLeft className="h-4 w-4 me-2" />{t('common.back')}</Button></Link>
          <Button variant="outline"><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('reports.sales.revenueByPeriod')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="revenue" className="stroke-primary" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('reports.sales.revenueBySegment')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.revenueBySegment} dataKey="revenue" nameKey="segment" cx="50%" cy="50%" outerRadius={100} label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}>
                  {data.revenueBySegment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('reports.sales.topProducts')}</CardTitle></CardHeader>
          <CardContent><DataTable columns={topProductCols} data={data.topProducts} pageSize={5} compact /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('reports.sales.topCustomers')}</CardTitle></CardHeader>
          <CardContent><DataTable columns={topCustomerCols} data={data.topCustomers} pageSize={5} compact /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('reports.sales.repPerformance')}</CardTitle></CardHeader>
        <CardContent><DataTable columns={repCols} data={data.salesRepPerformance} pageSize={5} compact /></CardContent>
      </Card>
    </div>
  );
}
