import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO, generateOrganizationSchema } from "@/components/SEO";
import { Store, Package, BarChart3, Users, TrendingUp, Shield, Monitor, ShoppingCart, Check, Sparkles, ArrowRight, Zap, Star } from "lucide-react";
import dashboardPreview from "@/assets/dashboard-preview.png";
import productsPreview from "@/assets/products-preview.png";
import ordersPreview from "@/assets/orders-preview.png";
import analyticsPreview from "@/assets/analytics-preview.png";
const Landing = () => {
  const features = [{
    icon: Store,
    title: "متجر متعدد البائعين",
    description: "منصة شاملة تمكن البائعين من إدارة منتجاتهم وطلباتهم بسهولة"
  }, {
    icon: Package,
    title: "إدارة المنتجات",
    description: "أضف وعدل منتجاتك بكل سهولة مع دعم الصور والأوصاف التفصيلية"
  }, {
    icon: BarChart3,
    title: "تحليلات متقدمة",
    description: "تتبع مبيعاتك وأدائك من خلال لوحة تحكم تحليلية متطورة"
  }, {
    icon: Users,
    title: "إدارة العملاء",
    description: "نظام شامل لإدارة العملاء والطلبات بكفاءة عالية"
  }, {
    icon: TrendingUp,
    title: "نمو الأعمال",
    description: "أدوات تساعدك على تطوير عملك وزيادة مبيعاتك"
  }, {
    icon: Shield,
    title: "أمان وحماية",
    description: "نظام آمن لحماية بياناتك ومعلومات عملائك"
  }];
  return <div className="min-h-screen bg-background" dir="rtl">
      <SEO title="منصة التجارة الإلكترونية الأولى في الجزائر" description="ابدأ متجرك الإلكتروني اليوم مع أفضل منصة تجارة إلكترونية في الجزائر. إدارة المنتجات، الطلبات، والمبيعات بكل سهولة مع أدوات احترافية وواجهة سهلة الاستخدام." keywords="تجارة إلكترونية، متجر إلكتروني، منصة تجارة، إدارة المنتجات، إدارة الطلبات، التجارة الرقمية، الجزائر" type="website" structuredData={generateOrganizationSchema()} />
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">متجري</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-primary/10">تسجيل الدخول</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-accent shadow-md hover:shadow-lg transition-all">
                ابدأ الآن
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-hero overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '1s'
        }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white px-4 py-2">
            <Sparkles className="w-4 h-4 ml-2" />
            أفضل منصة تجارة إلكترونية في الجزائر
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight animate-fade-in">
            منصة التجارة الإلكترونية
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              الأولى
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
            ابدأ متجرك الإلكتروني اليوم وحقق النجاح في عالم التجارة الرقمية
            <br />
            مع أدوات احترافية وواجهة سهلة الاستخدام
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-accent shadow-xl hover:shadow-2xl text-lg px-10 py-6 hover:scale-105 transition-all">
                ابدأ مجاناً
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-lg px-10 py-6">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>بدون بطاقة ائتمان</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>إعداد في 5 دقائق</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>دعم فني على مدار الساعة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">+1000</div>
              <div className="text-muted-foreground">متجر نشط</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">+50k</div>
              <div className="text-muted-foreground">منتج مبيع</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">رضا العملاء</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      

      {/* Platform Features with Screenshots */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <Monitor className="w-4 h-4 ml-2" />
              جولة في المنصة
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">استكشف منصتنا</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              شاهد كيف تساعدك أدواتنا على إدارة متجرك بفعالية وسهولة
            </p>
          </div>

          <div className="space-y-24">
            {/* Dashboard Feature */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
              <div className="order-2 lg:order-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                    <img src={dashboardPreview} alt="لوحة التحكم" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
                  <Monitor className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Dashboard</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                  لوحة تحكم شاملة
                  
                  <span className="text-muted-foreground text-2xl">لإدارة ذكية</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  تتبع أداء متجرك من خلال لوحة تحكم متطورة تعرض جميع المقاييس المهمة في مكان واحد. احصل على رؤية كاملة لمبيعاتك، طلباتك، ومنتجاتك.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">إحصائيات المبيعات الفورية</div>
                      <div className="text-sm text-muted-foreground">تتبع مبيعاتك لحظة بلحظة</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">متابعة الطلبات الجديدة</div>
                      <div className="text-sm text-muted-foreground">إشعارات فورية للطلبات</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تقارير الأداء اليومية</div>
                      <div className="text-sm text-muted-foreground">تحليلات دقيقة ومفصلة</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Products Feature */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full">
                  <Package className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-accent">Products</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                  إدارة المنتجات
                  <br />
                  <span className="text-muted-foreground text-2xl">بكل سهولة</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  أضف وعدل منتجاتك بكل سهولة. دعم كامل للصور المتعددة، الأوصاف التفصيلية، وإدارة المخزون الذكية.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">رفع صور عالية الجودة</div>
                      <div className="text-sm text-muted-foreground">دعم الصور المتعددة</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تتبع المخزون التلقائي</div>
                      <div className="text-sm text-muted-foreground">تحديثات فورية للمخزون</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تصنيفات وفلاتر متقدمة</div>
                      <div className="text-sm text-muted-foreground">تنظيم احترافي للمنتجات</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-accent rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                    <img src={productsPreview} alt="إدارة المنتجات" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Feature */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
              <div className="order-2 lg:order-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                    <img src={ordersPreview} alt="إدارة الطلبات" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Orders</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                  نظام طلبات متطور
                  <br />
                  <span className="text-muted-foreground text-2xl">لإدارة فعالة</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  تابع جميع طلباتك في مكان واحد. حدّث حالة الطلبات، تواصل مع العملاء، وأدر عمليات الشحن بكفاءة.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">إشعارات فورية للطلبات الجديدة</div>
                      <div className="text-sm text-muted-foreground">لا تفوت أي طلب</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تحديث حالة الطلب بسهولة</div>
                      <div className="text-sm text-muted-foreground">إدارة مرنة وسريعة</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تفاصيل العملاء والشحن</div>
                      <div className="text-sm text-muted-foreground">معلومات كاملة ومنظمة</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analytics Feature */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-accent">Analytics</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                  تحليلات احترافية
                  <br />
                  <span className="text-muted-foreground text-2xl">لقرارات ذكية</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  فهم أعمق لأداء متجرك من خلال تحليلات مفصلة ورسوم بيانية تفاعلية. اتخذ قرارات مبنية على البيانات.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">رسوم بيانية تفاعلية</div>
                      <div className="text-sm text-muted-foreground">تصور بياناتك بوضوح</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تقارير شهرية وسنوية</div>
                      <div className="text-sm text-muted-foreground">فهم شامل للأداء</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">تحليل أداء المنتجات</div>
                      <div className="text-sm text-muted-foreground">اكتشف الأكثر مبيعاً</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-accent rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                    <img src={analyticsPreview} alt="التحليلات" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <Star className="w-4 h-4 ml-2" />
              آراء العملاء
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">ماذا يقول عملاؤنا</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              انضم إلى آلاف البائعين الذين حققوا النجاح معنا
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[{
            name: "أحمد محمد",
            role: "صاحب متجر إلكترونيات",
            content: "منصة رائعة ساعدتني على تنظيم متجري وزيادة مبيعاتي بنسبة 200% في أول 3 أشهر. أنصح بها بشدة!",
            rating: 5
          }, {
            name: "فاطمة الزهراء",
            role: "تاجرة أزياء",
            content: "واجهة سهلة الاستخدام ودعم فني ممتاز. تمكنت من إدارة أكثر من 500 منتج بكل سهولة.",
            rating: 5
          }, {
            name: "كريم بن علي",
            role: "صاحب متجر مستحضرات",
            content: "التحليلات والتقارير ساعدتني على فهم عملائي بشكل أفضل واتخاذ قرارات صحيحة لتنمية عملي.",
            rating: 5
          }].map((testimonial, index) => <Card key={index} className="p-6 hover:shadow-xl transition-all border-2">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Package className="w-4 h-4 ml-2" />
              خطط مرنة
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">خطط الأسعار</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              اختر الخطة المناسبة لحجم عملك وابدأ رحلتك نحو النجاح
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">المجاني</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold">0</span>
                  <span className="text-muted-foreground">د.ج/شهر</span>
                </div>
                <p className="text-muted-foreground">للمبتدئين والتجربة</p>
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
            <Card className="p-8 relative border-primary shadow-xl ring-2 ring-primary hover:shadow-2xl transition-all hover:-translate-y-2 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="absolute -top-4 right-1/2 translate-x-1/2">
                <div className="bg-gradient-accent text-accent-foreground px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  الأكثر شعبية
                </div>
              </div>

              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold mb-2">المحترف</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">2,999</span>
                  <span className="text-muted-foreground">د.ج/شهر</span>
                </div>
                <p className="text-muted-foreground">للشركات المتنامية</p>
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
    </div>;
};
export default Landing;