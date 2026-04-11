import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Bell, KeyRound, Shield, Copy, Eye, EyeOff, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const mockApiKey = 'jwd_live_sk_a3f8c91d2e4b6f7a8c0d1e2f3a4b5c6d';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.platformSettings')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.settingsDescription')}</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="h-4 w-4 me-1" />{t('admin.general')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 me-1" />{t('nav.notifications')}</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="h-4 w-4 me-1" />{t('admin.apiKeys')}</TabsTrigger>
          <TabsTrigger value="maintenance"><Wrench className="h-4 w-4 me-1" />{t('admin.maintenance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.platformInfo')}</CardTitle>
              <CardDescription>{t('admin.platformInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t('admin.platformName')}</Label><Input defaultValue="JAWDA Distribution" /></div>
                <div className="space-y-2"><Label>{t('admin.supportEmail')}</Label><Input defaultValue="support@jawda.io" type="email" /></div>
              </div>
              <div className="space-y-2"><Label>{t('admin.platformUrl')}</Label><Input defaultValue="https://app.jawda.io" /></div>
              <Button>{t('common.save')}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.planConfig')}</CardTitle>
              <CardDescription>{t('admin.planConfigDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {['Starter', 'Professional', 'Enterprise'].map(plan => (
                  <div key={plan} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{plan}</h4>
                      <Badge variant="outline">{t('common.active')}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1"><Label className="text-xs">{t('admin.monthlyPrice')}</Label><Input defaultValue={plan === 'Starter' ? '29' : plan === 'Professional' ? '79' : '199'} className="h-8" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('admin.maxUsers')}</Label><Input defaultValue={plan === 'Starter' ? '5' : plan === 'Professional' ? '20' : '∞'} className="h-8" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.emailNotifications')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'newTenantSignup', label: t('admin.notifNewTenant') },
                { key: 'paymentFailed', label: t('admin.notifPaymentFailed') },
                { key: 'trialExpiring', label: t('admin.notifTrialExpiring') },
                { key: 'highChurn', label: t('admin.notifHighChurn') },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <Label>{item.label}</Label>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.apiKeys')}</CardTitle>
              <CardDescription>{t('admin.apiKeysDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Production Key</p>
                    <p className="text-xs text-muted-foreground">{t('common.created')}: 2024-01-15</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('common.active')}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={showApiKey ? mockApiKey : '••••••••••••••••••••••••••••••••'} readOnly className="font-mono text-xs" />
                  <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(mockApiKey); toast.success(t('admin.apiKeyCopied')); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              <Button variant="outline"><KeyRound className="h-4 w-4 me-2" />{t('admin.generateNewKey')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5" />{t('admin.maintenanceMode')}
              </CardTitle>
              <CardDescription>{t('admin.maintenanceModeDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('admin.enableMaintenance')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.maintenanceWarning')}</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              {maintenanceMode && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="text-sm font-medium text-warning">{t('admin.maintenanceActive')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('admin.maintenanceActiveDesc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}