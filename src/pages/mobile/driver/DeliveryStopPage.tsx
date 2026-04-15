import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDeliveryRoutes, getOrders } from '@/lib/fake-api';
import type { RouteStop, Order } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Camera, PenLine, ChevronRight, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DeliveryStopPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stop, setStop] = useState<RouteStop | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signatureTaken, setSignatureTaken] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered' | 'failed' | 'partial'>('pending');
  const [failDialog, setFailDialog] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [failNotes, setFailNotes] = useState('');

  // Mock delivery items
  const items = [
    { id: '1', name: 'Couscous Fin 1kg', qty: 40, unit: 'Pack (12)' },
    { id: '2', name: 'Huile de Tournesol 5L', qty: 60, unit: 'Pièce' },
    { id: '3', name: 'Lait UHT 1L', qty: 24, unit: 'Pack (24)' },
  ];

  useEffect(() => {
    getDeliveryRoutes().then(routes => {
      for (const r of routes) {
        const found = r.stops.find(s => s.orderId === id);
        if (found) { setStop(found); break; }
      }
    });
    if (id) getOrders().then(orders => setOrder(orders.find(o => o.id === id) ?? null));
  }, [id]);

  if (!stop) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {t('common.loading')}
    </div>
  );

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const allChecked = checkedItems.size === items.length;
  const someChecked = checkedItems.size > 0 && !allChecked;

  const handlePhoto = () => {
    setPhotoTaken(true);
    toast.success(t('mobile.driver.photoSaved'));
  };

  const handleSignature = () => {
    setSignatureTaken(true);
    toast.success(t('mobile.driver.signatureSaved'));
  };

  const handleComplete = () => {
    if (someChecked) {
      // Partial delivery
      setDeliveryStatus('partial');
      toast.success(t('mobile.driver.partialDeliveryDone'));
    } else {
      setDeliveryStatus('delivered');
      toast.success(t('mobile.driver.deliveryDone'));
    }
    setTimeout(() => navigate('/m/driver/route'), 1500);
  };

  const handleFail = () => {
    if (!failReason) return;
    setDeliveryStatus('failed');
    setFailDialog(false);
    toast.error(t('mobile.driver.deliveryFailed'));
    setTimeout(() => navigate('/m/driver/route'), 1500);
  };

  const isCompleted = deliveryStatus !== 'pending';

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Customer Info */}
      <div className="bg-primary/5 p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">{stop.customerName}</h1>
          {isCompleted && (
            <Badge className={cn(
              deliveryStatus === 'delivered' && 'bg-success/10 text-success',
              deliveryStatus === 'partial' && 'bg-warning/10 text-warning',
              deliveryStatus === 'failed' && 'bg-destructive/10 text-destructive',
            )}>
              {t(`mobile.driver.status_${deliveryStatus}`)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{stop.address}</p>

        {/* Customer notes mock */}
        <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
          {t('mobile.driver.customerNote')}: {t('mobile.driver.customerNoteMock')}
        </div>

        <div className="flex gap-2 pt-2">
          <a href="tel:+213555010101" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-lg">
              <Phone className="h-3.5 w-3.5" />
              {t('mobile.driver.callCustomer')}
            </Button>
          </a>
          <a href="sms:+213555010101" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-lg">
              {t('mobile.driver.smsCustomer')}
            </Button>
          </a>
        </div>
      </div>

      {/* Items Checklist */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t('mobile.driver.itemsList')}</h2>
          <span className="text-xs text-muted-foreground">
            {checkedItems.size}/{items.length} {t('mobile.driver.verified')}
          </span>
        </div>

        {items.map(item => (
          <Card
            key={item.id}
            className={cn(
              'border-0 shadow-sm cursor-pointer transition-all',
              checkedItems.has(item.id) && 'bg-success/5',
              isCompleted && 'pointer-events-none opacity-60'
            )}
            onClick={() => !isCompleted && toggleItem(item.id)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <Checkbox
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => !isCompleted && toggleItem(item.id)}
                className="h-5 w-5"
                disabled={isCompleted}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.qty} × {item.unit}</p>
              </div>
              {checkedItems.has(item.id) && <CheckCircle className="h-4 w-4 text-success" />}
            </CardContent>
          </Card>
        ))}

        {/* Proof Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant={photoTaken ? 'default' : 'outline'}
            className={cn('h-12 gap-2 rounded-xl', photoTaken && 'bg-success hover:bg-success/90 text-success-foreground')}
            onClick={handlePhoto}
            disabled={isCompleted}
          >
            <Camera className="h-4 w-4" />
            {photoTaken ? t('mobile.driver.photoTaken') : t('mobile.driver.takePhoto')}
          </Button>
          <Button
            variant={signatureTaken ? 'default' : 'outline'}
            className={cn('h-12 gap-2 rounded-xl', signatureTaken && 'bg-success hover:bg-success/90 text-success-foreground')}
            onClick={handleSignature}
            disabled={isCompleted}
          >
            <PenLine className="h-4 w-4" />
            {signatureTaken ? t('mobile.driver.signatureDone') : t('mobile.driver.signature')}
          </Button>
        </div>

        {/* Collapsible Notes */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1 text-sm text-primary font-medium mt-2"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', showNotes && 'rotate-90')} />
          {t('mobile.driver.addNotes')}
        </button>
        {showNotes && (
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('mobile.driver.notesPlaceholder')}
            className="min-h-[80px]"
            disabled={isCompleted}
          />
        )}
      </div>

      {/* CTAs */}
      {!isCompleted && (
        <div className="sticky bottom-20 p-4 space-y-2">
          <Button
            size="lg"
            disabled={checkedItems.size === 0}
            className={cn(
              'w-full h-14 text-base rounded-xl transition-all',
              allChecked ? 'bg-success hover:bg-success/90 text-success-foreground' : ''
            )}
            onClick={handleComplete}
          >
            {allChecked
              ? t('mobile.driver.completeDelivery')
              : someChecked
                ? t('mobile.driver.partialDelivery')
                : t('mobile.driver.checkAllItems')}
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="w-full h-12 text-base rounded-xl gap-2"
            onClick={() => setFailDialog(true)}
          >
            <XCircle className="h-5 w-5" />
            {t('mobile.driver.markFailed')}
          </Button>
        </div>
      )}

      {/* Fail Dialog */}
      <Dialog open={failDialog} onOpenChange={setFailDialog}>
        <DialogContent className="max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t('mobile.driver.failDelivery')}</DialogTitle>
          </DialogHeader>
          <Select value={failReason} onValueChange={setFailReason}>
            <SelectTrigger><SelectValue placeholder={t('mobile.driver.selectReason')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="absent">{t('mobile.driver.reason_absent')}</SelectItem>
              <SelectItem value="refused">{t('mobile.driver.reason_refused')}</SelectItem>
              <SelectItem value="wrong_address">{t('mobile.driver.reason_wrongAddress')}</SelectItem>
              <SelectItem value="damaged">{t('mobile.driver.reason_damaged')}</SelectItem>
              <SelectItem value="other">{t('mobile.driver.reason_other')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={failNotes}
            onChange={e => setFailNotes(e.target.value)}
            placeholder={t('mobile.driver.failNotesPlaceholder')}
            className="min-h-[60px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailDialog(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleFail} disabled={!failReason}>{t('common.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
