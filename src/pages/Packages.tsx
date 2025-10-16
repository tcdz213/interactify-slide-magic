import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePackages, useSubscribeToPackage } from "@/hooks/use-package";
import { useAuth } from "@/hooks/use-auth";
import { Package } from "@/types/package";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";

export default function Packages() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: packages, isLoading } = usePackages();
  const subscribeToPackage = useSubscribeToPackage();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSubscribe = async (pkg: Package) => {
    if (!isAuthenticated) {
      navigate('/profile');
      return;
    }

    setSelectedPackage(pkg.id);
    try {
      await subscribeToPackage.mutateAsync({ packageId: pkg.id });
      navigate('/profile');
    } finally {
      setSelectedPackage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Subscription Packages | Choose Your Plan"
        description="Explore our subscription packages and find the perfect plan for your business needs. From free to enterprise solutions."
      />

      <div className="min-h-screen bg-gradient-subtle flex flex-col">
        <div className="flex-1 container max-w-6xl mx-auto px-4 py-8">
          <BackButton />

          <div className="text-center mb-12 mt-6">
            <h1 className="text-4xl font-bold mb-4">Choose Your Perfect Plan</h1>
            <p className="text-xl text-muted-foreground">
              Unlock powerful features to grow your business presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages?.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative ${
                  pkg.tier === 'premium' ? 'border-primary shadow-elegant' : ''
                }`}
              >
                {pkg.tier === 'premium' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl capitalize">{pkg.name}</CardTitle>
                  <CardDescription className="capitalize">{pkg.tier} Plan</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">
                        {pkg.price > 0 ? `$${pkg.price}` : 'Free'}
                      </span>
                      {pkg.price > 0 && (
                        <span className="text-muted-foreground ml-2">/{pkg.interval}</span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">
                        <strong>{pkg.features.maxCards}</strong> business card{pkg.features.maxCards !== 1 ? 's' : ''}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">
                        <strong>{pkg.features.maxBoosts}</strong> boost{pkg.features.maxBoosts !== 1 ? 's' : ''} per month
                      </span>
                    </li>
                    {pkg.features.canExploreCards && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Explore all cards</span>
                      </li>
                    )}
                    {pkg.features.prioritySupport && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Priority support</span>
                      </li>
                    )}
                    {pkg.features.verificationBadge && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Verification badge</span>
                      </li>
                    )}
                    {pkg.features.advancedAnalytics && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Advanced analytics</span>
                      </li>
                    )}
                    {pkg.features.customBranding && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Custom branding</span>
                      </li>
                    )}
                    {pkg.features.apiAccess && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">API access</span>
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.tier === 'premium' ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(pkg)}
                    disabled={selectedPackage === pkg.id}
                  >
                    {selectedPackage === pkg.id ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : pkg.price === 0 ? (
                      'Get Started'
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              Need a custom solution? Contact us for enterprise pricing
            </p>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
