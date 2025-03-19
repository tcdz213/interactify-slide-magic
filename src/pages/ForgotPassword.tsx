
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { requestPasswordReset } from '@/redux/slices/authSlice';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      const resultAction = await dispatch(requestPasswordReset(data.email));
      
      if (requestPasswordReset.fulfilled.match(resultAction)) {
        setSubmitted(true);
        toast.success("Password reset instructions sent to your email");
      } else {
        toast.error(resultAction.payload as string || "Failed to send reset instructions");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-border/30">
              {!submitted ? (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">
                      Enter your email and we'll send you instructions to reset your password
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  placeholder="Enter your email"
                                  className="pl-10"
                                  {...field}
                                />
                              </FormControl>
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                            Sending...
                          </span>
                        ) : (
                          <>
                            <span>Send Reset Instructions</span>
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
                  <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
                  <p className="text-muted-foreground mb-6">
                    We've sent password reset instructions to <span className="font-medium">{form.getValues().email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    If you don't see the email, check your spam folder. The link will expire in 24 hours.
                  </p>
                  <div className="flex flex-col space-y-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSubmitted(false)}
                      className="w-full"
                    >
                      Try a different email
                    </Button>
                    <Link to="/login">
                      <Button 
                        variant="ghost" 
                        className="w-full"
                      >
                        Back to login
                      </Button>
                    </Link>
                  </div>
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

export default ForgotPassword;
