import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getDeliveries } from '@/lib/fake-api';
import type { Delivery } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { KPIWidget } from '@/components/KPIWidget';
import { Truck, CheckCircle, Clock, AlertTriangle, Filter, Search, Download, RefreshCw, UserCheck, MapPin, Eye } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'customer' | 'driver'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Reassign dialog
  const [reassignTarget, setReassignTarget] = useState<Delivery | null>(null);
  const [newDriver, setNewDriver] = useState('');

  useEffect(() => { getDeliveries().then(d => { setDeliveries(d); setLoading(false); }); }, []);

  const filtered = deliveries
    .filter(d => statusFilter === 'all' || d.status === statusFilter)
    .filter(d => !search || d.customerName.toLowerCase().includes(search.toLowerCase()) || d.driverName.toLowerCase().includes(search.toLowerCase()) || d.orderId.toLowerCase().includes(search.toLowerCase()))
    .filter(d => !dateFrom || new Date(d.createdAt) >= new Date(dateFrom))
    .filter(d => !dateTo || new Date(d.createdAt) <= new Date(dateTo + 'T23:59:59'))
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortField === 'customer') cmp = a.customerName.localeCompare(b.customerName);
      if (sortField === 'driver') cmp = a.driverName.localeCompare(b.driverName);
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
  const completed = deliveries.filter(d => d.status === 'delivered').length;
  const failed = deliveries.filter(d => d.status === 'failed').length;
  const onTimeRate = completed > 0 ? Math.round((deliveries.filter(d => d.status === 'delivered' && d.actualArrival && d.actualArrival <= d.estimatedArrival).length / completed) * 100) : 0;

  const handleReassign = () => {
    if (!reassignTarget || !newDriver.trim()) return;
    setDeliveries(prev => prev.map(d => d.id === reassignTarget.id ? { ...d, driverName: newDriver } : d));
    toast.success(t('deliveries.driverReassigned'));
    setReassignTarget(null);
    setNewDriver('');
  };

  const handleMarkStatus = (id: string, status: 'delivered' | 'failed') => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status, actualArrival: status === 'delivered' ? new Date().toISOString() : d.actualArrival } : d));
    toast.success(status === 'delivered' ? t('deliveries.markedDelivered') : t('deliveries.markedFailed'));
  };

  const handleExport = () => {
    const csv = ['Order,Customer,Driver,Status,ETA,Created', ...filtered.map(d =>
      `${d.orderId},"${d.customerName}","${d.driverName}",${d.status},${d.estimatedArrival},${d.createdAt}`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deliveries.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported'));
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('deliveries.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('deliveries.description')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('deliveries.todayDeliveries')} value={deliveries.length} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.inTransit')} value={inTransit} icon={<Clock className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.completed')} value={completed} icon={<CheckCircle className="h-5 w-5" />} trend="up" trendValue={`${onTimeRate}% ${t('deliveries.onTime')}`} />
        <KPIWidget title={t('deliveries.failed')} value={failed} icon={<AlertTriangle className="h-5 w-5" />} trend={failed > 0 ? 'down' : undefined} trendValue={failed > 0 ? `${failed} ${t('deliveries.needAttention')}` : undefined} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('deliveries.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><Filter className="h-3.5 w-3.5 me-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="pending">{t('deliveries.pending')}</SelectItem>
            <SelectItem value="in_transit">{t('deliveries.inTransitStatus')}</SelectItem>
            <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
            <SelectItem value="failed">{t('deliveries.failed')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
        <span className="text-muted-foreground">→</span>
        <Input type="date" className="w-40" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('deliveries.allDeliveries')} ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('customer')}>{t('orders.customer')} {sortField === 'customer' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('driver')}>{t('orders.driver')} {sortField === 'driver' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>{t('deliveries.eta')} {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead>{t('deliveries.proof')}</TableHead>
                <TableHead className="sticky end-0 bg-background">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(d => (
                <TableRow key={d.id} className="group">
                  <TableCell className="font-mono text-xs">{d.orderId.toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{d.customerName}</TableCell>
                  <TableCell>{d.driverName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[d.status]}>
                      {t(`deliveries.${d.status === 'in_transit' ? 'inTransitStatus' : d.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(d.estimatedArrival).toLocaleString()}</TableCell>
                  <TableCell>
                    {d.status === 'delivered' ? (
                      <Badge variant="outline" className="bg-success/10 text-success text-[10px]"><CheckCircle className="h-3 w-3 me-1" />{t('deliveries.proofOk')}</Badge>
                    ) : d.status === 'failed' ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive text-[10px]">{t('deliveries.noProof')}</Badge>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="sticky end-0 bg-background">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/business/deliveries/${d.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                      {d.status === 'in_transit' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => handleMarkStatus(d.id, 'delivered')}><CheckCircle className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleMarkStatus(d.id, 'failed')}><AlertTriangle className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      {(d.status === 'pending' || d.status === 'in_transit') && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setReassignTarget(d); setNewDriver(d.driverName); }}><UserCheck className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('common.noResults')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">{t('common.page')} {page}/{totalPages} — {filtered.length} {t('common.results')}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign Driver Dialog */}
      <Dialog open={!!reassignTarget} onOpenChange={() => setReassignTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('deliveries.reassignDriver')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{t('deliveries.reassignDescription', { order: reassignTarget?.orderId.toUpperCase() })}</p>
            <div className="space-y-2">
              <Label>{t('deliveries.newDriver')}</Label>
              <Select value={newDriver} onValueChange={setNewDriver}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Yacine B.', 'Karim M.', 'Omar H.', 'Said T.', 'Redouane F.'].map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleReassign}>{t('deliveries.confirmReassign')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
