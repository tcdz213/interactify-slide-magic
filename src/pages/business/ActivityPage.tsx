import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Download, Package, ShoppingCart, Users, UserPlus, Edit, Truck } from 'lucide-react';

const activityData = [
  { id: 1, user: 'Karim M.', action: 'order_created', resource: 'Commande #ORD-2048', time: '2024-12-06T10:30:00', icon: ShoppingCart },
  { id: 2, user: 'Rachid B.', action: 'product_updated', resource: 'Couscous Fin 1kg', time: '2024-12-06T09:15:00', icon: Edit },
  { id: 3, user: 'Yacine B.', action: 'delivery_completed', resource: 'Livraison #DEL-1024', time: '2024-12-06T08:45:00', icon: Truck },
  { id: 4, user: 'Sofiane T.', action: 'customer_added', resource: 'Épicerie Moderne', time: '2024-12-05T17:20:00', icon: UserPlus },
  { id: 5, user: 'Nadia C.', action: 'invoice_sent', resource: 'Facture #INV-892', time: '2024-12-05T16:00:00', icon: Package },
  { id: 6, user: 'Ahmed K.', action: 'delivery_completed', resource: 'Livraison #DEL-1023', time: '2024-12-05T14:30:00', icon: Truck },
  { id: 7, user: 'Karim M.', action: 'order_confirmed', resource: 'Commande #ORD-2047', time: '2024-12-05T11:00:00', icon: ShoppingCart },
  { id: 8, user: 'Rachid B.', action: 'stock_adjusted', resource: 'Huile d\'Olive 1L', time: '2024-12-05T09:30:00', icon: Package },
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

export default function ActivityPage() {
  const { t } = useTranslation();
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const uniqueUsers = [...new Set(activityData.map(a => a.user))];
  const uniqueActions = [...new Set(activityData.map(a => a.action))];

  const filtered = activityData.filter(a => {
    return (userFilter === 'all' || a.user === userFilter) && (actionFilter === 'all' || a.action === actionFilter);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('business.activityLog')}</h1>
          <p className="text-sm text-muted-foreground">{t('business.activityDesc')}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
      </div>

      <div className="flex gap-3">
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.user')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {uniqueUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.action')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {uniqueActions.map(a => <SelectItem key={a} value={a}>{t(`business.action_${a}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            {t('business.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map(item => (
              <div key={item.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
