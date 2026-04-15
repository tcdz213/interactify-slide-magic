import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse, UserCog, FileText,
  Settings, Activity, Bell, HelpCircle, FolderTree, DollarSign, Boxes, ArrowUpDown,
  Truck, MapPin, Navigation, CreditCard, PieChart, BarChart3, Receipt, Bot, Brain, Key,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const sections = [
  {
    labelKey: 'nav.overview',
    items: [
      { key: 'nav.dashboard', url: '/business', icon: LayoutDashboard },
      { key: 'nav.notifications', url: '/business/notifications', icon: Bell },
      { key: 'business.activityLog', url: '/business/activity', icon: Activity },
    ],
  },
  {
    labelKey: 'nav.catalog',
    items: [
      { key: 'nav.products', url: '/business/products', icon: Package },
      { key: 'nav.categories', url: '/business/categories', icon: FolderTree },
      { key: 'nav.pricing', url: '/business/pricing', icon: DollarSign },
    ],
  },
  {
    labelKey: 'nav.stock',
    items: [
      { key: 'nav.inventory', url: '/business/inventory', icon: Boxes },
      { key: 'nav.adjustments', url: '/business/inventory/adjustments', icon: ArrowUpDown },
      { key: 'nav.warehouses', url: '/business/warehouses', icon: Warehouse },
    ],
  },
  {
    labelKey: 'nav.sales',
    items: [
      { key: 'nav.orders', url: '/business/orders', icon: ShoppingCart },
      { key: 'nav.customers', url: '/business/customers', icon: Users },
      { key: 'nav.invoices', url: '/business/invoices', icon: FileText },
      { key: 'nav.payments', url: '/business/payments', icon: CreditCard },
    ],
  },
  {
    labelKey: 'nav.logistics',
    items: [
      { key: 'nav.deliveries', url: '/business/deliveries', icon: Truck },
      { key: 'nav.drivers', url: '/business/drivers', icon: Navigation },
      { key: 'nav.routes', url: '/business/routes', icon: MapPin },
    ],
  },
  {
    labelKey: 'nav.finance',
    items: [
      { key: 'nav.accounting', url: '/business/accounting', icon: Receipt },
      { key: 'nav.reports', url: '/business/reports', icon: BarChart3 },
    ],
  },
  {
    labelKey: 'nav.advanced',
    items: [
      { key: 'saas.automation', url: '/business/automation', icon: Bot },
      { key: 'saas.insights', url: '/business/insights', icon: Brain },
      { key: 'saas.api', url: '/business/api', icon: Key },
    ],
  },
  {
    labelKey: 'nav.system',
    items: [
      { key: 'nav.team', url: '/business/users', icon: UserCog },
      { key: 'nav.settings', url: '/business/settings', icon: Settings },
      { key: 'nav.help', url: '/business/help', icon: HelpCircle },
    ],
  },
];

export function BusinessSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="sidebar-gradient border-e-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Package className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in">
              <p className="text-sm font-bold text-sidebar-accent-foreground">Mama Foods</p>
              <p className="text-xs text-sidebar-foreground/60">{t('nav.management')}</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => {
          const sectionActive = section.items.some(i => isActive(i.url));
          return (
            <SidebarGroup key={section.labelKey}>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider">
                {!collapsed && t(section.labelKey)}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
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
          );
        })}
      </SidebarContent>
      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/60">{t('admin.plan')}: Professional</p>
            <p className="text-xs font-medium text-sidebar-accent-foreground">18 {t('nav.team').toLowerCase()}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
