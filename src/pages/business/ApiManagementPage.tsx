import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, ExternalLink, BarChart3, RefreshCw, Webhook, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPIWidget } from '@/components/KPIWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ApiKey {
  id: string; name: string; key: string; scopes: string[]; created: string; lastUsed: string | null; status: 'active' | 'revoked'; calls: number; rateLimit: number;
}

interface WebhookConfig {
  id: string; url: string; events: string[]; status: 'active' | 'inactive'; lastTriggered: string | null; failures: number;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production ERP', key: 'jwd_live_4f8a2b9c1d3e5f7a8b0c2d4e6f8a0b2c4d6e8f0a', scopes: ['products:read', 'orders:read', 'orders:write'], created: '2025-01-15', lastUsed: '2025-04-12', status: 'active', calls: 12450, rateLimit: 1000 },
  { id: 'k2', name: 'Mobile App', key: 'jwd_live_7c1d9e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d', scopes: ['products:read', 'orders:read'], created: '2025-02-20', lastUsed: '2025-04-11', status: 'active', calls: 8320, rateLimit: 500 },
  { id: 'k3', name: 'Test Integration', key: 'jwd_test_2a5f8b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a', scopes: ['products:read'], created: '2025-03-01', lastUsed: '2025-03-15', status: 'revoked', calls: 234, rateLimit: 100 },
];

const INITIAL_WEBHOOKS: WebhookConfig[] = [
  { id: 'wh1', url: 'https://erp.mamafoods.com/hooks/orders', events: ['order.created', 'order.updated'], status: 'active', lastTriggered: '2025-04-12 14:30', failures: 0 },
  { id: 'wh2', url: 'https://sms.gateway.dz/webhook', events: ['delivery.completed'], status: 'active', lastTriggered: '2025-04-11 18:00', failures: 2 },
];

const USAGE_DATA = [
  { day: 'Lun', calls: 1850, errors: 12 }, { day: 'Mar', calls: 2100, errors: 8 }, { day: 'Mer', calls: 1920, errors: 15 },
  { day: 'Jeu', calls: 2340, errors: 5 }, { day: 'Ven', calls: 2180, errors: 10 }, { day: 'Sam', calls: 980, errors: 3 }, { day: 'Dim', calls: 420, errors: 1 },
];

const SCOPES = [
  { id: 'products:read', label: 'Produits (lecture)' }, { id: 'products:write', label: 'Produits (écriture)' },
  { id: 'orders:read', label: 'Commandes (lecture)' }, { id: 'orders:write', label: 'Commandes (écriture)' },
  { id: 'customers:read', label: 'Clients (lecture)' }, { id: 'customers:write', label: 'Clients (écriture)' },
  { id: 'inventory:read', label: 'Inventaire (lecture)' }, { id: 'invoices:read', label: 'Factures (lecture)' },
];

const WEBHOOK_EVENTS = ['order.created', 'order.updated', 'order.cancelled', 'delivery.completed', 'delivery.failed', 'payment.received', 'invoice.created', 'stock.low'];

export default function ApiManagementPage() {
  const { t } = useTranslation();
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<Set<string>>(new Set());
  const [newKeyRate, setNewKeyRate] = useState(500);
  const [newWhUrl, setNewWhUrl] = useState('');
  const [newWhEvents, setNewWhEvents] = useState<Set<string>>(new Set());

  const totalCalls = keys.reduce((s, k) => s + k.calls, 0);
  const activeKeys = keys.filter(k => k.status === 'active').length;
  const errorRate = ((USAGE_DATA.reduce((s, d) => s + d.errors, 0) / USAGE_DATA.reduce((s, d) => s + d.calls, 0)) * 100).toFixed(2);

  const generateKey = () => {
    if (!newKeyName) { toast.error(t('common.required')); return; }
    const newKey: ApiKey = {
      id: `k${Date.now()}`, name: newKeyName,
      key: `jwd_live_${Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`,
      scopes: [...newKeyScopes], created: new Date().toISOString().split('T')[0], lastUsed: null, status: 'active', calls: 0, rateLimit: newKeyRate,
    };
    setKeys(prev => [...prev, newKey]);
    toast.success(t('api.keyGenerated', 'Clé API générée'));
    setCreateOpen(false);
    setNewKeyName('');
    setNewKeyScopes(new Set());
  };

  const rotateKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, key: `jwd_live_${Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}` } : k));
    toast.success(t('api.keyRotated', 'Clé rotée avec succès'));
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
    toast.success(t('api.keyRevoked', 'Clé révoquée'));
  };

  const addWebhook = () => {
    if (!newWhUrl) { toast.error(t('common.required')); return; }
    setWebhooks(prev => [...prev, { id: `wh${Date.now()}`, url: newWhUrl, events: [...newWhEvents], status: 'active', lastTriggered: null, failures: 0 }]);
    toast.success(t('api.webhookCreated', 'Webhook créé'));
    setWebhookOpen(false);
    setNewWhUrl('');
    setNewWhEvents(new Set());
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.apiManagement', 'Gestion API')} description={t('saas.apiDesc', "Gérez vos clés API et surveillez l'utilisation")} />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title={t('api.activeKeys', 'Clés actives')} value={activeKeys} icon={<Key className="h-4 w-4" />} />
        <KPIWidget title={t('api.weekCalls', 'Appels (7j)')} value={USAGE_DATA.reduce((s, d) => s + d.calls, 0).toLocaleString()} icon={<BarChart3 className="h-4 w-4" />} />
        <KPIWidget title={t('api.totalCalls', 'Total appels')} value={totalCalls.toLocaleString()} icon={<BarChart3 className="h-4 w-4" />} />
        <KPIWidget title={t('api.errorRate', 'Taux d\'erreur')} value={`${errorRate}%`} icon={<Clock className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys"><Key className="h-4 w-4 me-1" />{t('api.keys', 'Clés API')}</TabsTrigger>
          <TabsTrigger value="usage"><BarChart3 className="h-4 w-4 me-1" />{t('api.usage', 'Utilisation')}</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="h-4 w-4 me-1" />{t('api.webhooks', 'Webhooks')}</TabsTrigger>
          <TabsTrigger value="docs"><ExternalLink className="h-4 w-4 me-1" />{t('api.docs', 'Documentation')}</TabsTrigger>
        </TabsList>

        {/* Keys Tab */}
        <TabsContent value="keys" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t('api.generateKey', 'Générer une clé')}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('api.newKey', 'Nouvelle clé API')}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div><Label>{t('common.name')}</Label><Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Ex: ERP Production" /></div>
                  <div>
                    <Label>{t('api.rateLimit', 'Limite (req/min)')}</Label>
                    <Select value={String(newKeyRate)} onValueChange={v => setNewKeyRate(+v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100/min</SelectItem>
                        <SelectItem value="500">500/min</SelectItem>
                        <SelectItem value="1000">1000/min</SelectItem>
                        <SelectItem value="5000">5000/min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('api.permissions', 'Permissions')}</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {SCOPES.map(scope => (
                        <label key={scope.id} className="flex items-center gap-2 text-sm">
                          <Checkbox checked={newKeyScopes.has(scope.id)} onCheckedChange={c => setNewKeyScopes(prev => { const n = new Set(prev); c ? n.add(scope.id) : n.delete(scope.id); return n; })} />
                          {scope.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter><Button onClick={generateKey}>{t('api.generateKey', 'Générer')}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {keys.map(apiKey => (
            <Card key={apiKey.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{apiKey.name}</p>
                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>{apiKey.status === 'active' ? t('common.active') : t('api.revoked', 'Révoqué')}</Badge>
                    <Badge variant="outline" className="text-xs">{apiKey.rateLimit}/min</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setShowKeys(p => ({ ...p, [apiKey.id]: !p[apiKey.id] }))}>{showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey.key); toast.success(t('api.copied', 'Copié')); }}><Copy className="h-4 w-4" /></Button>
                    {apiKey.status === 'active' && <Button variant="ghost" size="icon" onClick={() => rotateKey(apiKey.id)}><RefreshCw className="h-4 w-4" /></Button>}
                    {apiKey.status === 'active' && <Button variant="ghost" size="icon" onClick={() => revokeKey(apiKey.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{t('common.created')}: {apiKey.created}</span>
                  <span>{t('api.lastUsed', 'Dernière utilisation')}: {apiKey.lastUsed || t('api.never', 'Jamais')}</span>
                  <span>{apiKey.calls.toLocaleString()} {t('api.calls', 'appels')}</span>
                </div>
                <div className="flex flex-wrap gap-1">{apiKey.scopes.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('api.usageChart', 'Utilisation API (7 derniers jours)')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={USAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="calls" name={t('api.calls', 'Appels')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="errors" name={t('api.errors', 'Erreurs')} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t('api.addWebhook', 'Ajouter un webhook')}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('api.newWebhook', 'Nouveau webhook')}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div><Label>URL</Label><Input value={newWhUrl} onChange={e => setNewWhUrl(e.target.value)} placeholder="https://your-app.com/webhook" /></div>
                  <div>
                    <Label>{t('api.events', 'Événements')}</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {WEBHOOK_EVENTS.map(ev => (
                        <label key={ev} className="flex items-center gap-2 text-sm">
                          <Checkbox checked={newWhEvents.has(ev)} onCheckedChange={c => setNewWhEvents(prev => { const n = new Set(prev); c ? n.add(ev) : n.delete(ev); return n; })} />
                          {ev}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter><Button onClick={addWebhook}>{t('common.add')}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {webhooks.map(wh => (
            <Card key={wh.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Webhook className="h-4 w-4 text-muted-foreground" />
                    <code className="text-sm">{wh.url}</code>
                    <Badge variant={wh.status === 'active' ? 'default' : 'secondary'}>{wh.status}</Badge>
                    {wh.failures > 0 && <Badge variant="destructive">{wh.failures} failures</Badge>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setWebhooks(prev => prev.filter(w => w.id !== wh.id)); toast.success('Webhook supprimé'); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">{wh.events.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                {wh.lastTriggered && <p className="text-xs text-muted-foreground mt-1">{t('api.lastTriggered', 'Dernier déclenchement')}: {wh.lastTriggered}</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Docs Tab */}
        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('api.documentation', 'Documentation API')}</CardTitle>
              <CardDescription>{t('api.docsDesc', 'Consultez la documentation complète de l\'API REST JAWDA')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { method: 'GET', path: '/api/v1/products', desc: 'Liste des produits' },
                { method: 'POST', path: '/api/v1/orders', desc: 'Créer une commande' },
                { method: 'GET', path: '/api/v1/customers', desc: 'Liste des clients' },
                { method: 'GET', path: '/api/v1/invoices', desc: 'Liste des factures' },
                { method: 'GET', path: '/api/v1/inventory', desc: 'État du stock' },
                { method: 'POST', path: '/api/v1/payments', desc: 'Enregistrer un paiement' },
              ].map((ep, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <Badge variant={ep.method === 'GET' ? 'secondary' : 'default'} className="font-mono text-xs w-14 justify-center">{ep.method}</Badge>
                  <code className="text-sm flex-1">{ep.path}</code>
                  <span className="text-sm text-muted-foreground">{ep.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
