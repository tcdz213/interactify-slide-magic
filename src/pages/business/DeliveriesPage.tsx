import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDeliveries, getDrivers } from '@/lib/fake-api';
import type { Delivery, Driver } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPIWidget } from '@/components/KPIWidget';
import { SearchInput } from '@/components/SearchInput';
import { ExportDialog } from '@/components/ExportDialog';
import { Truck, CheckCircle, Clock, AlertTriangle, Eye, UserCheck, XCircle, MapPin, Phone, Camera, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_transit: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
};

export default function DeliveriesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignDriver, setReassignDriver] = useState('');
  const [failedOpen, setFailedOpen] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    getDeliveries().then(setDeliveries);
    getDrivers().then(setDrivers);
  }, []);

  const filtered = deliveries.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search && !d.customerName.toLowerCase().includes(search.toLowerCase()) && !d.orderId.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && d.createdAt < dateFrom) return false;
    if (dateTo && d.createdAt > dateTo + 'T23:59:59') return false;
    return true;
  });

  const todayDeliveries = deliveries.length;
  const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
  const completed = deliveries.filter(d => d.status === 'delivered').length;
  const failed = deliveries.filter(d => d.status === 'failed').length;
  const onTimeRate = completed > 0 ? Math.round((deliveries.filter(d => d.status === 'delivered' && d.actualArrival && d.actualArrival <= d.estimatedArrival).length / completed) * 100) : 0;

  const handleReassign = () => {
    if (!selectedDelivery || !reassignDriver) return;
    const driver = drivers.find(d => d.id === reassignDriver);
    setDeliveries(prev => prev.map(d => d.id === selectedDelivery.id ? { ...d, driverId: reassignDriver, driverName: driver?.name || d.driverName } : d));
    toast.success(t('deliveries.driverReassigned', { driver: driver?.name }));
    setReassignOpen(false);
    setReassignDriver('');
  };

  const handleMarkFailed = () => {
    if (!selectedDelivery || !failReason) return;
    setDeliveries(prev => prev.map(d => d.id === selectedDelivery.id ? { ...d, status: 'failed' as const } : d));
    toast.success(t('deliveries.markedFailed'));
    setFailedOpen(false);
    setFailReason('');
    setSelectedDelivery(null);
  };

  const handleMarkDelivered = (del: Delivery) => {
    setDeliveries(prev => prev.map(d => d.id === del.id ? { ...d, status: 'delivered' as const, actualArrival: new Date().toISOString() } : d));
    toast.success(t('deliveries.markedDelivered'));
  };

  const exportColumns = [
    { key: 'orderId', label: t('orders.orderId') },
    { key: 'customerName', label: t('orders.customer') },
    { key: 'driverName', label: t('orders.driver') },
    { key: 'status', label: t('common.status') },
    { key: 'estimatedArrival', label: t('deliveries.eta') },
    { key: 'createdAt', label: t('common.date') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('deliveries.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('deliveries.description')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 me-2" />{t('common.export')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPIWidget title={t('deliveries.todayDeliveries')} value={todayDeliveries} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.inTransit')} value={inTransit} icon={<Clock className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.completed')} value={completed} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.failedCount', 'Failed')} value={failed} icon={<XCircle className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.onTimeRate')} value={`${onTimeRate}%`} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('deliveries.searchDeliveries', 'Search deliveries...')} className="w-64" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="pending">{t('deliveries.pending')}</SelectItem>
            <SelectItem value="in_transit">{t('deliveries.inTransitStatus')}</SelectItem>
            <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
            <SelectItem value="failed">{t('deliveries.failed')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>

      {/* GPS Mock Map */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{t('deliveries.liveMap', 'Live Tracking Map')}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{t('deliveries.mapPlaceholder', 'GPS tracking map will display here')}</p>
              <p className="text-xs mt-1">{inTransit} {t('deliveries.activeDrivers', 'active drivers on map')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('deliveries.allDeliveries')} ({filtered.length})</CardTitle>
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
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id} className="cursor-pointer" onClick={() => setSelectedDelivery(d)}>
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
                  <TableCell>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/business/deliveries/${d.id}`)}><Eye className="h-4 w-4" /></Button>
                      {d.status === 'in_transit' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleMarkDelivered(d)}><CheckCircle className="h-4 w-4 text-success" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedDelivery(d); setFailedOpen(true); }}><XCircle className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                      {(d.status === 'pending' || d.status === 'in_transit') && (
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedDelivery(d); setReassignOpen(true); }}><UserCheck className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delivery Detail Dialog */}
      <Dialog open={!!selectedDelivery && !reassignOpen && !failedOpen} onOpenChange={v => { if (!v) setSelectedDelivery(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('deliveries.deliveryDetail', 'Delivery Detail')}</DialogTitle></DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('orders.orderId')}:</span> <span className="font-mono">{selectedDelivery.orderId.toUpperCase()}</span></div>
                <div><span className="text-muted-foreground">{t('common.status')}:</span> <Badge variant="secondary" className={statusColors[selectedDelivery.status]}>{selectedDelivery.status}</Badge></div>
                <div><span className="text-muted-foreground">{t('orders.customer')}:</span> {selectedDelivery.customerName}</div>
                <div><span className="text-muted-foreground">{t('orders.driver')}:</span> {selectedDelivery.driverName}</div>
                <div className="col-span-2"><span className="text-muted-foreground">{t('common.address')}:</span> {selectedDelivery.customerAddress}</div>
              </div>

              {/* Proof of delivery section */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">{t('deliveries.proofOfDelivery', 'Proof of Delivery')}</h4>
                {selectedDelivery.status === 'delivered' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-success"><CheckCircle className="h-4 w-4" />{t('deliveries.deliveredAt', 'Delivered at')} {selectedDelivery.actualArrival ? new Date(selectedDelivery.actualArrival).toLocaleString() : '—'}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Camera className="h-3.5 w-3.5 me-1" />{t('deliveries.viewPhoto', 'View Photo')}</Button>
                      <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 me-1" />{t('deliveries.viewSignature', 'View Signature')}</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t('deliveries.noProofYet', 'Proof will be available after delivery')}</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setReassignOpen(true); }}>
                  <UserCheck className="h-3.5 w-3.5 me-1" />{t('deliveries.reassignDriver', 'Reassign Driver')}
                </Button>
                <Button variant="outline" size="sm"><Phone className="h-3.5 w-3.5 me-1" />{t('deliveries.callDriver', 'Call Driver')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reassign Driver Dialog */}
      <Dialog open={reassignOpen} onOpenChange={v => { if (!v) { setReassignOpen(false); setReassignDriver(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('deliveries.reassignDriver', 'Reassign Driver')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('deliveries.selectDriver', 'Select Driver')}</Label>
              <Select value={reassignDriver} onValueChange={setReassignDriver}>
                <SelectTrigger><SelectValue placeholder={t('deliveries.chooseDriver', 'Choose a driver...')} /></SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status !== 'offline').map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.vehicle} ({t(`drivers.${d.status}`)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleReassign} disabled={!reassignDriver}>{t('common.confirm')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Failed Delivery Dialog */}
      <Dialog open={failedOpen} onOpenChange={v => { if (!v) { setFailedOpen(false); setFailReason(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('deliveries.markAsFailed', 'Mark as Failed')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('deliveries.failureReason', 'Failure Reason')}</Label>
              <Select value={failReason} onValueChange={setFailReason}>
                <SelectTrigger><SelectValue placeholder={t('deliveries.selectReason', 'Select reason...')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_absent">{t('deliveries.reason_absent', 'Customer absent')}</SelectItem>
                  <SelectItem value="wrong_address">{t('deliveries.reason_address', 'Wrong address')}</SelectItem>
                  <SelectItem value="refused">{t('deliveries.reason_refused', 'Delivery refused')}</SelectItem>
                  <SelectItem value="damaged">{t('deliveries.reason_damaged', 'Goods damaged')}</SelectItem>
                  <SelectItem value="other">{t('deliveries.reason_other', 'Other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleMarkFailed} disabled={!failReason}>{t('common.confirm')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered as unknown as Record<string, unknown>[]} columns={exportColumns} filename="deliveries" />
    </div>
  );
}
