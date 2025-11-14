import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Store, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, user, checkAdminRole, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated (but only after auth is done loading)
  useEffect(() => {
    const redirect = async () => {
      if (!authLoading && isAuthenticated && user) {
        console.log('🔄 [LOGIN PAGE] User already authenticated, checking role for redirect...');
        const isAdmin = await checkAdminRole();
        console.log(`🚀 [LOGIN PAGE] Redirecting authenticated user (${isAdmin ? 'ADMIN' : 'USER'}) to: ${isAdmin ? '/admin' : '/dashboard'}`);
        navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
      }
    };
    redirect();
  }, [authLoading, isAuthenticated, user, navigate, checkAdminRole]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('🔐 [LOGIN] Starting login process...', { email: data.email });
    setIsLoading(true);
    try {
      console.log('📤 [LOGIN] Calling login API...');
      await login(data.email, data.password);
      console.log('✅ [LOGIN] Login successful, checking user role...');
      
      // Check role and redirect
      const isAdmin = await checkAdminRole();
      console.log(`👤 [LOGIN] User role determined: ${isAdmin ? 'ADMIN' : 'USER'}`);
      console.log(`🚀 [LOGIN] Redirecting to: ${isAdmin ? '/admin' : '/dashboard'}`);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('❌ [LOGIN] Login failed:', error);
      // Error already handled in AuthContext
    } finally {
      setIsLoading(false);
      console.log('🏁 [LOGIN] Login process completed');
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔐 [GOOGLE LOGIN] Starting Google OAuth login...');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      console.log('✅ [GOOGLE LOGIN] OAuth initiated successfully');
    } catch (error) {
      console.error('❌ [GOOGLE LOGIN] OAuth login failed:', error);
      // Error already handled in AuthContext
    } finally {
      setIsLoading(false);
      console.log('🏁 [GOOGLE LOGIN] Google login process completed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4" dir="rtl">
      <SEO
        title="تسجيل الدخول"
        description="سجل دخولك إلى حسابك في منصة التجارة الإلكترونية وابدأ إدارة متجرك ومنتجاتك بكل سهولة."
        noindex={true}
      />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Mail className="w-4 h-4 ml-2" />
            تسجيل الدخول بواسطة Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                سجل الآن
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
