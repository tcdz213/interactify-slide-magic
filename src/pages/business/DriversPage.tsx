import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '@/lib/fake-api';
import type { Driver, DriverStatus } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KPIWidget } from '@/components/KPIWidget';
import { Users, Truck, CheckCircle, Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success',
  on_route: 'bg-info/10 text-info',
  offline: 'bg-muted text-muted-foreground',
};

export default function DriversPage() {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formStatus, setFormStatus] = useState<DriverStatus>('available');

  useEffect(() => { getDrivers().then(setDrivers); }, []);

  const resetForm = () => {
    setFormName(''); setFormPhone(''); setFormVehicle(''); setFormStatus('available'); setEditing(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    setFormName(driver.name); setFormPhone(driver.phone); setFormVehicle(driver.vehicle); setFormStatus(driver.status);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formPhone) { toast.error(t('common.error')); return; }
    if (editing) {
      setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, name: formName, phone: formPhone, vehicle: formVehicle, status: formStatus } : d));
      toast.success(t('drivers.updated'));
    } else {
      const newDriver: Driver = {
        id: `drv${Date.now()}`, tenantId: 't1', name: formName, phone: formPhone, vehicle: formVehicle,
        status: formStatus, deliveriesToday: 0, completedToday: 0, onTimeRate: 100,
      };
      setDrivers(prev => [...prev, newDriver]);
      toast.success(t('drivers.created'));
    }
    setDialogOpen(false); resetForm();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDrivers(prev => prev.filter(d => d.id !== deleteTarget.id));
    toast.success(t('drivers.deleted'));
    setDeleteTarget(null);
  };

  const totalDrivers = drivers.length;
  const available = drivers.filter(d => d.status === 'available').length;
  const onRoute = drivers.filter(d => d.status === 'on_route').length;
  const avgOnTime = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.onTimeRate, 0) / drivers.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('drivers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('drivers.description')}</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />{t('drivers.addDriver')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('drivers.totalDrivers')} value={totalDrivers} icon={<Users className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.available')} value={available} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.onRoute')} value={onRoute} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('drivers.avgOnTime')} value={`${avgOnTime}%`} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map(driver => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex-row items-start justify-between pb-3">
              <div>
                <CardTitle className="text-base">{driver.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{driver.vehicle}</p>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className={statusColors[driver.status]}>
                  {t(`drivers.${driver.status}`)}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(driver)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(driver)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) resetForm(); setDialogOpen(v); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('drivers.editDriver') : t('drivers.addDriver')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>{t('common.name')}</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t('drivers.namePlaceholder')} /></div>
            <div className="space-y-2"><Label>{t('common.phone')}</Label><Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+213 555 0000" /></div>
            <div className="space-y-2"><Label>{t('drivers.vehicle')}</Label><Input value={formVehicle} onChange={e => setFormVehicle(e.target.value)} placeholder={t('drivers.vehiclePlaceholder')} /></div>
            <div className="space-y-2">
              <Label>{t('common.status')}</Label>
              <Select value={formStatus} onValueChange={v => setFormStatus(v as DriverStatus)}>
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
