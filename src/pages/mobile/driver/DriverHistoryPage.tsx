import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveries } from '@/lib/fake-api';
import type { Delivery } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  delivered: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-success/10 text-success' },
  failed: { icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive/10 text-destructive' },
  in_transit: { icon: <Package className="h-4 w-4" />, color: 'bg-info/10 text-info' },
  pending: { icon: <Clock className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
};

export default function DriverHistoryPage() {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => { getDeliveries().then(setDeliveries); }, []);

  // Group by date
  const grouped = deliveries.reduce<Record<string, Delivery[]>>((acc, d) => {
    const date = d.createdAt.slice(0, 10);
    (acc[date] ??= []).push(d);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-lg font-bold text-foreground">{t('mobile.driver.history')}</h1>

      {sortedDates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t('mobile.driver.noHistory')}
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {new Date(date).toLocaleDateString('fr-DZ', { weekday: 'short', day: 'numeric', month: 'short' })}
          </h2>
          {grouped[date].map(delivery => {
            const cfg = statusConfig[delivery.status] ?? statusConfig.pending;
            return (
              <Card key={delivery.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn('flex items-center justify-center h-9 w-9 rounded-full shrink-0', cfg.color)}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{delivery.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{delivery.customerAddress}</p>
                  </div>
                  <Badge variant="secondary" className={cn('text-[10px] shrink-0', cfg.color)}>
                    {t(`mobile.driver.status_${delivery.status}`)}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
