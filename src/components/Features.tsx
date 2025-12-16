import { Zap, GitBranch, BarChart3, Users, Shield, Rocket } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Feature Lifecycle",
    description: "Track features from ideation to deployment with voting, approval gates, and complete audit trails.",
  },
  {
    icon: Zap,
    title: "Agile Sprints",
    description: "Sprint planning with burndown charts, velocity tracking, and automated retrospective insights.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Custom dashboards with team metrics, cycle time analysis, and predictive delivery forecasting.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Role-based access, workload management, and seamless cross-team communication.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC2 compliant with SSO, audit logs, and granular permission controls.",
  },
  {
    icon: Rocket,
    title: "Release Management",
    description: "CI/CD integration, staged rollouts, and instant rollback capabilities.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Features
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground">
            Everything you need to ship faster
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for modern development teams. From planning to production.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
