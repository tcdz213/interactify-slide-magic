import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Sparkles, 
  CheckSquare, 
  Bug, 
  Zap, 
  Rocket, 
  Users, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  CreditCard,
  Shield,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RoleBadge } from '@/components/RoleBadge';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: Package, label: 'Products', path: '/dashboard/products' },
  { icon: Sparkles, label: 'Features', path: '/dashboard/features' },
  { icon: CheckSquare, label: 'Tasks', path: '/dashboard/tasks' },
  { icon: Bug, label: 'Bugs', path: '/dashboard/bugs' },
  { icon: Zap, label: 'Sprints', path: '/dashboard/sprints' },
  { icon: Rocket, label: 'Releases', path: '/dashboard/releases' },
  { icon: Users, label: 'Team', path: '/dashboard/team' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: FileText, label: 'API Docs', path: '/dashboard/api-docs' },
  { icon: CreditCard, label: 'Billing', path: '/dashboard/billing' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

const adminNavItem = { icon: Shield, label: 'Admin Panel', path: '/admin' };

function SidebarContent({ collapsed, setCollapsed, onNavigate }: { 
  collapsed: boolean; 
  setCollapsed?: (val: boolean) => void;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
    onNavigate?.();
  };

  const handleNavClick = () => {
    onNavigate?.();
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            DevCycle
          </span>
        )}
        {setCollapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        "text-muted-foreground/80 hover:text-foreground",
                        "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent",
                        "relative overflow-hidden",
                        isActive && [
                          "bg-gradient-to-r from-primary/15 to-primary/5",
                          "text-primary font-medium",
                          "shadow-sm shadow-primary/10",
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                          "before:w-1 before:h-6 before:rounded-full before:bg-primary"
                        ],
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      "group-hover:scale-110"
                    )} />
                    {!collapsed && (
                      <span className="text-sm tracking-tight">{item.label}</span>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent 
                    side="right" 
                    className="bg-popover/95 backdrop-blur-sm border-border/50 shadow-lg"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          ))}
          
          {/* Admin Panel - Only for owners */}
          {user?.role === 'owner' && (
            <li className="pt-2 mt-2 border-t border-border/30">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={adminNavItem.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        "text-amber-500/80 hover:text-amber-400",
                        "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent",
                        "relative overflow-hidden",
                        isActive && [
                          "bg-gradient-to-r from-amber-500/15 to-amber-500/5",
                          "text-amber-400 font-medium",
                          "shadow-sm shadow-amber-500/10",
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                          "before:w-1 before:h-6 before:rounded-full before:bg-amber-500"
                        ],
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <adminNavItem.icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      "group-hover:scale-110"
                    )} />
                    {!collapsed && (
                      <span className="text-sm tracking-tight">{adminNavItem.label}</span>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent 
                    side="right" 
                    className="bg-popover/95 backdrop-blur-sm border-border/50 shadow-lg"
                  >
                    {adminNavItem.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          )}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all duration-200",
          "hover:bg-primary/5",
          collapsed && "justify-center p-1"
        )}>
          <Avatar className={cn(
            "h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-card transition-all duration-200",
            "hover:ring-primary/40"
          )}>
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                  {user?.role && <RoleBadge role={user.role} size="sm" showIcon={false} />}
                </div>
                <p className="text-xs text-muted-foreground/70 truncate">{user?.email}</p>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="h-8 w-8 shrink-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover/95 backdrop-blur-sm">
                  Logout
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-card border-border/50">
        <SidebarContent collapsed={false} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen bg-gradient-to-b from-card to-card/95 border-r border-border/50 transition-all duration-300 ease-in-out shadow-lg",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
    </aside>
  );
}
