import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { getPayments, getInvoices, createPayment, refundPayment } from '@/lib/fake-api';
import type { Payment, PaymentMethod, Invoice } from '@/lib/fake-api/types';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { KPIWidget } from '@/components/KPIWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, CreditCard, CheckCircle, AlertCircle, RotateCcw, FileText, Download, Scale } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
  completed: 'success', pending: 'warning', failed: 'error', refunded: 'warning',
};

export default function PaymentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [recordOpen, setRecordOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [reconcileOpen, setReconcileOpen] = useState(false);

  // Record payment form
  const [formInvoiceId, setFormInvoiceId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<PaymentMethod>('cash');
  const [formReference, setFormReference] = useState('');

  const { data: payments = [], isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => getPayments() });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => getInvoices() });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const filteredPayments = payments.filter(p => {
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (dateFrom && p.date < dateFrom) return false;
    if (dateTo && p.date > dateTo) return false;
    if (search && !p.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const failedCount = payments.filter(p => p.status === 'failed').length;
  const refundedAmount = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  // Reconciliation data
  const invoicesWithPayments = invoices.filter(i => i.paidAmount > 0 && i.status !== 'cancelled');
  const reconciledCount = invoicesWithPayments.filter(i => i.remainingAmount === 0).length;
  const unreconciledCount = invoicesWithPayments.filter(i => i.remainingAmount > 0).length;
  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.remainingAmount, 0);

  const handleRecordPayment = async () => {
    if (!formInvoiceId || !formAmount) { toast.error(t('common.error')); return; }
    const invoice = invoices.find(i => i.id === formInvoiceId);
    if (!invoice) return;
    await createPayment({
      invoiceId: formInvoiceId,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount: parseFloat(formAmount),
      method: formMethod,
      status: 'completed',
      reference: formReference || `REF-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    });
    toast.success(t('payments.paymentRecorded', { amount: fmt(parseFloat(formAmount)) }));
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    setRecordOpen(false);
    setFormInvoiceId(''); setFormAmount(''); setFormReference('');
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    await refundPayment(refundTarget.id);
    toast.success(t('payments.refundProcessed', { amount: fmt(refundTarget.amount) }));
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    setRefundTarget(null);
  };

  const handleGenerateReceipt = (payment: Payment) => {
    const receiptContent = [
      '═══════════════════════════════',
      '         REÇU DE PAIEMENT',
      '═══════════════════════════════',
      `Réf: ${payment.reference}`,
      `Date: ${payment.date}`,
      `Client: ${payment.customerName}`,
      `Facture: ${payment.invoiceNumber}`,
      `Montant: ${fmt(payment.amount)}`,
      `Méthode: ${payment.method}`,
      `Statut: ${payment.status}`,
      '═══════════════════════════════',
    ].join('\n');
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `receipt-${payment.reference}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('payments.receiptGenerated', { ref: payment.reference }));
  };

  const handleExportCSV = () => {
    const header = 'Date,Invoice,Customer,Amount,Method,Reference,Status\n';
    const rows = filteredPayments.map(p =>
      `${p.date},"${p.invoiceNumber}","${p.customerName}",${p.amount},"${p.method}","${p.reference}","${p.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported'));
  };

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'date', header: t('payments.date') },
    { accessorKey: 'invoiceNumber', header: t('invoices.number') },
    { accessorKey: 'customerName', header: t('common.name') },
    { accessorKey: 'amount', header: t('payments.amount'), cell: ({ row }) => <span className="font-bold">{fmt(row.original.amount)}</span> },
    { accessorKey: 'method', header: t('payments.method'), cell: ({ row }) => t(`payments.methods.${row.original.method}`) },
    { accessorKey: 'reference', header: t('payments.reference') },
    { accessorKey: 'status', header: t('common.status'), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'actions', header: t('common.actions'), cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => handleGenerateReceipt(row.original)} title={t('payments.receipt')}>
          <FileText className="h-4 w-4" />
        </Button>
        {row.original.status === 'completed' && (
          <Button variant="ghost" size="icon" onClick={() => setRefundTarget(row.original)} title={t('payments.refund')}>
            <RotateCcw className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    )},
  ];

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('payments.title')} description={t('payments.subtitle')}>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
          <Button variant="outline" onClick={() => setReconcileOpen(true)}><Scale className="h-4 w-4 me-2" />{t('payments.reconciliation')}</Button>
          <Button onClick={() => setRecordOpen(true)}><Plus className="h-4 w-4 me-2" />{t('payments.record')}</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget title={t('payments.totalCollected')} value={fmt(totalCollected)} icon={<DollarSign className="h-5 w-5" />} trend="up" trendValue="+12%" />
        <KPIWidget title={t('payments.pendingPayments')} value={fmt(pendingAmount)} icon={<CreditCard className="h-5 w-5" />} />
        <KPIWidget title={t('payments.failedPayments')} value={failedCount} icon={<AlertCircle className="h-5 w-5" />} />
        <KPIWidget title={t('payments.totalRefunded')} value={fmt(refundedAmount)} icon={<RotateCcw className="h-5 w-5" />} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('payments.searchPlaceholder')} />
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t('payments.method')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="cash">{t('payments.methods.cash')}</SelectItem>
            <SelectItem value="bank_transfer">{t('payments.methods.bank_transfer')}</SelectItem>
            <SelectItem value="cheque">{t('payments.methods.cheque')}</SelectItem>
            <SelectItem value="mobile_payment">{t('payments.methods.mobile_payment')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('common.status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="completed">{t('payments.completed')}</SelectItem>
            <SelectItem value="pending">{t('payments.pending')}</SelectItem>
            <SelectItem value="failed">{t('payments.failed')}</SelectItem>
            <SelectItem value="refunded">{t('payments.refundedStatus')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filteredPayments} isLoading={isLoading} searchValue="" searchColumn="customerName" />

      {/* Record Payment Dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('payments.record')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('payments.selectInvoice')}</Label>
              <Select value={formInvoiceId} onValueChange={v => {
                setFormInvoiceId(v);
                const inv = invoices.find(i => i.id === v);
                if (inv) setFormAmount(inv.remainingAmount.toString());
              }}>
                <SelectTrigger><SelectValue placeholder={t('payments.selectInvoice')} /></SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.invoiceNumber} — {i.customerName} ({fmt(i.remainingAmount)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('payments.amount')} (DZD)</Label>
              <Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('payments.method')}</Label>
              <Select value={formMethod} onValueChange={v => setFormMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('payments.methods.cash')}</SelectItem>
                  <SelectItem value="bank_transfer">{t('payments.methods.bank_transfer')}</SelectItem>
                  <SelectItem value="cheque">{t('payments.methods.cheque')}</SelectItem>
                  <SelectItem value="mobile_payment">{t('payments.methods.mobile_payment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('payments.reference')}</Label>
              <Input value={formReference} onChange={e => setFormReference(e.target.value)} placeholder={t('payments.referencePlaceholder')} />
            </div>
            <Button className="w-full" onClick={handleRecordPayment}>{t('payments.recordPayment')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={!!refundTarget} onOpenChange={v => { if (!v) setRefundTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('payments.refund')}</DialogTitle></DialogHeader>
          {refundTarget && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{t('payments.refundConfirm', { amount: fmt(refundTarget.amount), customer: refundTarget.customerName })}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRefundTarget(null)}>{t('common.cancel')}</Button>
                <Button variant="destructive" className="flex-1" onClick={handleRefund}>{t('payments.processRefund')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reconciliation Dialog */}
      <Dialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('payments.reconciliation')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-success">{reconciledCount}</p>
                  <p className="text-xs text-muted-foreground">{t('payments.reconciled')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-warning">{unreconciledCount}</p>
                  <p className="text-xs text-muted-foreground">{t('payments.unreconciled')}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('payments.totalOutstanding')}</span>
                  <span className="text-lg font-bold text-destructive">{fmt(totalOutstanding)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">{t('payments.totalCollected')}</span>
                  <span className="text-lg font-bold text-success">{fmt(totalCollected)}</span>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium">{t('payments.unreconciledInvoices')}</p>
              {invoices.filter(i => i.remainingAmount > 0 && i.status !== 'cancelled').map(inv => (
                <div key={inv.id} className="flex justify-between items-center text-sm border rounded-lg p-2">
                  <span>{inv.invoiceNumber} — {inv.customerName}</span>
                  <Badge variant="outline" className="text-destructive">{fmt(inv.remainingAmount)}</Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
