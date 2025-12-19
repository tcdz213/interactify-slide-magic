import { CheckCircle2, Layers, GitBranch, BarChart3, Users, Rocket, Shield } from "lucide-react";

const benefits = [
  {
    icon: Layers,
    title: "Unified Platform",
    description: "Stop switching between tools. Manage features, sprints, tasks, and releases all in one place.",
    color: "primary",
  },
  {
    icon: GitBranch,
    title: "Complete Traceability",
    description: "Every feature, task, and bug is linked. Know exactly what shipped in each release.",
    color: "accent",
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description: "Real-time dashboards show team velocity, cycle time, and bottlenecks at a glance.",
    color: "primary",
  },
  {
    icon: Users,
    title: "Built for Teams",
    description: "Role-based permissions, approval workflows, and workload balancing for teams of any size.",
    color: "accent",
  },
  {
    icon: Rocket,
    title: "Ship with Confidence",
    description: "Staged rollouts, feature flags, and instant rollback keep your releases safe.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "SOC2 compliance, SSO integration, and granular audit logs for regulated industries.",
    color: "accent",
  },
];

const capabilities = [
  "Feature ideation & voting",
  "Multi-stage approval gates",
  "Sprint planning & tracking",
  "Task & bug management",
  "Burndown & velocity charts",
  "CI/CD pipeline integration",
  "Release notes generation",
  "Custom analytics dashboards",
  "Team workload management",
  "API access & webhooks",
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Why DevCycle</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Built for <span className="gradient-text">modern teams</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything your product team needs to go from idea to shipped feature.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                benefit.color === 'accent' 
                  ? 'bg-accent/10' 
                  : 'bg-primary/10'
              }`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color === 'accent' ? 'text-accent' : 'text-primary'}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Capabilities List */}
        <div className="relative p-8 md:p-12 rounded-3xl bg-card/30 border border-border backdrop-blur-sm">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              All the capabilities you need
            </h3>
            <p className="text-muted-foreground">
              From planning to production, DevCycle covers your entire workflow.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {capabilities.map((capability) => (
              <div
                key={capability}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
