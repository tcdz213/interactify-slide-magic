import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SEO } from "@/components/SEO";

const Dashboard = () => {
  const stats = [
    {
      title: "إجمالي المبيعات",
      value: "45,231 د.ج",
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
      description: "مقارنة بالشهر الماضي"
    },
    {
      title: "الطلبات",
      value: "124",
      icon: ShoppingCart,
      trend: { value: 8.2, isPositive: true },
      description: "طلب جديد هذا الشهر"
    },
    {
      title: "المنتجات",
      value: "48",
      icon: Package,
      description: "منتج نشط"
    },
    {
      title: "معدل النمو",
      value: "23.5%",
      icon: TrendingUp,
      trend: { value: 4.3, isPositive: true },
      description: "نمو شهري"
    },
  ];

  return (
    <div dir="rtl">
      <SEO
        title="لوحة التحكم"
        description="إدارة متجرك الإلكتروني - تتبع المبيعات، الطلبات، والمنتجات من لوحة التحكم الخاصة بك."
        noindex={true}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في متجرك</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-bold mb-4">آخر الطلبات</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">طلب #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">منذ {i} ساعات</p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{(Math.random() * 5000 + 1000).toFixed(0)} د.ج</p>
                  <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                    قيد المعالجة
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-bold mb-4">المنتجات الأكثر مبيعاً</h2>
          <div className="space-y-4">
            {[
              { name: "منتج رقم 1", sales: 45 },
              { name: "منتج رقم 2", sales: 38 },
              { name: "منتج رقم 3", sales: 32 },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} مبيعات</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
