import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPIWidget } from '@/components/KPIWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  created: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
  calls: number;
}

const MOCK_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production ERP', key: 'jwd_live_4f8a2b...x9d3', scopes: ['products:read', 'orders:read', 'orders:write'], created: '2025-01-15', lastUsed: '2025-04-12', status: 'active', calls: 12450 },
  { id: 'k2', name: 'Mobile App', key: 'jwd_live_7c1d9e...m4k2', scopes: ['products:read', 'orders:read'], created: '2025-02-20', lastUsed: '2025-04-11', status: 'active', calls: 8320 },
  { id: 'k3', name: 'Test Integration', key: 'jwd_test_2a5f8b...p7j1', scopes: ['products:read'], created: '2025-03-01', lastUsed: '2025-03-15', status: 'revoked', calls: 234 },
];

const USAGE_DATA = [
  { day: 'Lun', calls: 1850 }, { day: 'Mar', calls: 2100 }, { day: 'Mer', calls: 1920 },
  { day: 'Jeu', calls: 2340 }, { day: 'Ven', calls: 2180 }, { day: 'Sam', calls: 980 }, { day: 'Dim', calls: 420 },
];

const SCOPES = [
  { id: 'products:read', label: 'Produits (lecture)' },
  { id: 'products:write', label: 'Produits (écriture)' },
  { id: 'orders:read', label: 'Commandes (lecture)' },
  { id: 'orders:write', label: 'Commandes (écriture)' },
  { id: 'customers:read', label: 'Clients (lecture)' },
  { id: 'customers:write', label: 'Clients (écriture)' },
  { id: 'inventory:read', label: 'Inventaire (lecture)' },
  { id: 'invoices:read', label: 'Factures (lecture)' },
];

export default function ApiManagementPage() {
  const { t } = useTranslation();
  const [keys] = useState(MOCK_KEYS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const totalCalls = keys.reduce((s, k) => s + k.calls, 0);
  const activeKeys = keys.filter(k => k.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.apiManagement', 'Gestion API')} description={t('saas.apiDesc', 'Gérez vos clés API et surveillez l\'utilisation')} />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title="Clés actives" value={activeKeys} icon={<Key className="h-4 w-4" />} />
        <KPIWidget title="Appels (7j)" value={USAGE_DATA.reduce((s, d) => s + d.calls, 0).toLocaleString()} icon={<BarChart3 className="h-4 w-4" />} />
        <KPIWidget title="Total appels" value={totalCalls.toLocaleString()} icon={<BarChart3 className="h-4 w-4" />} />
        <KPIWidget title="Scopes disponibles" value={SCOPES.length} icon={<Key className="h-4 w-4" />} />
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Utilisation API (7 derniers jours)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={USAGE_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="calls" name="Appels" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Clés API</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />Générer une clé</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle clé API</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Nom</Label><Input placeholder="Ex: ERP Production" /></div>
                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {SCOPES.map((scope) => (
                      <label key={scope.id} className="flex items-center gap-2 text-sm">
                        <Checkbox />{scope.label}
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('Clé API générée')}>Générer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {keys.map((apiKey) => (
            <div key={apiKey.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{apiKey.name}</p>
                  <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>{apiKey.status === 'active' ? 'Actif' : 'Révoqué'}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setShowKeys(p => ({ ...p, [apiKey.id]: !p[apiKey.id] }))}>
                    {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey.key); toast.success('Copié'); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-xs font-mono text-muted-foreground">{showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••'}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Créée: {apiKey.created}</span>
                <span>Dernière utilisation: {apiKey.lastUsed || 'Jamais'}</span>
                <span>{apiKey.calls.toLocaleString()} appels</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {apiKey.scopes.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Documentation API</p>
            <p className="text-xs text-muted-foreground">Consultez la documentation complète de l'API REST JAWDA</p>
          </div>
          <Button variant="outline" className="gap-1"><ExternalLink className="h-4 w-4" />Voir la documentation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
