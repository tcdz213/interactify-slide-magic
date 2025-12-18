import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* CTA Card */}
        <div className="relative p-12 md:p-16 rounded-3xl bg-card/50 border border-border backdrop-blur-sm text-center">
          {/* Decorative Elements */}
          <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute bottom-6 right-6 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">14-day free trial</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Ready to transform your{" "}
            <span className="gradient-text">workflow?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
            Join thousands of teams shipping better software, faster. 
            Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl">
              Schedule a Demo
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
