import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Settings,
  Menu,
  X,
  LogOut,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "نظرة عامة", path: "/admin" },
  { icon: Users, label: "المستخدمين", path: "/admin/users" },
  { icon: Package, label: "المنتجات", path: "/admin/products" },
  { icon: ShoppingCart, label: "الطلبات", path: "/admin/orders" },
  { icon: CreditCard, label: "الاشتراكات", path: "/admin/subscriptions" },
  { icon: Settings, label: "الإعدادات", path: "/admin/settings" },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-primary">لوحة الإدارة</h1>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-screen w-64 bg-sidebar border-l transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-sidebar-primary" />
              <h1 className="text-2xl font-bold text-sidebar-foreground">متجري</h1>
            </div>
            <p className="text-sm text-sidebar-foreground/70">لوحة الإدارة</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-64 pt-16 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
