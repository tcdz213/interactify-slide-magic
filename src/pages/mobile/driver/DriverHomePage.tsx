import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDrivers, getDeliveryRoutes } from '@/lib/fake-api';
import type { Driver, DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, Clock, Navigation } from 'lucide-react';

export default function DriverHomePage() {
  const { t } = useTranslation();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);

  useEffect(() => {
    getDrivers().then(d => setDriver(d[0] ?? null));
    getDeliveryRoutes().then(r => setRoute(r.find(rt => rt.status === 'in_progress') ?? r[0] ?? null));
  }, []);

  if (!driver) return null;

  const remaining = driver.deliveriesToday - driver.completedToday;
  const progress = driver.deliveriesToday > 0
    ? Math.round((driver.completedToday / driver.deliveriesToday) * 100)
    : 0;

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {t('mobile.driver.greeting', { name: driver.name.split(' ')[0] })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{driver.deliveriesToday}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('mobile.driver.total')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold text-foreground">{driver.completedToday}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('mobile.driver.completed')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold text-foreground">{remaining}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('mobile.driver.remaining')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('mobile.driver.progress')}</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Start Route CTA */}
      <Link to="/m/driver/route">
        <Button size="lg" className="w-full h-14 text-base gap-2 rounded-xl">
          <Navigation className="h-5 w-5" />
          {t('mobile.driver.startRoute')}
        </Button>
      </Link>

      {/* Current route summary */}
      {route && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t('mobile.driver.currentRoute')}</span>
              <Badge variant="secondary" className="bg-info/10 text-info text-xs">
                {route.stops.length} {t('mobile.driver.stops')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {route.totalDistance} km — {route.estimatedDuration}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
