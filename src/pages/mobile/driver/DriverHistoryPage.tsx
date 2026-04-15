import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveries } from '@/lib/fake-api';
import type { Delivery } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, CheckCircle, XCircle, Clock, TrendingUp, Download, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  delivered: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-success/10 text-success' },
  failed: { icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive/10 text-destructive' },
  in_transit: { icon: <Package className="h-4 w-4" />, color: 'bg-info/10 text-info' },
  pending: { icon: <Clock className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
};

type DateRange = '7d' | '30d' | '90d' | 'all';

export default function DriverHistoryPage() {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  useEffect(() => { getDeliveries().then(setDeliveries); }, []);

  // Filter by date range
  const filtered = useMemo(() => {
    if (dateRange === 'all') return deliveries;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return deliveries.filter(d => new Date(d.createdAt) >= cutoff);
  }, [deliveries, dateRange]);

  // Performance stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const delivered = filtered.filter(d => d.status === 'delivered').length;
    const failed = filtered.filter(d => d.status === 'failed').length;
    const onTimeRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    return { total, delivered, failed, onTimeRate };
  }, [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const g = filtered.reduce<Record<string, Delivery[]>>((acc, d) => {
      const date = d.createdAt.slice(0, 10);
      (acc[date] ??= []).push(d);
      return acc;
    }, {});
    return Object.entries(g).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const handleExport = () => {
    const csv = ['Date,Client,Adresse,Statut']
      .concat(filtered.map(d => `${d.createdAt.slice(0, 10)},${d.customerName},${d.customerAddress},${d.status}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'historique-livraisons.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('mobile.driver.exportDone'));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">{t('mobile.driver.history')}</h1>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          {t('common.export')}
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t('mobile.driver.last7days')}</SelectItem>
            <SelectItem value="30d">{t('mobile.driver.last30days')}</SelectItem>
            <SelectItem value="90d">{t('mobile.driver.last90days')}</SelectItem>
            <SelectItem value="all">{t('mobile.driver.allTime')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-[9px] text-muted-foreground">{t('mobile.driver.total')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-success">{stats.delivered}</p>
            <p className="text-[9px] text-muted-foreground">{t('mobile.driver.delivered')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold text-destructive">{stats.failed}</p>
            <p className="text-[9px] text-muted-foreground">{t('mobile.driver.failedCount')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2.5 text-center">
            <div className="flex items-center justify-center gap-0.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <p className="text-lg font-bold text-primary">{stats.onTimeRate}%</p>
            </div>
            <p className="text-[9px] text-muted-foreground">{t('mobile.driver.onTime')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery List */}
      {grouped.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t('mobile.driver.noHistory')}
        </div>
      )}

      {grouped.map(([date, items]) => (
        <div key={date} className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>
              {new Date(date).toLocaleDateString('fr-DZ', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="text-[10px] normal-case font-normal">{items.length} {t('mobile.driver.deliveriesCount')}</span>
          </h2>
          {items.map(delivery => {
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
