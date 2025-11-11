import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Flag, Trash2, RotateCcw, Eye, MousePointerClick } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminCards = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'flagged' | 'deleted'>('all');
  const [flagReason, setFlagReason] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const { data: cards, isLoading, refetch } = useQuery({
    queryKey: ['adminCards', activeTab],
    queryFn: () => adminService.getCards(activeTab),
  });

  const handleFlag = async (id: string) => {
    if (!flagReason.trim()) {
      toast.error("يرجى إدخال سبب الإبلاغ");
      return;
    }
    
    try {
      await adminService.flagCard(id, flagReason);
      toast.success("تم الإبلاغ عن البطاقة بنجاح");
      setFlagReason("");
      setSelectedCard(null);
      refetch();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleUnflag = async (id: string) => {
    try {
      await adminService.unflagCard(id);
      toast.success("تم إلغاء الإبلاغ بنجاح");
      refetch();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async (id: string, permanent: boolean = false) => {
    try {
      await adminService.deleteCard(id, permanent);
      toast.success(permanent ? "تم حذف البطاقة نهائياً" : "تم حذف البطاقة");
      refetch();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await adminService.restoreCard(id);
      toast.success("تم استعادة البطاقة بنجاح");
      refetch();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة البطاقات</h1>
        <p className="text-muted-foreground">عرض وإدارة جميع بطاقات الأعمال على المنصة</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="active">نشطة</TabsTrigger>
          <TabsTrigger value="flagged">مُبلَّغ عنها</TabsTrigger>
          <TabsTrigger value="deleted">محذوفة</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {cards && cards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بطاقات في هذه الفئة
            </div>
          ) : (
            <div className="grid gap-4">
              {cards?.map((card) => (
                <div key={card.id} className="border rounded-lg p-6 bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{card.views} مشاهدة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="w-4 h-4" />
                          <span>{card.clicks} نقرة</span>
                        </div>
                        <span>{new Date(card.createdAt).toLocaleDateString('ar-DZ')}</span>
                      </div>
                      {card.flagReason && (
                        <div className="mt-2 text-sm text-destructive">
                          سبب الإبلاغ: {card.flagReason}
                        </div>
                      )}
                    </div>
                    <Badge variant={
                      card.status === 'active' ? 'default' :
                      card.status === 'flagged' ? 'destructive' : 'secondary'
                    }>
                      {card.status === 'active' ? 'نشطة' :
                       card.status === 'flagged' ? 'مُبلَّغ عنها' : 'محذوفة'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {card.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCard(card.id)}>
                            <Flag className="w-4 h-4 ml-2" />
                            إبلاغ
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>إبلاغ عن البطاقة</AlertDialogTitle>
                            <AlertDialogDescription>
                              <Input
                                placeholder="سبب الإبلاغ..."
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                                className="mt-4"
                              />
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleFlag(card.id)}>
                              إبلاغ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {card.status === 'flagged' && (
                      <Button variant="outline" size="sm" onClick={() => handleUnflag(card.id)}>
                        إلغاء الإبلاغ
                      </Button>
                    )}

                    {card.status === 'deleted' ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleRestore(card.id)}>
                          <RotateCcw className="w-4 h-4 ml-2" />
                          استعادة
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف نهائي
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف النهائي</AlertDialogTitle>
                              <AlertDialogDescription>
                                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف البطاقة نهائياً.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(card.id, true)}>
                                حذف نهائياً
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم نقل البطاقة إلى المحذوفات. يمكنك استعادتها لاحقاً.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(card.id, false)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCards;
