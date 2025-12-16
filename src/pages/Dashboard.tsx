import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Package, Sparkles, Bug, Zap, Users, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Active Products', value: '12', icon: Package, trend: '+2 this month' },
  { label: 'Features', value: '48', icon: Sparkles, trend: '+8 this week' },
  { label: 'Open Bugs', value: '7', icon: Bug, trend: '-3 from last week' },
  { label: 'Active Sprints', value: '3', icon: Zap, trend: '2 ending soon' },
  { label: 'Team Members', value: '24', icon: Users, trend: '+1 new member' },
  { label: 'Velocity', value: '42', icon: TrendingUp, trend: '+12% improvement' },
];

export default function Dashboard() {
  return (
    <DashboardLayout
      title="Overview"
      description="Welcome back! Here's what's happening with your projects."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs">U{i}</span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground">User completed task #{i}</p>
                  <p className="text-muted-foreground text-xs">{i * 10} minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {['Sprint 23 ends', 'Release v2.0', 'Feature review', 'Bug triage'].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0">
                <span>{item}</span>
                <span className="text-muted-foreground">{i + 1} days</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
