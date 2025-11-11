import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Store, Bell, Shield, FileCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    domain: '',
    subcategory: '',
  });

  const [verificationData, setVerificationData] = useState({
    domain: '',
    subcategory: '',
    document: null as File | null,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        domain: profile.domain || '',
        subcategory: profile.subcategory || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "نجح",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verificationMutation = useMutation({
    mutationFn: () => {
      if (!verificationData.document) {
        throw new Error("يرجى إرفاق مستند التحقق");
      }
      return profileService.uploadVerificationDocument({
        domain: verificationData.domain,
        subcategory: verificationData.subcategory,
        documentFile: verificationData.document,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      sonnerToast.success("تم إرسال طلب التحقق بنجاح");
      setVerificationData({ domain: '', subcategory: '', document: null });
    },
    onError: (error: Error) => {
      sonnerToast.error(error.message || "فشل إرسال طلب التحقق");
    },
  });

  const { data: verificationStatus } = useQuery({
    queryKey: ['verification-status'],
    queryFn: () => profileService.getVerificationStatus(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
            <div>
              <Label>الاسم الكامل</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <Button 
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
            >
              حفظ التغييرات
            </Button>
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
              <Label>المجال</Label>
              <Input 
                value={formData.domain} 
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
              />
            </div>
            <div>
              <Label>التصنيف الفرعي</Label>
              <Input 
                value={formData.subcategory} 
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
              />
            </div>
            <div>
              <Label>عنوان المتجر</Label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <Button 
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
            >
              حفظ التغييرات
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">التحقق من الحساب</h2>
          </div>
          <div className="space-y-4">
            {verificationStatus?.status === 'approved' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-medium text-green-800 dark:text-green-200">✓ حسابك موثق</p>
              </div>
            )}
            {verificationStatus?.status === 'pending' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">⏳ طلبك قيد المراجعة</p>
              </div>
            )}
            {verificationStatus?.status === 'rejected' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="font-medium text-red-800 dark:text-red-200">✗ تم رفض طلبك</p>
                {verificationStatus.note && (
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{verificationStatus.note}</p>
                )}
              </div>
            )}
            {(!verificationStatus || verificationStatus.status === 'rejected') && (
              <>
                <div>
                  <Label>المجال</Label>
                  <Input 
                    value={verificationData.domain}
                    onChange={(e) => setVerificationData({...verificationData, domain: e.target.value})}
                    placeholder="مثال: التكنولوجيا"
                  />
                </div>
                <div>
                  <Label>التصنيف الفرعي</Label>
                  <Input 
                    value={verificationData.subcategory}
                    onChange={(e) => setVerificationData({...verificationData, subcategory: e.target.value})}
                    placeholder="مثال: برمجيات"
                  />
                </div>
                <div>
                  <Label>مستند التحقق</Label>
                  <Input 
                    type="file"
                    onChange={(e) => setVerificationData({
                      ...verificationData, 
                      document: e.target.files?.[0] || null
                    })}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    يرجى رفع صورة أو ملف PDF لوثيقة رسمية (سجل تجاري، بطاقة هوية، إلخ)
                  </p>
                </div>
                <Button 
                  onClick={() => verificationMutation.mutate()}
                  disabled={verificationMutation.isPending || !verificationData.document}
                >
                  {verificationMutation.isPending ? 'جاري الإرسال...' : 'إرسال طلب التحقق'}
                </Button>
              </>
            )}
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
