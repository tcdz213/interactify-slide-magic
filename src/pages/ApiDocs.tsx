import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Code, Lock, Server, Users, Package, ShoppingCart, MessageSquare, Star, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ApiDocs = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const categories = [
    {
      id: "auth",
      name: "Authentication",
      icon: Lock,
      color: "bg-primary",
      endpoints: [
        {
          method: "POST",
          path: "/api/auth/register",
          description: "تسجيل مستخدم جديد",
          body: {
            email: "string",
            password: "string",
            name: "string",
            role: "seller | customer"
          },
          response: {
            user: { id: "uuid", email: "string", name: "string", role: "string" },
            token: "jwt_token"
          }
        },
        {
          method: "POST",
          path: "/api/auth/login",
          description: "تسجيل الدخول",
          body: { email: "string", password: "string" },
          response: { user: "object", token: "jwt_token", refreshToken: "string" }
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "تسجيل الخروج",
          headers: { Authorization: "Bearer {token}" },
          response: { success: true }
        },
        {
          method: "POST",
          path: "/api/auth/refresh",
          description: "تحديث رمز المصادقة",
          body: { refreshToken: "string" },
          response: { token: "jwt_token", refreshToken: "string" }
        },
        {
          method: "POST",
          path: "/api/auth/forgot-password",
          description: "إعادة تعيين كلمة المرور",
          body: { email: "string" },
          response: { message: "Email sent successfully" }
        }
      ]
    },
    {
      id: "users",
      name: "Users",
      icon: Users,
      color: "bg-accent",
      endpoints: [
        {
          method: "GET",
          path: "/api/users/profile",
          description: "الحصول على ملف المستخدم الحالي",
          headers: { Authorization: "Bearer {token}" },
          response: { id: "uuid", email: "string", name: "string", avatar: "url", role: "string" }
        },
        {
          method: "PUT",
          path: "/api/users/profile",
          description: "تحديث ملف المستخدم",
          headers: { Authorization: "Bearer {token}" },
          body: { name: "string", avatar: "url", phone: "string", address: "string" },
          response: { user: "object", message: "Profile updated" }
        },
        {
          method: "GET",
          path: "/api/users/sellers",
          description: "الحصول على قائمة البائعين",
          query: { page: "number", limit: "number", search: "string" },
          response: { sellers: "array", pagination: "object" }
        },
        {
          method: "GET",
          path: "/api/users/{userId}",
          description: "الحصول على مستخدم محدد",
          headers: { Authorization: "Bearer {token}" },
          response: { user: "object" }
        }
      ]
    },
    {
      id: "products",
      name: "Products",
      icon: Package,
      color: "bg-success",
      endpoints: [
        {
          method: "GET",
          path: "/api/products",
          description: "الحصول على قائمة المنتجات",
          query: { page: "number", limit: "number", category: "string", search: "string", sort: "price_asc|price_desc|newest" },
          response: { products: "array", pagination: { total: "number", page: "number", limit: "number" } }
        },
        {
          method: "GET",
          path: "/api/products/{productId}",
          description: "الحصول على تفاصيل منتج",
          response: { id: "uuid", name: "string", description: "string", price: "number", images: "array", stock: "number", seller: "object" }
        },
        {
          method: "POST",
          path: "/api/products",
          description: "إضافة منتج جديد",
          headers: { Authorization: "Bearer {token}" },
          body: { name: "string", description: "string", price: "number", stock: "number", category: "string", images: "array" },
          response: { product: "object", message: "Product created" }
        },
        {
          method: "PUT",
          path: "/api/products/{productId}",
          description: "تحديث منتج",
          headers: { Authorization: "Bearer {token}" },
          body: { name: "string", description: "string", price: "number", stock: "number" },
          response: { product: "object", message: "Product updated" }
        },
        {
          method: "DELETE",
          path: "/api/products/{productId}",
          description: "حذف منتج",
          headers: { Authorization: "Bearer {token}" },
          response: { success: true, message: "Product deleted" }
        },
        {
          method: "GET",
          path: "/api/products/seller/{sellerId}",
          description: "الحصول على منتجات بائع محدد",
          query: { page: "number", limit: "number" },
          response: { products: "array", pagination: "object" }
        }
      ]
    },
    {
      id: "orders",
      name: "Orders",
      icon: ShoppingCart,
      color: "bg-primary",
      endpoints: [
        {
          method: "GET",
          path: "/api/orders",
          description: "الحصول على قائمة الطلبات",
          headers: { Authorization: "Bearer {token}" },
          query: { page: "number", limit: "number", status: "pending|processing|completed|cancelled" },
          response: { orders: "array", pagination: "object" }
        },
        {
          method: "GET",
          path: "/api/orders/{orderId}",
          description: "الحصول على تفاصيل طلب",
          headers: { Authorization: "Bearer {token}" },
          response: { id: "uuid", items: "array", total: "number", status: "string", customer: "object", createdAt: "date" }
        },
        {
          method: "POST",
          path: "/api/orders",
          description: "إنشاء طلب جديد",
          headers: { Authorization: "Bearer {token}" },
          body: { items: "array", shippingAddress: "object", paymentMethod: "string" },
          response: { order: "object", message: "Order created" }
        },
        {
          method: "PUT",
          path: "/api/orders/{orderId}/status",
          description: "تحديث حالة الطلب",
          headers: { Authorization: "Bearer {token}" },
          body: { status: "pending|processing|completed|cancelled" },
          response: { order: "object", message: "Order status updated" }
        },
        {
          method: "POST",
          path: "/api/orders/{orderId}/cancel",
          description: "إلغاء طلب",
          headers: { Authorization: "Bearer {token}" },
          body: { reason: "string" },
          response: { success: true, message: "Order cancelled" }
        }
      ]
    },
    {
      id: "reviews",
      name: "Reviews",
      icon: Star,
      color: "bg-accent",
      endpoints: [
        {
          method: "GET",
          path: "/api/reviews/product/{productId}",
          description: "الحصول على تقييمات منتج",
          query: { page: "number", limit: "number" },
          response: { reviews: "array", averageRating: "number", totalReviews: "number", pagination: "object" }
        },
        {
          method: "POST",
          path: "/api/reviews",
          description: "إضافة تقييم",
          headers: { Authorization: "Bearer {token}" },
          body: { productId: "uuid", rating: "number (1-5)", comment: "string", images: "array" },
          response: { review: "object", message: "Review created" }
        },
        {
          method: "PUT",
          path: "/api/reviews/{reviewId}",
          description: "تحديث تقييم",
          headers: { Authorization: "Bearer {token}" },
          body: { rating: "number", comment: "string" },
          response: { review: "object", message: "Review updated" }
        },
        {
          method: "DELETE",
          path: "/api/reviews/{reviewId}",
          description: "حذف تقييم",
          headers: { Authorization: "Bearer {token}" },
          response: { success: true, message: "Review deleted" }
        }
      ]
    },
    {
      id: "feedback",
      name: "Feedback",
      icon: MessageSquare,
      color: "bg-success",
      endpoints: [
        {
          method: "GET",
          path: "/api/feedback",
          description: "الحصول على قائمة التعليقات",
          headers: { Authorization: "Bearer {token}" },
          query: { page: "number", limit: "number", status: "pending|reviewed|resolved" },
          response: { feedback: "array", pagination: "object", stats: { total: "number", pending: "number" } }
        },
        {
          method: "POST",
          path: "/api/feedback",
          description: "إرسال ملاحظات",
          headers: { Authorization: "Bearer {token}" },
          body: { type: "bug|feature|complaint", message: "string", cardId: "uuid (optional)" },
          response: { feedback: "object", message: "Feedback submitted" }
        },
        {
          method: "PATCH",
          path: "/api/feedback/{feedbackId}",
          description: "تحديث حالة الملاحظات",
          headers: { Authorization: "Bearer {token} (admin)" },
          body: { status: "pending|reviewed|resolved", adminNotes: "string" },
          response: { feedback: "object", message: "Feedback updated" }
        }
      ]
    },
    {
      id: "admin",
      name: "Admin",
      icon: Shield,
      color: "bg-destructive",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/stats",
          description: "إحصائيات المنصة",
          headers: { Authorization: "Bearer {token} (admin)" },
          response: { users: "number", products: "number", orders: "number", revenue: "number" }
        },
        {
          method: "GET",
          path: "/api/admin/users",
          description: "إدارة المستخدمين",
          headers: { Authorization: "Bearer {token} (admin)" },
          query: { page: "number", limit: "number", role: "seller|customer|admin", status: "active|suspended" },
          response: { users: "array", pagination: "object" }
        },
        {
          method: "PUT",
          path: "/api/admin/users/{userId}/status",
          description: "تحديث حالة المستخدم",
          headers: { Authorization: "Bearer {token} (admin)" },
          body: { status: "active|suspended", reason: "string" },
          response: { user: "object", message: "User status updated" }
        },
        {
          method: "GET",
          path: "/api/admin/reviews",
          description: "إدارة التقييمات",
          headers: { Authorization: "Bearer {token} (admin)" },
          query: { page: "number", limit: "number", status: "all|flagged|verified" },
          response: { reviews: "array", pagination: "object" }
        },
        {
          method: "DELETE",
          path: "/api/admin/reviews/{reviewId}",
          description: "حذف تقييم",
          headers: { Authorization: "Bearer {token} (admin)" },
          response: { success: true, message: "Review deleted" }
        },
        {
          method: "GET",
          path: "/api/admin/analytics",
          description: "تحليلات متقدمة",
          headers: { Authorization: "Bearer {token} (admin)" },
          query: { startDate: "date", endDate: "date", type: "sales|users|products" },
          response: { data: "array", summary: "object" }
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-success/10 text-success border-success/20";
      case "POST": return "bg-primary/10 text-primary border-primary/20";
      case "PUT": return "bg-accent/10 text-accent border-accent/20";
      case "PATCH": return "bg-accent/10 text-accent border-accent/20";
      case "DELETE": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="وثائق API"
        description="وثائق API الشاملة لمنصة التجارة الإلكترونية - تعرف على كيفية التكامل مع API الخاص بنا لإدارة المنتجات، الطلبات، والمستخدمين."
        keywords="API documentation, REST API, وثائق API, تكامل API"
      />
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">API Documentation</h1>
              <p className="text-muted-foreground">وثائق واجهة برمجة التطبيقات الكاملة</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Base URL Info */}
        <Card className="p-6 mb-8 border-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Base URL</h3>
              <code className="block bg-muted px-4 py-3 rounded-lg text-sm font-mono">
                https://api.yourdomain.com/v1
              </code>
              <p className="text-sm text-muted-foreground mt-3">
                جميع نقاط النهاية API تبدأ بهذا العنوان الأساسي. تأكد من تضمين رمز المصادقة في الرأس للنقاط المحمية.
              </p>
            </div>
          </div>
        </Card>

        {/* Authentication Info */}
        <Card className="p-6 mb-8 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">المصادقة</h3>
              <p className="text-sm text-muted-foreground mb-3">
                تستخدم واجهة برمجة التطبيقات رموز JWT للمصادقة. قم بتضمين الرمز في رأس Authorization:
              </p>
              <code className="block bg-background px-4 py-3 rounded-lg text-sm font-mono border">
                Authorization: Bearer YOUR_JWT_TOKEN
              </code>
            </div>
          </div>
        </Card>

        {/* API Categories */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
              onClick={() => document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.endpoints.length} نقطة نهاية
              </p>
            </Card>
          ))}
        </div>

        {/* Endpoints Documentation */}
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} id={category.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Badge variant="secondary">{category.endpoints.length} endpoints</Badge>
              </div>

              <div className="space-y-4">
                {category.endpoints.map((endpoint, idx) => (
                  <Card key={idx} className="overflow-hidden border-2 hover:border-primary/20 transition-all">
                    <div className="p-6">
                      {/* Endpoint Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Badge className={`${getMethodColor(endpoint.method)} border font-mono px-3 py-1`}>
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1">
                          <code className="text-lg font-mono font-semibold">{endpoint.path}</code>
                          <p className="text-muted-foreground mt-2">{endpoint.description}</p>
                        </div>
                      </div>

                      {/* Endpoint Details */}
                      <Tabs defaultValue="body" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                          {endpoint.headers && <TabsTrigger value="headers">Headers</TabsTrigger>}
                          {endpoint.query && <TabsTrigger value="query">Query Params</TabsTrigger>}
                          {endpoint.body && <TabsTrigger value="body">Request Body</TabsTrigger>}
                          <TabsTrigger value="response">Response</TabsTrigger>
                        </TabsList>

                        {endpoint.headers && (
                          <TabsContent value="headers" className="mt-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <pre className="text-sm font-mono whitespace-pre-wrap">
                                {JSON.stringify(endpoint.headers, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        {endpoint.query && (
                          <TabsContent value="query" className="mt-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <pre className="text-sm font-mono whitespace-pre-wrap">
                                {JSON.stringify(endpoint.query, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        {endpoint.body && (
                          <TabsContent value="body" className="mt-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <pre className="text-sm font-mono whitespace-pre-wrap">
                                {JSON.stringify(endpoint.body, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        <TabsContent value="response" className="mt-4">
                          <div className="bg-success/5 border border-success/20 p-4 rounded-lg">
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                              {JSON.stringify(endpoint.response, null, 2)}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Error Codes */}
        <Card className="p-6 mt-8 border-2">
          <h2 className="text-2xl font-bold mb-6">رموز الأخطاء الشائعة</h2>
          <div className="space-y-3">
            {[
              { code: "200", message: "OK - نجح الطلب", color: "text-success" },
              { code: "201", message: "Created - تم إنشاء المورد بنجاح", color: "text-success" },
              { code: "400", message: "Bad Request - طلب غير صحيح", color: "text-destructive" },
              { code: "401", message: "Unauthorized - غير مصرح", color: "text-destructive" },
              { code: "403", message: "Forbidden - محظور", color: "text-destructive" },
              { code: "404", message: "Not Found - غير موجود", color: "text-destructive" },
              { code: "422", message: "Unprocessable Entity - بيانات غير صالحة", color: "text-destructive" },
              { code: "500", message: "Internal Server Error - خطأ في الخادم", color: "text-destructive" },
            ].map((error, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Badge className={`font-mono ${error.color}`}>{error.code}</Badge>
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;