import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getInvoice, Invoice } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Send, CreditCard, XCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: fetchedInvoice, isLoading } = useQuery({ queryKey: ['invoice', id], queryFn: () => getInvoice(id!) });

  const [localInvoice, setLocalInvoice] = useState<Invoice | null>(null);
  const invoice = localInvoice || fetchedInvoice;

  // Sync fetched → local on first load
  if (fetchedInvoice && !localInvoice) {
    // We'll use useEffect-free pattern: set on render if needed
  }

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [emailTo, setEmailTo] = useState('');

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const recordPayment = () => {
    if (!invoice) return;
    const amount = Number(paymentAmount);
    if (amount <= 0 || amount > invoice.remainingAmount) {
      toast.error(t('invoices.invalidAmount'));
      return;
    }
    const newPaidAmount = invoice.paidAmount + amount;
    const newRemaining = invoice.total - newPaidAmount;
    const newStatus = newRemaining <= 0 ? 'paid' : 'partial';
    const newPayment = {
      id: `pay-${Date.now()}`, tenantId: 't1', invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber, customerId: invoice.customerId,
      customerName: invoice.customerName, amount, method: paymentMethod as any,
      status: 'completed' as const, reference: paymentRef || `REF-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString(),
    };
    setLocalInvoice({
      ...invoice,
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemaining),
      status: newStatus as any,
      payments: [...invoice.payments, newPayment],
    });
    setPaymentDialogOpen(false);
    setPaymentAmount('');
    setPaymentRef('');
    toast.success(t('invoices.paymentRecorded', { amount: fmt(amount) }));
  };

  const cancelInvoice = () => {
    if (!invoice) return;
    setLocalInvoice({ ...invoice, status: 'cancelled' });
    setCancelDialogOpen(false);
    setCancelReason('');
    toast.success(t('invoices.invoiceCancelled'));
  };

  const downloadPdf = () => {
    if (!invoice) return;
    // Generate a mock PDF as text blob
    const content = [
      `FACTURE: ${invoice.invoiceNumber}`,
      `Client: ${invoice.customerName}`,
      `Date: ${invoice.issueDate}`,
      `Échéance: ${invoice.dueDate}`,
      '',
      'LIGNES:',
      ...invoice.lineItems.map(li => `  ${li.productName} | ${li.quantity} ${li.unit} x ${li.unitPrice} DZD | TVA ${li.tvaRate}% | Total: ${li.total} DZD`),
      '',
      `Sous-total: ${invoice.subtotal} DZD`,
      `TVA 9%: ${invoice.tva9} DZD`,
      `TVA 19%: ${invoice.tva19} DZD`,
      `TOTAL: ${invoice.total} DZD`,
      `Payé: ${invoice.paidAmount} DZD`,
      `Restant: ${invoice.remainingAmount} DZD`,
    ].join('\n');
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${invoice.invoiceNumber}.pdf`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('invoices.pdfDownloaded'));
  };

  const sendEmail = () => {
    if (!emailTo.includes('@')) {
      toast.error(t('invoices.invalidEmail'));
      return;
    }
    toast.success(t('invoices.emailSent', { email: emailTo }));
    setEmailDialogOpen(false);
    setEmailTo('');
  };

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!invoice) return <div className="p-6"><p>{t('common.noData')}</p></div>;

  const isCancellable = ['draft', 'sent'].includes(invoice.status);
  const isPayable = ['sent', 'partial', 'overdue'].includes(invoice.status);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={invoice.invoiceNumber} description={`${t('invoices.for')} ${invoice.customerName}`}>
        <div className="flex gap-2 flex-wrap">
          <Link to="/business/invoices"><Button variant="outline"><ArrowLeft className="h-4 w-4 me-2" />{t('common.back')}</Button></Link>
          <Button variant="outline" onClick={downloadPdf}><Download className="h-4 w-4 me-2" />{t('invoices.downloadPdf')}</Button>
          {invoice.status !== 'cancelled' && (
            <Button variant="outline" onClick={() => setEmailDialogOpen(true)}><Send className="h-4 w-4 me-2" />{t('invoices.sendByEmail')}</Button>
          )}
          {isPayable && (
            <Button onClick={() => { setPaymentAmount(String(invoice.remainingAmount)); setPaymentDialogOpen(true); }}>
              <CreditCard className="h-4 w-4 me-2" />{t('invoices.recordPayment')}
            </Button>
          )}
          {isCancellable && (
            <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="h-4 w-4 me-2" />{t('invoices.cancelInvoice')}
            </Button>
          )}
        </div>
      </PageHeader>

      {invoice.status === 'cancelled' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {t('invoices.invoiceIsCancelled')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('invoices.lineItems')}</CardTitle>
            <StatusBadge status={invoice.status} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-muted-foreground">{t('invoices.issueDate')}:</span> <strong>{invoice.issueDate}</strong></div>
              <div><span className="text-muted-foreground">{t('invoices.dueDate')}:</span> <strong>{invoice.dueDate}</strong></div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('products.title')}</TableHead>
                  <TableHead>{t('invoices.unit')}</TableHead>
                  <TableHead className="text-end">{t('invoices.qty')}</TableHead>
                  <TableHead className="text-end">{t('invoices.unitPrice')}</TableHead>
                  <TableHead className="text-end">{t('invoices.tvaRate')}</TableHead>
                  <TableHead className="text-end">{t('invoices.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-end">{item.quantity}</TableCell>
                    <TableCell className="text-end">{fmt(item.unitPrice)}</TableCell>
                    <TableCell className="text-end">{item.tvaRate}%</TableCell>
                    <TableCell className="text-end font-medium">{fmt(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('invoices.summary')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('invoices.subtotal')}</span><span>{fmt(invoice.subtotal)}</span></div>
              {invoice.tva9 > 0 && <div className="flex justify-between"><span className="text-muted-foreground">TVA 9%</span><span>{fmt(invoice.tva9)}</span></div>}
              {invoice.tva19 > 0 && <div className="flex justify-between"><span className="text-muted-foreground">TVA 19%</span><span>{fmt(invoice.tva19)}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>{t('invoices.total')}</span><span>{fmt(invoice.total)}</span></div>
              <div className="flex justify-between text-green-600"><span>{t('invoices.paid')}</span><span>{fmt(invoice.paidAmount)}</span></div>
              {invoice.remainingAmount > 0 && <div className="flex justify-between text-destructive font-medium"><span>{t('invoices.remaining')}</span><span>{fmt(invoice.remainingAmount)}</span></div>}
            </CardContent>
          </Card>

          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>{t('invoices.paymentHistory')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{fmt(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{p.date} · {p.method}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('invoices.recordPayment')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('payments.amount')} ({t('invoices.remaining')}: {fmt(invoice.remainingAmount)})</Label>
              <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} min={1} max={invoice.remainingAmount} />
            </div>
            <div>
              <Label>{t('payments.method')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('payments.methods.cash')}</SelectItem>
                  <SelectItem value="bank_transfer">{t('payments.methods.bank_transfer')}</SelectItem>
                  <SelectItem value="cheque">{t('payments.methods.cheque')}</SelectItem>
                  <SelectItem value="baridimob">{t('payments.methods.baridimob')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('payments.reference')}</Label>
              <Input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="REF-..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={recordPayment}><CheckCircle className="h-4 w-4 me-2" />{t('invoices.recordPayment')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invoice Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('invoices.cancelInvoice')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('invoices.cancelConfirmation')}</p>
            <div>
              <Label>{t('invoices.cancelReason')}</Label>
              <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder={t('invoices.cancelReasonPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={cancelInvoice} disabled={!cancelReason.trim()}><XCircle className="h-4 w-4 me-2" />{t('invoices.cancelInvoice')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('invoices.sendByEmail')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('common.email')}</Label>
              <Input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="client@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={sendEmail}><Send className="h-4 w-4 me-2" />{t('invoices.send')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
