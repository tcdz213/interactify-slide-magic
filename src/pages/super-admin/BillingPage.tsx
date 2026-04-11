import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, CheckCircle, Clock, AlertTriangle, RefreshCw, Download } from 'lucide-react';

interface Invoice {
  id: string;
  tenant: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  dueDate: string;
}

interface DunningEntry {
  id: string;
  tenant: string;
  amount: number;
  retryCount: number;
  nextRetry: string;
  lastError: string;
}

const mockInvoices: Invoice[] = [
  { id: 'INV-001', tenant: 'Bennet Eddar', amount: 4500, status: 'paid', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-002', tenant: 'Atlas BTP', amount: 8900, status: 'paid', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-003', tenant: 'Sahel Distribution', amount: 3200, status: 'pending', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-004', tenant: 'Kabylie Fresh', amount: 5600, status: 'failed', date: '2025-03-01', dueDate: '2025-03-15' },
  { id: 'INV-005', tenant: 'Aurès Trading', amount: 12000, status: 'paid', date: '2025-04-01', dueDate: '2025-04-15' },
  { id: 'INV-006', tenant: 'Tlemcen Pharma', amount: 2100, status: 'refunded', date: '2025-03-01', dueDate: '2025-03-15' },
];

const mockDunning: DunningEntry[] = [
  { id: 'd-1', tenant: 'Kabylie Fresh', amount: 5600, retryCount: 2, nextRetry: '2025-04-12', lastError: 'Card declined' },
  { id: 'd-2', tenant: 'MéditerranéeSupply', amount: 3800, retryCount: 1, nextRetry: '2025-04-11', lastError: 'Insufficient funds' },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
    refunded: 'bg-muted text-muted-foreground border-muted',
  };
  return map[status] || '';
};

export default function BillingPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 300); return () => clearTimeout(timer); }, []);

  const collected = mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pending = mockInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const failed = mockInvoices.filter(i => i.status === 'failed').reduce((s, i) => s + i.amount, 0);
  const refunded = mockInvoices.filter(i => i.status === 'refunded').reduce((s, i) => s + i.amount, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.billing')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.billingDescription')}</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.collected')} value={`$${collected.toLocaleString()}`} icon={CheckCircle} variant="primary" />
        <StatCard title={t('admin.pendingPayments')} value={`$${pending.toLocaleString()}`} icon={Clock} variant="accent" />
        <StatCard title={t('admin.failedPayments')} value={`$${failed.toLocaleString()}`} icon={AlertTriangle} />
        <StatCard title={t('admin.refunded')} value={`$${refunded.toLocaleString()}`} icon={DollarSign} />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">{t('admin.invoiceHistory')}</TabsTrigger>
          <TabsTrigger value="dunning">{t('admin.dunningQueue')}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.invoiceId')}</TableHead>
                    <TableHead>{t('nav.tenants')}</TableHead>
                    <TableHead>{t('orders.amount')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('admin.dueDate')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                      <TableCell className="font-medium">{inv.tenant}</TableCell>
                      <TableCell>${inv.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={statusBadge(inv.status)}>{inv.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.dueDate}</TableCell>
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
                  {mockDunning.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.tenant}</TableCell>
                      <TableCell>${d.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="destructive">{d.retryCount}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{d.nextRetry}</TableCell>
                      <TableCell className="text-sm text-destructive">{d.lastError}</TableCell>
                      <TableCell><Button variant="outline" size="sm"><RefreshCw className="h-3 w-3 me-1" />{t('admin.retryNow')}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}