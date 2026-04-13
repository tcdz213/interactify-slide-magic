import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDeliveryRoutes } from '@/lib/fake-api';
import type { DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Navigation, Phone, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DriverRoutePage() {
  const { t } = useTranslation();
  const [route, setRoute] = useState<DeliveryRoute | null>(null);

  useEffect(() => {
    getDeliveryRoutes().then(r => setRoute(r.find(rt => rt.status === 'in_progress') ?? r[0] ?? null));
  }, []);

  if (!route) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {t('mobile.driver.noRoute')}
    </div>
  );

  const completedCount = route.stops.filter(s => s.status === 'completed').length;
  const progressPct = (completedCount / route.stops.length) * 100;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Map placeholder */}
      <div className="relative h-48 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">{t('mobile.driver.mapPlaceholder')}</p>
        </div>
        {/* Progress overlay */}
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

      {/* Stop List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <h2 className="text-sm font-semibold text-foreground">{t('mobile.driver.stopList')}</h2>
        {route.stops.map((stop, idx) => {
          const isCompleted = stop.status === 'completed';
          return (
            <Link key={stop.orderId} to={`/m/driver/delivery/${stop.orderId}`}>
              <Card className={cn(
                'border-0 shadow-sm transition-all',
                isCompleted && 'opacity-60'
              )}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold shrink-0',
                    isCompleted
                      ? 'bg-success/10 text-success'
                      : 'bg-primary/10 text-primary'
                  )}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{stop.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">{stop.estimatedTime}</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] mt-0.5',
                        isCompleted ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? t('mobile.driver.done') : t('mobile.driver.pending')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
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
    </div>
  );
}
