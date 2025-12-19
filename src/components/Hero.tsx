import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Layers, GitBranch, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-pulse-glow animate-delay-300" />
      
      {/* Floating Elements - Feature Highlights */}
      <div className="absolute top-1/3 left-[10%] hidden lg:block">
        <div className="glass rounded-2xl p-4 animate-float shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Feature Lifecycle</p>
              <p className="font-semibold text-foreground text-sm">Ideation → Production</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/2 right-[8%] hidden lg:block">
        <div className="glass rounded-2xl p-4 animate-float animate-delay-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sprint Management</p>
              <p className="font-semibold text-foreground text-sm">Plan, Track, Ship</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1/3 left-[15%] hidden xl:block">
        <div className="glass rounded-2xl p-4 animate-float animate-delay-400 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Release Pipeline</p>
              <p className="font-semibold text-foreground text-sm">Automated CI/CD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">
            AI-powered sprint planning included
          </span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.1] mb-6 animate-fade-in text-balance">
          Where ideas become{" "}
          <span className="gradient-text">shipped products</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 opacity-0 animate-fade-in-delay text-balance" style={{ animationFillMode: 'forwards' }}>
          The complete product development platform that unifies your feature lifecycle, 
          sprint management, team collaboration, and release pipeline in one place.
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

        {/* Value Props instead of fake stats */}
        <div className="mt-16 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm">Free tier available</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">Setup in minutes</span>
            </div>
          </div>
        </div>

        {/* Product Preview Teaser */}
        <div className="mt-16 opacity-0 animate-fade-in-delay" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          <div className="relative mx-auto max-w-4xl">
            <div className="glass rounded-2xl p-1 shadow-2xl">
              <div className="bg-card rounded-xl overflow-hidden">
                {/* Mock Dashboard Preview */}
                <div className="bg-secondary/50 px-4 py-2 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">DevCycle Dashboard</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="text-xs text-muted-foreground mb-1">Current Sprint</div>
                      <div className="text-sm font-semibold text-foreground">Sprint 24 - Q4 Release</div>
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-accent/5 border border-accent/10">
                      <div className="text-xs text-muted-foreground mb-1">Features in Progress</div>
                      <div className="flex gap-1 mt-2">
                        <div className="h-2 flex-1 rounded-full bg-primary/60" />
                        <div className="h-2 w-8 rounded-full bg-accent/40" />
                        <div className="h-2 w-12 rounded-full bg-muted" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="w-full h-16 rounded bg-gradient-to-br from-primary/10 to-transparent" />
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="w-full h-16 rounded bg-gradient-to-br from-accent/10 to-transparent" />
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="w-full h-16 rounded bg-gradient-to-br from-primary/10 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect behind preview */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
