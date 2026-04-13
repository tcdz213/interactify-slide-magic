import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paintbrush, Globe, Mail, Upload, Eye, Palette, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PRESET_COLORS = [
  { name: 'JAWDA Blue', value: '#3B82F6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Slate', value: '#475569' },
];

const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Bienvenue', desc: 'Envoyé lors de la création du compte', vars: ['{{name}}', '{{company}}', '{{loginUrl}}'] },
  { id: 'invoice', name: 'Nouvelle facture', desc: 'Envoyé lors de la génération d\'une facture', vars: ['{{name}}', '{{invoiceNumber}}', '{{amount}}', '{{dueDate}}'] },
  { id: 'order', name: 'Confirmation commande', desc: 'Envoyé après validation d\'une commande', vars: ['{{name}}', '{{orderNumber}}', '{{total}}', '{{deliveryDate}}'] },
  { id: 'reset', name: 'Réinitialisation mot de passe', desc: 'Lien de réinitialisation', vars: ['{{name}}', '{{resetUrl}}'] },
];

export default function WhiteLabelPage() {
  const { t } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [brandName, setBrandName] = useState('JAWDA');
  const [domain, setDomain] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.whiteLabel', 'White Label')} description={t('saas.whiteLabelDesc', 'Personnalisez l\'apparence de la plateforme pour vos tenants')} />

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding" className="gap-1"><Paintbrush className="h-3.5 w-3.5" />Branding</TabsTrigger>
          <TabsTrigger value="domain" className="gap-1"><Globe className="h-3.5 w-3.5" />Domaine</TabsTrigger>
          <TabsTrigger value="emails" className="gap-1"><Mail className="h-3.5 w-3.5" />Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Identité visuelle</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Nom de la marque</Label><Input value={brandName} onChange={e => setBrandName(e.target.value)} /></div>
                <div>
                  <Label>Logo principal</Label>
                  <div className="mt-2 flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="text-center"><Upload className="mx-auto h-6 w-6 text-muted-foreground" /><p className="text-xs text-muted-foreground mt-1">Glisser ou cliquer</p></div>
                  </div>
                </div>
                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label>Couleur principale</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0" />
                    <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-28 font-mono text-sm" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {PRESET_COLORS.map(c => (
                      <button key={c.value} onClick={() => setPrimaryColor(c.value)} title={c.name}
                        className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: c.value, borderColor: primaryColor === c.value ? 'hsl(var(--foreground))' : 'transparent' }}
                      >
                        {primaryColor === c.value && <Check className="h-3 w-3 text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={() => toast.success('Branding sauvegardé')} className="w-full">Sauvegarder le branding</Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4" />Aperçu</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="h-12 flex items-center px-4 gap-3" style={{ backgroundColor: primaryColor }}>
                    <Palette className="h-5 w-5 text-white" />
                    <span className="text-sm font-bold text-white">{brandName}</span>
                  </div>
                  <div className="p-4 bg-background space-y-3">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 w-20 rounded text-xs flex items-center justify-center text-white font-medium" style={{ backgroundColor: primaryColor }}>Bouton</div>
                      <div className="h-8 w-20 rounded border text-xs flex items-center justify-center text-foreground">Secondaire</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 rounded bg-muted" />)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domain" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Domaine personnalisé</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Domaine</Label><Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="app.votreentreprise.dz" /></div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Configuration DNS requise</p>
                <div className="font-mono text-xs space-y-1 text-muted-foreground">
                  <p>Type: CNAME</p>
                  <p>Nom: app</p>
                  <p>Valeur: custom.jawda.dz</p>
                  <p>TTL: 3600</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Non vérifié</Badge>
                <p className="text-xs text-muted-foreground">Ajoutez l'enregistrement DNS puis vérifiez</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => toast.info('Vérification DNS en cours...')}>Vérifier le DNS</Button>
                <Button onClick={() => toast.success('Domaine sauvegardé')}>Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {EMAIL_TEMPLATES.map(tpl => (
              <Card key={tpl.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {tpl.name}
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Édition template: ${tpl.name}`)}>Modifier</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{tpl.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {tpl.vars.map(v => <Badge key={v} variant="outline" className="font-mono text-xs">{v}</Badge>)}
                  </div>
                  <div className="rounded border p-3 bg-muted/50 mt-2">
                    <p className="text-xs text-muted-foreground">Sujet: <span className="font-medium text-foreground">{tpl.name} - {'{'}{'{'} company {'}'}{'}'}</span></p>
                    <div className="mt-2 space-y-1">
                      <div className="h-2 w-3/4 rounded bg-muted" />
                      <div className="h-2 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
