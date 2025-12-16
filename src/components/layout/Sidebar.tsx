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
  FileText
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
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export function Sidebar() {
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
        "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <span className="text-xl font-bold gradient-text">DevCycle</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        "hover:bg-secondary/80 text-muted-foreground hover:text-foreground",
                        isActive && "bg-primary/10 text-primary border border-primary/20",
                        collapsed && "justify-center"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className={cn("h-8 w-8 shrink-0", collapsed && "hidden")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Logout
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
