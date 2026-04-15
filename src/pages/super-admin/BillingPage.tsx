import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, CheckCircle, Clock, AlertTriangle, RefreshCw, Download, Calendar, Undo2, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface Invoice { id: string; tenant: string; amount: number; status: 'paid' | 'pending' | 'failed' | 'refunded'; date: string; dueDate: string; }
interface DunningEntry { id: string; tenant: string; amount: number; retryCount: number; nextRetry: string; lastError: string; retrying?: boolean; }

const mockInvoices: Invoice[] = [
  { id: 'INV-001', tenant: 'Bennet Eddar', amount: 4500, status: 'paid', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-002', tenant: 'Atlas BTP', amount: 8900, status: 'paid', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-003', tenant: 'Sahel Distribution', amount: 3200, status: 'pending', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-004', tenant: 'Kabylie Fresh', amount: 5600, status: 'failed', date: '2025-03-01', dueDate: '2025-03-15' },
  { id: 'INV-005', tenant: 'Aurès Trading', amount: 12000, status: 'paid', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-006', tenant: 'Tlemcen Pharma', amount: 2100, status: 'refunded', date: '2025-03-01', dueDate: '2025-03-15' },
];

const paymentAnalytics = [
  { month: 'Nov', collected: 16200, failed: 1800 }, { month: 'Dec', collected: 18500, failed: 1300 },
  { month: 'Jan', collected: 19200, failed: 1300 }, { month: 'Feb', collected: 20500, failed: 700 },
  { month: 'Mar', collected: 21800, failed: 1000 }, { month: 'Apr', collected: 23700, failed: 600 },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = { paid: 'bg-success/10 text-success border-success/20', pending: 'bg-warning/10 text-warning border-warning/20', failed: 'bg-destructive/10 text-destructive border-destructive/20', refunded: 'bg-muted text-muted-foreground border-muted' };
  return map[status] || '';
};

export default function BillingPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [refundInvoice, setRefundInvoice] = useState<Invoice | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [dunning, setDunning] = useState<DunningEntry[]>([
    { id: 'd-1', tenant: 'Kabylie Fresh', amount: 5600, retryCount: 2, nextRetry: '2025-04-12', lastError: 'Card declined' },
    { id: 'd-2', tenant: 'MéditerranéeSupply', amount: 3800, retryCount: 1, nextRetry: '2025-04-11', lastError: 'Insufficient funds' },
  ]);

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 300); return () => clearTimeout(timer); }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.tenant.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const collected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const failed = invoices.filter(i => i.status === 'failed').reduce((s, i) => s + i.amount, 0);
  const refunded = invoices.filter(i => i.status === 'refunded').reduce((s, i) => s + i.amount, 0);

  const handleRetry = async (id: string) => {
    setDunning(prev => prev.map(d => d.id === id ? { ...d, retrying: true } : d));
    await new Promise(r => setTimeout(r, 1500));
    setDunning(prev => prev.map(d => d.id === id ? { ...d, retrying: false, retryCount: d.retryCount + 1 } : d));
    toast.success(t('admin.paymentRetryInitiated', 'Payment retry initiated'));
  };

  const handleRefund = () => {
    if (!refundInvoice) return;
    setInvoices(prev => prev.map(i => i.id === refundInvoice.id ? { ...i, status: 'refunded' as const } : i));
    toast.success(`${refundInvoice.id} ${t('admin.refundProcessed', 'refund processed')}`);
    setRefundInvoice(null); setRefundReason('');
  };

  const handleExport = () => {
    const csv = ['Invoice,Tenant,Amount,Status,Date,Due Date', ...filteredInvoices.map(i => `${i.id},${i.tenant},${i.amount},${i.status},${i.date},${i.dueDate}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'billing-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported', 'Exported'));
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.billing')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.billingDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]"><Calendar className="h-4 w-4 me-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="this_month">{t('dashboard.thisMonth', 'Ce mois')}</SelectItem>
              <SelectItem value="last_month">{t('dashboard.lastMonth', 'Mois dernier')}</SelectItem>
              <SelectItem value="this_quarter">{t('dashboard.thisQuarter', 'Ce trimestre')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.collected')} value={`$${collected.toLocaleString()}`} icon={CheckCircle} variant="primary" />
        <StatCard title={t('admin.pendingPayments')} value={`$${pending.toLocaleString()}`} icon={Clock} variant="accent" />
        <StatCard title={t('admin.failedPayments')} value={`$${failed.toLocaleString()}`} icon={AlertTriangle} variant="warning" />
        <StatCard title={t('admin.refunded')} value={`$${refunded.toLocaleString()}`} icon={DollarSign} />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">{t('admin.invoiceHistory')}</TabsTrigger>
          <TabsTrigger value="dunning">{t('admin.dunningQueue')} <Badge variant="destructive" className="ms-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{dunning.length}</Badge></TabsTrigger>
          <TabsTrigger value="analytics">{t('admin.paymentAnalytics', 'Analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="paid">{t('admin.paid', 'Paid')}</SelectItem>
                    <SelectItem value="pending">{t('admin.pending', 'Pending')}</SelectItem>
                    <SelectItem value="failed">{t('admin.failed', 'Failed')}</SelectItem>
                    <SelectItem value="refunded">{t('admin.refundedStatus', 'Refunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.invoiceId')}</TableHead>
                    <TableHead>{t('nav.tenants')}</TableHead>
                    <TableHead>{t('orders.amount')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('admin.dueDate')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                      <TableCell className="font-medium">{inv.tenant}</TableCell>
                      <TableCell>${inv.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadge(inv.status)}>{inv.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.dueDate}</TableCell>
                      <TableCell>
                        {inv.status === 'paid' && (
                          <Button variant="ghost" size="sm" onClick={() => setRefundInvoice(inv)}><Undo2 className="h-3.5 w-3.5 me-1" />{t('admin.refund', 'Refund')}</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dunning">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />{t('admin.dunningQueue')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('nav.tenants')}</TableHead>
                    <TableHead>{t('orders.amount')}</TableHead>
                    <TableHead>{t('admin.retryCount')}</TableHead>
                    <TableHead>{t('admin.nextRetry')}</TableHead>
                    <TableHead>{t('admin.lastError')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dunning.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.tenant}</TableCell>
                      <TableCell>${d.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="destructive">{d.retryCount}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{d.nextRetry}</TableCell>
                      <TableCell className="text-sm text-destructive">{d.lastError}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" disabled={d.retrying} onClick={() => handleRetry(d.id)}>
                          <RefreshCw className={`h-3 w-3 me-1 ${d.retrying ? 'animate-spin' : ''}`} />{t('admin.retryNow')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.paymentAnalytics', 'Payment Analytics')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`]} />
                  <Bar dataKey="collected" name={t('admin.collected')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name={t('admin.failedPayments')} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={!!refundInvoice} onOpenChange={() => setRefundInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.processRefund', 'Process Refund')}</DialogTitle><DialogDescription>{refundInvoice?.id} — ${refundInvoice?.amount.toLocaleString()}</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <p className="text-sm text-warning font-medium">{t('admin.refundWarning', 'This will refund the full amount to the tenant.')}</p>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.refundReason', 'Reason')}</Label>
              <Textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder={t('admin.refundReasonPlaceholder', 'Why is this being refunded?')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundInvoice(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleRefund} disabled={!refundReason}>{t('admin.confirmRefund', 'Confirm Refund')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
