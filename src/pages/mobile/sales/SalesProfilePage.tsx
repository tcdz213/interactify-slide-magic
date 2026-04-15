import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, Mail, Phone, TrendingUp, LogOut, Target, DollarSign, Bell, HelpCircle, Edit, Camera } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';

export default function SalesProfilePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState('Ahmed Bensalem');
  const [email, setEmail] = useState('ahmed@mamafoods.com');
  const [phone, setPhone] = useState('+213 555 0101');

  // Notification prefs
  const [notifNewOrders, setNotifNewOrders] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifTargets, setNotifTargets] = useState(false);

  // Targets mock
  const monthlyTarget = 2000000;
  const currentRevenue = 1240000;
  const targetProgress = Math.round((currentRevenue / monthlyTarget) * 100);
  const commission = Math.round(currentRevenue * 0.03); // 3% commission

  const handleSaveProfile = () => {
    setShowEdit(false);
    toast({ title: t('mobile.sales.profileUpdated') });
  };

  const handleAvatarUpload = () => {
    toast({ title: t('mobile.sales.avatarUpdated') });
  };

  return (
    <div className="p-4 space-y-5">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-4 space-y-2">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <button
            className="absolute -bottom-1 -end-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center"
            onClick={handleAvatarUpload}
          >
            <Camera className="h-3.5 w-3.5 text-primary-foreground" />
          </button>
        </div>
        <h1 className="text-lg font-bold text-foreground">{name}</h1>
        <Badge variant="secondary" className="bg-primary/10 text-primary">{t('mobile.sales.role')}</Badge>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowEdit(true)}>
          <Edit className="h-3 w-3" />
          {t('mobile.sales.editProfile')}
        </Button>
      </div>

      {/* Contact Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">45 {t('mobile.sales.ordersThisMonth')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sales Targets */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t('mobile.sales.salesTarget')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('mobile.sales.monthlyRevenue')}</span>
              <span className="text-foreground font-medium">{targetProgress}%</span>
            </div>
            <Progress value={targetProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-end">
              {currentRevenue.toLocaleString('fr-DZ')} / {monthlyTarget.toLocaleString('fr-DZ')} DA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Commission */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t('mobile.sales.commission')}</span>
            </div>
            <div className="text-end">
              <p className="text-lg font-bold text-primary">{commission.toLocaleString('fr-DZ')} DA</p>
              <p className="text-[10px] text-muted-foreground">3% {t('mobile.sales.ofRevenue')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{t('mobile.sales.notifications')}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('mobile.sales.notifNewOrders')}</span>
              <Switch checked={notifNewOrders} onCheckedChange={setNotifNewOrders} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('mobile.sales.notifPayments')}</span>
              <Switch checked={notifPayments} onCheckedChange={setNotifPayments} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('mobile.sales.notifTargets')}</span>
              <Switch checked={notifTargets} onCheckedChange={setNotifTargets} />
            </div>
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

      {/* Support */}
      <Button variant="outline" className="w-full h-12 gap-2 rounded-xl">
        <HelpCircle className="h-4 w-4" />
        {t('mobile.sales.support')}
      </Button>

      {/* Logout */}
      <Button variant="outline" className="w-full h-12 gap-2 rounded-xl text-destructive border-destructive/30">
        <LogOut className="h-4 w-4" />
        {t('common.logout')}
      </Button>

      {/* Edit Profile Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('mobile.sales.editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t('common.name')}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('common.email')}</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('common.phone')}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveProfile}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
