import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService, Order } from "@/services/orders";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, MapPin, Package, User, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const statusColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: Order['status']) => ordersService.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("تم تحديث حالة الطلب بنجاح");
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل تحديث حالة الطلب");
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">الطلب غير موجود</p>
        <Button onClick={() => navigate("/dashboard/orders")} className="mt-4">
          العودة للطلبات
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <SEO 
        title={`تفاصيل الطلب ${order.orderNumber}`}
        description={`عرض تفاصيل الطلب رقم ${order.orderNumber}`}
        noindex={true}
      />

      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/orders")}
          className="mb-4"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للطلبات
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">الطلب #{order.orderNumber}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleDateString('ar-DZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          <Badge className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">حالة الطلب</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">تحديث الحالة</label>
              <Select
                value={order.status}
                onValueChange={(value) => updateStatusMutation.mutate(value as Order['status'])}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">آخر تحديث</span>
                <span className="font-medium">
                  {new Date(order.updatedAt).toLocaleDateString('ar-DZ')}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">معلومات العميل</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الاسم</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">رقم العميل</p>
              <p className="font-medium text-xs">{order.customerId}</p>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">عنوان التوصيل</h2>
          </div>
          
          <div className="space-y-2">
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>{order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">معلومات الدفع</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المبلغ الإجمالي</span>
              <span className="font-bold text-lg">
                {order.totalAmount.toLocaleString('ar-DZ')} {order.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">عدد المنتجات</span>
              <span className="font-medium">{order.items.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">منتجات الطلب</h2>
        
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.productName}</h3>
                <p className="text-sm text-muted-foreground">
                  الكمية: {item.quantity} × {item.price.toLocaleString('ar-DZ')} {order.currency}
                </p>
              </div>
              <div className="text-left">
                <p className="font-bold">
                  {item.total.toLocaleString('ar-DZ')} {order.currency}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">الإجمالي</span>
            <span className="text-2xl font-bold">
              {order.totalAmount.toLocaleString('ar-DZ')} {order.currency}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetails;
