import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWarehouses } from '@/lib/fake-api';
import type { Warehouse } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Warehouse as WarehouseIcon, MapPin, User, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WarehousesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWarehouses().then(data => { setWarehouses(data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  const utilizationColor = (pct: number) => {
    if (pct >= 85) return 'text-destructive';
    if (pct >= 60) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('warehouses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('warehouses.description')}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />{t('business.addWarehouse')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('business.addWarehouse')}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>{t('common.name')}</Label>
                <Input placeholder={t('warehouses.namePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.address')}</Label>
                <Input placeholder={t('warehouses.addressPlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label>{t('business.manager')}</Label>
                <Input placeholder={t('warehouses.managerPlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label>{t('business.capacity')}</Label>
                <Input type="number" placeholder="5000" />
              </div>
              <Button className="w-full">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {warehouses.map(wh => (
          <Card key={wh.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <WarehouseIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{wh.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {wh.address}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/business/inventory?warehouse=${wh.id}`)}>
                  {t('common.details')} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <User className="h-3 w-3" />
                    {t('business.manager')}
                  </div>
                  <p className="text-sm font-medium">{wh.managerName}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Package className="h-3 w-3" />
                    {t('nav.products')}
                  </div>
                  <p className="text-sm font-medium">{wh.productsCount}</p>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('business.capacity')}</div>
                  <p className="text-sm font-medium">{wh.capacity.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('business.utilization')}</span>
                  <span className={`font-bold ${utilizationColor(wh.utilization)}`}>{wh.utilization}%</span>
                </div>
                <Progress value={wh.utilization} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
