import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Play, Plus, Zap, Bell, Package, Clock, Trash2, ToggleLeft, History, TestTube, Mail, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPIWidget } from '@/components/KPIWidget';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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

interface ExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  status: 'success' | 'failed' | 'skipped';
  executedAt: string;
  details: string;
}

const MOCK_RULES: AutomationRule[] = [
  { id: 'r1', name: 'Alerte stock bas', trigger: 'stock_below', condition: 'Quantité < 10 unités', action: 'Envoyer notification au magasinier', enabled: true, lastRun: '2025-04-12 08:30', runCount: 47 },
  { id: 'r2', name: 'Auto-facturation commande livrée', trigger: 'order_delivered', condition: 'Paiement confirmé', action: 'Générer facture automatiquement', enabled: true, lastRun: '2025-04-11 16:45', runCount: 123 },
  { id: 'r3', name: 'Rappel impayé J+30', trigger: 'invoice_overdue', condition: 'Montant > 5 000 DZD', action: 'Envoyer email de relance', enabled: false, lastRun: '2025-04-08 09:00', runCount: 12 },
  { id: 'r4', name: 'Réapprovisionnement auto', trigger: 'stock_below', condition: 'Fournisseur actif', action: 'Créer bon de commande brouillon', enabled: true, lastRun: '2025-04-12 06:00', runCount: 31 },
  { id: 'r5', name: 'Notification nouveau client', trigger: 'customer_created', condition: 'Toujours', action: 'Notifier le commercial assigné', enabled: true, lastRun: '2025-04-10 14:20', runCount: 8 },
  { id: 'r6', name: 'Clôture fin de mois', trigger: 'schedule', condition: 'Toujours', action: 'Générer rapport mensuel + archiver', enabled: false, lastRun: '2025-03-31 23:59', runCount: 3 },
];

const MOCK_LOGS: ExecutionLog[] = [
  { id: 'l1', ruleId: 'r1', ruleName: 'Alerte stock bas', status: 'success', executedAt: '2025-04-12 08:30', details: 'Notification envoyée pour 3 produits' },
  { id: 'l2', ruleId: 'r2', ruleName: 'Auto-facturation', status: 'success', executedAt: '2025-04-11 16:45', details: 'Facture #INV-893 générée' },
  { id: 'l3', ruleId: 'r3', ruleName: 'Rappel impayé J+30', status: 'failed', executedAt: '2025-04-08 09:00', details: 'Email non envoyé — adresse invalide' },
  { id: 'l4', ruleId: 'r4', ruleName: 'Réapprovisionnement auto', status: 'success', executedAt: '2025-04-12 06:00', details: 'BC #PO-102 créé pour 5 articles' },
  { id: 'l5', ruleId: 'r1', ruleName: 'Alerte stock bas', status: 'skipped', executedAt: '2025-04-11 08:30', details: 'Aucun produit en dessous du seuil' },
  { id: 'l6', ruleId: 'r5', ruleName: 'Notification nouveau client', status: 'success', executedAt: '2025-04-10 14:20', details: 'Commercial Rachid notifié' },
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
  const [logs] = useState(MOCK_LOGS);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [tab, setTab] = useState('rules');

  // Create form
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAction, setNewAction] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const toggle = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast.success(t('automation.ruleUpdated', 'Rule updated'));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setRules(prev => prev.filter(r => r.id !== deleteTarget));
    toast.success(t('automation.ruleDeleted', 'Rule deleted'));
    setDeleteTarget(null);
  };

  const handleCreate = () => {
    if (!newName || !newTrigger || !newAction) { toast.error(t('common.required')); return; }
    const rule: AutomationRule = {
      id: `r${Date.now()}`, name: newName, trigger: newTrigger,
      condition: newCondition || 'Always', action: newAction,
      enabled: true, lastRun: null, runCount: 0,
    };
    setRules(prev => [rule, ...prev]);
    toast.success(t('automation.ruleCreated', 'Rule created'));
    setShowCreate(false);
    setNewName(''); setNewTrigger(''); setNewCondition(''); setNewAction('');
  };

  const handleDryRun = (rule: AutomationRule) => {
    toast.info(t('automation.dryRunResult', `Dry run: "${rule.name}" would affect 3 records`));
  };

  const activeCount = rules.filter(r => r.enabled).length;
  const totalRuns = rules.reduce((s, r) => s + r.runCount, 0);
  const successRate = logs.length ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0;

  const logStatusIcon = (s: string) => {
    if (s === 'success') return <CheckCircle className="h-4 w-4 text-success" />;
    if (s === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t('saas.automation', 'Automations')} description={t('saas.automationDesc', 'Configure rules to automate your operations')} />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title={t('automation.activeRules', 'Active Rules')} value={activeCount} icon={<Play className="h-4 w-4" />} />
        <KPIWidget title={t('automation.totalRules', 'Total Rules')} value={rules.length} icon={<Bot className="h-4 w-4" />} />
        <KPIWidget title={t('automation.totalExecutions', 'Total Executions')} value={totalRuns} icon={<Zap className="h-4 w-4" />} />
        <KPIWidget title={t('automation.successRate', 'Success Rate')} value={`${successRate}%`} icon={<CheckCircle className="h-4 w-4" />} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rules"><Settings className="h-3.5 w-3.5 me-1" />{t('automation.rulesTab', 'Rules')}</TabsTrigger>
          <TabsTrigger value="logs"><History className="h-3.5 w-3.5 me-1" />{t('automation.logsTab', 'Execution Logs')}</TabsTrigger>
          <TabsTrigger value="templates"><Package className="h-3.5 w-3.5 me-1" />{t('automation.templatesTab', 'Templates')}</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-3.5 w-3.5 me-1" />{t('automation.emailTab', 'Email Templates')}</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{t('saas.rulesList', 'Configured rules')}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="h-3.5 w-3.5" />{t('automation.newRule', 'New Rule')}</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggle(rule.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{rule.name}</p>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">{rule.enabled ? t('common.active') : t('common.inactive')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.trigger} → {rule.action}</p>
                    <p className="text-xs text-muted-foreground">{t('automation.condition', 'Condition')}: {rule.condition}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs text-muted-foreground">{rule.runCount} {t('automation.executions', 'executions')}</p>
                    {rule.lastRun && <p className="text-xs text-muted-foreground">{t('automation.lastRun', 'Last')}: {rule.lastRun}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDryRun(rule)} title={t('automation.dryRun', 'Dry Run')}>
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(rule.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('automation.executionLogs', 'Execution Logs')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {logStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.ruleName}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">{log.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{log.executedAt}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((tpl) => (
              <Card key={tpl.name} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setNewName(tpl.name); setNewTrigger(tpl.trigger); setNewAction(tpl.action); setShowCreate(true); }}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2"><tpl.icon className="h-4 w-4 text-primary" /></div>
                  <span className="text-sm font-medium text-foreground">{tpl.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('automation.emailTemplateBuilder', 'Email Template Builder')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('automation.subject', 'Subject')}</Label>
                <Input placeholder="e.g. Rappel: Facture {{invoice_number}} en retard" />
              </div>
              <div className="space-y-2">
                <Label>{t('automation.body', 'Body')}</Label>
                <Textarea rows={6} placeholder={'Bonjour {{customer_name}},\n\nNous vous rappelons que la facture {{invoice_number}} de {{amount}} DZD est en retard...'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer">{'{{customer_name}}'}</Badge>
                <Badge variant="outline" className="cursor-pointer">{'{{invoice_number}}'}</Badge>
                <Badge variant="outline" className="cursor-pointer">{'{{amount}}'}</Badge>
                <Badge variant="outline" className="cursor-pointer">{'{{due_date}}'}</Badge>
              </div>
              <Button onClick={() => toast.success(t('automation.templateSaved', 'Template saved'))}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={v => { if (!v) { setNewName(''); setNewTrigger(''); setNewCondition(''); setNewAction(''); } setShowCreate(v); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('automation.createRule', 'Create Rule')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t('common.name')}</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Alerte stock bas" /></div>
            <div className="space-y-2">
              <Label>{t('automation.trigger', 'Trigger')}</Label>
              <Select value={newTrigger} onValueChange={setNewTrigger}>
                <SelectTrigger><SelectValue placeholder={t('automation.chooseTrigger', 'Choose...')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_below">{t('automation.triggerStock', 'Stock below threshold')}</SelectItem>
                  <SelectItem value="order_delivered">{t('automation.triggerDelivered', 'Order delivered')}</SelectItem>
                  <SelectItem value="invoice_overdue">{t('automation.triggerOverdue', 'Invoice overdue')}</SelectItem>
                  <SelectItem value="customer_created">{t('automation.triggerNewCustomer', 'New customer')}</SelectItem>
                  <SelectItem value="schedule">{t('automation.triggerSchedule', 'Schedule (cron)')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t('automation.condition', 'Condition')}</Label><Input value={newCondition} onChange={e => setNewCondition(e.target.value)} placeholder="e.g. Quantité < 10" /></div>
            <div className="space-y-2">
              <Label>{t('automation.actionLabel', 'Action')}</Label>
              <Select value={newAction} onValueChange={setNewAction}>
                <SelectTrigger><SelectValue placeholder={t('automation.chooseAction', 'Choose...')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="notify">{t('automation.actionNotify', 'Send notification')}</SelectItem>
                  <SelectItem value="email">{t('automation.actionEmail', 'Send email')}</SelectItem>
                  <SelectItem value="create_invoice">{t('automation.actionInvoice', 'Create invoice')}</SelectItem>
                  <SelectItem value="create_po">{t('automation.actionPO', 'Create purchase order')}</SelectItem>
                  <SelectItem value="generate_report">{t('automation.actionReport', 'Generate report')}</SelectItem>
                  <SelectItem value="webhook">{t('automation.actionWebhook', 'Call webhook')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newAction === 'webhook' && (
              <div className="space-y-2"><Label>Webhook URL</Label><Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://..." /></div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCreate}>{t('automation.createRule', 'Create Rule')}</Button>
              <Button variant="outline" onClick={() => { handleCreate(); toast.info(t('automation.dryRunResult', 'Dry run completed')); }}><TestTube className="h-4 w-4 me-1" />{t('automation.dryRun', 'Dry Run')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }} title={t('common.areYouSure')} description={t('common.cannotUndo')} onConfirm={handleDelete} />
    </div>
  );
}
