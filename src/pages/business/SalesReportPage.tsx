import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getSalesReportData } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)'];

export default function SalesReportPage() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ['salesReport'], queryFn: getSalesReportData });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [compareMode, setCompareMode] = useState(false);

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

  const totalRevenue = data.revenueByMonth.reduce((s, m) => s + m.revenue, 0);
  const avgMonthly = totalRevenue / data.revenueByMonth.length;

  const handleExport = (format: string) => {
    toast.success(t('reports.exportedAs', `Report exported as ${format}`, { format }));
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <PageHeader title={t('reports.sales.title')} description={t('reports.sales.description')}>
        <div className="flex gap-2">
          <Link to="/business/reports"><Button variant="outline"><ArrowLeft className="h-4 w-4 me-2" />{t('common.back')}</Button></Link>
          <Button variant="outline" onClick={() => handleExport('PDF')}><Download className="h-4 w-4 me-2" />PDF</Button>
          <Button variant="outline" onClick={() => handleExport('Excel')}><Download className="h-4 w-4 me-2" />Excel</Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" className="w-40" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-muted-foreground">—</span>
          <Input type="date" className="w-40" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <Button variant={compareMode ? 'default' : 'outline'} size="sm" onClick={() => setCompareMode(!compareMode)}>
          {t('reports.compareMode', 'Compare Mode')}
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">{t('reports.sales.totalRevenue', 'Total Revenue')}</p>
          <p className="text-2xl font-bold">{fmt(totalRevenue)}</p>
          <p className="text-xs text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" />+12.5%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">{t('reports.sales.avgMonthly', 'Avg Monthly')}</p>
          <p className="text-2xl font-bold">{fmt(avgMonthly)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">{t('reports.sales.topProduct', 'Top Product')}</p>
          <p className="text-lg font-bold">{data.topProducts[0]?.name}</p>
          <p className="text-xs text-muted-foreground">{fmt(data.topProducts[0]?.revenue || 0)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">{t('reports.sales.topCustomer', 'Top Customer')}</p>
          <p className="text-lg font-bold">{data.topCustomers[0]?.name}</p>
          <p className="text-xs text-muted-foreground">{fmt(data.topCustomers[0]?.spent || 0)}</p>
        </Card>
      </div>

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
                {compareMode && <Line type="monotone" dataKey="revenue" className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="5 5" />}
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
