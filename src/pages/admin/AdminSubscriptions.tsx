import { useQuery } from "@tanstack/react-query";
import { subscriptionsService } from "@/services/subscriptions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, CreditCard } from "lucide-react";
import { toast } from "sonner";

const AdminSubscriptions = () => {
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: () => subscriptionsService.getPlans(),
  });

  if (error) {
    toast.error((error as Error).message);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Mock stats - replace with real API when available
  const stats = {
    totalRevenue: 125000,
    activeSubscribers: 247,
    monthlyGrowth: 12.5,
    conversionRate: 8.3,
  };

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الاشتراكات</h1>
        <p className="text-muted-foreground">عرض وإدارة خطط الاشتراكات والمشتركين</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">إجمالي الإيرادات</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} د.ج</div>
          <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">المشتركون النشطون</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
          <p className="text-xs text-green-600 mt-1">+{stats.monthlyGrowth}% هذا الشهر</p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">معدل التحويل</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">من الزوار</p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">الخطط النشطة</span>
            <CreditCard className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">{plans?.length || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">خطة متاحة</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-6 bg-card relative overflow-hidden">
            {plan.popular && (
              <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                الأكثر شعبية
              </div>
            )}
            
            <div className="text-center mb-6 pt-4">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground">د.ج</span>
              </div>
              <p className="text-sm text-muted-foreground">كل شهر</p>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>المشتركون</span>
                </div>
              </div>
              <Badge variant="secondary">
                {Math.floor(Math.random() * 100) + 10} مشترك
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-bold mb-4">المشتركون الجدد</h2>
        <div className="space-y-3">
          {[
            { name: "أحمد محمد", plan: "المميز", date: "منذ يومين", amount: 15000 },
            { name: "فاطمة علي", plan: "المحترف", date: "منذ 3 أيام", amount: 25000 },
            { name: "خالد حسن", plan: "الأساسي", date: "منذ أسبوع", amount: 10000 },
          ].map((subscriber, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{subscriber.name}</p>
                  <p className="text-sm text-muted-foreground">خطة {subscriber.plan}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold">{subscriber.amount.toLocaleString()} د.ج</p>
                <p className="text-xs text-muted-foreground">{subscriber.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
