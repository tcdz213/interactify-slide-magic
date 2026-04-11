import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Package, ArrowRight, Building2, Truck, BarChart3 } from 'lucide-react';

const features = [
  { icon: Building2, title: 'Multi-Tenant', desc: 'Isolated data per company with shared infrastructure' },
  { icon: Package, title: 'Smart Catalog', desc: 'Multi-unit products with dynamic segment pricing' },
  { icon: Truck, title: 'Full Logistics', desc: 'Order lifecycle from draft to delivery & settlement' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Revenue tracking, inventory, and operations KPIs' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              B2B Distribution Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              DistroSaaS
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              The complete B2B distribution management platform. Multi-tenant, multi-unit, dynamic pricing — everything your distribution business needs.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  Super Admin
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/business">
                  <Package className="h-4 w-4" />
                  Business Manager
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="rounded-lg bg-primary/10 p-2.5 w-fit mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
