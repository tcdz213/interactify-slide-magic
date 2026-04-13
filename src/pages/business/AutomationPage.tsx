import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Play, Pause, Plus, Zap, Bell, Package, Clock, Trash2, ToggleLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIWidget } from '@/components/KPIWidget';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastRun: string | null;
  runCount: number;
}

const MOCK_RULES: AutomationRule[] = [
  { id: 'r1', name: 'Alerte stock bas', trigger: 'Stock < seuil minimum', condition: 'Quantité < 10 unités', action: 'Envoyer notification au magasinier', enabled: true, lastRun: '2025-04-12 08:30', runCount: 47 },
  { id: 'r2', name: 'Auto-facturation commande livrée', trigger: 'Commande → Livrée', condition: 'Paiement confirmé', action: 'Générer facture automatiquement', enabled: true, lastRun: '2025-04-11 16:45', runCount: 123 },
  { id: 'r3', name: 'Rappel impayé J+30', trigger: 'Facture en retard > 30j', condition: 'Montant > 5 000 DZD', action: 'Envoyer email de relance', enabled: false, lastRun: '2025-04-08 09:00', runCount: 12 },
  { id: 'r4', name: 'Réapprovisionnement auto', trigger: 'Stock < seuil minimum', condition: 'Fournisseur actif', action: 'Créer bon de commande brouillon', enabled: true, lastRun: '2025-04-12 06:00', runCount: 31 },
  { id: 'r5', name: 'Notification nouveau client', trigger: 'Client créé', condition: 'Toujours', action: 'Notifier le commercial assigné', enabled: true, lastRun: '2025-04-10 14:20', runCount: 8 },
  { id: 'r6', name: 'Clôture fin de mois', trigger: 'Dernier jour du mois', condition: 'Toujours', action: 'Générer rapport mensuel + archiver', enabled: false, lastRun: '2025-03-31 23:59', runCount: 3 },
];

const TEMPLATES = [
  { name: 'Alerte stock bas', trigger: 'stock_below', action: 'notify', icon: Package },
  { name: 'Relance impayé', trigger: 'invoice_overdue', action: 'email', icon: Bell },
  { name: 'Auto-facturation', trigger: 'order_delivered', action: 'create_invoice', icon: Zap },
  { name: 'Rapport planifié', trigger: 'schedule', action: 'generate_report', icon: Clock },
];

export default function AutomationPage() {
  const { t } = useTranslation();
  const [rules, setRules] = useState(MOCK_RULES);
  const [showCreate, setShowCreate] = useState(false);

  const toggle = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast.success('Règle mise à jour');
  };

  const activeCount = rules.filter(r => r.enabled).length;
  const totalRuns = rules.reduce((s, r) => s + r.runCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.automation', 'Automatisations')} description={t('saas.automationDesc', 'Configurez des règles pour automatiser vos opérations')} />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title="Règles actives" value={activeCount} icon={<Play className="h-4 w-4" />} />
        <KPIWidget title="Total règles" value={rules.length} icon={<Bot className="h-4 w-4" />} />
        <KPIWidget title="Exécutions totales" value={totalRuns} icon={<Zap className="h-4 w-4" />} />
        <KPIWidget title="Templates" value={TEMPLATES.length} icon={<ToggleLeft className="h-4 w-4" />} />
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Templates rapides</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          {TEMPLATES.map((tpl) => (
            <Card key={tpl.name} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setShowCreate(true); toast.info(`Template "${tpl.name}" sélectionné`); }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2"><tpl.icon className="h-4 w-4 text-primary" /></div>
                <span className="text-sm font-medium text-foreground">{tpl.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rules list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('saas.rulesList', 'Règles configurées')}</CardTitle>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />Nouvelle règle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer une règle</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Nom</Label><Input placeholder="Ex: Alerte stock bas" /></div>
                <div><Label>Déclencheur</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock_below">Stock en dessous du seuil</SelectItem>
                      <SelectItem value="order_delivered">Commande livrée</SelectItem>
                      <SelectItem value="invoice_overdue">Facture en retard</SelectItem>
                      <SelectItem value="customer_created">Nouveau client</SelectItem>
                      <SelectItem value="schedule">Planification (cron)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Action</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notify">Envoyer notification</SelectItem>
                      <SelectItem value="email">Envoyer email</SelectItem>
                      <SelectItem value="create_invoice">Créer facture</SelectItem>
                      <SelectItem value="create_po">Créer bon de commande</SelectItem>
                      <SelectItem value="generate_report">Générer rapport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => { setShowCreate(false); toast.success('Règle créée'); }}>Créer la règle</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-4 rounded-lg border p-4">
              <Switch checked={rule.enabled} onCheckedChange={() => toggle(rule.id)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{rule.name}</p>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">{rule.enabled ? 'Actif' : 'Inactif'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{rule.trigger} → {rule.action}</p>
              </div>
              <div className="text-end shrink-0">
                <p className="text-xs text-muted-foreground">{rule.runCount} exécutions</p>
                {rule.lastRun && <p className="text-xs text-muted-foreground">Dernier: {rule.lastRun}</p>}
              </div>
              <Button variant="ghost" size="icon" className="shrink-0"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
