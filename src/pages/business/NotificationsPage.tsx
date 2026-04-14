import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, CheckCheck, AlertTriangle, ShoppingCart, Package, Truck, DollarSign, Settings2, Check, Trash2, Search, Download, RefreshCw } from 'lucide-react';
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

const makeNotifs = (): Notification[] => [
  { id: 'n1', title: 'Nouvelle commande reçue', body: 'Superette El Baraka — 3 articles, 24,000 DZD', time: '2024-12-06T10:30:00', read: false, type: 'order', icon: ShoppingCart },
  { id: 'n2', title: 'Stock faible — Huile d\'Olive 1L', body: 'Seulement 12 unités restantes (seuil: 50)', time: '2024-12-06T09:00:00', read: false, type: 'critical', icon: AlertTriangle },
  { id: 'n3', title: 'Livraison terminée', body: 'DEL-1024 livré à Gros Bazar Oran par Yacine B.', time: '2024-12-06T08:45:00', read: false, type: 'delivery', icon: Truck },
  { id: 'n4', title: 'Paiement reçu', body: 'Alimentation Générale Nour — 36,000 DZD', time: '2024-12-05T17:00:00', read: true, type: 'payment', icon: DollarSign },
  { id: 'n5', title: 'Commande confirmée', body: 'Wholesale Center Blida — Commande #ORD-2047', time: '2024-12-05T14:00:00', read: true, type: 'order', icon: ShoppingCart },
  { id: 'n6', title: 'Stock réapprovisionné', body: 'Couscous Fin 1kg — +600 unités ajoutées', time: '2024-12-05T11:30:00', read: true, type: 'stock', icon: Package },
  { id: 'n7', title: 'Stock critique — Semoule Extra 5kg', body: 'Rupture de stock imminente, 5 unités restantes', time: '2024-12-05T10:00:00', read: true, type: 'critical', icon: AlertTriangle },
  { id: 'n8', title: 'Livraison échouée', body: 'DEL-1019 — Client absent, tentative reportée', time: '2024-12-04T16:00:00', read: true, type: 'delivery', icon: Truck },
  { id: 'n9', title: 'Nouveau paiement chèque', body: 'Marché Central — 85,000 DZD, échéance 15/01', time: '2024-12-04T12:00:00', read: true, type: 'payment', icon: DollarSign },
  { id: 'n10', title: 'Commande en attente de validation', body: 'Mini Market Sétif — ORD-2052, 12 articles', time: '2024-12-04T09:30:00', read: true, type: 'order', icon: ShoppingCart },
];

const typeColors: Record<string, string> = {
  order: 'bg-info/10 border-info/20',
  stock: 'bg-warning/10 border-warning/20',
  delivery: 'bg-success/10 border-success/20',
  payment: 'bg-primary/10 border-primary/20',
  critical: 'bg-destructive/10 border-destructive/20',
};

const typeLabels: Record<string, string> = {
  order: 'notifications.orderNotifs',
  stock: 'notifications.stockNotifs',
  delivery: 'notifications.deliveryNotifs',
  payment: 'notifications.paymentNotifs',
  critical: 'notifications.criticalNotifs',
};

// Export unread count for sidebar badge
export let notificationUnreadCount = 0;

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState(makeNotifs);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [prefs, setPrefs] = useState({
    orders: true, stock: true, deliveries: true, payments: true, critical: true,
    emailNotifs: false, pushNotifs: true, soundEnabled: true, desktopNotifs: false,
  });

  const unreadCount = items.filter(n => !n.read).length;
  notificationUnreadCount = unreadCount;

  const markAllRead = () => { setItems(prev => prev.map(n => ({ ...n, read: true }))); toast.success(t('notifications.allMarkedRead')); };
  const markOneRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => { setItems(prev => prev.filter(n => n.id !== id)); toast.success(t('notifications.deleted')); };
  const deleteAllRead = () => { setItems(prev => prev.filter(n => !n.read)); toast.success(t('notifications.readCleared')); };

  // Auto-generate a notification every 30s
  useEffect(() => {
    const templates = [
      { title: 'Nouvelle commande express', body: 'Client VIP — commande urgente 45,000 DZD', type: 'order' as const, icon: ShoppingCart },
      { title: 'Alerte stock — Lait UHT 1L', body: '8 unités restantes, seuil critique atteint', type: 'critical' as const, icon: AlertTriangle },
      { title: 'Livraison confirmée', body: 'DEL-1031 livré avec succès à Alger Centre', type: 'delivery' as const, icon: Truck },
    ];
    const timer = setInterval(() => {
      const tpl = templates[Math.floor(Math.random() * templates.length)];
      const newN: Notification = { ...tpl, id: `n-${Date.now()}`, time: new Date().toISOString(), read: false };
      setItems(prev => [newN, ...prev]);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleExport = () => {
    const csv = ['ID,Title,Type,Time,Read', ...items.map(n => `${n.id},"${n.title}",${n.type},${n.time},${n.read}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'notifications.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('notifications.exported'));
  };

  const filterItems = useCallback((tab: string) => {
    let list = items;
    if (tab === 'unread') list = list.filter(n => !n.read);
    if (tab === 'critical') list = list.filter(n => n.type === 'critical');
    if (typeFilter !== 'all') list = list.filter(n => n.type === typeFilter);
    if (search) list = list.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [items, typeFilter, search]);

  // Group by date
  const groupByDate = (list: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    list.forEach(n => {
      const day = new Date(n.time).toLocaleDateString();
      (groups[day] ??= []).push(n);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  };

  const renderList = (list: Notification[]) => {
    const grouped = groupByDate(list);
    if (list.length === 0) return <div className="text-center py-12 text-muted-foreground text-sm">{t('business.noNotifications')}</div>;
    return (
      <div className="space-y-6">
        {grouped.map(([date, notifs]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">{date}</h3>
            <div className="space-y-2">
              {notifs.map(n => (
                <div key={n.id} className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${typeColors[n.type]} ${!n.read ? 'ring-1 ring-primary/20' : 'opacity-70'}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background shrink-0">
                    <n.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{n.title}</span>
                      {!n.read && <Badge variant="default" className="text-[10px] px-1.5 py-0">NEW</Badge>}
                      <Badge variant="outline" className="text-[10px] ms-auto">{t(typeLabels[n.type])}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                      {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!n.read && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markOneRead(n.id)} title={t('notifications.markAsRead')}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteNotif(n.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.notifications')}</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} {t('business.unreadNotifications')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 me-2" />{t('common.export')}</Button>
          <Button variant="outline" size="sm" onClick={() => setPrefsOpen(true)}><Settings2 className="h-4 w-4 me-2" />{t('notifications.preferences')}</Button>
          <Button variant="outline" size="sm" onClick={deleteAllRead} disabled={items.filter(n => n.read).length === 0}><Trash2 className="h-4 w-4 me-2" />{t('notifications.clearRead')}</Button>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4 me-2" />{t('business.markAllRead')}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t('notifications.filterByType')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="order">{t('notifications.orderNotifs')}</SelectItem>
            <SelectItem value="stock">{t('notifications.stockNotifs')}</SelectItem>
            <SelectItem value="delivery">{t('notifications.deliveryNotifs')}</SelectItem>
            <SelectItem value="payment">{t('notifications.paymentNotifs')}</SelectItem>
            <SelectItem value="critical">{t('notifications.criticalNotifs')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">{t('common.all')} ({filterItems('all').length})</TabsTrigger>
              <TabsTrigger value="unread">{t('business.unread')} ({filterItems('unread').length})</TabsTrigger>
              <TabsTrigger value="critical">{t('business.critical')} ({filterItems('critical').length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">{renderList(filterItems('all'))}</TabsContent>
            <TabsContent value="unread" className="mt-4">{renderList(filterItems('unread'))}</TabsContent>
            <TabsContent value="critical" className="mt-4">{renderList(filterItems('critical'))}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preferences Dialog */}
      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('notifications.preferences')}</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t('notifications.categories')}</h4>
              {[
                { key: 'orders', label: t('notifications.orderNotifs'), icon: ShoppingCart },
                { key: 'stock', label: t('notifications.stockNotifs'), icon: Package },
                { key: 'deliveries', label: t('notifications.deliveryNotifs'), icon: Truck },
                { key: 'payments', label: t('notifications.paymentNotifs'), icon: DollarSign },
                { key: 'critical', label: t('notifications.criticalNotifs'), icon: AlertTriangle },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><Label>{label}</Label></div>
                  <Switch checked={(prefs as any)[key]} onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium">{t('notifications.channels')}</h4>
              <div className="flex items-center justify-between"><Label>{t('notifications.emailNotifs')}</Label><Switch checked={prefs.emailNotifs} onCheckedChange={v => setPrefs(p => ({ ...p, emailNotifs: v }))} /></div>
              <div className="flex items-center justify-between"><Label>{t('notifications.pushNotifs')}</Label><Switch checked={prefs.pushNotifs} onCheckedChange={v => setPrefs(p => ({ ...p, pushNotifs: v }))} /></div>
              <div className="flex items-center justify-between"><Label>{t('notifications.soundEnabled')}</Label><Switch checked={prefs.soundEnabled} onCheckedChange={v => setPrefs(p => ({ ...p, soundEnabled: v }))} /></div>
              <div className="flex items-center justify-between"><Label>{t('notifications.desktopNotifs')}</Label><Switch checked={prefs.desktopNotifs} onCheckedChange={v => setPrefs(p => ({ ...p, desktopNotifs: v }))} /></div>
            </div>
            <Button className="w-full" onClick={() => { setPrefsOpen(false); toast.success(t('notifications.preferencesSaved')); }}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
