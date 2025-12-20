import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // Don't show if no user, email is verified, or banner is dismissed
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      // Use password reset request as a workaround to resend verification
      // In a real implementation, you'd have a dedicated resend endpoint
      const result = await authService.requestPasswordReset(user.email);
      if (result.success) {
        toast.success('Verification email sent', {
          description: 'Please check your inbox for the verification link.',
        });
      }
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Email not verified
            </p>
            <p className="text-xs text-yellow-600/80 dark:text-yellow-500/80 truncate">
              Please verify your email address to access all features.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={sending}
            className="border-yellow-500/30 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-1.5" />
            )}
            Resend
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
