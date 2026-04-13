import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '@/lib/fake-api';
import type { Driver } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Truck, TrendingUp, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function DriverProfilePage() {
  const { t } = useTranslation();
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => { getDrivers().then(d => setDriver(d[0] ?? null)); }, []);

  if (!driver) return null;

  return (
    <div className="p-4 space-y-5">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-4 space-y-2">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-foreground">{driver.name}</h1>
        <Badge variant="secondary" className="bg-success/10 text-success">
          {t(`drivers.${driver.status}`)}
        </Badge>
      </div>

      {/* Info cards */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{driver.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{driver.vehicle}</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{t('drivers.onTimeRate')}: {driver.onTimeRate}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t('common.language')}</span>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" className="w-full h-12 gap-2 rounded-xl text-destructive border-destructive/30">
        <LogOut className="h-4 w-4" />
        {t('common.logout')}
      </Button>
    </div>
  );
}
