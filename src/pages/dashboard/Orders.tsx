import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { ShoppingCart, Eye, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";

const Orders = () => {
  const [orders] = useState([
    { 
      id: 1001, 
      customer: "أحمد محمد", 
      total: 4500, 
      status: "قيد المعالجة", 
      date: "2024-01-15",
      items: 3 
    },
    { 
      id: 1002, 
      customer: "فاطمة علي", 
      total: 2800, 
      status: "تم التوصيل", 
      date: "2024-01-14",
      items: 2 
    },
    { 
      id: 1003, 
      customer: "خالد حسن", 
      total: 6200, 
      status: "قيد الشحن", 
      date: "2024-01-13",
      items: 5 
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد المعالجة":
        return "bg-accent/10 text-accent hover:bg-accent/20";
      case "قيد الشحن":
        return "bg-primary/10 text-primary hover:bg-primary/20";
      case "تم التوصيل":
        return "bg-success/10 text-success hover:bg-success/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <div dir="rtl">
      <SEO
        title="الطلبات"
        description="إدارة طلبات العملاء - تتبع حالة الطلبات، معالجة الطلبات الجديدة، وإدارة الشحن."
        noindex={true}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الطلبات</h1>
        <p className="text-muted-foreground">إدارة طلبات العملاء</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="لا توجد طلبات"
          description="لم تستلم أي طلبات بعد"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">طلب #{order.id}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-1">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items} منتجات · {order.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-2xl font-bold text-primary">{order.total} د.ج</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 ml-2" />
                    عرض
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
