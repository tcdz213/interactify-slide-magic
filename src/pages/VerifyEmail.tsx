
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { verifyEmail, requestPasswordReset } from '@/redux/slices/authSlice';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      const verify = async () => {
        try {
          const resultAction = await dispatch(verifyEmail(token));
          
          if (verifyEmail.fulfilled.match(resultAction)) {
            setSuccess(true);
            toast.success("Email verified successfully");
          } else {
            setSuccess(false);
            toast.error(resultAction.payload as string || "Email verification failed");
          }
        } catch (err) {
          setSuccess(false);
          toast.error("An unexpected error occurred");
        } finally {
          setVerifying(false);
        }
      };
      
      verify();
    } else {
      setVerifying(false);
      setSuccess(false);
    }
  }, [token, dispatch]);

  const handleResendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast.error("Email address is missing");
      return;
    }

    try {
      // Use the requestPasswordReset as a placeholder for requestEmailVerification
      // In a real app, you would have a separate endpoint for this
      await dispatch(requestPasswordReset(email));
      toast.success("Verification email has been resent");
    } catch (err) {
      toast.error("Failed to resend verification email");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-border/30">
              <div className="text-center py-6">
                {verifying ? (
                  <>
                    <div className="mb-4 flex justify-center">
                      <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Verifying Your Email</h2>
                    <p className="text-muted-foreground mb-6">
                      Please wait while we verify your email address...
                    </p>
                  </>
                ) : success ? (
                  <>
                    <div className="mb-4 flex justify-center">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Email Verified</h2>
                    <p className="text-muted-foreground mb-6">
                      Your email has been successfully verified. You can now access all features of your account.
                    </p>
                    <Link to="/login">
                      <Button className="w-full">
                        Continue to Login
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex justify-center">
                      <XCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Verification Failed</h2>
                    <p className="text-muted-foreground mb-6">
                      {error || "We couldn't verify your email address. The link may have expired or is invalid."}
                    </p>
                    <div className="space-y-3">
                      <Button 
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </span>
                        ) : "Resend Verification Email"}
                      </Button>
                      <Link to="/login">
                        <Button variant="outline" className="w-full">
                          Back to Login
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
