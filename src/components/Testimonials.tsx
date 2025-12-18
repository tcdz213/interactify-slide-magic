import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "DevCycle has transformed how our team ships software. We've reduced our release cycle from weeks to days.",
    author: "Sarah Chen",
    role: "VP of Engineering",
    company: "TechCorp",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "The sprint planning features are incredible. Our velocity has increased by 40% since switching to DevCycle.",
    author: "Marcus Johnson",
    role: "Engineering Manager",
    company: "StartupXYZ",
    avatar: "MJ",
    rating: 5,
  },
  {
    quote: "Finally, a tool that understands modern development workflows. The integration with our CI/CD pipeline is seamless.",
    author: "Emily Rodriguez",
    role: "Lead Developer",
    company: "CloudScale",
    avatar: "ER",
    rating: 5,
  },
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
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Loved by <span className="gradient-text">teams worldwide</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See what engineering teams are saying about DevCycle.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="group relative p-8 rounded-2xl bg-card border border-border transition-all duration-500 hover:border-primary/30 card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
