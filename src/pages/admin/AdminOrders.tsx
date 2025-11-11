import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const AdminOrders = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => ordersService.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ['adminOrderStats'],
    queryFn: () => ordersService.getStats(),
  });

  if (error) {
    toast.error((error as Error).message);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      processing: { label: 'قيد المعالجة', variant: 'default' },
      shipped: { label: 'تم الشحن', variant: 'default' },
      delivered: { label: 'تم التوصيل', variant: 'default' },
      cancelled: { label: 'ملغي', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">عرض وإدارة جميع الطلبات على المنصة</p>
      </div>

      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">إجمالي الطلبات</span>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">قيد الانتظار</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">تم التوصيل</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">إجمالي المبيعات</span>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} د.ج</div>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right p-4 font-semibold">رقم الطلب</th>
                <th className="text-right p-4 font-semibold">العميل</th>
                <th className="text-right p-4 font-semibold">المبلغ</th>
                <th className="text-right p-4 font-semibold">الحالة</th>
                <th className="text-right p-4 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">#{order.id}</span>
                    </div>
                  </td>
                  <td className="p-4">{order.customerName}</td>
                  <td className="p-4 font-semibold">{order.totalAmount.toLocaleString()} د.ج</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
