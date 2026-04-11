import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrders } from '@/lib/fake-api';
import type { Order } from '@/lib/fake-api/types';
import { OrderStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('orders.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('orders.trackOrders')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('orders.searchByCustomer')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead>{t('orders.customer')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('orders.items')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('orders.salesRep')}</TableHead>
                <TableHead>{t('orders.driver')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-medium">{o.id.toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{o.customerName}</TableCell>
                  <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                  <TableCell>{o.itemsCount}</TableCell>
                  <TableCell className="font-medium">${o.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{o.assignedSalesRep || '—'}</TableCell>
                  <TableCell className="text-sm">{o.assignedDriver || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
