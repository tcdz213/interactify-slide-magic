
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { resetPassword } from '@/redux/slices/authSlice';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    try {
      const resultAction = await dispatch(resetPassword({
        token,
        newPassword: data.password
      }));
      
      if (resetPassword.fulfilled.match(resultAction)) {
        setResetComplete(true);
        toast.success("Password has been reset successfully");
      } else {
        toast.error(resultAction.payload as string || "Failed to reset password");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container-custom">
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-border/30">
                <div className="text-center py-6">
                  <h2 className="text-2xl font-semibold mb-2">Invalid Link</h2>
                  <p className="text-muted-foreground mb-6">
                    This password reset link is invalid or has expired.
                  </p>
                  <Link to="/forgot-password">
                    <Button className="w-full">
                      Request a new password reset link
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-border/30">
              {!resetComplete ? (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold mb-2">Create New Password</h1>
                    <p className="text-muted-foreground">
                      Your new password must be different from your previous passwords
                    </p>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your new password"
                                  className="pl-10 pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your new password"
                                  className="pl-10 pr-10"
                                  {...field}
                                />
                              </FormControl>
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full rounded-lg group" disabled={loading}>
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resetting Password...
                          </span>
                        ) : (
                          <>
                            <span>Reset Password</span>
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                      
                      <div className="mt-6 text-center">
                        <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Login
                        </Link>
                      </div>
                    </form>
                  </Form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="mb-4 flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Password Reset Complete</h2>
                  <p className="text-muted-foreground mb-6">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                  <Link to="/login">
                    <Button className="w-full">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
