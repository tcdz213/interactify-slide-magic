import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '@/lib/fake-api';
import type { Order, OrderStatus } from '@/lib/fake-api/types';
import { OrderStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, ShoppingCart, Clock, Truck, CheckCircle, Download, ChevronLeft, ChevronRight, AlertTriangle, CalendarDays, Copy, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIWidget } from '@/components/KPIWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const pipelineSteps = ['draft', 'confirmed', 'picking', 'dispatched', 'delivered', 'settled'] as const;
const PAGE_SIZE = 10;

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground',
};

function getOrderPriority(order: Order): 'high' | 'medium' | 'low' {
  if (order.totalAmount > 100000) return 'high';
  if (order.totalAmount > 50000) return 'medium';
  return 'low';
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showBulkCancel, setShowBulkCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { getOrders().then(setOrders); }, []);

  const filtered = useMemo(() => {
    const base = orders.filter(o => {
      const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const orderDate = new Date(o.createdAt);
      const matchFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
    base.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === 'amount') cmp = a.totalAmount - b.totalAmount;
      else cmp = a.customerName.localeCompare(b.customerName);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return base;
  }, [orders, search, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFrom, dateTo]);

  const totalOrders = orders.length;
  const pending = orders.filter(o => ['draft', 'confirmed', 'picking'].includes(o.status)).length;
  const inTransit = orders.filter(o => o.status === 'dispatched').length;
  const deliveredToday = orders.filter(o => o.status === 'delivered').length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(o => o.id)));
    }
  };

  const handleBulkConfirm = () => {
    setOrders(prev => prev.map(o => selectedIds.has(o.id) && o.status === 'draft'
      ? { ...o, status: 'confirmed' as OrderStatus, updatedAt: new Date().toISOString() }
      : o
    ));
    const count = [...selectedIds].filter(id => orders.find(o => o.id === id)?.status === 'draft').length;
    toast.success(`${count} commande(s) confirmée(s)`);
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
  };

  const handleBulkCancel = () => {
    setOrders(prev => prev.map(o => selectedIds.has(o.id) && !['settled', 'cancelled', 'delivered'].includes(o.status)
      ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() }
      : o
    ));
    toast.success(`${selectedIds.size} commande(s) annulée(s)`);
    setSelectedIds(new Set());
    setShowBulkCancel(false);
    setCancelReason('');
  };

  const handleExportCSV = () => {
    const header = 'ID,Client,Statut,Articles,Total,Commercial,Chauffeur,Date\n';
    const rows = filtered.map(o =>
      `"${o.id}","${o.customerName}","${o.status}",${o.itemsCount},${o.totalAmount},"${o.assignedSalesRep || ''}","${o.assignedDriver || ''}","${o.createdAt}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    toast.success('CSV exporté');
  };

  const handleDuplicateOrder = (o: Order) => {
    const newOrder: Order = {
      ...o,
      id: `ord-dup-${Date.now().toString(36)}`,
      status: 'draft' as OrderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    toast.success(t('business.orderDuplicated'));
  };

  const toggleSort = (field: 'date' | 'amount' | 'customer') => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('orders.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('orders.trackOrders')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1">
            <Download className="h-3.5 w-3.5" />Export CSV
          </Button>
          <Button onClick={() => navigate('/business/orders/create')}>
            <Plus className="h-4 w-4 me-2" />{t('orders.createOrder')}
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('dashboard.totalOrders')} value={totalOrders} icon={<ShoppingCart className="h-5 w-5" />} />
        <KPIWidget title={t('dashboard.pendingOrders')} value={pending} icon={<Clock className="h-5 w-5" />} />
        <KPIWidget title={t('deliveries.inTransit')} value={inTransit} icon={<Truck className="h-5 w-5" />} />
        <KPIWidget title={t('orders.delivered')} value={deliveredToday} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {pipelineSteps.map((step) => {
              const count = orders.filter(o => o.status === step).length;
              return (
                <button
                  key={step}
                  onClick={() => setStatusFilter(statusFilter === step ? 'all' : step)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all whitespace-nowrap ${statusFilter === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {t(`orders.${step}`)}
                  <span className="rounded-full bg-background/20 px-1.5 text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('orders.searchByCustomer')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" />
              <span className="text-muted-foreground text-xs">→</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-3.5 w-3.5 me-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
                <SelectItem value="draft">{t('orders.draft')}</SelectItem>
                <SelectItem value="confirmed">{t('orders.confirmed')}</SelectItem>
                <SelectItem value="picking">{t('orders.picking')}</SelectItem>
                <SelectItem value="dispatched">{t('orders.dispatched')}</SelectItem>
                <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                <SelectItem value="settled">{t('orders.settled')}</SelectItem>
                <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Badge variant="secondary">{selectedIds.size} sélectionnée(s)</Badge>
              <Button size="sm" variant="outline" onClick={() => setShowBulkConfirm(true)}>
                <CheckCircle className="h-3.5 w-3.5 me-1" />Confirmer
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowBulkCancel(true)}>
                <AlertTriangle className="h-3.5 w-3.5 me-1" />Annuler
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Désélectionner</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead>{t('orders.customer')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>{t('orders.items')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('orders.salesRep')}</TableHead>
                <TableHead>{t('orders.driver')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(o => {
                const priority = getOrderPriority(o);
                return (
                  <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(o.id)} onCheckedChange={() => toggleSelect(o.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium" onClick={() => navigate(`/business/orders/${o.id}`)}>{o.id.toUpperCase()}</TableCell>
                    <TableCell className="font-medium" onClick={() => navigate(`/business/orders/${o.id}`)}>{o.customerName}</TableCell>
                    <TableCell onClick={() => navigate(`/business/orders/${o.id}`)}><OrderStatusBadge status={o.status} /></TableCell>
                    <TableCell onClick={() => navigate(`/business/orders/${o.id}`)}>
                      <Badge variant="outline" className={priorityColors[priority]}>
                        {priority === 'high' ? '🔴 Haute' : priority === 'medium' ? '🟡 Moyenne' : '⚪ Basse'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => navigate(`/business/orders/${o.id}`)}>{o.itemsCount}</TableCell>
                    <TableCell className="font-medium" onClick={() => navigate(`/business/orders/${o.id}`)}>{o.totalAmount.toLocaleString()} {t('common.currency')}</TableCell>
                    <TableCell className="text-sm" onClick={() => navigate(`/business/orders/${o.id}`)}>{o.assignedSalesRep || '—'}</TableCell>
                    <TableCell className="text-sm" onClick={() => navigate(`/business/orders/${o.id}`)}>{o.assignedDriver || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs" onClick={() => navigate(`/business/orders/${o.id}`)}>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Confirm Dialog */}
      <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmer {selectedIds.size} commande(s)</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Seules les commandes en statut "Brouillon" seront confirmées.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkConfirm(false)}>Annuler</Button>
            <Button onClick={handleBulkConfirm}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Cancel Dialog */}
      <Dialog open={showBulkCancel} onOpenChange={setShowBulkCancel}>
        <DialogContent>
          <DialogHeader><DialogTitle>Annuler {selectedIds.size} commande(s)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Les commandes livrées ou réglées ne seront pas affectées.</p>
            <div className="space-y-2">
              <Label>Motif d'annulation</Label>
              <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Ex: demande client, rupture de stock..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkCancel(false)}>Retour</Button>
            <Button variant="destructive" onClick={handleBulkCancel}>Annuler les commandes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}