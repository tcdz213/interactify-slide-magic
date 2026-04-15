import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers } from '@/lib/fake-api';
import type { Driver } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, Phone, Truck, TrendingUp, LogOut, Edit, Lock, Camera, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { toast } from 'sonner';

export default function DriverProfilePage() {
  const { t } = useTranslation();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifRoute, setNotifRoute] = useState(true);
  const [notifSystem, setNotifSystem] = useState(false);

  useEffect(() => { getDrivers().then(d => setDriver(d[0] ?? null)); }, []);

  if (!driver) return null;

  const handleSaveProfile = () => {
    setDriver({ ...driver, name: editName || driver.name, phone: editPhone || driver.phone });
    setEditDialog(false);
    toast.success(t('mobile.driver.profileUpdated'));
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('mobile.driver.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('mobile.driver.passwordTooShort'));
      return;
    }
    setPasswordDialog(false);
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    toast.success(t('mobile.driver.passwordChanged'));
  };

  const handleAvatarUpload = () => {
    toast.success(t('mobile.driver.avatarUpdated'));
  };

  return (
    <div className="p-4 space-y-5">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-4 space-y-2 relative">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <button
            onClick={handleAvatarUpload}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <h1 className="text-lg font-bold text-foreground">{driver.name}</h1>
        <Badge variant="secondary" className="bg-success/10 text-success">
          {t(`drivers.${driver.status}`)}
        </Badge>
      </div>

      {/* Info cards */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t('mobile.driver.personalInfo')}</span>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => {
              setEditName(driver.name);
              setEditPhone(driver.phone);
              setEditDialog(true);
            }}>
              <Edit className="h-3 w-3" />
              {t('common.edit')}
            </Button>
          </div>
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

      {/* Notification Settings */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('mobile.driver.notificationSettings')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{t('mobile.driver.notifOrders')}</span>
            <Switch checked={notifOrders} onCheckedChange={setNotifOrders} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{t('mobile.driver.notifRoute')}</span>
            <Switch checked={notifRoute} onCheckedChange={setNotifRoute} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{t('mobile.driver.notifSystem')}</span>
            <Switch checked={notifSystem} onCheckedChange={setNotifSystem} />
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

      {/* Change Password */}
      <Card className="border-0 shadow-sm cursor-pointer" onClick={() => setPasswordDialog(true)}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('mobile.driver.changePassword')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="border-0 shadow-sm cursor-pointer">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('mobile.driver.support')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" className="w-full h-12 gap-2 rounded-xl text-destructive border-destructive/30">
        <LogOut className="h-4 w-4" />
        {t('common.logout')}
      </Button>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t('mobile.driver.editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t('common.name')}</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>{t('common.phone')}</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveProfile}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t('mobile.driver.changePassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t('mobile.driver.oldPassword')}</Label>
              <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            </div>
            <div>
              <Label>{t('mobile.driver.newPassword')}</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>{t('mobile.driver.confirmPassword')}</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleChangePassword}>{t('common.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
