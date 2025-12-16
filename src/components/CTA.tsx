import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Ready to transform your{" "}
          <span className="gradient-text">development workflow?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of teams shipping better software, faster. 
          Start your free trial today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="xl">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="hero-outline" size="xl">
            Talk to Sales
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
