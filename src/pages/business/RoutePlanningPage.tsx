import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveryRoutes } from '@/lib/fake-api';
import type { DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPIWidget } from '@/components/KPIWidget';
import { MapPin, Route, Clock, CheckCircle } from 'lucide-react';

const routeStatusColors: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
};

export default function RoutePlanningPage() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);

  useEffect(() => { getDeliveryRoutes().then(setRoutes); }, []);

  const totalStops = routes.reduce((s, r) => s + r.stops.length, 0);
  const completedStops = routes.reduce((s, r) => s + r.stops.filter(st => st.status === 'completed').length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('routes.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('routes.description')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('routes.totalRoutes')} value={routes.length} icon={<Route className="h-5 w-5" />} />
        <KPIWidget title={t('routes.totalStops')} value={totalStops} icon={<MapPin className="h-5 w-5" />} />
        <KPIWidget title={t('routes.completedStops')} value={completedStops} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('routes.avgDuration')} value={routes.length ? routes[0].estimatedDuration : '—'} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="space-y-4">
        {routes.map(route => (
          <Card key={route.id}>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">{route.driverName}</CardTitle>
                <p className="text-xs text-muted-foreground">{route.date} — {route.totalDistance} km — {route.estimatedDuration}</p>
              </div>
              <Badge variant="secondary" className={routeStatusColors[route.status]}>
                {t(`routes.${route.status}`)}
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('orders.customer')}</TableHead>
                    <TableHead>{t('common.address')}</TableHead>
                    <TableHead>{t('routes.eta')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {route.stops.map((stop, idx) => (
                    <TableRow key={stop.orderId}>
                      <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{stop.customerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{stop.address}</TableCell>
                      <TableCell className="text-xs">{stop.estimatedTime}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={stop.status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                          {stop.status === 'completed' ? t('routes.completed') : t('routes.pending')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
