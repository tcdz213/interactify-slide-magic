import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";

const Subscription = () => {
  const plans = [
    {
      name: "المجاني",
      price: "0",
      features: [
        "حتى 10 منتجات",
        "100 طلب شهرياً",
        "دعم البريد الإلكتروني",
        "تحليلات أساسية",
      ],
      current: true,
    },
    {
      name: "المحترف",
      price: "2,999",
      features: [
        "منتجات غير محدودة",
        "طلبات غير محدودة",
        "دعم على مدار الساعة",
        "تحليلات متقدمة",
        "أدوات تسويق",
        "تقارير مخصصة",
      ],
      popular: true,
    },
    {
      name: "المؤسسات",
      price: "9,999",
      features: [
        "كل ميزات المحترف",
        "متاجر متعددة",
        "مدير حساب مخصص",
        "تكامل API مخصص",
        "تدريب فريق العمل",
        "SLA مخصص",
      ],
    },
  ];

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الاشتراك</h1>
        <p className="text-muted-foreground">إدارة خطة اشتراكك</p>
      </div>

      <Card className="p-6 mb-8 bg-gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">خطتك الحالية: المجاني</h2>
            <p className="text-white/90">قم بالترقية للحصول على ميزات أكثر</p>
          </div>
          <CreditCard className="w-12 h-12 opacity-50" />
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={index}
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
                <span className="text-muted-foreground">د.ج/شهر</span>
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
                plan.current
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : plan.popular
                  ? "bg-gradient-accent"
                  : "bg-gradient-primary"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "الخطة الحالية" : "ترقية الآن"}
            </Button>
          </Card>
        ))}
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
