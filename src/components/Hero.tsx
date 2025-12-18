import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-pulse-glow animate-delay-300" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/3 left-[15%] hidden lg:block">
        <div className="glass rounded-2xl p-4 animate-float shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sprint Velocity</p>
              <p className="font-semibold text-foreground">+42% this week</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/2 right-[12%] hidden lg:block">
        <div className="glass rounded-2xl p-4 animate-float animate-delay-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Security Score</p>
              <p className="font-semibold text-foreground">A+ Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">
            Now with AI-powered sprint planning
          </span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.1] mb-6 animate-fade-in text-balance">
          Ship software{" "}
          <span className="gradient-text">10x faster</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-delay text-balance" style={{ animationFillMode: 'forwards' }}>
          The complete product development platform for modern teams. 
          From ideation to production, DevCycle has you covered.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <Link to="/auth">
            <Button variant="hero" size="xl" className="group">
              Start Building Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="hero-outline" size="xl" className="group">
            <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Teams</p>
            </div>
            <div className="w-px h-12 bg-border hidden md:block" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">2M+</p>
              <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
            </div>
            <div className="w-px h-12 bg-border hidden md:block" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">99.9%</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime SLA</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          <p className="text-sm text-muted-foreground mb-6">
            Trusted by engineering teams at
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-60">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma", "Discord"].map((company) => (
              <span
                key={company}
                className="text-muted-foreground font-semibold text-lg hover:text-foreground transition-colors cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
