import { Building2, LayoutDashboard, Users, CreditCard, BarChart3, Settings, Shield, Receipt, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const navKeys = [
  { key: 'nav.dashboard', url: '/admin', icon: LayoutDashboard },
  { key: 'nav.tenants', url: '/admin/tenants', icon: Building2 },
  { key: 'nav.subscriptions', url: '/admin/subscriptions', icon: CreditCard },
  { key: 'admin.accounts', url: '/admin/accounts', icon: Users },
  { key: 'admin.billing', url: '/admin/billing', icon: Receipt },
  { key: 'admin.auditLogs', url: '/admin/audit-logs', icon: FileText },
  { key: 'nav.analytics', url: '/admin/analytics', icon: BarChart3 },
  { key: 'nav.settings', url: '/admin/settings', icon: Settings },
];

export function SuperAdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="sidebar-gradient border-e-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in">
              <p className="text-sm font-bold text-sidebar-accent-foreground">DistroSaaS</p>
              <p className="text-xs text-sidebar-foreground/60">{t('admin.superAdmin')}</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider">
            {!collapsed && t('nav.platform')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navKeys.map((item) => {
                const title = t(item.key);
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={title}>
                      <NavLink
                        to={item.url}
                        end
                        className="text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/60">Platform v1.0</p>
            <p className="text-xs font-medium text-sidebar-accent-foreground">42 {t('admin.activeTenants').toLowerCase()}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
