import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDrivers, getDeliveryRoutes } from '@/lib/fake-api';
import type { Driver, DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Package, CheckCircle, Clock, Navigation, Phone, Camera, MapPin, Bell, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DriverHomePage() {
  const { t } = useTranslation();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'Nouvelle livraison assignée — CMD-2024-015', time: '2 min' },
    { id: '2', text: 'Client Superette Bab Ezzouar a modifié sa commande', time: '15 min' },
  ]);

  useEffect(() => {
    getDrivers().then(d => setDriver(d[0] ?? null));
    getDeliveryRoutes().then(r => setRoute(r.find(rt => rt.status === 'in_progress') ?? r[0] ?? null));
  }, []);

  if (!driver) return null;

  const remaining = driver.deliveriesToday - driver.completedToday;
  const progress = driver.deliveriesToday > 0
    ? Math.round((driver.completedToday / driver.deliveriesToday) * 100)
    : 0;

  const handleCheckIn = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }));
      toast.success(t('mobile.driver.checkedIn'));
    } else {
      setCheckedIn(false);
      toast.success(t('mobile.driver.checkedOut'));
    }
  };

  const handleQuickCall = () => {
    toast.info(t('mobile.driver.callingDispatch'));
  };

  const handlePhotoCapture = () => {
    toast.success(t('mobile.driver.photoCaptured'));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Greeting + Check-in */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t('mobile.driver.greeting', { name: driver.name.split(' ')[0] })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button
          size="sm"
          variant={checkedIn ? 'default' : 'outline'}
          className={cn('rounded-full text-xs h-8', checkedIn && 'bg-success hover:bg-success/90 text-success-foreground')}
          onClick={handleCheckIn}
        >
          {checkedIn ? t('mobile.driver.checkOut') : t('mobile.driver.checkIn')}
        </Button>
      </div>

      {/* Check-in status */}
      {checkedIn && checkInTime && (
        <div className="flex items-center gap-2 text-xs text-success bg-success/10 rounded-lg px-3 py-2">
          <CheckCircle className="h-3.5 w-3.5" />
          {t('mobile.driver.checkedInAt', { time: checkInTime })}
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card key={n.id} className="border-0 shadow-sm bg-warning/5 border-l-2 border-l-warning">
              <CardContent className="p-3 flex items-start gap-2">
                <Bell className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
                <button onClick={() => dismissNotification(n.id)} className="text-muted-foreground text-xs">✕</button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{driver.deliveriesToday}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('mobile.driver.total')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold text-foreground">{driver.completedToday}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('mobile.driver.completed')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold text-foreground">{remaining}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('mobile.driver.remaining')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('mobile.driver.progress')}</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* GPS Toggle */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t('mobile.driver.gpsTracking')}</span>
          </div>
          <div className="flex items-center gap-2">
            {!gpsEnabled && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
            <Switch checked={gpsEnabled} onCheckedChange={setGpsEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 gap-2 rounded-xl" onClick={handleQuickCall}>
          <Phone className="h-4 w-4" />
          {t('mobile.driver.callDispatch')}
        </Button>
        <Button variant="outline" className="h-12 gap-2 rounded-xl" onClick={handlePhotoCapture}>
          <Camera className="h-4 w-4" />
          {t('mobile.driver.quickPhoto')}
        </Button>
      </div>

      {/* Start Route CTA */}
      <Link to="/m/driver/route">
        <Button size="lg" className="w-full h-14 text-base gap-2 rounded-xl">
          <Navigation className="h-5 w-5" />
          {t('mobile.driver.startRoute')}
        </Button>
      </Link>

      {/* Current route summary */}
      {route && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t('mobile.driver.currentRoute')}</span>
              <Badge variant="secondary" className="bg-info/10 text-info text-xs">
                {route.stops.length} {t('mobile.driver.stops')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {route.totalDistance} km — {route.estimatedDuration}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
