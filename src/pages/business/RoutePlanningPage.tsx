import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveryRoutes, getDrivers } from '@/lib/fake-api';
import type { DeliveryRoute, Driver } from '@/lib/fake-api/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KPIWidget } from '@/components/KPIWidget';
import RouteMapMock from '@/components/route/RouteMapMock';
import RouteStopList from '@/components/route/RouteStopList';
import { MapPin, Route, CheckCircle, Plus, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function RoutePlanningPage() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newDriver, setNewDriver] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    getDeliveryRoutes().then(setRoutes);
    getDrivers().then(setDrivers);
  }, []);

  const filtered = routes.filter(r => statusFilter === 'all' || r.status === statusFilter);
  const totalStops = routes.reduce((s, r) => s + r.stops.length, 0);
  const completedStops = routes.reduce((s, r) => s + r.stops.filter(st => st.status === 'completed').length, 0);
  const totalDistance = routes.reduce((s, r) => s + r.totalDistance, 0);

  const handleOptimize = (route: DeliveryRoute) => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== route.id || r.stops.length < 2) return r;
      const stops = [...r.stops].sort(() => Math.random() - 0.5);
      return { ...r, stops, totalDistance: Math.round(r.totalDistance * 0.88) };
    }));
    toast.success(t('routes.optimized', 'Route optimized — saved ~12%'));
  };

  const handleMarkStopComplete = (routeId: string, stopIdx: number) => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      const stops = [...r.stops];
      stops[stopIdx] = { ...stops[stopIdx], status: 'completed' };
      const allDone = stops.every(s => s.status === 'completed');
      return { ...r, stops, status: allDone ? 'completed' : r.status };
    }));
    toast.success(t('routes.stopCompleted', 'Stop marked as completed'));
  };

  const handleMoveStop = (routeId: string, fromIdx: number, direction: 'up' | 'down') => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      const stops = [...r.stops];
      const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= stops.length) return r;
      [stops[fromIdx], stops[toIdx]] = [stops[toIdx], stops[fromIdx]];
      return { ...r, stops };
    }));
  };

  const handleCreateRoute = () => {
    if (!newDriver || !newDate) { toast.error(t('common.required')); return; }
    const driver = drivers.find(d => d.id === newDriver);
    const newRoute: DeliveryRoute = {
      id: `route${Date.now()}`, tenantId: 't1', driverId: newDriver,
      driverName: driver?.name || '', date: newDate, stops: [],
      totalDistance: 0, estimatedDuration: '0h', status: 'planned',
    };
    setRoutes(prev => [newRoute, ...prev]);
    toast.success(t('routes.created', 'Route created'));
    setCreateOpen(false); setNewDriver(''); setNewDate('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('routes.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('routes.description')}</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />{t('routes.createRoute', 'Create Route')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('routes.totalRoutes')} value={routes.length} icon={<Route className="h-5 w-5" />} />
        <KPIWidget title={t('routes.totalStops')} value={totalStops} icon={<MapPin className="h-5 w-5" />} />
        <KPIWidget title={t('routes.completedStops')} value={completedStops} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('routes.totalDistance', 'Total Distance')} value={`${totalDistance} km`} icon={<Truck className="h-5 w-5" />} />
      </div>

      {/* SVG Map */}
      <RouteMapMock routes={filtered} />

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="planned">{t('routes.planned')}</SelectItem>
            <SelectItem value="in_progress">{t('routes.in_progress')}</SelectItem>
            <SelectItem value="completed">{t('routes.completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map(route => (
          <RouteStopList
            key={route.id}
            route={route}
            onOptimize={handleOptimize}
            onMoveStop={handleMoveStop}
            onMarkStopComplete={handleMarkStopComplete}
          />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('routes.createRoute', 'Create Route')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('orders.driver')}</Label>
              <Select value={newDriver} onValueChange={setNewDriver}>
                <SelectTrigger><SelectValue placeholder={t('deliveries.chooseDriver', 'Choose a driver...')} /></SelectTrigger>
                <SelectContent>
                  {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name} — {d.vehicle}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t('common.date')}</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
            <Button className="w-full" onClick={handleCreateRoute}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
