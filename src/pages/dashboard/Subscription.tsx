import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsService } from "@/services/subscriptions";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Subscription = () => {
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionsService.getPlans,
  });

  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: subscriptionsService.getCurrentSubscription,
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionsService.subscribe(planId),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الاشتراك');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: subscriptionsService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      toast.success('تم إلغاء الاشتراك بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الاشتراك');
    },
  });

  const handleSubscribe = (planId: string) => {
    subscribeMutation.mutate(planId);
  };

  const handleCancel = () => {
    if (confirm('هل أنت متأكد من إلغاء اشتراكك؟')) {
      cancelMutation.mutate();
    }
  };

  if (plansLoading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الاشتراك</h1>
        <p className="text-muted-foreground">إدارة خطة اشتراكك</p>
      </div>

      <Card className="p-6 mb-8 bg-gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              خطتك الحالية: {currentSubscription?.planName || 'المجاني'}
            </h2>
            <p className="text-white/90">
              {currentSubscription?.status === 'active' 
                ? `صالح حتى ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('ar-DZ')}`
                : 'قم بالترقية للحصول على ميزات أكثر'}
            </p>
          </div>
          <CreditCard className="w-12 h-12 opacity-50" />
        </div>
        {currentSubscription?.status === 'active' && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            إلغاء الاشتراك
          </Button>
        )}
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id;
          
          return (
            <Card
              key={plan.id}
              className={`p-6 relative ${
                plan.popular ? "border-primary shadow-primary ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                  الأكثر شعبية
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.currency}/شهر</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  isCurrentPlan
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : plan.popular
                    ? "bg-gradient-accent"
                    : "bg-gradient-primary"
                }`}
                disabled={isCurrentPlan || subscribeMutation.isPending}
                onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
              >
                {subscribeMutation.isPending ? 'جاري المعالجة...' : isCurrentPlan ? "الخطة الحالية" : "ترقية الآن"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">الأسئلة الشائعة</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">كيف يتم الدفع؟</h3>
            <p className="text-muted-foreground text-sm">
              نقبل جميع طرق الدفع الرئيسية بما في ذلك البطاقات البنكية والدفع عند الاستلام
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">هل يمكنني إلغاء اشتراكي؟</h3>
            <p className="text-muted-foreground text-sm">
              نعم، يمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Subscription;
