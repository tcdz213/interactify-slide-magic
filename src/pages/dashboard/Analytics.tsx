import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const salesData = [
    { name: "يناير", sales: 4000, orders: 24 },
    { name: "فبراير", sales: 3000, orders: 18 },
    { name: "مارس", sales: 5000, orders: 32 },
    { name: "أبريل", sales: 4500, orders: 28 },
    { name: "مايو", sales: 6000, orders: 38 },
    { name: "يونيو", sales: 5500, orders: 35 },
  ];

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
            {[
              { name: "منتج 1", percentage: 85 },
              { name: "منتج 2", percentage: 70 },
              { name: "منتج 3", percentage: 60 },
              { name: "منتج 4", percentage: 45 },
            ].map((product, i) => (
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
              <span className="text-muted-foreground">متوسط قيمة الطلب</span>
              <span className="text-xl font-bold">3,850 د.ج</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">معدل التحويل</span>
              <span className="text-xl font-bold text-success">24.5%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">العملاء الجدد</span>
              <span className="text-xl font-bold">156</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">معدل الإرجاع</span>
              <span className="text-xl font-bold text-destructive">2.1%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
