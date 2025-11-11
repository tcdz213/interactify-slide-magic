import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const { toast } = useToast();

  const { data: salesData = [], isLoading: loadingSales, error: salesError } = useQuery({
    queryKey: ['sales'],
    queryFn: () => analyticsService.getSales(),
  });

  const { data: revenueData, error: revenueError } = useQuery({
    queryKey: ['revenue'],
    queryFn: () => analyticsService.getRevenue(),
  });

  const { data: productsAnalytics = [], error: productsError } = useQuery({
    queryKey: ['productsAnalytics'],
    queryFn: () => analyticsService.getProductsAnalytics(),
  });

  if (salesError) {
    toast({
      title: "خطأ",
      description: (salesError as Error).message,
      variant: "destructive",
    });
  }

  if (loadingSales) {
    return <LoadingSpinner />;
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">التحليلات</h1>
        <p className="text-muted-foreground">تحليل أداء متجرك</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">المبيعات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">عدد الطلبات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">أداء المنتجات</h2>
          <div className="space-y-4">
            {productsAnalytics.slice(0, 4).map((product: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted-foreground">{product.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${product.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">الإحصائيات السريعة</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">إجمالي الإيرادات</span>
              <span className="text-xl font-bold">{revenueData?.total || 0} {revenueData?.currency || 'د.ج'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">إيرادات يومية</span>
              <span className="text-xl font-bold text-success">{revenueData?.byPeriod.daily || 0} {revenueData?.currency || 'د.ج'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">إيرادات أسبوعية</span>
              <span className="text-xl font-bold">{revenueData?.byPeriod.weekly || 0} {revenueData?.currency || 'د.ج'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">إيرادات شهرية</span>
              <span className="text-xl font-bold">{revenueData?.byPeriod.monthly || 0} {revenueData?.currency || 'د.ج'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
