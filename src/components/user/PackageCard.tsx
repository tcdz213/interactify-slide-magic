import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCurrentSubscription, usePackageUsage } from "@/hooks/use-package";
import { Check, Crown, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";

export const PackageCard = () => {
  const { data: subscription, isLoading: subLoading } = useCurrentSubscription();
  const { data: usage, isLoading: usageLoading } = usePackageUsage();

  if (subLoading || usageLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>Choose a plan to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Browse Plans</Button>
        </CardContent>
      </Card>
    );
  }

  const pkg = subscription.package;
  const cardsProgress = usage ? (usage.cardsCreated / usage.maxCards) * 100 : 0;
  const boostsProgress = usage ? (usage.boostsUsed / usage.maxBoosts) * 100 : 0;

  return (
    <Card className="relative overflow-hidden">
      {pkg.tier !== 'free' && (
        <div className="absolute top-4 right-4">
          <Crown className="w-6 h-6 text-primary" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {pkg.name}
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
            </CardTitle>
            <CardDescription className="capitalize">{pkg.tier} Plan</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {pkg.price > 0 ? `${pkg.currency} ${pkg.price}` : 'Free'}
            </div>
            {pkg.price > 0 && (
              <div className="text-xs text-muted-foreground">per {pkg.interval}</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Usage Statistics */}
        {usage && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Cards Created</span>
                <span className="font-medium">
                  {usage.cardsCreated} / {usage.maxCards}
                </span>
              </div>
              <Progress value={cardsProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Boosts Used</span>
                <span className="font-medium">
                  {usage.boostsUsed} / {usage.maxBoosts}
                </span>
              </div>
              <Progress value={boostsProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Plan Features:</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              Up to {pkg.features.maxCards} business cards
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              {pkg.features.maxBoosts} boosts per month
            </li>
            {pkg.features.prioritySupport && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Priority support
              </li>
            )}
            {pkg.features.verificationBadge && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Verification badge
              </li>
            )}
            {pkg.features.advancedAnalytics && (
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Advanced analytics
              </li>
            )}
          </ul>
        </div>

        {/* Subscription Period */}
        {subscription.status === 'active' && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? (
                <span className="text-destructive">
                  Cancels {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true })}
                </span>
              ) : (
                <span>
                  Renews {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {pkg.tier === 'free' ? (
            <Button className="w-full" variant="default">
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1">
                Change Plan
              </Button>
              {!subscription.cancelAtPeriodEnd && (
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
