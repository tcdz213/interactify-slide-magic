import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, Receipt, Bell, Key, Upload, Palette, Clock, Globe, CheckCircle, Plug } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'jawda_settings';

interface Settings {
  company: { name: string; email: string; phone: string; address: string; nif: string; nis: string; rc: string; ai: string };
  tax: { tvaStandard: number; tvaReduced: number; currency: string; timezone: string };
  invoice: { prefix: string; nextNumber: number; footer: string; dueDays: number; template: string };
  notifications: Record<string, boolean>;
}

const defaultSettings: Settings = {
  company: { name: 'Mama Foods', email: 'admin@mamafoods.com', phone: '+213 555 0101', address: 'Zone Industrielle, Alger', nif: '001216000000000', nis: '198012345678901', rc: '16/00-0012345B19', ai: '16000123456' },
  tax: { tvaStandard: 19, tvaReduced: 9, currency: 'DZD', timezone: 'Africa/Algiers' },
  invoice: { prefix: 'FA-', nextNumber: 1042, footer: 'Merci pour votre confiance.', dueDays: 30, template: 'standard' },
  notifications: { newOrder: true, lowStock: true, deliveryComplete: true, paymentReceived: true, invoiceOverdue: true, dailyReport: false },
};

export default function BusinessSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : defaultSettings; } catch { return defaultSettings; }
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof Settings>(section: K, field: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success(t('business.settingsSaved'));
    setHasChanges(false);
  };

  const handleLogoUpload = () => {
    setLogoPreview('/placeholder.svg');
    toast.success(t('settings.logoUploaded', 'Logo téléchargé'));
  };

  const integrations = [
    { id: 'erp', name: 'ERP / Sage', status: 'disconnected', desc: 'Synchroniser avec votre ERP' },
    { id: 'sms', name: 'Twilio SMS', status: 'connected', desc: 'Notifications SMS aux clients' },
    { id: 'maps', name: 'Google Maps', status: 'connected', desc: 'Géolocalisation et routage' },
    { id: 'payment', name: 'CIB / EDAHABIA', status: 'disconnected', desc: 'Paiement en ligne' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('business.settingsTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('business.settingsDesc')}</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company"><Building2 className="h-4 w-4 me-1" />{t('business.companyProfile')}</TabsTrigger>
          <TabsTrigger value="tax"><Receipt className="h-4 w-4 me-1" />{t('business.taxConfig')}</TabsTrigger>
          <TabsTrigger value="invoice"><Palette className="h-4 w-4 me-1" />{t('settings.invoiceTemplate', 'Modèle facture')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 me-1" />{t('business.notificationsTab')}</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-4 w-4 me-1" />{t('business.integrations')}</TabsTrigger>
        </TabsList>

        {/* Company Profile */}
        <TabsContent value="company" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('business.companyProfile')}</CardTitle>
              <CardDescription>{t('business.companyProfileDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('business.companyName')}</Label>
                  <Input value={settings.company.name} onChange={e => update('company', 'name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.email')}</Label>
                  <Input value={settings.company.email} onChange={e => update('company', 'email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.phone')}</Label>
                  <Input value={settings.company.phone} onChange={e => update('company', 'phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.address')}</Label>
                  <Input value={settings.company.address} onChange={e => update('company', 'address', e.target.value)} />
                </div>
              </div>

              {/* Legal IDs (Algeria) */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">{t('settings.legalIds', 'Identifiants fiscaux')}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>NIF</Label><Input value={settings.company.nif} onChange={e => update('company', 'nif', e.target.value)} /></div>
                  <div className="space-y-2"><Label>NIS</Label><Input value={settings.company.nis} onChange={e => update('company', 'nis', e.target.value)} /></div>
                  <div className="space-y-2"><Label>RC</Label><Input value={settings.company.rc} onChange={e => update('company', 'rc', e.target.value)} /></div>
                  <div className="space-y-2"><Label>AI</Label><Input value={settings.company.ai} onChange={e => update('company', 'ai', e.target.value)} /></div>
                </div>
              </div>

              {/* Logo */}
              <div className="border-t pt-4">
                <Label>{t('business.logoUpload')}</Label>
                <div
                  className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={handleLogoUpload}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-16 mx-auto" />
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{t('business.dragDropLogo')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax & Currency */}
        <TabsContent value="tax" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('business.taxConfig')}</CardTitle>
              <CardDescription>{t('business.taxConfigDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('business.tvaStandard')}</Label>
                  <Input type="number" value={settings.tax.tvaStandard} onChange={e => update('tax', 'tvaStandard', +e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('business.tvaReduced')}</Label>
                  <Input type="number" value={settings.tax.tvaReduced} onChange={e => update('tax', 'tvaReduced', +e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('business.currencyDisplay')}</Label>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input value={settings.tax.currency} disabled className="w-24" />
                    <span className="text-sm text-muted-foreground">{t('business.currencyNote')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.timezone', 'Fuseau horaire')}</Label>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Select value={settings.tax.timezone} onValueChange={v => update('tax', 'timezone', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Algiers">Africa/Algiers (GMT+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+2)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Template */}
        <TabsContent value="invoice" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('settings.invoiceTemplate', 'Modèle facture')}</CardTitle>
              <CardDescription>{t('settings.invoiceTemplateDesc', 'Personnalisez vos factures')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t('settings.invoicePrefix', 'Préfixe')}</Label>
                  <Input value={settings.invoice.prefix} onChange={e => update('invoice', 'prefix', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.nextNumber', 'Prochain numéro')}</Label>
                  <Input type="number" value={settings.invoice.nextNumber} onChange={e => update('invoice', 'nextNumber', +e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.dueDays', 'Échéance (jours)')}</Label>
                  <Input type="number" value={settings.invoice.dueDays} onChange={e => update('invoice', 'dueDays', +e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.invoiceFooter', 'Pied de page')}</Label>
                <Textarea value={settings.invoice.footer} onChange={e => update('invoice', 'footer', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.templateStyle', 'Style du modèle')}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['standard', 'modern', 'minimal'].map(tpl => (
                    <div
                      key={tpl}
                      onClick={() => { update('invoice', 'template', tpl); }}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${settings.invoice.template === tpl ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <Palette className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium capitalize">{tpl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('business.notificationsTab')}</CardTitle>
              <CardDescription>{t('business.notifDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{t(`business.notif_${key}`, key)}</p>
                    <p className="text-xs text-muted-foreground">{t(`business.notif_${key}_desc`, '')}</p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={v => { setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: v } })); setHasChanges(true); }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('business.integrations')}</CardTitle>
              <CardDescription>{t('business.integrationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {integrations.map(integ => (
                <div key={integ.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Plug className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{integ.name}</p>
                      <p className="text-xs text-muted-foreground">{integ.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integ.status === 'connected' ? 'default' : 'secondary'}>
                      {integ.status === 'connected' ? t('settings.connected', 'Connecté') : t('settings.disconnected', 'Déconnecté')}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => toast.success(integ.status === 'connected' ? 'Déconnecté' : 'Connecté')}>
                      {integ.status === 'connected' ? t('settings.disconnect', 'Déconnecter') : t('settings.connect', 'Connecter')}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
