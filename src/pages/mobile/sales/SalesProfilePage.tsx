import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, TrendingUp, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function SalesProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-5">
      <div className="flex flex-col items-center pt-4 space-y-2">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Ahmed Bensalem</h1>
        <Badge variant="secondary" className="bg-info/10 text-info">{t('mobile.sales.role')}</Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">ahmed@mamafoods.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">+213 555 0101</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">45 {t('mobile.sales.ordersThisMonth')}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t('common.language')}</span>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full h-12 gap-2 rounded-xl text-destructive border-destructive/30">
        <LogOut className="h-4 w-4" />
        {t('common.logout')}
      </Button>
    </div>
  );
}
