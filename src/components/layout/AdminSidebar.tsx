import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  ArrowLeft,
  Globe,
  Activity,
  HeartPulse
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

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Activity, label: 'Activity Logs', path: '/admin/activity' },
  { icon: HeartPulse, label: 'System Health', path: '/admin/health' },
  { icon: CreditCard, label: 'Billing', path: '/admin/billing' },
  { icon: MessageSquare, label: 'Reports', path: '/admin/reports' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Globe, label: 'CORS', path: '/admin/cors' },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50 transition-all duration-300 ease-in-out shadow-2xl",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Admin
            </span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-all duration-200 text-slate-400",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Back to Dashboard */}
      <div className="px-3 py-3 border-b border-slate-800/50">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className={cn(
                "w-full justify-start gap-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                collapsed && "justify-center px-2"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              {!collapsed && <span className="text-sm">Back to Dashboard</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="bg-slate-800 border-slate-700">
              Back to Dashboard
            </TooltipContent>
          )}
        </Tooltip>
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
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        "text-slate-400 hover:text-slate-100",
                        "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-transparent",
                        "relative overflow-hidden",
                        isActive && [
                          "bg-gradient-to-r from-amber-500/20 to-amber-500/5",
                          "text-amber-400 font-medium",
                          "shadow-sm shadow-amber-500/10",
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                          "before:w-1 before:h-6 before:rounded-full before:bg-amber-500"
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
                    className="bg-slate-800 border-slate-700"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all duration-200",
          "hover:bg-slate-800/50",
          collapsed && "justify-center p-1"
        )}>
          <Avatar className={cn(
            "h-9 w-9 ring-2 ring-amber-500/20 ring-offset-2 ring-offset-slate-900 transition-all duration-200",
            "hover:ring-amber-500/40"
          )}>
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500/30 to-amber-500/10 text-amber-400 text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="h-8 w-8 shrink-0 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-slate-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                  Logout
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
