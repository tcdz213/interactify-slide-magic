import { useState } from "react";
import { 
  LayoutDashboard,
  Users, 
  CreditCard,
  Shield,
  CheckCircle,
  FolderTree,
  Star,
  MessageSquare,
  BarChart3,
  Flag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/Logo";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "verifications", label: "Verifications", icon: Shield },
  { id: "pro-accounts", label: "Pro Accounts", icon: CheckCircle },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "packages", label: "Packages", icon: CreditCard },
  { id: "domains", label: "Domains", icon: FolderTree },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: Flag },
];

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Logo className="h-6" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    collapsed ? "px-2" : "px-4",
                    isActive && "bg-gradient-primary shadow-glow"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                  {!collapsed && (
                    <span className={cn("text-sm font-medium", isActive && "text-primary-foreground")}>
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Admin Panel v1.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
