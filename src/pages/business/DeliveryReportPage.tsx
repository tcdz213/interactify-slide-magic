import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveries, getDrivers } from '@/lib/fake-api';
import type { Delivery, Driver } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIWidget } from '@/components/KPIWidget';
import { ArrowLeft, Download, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DeliveryReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => { getDeliveries().then(setDeliveries); getDrivers().then(setDrivers); }, []);

  const total = deliveries.length;
  const delivered = deliveries.filter(d => d.status === 'delivered').length;
  const failed = deliveries.filter(d => d.status === 'failed').length;
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const byStatus = [
    { name: t('deliveries.pending'), value: deliveries.filter(d => d.status === 'pending').length, color: 'hsl(var(--muted-foreground))' },
    { name: t('deliveries.inTransitStatus'), value: deliveries.filter(d => d.status === 'in_transit').length, color: 'hsl(var(--info))' },
    { name: t('orders.delivered'), value: delivered, color: 'hsl(var(--success))' },
    { name: t('deliveries.failed'), value: failed, color: 'hsl(var(--destructive))' },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/business/reports')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('reports.delivery.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('reports.delivery.description')}</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t('common.export')}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('reports.totalDeliveries')} value={total} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('reports.delivered')} value={delivered} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('reports.failedDeliveries')} value={failed} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPIWidget title={t('reports.successRate')} value={`${successRate}%`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.deliveryByStatus')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.driverPerformance')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={drivers}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis />
                <Tooltip /><Bar dataKey="onTimeRate" fill="hsl(var(--primary))" radius={[4,4,0,0]} name={t('drivers.onTimeRate')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('reports.driverSummary')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.driver')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('drivers.deliveriesToday')}</TableHead>
                <TableHead>{t('drivers.completed')}</TableHead>
                <TableHead>{t('drivers.onTimeRate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell><Badge variant="secondary" className={d.status === 'available' ? 'bg-success/10 text-success' : d.status === 'on_route' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}>{t(`drivers.${d.status}`)}</Badge></TableCell>
                  <TableCell>{d.deliveriesToday}</TableCell>
                  <TableCell>{d.completedToday}</TableCell>
                  <TableCell className="font-bold text-primary">{d.onTimeRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
