import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, BarChart3, User, Plus, Home } from "@/components/ui/icon";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
const BottomNavigation = () => {
  const location = useLocation();
  const {
    t
  } = useLanguage();
  const isActive = (path: string) => location.pathname === path;
  const navItems = [{
    path: "/home",
    icon: Home,
    label: t("home")
  }, {
    path: "/favorites",
    icon: Heart,
    label: t("favorites")
  }, {
    path: "/create",
    icon: Plus,
    label: t("create"),
    isPrimary: true
  }, {
    path: "/messages",
    icon: MessageSquare,
    label: "Messages"
  }, {
    path: "/profile",
    icon: User,
    label: t("profile"),
    hasBadge: true
  }];
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-border/50 shadow-elegant">
      <div className="flex items-center justify-around px-6 py-3 safe-area-inset-bottom max-w-screen-sm mx-auto">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <Button 
              key={index} 
              variant="ghost" 
              size="sm" 
              asChild 
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 ${item.isPrimary ? "h-16 w-16 -mt-6 bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-accent hover:scale-105" : "h-auto px-4 py-2.5 hover:bg-muted/50"} ${active && !item.isPrimary ? "text-primary bg-primary/5" : ""} ${!item.isPrimary && !active ? "text-muted-foreground" : ""}`}
            >
              <Link to={item.path} className="flex flex-col items-center justify-center gap-1 w-full">
                <div className={`relative flex items-center transition-all duration-300 ${active && !item.isPrimary ? "scale-110" : ""}`}>
                  <item.icon className={`${item.isPrimary ? "w-7 h-7" : "w-5 h-5"} transition-all duration-300 ${active && !item.isPrimary ? "scale-110" : ""}`} />
                  {item.hasBadge}
                  {active && !item.isPrimary && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
                  )}
                </div>
                <span className={`relative font-medium transition-all duration-300 ${item.isPrimary ? "text-[10px]" : "text-[10px]"} ${active && !item.isPrimary ? "font-bold scale-105" : ""}`}>
                  {item.label}
                  {active && !item.isPrimary && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-scale-up" />}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>;
};
export default BottomNavigation;