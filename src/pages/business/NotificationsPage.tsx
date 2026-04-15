import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, CheckCheck, AlertTriangle, ShoppingCart, Package, Truck, DollarSign, Settings, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'order' | 'stock' | 'delivery' | 'payment' | 'critical';
  icon: typeof Bell;
}

const notifications: Notification[] = [
  { id: 'n1', title: 'Nouvelle commande reçue', body: 'Superette El Baraka — 3 articles, 24,000 DZD', time: '2024-12-06T10:30:00', read: false, type: 'order', icon: ShoppingCart },
  { id: 'n2', title: 'Stock faible — Huile d\'Olive 1L', body: 'Seulement 12 unités restantes (seuil: 50)', time: '2024-12-06T09:00:00', read: false, type: 'critical', icon: AlertTriangle },
  { id: 'n3', title: 'Livraison terminée', body: 'DEL-1024 livré à Gros Bazar Oran par Yacine B.', time: '2024-12-06T08:45:00', read: false, type: 'delivery', icon: Truck },
  { id: 'n4', title: 'Paiement reçu', body: 'Alimentation Générale Nour — 36,000 DZD', time: '2024-12-05T17:00:00', read: true, type: 'payment', icon: DollarSign },
  { id: 'n5', title: 'Commande confirmée', body: 'Wholesale Center Blida — Commande #ORD-2047', time: '2024-12-05T14:00:00', read: true, type: 'order', icon: ShoppingCart },
  { id: 'n6', title: 'Stock réapprovisionné', body: 'Couscous Fin 1kg — +600 unités ajoutées', time: '2024-12-05T11:30:00', read: true, type: 'stock', icon: Package },
  { id: 'n7', title: 'Stock critique — Semoule Extra 5kg', body: 'Rupture de stock imminente, 5 unités restantes', time: '2024-12-05T10:00:00', read: true, type: 'critical', icon: AlertTriangle },
];

const typeColors: Record<string, string> = {
  order: 'bg-info/10 border-info/20',
  stock: 'bg-warning/10 border-warning/20',
  delivery: 'bg-success/10 border-success/20',
  payment: 'bg-primary/10 border-primary/20',
  critical: 'bg-destructive/10 border-destructive/20',
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState(notifications);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    orders: true, stock: true, deliveries: true, payments: true, critical: true, email: false, push: true,
  });

  const unreadCount = items.filter(n => !n.read).length;

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(t('business.allMarkedRead'));
  };

  const markRead = (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filterByTab = (tab: string) => {
    if (tab === 'all') return items;
    if (tab === 'unread') return items.filter(n => !n.read);
    if (tab === 'critical') return items.filter(n => n.type === 'critical');
    return items;
  };

  const savePrefs = () => {
    toast.success(t('notifications.prefsSaved'));
    setPrefsOpen(false);
  };

  const renderList = (list: Notification[]) => (
    <div className="space-y-3">
      {list.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">{t('business.noNotifications')}</div>
      ) : (
        list.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer ${typeColors[n.type]} ${!n.read ? 'ring-1 ring-primary/20' : 'opacity-75'}`}
            onClick={() => !n.read && markRead(n.id)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
              <n.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{n.title}</span>
                {!n.read && <Badge variant="default" className="text-[10px] px-1.5 py-0">NEW</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(n.time).toLocaleString()}
              </span>
              {!n.read && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); markRead(n.id); }}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.notifications')}</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} {t('business.unreadNotifications')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPrefsOpen(true)}>
            <Settings className="h-4 w-4 me-2" />{t('notifications.preferences')}
          </Button>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 me-2" />{t('business.markAllRead')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="unread">{t('business.unread')} ({unreadCount})</TabsTrigger>
              <TabsTrigger value="critical">{t('business.critical')}</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">{renderList(filterByTab('all'))}</TabsContent>
            <TabsContent value="unread" className="mt-4">{renderList(filterByTab('unread'))}</TabsContent>
            <TabsContent value="critical" className="mt-4">{renderList(filterByTab('critical'))}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Preferences Dialog */}
      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('notifications.preferences')}</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t('notifications.channels')}</h4>
              <div className="flex items-center justify-between">
                <Label>{t('notifications.pushNotifications')}</Label>
                <Switch checked={prefs.push} onCheckedChange={v => setPrefs(p => ({ ...p, push: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('notifications.emailNotifications')}</Label>
                <Switch checked={prefs.email} onCheckedChange={v => setPrefs(p => ({ ...p, email: v }))} />
              </div>
            </div>
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-medium">{t('notifications.types')}</h4>
              {[
                { key: 'orders', label: t('notifications.orderUpdates') },
                { key: 'stock', label: t('notifications.stockAlerts') },
                { key: 'deliveries', label: t('notifications.deliveryUpdates') },
                { key: 'payments', label: t('notifications.paymentAlerts') },
                { key: 'critical', label: t('notifications.criticalAlerts') },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <Label>{item.label}</Label>
                  <Switch checked={prefs[item.key as keyof typeof prefs] as boolean} onCheckedChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={savePrefs}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
