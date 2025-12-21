import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { settingsApi } from '@/services/settingsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Shield, 
  ShieldCheck, 
  ShieldOff, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  QrCode,
  Key
} from 'lucide-react';
import type { TwoFactorSetup } from '@/types/settings';

interface TwoFactorAuthProps {
  isEnabled?: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

type Step = 'initial' | 'setup' | 'verify' | 'backup' | 'disable';

export function TwoFactorAuth({ isEnabled = false, onStatusChange }: TwoFactorAuthProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('initial');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(isEnabled);

  const enable2FA = useMutation({
    mutationFn: settingsApi.enable2FA,
    onSuccess: (response) => {
      setSetupData(response.data);
      setStep('setup');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const verify2FA = useMutation({
    mutationFn: settingsApi.verify2FA,
    onSuccess: () => {
      setStep('backup');
      toast({ title: '2FA Verified', description: 'Two-factor authentication is now active.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
    },
  });

  const disable2FA = useMutation({
    mutationFn: settingsApi.disable2FA,
    onSuccess: () => {
      setIs2FAEnabled(false);
      setStep('initial');
      setDisablePassword('');
      onStatusChange?.(false);
      toast({ title: '2FA Disabled', description: 'Two-factor authentication has been disabled.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleStartSetup = () => {
    enable2FA.mutate();
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      toast({ title: 'Invalid Code', description: 'Please enter a 6-digit code.', variant: 'destructive' });
      return;
    }
    verify2FA.mutate(verificationCode);
  };

  const handleComplete = () => {
    setIs2FAEnabled(true);
    setStep('initial');
    setSetupData(null);
    setVerificationCode('');
    onStatusChange?.(true);
  };

  const handleDisable = () => {
    if (!disablePassword) {
      toast({ title: 'Password Required', description: 'Please enter your password to disable 2FA.', variant: 'destructive' });
      return;
    }
    disable2FA.mutate(disablePassword);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: 'Copied', description: `${label} copied to clipboard.` });
  };

  const renderInitialState = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {is2FAEnabled ? (
            <ShieldCheck className="h-8 w-8 text-green-500" />
          ) : (
            <Shield className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">
              {is2FAEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
            </p>
          </div>
        </div>
        <Badge variant={is2FAEnabled ? 'default' : 'secondary'}>
          {is2FAEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      <Separator />

      <p className="text-sm text-muted-foreground">
        Two-factor authentication adds an additional layer of security to your account by requiring 
        a verification code from your authenticator app in addition to your password.
      </p>

      {is2FAEnabled ? (
        <Button 
          variant="destructive" 
          onClick={() => setStep('disable')}
          className="w-full sm:w-auto"
        >
          <ShieldOff className="mr-2 h-4 w-4" />
          Disable 2FA
        </Button>
      ) : (
        <Button 
          onClick={handleStartSetup} 
          disabled={enable2FA.isPending}
          className="w-full sm:w-auto"
        >
          {enable2FA.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          Enable 2FA
        </Button>
      )}
    </div>
  );

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Step 1: Scan QR Code</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
      </p>

      {setupData?.qrCode && (
        <div className="flex justify-center">
          <div className="bg-background p-4 rounded-lg border">
            <img 
              src={setupData.qrCode} 
              alt="2FA QR Code" 
              className="w-48 h-48"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Or enter this code manually:</Label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
            {setupData?.secret}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(setupData?.secret || '', 'Secret key')}
          >
            {copiedCode === 'Secret key' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Step 2: Enter Verification Code</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verificationCode">6-digit code from your authenticator app</Label>
        <Input
          id="verificationCode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          className="text-center text-2xl tracking-widest font-mono"
        />
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setStep('initial');
            setSetupData(null);
            setVerificationCode('');
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleVerify} 
          disabled={verify2FA.isPending || verificationCode.length !== 6}
          className="flex-1"
        >
          {verify2FA.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Verify & Enable
        </Button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-green-600">
        <ShieldCheck className="h-6 w-6" />
        <h3 className="font-semibold text-lg">2FA Successfully Enabled!</h3>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
          ⚠️ Save Your Backup Codes
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
          Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {setupData?.backupCodes?.map((code, index) => (
            <code 
              key={index} 
              className="bg-background px-3 py-2 rounded text-sm font-mono text-center border"
            >
              {code}
            </code>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(setupData?.backupCodes?.join('\n') || '', 'Backup codes')}
          className="w-full"
        >
          {copiedCode === 'Backup codes' ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy All Backup Codes
            </>
          )}
        </Button>
      </div>

      <Button onClick={handleComplete} className="w-full">
        Done
      </Button>
    </div>
  );

  const renderDisableStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-destructive">
        <ShieldOff className="h-5 w-5" />
        <h3 className="font-semibold">Disable Two-Factor Authentication</h3>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-sm text-destructive">
          Warning: Disabling 2FA will make your account less secure. Are you sure you want to continue?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="disablePassword">Confirm your password</Label>
        <div className="relative">
          <Input
            id="disablePassword"
            type={showPassword ? 'text' : 'password'}
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Enter your password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setStep('initial');
            setDisablePassword('');
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive"
          onClick={handleDisable} 
          disabled={disable2FA.isPending || !disablePassword}
          className="flex-1"
        >
          {disable2FA.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Disable 2FA
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Add an extra layer of security to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'initial' && renderInitialState()}
        {step === 'setup' && renderSetupStep()}
        {step === 'backup' && renderBackupStep()}
        {step === 'disable' && renderDisableStep()}
      </CardContent>
    </Card>
  );
}
