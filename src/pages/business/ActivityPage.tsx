import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, Download, Package, ShoppingCart, Users, UserPlus, Edit, Truck, CreditCard, FileText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ExportDialog } from '@/components/ExportDialog';
import { toast } from 'sonner';

const icons: Record<string, typeof ShoppingCart> = {
  order_created: ShoppingCart, product_updated: Edit, delivery_completed: Truck,
  customer_added: UserPlus, invoice_sent: FileText, order_confirmed: ShoppingCart,
  stock_adjusted: Package, payment_received: CreditCard, user_invited: Users,
};

// Extended activity data with more entries for pagination
const generateActivities = () => {
  const actions = ['order_created', 'product_updated', 'delivery_completed', 'customer_added', 'invoice_sent', 'order_confirmed', 'stock_adjusted', 'payment_received'];
  const users = ['Karim M.', 'Rachid B.', 'Yacine B.', 'Sofiane T.', 'Nadia C.', 'Ahmed K.'];
  const resources = ['Commande #ORD-2048', 'Couscous Fin 1kg', 'Livraison #DEL-1024', 'Épicerie Moderne', 'Facture #INV-892', 'Commande #ORD-2047', "Huile d'Olive 1L", 'Paiement #PAY-456'];
  const items = [];
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    const time = new Date(now.getTime() - i * 3600000 * (1 + Math.random() * 5));
    items.push({
      id: i + 1,
      user: users[i % users.length],
      action: actions[i % actions.length],
      resource: resources[i % resources.length],
      time: time.toISOString(),
    });
  }
  return items;
};

const activityData = generateActivities();

const actionColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  order_created: 'default', product_updated: 'secondary', delivery_completed: 'outline',
  customer_added: 'default', invoice_sent: 'secondary', order_confirmed: 'default',
  stock_adjusted: 'outline', payment_received: 'default', user_invited: 'secondary',
};

const PAGE_SIZE = 10;

export default function ActivityPage() {
  const { t } = useTranslation();
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  const uniqueUsers = [...new Set(activityData.map(a => a.user))];
  const uniqueActions = [...new Set(activityData.map(a => a.action))];

  const filtered = useMemo(() => activityData.filter(a => {
    if (userFilter !== 'all' && a.user !== userFilter) return false;
    if (actionFilter !== 'all' && a.action !== actionFilter) return false;
    if (dateFrom && a.time < dateFrom) return false;
    if (dateTo && a.time > dateTo + 'T23:59:59') return false;
    return true;
  }), [userFilter, actionFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportColumns = [
    { key: 'user', label: t('admin.user') },
    { key: 'action', label: t('admin.action') },
    { key: 'resource', label: t('admin.resource') },
    { key: 'time', label: t('common.date') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('business.activityLog')}</h1>
          <p className="text-sm text-muted-foreground">{t('business.activityDesc')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info(t('business.refreshed', 'Activity refreshed'))}><RefreshCw className="h-4 w-4 me-2" />{t('common.refresh')}</Button>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={userFilter} onValueChange={v => { setUserFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.user')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {uniqueUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.action')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {uniqueActions.map(a => <SelectItem key={a} value={a}>{String(t(`business.action_${a}`, a))}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
        <Input type="date" className="w-40" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            {t('business.recentActivity')} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginated.map(item => {
              const Icon = icons[item.action] || Activity;
              return (
                <div key={item.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.user}</span>
                    <Badge variant={actionColors[item.action] || 'outline'} className="text-xs">
                        {String(t(`business.action_${item.action}`, item.action))}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.resource}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.time).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {t('common.showing')} {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} {t('common.of')} {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered as unknown as Record<string, unknown>[]} columns={exportColumns} filename="activity-log" />
    </div>
  );
}
