import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getBusinessStats, getOrders, getRevenueData, getInventoryItems, getDeliveries } from '@/lib/fake-api';
import type { BusinessStats, Order, InventoryItem, Delivery } from '@/lib/fake-api/types';
import { StatCard } from '@/components/StatCard';
import { OrderStatusBadge } from '@/components/StatusBadges';
import { Package, ShoppingCart, Users, DollarSign, Truck, TrendingUp, AlertTriangle, Bell, Calendar, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

const MOCK_NOTIFICATIONS = [
  { id: 'n1', text: 'Commande ORD-0342 confirmée', time: 'Il y a 5 min', type: 'order' },
  { id: 'n2', text: 'Stock bas: Huile de Tournesol 5L', time: 'Il y a 15 min', type: 'stock' },
  { id: 'n3', text: 'Livraison DEL-0089 terminée', time: 'Il y a 30 min', type: 'delivery' },
  { id: 'n4', text: 'Paiement de 45,000 DZD reçu', time: 'Il y a 1h', type: 'payment' },
];

export default function BusinessDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState<Delivery[]>([]);
  const [dateRange, setDateRange] = useState('this_month');

  useEffect(() => {
    getBusinessStats().then(setStats);
    getOrders().then(setOrders);
    getRevenueData().then(setRevenue);
    getInventoryItems().then(items => setLowStockItems(items.filter(i => i.stockStatus === 'low' || i.stockStatus === 'out')));
    getDeliveries().then(setTodayDeliveries);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  const revenueGoal = 60000;
  const revenueProgress = Math.min(100, Math.round((stats.monthlyRevenue / revenueGoal) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.businessOverview')}</h1>
          <p className="text-sm text-muted-foreground">Mama Foods — {t('dashboard.operationsDashboard')}</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 me-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t('dashboard.today', "Aujourd'hui")}</SelectItem>
            <SelectItem value="this_week">{t('dashboard.thisWeek', 'Cette semaine')}</SelectItem>
            <SelectItem value="this_month">{t('dashboard.thisMonth', 'Ce mois')}</SelectItem>
            <SelectItem value="last_month">{t('dashboard.lastMonth', 'Mois dernier')}</SelectItem>
            <SelectItem value="this_quarter">{t('dashboard.thisQuarter', 'Ce trimestre')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('dashboard.monthlyRevenue')} value={`${stats.monthlyRevenue.toLocaleString()} DZD`} icon={DollarSign} variant="accent" trend={{ value: 12, label: t('dashboard.vsLastMonth') }} />
        <StatCard title={t('dashboard.totalOrders')} value={stats.totalOrders} subtitle={`${stats.pendingOrders} ${t('dashboard.pending')}`} icon={ShoppingCart} variant="primary" />
        <StatCard title={t('nav.products')} value={stats.totalProducts} icon={Package} />
        <StatCard title={t('dashboard.deliveryRate')} value={`${stats.deliveryRate}%`} subtitle={`${stats.activeDrivers} ${t('dashboard.activeDrivers').toLowerCase()}`} icon={Truck} variant="accent" />
      </div>

      {/* Revenue Goal */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t('dashboard.revenueGoal', 'Objectif de revenu mensuel')}</span>
            </div>
            <span className="text-sm font-semibold">{stats.monthlyRevenue.toLocaleString()} / {revenueGoal.toLocaleString()} DZD</span>
          </div>
          <Progress value={revenueProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">{revenueProgress}% {t('dashboard.achieved', 'atteint')}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('dashboard.revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Panel: Notifications + Quick Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Real-time Notifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  {t('dashboard.liveUpdates', 'Mises à jour')}
                </div>
                <Badge variant="secondary">{MOCK_NOTIFICATIONS.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOCK_NOTIFICATIONS.map(notif => (
                <div key={notif.id} className="flex items-start gap-2 rounded-lg border p-2.5 text-sm">
                  <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${notif.type === 'stock' ? 'bg-warning' : notif.type === 'order' ? 'bg-primary' : 'bg-success'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{notif.text}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('dashboard.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('nav.customers')}</span>
                <span className="font-bold">{stats.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('dashboard.inventoryValue')}</span>
                <span className="font-bold">{stats.inventoryValue.toLocaleString()} DZD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('dashboard.activeDrivers')}</span>
                <span className="font-bold">{stats.activeDrivers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('dashboard.pendingOrders')}</span>
                <span className="font-bold text-warning">{stats.pendingOrders}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {t('dashboard.lowStock')}
            </CardTitle>
            <Link to="/business/inventory"><Button variant="ghost" size="sm" className="gap-1">{t('common.view')}<ChevronRight className="h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.noAlerts', 'Aucune alerte stock')}</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.warehouseName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-warning">{item.quantity} {item.baseUnit}</p>
                      <p className="text-xs text-muted-foreground">Min: {item.reorderPoint}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Deliveries */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4 text-primary" />
              {t('dashboard.todayDeliveries', "Livraisons du jour")}
            </CardTitle>
            <Link to="/business/deliveries"><Button variant="ghost" size="sm" className="gap-1">{t('common.view')}<ChevronRight className="h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayDeliveries.slice(0, 5).map(del => (
                <div key={del.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{del.customerName}</p>
                    <p className="text-xs text-muted-foreground">{del.driverName}</p>
                  </div>
                  <Badge variant={del.status === 'delivered' ? 'default' : del.status === 'in_transit' ? 'secondary' : 'outline'}>
                    {t(`deliveries.${del.status === 'in_transit' ? 'inTransitStatus' : del.status}`, del.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('dashboard.recentOrders')}</CardTitle>
          <Link to="/business/orders"><Button variant="ghost" size="sm" className="gap-1">{t('common.view')}<ChevronRight className="h-3 w-3" /></Button></Link>
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
                <TableHead>{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 5).map(o => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/business/orders/${o.id}`}>
                  <TableCell className="font-medium font-mono text-xs">{o.id.toUpperCase()}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                  <TableCell>{o.itemsCount}</TableCell>
                  <TableCell className="font-medium">{o.totalAmount.toLocaleString()} DZD</TableCell>
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
