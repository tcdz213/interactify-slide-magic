import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

const AdminDashboard = () => {
  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: "1,245",
      icon: Users,
      trend: { value: 18.2, isPositive: true },
      description: "مستخدم نشط"
    },
    {
      title: "إجمالي المنتجات",
      value: "3,842",
      icon: Package,
      trend: { value: 12.8, isPositive: true },
      description: "منتج على المنصة"
    },
    {
      title: "إجمالي الطلبات",
      value: "8,521",
      icon: ShoppingCart,
      trend: { value: 24.5, isPositive: true },
      description: "طلب تم معالجته"
    },
    {
      title: "إجمالي الإيرادات",
      value: "2.4M د.ج",
      icon: DollarSign,
      trend: { value: 32.1, isPositive: true },
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
          <h2 className="text-xl font-bold mb-4">أحدث البائعين</h2>
          <div className="space-y-4">
            {[
              { name: "أحمد محمد", products: 24, joined: "منذ يومين" },
              { name: "فاطمة علي", products: 18, joined: "منذ 3 أيام" },
              { name: "خالد حسن", products: 32, joined: "منذ أسبوع" },
            ].map((seller, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-sm text-muted-foreground">{seller.products} منتج</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{seller.joined}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-bold mb-4">الطلبات الأخيرة</h2>
          <div className="space-y-4">
            {[
              { id: 1023, status: "جديد", amount: 4500 },
              { id: 1024, status: "قيد المعالجة", amount: 3200 },
              { id: 1025, status: "تم التوصيل", amount: 5800 },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">طلب #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
                <p className="font-bold">{order.amount} د.ج</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
