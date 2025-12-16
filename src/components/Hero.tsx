import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Now with AI-powered sprint planning
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-in">
          Ship software{" "}
          <span className="gradient-text">10x faster</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-delay" style={{ animationFillMode: 'forwards' }}>
          The complete product development platform for modern teams. 
          From ideation to production, DevCycle has you covered.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <Button variant="hero" size="xl">
            Start Building Free
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="hero-outline" size="xl">
            <Play className="w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-16 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by 5,000+ development teams worldwide
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map((company) => (
              <span
                key={company}
                className="text-muted-foreground/60 font-semibold text-lg hover:text-muted-foreground transition-colors"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
