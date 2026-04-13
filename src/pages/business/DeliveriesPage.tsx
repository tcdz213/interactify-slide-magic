import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveries } from '@/lib/fake-api';
import type { Delivery } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIWidget } from '@/components/KPIWidget';
import { Truck, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_transit: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
};

export default function DeliveriesPage() {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { getDeliveries().then(setDeliveries); }, []);

  const filtered = deliveries.filter(d => statusFilter === 'all' || d.status === statusFilter);

  const todayDeliveries = deliveries.length;
  const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
  const completed = deliveries.filter(d => d.status === 'delivered').length;
  const onTimeRate = completed > 0 ? Math.round((deliveries.filter(d => d.status === 'delivered' && d.actualArrival && d.actualArrival <= d.estimatedArrival).length / completed) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('deliveries.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('deliveries.description')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('deliveries.todayDeliveries')} value={todayDeliveries} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.inTransit')} value={inTransit} icon={<Clock className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.completed')} value={completed} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.onTimeRate')} value={`${onTimeRate}%`} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('deliveries.allDeliveries')}</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><Filter className="h-3.5 w-3.5 me-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('deliveries.pending')}</SelectItem>
              <SelectItem value="in_transit">{t('deliveries.inTransitStatus')}</SelectItem>
              <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
              <SelectItem value="failed">{t('deliveries.failed')}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead>{t('orders.customer')}</TableHead>
                <TableHead>{t('orders.driver')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('deliveries.eta')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.orderId.toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{d.customerName}</TableCell>
                  <TableCell>{d.driverName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[d.status]}>
                      {t(`deliveries.${d.status === 'in_transit' ? 'inTransitStatus' : d.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(d.estimatedArrival).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
