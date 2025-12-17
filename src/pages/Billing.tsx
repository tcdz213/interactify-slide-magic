import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Check,
  CreditCard,
  Download,
  Star,
  Trash2,
  Crown,
  Zap,
  Building2,
  Rocket,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/services/billingApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Plan } from '@/types/billing';

export default function Billing() {
  const queryClient = useQueryClient();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: billingApi.getPlans,
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: billingApi.getSubscription,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: billingApi.getUsage,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: billingApi.getInvoices,
  });

  const { data: paymentMethods, isLoading: pmLoading } = useQuery({
    queryKey: ['billing', 'payment-methods'],
    queryFn: billingApi.getPaymentMethods,
  });

  const updateSubscription = useMutation({
    mutationFn: billingApi.updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Plan updated successfully');
      setSelectedPlan(null);
    },
    onError: () => toast.error('Failed to update plan'),
  });

  const cancelSubscription = useMutation({
    mutationFn: billingApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Subscription cancelled');
      setShowCancelDialog(false);
    },
    onError: () => toast.error('Failed to cancel subscription'),
  });

  const setDefaultPM = useMutation({
    mutationFn: billingApi.setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'payment-methods'] });
      toast.success('Default payment method updated');
    },
    onError: () => toast.error('Failed to set default'),
  });

  const deletePM = useMutation({
    mutationFn: billingApi.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'payment-methods'] });
      toast.success('Payment method removed');
    },
    onError: () => toast.error('Failed to remove payment method'),
  });

  const currentPlan = plans?.find((p) => p.id === subscription?.planId);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Zap;
      case 'pro': return Rocket;
      case 'team': return Building2;
      case 'enterprise': return Crown;
      default: return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'trial': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout title="Billing" description="Manage your subscription and billing details">
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Current Subscription */}
          {subLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : subscription && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {currentPlan && <div className="h-6 w-6 text-primary">{(() => { const Icon = getPlanIcon(currentPlan.id); return <Icon />; })()}</div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{currentPlan?.name || 'Free'} Plan</h3>
                      <Badge variant="outline" className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subscription.interval === 'yearly' ? 'Billed annually' : 'Billed monthly'} · 
                      Renews {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {subscription.status === 'active' && subscription.planId !== 'free' && (
                  <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                    Cancel Plan
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <Label className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>Monthly</Label>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <Label className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Yearly <span className="text-green-500 text-xs">(Save ~16%)</span>
            </Label>
          </div>

          {/* Plans Grid */}
          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans?.map((plan) => {
                const Icon = getPlanIcon(plan.id);
                const isCurrentPlan = subscription?.planId === plan.id;
                const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                
                return (
                  <Card
                    key={plan.id}
                    className={`p-6 relative flex flex-col ${plan.popular ? 'border-primary ring-1 ring-primary' : ''} ${isCurrentPlan ? 'bg-primary/5' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1" /> Popular
                        </Badge>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold">${price}</span>
                      <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'secondary'}
                      disabled={isCurrentPlan}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          {usageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : usage && currentPlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h4 className="font-medium mb-4">Products</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.products} used</span>
                    <span className="text-muted-foreground">
                      {currentPlan.limits.products === -1 ? 'Unlimited' : `${currentPlan.limits.products} limit`}
                    </span>
                  </div>
                  {currentPlan.limits.products !== -1 && (
                    <Progress value={(usage.products / currentPlan.limits.products) * 100} />
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-medium mb-4">Team Members</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.teamMembers} members</span>
                    <span className="text-muted-foreground">
                      {currentPlan.limits.teamMembers === -1 ? 'Unlimited' : `${currentPlan.limits.teamMembers} limit`}
                    </span>
                  </div>
                  {currentPlan.limits.teamMembers !== -1 && (
                    <Progress value={(usage.teamMembers / currentPlan.limits.teamMembers) * 100} />
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-medium mb-4">Features This Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.features} created</span>
                    <span className="text-muted-foreground">
                      {currentPlan.limits.featuresPerMonth === -1 ? 'Unlimited' : `${currentPlan.limits.featuresPerMonth} limit`}
                    </span>
                  </div>
                  {currentPlan.limits.featuresPerMonth !== -1 && (
                    <Progress value={(usage.features / currentPlan.limits.featuresPerMonth) * 100} />
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-medium mb-4">Storage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{(usage.storage / 1024 / 1024 / 1024).toFixed(2)} GB used</span>
                    <span className="text-muted-foreground">{currentPlan.limits.storage}</span>
                  </div>
                  <Progress value={20} />
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Payment Methods</h3>
              <Button size="sm">Add Card</Button>
            </div>

            {pmLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : paymentMethods?.length ? (
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {pm.brand} •••• {pm.last4}
                          {pm.isDefault && (
                            <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {pm.expiryMonth}/{pm.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!pm.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefaultPM.mutate(pm.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pm.isDefault}
                        onClick={() => deletePM.mutate(pm.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No payment methods added</p>
            )}
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Billing History</h3>
            
            {invoicesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : invoices?.length ? (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          invoice.status === 'paid'
                            ? 'bg-green-500/10 text-green-500'
                            : invoice.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                        }
                      >
                        {invoice.status}
                      </Badge>
                      {invoice.invoiceUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No invoices yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Plan Dialog */}
      <AlertDialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change to {selectedPlan?.name} Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPlan && subscription && (
                plans?.findIndex((p) => p.id === selectedPlan.id)! >
                plans?.findIndex((p) => p.id === subscription.planId)!
                  ? 'Your upgrade will take effect immediately. You will be charged a prorated amount.'
                  : 'Your downgrade will take effect at the end of your current billing period.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPlan && updateSubscription.mutate({ planId: selectedPlan.id })}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of your current billing period.
              You can reactivate anytime before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelSubscription.mutate()}
            >
              Cancel Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
