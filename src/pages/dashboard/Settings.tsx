import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Store, Bell, Shield } from "lucide-react";

const Settings = () => {
  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات حسابك ومتجرك</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>الاسم الكامل</Label>
                <Input defaultValue="أحمد محمد" />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input type="email" defaultValue="ahmed@example.com" />
              </div>
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input defaultValue="+213 555 123 456" />
            </div>
            <Button>حفظ التغييرات</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">معلومات المتجر</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>اسم المتجر</Label>
              <Input defaultValue="متجر أحمد" />
            </div>
            <div>
              <Label>وصف المتجر</Label>
              <Textarea 
                defaultValue="متجر إلكتروني متخصص في بيع المنتجات عالية الجودة"
                rows={4}
              />
            </div>
            <div>
              <Label>عنوان المتجر</Label>
              <Input defaultValue="الجزائر العاصمة، الجزائر" />
            </div>
            <Button>حفظ التغييرات</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">الإشعارات</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">إشعارات الطلبات</p>
                <p className="text-sm text-muted-foreground">تلقي إشعارات عند استلام طلبات جديدة</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">إشعارات التسويق</p>
                <p className="text-sm text-muted-foreground">تلقي نصائح وعروض تسويقية</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">الأمان</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>كلمة المرور الحالية</Label>
              <Input type="password" />
            </div>
            <div>
              <Label>كلمة المرور الجديدة</Label>
              <Input type="password" />
            </div>
            <div>
              <Label>تأكيد كلمة المرور</Label>
              <Input type="password" />
            </div>
            <Button>تغيير كلمة المرور</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
