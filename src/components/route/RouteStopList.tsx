import { useTranslation } from 'react-i18next';
import type { DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, CheckCircle, Clock, Route, Truck, Zap } from 'lucide-react';

const routeStatusColors: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
};

interface Props {
  route: DeliveryRoute;
  onOptimize: (route: DeliveryRoute) => void;
  onMoveStop: (routeId: string, fromIdx: number, direction: 'up' | 'down') => void;
  onMarkStopComplete: (routeId: string, stopIdx: number) => void;
}

export default function RouteStopList({ route, onOptimize, onMoveStop, onMarkStopComplete }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Route className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{route.driverName}</CardTitle>
            <p className="text-xs text-muted-foreground">{route.date} — {route.totalDistance} km — {route.estimatedDuration}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={routeStatusColors[route.status]}>{t(`routes.${route.status}`)}</Badge>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => onOptimize(route)}>
            <Zap className="h-3.5 w-3.5" />{t('routes.optimize', 'Optimize')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {route.stops.map((stop, idx) => (
            <div key={stop.orderId} className={`flex items-center gap-3 rounded-lg border p-3 ${stop.status === 'completed' ? 'bg-success/5 border-success/20' : ''}`}>
              {/* Up/Down buttons */}
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => onMoveStop(route.id, idx, 'up')}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === route.stops.length - 1} onClick={() => onMoveStop(route.id, idx, 'down')}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{stop.customerName}</p>
                <p className="text-xs text-muted-foreground">{stop.address}</p>
              </div>
              <div className="text-xs text-muted-foreground">{stop.estimatedTime}</div>
              {stop.status === 'completed' ? (
                <Badge variant="secondary" className="bg-success/10 text-success">{t('routes.completed')}</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={() => onMarkStopComplete(route.id, idx)}>
                  <CheckCircle className="h-3.5 w-3.5 me-1" />{t('routes.markDone', 'Done')}
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span><Truck className="h-3 w-3 inline me-1" />{t('routes.vehicleCapacity', 'Vehicle Capacity')}: 80%</span>
          <span><Clock className="h-3 w-3 inline me-1" />{t('routes.timeWindow', 'Time Window')}: 08:00 - 17:00</span>
        </div>
      </CardContent>
    </Card>
  );
}
