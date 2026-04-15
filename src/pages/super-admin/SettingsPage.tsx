import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Bell, KeyRound, Shield, Copy, Eye, EyeOff, Wrench, Save, Mail, Flag, Database, Download } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'jawda_admin_settings';

interface AdminSettings {
  platform: { name: string; email: string; url: string };
  smtp: { host: string; port: number; user: string; from: string; enabled: boolean };
  features: Record<string, boolean>;
  notifs: Record<string, boolean>;
}

const defaultSettings: AdminSettings = {
  platform: { name: 'JAWDA Distribution', email: 'support@jawda.io', url: 'https://app.jawda.io' },
  smtp: { host: 'smtp.jawda.io', port: 587, user: 'noreply@jawda.io', from: 'JAWDA Platform', enabled: true },
  features: { multiWarehouse: true, advancedAnalytics: true, apiAccess: true, whiteLabel: false, customDomain: false, bulkImport: true, autoBackup: true },
  notifs: { newTenant: true, paymentFailed: true, trialExpiring: true, highChurn: true },
};

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : defaultSettings; } catch { return defaultSettings; }
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('jwd_live_sk_a3f8c91d2e4b6f7a8c0d1e2f3a4b5c6d');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof AdminSettings>(section: K, field: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaving(false);
    setHasChanges(false);
    toast.success(t('business.settingsSaved'));
  };

  const generateNewKey = () => {
    const chars = 'abcdef0123456789';
    const key = 'jwd_live_sk_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setApiKey(key);
    toast.success(t('admin.generateNewKey') + ' ✓');
  };

  const handleBackup = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'jawda-settings-backup.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('admin.backupCreated', 'Backup created'));
  };

  const handleRestore = () => {
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    toast.success(t('admin.settingsRestored', 'Settings restored to defaults'));
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.platformSettings')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.settingsDescription')}</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          <Save className="h-4 w-4 me-2" />{saving ? t('common.loading') : t('common.save')}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general"><Globe className="h-4 w-4 me-1" />{t('admin.general')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 me-1" />{t('nav.notifications')}</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="h-4 w-4 me-1" />{t('admin.apiKeys')}</TabsTrigger>
          <TabsTrigger value="smtp"><Mail className="h-4 w-4 me-1" />SMTP</TabsTrigger>
          <TabsTrigger value="features"><Flag className="h-4 w-4 me-1" />{t('admin.featureFlags', 'Feature Flags')}</TabsTrigger>
          <TabsTrigger value="maintenance"><Wrench className="h-4 w-4 me-1" />{t('admin.maintenance')}</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.platformInfo')}</CardTitle><CardDescription>{t('admin.platformInfoDesc')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t('admin.platformName')}</Label><Input value={settings.platform.name} onChange={e => update('platform', 'name', e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('admin.supportEmail')}</Label><Input value={settings.platform.email} onChange={e => update('platform', 'email', e.target.value)} type="email" /></div>
              </div>
              <div className="space-y-2"><Label>{t('admin.platformUrl')}</Label><Input value={settings.platform.url} onChange={e => update('platform', 'url', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.planConfig')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[{ name: 'Starter', price: '29', users: '5' }, { name: 'Professional', price: '79', users: '20' }, { name: 'Enterprise', price: '199', users: '∞' }].map(plan => (
                  <div key={plan.name} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between"><h4 className="font-medium">{plan.name}</h4><Badge variant="outline">{t('common.active')}</Badge></div>
                    <div className="space-y-2">
                      <div className="space-y-1"><Label className="text-xs">{t('admin.monthlyPrice')}</Label><Input defaultValue={plan.price} className="h-8" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('admin.maxUsers')}</Label><Input defaultValue={plan.users} className="h-8" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.emailNotifications')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifs).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <Label>{t(`admin.notif${key.charAt(0).toUpperCase() + key.slice(1)}`, key)}</Label>
                  <Switch checked={enabled} onCheckedChange={v => { setSettings(prev => ({ ...prev, notifs: { ...prev.notifs, [key]: v } })); setHasChanges(true); }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.apiKeys')}</CardTitle><CardDescription>{t('admin.apiKeysDesc')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">Production Key</p><p className="text-xs text-muted-foreground">{t('common.created')}: 2024-01-15</p></div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('common.active')}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'} readOnly className="font-mono text-xs" />
                  <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>{showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success(t('admin.apiKeyCopied')); }}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <Separator />
              <Button variant="outline" onClick={generateNewKey}><KeyRound className="h-4 w-4 me-2" />{t('admin.generateNewKey')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP */}
        <TabsContent value="smtp" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.smtpConfig', 'SMTP Configuration')}</CardTitle><CardDescription>{t('admin.smtpDesc', 'Configure email delivery settings')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium text-sm">{t('admin.smtpEnabled', 'SMTP Enabled')}</p><p className="text-xs text-muted-foreground">{t('admin.smtpEnabledDesc', 'Toggle email delivery')}</p></div>
                <Switch checked={settings.smtp.enabled} onCheckedChange={v => update('smtp', 'enabled', v)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t('admin.smtpHost', 'SMTP Host')}</Label><Input value={settings.smtp.host} onChange={e => update('smtp', 'host', e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('admin.smtpPort', 'Port')}</Label><Input type="number" value={settings.smtp.port} onChange={e => update('smtp', 'port', +e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('admin.smtpUser', 'Username')}</Label><Input value={settings.smtp.user} onChange={e => update('smtp', 'user', e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('admin.smtpFrom', 'From Name')}</Label><Input value={settings.smtp.from} onChange={e => update('smtp', 'from', e.target.value)} /></div>
              </div>
              <Button variant="outline" onClick={() => toast.success(t('admin.testEmailSent', 'Test email sent'))}><Mail className="h-4 w-4 me-2" />{t('admin.sendTestEmail', 'Send test email')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.featureFlags', 'Feature Flags')}</CardTitle><CardDescription>{t('admin.featureFlagsDesc', 'Enable or disable platform features globally')}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(settings.features).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'ON' : 'OFF'}</Badge>
                    <Switch checked={enabled} onCheckedChange={v => { setSettings(prev => ({ ...prev, features: { ...prev.features, [key]: v } })); setHasChanges(true); }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-5 w-5" />{t('admin.maintenanceMode')}</CardTitle>
              <CardDescription>{t('admin.maintenanceModeDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium">{t('admin.enableMaintenance')}</p><p className="text-sm text-muted-foreground">{t('admin.maintenanceWarning')}</p></div>
                <Switch checked={maintenanceMode} onCheckedChange={v => { setMaintenanceMode(v); toast[v ? 'warning' : 'success'](v ? t('admin.maintenanceActive') : 'Maintenance mode disabled'); }} />
              </div>
              {maintenanceMode && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="text-sm font-medium text-warning">{t('admin.maintenanceActive')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.maintenanceActiveDesc')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-5 w-5" />{t('admin.backupRestore', 'Backup & Restore')}</CardTitle></CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" onClick={handleBackup}><Download className="h-4 w-4 me-2" />{t('admin.createBackup', 'Create Backup')}</Button>
              <Button variant="outline" onClick={handleRestore}>{t('admin.restoreDefaults', 'Restore Defaults')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
