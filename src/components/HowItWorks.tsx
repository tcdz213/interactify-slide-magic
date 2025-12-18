import { Lightbulb, Code2, Rocket, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    step: "01",
    title: "Plan & Prioritize",
    description: "Capture ideas, prioritize features with stakeholder voting, and create a clear product roadmap.",
  },
  {
    icon: Code2,
    step: "02",
    title: "Build & Track",
    description: "Break down features into sprints, assign tasks, and track progress with real-time burndown charts.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Review & Approve",
    description: "Multi-stage approval workflows ensure quality gates are met before any code hits production.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Deploy & Monitor",
    description: "Seamless CI/CD integration with staged rollouts and instant rollback capabilities.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-card/30">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            From idea to <span className="gradient-text">production</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A streamlined workflow that guides your team from concept to deployment.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              <div className="relative p-6 rounded-2xl bg-card border border-border transition-all duration-500 hover:border-primary/40 card-hover text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5 mt-2 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
