import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInvoices } from '@/lib/fake-api';
import type { Invoice } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, AlertTriangle, CheckCircle, CreditCard, Banknote, Camera, Receipt, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SalesCollectionsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [chequePhoto, setChequePhoto] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<{ invoice: Invoice; amount: number; method: string } | null>(null);

  useEffect(() => {
    getInvoices().then(all => setInvoices(all.filter(i => ['overdue', 'partial'].includes(i.status))));
  }, []);

  const totalOutstanding = invoices.reduce((s, i) => s + i.remainingAmount, 0);
  const todayCollected = 85000; // mock

  const getDaysOverdue = (dueDate: string) => {
    const diff = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
    return Math.max(0, diff);
  };

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.remainingAmount.toString());
    setPaymentMethod('cash');
    setChequePhoto(false);
    setShowPayment(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setLastPayment({ invoice: selectedInvoice, amount, method: paymentMethod });

    // Update invoice in local state
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== selectedInvoice.id) return inv;
      const newRemaining = inv.remainingAmount - amount;
      return {
        ...inv,
        remainingAmount: Math.max(0, newRemaining),
        paidAmount: inv.paidAmount + amount,
        status: newRemaining <= 0 ? 'paid' as const : 'partial' as const,
      };
    }).filter(inv => inv.remainingAmount > 0));

    setShowPayment(false);
    toast({ title: t('mobile.sales.paymentRecorded'), description: `${amount.toLocaleString('fr-DZ')} DA` });
    setShowReceipt(true);
  };

  const handleChequePhoto = () => {
    setChequePhoto(true);
    toast({ title: t('mobile.sales.chequePhotoSaved') });
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header with summary */}
      <div>
        <h1 className="text-lg font-bold text-foreground">{t('mobile.sales.collections')}</h1>
        <div className="flex gap-4 mt-1">
          <p className="text-sm text-muted-foreground">
            {t('mobile.sales.totalOutstanding')}: <span className="font-bold text-destructive">{totalOutstanding.toLocaleString('fr-DZ')} DA</span>
          </p>
        </div>
      </div>

      {/* Daily Summary Card */}
      <Card className="border-0 shadow-sm bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('mobile.sales.todayCollected')}</p>
              <p className="text-xl font-bold text-foreground">{todayCollected.toLocaleString('fr-DZ')} DA</p>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">{t('mobile.sales.invoicesLeft')}</p>
              <p className="text-xl font-bold text-foreground">{invoices.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">{t('mobile.sales.noOverdue')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => {
            const days = getDaysOverdue(invoice.dueDate);
            return (
              <Card key={invoice.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                    </div>
                    {days > 0 && (
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {days}j
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('mobile.sales.remaining')}</p>
                      <p className="text-lg font-bold text-foreground">{invoice.remainingAmount.toLocaleString('fr-DZ')} DA</p>
                    </div>
                    <div className="flex gap-2">
                      <a href="tel:+213555010101" className="p-2 rounded-full bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </a>
                      <Button size="sm" className="text-xs h-9 gap-1" onClick={() => openPaymentDialog(invoice)}>
                        <Banknote className="h-3 w-3" />
                        {t('mobile.sales.collectPayment')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('mobile.sales.recordPayment')}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-foreground">{selectedInvoice.customerName}</p>
                <p className="text-xs text-muted-foreground">{selectedInvoice.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {t('mobile.sales.remaining')}: <span className="font-bold">{selectedInvoice.remainingAmount.toLocaleString('fr-DZ')} DA</span>
                </p>
              </div>
              <div>
                <Label className="text-xs">{t('mobile.sales.amount')}</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="text-lg font-bold"
                />
              </div>
              <div>
                <Label className="text-xs">{t('mobile.sales.paymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('mobile.sales.cash')}</SelectItem>
                    <SelectItem value="cheque">{t('mobile.sales.cheque')}</SelectItem>
                    <SelectItem value="bank_transfer">{t('mobile.sales.bankTransfer')}</SelectItem>
                    <SelectItem value="ccp">{t('mobile.sales.ccp')}</SelectItem>
                    <SelectItem value="baridimob">{t('mobile.sales.baridimob')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentMethod === 'cheque' && (
                <Button variant="outline" className="w-full gap-2" onClick={handleChequePhoto}>
                  <Camera className="h-4 w-4" />
                  {chequePhoto ? t('mobile.sales.chequePhotoTaken') : t('mobile.sales.takeChequePhoto')}
                  {chequePhoto && <CheckCircle className="h-4 w-4 text-primary" />}
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleRecordPayment} disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}>
              {t('mobile.sales.confirmPayment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Mock Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t('mobile.sales.receipt')}
            </DialogTitle>
          </DialogHeader>
          {lastPayment && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4 space-y-3 text-center">
                <p className="font-bold text-lg text-foreground">JAWDA</p>
                <div className="border-t border-dashed pt-2 space-y-1 text-sm">
                  <p className="text-foreground">{lastPayment.invoice.customerName}</p>
                  <p className="text-muted-foreground">{lastPayment.invoice.invoiceNumber}</p>
                </div>
                <div className="border-t border-dashed pt-2">
                  <p className="text-xs text-muted-foreground">{t('mobile.sales.amountPaid')}</p>
                  <p className="text-2xl font-bold text-primary">{lastPayment.amount.toLocaleString('fr-DZ')} DA</p>
                </div>
                <div className="border-t border-dashed pt-2 text-xs text-muted-foreground space-y-1">
                  <p>{t('mobile.sales.paymentMethod')}: {lastPayment.method}</p>
                  <p>{new Date().toLocaleString('fr-DZ')}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={() => {
                toast({ title: t('mobile.sales.receiptShared') });
                setShowReceipt(false);
              }}>
                <FileText className="h-4 w-4" />
                {t('mobile.sales.shareReceipt')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
