import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getAccountingStats, getAgingBuckets, getTopDebtors } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { KPIWidget } from '@/components/KPIWidget';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DollarSign, TrendingUp, TrendingDown, Clock, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import type { TopDebtor } from '@/lib/fake-api';
import { useState } from 'react';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AccountingPage() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState('2024-07-01');
  const [dateTo, setDateTo] = useState('2024-12-31');

  const { data: stats } = useQuery({ queryKey: ['accountingStats'], queryFn: getAccountingStats });
  const { data: aging = [] } = useQuery({ queryKey: ['agingBuckets'], queryFn: getAgingBuckets });
  const { data: debtors = [], isLoading } = useQuery({ queryKey: ['topDebtors'], queryFn: getTopDebtors });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const revenueData = [
    { month: 'Jul', revenue: 180000, expenses: 120000 }, { month: 'Aug', revenue: 210000, expenses: 135000 },
    { month: 'Sep', revenue: 195000, expenses: 125000 }, { month: 'Oct', revenue: 230000, expenses: 140000 },
    { month: 'Nov', revenue: 265000, expenses: 155000 }, { month: 'Dec', revenue: 310000, expenses: 170000 },
  ];

  const cashFlowData = [
    { month: 'Jul', inflow: 195000, outflow: 130000 }, { month: 'Aug', inflow: 220000, outflow: 145000 },
    { month: 'Sep', inflow: 185000, outflow: 140000 }, { month: 'Oct', inflow: 240000, outflow: 150000 },
    { month: 'Nov', inflow: 275000, outflow: 165000 }, { month: 'Dec', inflow: 320000, outflow: 180000 },
  ];

  const pnlData = {
    revenue: stats?.totalRevenue ?? 0,
    cogs: Math.round((stats?.totalRevenue ?? 0) * 0.55),
    grossProfit: Math.round((stats?.totalRevenue ?? 0) * 0.45),
    opex: stats?.totalExpenses ?? 0,
    netProfit: stats?.netProfit ?? 0,
  };

  const balanceSheet = {
    assets: { cash: 450000, receivables: stats?.outstandingReceivables ?? 0, inventory: 128000, fixedAssets: 1200000 },
    liabilities: { payables: 320000, taxPayable: (stats?.tvaCollected ?? 0) - (stats?.tvaDue ?? 0), loans: 500000 },
  };
  const totalAssets = Object.values(balanceSheet.assets).reduce((s, v) => s + v, 0);
  const totalLiabilities = Object.values(balanceSheet.liabilities).reduce((s, v) => s + v, 0);
  const equity = totalAssets - totalLiabilities;

  const journalEntries = [
    { id: 'JE001', date: '2024-12-15', description: t('accounting.saleRevenue'), debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: 85000 },
    { id: 'JE002', date: '2024-12-14', description: t('accounting.purchaseGoods'), debit: 'COGS', credit: 'Accounts Payable', amount: 42000 },
    { id: 'JE003', date: '2024-12-13', description: t('accounting.paymentReceived'), debit: 'Cash', credit: 'Accounts Receivable', amount: 65000 },
    { id: 'JE004', date: '2024-12-12', description: t('accounting.salaryPayment'), debit: 'Salary Expense', credit: 'Cash', amount: 120000 },
    { id: 'JE005', date: '2024-12-11', description: t('accounting.rentPayment'), debit: 'Rent Expense', credit: 'Cash', amount: 35000 },
  ];

  const chartOfAccounts = [
    { code: '1000', name: t('accounting.cashBank'), type: t('accounting.asset'), balance: balanceSheet.assets.cash },
    { code: '1100', name: t('accounting.accountsReceivable'), type: t('accounting.asset'), balance: balanceSheet.assets.receivables },
    { code: '1200', name: t('accounting.inventoryAccount'), type: t('accounting.asset'), balance: balanceSheet.assets.inventory },
    { code: '1500', name: t('accounting.fixedAssetsAccount'), type: t('accounting.asset'), balance: balanceSheet.assets.fixedAssets },
    { code: '2000', name: t('accounting.accountsPayable'), type: t('accounting.liability'), balance: balanceSheet.liabilities.payables },
    { code: '2100', name: t('accounting.taxPayable'), type: t('accounting.liability'), balance: balanceSheet.liabilities.taxPayable },
    { code: '3000', name: t('accounting.equityAccount'), type: t('accounting.equityType'), balance: equity },
    { code: '4000', name: t('accounting.salesRevenue'), type: t('accounting.revenueType'), balance: pnlData.revenue },
    { code: '5000', name: t('accounting.cogsAccount'), type: t('accounting.expenseType'), balance: pnlData.cogs },
  ];

  const debtorCols: ColumnDef<TopDebtor>[] = [
    { accessorKey: 'customerName', header: t('common.name') },
    { accessorKey: 'outstanding', header: t('accounting.outstanding'), cell: ({ row }) => fmt(row.original.outstanding) },
    { accessorKey: 'daysOverdue', header: t('accounting.daysOverdue'), cell: ({ row }) => <span className={row.original.daysOverdue > 30 ? 'text-destructive font-medium' : ''}>{row.original.daysOverdue} {t('accounting.days')}</span> },
  ];

  const handleExport = (type: string) => toast.success(t('accounting.exported', { type }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('accounting.title')} description={t('accounting.subtitle')}>
        <div className="flex items-center gap-2">
          <Input type="date" className="w-40" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-muted-foreground">→</span>
          <Input type="date" className="w-40" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <Button variant="outline" size="icon" onClick={() => handleExport('PDF')}><Download className="h-4 w-4" /></Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget title={t('accounting.revenue')} value={fmt(stats?.totalRevenue ?? 0)} icon={<DollarSign className="h-5 w-5" />} trend="up" trendValue="+18%" />
        <KPIWidget title={t('accounting.expenses')} value={fmt(stats?.totalExpenses ?? 0)} icon={<TrendingDown className="h-5 w-5" />} />
        <KPIWidget title={t('accounting.netProfit')} value={fmt(stats?.netProfit ?? 0)} icon={<TrendingUp className="h-5 w-5" />} trend="up" trendValue="+24%" />
        <KPIWidget title={t('accounting.dso')} value={`${stats?.dso ?? 0} ${t('accounting.days')}`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{t('accounting.overview')}</TabsTrigger>
          <TabsTrigger value="pnl">{t('accounting.pnl')}</TabsTrigger>
          <TabsTrigger value="balance">{t('accounting.balanceSheet')}</TabsTrigger>
          <TabsTrigger value="cashflow">{t('accounting.cashFlow')}</TabsTrigger>
          <TabsTrigger value="journal">{t('accounting.journalEntries')}</TabsTrigger>
          <TabsTrigger value="coa">{t('accounting.chartOfAccounts')}</TabsTrigger>
          <TabsTrigger value="tax">{t('accounting.taxSummary')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
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
        </TabsContent>

        <TabsContent value="pnl" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('accounting.pnl')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('P&L')}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="font-bold text-lg" colSpan={2}>{t('accounting.revenueType')}</TableCell></TableRow>
                  <TableRow><TableCell className="ps-8">{t('accounting.salesRevenue')}</TableCell><TableCell className="text-end font-medium">{fmt(pnlData.revenue)}</TableCell></TableRow>
                  <TableRow className="border-t"><TableCell className="font-bold text-lg" colSpan={2}>{t('accounting.costOfGoods')}</TableCell></TableRow>
                  <TableRow><TableCell className="ps-8">{t('accounting.cogsAccount')}</TableCell><TableCell className="text-end font-medium text-destructive">({fmt(pnlData.cogs)})</TableCell></TableRow>
                  <TableRow className="bg-muted/50"><TableCell className="font-bold">{t('accounting.grossProfit')}</TableCell><TableCell className="text-end font-bold text-success">{fmt(pnlData.grossProfit)}</TableCell></TableRow>
                  <TableRow className="border-t"><TableCell className="font-bold text-lg" colSpan={2}>{t('accounting.operatingExpenses')}</TableCell></TableRow>
                  <TableRow><TableCell className="ps-8">{t('accounting.expenses')}</TableCell><TableCell className="text-end font-medium text-destructive">({fmt(pnlData.opex)})</TableCell></TableRow>
                  <TableRow className="bg-primary/5 border-t-2"><TableCell className="font-bold text-lg">{t('accounting.netProfit')}</TableCell><TableCell className="text-end font-bold text-lg text-success">{fmt(pnlData.netProfit)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>{t('accounting.assets')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>{t('accounting.cashBank')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.assets.cash)}</TableCell></TableRow>
                    <TableRow><TableCell>{t('accounting.accountsReceivable')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.assets.receivables)}</TableCell></TableRow>
                    <TableRow><TableCell>{t('accounting.inventoryAccount')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.assets.inventory)}</TableCell></TableRow>
                    <TableRow><TableCell>{t('accounting.fixedAssetsAccount')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.assets.fixedAssets)}</TableCell></TableRow>
                    <TableRow className="bg-muted/50 font-bold"><TableCell>{t('accounting.totalAssets')}</TableCell><TableCell className="text-end">{fmt(totalAssets)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('accounting.liabilitiesEquity')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>{t('accounting.accountsPayable')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.liabilities.payables)}</TableCell></TableRow>
                    <TableRow><TableCell>{t('accounting.taxPayable')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.liabilities.taxPayable)}</TableCell></TableRow>
                    <TableRow><TableCell>{t('accounting.loans')}</TableCell><TableCell className="text-end">{fmt(balanceSheet.liabilities.loans)}</TableCell></TableRow>
                    <TableRow className="border-t font-bold"><TableCell>{t('accounting.totalLiabilities')}</TableCell><TableCell className="text-end">{fmt(totalLiabilities)}</TableCell></TableRow>
                    <TableRow><TableCell>{t('accounting.equityAccount')}</TableCell><TableCell className="text-end">{fmt(equity)}</TableCell></TableRow>
                    <TableRow className="bg-muted/50 font-bold"><TableCell>{t('accounting.totalLiabilitiesEquity')}</TableCell><TableCell className="text-end">{fmt(totalAssets)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('accounting.cashFlow')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="inflow" name={t('accounting.inflow')} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" name={t('accounting.outflow')} fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('accounting.journalEntries')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('accounting.description')}</TableHead>
                    <TableHead>{t('accounting.debit')}</TableHead>
                    <TableHead>{t('accounting.credit')}</TableHead>
                    <TableHead>{t('payments.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.map(je => (
                    <TableRow key={je.id}>
                      <TableCell className="font-mono text-xs">{je.id}</TableCell>
                      <TableCell>{je.date}</TableCell>
                      <TableCell>{je.description}</TableCell>
                      <TableCell className="text-sm">{je.debit}</TableCell>
                      <TableCell className="text-sm">{je.credit}</TableCell>
                      <TableCell className="font-bold">{fmt(je.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coa" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('accounting.chartOfAccounts')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounting.accountCode')}</TableHead>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('accounting.balance')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartOfAccounts.map(a => (
                    <TableRow key={a.code}>
                      <TableCell className="font-mono">{a.code}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                      <TableCell className="font-bold">{fmt(a.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('accounting.taxDeclaration')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('G50')}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('accounting.taxItem')}</TableHead>
                    <TableHead className="text-end">{t('payments.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>{t('accounting.tvaCollected')} (19%)</TableCell><TableCell className="text-end">{fmt((stats?.tvaCollected ?? 0) * 0.7)}</TableCell></TableRow>
                  <TableRow><TableCell>{t('accounting.tvaCollected')} (9%)</TableCell><TableCell className="text-end">{fmt((stats?.tvaCollected ?? 0) * 0.3)}</TableCell></TableRow>
                  <TableRow className="font-bold"><TableCell>{t('accounting.totalTvaCollected')}</TableCell><TableCell className="text-end">{fmt(stats?.tvaCollected ?? 0)}</TableCell></TableRow>
                  <TableRow><TableCell>{t('accounting.tvaDue')}</TableCell><TableCell className="text-end text-destructive">({fmt(stats?.tvaDue ?? 0)})</TableCell></TableRow>
                  <TableRow className="bg-primary/5 font-bold border-t-2"><TableCell>{t('accounting.netTva')}</TableCell><TableCell className="text-end">{fmt((stats?.tvaCollected ?? 0) - (stats?.tvaDue ?? 0))}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
