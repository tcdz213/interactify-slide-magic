import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getOrders, getCustomers, getInvoices } from '@/lib/fake-api';
import type { Order, Invoice } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Users, CreditCard, Plus, ChevronRight, MapPin, Target, Trophy, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VisitPlan {
  id: string;
  customerName: string;
  address: string;
  time: string;
  done: boolean;
}

const mockVisitPlan: VisitPlan[] = [
  { id: '1', customerName: 'Superette Bab Ezzouar', address: 'Rue 14, Bab Ezzouar', time: '09:00', done: true },
  { id: '2', customerName: 'Grossiste Hamiz', address: 'Zone Industrielle Hamiz', time: '10:30', done: true },
  { id: '3', customerName: 'Magasin El Harrach', address: 'Bd Mohamed V, El Harrach', time: '12:00', done: false },
  { id: '4', customerName: 'Mini Market Kouba', address: 'Cité 200 Lots, Kouba', time: '14:00', done: false },
  { id: '5', customerName: 'Épicerie Hydra', address: 'Rue Didouche, Hydra', time: '15:30', done: false },
];

const mockLeaderboard = [
  { name: 'Ahmed B.', orders: 45, revenue: 1240000, rank: 1 },
  { name: 'Karim M.', orders: 38, revenue: 980000, rank: 2 },
  { name: 'Yacine D.', orders: 32, revenue: 870000, rank: 3 },
];

export default function SalesHomePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [visits, setVisits] = useState(mockVisitPlan);

  // Targets mock
  const monthlyTarget = 2000000;
  const currentRevenue = 1240000;
  const targetProgress = Math.round((currentRevenue / monthlyTarget) * 100);
  const ordersTarget = 60;
  const currentOrders = 45;

  useEffect(() => {
    getOrders().then(setOrders);
    getInvoices().then(inv => setOverdueCount(inv.filter(i => i.status === 'overdue').length));
    getCustomers().then(c => setCustomerCount(c.length));
  }, []);

  const pendingOrders = orders.filter(o => ['draft', 'confirmed'].includes(o.status)).length;
  const recentOrders = orders.slice(0, 5);
  const visitsDone = visits.filter(v => v.done).length;

  const handleQuickReorder = (order: Order) => {
    toast({ title: t('mobile.sales.reorderCreated'), description: order.customerName });
  };

  const toggleVisit = (id: string) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, done: !v.done } : v));
    toast({ title: t('mobile.sales.visitUpdated') });
  };

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
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{customerCount}</p>
            <p className="text-[10px] text-muted-foreground">{t('mobile.sales.clients')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t('mobile.sales.monthlyTarget')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('mobile.sales.revenue')}</span>
              <span>{currentRevenue.toLocaleString('fr-DZ')} / {monthlyTarget.toLocaleString('fr-DZ')} DA</span>
            </div>
            <Progress value={targetProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('mobile.sales.ordersCount')}</span>
              <span>{currentOrders} / {ordersTarget}</span>
            </div>
            <Progress value={Math.round((currentOrders / ordersTarget) * 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

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

      {/* Today's Visit Plan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {t('mobile.sales.todaysVisits')}
          </h2>
          <Badge variant="secondary" className="text-[10px]">{visitsDone}/{visits.length}</Badge>
        </div>
        <div className="space-y-2">
          {visits.map(visit => (
            <Card
              key={visit.id}
              className={cn('border-0 shadow-sm cursor-pointer transition-opacity', visit.done && 'opacity-60')}
              onClick={() => toggleVisit(visit.id)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  visit.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {visit.done ? '✓' : <Clock className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium text-foreground truncate', visit.done && 'line-through')}>
                    {visit.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{visit.time} — {visit.address}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sales Leaderboard */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          {t('mobile.sales.leaderboard')}
        </h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 space-y-2">
            {mockLeaderboard.map(rep => (
              <div key={rep.name} className="flex items-center gap-3">
                <span className={cn(
                  'text-sm font-bold w-6 text-center',
                  rep.rank === 1 ? 'text-yellow-500' : rep.rank === 2 ? 'text-muted-foreground' : 'text-orange-400'
                )}>
                  #{rep.rank}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{rep.name}</p>
                  <p className="text-xs text-muted-foreground">{rep.orders} {t('mobile.sales.orders')} — {rep.revenue.toLocaleString('fr-DZ')} DA</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders with Quick Reorder */}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => { e.stopPropagation(); handleQuickReorder(order); }}
                >
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                </Button>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] shrink-0',
                    order.status === 'delivered' ? 'bg-primary/10 text-primary'
                      : order.status === 'cancelled' ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {t(`orders.${order.status}`)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
