import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();

  const { data: adminStats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  if (error) {
    toast({
      title: "خطأ",
      description: (error as Error).message,
      variant: "destructive",
    });
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: String(adminStats?.totalUsers || 0),
      icon: Users,
      trend: { value: adminStats?.userGrowth || 0, isPositive: (adminStats?.userGrowth || 0) > 0 },
      description: "مستخدم نشط"
    },
    {
      title: "إجمالي المنتجات",
      value: String(adminStats?.totalProducts || 0),
      icon: Package,
      trend: { value: adminStats?.productGrowth || 0, isPositive: (adminStats?.productGrowth || 0) > 0 },
      description: "منتج على المنصة"
    },
    {
      title: "إجمالي الطلبات",
      value: String(adminStats?.totalOrders || 0),
      icon: ShoppingCart,
      trend: { value: adminStats?.orderGrowth || 0, isPositive: (adminStats?.orderGrowth || 0) > 0 },
      description: "طلب تم معالجته"
    },
    {
      title: "إجمالي الإيرادات",
      value: `${adminStats?.totalRevenue || 0} د.ج`,
      icon: DollarSign,
      trend: { value: adminStats?.revenueGrowth || 0, isPositive: (adminStats?.revenueGrowth || 0) > 0 },
      description: "إيرادات هذا الشهر"
    },
  ];

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-muted-foreground">نظرة عامة على المنصة</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-bold mb-4">نظرة عامة على البيانات</h2>
          <p className="text-sm text-muted-foreground mb-4">
            جميع البيانات يتم جلبها من API الخاص بك. تأكد من تكوين VITE_API_BASE_URL في ملف .env
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span>حالة الاتصال بـ API:</span>
              <span className="font-semibold text-green-600">متصل</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span>المستخدمون النشطون:</span>
              <span className="font-semibold">{adminStats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span>الطلبات هذا الشهر:</span>
              <span className="font-semibold">{adminStats?.totalOrders || 0}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-bold mb-4">روابط سريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">إدارة المستخدمين</p>
            </a>
            <a
              href="/admin/products"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">إدارة البطاقات</p>
            </a>
            <a
              href="/admin/orders"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">الطلبات</p>
            </a>
            <a
              href="/admin/subscriptions"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">الاشتراكات</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
