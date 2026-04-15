import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDeliveries, getDrivers } from '@/lib/fake-api';
import type { Delivery, Driver } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, Clock, MapPin, Package, Phone, Truck, UserCheck, XCircle, Camera, FileText } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_transit: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
};

interface TimelineStep {
  label: string;
  time: string;
  done: boolean;
  icon: React.ReactNode;
}

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignDriver, setReassignDriver] = useState('');
  const [failedOpen, setFailedOpen] = useState(false);
  const [failReason, setFailReason] = useState('');

  useEffect(() => {
    Promise.all([getDeliveries(), getDrivers()]).then(([dels, drvs]) => {
      const found = dels.find(d => d.id === id);
      setDelivery(found || null);
      setDrivers(drvs);
    });
  }, [id]);

  if (!delivery) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('common.loading', 'Loading...')}
      </div>
    );
  }

  const statusIndex = { pending: 0, in_transit: 1, delivered: 3, failed: 2 }[delivery.status] ?? 0;

  const timelineSteps: TimelineStep[] = [
    { label: t('deliveries.timeline.created', 'Order Created'), time: new Date(delivery.createdAt).toLocaleString(), done: statusIndex >= 0, icon: <Package className="h-4 w-4" /> },
    { label: t('deliveries.timeline.dispatched', 'Dispatched'), time: statusIndex >= 1 ? new Date(delivery.createdAt).toLocaleString() : '—', done: statusIndex >= 1, icon: <Truck className="h-4 w-4" /> },
    { label: t('deliveries.timeline.inTransit', 'In Transit'), time: statusIndex >= 1 ? new Date(delivery.estimatedArrival).toLocaleString() : '—', done: statusIndex >= 1, icon: <MapPin className="h-4 w-4" /> },
    { label: delivery.status === 'failed' ? t('deliveries.timeline.failed', 'Failed') : t('deliveries.timeline.delivered', 'Delivered'), time: delivery.actualArrival ? new Date(delivery.actualArrival).toLocaleString() : '—', done: statusIndex >= 3 || delivery.status === 'failed', icon: delivery.status === 'failed' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" /> },
  ];

  const handleReassign = () => {
    if (!reassignDriver) return;
    const driver = drivers.find(d => d.id === reassignDriver);
    setDelivery(prev => prev ? { ...prev, driverId: reassignDriver, driverName: driver?.name || prev.driverName } : prev);
    toast.success(t('deliveries.driverReassigned', { driver: driver?.name }));
    setReassignOpen(false);
    setReassignDriver('');
  };

  const handleMarkDelivered = () => {
    setDelivery(prev => prev ? { ...prev, status: 'delivered' as const, actualArrival: new Date().toISOString() } : prev);
    toast.success(t('deliveries.markedDelivered'));
  };

  const handleMarkFailed = () => {
    if (!failReason) return;
    setDelivery(prev => prev ? { ...prev, status: 'failed' as const } : prev);
    toast.success(t('deliveries.markedFailed'));
    setFailedOpen(false);
    setFailReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/business/deliveries')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('deliveries.deliveryDetail', 'Delivery Detail')}</h1>
          <p className="text-sm text-muted-foreground font-mono">{delivery.orderId.toUpperCase()}</p>
        </div>
        <Badge variant="secondary" className={`text-sm px-3 py-1 ${statusColors[delivery.status]}`}>
          {t(`deliveries.${delivery.status === 'in_transit' ? 'inTransitStatus' : delivery.status}`)}
        </Badge>
      </div>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{t('deliveries.trackingTimeline', 'Tracking Timeline')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-start justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all" style={{ width: `${(statusIndex / 3) * 100}%` }} />

            {timelineSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center flex-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 z-10 ${step.done ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'}`}>
                  {step.icon}
                </div>
                <p className={`text-xs font-medium mt-2 ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{step.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('orders.customer')}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">{t('common.name')}:</span> <span className="font-medium">{delivery.customerName}</span></div>
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><span>{delivery.customerAddress}</span></div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('orders.driver')}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{delivery.driverName}</p>
                <p className="text-xs text-muted-foreground">{t('deliveries.assignedDriver', 'Assigned Driver')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1"><Phone className="h-3.5 w-3.5" />{t('deliveries.callDriver', 'Call Driver')}</Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setReassignOpen(true)}><UserCheck className="h-3.5 w-3.5" />{t('deliveries.reassignDriver', 'Reassign')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* GPS Map Mock */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{t('deliveries.liveMap', 'Live Tracking')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 rounded-lg bg-muted relative overflow-hidden border-2 border-dashed border-border">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                <circle cx="80" cy="60" r="6" className="fill-primary" />
                <text x="90" y="55" className="fill-muted-foreground text-[9px]">{t('deliveries.depot', 'Depot')}</text>
                <line x1="80" y1="60" x2="300" y2="140" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6,4" />
                <circle cx="300" cy="140" r="8" className="fill-destructive animate-pulse" />
                <text x="260" y="160" className="fill-muted-foreground text-[9px]">{delivery.customerName}</text>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Proof of Delivery */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('deliveries.proofOfDelivery', 'Proof of Delivery')}</CardTitle></CardHeader>
          <CardContent>
            {delivery.status === 'delivered' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-success"><CheckCircle className="h-4 w-4" />{t('deliveries.deliveredAt', 'Delivered at')} {delivery.actualArrival ? new Date(delivery.actualArrival).toLocaleString() : '—'}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Camera className="h-3.5 w-3.5 me-1" />{t('deliveries.viewPhoto', 'View Photo')}</Button>
                  <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 me-1" />{t('deliveries.viewSignature', 'Signature')}</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('deliveries.noProofYet', 'Proof will be available after delivery')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {delivery.status === 'in_transit' && (
        <div className="flex gap-3">
          <Button className="gap-2" onClick={handleMarkDelivered}><CheckCircle className="h-4 w-4" />{t('deliveries.markDelivered', 'Mark as Delivered')}</Button>
          <Button variant="destructive" className="gap-2" onClick={() => setFailedOpen(true)}><XCircle className="h-4 w-4" />{t('deliveries.markAsFailed', 'Mark as Failed')}</Button>
        </div>
      )}

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('deliveries.reassignDriver', 'Reassign Driver')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('deliveries.selectDriver', 'Select Driver')}</Label>
              <Select value={reassignDriver} onValueChange={setReassignDriver}>
                <SelectTrigger><SelectValue placeholder={t('deliveries.chooseDriver', 'Choose a driver...')} /></SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status !== 'offline').map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.vehicle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleReassign} disabled={!reassignDriver}>{t('common.confirm')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Failed Dialog */}
      <Dialog open={failedOpen} onOpenChange={setFailedOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('deliveries.markAsFailed', 'Mark as Failed')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('deliveries.failureReason', 'Failure Reason')}</Label>
              <Select value={failReason} onValueChange={setFailReason}>
                <SelectTrigger><SelectValue placeholder={t('deliveries.selectReason', 'Select reason...')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_absent">{t('deliveries.reason_absent', 'Customer absent')}</SelectItem>
                  <SelectItem value="wrong_address">{t('deliveries.reason_address', 'Wrong address')}</SelectItem>
                  <SelectItem value="refused">{t('deliveries.reason_refused', 'Delivery refused')}</SelectItem>
                  <SelectItem value="damaged">{t('deliveries.reason_damaged', 'Goods damaged')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleMarkFailed} disabled={!failReason}>{t('common.confirm')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
