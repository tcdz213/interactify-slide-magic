import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Shield, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { AdminStats } from "@/services/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DashboardTabProps {
  stats: AdminStats;
  loading: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  loading 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  loading: boolean;
}) => (
  <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          <div className="text-3xl font-bold mb-1">{value}</div>
          {trend && trendValue && (
            <div className="flex items-center gap-1 text-xs">
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={trend === 'up' ? 'text-success' : 'text-destructive'}>
                {trendValue}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

export const DashboardTab = ({ stats, loading }: DashboardTabProps) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue={`+${stats.monthlyGrowth}%`}
          loading={loading}
        />
        <StatCard
          title="Total Cards"
          value={stats.totalCards}
          icon={CreditCard}
          loading={loading}
        />
        <StatCard
          title="Verified Cards"
          value={stats.verifiedCards}
          icon={Shield}
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          trend="up"
          trendValue="+12%"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Premium Users</span>
              <Badge variant="secondary">{stats.premiumUsers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
              <Badge variant="destructive">{stats.pendingReviews}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Reports</span>
              <Badge variant="outline">{stats.totalReports}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">New user registration</span>
                <span className="ml-auto text-xs text-muted-foreground">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Card verified</span>
                <span className="ml-auto text-xs text-muted-foreground">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-muted-foreground">New subscription</span>
                <span className="ml-auto text-xs text-muted-foreground">12 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - Line chart for monthly growth
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - Pie chart for subscriptions
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
