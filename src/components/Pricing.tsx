import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out DevCycle",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 3 products",
      "Up to 5 team members",
      "Basic analytics",
      "5GB storage",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more",
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
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Unlimited products",
      "Unlimited team members",
      "Advanced analytics",
      "Unlimited storage",
      "Dedicated support",
      "SSO & SAML",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      
      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free and scale as you grow. No hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-card border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isYearly ? 'bg-primary-foreground/20' : 'bg-primary/20 text-primary'
              }`}>
                -16%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-500 ${
                plan.popular
                  ? "bg-card border-2 border-primary shadow-lg shadow-primary/10 scale-105 z-10"
                  : "bg-card border border-border hover:border-primary/30"
              } card-hover`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-5xl font-bold text-foreground">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                    {isYearly && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ${Math.round(plan.yearlyPrice! / 12)}/month billed annually
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button 
                  variant={plan.popular ? "hero" : "outline"} 
                  size="lg" 
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Trial notice */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          All paid plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
