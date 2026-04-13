import { Outlet, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Package, User, ShoppingCart, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabConfig = {
  path: string;
  icon: React.ReactNode;
  labelKey: string;
};

const driverTabs: TabConfig[] = [
  { path: '/m/driver', icon: <Home className="h-5 w-5" />, labelKey: 'mobile.tabs.home' },
  { path: '/m/driver/route', icon: <MapPin className="h-5 w-5" />, labelKey: 'mobile.tabs.route' },
  { path: '/m/driver/history', icon: <Package className="h-5 w-5" />, labelKey: 'mobile.tabs.deliveries' },
  { path: '/m/driver/profile', icon: <User className="h-5 w-5" />, labelKey: 'mobile.tabs.profile' },
];

const salesTabs: TabConfig[] = [
  { path: '/m/sales', icon: <Home className="h-5 w-5" />, labelKey: 'mobile.tabs.home' },
  { path: '/m/sales/orders/create', icon: <ShoppingCart className="h-5 w-5" />, labelKey: 'mobile.tabs.orders' },
  { path: '/m/sales/customers', icon: <Users className="h-5 w-5" />, labelKey: 'mobile.tabs.customers' },
  { path: '/m/sales/collections', icon: <CreditCard className="h-5 w-5" />, labelKey: 'mobile.tabs.collections' },
  { path: '/m/sales/profile', icon: <User className="h-5 w-5" />, labelKey: 'mobile.tabs.profile' },
];

export default function MobileLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const isDriver = location.pathname.startsWith('/m/driver');
  const tabs = isDriver ? driverTabs : salesTabs;

  const isActive = (path: string) => {
    if (path === '/m/driver' || path === '/m/sales') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Content area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors min-w-[44px]',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.icon}
                <span className="text-[10px] font-medium leading-none">
                  {t(tab.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
