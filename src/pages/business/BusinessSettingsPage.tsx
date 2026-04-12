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
import { Building2, Warehouse, Receipt, Globe, Bell, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function BusinessSettingsPage() {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    toast.success(t('business.settingsSaved'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('business.settingsTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('business.settingsDesc')}</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company"><Building2 className="h-4 w-4 me-1" />{t('business.companyProfile')}</TabsTrigger>
          <TabsTrigger value="warehouses"><Warehouse className="h-4 w-4 me-1" />{t('nav.warehouses')}</TabsTrigger>
          <TabsTrigger value="tax"><Receipt className="h-4 w-4 me-1" />{t('business.taxConfig')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 me-1" />{t('business.notificationsTab')}</TabsTrigger>
          <TabsTrigger value="integrations"><Key className="h-4 w-4 me-1" />{t('business.integrations')}</TabsTrigger>
        </TabsList>

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
                  <Input defaultValue="Mama Foods" />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.email')}</Label>
                  <Input defaultValue="admin@mamafoods.com" />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.phone')}</Label>
                  <Input defaultValue="+213 555 0101" />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.address')}</Label>
                  <Input defaultValue="Zone Industrielle, Alger" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('business.logoUpload')}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
                  {t('business.dragDropLogo')}
                </div>
              </div>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{t('nav.warehouses')}</CardTitle>
                <CardDescription>{t('business.warehouseDesc')}</CardDescription>
              </div>
              <Button size="sm">{t('business.addWarehouse')}</Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Entrepôt Principal</TableCell>
                    <TableCell className="text-muted-foreground">Zone Industrielle Rouiba, Alger</TableCell>
                    <TableCell>Rachid B.</TableCell>
                    <TableCell>5,000</TableCell>
                    <TableCell><Badge>72%</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Dépôt Ouest</TableCell>
                    <TableCell className="text-muted-foreground">Zone Logistique, Oran</TableCell>
                    <TableCell>Fatima Z.</TableCell>
                    <TableCell>3,000</TableCell>
                    <TableCell><Badge variant="secondary">58%</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <Input defaultValue="19" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>{t('business.tvaReduced')}</Label>
                  <Input defaultValue="9" type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('business.currencyDisplay')}</Label>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input defaultValue="DZD" disabled className="w-24" />
                  <span className="text-sm text-muted-foreground">{t('business.currencyNote')}</span>
                </div>
              </div>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('business.notificationsTab')}</CardTitle>
              <CardDescription>{t('business.notifDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['newOrder', 'lowStock', 'deliveryComplete', 'paymentReceived'].map(key => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{t(`business.notif_${key}`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`business.notif_${key}_desc`)}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('business.integrations')}</CardTitle>
              <CardDescription>{t('business.integrationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                <p className="text-sm font-medium">{t('business.planRequired')}</p>
                <p className="text-xs text-muted-foreground">{t('business.planRequiredDesc')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
