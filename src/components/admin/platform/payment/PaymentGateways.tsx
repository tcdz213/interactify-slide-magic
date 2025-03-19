
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, AlarmClock, BadgePercent } from 'lucide-react';

export const PaymentGateways: React.FC = () => {
  const { toast } = useToast();
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [localPaymentEnabled, setLocalPaymentEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveSettings = () => {
    setIsUpdating(true);
    
    // Simulate API call to save payment gateway settings
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Settings Saved",
        description: "Payment gateway settings have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Stripe</CardTitle>
            <Switch 
              checked={stripeEnabled} 
              onCheckedChange={setStripeEnabled} 
            />
          </div>
          <CardDescription>Process credit card payments</CardDescription>
        </CardHeader>
        <CardContent className={stripeEnabled ? "opacity-100" : "opacity-50"}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input 
                type="password" 
                value="sk_test_•••••••••••••••••••" 
                disabled={!stripeEnabled} 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Webhook Secret</label>
              <Input 
                type="password" 
                value="whsec_••••••••••••••••" 
                disabled={!stripeEnabled} 
                className="mt-1"
              />
            </div>
            <div className="flex items-center text-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Accepts: Visa, Mastercard, Amex</span>
            </div>
            <div className="flex items-center text-sm">
              <BadgePercent className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Fee: 2.9% + $0.30 per transaction</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">PayPal</CardTitle>
            <Switch 
              checked={paypalEnabled} 
              onCheckedChange={setPaypalEnabled} 
            />
          </div>
          <CardDescription>Accept PayPal payments</CardDescription>
        </CardHeader>
        <CardContent className={paypalEnabled ? "opacity-100" : "opacity-50"}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client ID</label>
              <Input 
                type="password" 
                value={paypalEnabled ? "client_id_••••••••••••" : ""}
                disabled={!paypalEnabled} 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Secret Key</label>
              <Input 
                type="password" 
                value={paypalEnabled ? "client_secret_••••••••" : ""} 
                disabled={!paypalEnabled} 
                className="mt-1"
              />
            </div>
            <div className="flex items-center text-sm">
              <AlarmClock className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Settlement time: 1-2 business days</span>
            </div>
            <div className="flex items-center text-sm">
              <BadgePercent className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Fee: 3.49% + $0.49 per transaction</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Local Payment Methods</CardTitle>
            <Switch 
              checked={localPaymentEnabled} 
              onCheckedChange={setLocalPaymentEnabled} 
            />
          </div>
          <CardDescription>Bank transfers and other local methods</CardDescription>
        </CardHeader>
        <CardContent className={localPaymentEnabled ? "opacity-100" : "opacity-50"}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bank Account</label>
              <Input 
                value={localPaymentEnabled ? "456789123456" : ""} 
                disabled={!localPaymentEnabled} 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input 
                value={localPaymentEnabled ? "Global Banking Corp." : ""} 
                disabled={!localPaymentEnabled} 
                className="mt-1"
              />
            </div>
            <div className="flex items-center text-sm">
              <AlarmClock className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Settlement time: 3-5 business days</span>
            </div>
            <div className="flex items-center text-sm">
              <BadgePercent className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground">Fee: Varies by country</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-1 md:col-span-3 flex justify-end mt-4">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isUpdating}
        >
          {isUpdating ? "Saving..." : "Save Gateway Settings"}
        </Button>
      </div>
    </div>
  );
};
