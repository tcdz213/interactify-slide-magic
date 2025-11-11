import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminUsers', currentPage, searchQuery],
    queryFn: () => adminService.getUsers({ page: currentPage, limit: 20, search: searchQuery }),
  });

  if (error) {
    toast.error((error as Error).message);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">عرض وإدارة جميع مستخدمي المنصة</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={() => refetch()}>تحديث</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right p-4 font-semibold">الاسم</th>
                <th className="text-right p-4 font-semibold">البريد الإلكتروني</th>
                <th className="text-right p-4 font-semibold">الدور</th>
                <th className="text-right p-4 font-semibold">التحقق</th>
                <th className="text-right p-4 font-semibold">المنتجات</th>
                <th className="text-right p-4 font-semibold">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.users?.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : 'مستخدم'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {user.isVerified ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        <span>موثق</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserX className="w-4 h-4" />
                        <span>غير موثق</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">{user.productsCount}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.joinedAt).toLocaleDateString('ar-DZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              صفحة {data.page} من {data.totalPages} (إجمالي: {data.total} مستخدم)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                disabled={currentPage === data.totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
