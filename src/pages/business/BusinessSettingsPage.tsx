import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Warehouse, Receipt, Globe, Bell, Key, Plus, Pencil, Trash2, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

type WarehouseEntry = { id: number; name: string; address: string; manager: string; capacity: number; utilization: number };
type NotifPref = { key: string; email: boolean; push: boolean; sms: boolean };
type Integration = { id: number; name: string; type: string; status: 'active' | 'inactive'; apiKey: string };

const INITIAL_WAREHOUSES: WarehouseEntry[] = [
  { id: 1, name: 'Entrepôt Principal', address: 'Zone Industrielle Rouiba, Alger', manager: 'Rachid B.', capacity: 5000, utilization: 72 },
  { id: 2, name: 'Dépôt Ouest', address: 'Zone Logistique, Oran', manager: 'Fatima Z.', capacity: 3000, utilization: 58 },
];

const INITIAL_NOTIFS: NotifPref[] = [
  { key: 'newOrder', email: true, push: true, sms: false },
  { key: 'lowStock', email: true, push: true, sms: true },
  { key: 'deliveryComplete', email: false, push: true, sms: false },
  { key: 'paymentReceived', email: true, push: false, sms: false },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 1, name: 'CCP / Baridimob', type: 'payment', status: 'active', apiKey: 'brdi_***k4f' },
  { id: 2, name: 'Yassir Delivery', type: 'logistics', status: 'inactive', apiKey: '' },
];

export default function BusinessSettingsPage() {
  const { t } = useTranslation();
  const [company, setCompany] = useState({ name: 'Mama Foods', email: 'admin@mamafoods.com', phone: '+213 555 0101', address: 'Zone Industrielle, Alger', nif: '00012345678901', nis: '19-47-1234567-01', rc: '16/00-1234567B19' });
  const [warehouses, setWarehouses] = useState<WarehouseEntry[]>(INITIAL_WAREHOUSES);
  const [notifPrefs, setNotifPrefs] = useState<NotifPref[]>(INITIAL_NOTIFS);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [taxConfig, setTaxConfig] = useState({ tvaStandard: '19', tvaReduced: '9', currency: 'DZD', timezone: 'Africa/Algiers', invoicePrefix: 'FAC-', language: 'fr' });
  const [warehouseDialog, setWarehouseDialog] = useState<{ open: boolean; editing?: WarehouseEntry }>({ open: false });
  const [whForm, setWhForm] = useState({ name: '', address: '', manager: '', capacity: 0 });
  const [integrationDialog, setIntegrationDialog] = useState(false);
  const [intForm, setIntForm] = useState({ name: '', type: 'payment', apiKey: '' });

  const handleSaveCompany = () => { toast.success(t('business.settingsSaved')); };
  const handleSaveTax = () => { toast.success(t('business.settingsSaved')); };

  const handleOpenWhDialog = (wh?: WarehouseEntry) => {
    if (wh) {
      setWhForm({ name: wh.name, address: wh.address, manager: wh.manager, capacity: wh.capacity });
    } else {
      setWhForm({ name: '', address: '', manager: '', capacity: 0 });
    }
    setWarehouseDialog({ open: true, editing: wh });
  };

  const handleSaveWarehouse = () => {
    if (!whForm.name) return;
    if (warehouseDialog.editing) {
      setWarehouses(prev => prev.map(w => w.id === warehouseDialog.editing!.id ? { ...w, ...whForm } : w));
      toast.success(t('common.success', 'Entrepôt modifié'));
    } else {
      setWarehouses(prev => [...prev, { id: Date.now(), ...whForm, utilization: 0 }]);
      toast.success(t('common.success', 'Entrepôt ajouté'));
    }
    setWarehouseDialog({ open: false });
  };

  const handleDeleteWarehouse = (id: number) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
    toast.success(t('common.deleted', 'Supprimé'));
  };

  const toggleNotif = (key: string, channel: 'email' | 'push' | 'sms') => {
    setNotifPrefs(prev => prev.map(n => n.key === key ? { ...n, [channel]: !n[channel] } : n));
  };

  const handleAddIntegration = () => {
    if (!intForm.name) return;
    setIntegrations(prev => [...prev, { id: Date.now(), name: intForm.name, type: intForm.type, status: 'inactive', apiKey: intForm.apiKey }]);
    toast.success(t('common.success', 'Intégration ajoutée'));
    setIntegrationDialog(false);
    setIntForm({ name: '', type: 'payment', apiKey: '' });
  };

  const toggleIntegration = (id: number) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('business.settingsTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('business.settingsDesc')}</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company"><Building2 className="h-4 w-4 me-1" />{t('business.companyProfile')}</TabsTrigger>
          <TabsTrigger value="warehouses"><Warehouse className="h-4 w-4 me-1" />{t('nav.warehouses')}</TabsTrigger>
          <TabsTrigger value="tax"><Receipt className="h-4 w-4 me-1" />{t('business.taxConfig')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 me-1" />{t('business.notificationsTab')}</TabsTrigger>
          <TabsTrigger value="integrations"><Key className="h-4 w-4 me-1" />{t('business.integrations')}</TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('business.companyProfile')}</CardTitle><CardDescription>{t('business.companyProfileDesc')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t('business.companyName')}</Label><Input value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t('common.email')}</Label><Input value={company.email} onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t('common.phone')}</Label><Input value={company.phone} onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t('common.address')}</Label><Input value={company.address} onChange={e => setCompany(p => ({ ...p, address: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>NIF</Label><Input value={company.nif} onChange={e => setCompany(p => ({ ...p, nif: e.target.value }))} /></div>
                <div className="space-y-2"><Label>NIS</Label><Input value={company.nis} onChange={e => setCompany(p => ({ ...p, nis: e.target.value }))} /></div>
                <div className="space-y-2"><Label>RC</Label><Input value={company.rc} onChange={e => setCompany(p => ({ ...p, rc: e.target.value }))} /></div>
              </div>
              <div className="space-y-2">
                <Label>{t('business.logoUpload')}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  {t('business.dragDropLogo')}
                </div>
              </div>
              <Button onClick={handleSaveCompany}><Save className="h-4 w-4 me-2" />{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div><CardTitle className="text-base">{t('nav.warehouses')}</CardTitle><CardDescription>{t('business.warehouseDesc')}</CardDescription></div>
              <Button size="sm" onClick={() => handleOpenWhDialog()}><Plus className="h-4 w-4 me-1" />{t('business.addWarehouse')}</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.address')}</TableHead>
                    <TableHead>{t('business.manager')}</TableHead>
                    <TableHead>{t('business.capacity')}</TableHead>
                    <TableHead>{t('business.utilization')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map(wh => (
                    <TableRow key={wh.id}>
                      <TableCell className="font-medium">{wh.name}</TableCell>
                      <TableCell className="text-muted-foreground">{wh.address}</TableCell>
                      <TableCell>{wh.manager}</TableCell>
                      <TableCell>{wh.capacity.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={wh.utilization > 80 ? 'destructive' : 'secondary'}>{wh.utilization}%</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenWhDialog(wh)}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteWarehouse(wh.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Tab */}
        <TabsContent value="tax" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('business.taxConfig')}</CardTitle><CardDescription>{t('business.taxConfigDesc')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t('business.tvaStandard')}</Label><Input value={taxConfig.tvaStandard} onChange={e => setTaxConfig(p => ({ ...p, tvaStandard: e.target.value }))} type="number" /></div>
                <div className="space-y-2"><Label>{t('business.tvaReduced')}</Label><Input value={taxConfig.tvaReduced} onChange={e => setTaxConfig(p => ({ ...p, tvaReduced: e.target.value }))} type="number" /></div>
                <div className="space-y-2"><Label>{t('settings.invoicePrefix', 'Préfixe facture')}</Label><Input value={taxConfig.invoicePrefix} onChange={e => setTaxConfig(p => ({ ...p, invoicePrefix: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>{t('settings.timezone', 'Fuseau horaire')}</Label>
                  <Select value={taxConfig.timezone} onValueChange={v => setTaxConfig(p => ({ ...p, timezone: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Algiers">Africa/Algiers (UTC+1)</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris (UTC+1/+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('business.currencyDisplay')}</Label>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input value={taxConfig.currency} disabled className="w-24" />
                  <span className="text-sm text-muted-foreground">{t('business.currencyNote')}</span>
                </div>
              </div>
              <Button onClick={handleSaveTax}><Save className="h-4 w-4 me-2" />{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('business.notificationsTab')}</CardTitle><CardDescription>{t('business.notifDesc')}</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('settings.notification', 'Notification')}</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Push</TableHead>
                    <TableHead className="text-center">SMS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifPrefs.map(n => (
                    <TableRow key={n.key}>
                      <TableCell>
                        <p className="text-sm font-medium">{t(`business.notif_${n.key}`)}</p>
                        <p className="text-xs text-muted-foreground">{t(`business.notif_${n.key}_desc`)}</p>
                      </TableCell>
                      <TableCell className="text-center"><Switch checked={n.email} onCheckedChange={() => toggleNotif(n.key, 'email')} /></TableCell>
                      <TableCell className="text-center"><Switch checked={n.push} onCheckedChange={() => toggleNotif(n.key, 'push')} /></TableCell>
                      <TableCell className="text-center"><Switch checked={n.sms} onCheckedChange={() => toggleNotif(n.key, 'sms')} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div><CardTitle className="text-base">{t('business.integrations')}</CardTitle><CardDescription>{t('business.integrationsDesc')}</CardDescription></div>
              <Button size="sm" onClick={() => setIntegrationDialog(true)}><Plus className="h-4 w-4 me-1" />{t('settings.addIntegration', 'Ajouter')}</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {integrations.map(int => (
                <div key={int.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.type} • {int.apiKey || 'No API key'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={int.status === 'active' ? 'default' : 'secondary'}>{int.status === 'active' ? t('common.active', 'Actif') : t('common.inactive', 'Inactif')}</Badge>
                    <Switch checked={int.status === 'active'} onCheckedChange={() => toggleIntegration(int.id)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warehouse Dialog */}
      <Dialog open={warehouseDialog.open} onOpenChange={o => !o && setWarehouseDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{warehouseDialog.editing ? t('common.edit', 'Modifier') : t('business.addWarehouse')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>{t('common.name')}</Label><Input value={whForm.name} onChange={e => setWhForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{t('common.address')}</Label><Input value={whForm.address} onChange={e => setWhForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{t('business.manager')}</Label><Input value={whForm.manager} onChange={e => setWhForm(p => ({ ...p, manager: e.target.value }))} /></div>
            <div className="space-y-2"><Label>{t('business.capacity')}</Label><Input type="number" value={whForm.capacity} onChange={e => setWhForm(p => ({ ...p, capacity: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarehouseDialog({ open: false })}>{t('common.cancel', 'Annuler')}</Button>
            <Button onClick={handleSaveWarehouse}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Dialog */}
      <Dialog open={integrationDialog} onOpenChange={setIntegrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.addIntegration', 'Ajouter intégration')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>{t('common.name')}</Label><Input value={intForm.name} onChange={e => setIntForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>{t('common.type', 'Type')}</Label>
              <Select value={intForm.type} onValueChange={v => setIntForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">{t('settings.payment', 'Paiement')}</SelectItem>
                  <SelectItem value="logistics">{t('settings.logistics', 'Logistique')}</SelectItem>
                  <SelectItem value="accounting">{t('settings.accounting', 'Comptabilité')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>API Key</Label><Input value={intForm.apiKey} onChange={e => setIntForm(p => ({ ...p, apiKey: e.target.value }))} placeholder="sk_..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDialog(false)}>{t('common.cancel', 'Annuler')}</Button>
            <Button onClick={handleAddIntegration}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
