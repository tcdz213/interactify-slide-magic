import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "For individuals and small teams getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 3 products",
      "Up to 5 team members",
      "Basic analytics",
      "5GB storage",
      "Community support",
    ],
    limits: {
      products: 3,
      teamMembers: 5,
      featuresPerMonth: 50,
      storage: "5GB",
      advancedAnalytics: false,
      customWorkflows: false,
      prioritySupport: false,
      sso: false,
      apiAccess: false,
    },
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more power",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "Up to 10 products",
      "Up to 20 team members",
      "Advanced analytics",
      "50GB storage",
      "Priority support",
      "API access",
    ],
    limits: {
      products: 10,
      teamMembers: 20,
      featuresPerMonth: 200,
      storage: "50GB",
      advancedAnalytics: true,
      customWorkflows: false,
      prioritySupport: true,
      sso: false,
      apiAccess: true,
    },
    cta: "Start Free Trial",
    variant: "hero" as const,
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For larger teams with advanced needs",
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      "Up to 50 products",
      "Up to 100 team members",
      "Advanced analytics",
      "Custom workflows",
      "200GB storage",
      "Priority support",
      "API access",
    ],
    limits: {
      products: 50,
      teamMembers: 100,
      featuresPerMonth: 1000,
      storage: "200GB",
      advancedAnalytics: true,
      customWorkflows: true,
      prioritySupport: true,
      sso: false,
      apiAccess: true,
    },
    cta: "Start Free Trial",
    variant: "outline" as const,
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with custom requirements",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      "Unlimited products",
      "Unlimited team members",
      "Advanced analytics",
      "Custom workflows",
      "Unlimited storage",
      "Dedicated support",
      "SSO integration",
      "API access",
      "Custom integrations",
    ],
    limits: {
      products: -1,
      teamMembers: -1,
      featuresPerMonth: -1,
      storage: "Unlimited",
      advancedAnalytics: true,
      customWorkflows: true,
      prioritySupport: true,
      sso: true,
      apiAccess: true,
    },
    cta: "Contact Sales",
    variant: "outline" as const,
    popular: false,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees. Save ~16% with annual billing.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
              <span className="ml-1.5 text-xs text-primary font-semibold">Save 16%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-2 border-primary shadow-lg shadow-primary/10 scale-105 z-10"
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {plan.monthlyPrice > 0 && (
                  <span className="text-muted-foreground text-sm">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                )}
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ${Math.round(plan.yearlyPrice / 12)}/month billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Limits indicators */}
              <div className="mb-6 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Plan limits:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {plan.limits.advancedAnalytics ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Analytics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {plan.limits.apiAccess ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">API</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {plan.limits.customWorkflows ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Workflows</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {plan.limits.sso ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">SSO</span>
                  </div>
                </div>
              </div>

              <Button variant={plan.variant} size="lg" className="w-full">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Trial notice */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          All paid plans include a 14-day free trial. No payment method required during trial.
        </p>
      </div>
    </section>
  );
}
