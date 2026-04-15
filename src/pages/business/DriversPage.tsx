import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers, getDeliveryRoutes } from '@/lib/fake-api';
import type { Driver, DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KPIWidget } from '@/components/KPIWidget';
import { Users, Truck, CheckCircle, Clock, Plus, Pencil, Trash2, BarChart3, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success',
  on_route: 'bg-info/10 text-info',
  offline: 'bg-muted text-muted-foreground',
};

export default function DriversPage() {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formStatus, setFormStatus] = useState<Driver['status']>('available');
  const [formLicense, setFormLicense] = useState('');

  useEffect(() => {
    getDrivers().then(setDrivers);
    getDeliveryRoutes().then(setRoutes);
  }, []);

  const resetForm = () => { setFormName(''); setFormPhone(''); setFormVehicle(''); setFormStatus('available'); setFormLicense(''); setEditing(null); };

  const openEdit = (d: Driver) => {
    setEditing(d); setFormName(d.name); setFormPhone(d.phone); setFormVehicle(d.vehicle); setFormStatus(d.status); setFormLicense(''); setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formPhone) { toast.error(t('common.required')); return; }
    if (editing) {
      setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, name: formName, phone: formPhone, vehicle: formVehicle, status: formStatus } : d));
      toast.success(t('drivers.updated', 'Driver updated'));
    } else {
      const newDriver: Driver = {
        id: `drv${Date.now()}`, tenantId: 't1', name: formName, phone: formPhone,
        vehicle: formVehicle, status: formStatus, deliveriesToday: 0, completedToday: 0, onTimeRate: 100,
      };
      setDrivers(prev => [...prev, newDriver]);
      toast.success(t('drivers.created', 'Driver added'));
    }
    setDialogOpen(false); resetForm();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDrivers(prev => prev.filter(d => d.id !== deleteTarget.id));
    toast.success(t('drivers.deleted', 'Driver removed'));
    setDeleteTarget(null);
  };

  const filtered = drivers.filter(d => statusFilter === 'all' || d.status === statusFilter);
  const totalDrivers = drivers.length;
  const available = drivers.filter(d => d.status === 'available').length;
  const onRoute = drivers.filter(d => d.status === 'on_route').length;
  const avgOnTime = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.onTimeRate, 0) / drivers.length) : 0;

  // Performance data for selected driver
  const driverRoutes = selectedDriver ? routes.filter(r => r.driverId === selectedDriver.id) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('drivers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('drivers.description')}</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />{t('drivers.addDriver', 'Add Driver')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('drivers.totalDrivers')} value={totalDrivers} icon={<Users className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.available')} value={available} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.onRoute')} value={onRoute} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.avgOnTime')} value={`${avgOnTime}%`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="available">{t('drivers.available')}</SelectItem>
            <SelectItem value="on_route">{t('drivers.on_route')}</SelectItem>
            <SelectItem value="offline">{t('drivers.offline')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">{t('warehouses.cardView', 'Cards')}</TabsTrigger>
          <TabsTrigger value="table">{t('warehouses.tableView', 'Table')}</TabsTrigger>
          <TabsTrigger value="performance">{t('drivers.performance', 'Performance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(driver => (
              <Card key={driver.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDriver(driver)}>
                <CardHeader className="flex-row items-start justify-between pb-3">
                  <div>
                    <CardTitle className="text-base">{driver.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{driver.vehicle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusColors[driver.status]}>{t(`drivers.${driver.status}`)}</Badge>
                    <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(driver)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(driver)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm"><span className="text-muted-foreground">{t('common.phone')}:</span> {driver.phone}</div>
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
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.phone')}</TableHead>
                    <TableHead>{t('drivers.vehicle', 'Vehicle')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('drivers.deliveriesToday')}</TableHead>
                    <TableHead>{t('drivers.onTimeRate')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.phone}</TableCell>
                      <TableCell>{d.vehicle}</TableCell>
                      <TableCell><Badge variant="secondary" className={statusColors[d.status]}>{t(`drivers.${d.status}`)}</Badge></TableCell>
                      <TableCell>{d.completedToday}/{d.deliveriesToday}</TableCell>
                      <TableCell className="font-bold text-primary">{d.onTimeRate}%</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />{t('drivers.performanceAnalytics', 'Performance Analytics')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('drivers.totalDeliveries', 'Total Deliveries')}</TableHead>
                    <TableHead>{t('drivers.completedCount', 'Completed')}</TableHead>
                    <TableHead>{t('drivers.onTimeRate')}</TableHead>
                    <TableHead>{t('drivers.rating', 'Rating')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.deliveriesToday * 22}</TableCell>
                      <TableCell>{d.completedToday * 22}</TableCell>
                      <TableCell><span className={d.onTimeRate >= 90 ? 'text-success font-bold' : d.onTimeRate >= 75 ? 'text-warning font-bold' : 'text-destructive font-bold'}>{d.onTimeRate}%</span></TableCell>
                      <TableCell>{'⭐'.repeat(Math.round(d.onTimeRate / 20))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={v => { if (!v) setSelectedDriver(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedDriver?.name}</DialogTitle></DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('common.phone')}:</span> {selectedDriver.phone}</div>
                <div><span className="text-muted-foreground">{t('drivers.vehicle', 'Vehicle')}:</span> {selectedDriver.vehicle}</div>
                <div><span className="text-muted-foreground">{t('common.status')}:</span> <Badge variant="secondary" className={statusColors[selectedDriver.status]}>{t(`drivers.${selectedDriver.status}`)}</Badge></div>
                <div><span className="text-muted-foreground">{t('drivers.onTimeRate')}:</span> {selectedDriver.onTimeRate}%</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">{t('drivers.assignedRoutes', 'Assigned Routes')}</h4>
                {driverRoutes.length > 0 ? driverRoutes.map(r => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg p-3 mb-2">
                    <div>
                      <p className="text-sm font-medium">{r.date} — {r.stops.length} {t('mobile.driver.stops')}</p>
                      <p className="text-xs text-muted-foreground">{r.totalDistance} km — {r.estimatedDuration}</p>
                    </div>
                    <Badge variant="secondary">{t(`routes.${r.status}`)}</Badge>
                  </div>
                )) : <p className="text-xs text-muted-foreground">{t('drivers.noRoutes', 'No routes assigned')}</p>}
              </div>
              {/* Schedule Mock */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" />{t('drivers.schedule', 'Weekly Schedule')}</h4>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className={`rounded p-2 ${i < 5 ? 'bg-success/10 text-success' : i === 5 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) resetForm(); setDialogOpen(v); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('drivers.addDriver', 'Add Driver')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>{t('common.name')}</Label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('common.phone')}</Label><Input value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('drivers.vehicle', 'Vehicle')}</Label><Input value={formVehicle} onChange={e => setFormVehicle(e.target.value)} placeholder="e.g. Renault Kangoo" /></div>
            <div className="space-y-2"><Label>{t('drivers.licensePlate', 'License Plate')}</Label><Input value={formLicense} onChange={e => setFormLicense(e.target.value)} placeholder="e.g. 12345-200-16" /></div>
            <div className="space-y-2">
              <Label>{t('common.status')}</Label>
              <Select value={formStatus} onValueChange={v => setFormStatus(v as Driver['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t('drivers.available')}</SelectItem>
                  <SelectItem value="on_route">{t('drivers.on_route')}</SelectItem>
                  <SelectItem value="offline">{t('drivers.offline')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }} title={t('common.areYouSure')} description={t('common.cannotUndo')} onConfirm={handleDelete} />
    </div>
  );
}
