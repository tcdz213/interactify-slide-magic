import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeliveryRoutes, getDrivers } from '@/lib/fake-api';
import type { DeliveryRoute, Driver } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPIWidget } from '@/components/KPIWidget';
import { MapPin, Route, Clock, CheckCircle, Plus, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const routeStatusColors: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
};

const ROUTE_COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))'];

export default function RoutePlanningPage() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newDriverId, setNewDriverId] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { getDeliveryRoutes().then(setRoutes); getDrivers().then(setDrivers); }, []);

  const totalStops = routes.reduce((s, r) => s + r.stops.length, 0);
  const completedStops = routes.reduce((s, r) => s + r.stops.filter(st => st.status === 'completed').length, 0);
  const totalDistance = routes.reduce((s, r) => s + r.totalDistance, 0);

  const handleCreate = () => {
    if (!newDriverId) { toast.error(t('common.error')); return; }
    const driver = drivers.find(d => d.id === newDriverId);
    const newRoute: DeliveryRoute = {
      id: `route${Date.now()}`, tenantId: 't1', driverId: newDriverId,
      driverName: driver?.name || '', date: newDate, stops: [],
      totalDistance: 0, estimatedDuration: '0h', status: 'planned',
    };
    setRoutes(prev => [...prev, newRoute]);
    toast.success(t('routes.created'));
    setCreateOpen(false); setNewDriverId('');
  };

  const handleOptimize = (routeId: string) => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      const shuffled = [...r.stops].sort(() => Math.random() - 0.5);
      return { ...r, stops: shuffled, totalDistance: Math.round(r.totalDistance * 0.85) };
    }));
    toast.success(t('routes.optimized'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('routes.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('routes.description')}</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />{t('routes.createRoute')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('routes.totalRoutes')} value={routes.length} icon={<Route className="h-5 w-5" />} />
        <KPIWidget title={t('routes.totalStops')} value={totalStops} icon={<MapPin className="h-5 w-5" />} />
        <KPIWidget title={t('routes.completedStops')} value={completedStops} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('routes.totalDistance')} value={`${totalDistance} km`} icon={<Navigation className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="map">
        <TabsList>
          <TabsTrigger value="map">{t('routes.mapView')}</TabsTrigger>
          <TabsTrigger value="list">{t('routes.listView')}</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {/* Visual route map representation */}
              <div className="relative bg-muted/30 rounded-xl border-2 border-dashed border-muted p-8 min-h-[400px]">
                <div className="absolute inset-4">
                  {routes.map((route, routeIdx) => {
                    const color = ROUTE_COLORS[routeIdx % ROUTE_COLORS.length];
                    const positions = route.stops.map((_, stopIdx) => ({
                      x: 10 + (stopIdx * (80 / Math.max(route.stops.length - 1, 1))),
                      y: 15 + routeIdx * 25,
                    }));
                    return (
                      <div key={route.id} className="absolute inset-0">
                        {/* Route line */}
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                          {positions.map((pos, i) => i < positions.length - 1 ? (
                            <line key={i} x1={`${pos.x}%`} y1={`${pos.y}%`} x2={`${positions[i+1].x}%`} y2={`${positions[i+1].y}%`}
                              stroke={color} strokeWidth="2" strokeDasharray={route.status === 'planned' ? '6 3' : 'none'} opacity={0.6} />
                          ) : null)}
                        </svg>
                        {/* Stops */}
                        {route.stops.map((stop, stopIdx) => (
                          <div key={stop.orderId} className="absolute group" style={{
                            left: `${positions[stopIdx].x}%`, top: `${positions[stopIdx].y}%`,
                            transform: 'translate(-50%, -50%)', zIndex: 10,
                          }}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-transform group-hover:scale-125 ${
                              stop.status === 'completed' ? 'bg-success/20 border-success text-success' : 'bg-background border-primary text-primary'
                            }`} style={{ borderColor: color }}>
                              {stopIdx + 1}
                            </div>
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground rounded-lg shadow-lg border p-2 text-xs w-40 z-50">
                              <p className="font-medium">{stop.customerName}</p>
                              <p className="text-muted-foreground">{stop.address}</p>
                              <p className="mt-1">{stop.estimatedTime}</p>
                            </div>
                          </div>
                        ))}
                        {/* Route label */}
                        <div className="absolute text-xs font-medium" style={{ left: '0%', top: `${15 + routeIdx * 25}%`, transform: 'translate(-10%, -50%)' }}>
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: color, color }}>
                            {route.driverName}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {routes.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">{t('routes.noRoutes')}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-4">
          {routes.map(route => (
            <Card key={route.id}>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">{route.driverName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{route.date} — {route.totalDistance} km — {route.estimatedDuration}</p>
                </div>
                <div className="flex items-center gap-2">
                  {route.status === 'planned' && (
                    <Button variant="outline" size="sm" onClick={() => handleOptimize(route.id)}>{t('routes.optimize')}</Button>
                  )}
                  <Badge variant="secondary" className={routeStatusColors[route.status]}>{t(`routes.${route.status}`)}</Badge>
                </div>
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
        </TabsContent>
      </Tabs>

      {/* Create Route Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('routes.createRoute')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('orders.driver')}</Label>
              <Select value={newDriverId} onValueChange={setNewDriverId}>
                <SelectTrigger><SelectValue placeholder={t('routes.selectDriver')} /></SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status === 'available').map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.vehicle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t('common.date')}</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
            <Button className="w-full" onClick={handleCreate}>{t('routes.createRoute')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
