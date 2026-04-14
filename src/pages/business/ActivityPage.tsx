import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Download, Package, ShoppingCart, Users, UserPlus, Edit, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

const activityData = [
  { id: 1, user: 'Karim M.', action: 'order_created', resource: 'Commande #ORD-2048', time: '2024-12-06T10:30:00', icon: ShoppingCart },
  { id: 2, user: 'Rachid B.', action: 'product_updated', resource: 'Couscous Fin 1kg', time: '2024-12-06T09:15:00', icon: Edit },
  { id: 3, user: 'Yacine B.', action: 'delivery_completed', resource: 'Livraison #DEL-1024', time: '2024-12-06T08:45:00', icon: Truck },
  { id: 4, user: 'Sofiane T.', action: 'customer_added', resource: 'Épicerie Moderne', time: '2024-12-05T17:20:00', icon: UserPlus },
  { id: 5, user: 'Nadia C.', action: 'invoice_sent', resource: 'Facture #INV-892', time: '2024-12-05T16:00:00', icon: Package },
  { id: 6, user: 'Ahmed K.', action: 'delivery_completed', resource: 'Livraison #DEL-1023', time: '2024-12-05T14:30:00', icon: Truck },
  { id: 7, user: 'Karim M.', action: 'order_confirmed', resource: 'Commande #ORD-2047', time: '2024-12-05T11:00:00', icon: ShoppingCart },
  { id: 8, user: 'Rachid B.', action: 'stock_adjusted', resource: 'Huile d\'Olive 1L', time: '2024-12-05T09:30:00', icon: Package },
  { id: 9, user: 'Karim M.', action: 'order_created', resource: 'Commande #ORD-2046', time: '2024-12-04T16:00:00', icon: ShoppingCart },
  { id: 10, user: 'Sofiane T.', action: 'customer_added', resource: 'Boucherie Atlas', time: '2024-12-04T14:20:00', icon: UserPlus },
  { id: 11, user: 'Ahmed K.', action: 'delivery_completed', resource: 'Livraison #DEL-1022', time: '2024-12-04T11:30:00', icon: Truck },
  { id: 12, user: 'Nadia C.', action: 'invoice_sent', resource: 'Facture #INV-891', time: '2024-12-04T10:00:00', icon: Package },
  { id: 13, user: 'Yacine B.', action: 'delivery_completed', resource: 'Livraison #DEL-1021', time: '2024-12-03T15:30:00', icon: Truck },
  { id: 14, user: 'Rachid B.', action: 'product_updated', resource: 'Semoule Extra 5kg', time: '2024-12-03T09:00:00', icon: Edit },
  { id: 15, user: 'Karim M.', action: 'order_confirmed', resource: 'Commande #ORD-2045', time: '2024-12-02T14:00:00', icon: ShoppingCart },
  { id: 16, user: 'Sofiane T.', action: 'order_created', resource: 'Commande #ORD-2044', time: '2024-12-02T10:30:00', icon: ShoppingCart },
];

const actionColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  order_created: 'default',
  product_updated: 'secondary',
  delivery_completed: 'outline',
  customer_added: 'default',
  invoice_sent: 'secondary',
  order_confirmed: 'default',
  stock_adjusted: 'outline',
};

const PAGE_SIZE = 8;

export default function ActivityPage() {
  const { t } = useTranslation();
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const uniqueUsers = [...new Set(activityData.map(a => a.user))];
  const uniqueActions = [...new Set(activityData.map(a => a.action))];

  const filtered = activityData.filter(a => {
    if (userFilter !== 'all' && a.user !== userFilter) return false;
    if (actionFilter !== 'all' && a.action !== actionFilter) return false;
    if (dateFrom && a.time < dateFrom) return false;
    if (dateTo && a.time > dateTo + 'T23:59:59') return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('business.activityLog')}</h1>
          <p className="text-sm text-muted-foreground">{t('business.activityDesc')}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
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
            {uniqueActions.map(a => <SelectItem key={a} value={a}>{t(`business.action_${a}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[160px]" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} placeholder={t('reports.from')} />
        <Input type="date" className="w-[160px]" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} placeholder={t('reports.to')} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            {t('business.recentActivity')}
            <span className="text-xs text-muted-foreground font-normal ms-2">({filtered.length} {t('common.items')})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginated.map(item => (
              <div key={item.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.user}</span>
                    <Badge variant={actionColors[item.action] || 'outline'} className="text-xs">
                      {t(`business.action_${item.action}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.resource}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(item.time).toLocaleString()}
                </span>
              </div>
            ))}
            {paginated.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">{t('common.noResults')}</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} {t('common.of')} {filtered.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
