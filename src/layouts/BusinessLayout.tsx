import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from 'react-i18next';

export default function BusinessLayout() {
  const { t } = useTranslation();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BusinessSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">Mama Foods — {t('nav.businessDashboard')}</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -end-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">5</span>
              </Button>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs font-bold text-accent-foreground">RB</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
