import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDeliveryRoutes } from '@/lib/fake-api';
import type { DeliveryRoute, RouteStop } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Navigation, Phone, CheckCircle, SkipForward, ArrowUp, ArrowDown, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DriverRoutePage() {
  const { t } = useTranslation();
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [skipDialog, setSkipDialog] = useState<{ open: boolean; stopIdx: number }>({ open: false, stopIdx: -1 });
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    getDeliveryRoutes().then(r => setRoute(r.find(rt => rt.status === 'in_progress') ?? r[0] ?? null));
  }, []);

  const markCompleted = useCallback((idx: number) => {
    if (!route) return;
    const newStops = [...route.stops];
    newStops[idx] = { ...newStops[idx], status: 'completed' };
    setRoute({ ...route, stops: newStops });
    toast.success(t('mobile.driver.stopCompleted', { name: newStops[idx].customerName }));
  }, [route, t]);

  const skipStop = useCallback(() => {
    if (!route || skipDialog.stopIdx < 0) return;
    const newStops = route.stops.filter((_, i) => i !== skipDialog.stopIdx);
    newStops.push({ ...route.stops[skipDialog.stopIdx], estimatedTime: '--:--' });
    setRoute({ ...route, stops: newStops });
    setSkipDialog({ open: false, stopIdx: -1 });
    setSkipReason('');
    toast.info(t('mobile.driver.stopSkipped'));
  }, [route, skipDialog, t]);

  const moveStop = useCallback((idx: number, dir: -1 | 1) => {
    if (!route) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= route.stops.length) return;
    const newStops = [...route.stops];
    [newStops[idx], newStops[newIdx]] = [newStops[newIdx], newStops[idx]];
    setRoute({ ...route, stops: newStops });
  }, [route]);

  if (!route) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {t('mobile.driver.noRoute')}
    </div>
  );

  const completedCount = route.stops.filter(s => s.status === 'completed').length;
  const progressPct = (completedCount / route.stops.length) * 100;
  const nextPending = route.stops.findIndex(s => s.status !== 'completed');

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Map placeholder */}
      <div className="relative h-48 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">{t('mobile.driver.mapPlaceholder')}</p>
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-card/90 backdrop-blur px-4 py-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {completedCount} / {route.stops.length} {t('mobile.driver.stopsCompleted')}
            </span>
            <span className="font-medium text-foreground">{route.totalDistance} km</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>
      </div>

      {/* ETA Banner */}
      {nextPending >= 0 && (
        <div className="bg-primary/5 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs text-foreground">
              {t('mobile.driver.nextStop')}: <strong>{route.stops[nextPending].customerName}</strong>
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px]">{route.stops[nextPending].estimatedTime}</Badge>
        </div>
      )}

      {/* Stop List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <h2 className="text-sm font-semibold text-foreground">{t('mobile.driver.stopList')}</h2>
        {route.stops.map((stop, idx) => {
          const isCompleted = stop.status === 'completed';
          const isNext = idx === nextPending;
          return (
            <Card key={`${stop.orderId}-${idx}`} className={cn(
              'border-0 shadow-sm transition-all',
              isCompleted && 'opacity-50',
              isNext && 'ring-2 ring-primary/30'
            )}>
              <CardContent className="p-3 space-y-2">
                <Link to={`/m/driver/delivery/${stop.orderId}`} className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold shrink-0',
                    isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  )}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{stop.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">{stop.estimatedTime}</p>
                    <Badge variant="secondary" className={cn(
                      'text-[10px] mt-0.5',
                      isCompleted ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    )}>
                      {isCompleted ? t('mobile.driver.done') : t('mobile.driver.pending')}
                    </Badge>
                  </div>
                </Link>

                {/* Actions row */}
                {!isCompleted && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button size="sm" variant="default" className="h-7 text-xs flex-1 gap-1" onClick={() => markCompleted(idx)}>
                      <CheckCircle className="h-3 w-3" /> {t('mobile.driver.markDone')}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setSkipDialog({ open: true, stopIdx: idx })}>
                      <SkipForward className="h-3 w-3" />
                    </Button>
                    <a href="tel:+213555010101">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </a>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveStop(idx, -1)} disabled={idx === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveStop(idx, 1)} disabled={idx === route.stops.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigate CTA */}
      <div className="sticky bottom-20 p-4">
        <Button size="lg" className="w-full h-12 gap-2 rounded-xl">
          <Navigation className="h-5 w-5" />
          {t('mobile.driver.navigate')}
        </Button>
      </div>

      {/* Skip Dialog */}
      <Dialog open={skipDialog.open} onOpenChange={(o) => !o && setSkipDialog({ open: false, stopIdx: -1 })}>
        <DialogContent className="max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t('mobile.driver.skipStop')}</DialogTitle>
          </DialogHeader>
          <Select value={skipReason} onValueChange={setSkipReason}>
            <SelectTrigger><SelectValue placeholder={t('mobile.driver.selectReason')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="closed">{t('mobile.driver.reason_closed')}</SelectItem>
              <SelectItem value="unreachable">{t('mobile.driver.reason_unreachable')}</SelectItem>
              <SelectItem value="refused">{t('mobile.driver.reason_refused')}</SelectItem>
              <SelectItem value="other">{t('mobile.driver.reason_other')}</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialog({ open: false, stopIdx: -1 })}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={skipStop} disabled={!skipReason}>{t('mobile.driver.confirmSkip')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
