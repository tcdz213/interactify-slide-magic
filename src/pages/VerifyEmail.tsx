import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      const result = await authService.verifyEmail(token);
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage('error' in result ? result.error : 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Your email has been verified!'}
            {status === 'error' && 'Verification failed'}
            {status === 'no-token' && 'Invalid verification link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}

          {status === 'success' && (
            <>
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <p className="text-center text-muted-foreground">
                Your email address has been successfully verified. You can now access all features of your account.
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <p className="text-center text-muted-foreground">
                {errorMessage || 'The verification link is invalid or has expired.'}
              </p>
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={() => navigate('/auth')} className="flex-1">
                  Back to Login
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground">
                No verification token was provided. Please check your email for the verification link.
              </p>
              <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
