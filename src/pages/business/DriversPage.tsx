import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '@/lib/fake-api';
import type { Driver } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KPIWidget } from '@/components/KPIWidget';
import { Users, Truck, CheckCircle, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success',
  on_route: 'bg-info/10 text-info',
  offline: 'bg-muted text-muted-foreground',
};

export default function DriversPage() {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => { getDrivers().then(setDrivers); }, []);

  const totalDrivers = drivers.length;
  const available = drivers.filter(d => d.status === 'available').length;
  const onRoute = drivers.filter(d => d.status === 'on_route').length;
  const avgOnTime = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.onTimeRate, 0) / drivers.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('drivers.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('drivers.description')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('drivers.totalDrivers')} value={totalDrivers} icon={<Users className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.available')} value={available} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.onRoute')} value={onRoute} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.avgOnTime')} value={`${avgOnTime}%`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map(driver => (
          <Card key={driver.id}>
            <CardHeader className="flex-row items-start justify-between pb-3">
              <div>
                <CardTitle className="text-base">{driver.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{driver.vehicle}</p>
              </div>
              <Badge variant="secondary" className={statusColors[driver.status]}>
                {t(`drivers.${driver.status}`)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">{t('common.phone')}:</span> {driver.phone}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('drivers.deliveriesToday')}</span>
                  <span className="font-medium">{driver.completedToday}/{driver.deliveriesToday}</span>
                </div>
                <Progress value={driver.deliveriesToday > 0 ? (driver.completedToday / driver.deliveriesToday) * 100 : 0} className="h-2" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t('drivers.onTimeRate')}</span>
                <span className="font-bold text-primary">{driver.onTimeRate}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
