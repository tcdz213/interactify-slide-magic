import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  
  const { data: orderStats, isLoading, error: statsError } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => ordersService.getStats(),
  });

  const { data: recentOrders, error: ordersError } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => ordersService.getAll(),
    select: (orders) => orders.slice(0, 3),
  });

  if (statsError) {
    toast({
      title: "خطأ",
      description: (statsError as Error).message,
      variant: "destructive",
    });
  }

  if (ordersError) {
    toast({
      title: "خطأ",
      description: (ordersError as Error).message,
      variant: "destructive",
    });
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      title: "إجمالي الإيرادات",
      value: `${orderStats?.revenue || 0} د.ج`,
      icon: DollarSign,
      description: "إجمالي المبيعات"
    },
    {
      title: "الطلبات الكلية",
      value: String(orderStats?.total || 0),
      icon: ShoppingCart,
      description: "جميع الطلبات"
    },
    {
      title: "قيد المعالجة",
      value: String(orderStats?.processing || 0),
      icon: Package,
      description: "طلبات قيد المعالجة"
    },
    {
      title: "تم التوصيل",
      value: String(orderStats?.delivered || 0),
      icon: TrendingUp,
      description: "طلبات مكتملة"
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
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">طلب #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{order.totalAmount} {order.currency}</p>
                    <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">لا توجد طلبات</p>
            )}
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
