import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, Package, BarChart3, Users, TrendingUp, Shield, Monitor, ShoppingCart, Check, Sparkles } from "lucide-react";
import dashboardPreview from "@/assets/dashboard-preview.png";
import productsPreview from "@/assets/products-preview.png";
import ordersPreview from "@/assets/orders-preview.png";
import analyticsPreview from "@/assets/analytics-preview.png";

const Landing = () => {
  const features = [
    {
      icon: Store,
      title: "متجر متعدد البائعين",
      description: "منصة شاملة تمكن البائعين من إدارة منتجاتهم وطلباتهم بسهولة"
    },
    {
      icon: Package,
      title: "إدارة المنتجات",
      description: "أضف وعدل منتجاتك بكل سهولة مع دعم الصور والأوصاف التفصيلية"
    },
    {
      icon: BarChart3,
      title: "تحليلات متقدمة",
      description: "تتبع مبيعاتك وأدائك من خلال لوحة تحكم تحليلية متطورة"
    },
    {
      icon: Users,
      title: "إدارة العملاء",
      description: "نظام شامل لإدارة العملاء والطلبات بكفاءة عالية"
    },
    {
      icon: TrendingUp,
      title: "نمو الأعمال",
      description: "أدوات تساعدك على تطوير عملك وزيادة مبيعاتك"
    },
    {
      icon: Shield,
      title: "أمان وحماية",
      description: "نظام آمن لحماية بياناتك ومعلومات عملائك"
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">متجري</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">تسجيل الدخول</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-accent">ابدأ الآن</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            منصة التجارة الإلكترونية الأولى
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            ابدأ متجرك الإلكتروني اليوم وحقق النجاح في عالم التجارة الرقمية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-lg px-8">
                ابدأ مجاناً
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">ميزات متجري</h2>
            <p className="text-xl text-muted-foreground">كل ما تحتاجه لإدارة متجرك بنجاح</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features with Screenshots */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">استكشف منصتنا</h2>
            <p className="text-xl text-muted-foreground">شاهد كيف تساعدك أدواتنا على إدارة متجرك بفعالية</p>
          </div>

          <div className="space-y-24">
            {/* Dashboard Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-lg overflow-hidden shadow-lg border hover:shadow-xl transition-shadow">
                  <img 
                    src={dashboardPreview} 
                    alt="لوحة التحكم" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">لوحة تحكم شاملة</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  تتبع أداء متجرك من خلال لوحة تحكم متطورة تعرض جميع المقاييس المهمة في مكان واحد. احصل على رؤية كاملة لمبيعاتك، طلباتك، ومنتجاتك.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>إحصائيات المبيعات الفورية</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>متابعة الطلبات الجديدة</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تقارير الأداء اليومية</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Products Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">إدارة المنتجات بسهولة</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  أضف وعدل منتجاتك بكل سهولة. دعم كامل للصور المتعددة، الأوصاف التفصيلية، وإدارة المخزون الذكية.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>رفع صور عالية الجودة</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تتبع المخزون التلقائي</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تصنيفات وفلاتر متقدمة</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="rounded-lg overflow-hidden shadow-lg border hover:shadow-xl transition-shadow">
                  <img 
                    src={productsPreview} 
                    alt="إدارة المنتجات" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Orders Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-lg overflow-hidden shadow-lg border hover:shadow-xl transition-shadow">
                  <img 
                    src={ordersPreview} 
                    alt="إدارة الطلبات" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">نظام طلبات متطور</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  تابع جميع طلباتك في مكان واحد. حدّث حالة الطلبات، تواصل مع العملاء، وأدر عمليات الشحن بكفاءة.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>إشعارات فورية للطلبات الجديدة</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تحديث حالة الطلب بسهولة</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تفاصيل العملاء والشحن</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analytics Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">تحليلات احترافية</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  فهم أعمق لأداء متجرك من خلال تحليلات مفصلة ورسوم بيانية تفاعلية. اتخذ قرارات مبنية على البيانات.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>رسوم بيانية تفاعلية</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تقارير شهرية وسنوية</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>تحليل أداء المنتجات</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="rounded-lg overflow-hidden shadow-lg border hover:shadow-xl transition-shadow">
                  <img 
                    src={analyticsPreview} 
                    alt="التحليلات" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">خطط الأسعار</h2>
            <p className="text-xl text-muted-foreground">اختر الخطة المناسبة لحجم عملك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">المجاني</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">0</span>
                  <span className="text-muted-foreground">د.ج/شهر</span>
                </div>
                <p className="text-muted-foreground mt-2">للمبتدئين والتجربة</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>حتى 10 منتجات</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>100 طلب شهرياً</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>دعم البريد الإلكتروني</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>تحليلات أساسية</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>لوحة تحكم بسيطة</span>
                </li>
              </ul>

              <Link to="/register" className="block">
                <Button variant="outline" className="w-full">
                  ابدأ مجاناً
                </Button>
              </Link>
            </Card>

            {/* Pro Plan - Popular */}
            <Card className="p-8 relative border-primary shadow-primary ring-2 ring-primary hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 right-1/2 translate-x-1/2">
                <div className="bg-gradient-accent text-accent-foreground px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  الأكثر شعبية
                </div>
              </div>

              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold mb-2">المحترف</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">2,999</span>
                  <span className="text-muted-foreground">د.ج/شهر</span>
                </div>
                <p className="text-muted-foreground mt-2">للشركات المتنامية</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">منتجات غير محدودة</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">طلبات غير محدودة</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">دعم على مدار الساعة</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">تحليلات متقدمة</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">أدوات تسويق</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">تقارير مخصصة</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">تكامل API</span>
                </li>
              </ul>

              <Link to="/register" className="block">
                <Button className="w-full bg-gradient-primary">
                  اشترك الآن
                </Button>
              </Link>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">المؤسسات</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">9,999</span>
                  <span className="text-muted-foreground">د.ج/شهر</span>
                </div>
                <p className="text-muted-foreground mt-2">للشركات الكبيرة</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">كل ميزات المحترف</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">متاجر متعددة</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">مدير حساب مخصص</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">تكامل API مخصص</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">تدريب فريق العمل</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">SLA مخصص 99.9%</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-medium">استشارات مجانية</span>
                </li>
              </ul>

              <Link to="/register" className="block">
                <Button variant="outline" className="w-full">
                  تواصل معنا
                </Button>
              </Link>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">ضمان استرجاع المال</h4>
                  <p className="text-sm text-muted-foreground">
                    30 يوم لاسترجاع أموالك بدون أسئلة
                  </p>
                </div>
                <div>
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">ترقية مرنة</h4>
                  <p className="text-sm text-muted-foreground">
                    غيّر خطتك في أي وقت حسب احتياجاتك
                  </p>
                </div>
                <div>
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">دعم متواصل</h4>
                  <p className="text-sm text-muted-foreground">
                    فريق الدعم جاهز لمساعدتك دائماً
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">جاهز للبدء؟</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف البائعين الناجحين على منصتنا وابدأ رحلتك في التجارة الإلكترونية
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-primary text-lg px-8">
              ابدأ الآن مجاناً
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 متجري. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
