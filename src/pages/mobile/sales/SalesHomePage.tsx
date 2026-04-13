import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getOrders, getCustomers, getInvoices } from '@/lib/fake-api';
import type { Order, Invoice } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Users, CreditCard, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SalesHomePage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    getOrders().then(setOrders);
    getInvoices().then(inv => setOverdueCount(inv.filter(i => i.status === 'overdue').length));
    getCustomers().then(c => setCustomerCount(c.length));
  }, []);

  const pendingOrders = orders.filter(o => ['draft', 'confirmed'].includes(o.status)).length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {t('mobile.sales.greeting', { name: 'Ahmed' })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
            <p className="text-[10px] text-muted-foreground">{t('mobile.sales.pending')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <CreditCard className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-foreground">{overdueCount}</p>
            <p className="text-[10px] text-muted-foreground">{t('mobile.sales.overdue')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold text-foreground">{customerCount}</p>
            <p className="text-[10px] text-muted-foreground">{t('mobile.sales.clients')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/m/sales/orders/create">
          <Button className="w-full h-12 gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            {t('mobile.sales.newOrder')}
          </Button>
        </Link>
        <Link to="/m/sales/customers">
          <Button variant="outline" className="w-full h-12 gap-2 rounded-xl">
            <Users className="h-4 w-4" />
            {t('mobile.sales.viewCustomers')}
          </Button>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('mobile.sales.recentOrders')}</h2>
        <div className="space-y-2">
          {recentOrders.map(order => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.itemsCount} {t('mobile.sales.items')} — {order.totalAmount.toLocaleString('fr-DZ')} DA
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] shrink-0',
                    order.status === 'delivered' ? 'bg-success/10 text-success'
                      : order.status === 'cancelled' ? 'bg-destructive/10 text-destructive'
                      : 'bg-info/10 text-info'
                  )}
                >
                  {t(`orders.${order.status}`)}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
