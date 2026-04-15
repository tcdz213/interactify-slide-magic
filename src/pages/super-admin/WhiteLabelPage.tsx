import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paintbrush, Globe, Mail, Upload, Eye, Palette, Check, Save, Users, Copy } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const PRESET_COLORS = [
  { name: 'JAWDA Blue', value: '#3B82F6' }, { name: 'Emerald', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' }, { name: 'Orange', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' }, { name: 'Slate', value: '#475569' },
];

const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Bienvenue', desc: 'Envoyé lors de la création du compte', vars: ['{{name}}', '{{company}}', '{{loginUrl}}'] },
  { id: 'invoice', name: 'Nouvelle facture', desc: 'Envoyé lors de la génération d\'une facture', vars: ['{{name}}', '{{invoiceNumber}}', '{{amount}}', '{{dueDate}}'] },
  { id: 'order', name: 'Confirmation commande', desc: 'Envoyé après validation d\'une commande', vars: ['{{name}}', '{{orderNumber}}', '{{total}}', '{{deliveryDate}}'] },
  { id: 'reset', name: 'Réinitialisation mot de passe', desc: 'Lien de réinitialisation', vars: ['{{name}}', '{{resetUrl}}'] },
];

interface TenantBranding { id: string; name: string; primaryColor: string; logo: boolean; customDomain: string | null; }

const TENANT_BRANDINGS: TenantBranding[] = [
  { id: 't1', name: 'Mama Foods', primaryColor: '#F59E0B', logo: true, customDomain: 'app.mamafoods.dz' },
  { id: 't2', name: 'Atlas BTP', primaryColor: '#3B82F6', logo: false, customDomain: null },
  { id: 't3', name: 'Sahel Distribution', primaryColor: '#10B981', logo: true, customDomain: 'distrib.sahel.dz' },
  { id: 't4', name: 'Kabylie Fresh', primaryColor: '#8B5CF6', logo: false, customDomain: null },
];

export default function WhiteLabelPage() {
  const { t } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [brandName, setBrandName] = useState('JAWDA');
  const [domain, setDomain] = useState('');
  const [dnsVerified, setDnsVerified] = useState(false);
  const [dnsChecking, setDnsChecking] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [tenantBrandings, setTenantBrandings] = useState(TENANT_BRANDINGS);

  const handleDnsVerify = async () => {
    setDnsChecking(true);
    await new Promise(r => setTimeout(r, 2000));
    setDnsChecking(false);
    setDnsVerified(true);
    toast.success(t('admin.dnsVerified', 'DNS verified successfully'));
  };

  const openTemplateEditor = (tpl: typeof EMAIL_TEMPLATES[0]) => {
    setEditingTemplate(tpl.id);
    setTemplateSubject(`${tpl.name} - {{company}}`);
    setTemplateBody(`Bonjour {{name}},\n\n${tpl.desc}.\n\nCordialement,\n${brandName}`);
  };

  // CSS variable preview
  const cssVars = `
:root {
  --primary: ${hexToHSL(primaryColor)};
  --primary-foreground: 0 0% 100%;
  --secondary: ${hexToHSL(secondaryColor)};
  --accent: ${hexToHSL(primaryColor)};
}`;

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.whiteLabel', 'White Label')} description={t('saas.whiteLabelDesc', 'Personnalisez l\'apparence de la plateforme pour vos tenants')} />

      <Tabs defaultValue="branding">
        <TabsList className="flex-wrap">
          <TabsTrigger value="branding" className="gap-1"><Paintbrush className="h-3.5 w-3.5" />Branding</TabsTrigger>
          <TabsTrigger value="tenants" className="gap-1"><Users className="h-3.5 w-3.5" />{t('admin.perTenant', 'Per Tenant')}</TabsTrigger>
          <TabsTrigger value="domain" className="gap-1"><Globe className="h-3.5 w-3.5" />{t('admin.domain', 'Domaine')}</TabsTrigger>
          <TabsTrigger value="emails" className="gap-1"><Mail className="h-3.5 w-3.5" />Emails</TabsTrigger>
          <TabsTrigger value="css" className="gap-1"><Palette className="h-3.5 w-3.5" />CSS</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">{t('admin.visualIdentity', 'Identité visuelle')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>{t('admin.brandName', 'Nom de la marque')}</Label><Input value={brandName} onChange={e => setBrandName(e.target.value)} /></div>
                <div>
                  <Label>{t('admin.mainLogo', 'Logo principal')}</Label>
                  <div className="mt-2 flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => toast.success(t('admin.logoUploaded', 'Logo uploaded'))}>
                    <div className="text-center"><Upload className="mx-auto h-6 w-6 text-muted-foreground" /><p className="text-xs text-muted-foreground mt-1">{t('admin.dragOrClick', 'Glisser ou cliquer')}</p></div>
                  </div>
                </div>
                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50" onClick={() => toast.success('Favicon uploaded')}>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.primaryColor', 'Couleur principale')}</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0" />
                      <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-28 font-mono text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label>{t('admin.secondaryColor', 'Couleur secondaire')}</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0" />
                      <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-28 font-mono text-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c.value} onClick={() => setPrimaryColor(c.value)} title={c.name}
                      className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: c.value, borderColor: primaryColor === c.value ? 'hsl(var(--foreground))' : 'transparent' }}
                    >{primaryColor === c.value && <Check className="h-3 w-3 text-white mx-auto" />}</button>
                  ))}
                </div>
                <Button onClick={() => toast.success(t('admin.brandingSaved', 'Branding sauvegardé'))} className="w-full"><Save className="h-4 w-4 me-2" />{t('admin.saveBranding', 'Sauvegarder le branding')}</Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4" />{t('admin.preview', 'Aperçu')}</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="h-12 flex items-center px-4 gap-3" style={{ backgroundColor: primaryColor }}>
                    <Palette className="h-5 w-5 text-white" />
                    <span className="text-sm font-bold text-white">{brandName}</span>
                  </div>
                  <div className="p-4 bg-background space-y-3">
                    <div className="h-3 w-3/4 rounded bg-muted" /><div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 w-20 rounded text-xs flex items-center justify-center text-white font-medium" style={{ backgroundColor: primaryColor }}>{t('admin.button', 'Bouton')}</div>
                      <div className="h-8 w-20 rounded text-xs flex items-center justify-center text-white font-medium" style={{ backgroundColor: secondaryColor }}>{t('admin.secondary', 'Secondaire')}</div>
                      <div className="h-8 w-20 rounded border text-xs flex items-center justify-center text-foreground">{t('admin.outline', 'Outline')}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded bg-muted" />)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Per-Tenant Branding */}
        <TabsContent value="tenants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.perTenantBranding', 'Branding par tenant')}</CardTitle>
              <CardDescription>{t('admin.perTenantDesc', 'Personnalisez l\'apparence pour chaque tenant')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.company')}</TableHead>
                    <TableHead>{t('admin.primaryColor', 'Couleur')}</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>{t('admin.customDomain', 'Domaine custom')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantBrandings.map(tb => (
                    <TableRow key={tb.id}>
                      <TableCell className="font-medium">{tb.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: tb.primaryColor }} />
                          <span className="font-mono text-xs">{tb.primaryColor}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={tb.logo ? 'default' : 'secondary'}>{tb.logo ? '✓' : '—'}</Badge></TableCell>
                      <TableCell>{tb.customDomain ? <Badge variant="outline" className="font-mono text-xs">{tb.customDomain}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => toast.info(`Editing ${tb.name}`)}>{t('common.edit')}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain */}
        <TabsContent value="domain" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('admin.customDomain', 'Domaine personnalisé')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t('admin.domain', 'Domaine')}</Label><Input value={domain} onChange={e => { setDomain(e.target.value); setDnsVerified(false); }} placeholder="app.votreentreprise.dz" /></div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">{t('admin.dnsRequired', 'Configuration DNS requise')}</p>
                <div className="font-mono text-xs space-y-1 text-muted-foreground"><p>Type: CNAME</p><p>Nom: app</p><p>Valeur: custom.jawda.dz</p><p>TTL: 3600</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={dnsVerified ? 'default' : 'secondary'}>{dnsVerified ? t('admin.verified', 'Vérifié') : t('admin.unverified', 'Non vérifié')}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDnsVerify} disabled={dnsChecking || !domain}>{dnsChecking ? t('common.loading') : t('admin.verifyDns', 'Vérifier le DNS')}</Button>
                <Button onClick={() => toast.success(t('admin.domainSaved', 'Domaine sauvegardé'))} disabled={!dnsVerified}>{t('common.save')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails */}
        <TabsContent value="emails" className="mt-4 space-y-4">
          {editingTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.editTemplate', 'Modifier le template')}</CardTitle>
                <CardDescription>{EMAIL_TEMPLATES.find(t => t.id === editingTemplate)?.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>{t('admin.subject', 'Sujet')}</Label><Input value={templateSubject} onChange={e => setTemplateSubject(e.target.value)} /></div>
                <div className="space-y-2"><Label>{t('admin.body', 'Corps')}</Label><Textarea value={templateBody} onChange={e => setTemplateBody(e.target.value)} rows={10} className="font-mono text-sm" /></div>
                <div className="flex gap-1 flex-wrap">{EMAIL_TEMPLATES.find(t => t.id === editingTemplate)?.vars.map(v => <Badge key={v} variant="outline" className="font-mono text-xs cursor-pointer" onClick={() => setTemplateBody(prev => prev + ' ' + v)}>{v}</Badge>)}</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>{t('common.cancel')}</Button>
                  <Button onClick={() => { toast.success(t('admin.templateSaved', 'Template saved')); setEditingTemplate(null); }}><Save className="h-4 w-4 me-2" />{t('common.save')}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {EMAIL_TEMPLATES.map(tpl => (
                <Card key={tpl.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      {tpl.name}
                      <Button size="sm" variant="outline" onClick={() => openTemplateEditor(tpl)}>{t('common.edit')}</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{tpl.desc}</p>
                    <div className="flex flex-wrap gap-1">{tpl.vars.map(v => <Badge key={v} variant="outline" className="font-mono text-xs">{v}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CSS Variables Preview */}
        <TabsContent value="css" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.cssPreview', 'CSS Variables Preview')}</CardTitle>
              <CardDescription>{t('admin.cssPreviewDesc', 'Generated CSS variables for the current branding')}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-auto">{cssVars}</pre>
              <Button variant="outline" className="mt-3" onClick={() => { navigator.clipboard.writeText(cssVars); toast.success(t('api.copied', 'Copied')); }}><Copy className="h-4 w-4 me-2" />{t('admin.copyCss', 'Copy CSS')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper: hex to HSL string
function hexToHSL(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
