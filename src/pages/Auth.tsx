import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetSent, setResetSent] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (mode === 'forgot') {
        forgotPasswordSchema.parse({ email: formData.email });
        setIsLoading(true);
        const result = await authService.requestPasswordReset(formData.email);
        
        if (result.success) {
          setResetSent(true);
          toast({ title: 'Check your email', description: result.message });
        } else {
          setErrors({ form: 'error' in result ? result.error : 'Failed to send reset email' });
        }
      } else if (mode === 'login') {
        loginSchema.parse(formData);
        setIsLoading(true);
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
          navigate(from, { replace: true });
        } else {
          setErrors({ form: result.error || 'Login failed' });
        }
      } else {
        signupSchema.parse(formData);
        setIsLoading(true);
        const result = await signup(formData.email, formData.password, formData.name);
        
        if (result.success) {
          toast({ title: 'Account created!', description: 'Welcome to DevCycle.' });
          navigate(from, { replace: true });
        } else {
          setErrors({ form: result.error || 'Signup failed' });
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={() => mode === 'forgot' ? switchMode('login') : navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {mode === 'forgot' ? 'Back to login' : 'Back to home'}
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create an account'}
              {mode === 'forgot' && 'Reset password'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' && 'Enter your credentials to access your dashboard'}
              {mode === 'signup' && 'Start managing your development lifecycle'}
              {mode === 'forgot' && "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {mode === 'forgot' && resetSent ? (
            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <h3 className="font-semibold text-foreground mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm mb-4">
                If an account exists with {formData.email}, you'll receive a password reset link shortly.
              </p>
              <Button variant="outline" onClick={() => switchMode('login')}>
                Return to login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {errors.form && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{errors.form}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Please wait...' : 
                  mode === 'login' ? 'Sign In' : 
                  mode === 'signup' ? 'Create Account' : 
                  'Send Reset Link'}
              </Button>
            </form>
          )}

          {mode !== 'forgot' && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-primary hover:underline font-medium"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/20 via-background to-accent/20 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8">
            <span className="text-3xl font-bold text-primary-foreground">DC</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Streamline Your Development Workflow
          </h2>
          <p className="text-muted-foreground">
            Manage products, track sprints, and collaborate with your team - all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
