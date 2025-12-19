import { Zap, GitBranch, BarChart3, Users, Shield, Rocket, ArrowRight } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: GitBranch,
    title: "Feature Lifecycle",
    description: "Track features from ideation to deployment with stakeholder voting, approval gates, and complete audit trails.",
    color: "primary",
    highlight: "End-to-end visibility",
  },
  {
    icon: Zap,
    title: "Agile Sprints",
    description: "Sprint planning with burndown charts, velocity tracking, and automated retrospective insights.",
    color: "accent",
    highlight: "Built for agile teams",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Custom dashboards with team metrics, cycle time analysis, and predictive delivery forecasting.",
    color: "primary",
    highlight: "Data-driven decisions",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Role-based access, workload management, and seamless cross-team communication.",
    color: "accent",
    highlight: "Work together, ship faster",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC2 compliant with SSO, audit logs, and granular permission controls.",
    color: "primary",
    highlight: "Enterprise-ready",
  },
  {
    icon: Rocket,
    title: "Release Management",
    description: "CI/CD integration, staged rollouts, and instant rollback capabilities.",
    color: "accent",
    highlight: "Ship with confidence",
  },
];

export function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="features" className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Everything you need to{" "}
            <span className="gradient-text">ship faster</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            A complete toolkit designed for modern development teams. From planning to production, we've got you covered.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 md:p-8 rounded-2xl bg-card border border-border transition-all duration-500 hover:border-primary/40 card-hover cursor-default"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ 
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Glow Effect on Hover */}
              <div 
                className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: `radial-gradient(400px circle at 50% 50%, hsl(var(--${feature.color}) / 0.1), transparent 60%)`
                }}
              />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${
                  feature.color === 'accent' 
                    ? 'bg-accent/10 group-hover:bg-accent/20' 
                    : 'bg-primary/10 group-hover:bg-primary/20'
                }`}>
                  <feature.icon className={`w-7 h-7 ${feature.color === 'accent' ? 'text-accent' : 'text-primary'}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  {feature.title}
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Highlight Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  feature.color === 'accent'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {feature.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
