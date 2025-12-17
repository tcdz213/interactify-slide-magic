import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAnalyticsOverview,
  useVelocityData,
  useBugResolutionData,
  useFeatureCompletionData,
  useTeamWorkloadData,
  useProductHealthData,
} from '@/hooks/useAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Bug, CheckCircle, Users, Activity, Target, Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8b5cf6'];

const Analytics = () => {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: velocityData, isLoading: velocityLoading } = useVelocityData();
  const { data: bugData, isLoading: bugLoading } = useBugResolutionData();
  const { data: featureData, isLoading: featureLoading } = useFeatureCompletionData();
  const { data: workloadData, isLoading: workloadLoading } = useTeamWorkloadData();
  const { data: healthData, isLoading: healthLoading } = useProductHealthData();

  return (
    <DashboardLayout title="Analytics" description="Project performance and team metrics">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Features</p>
                      <p className="text-2xl font-bold text-foreground">
                        {overview?.completedFeatures}/{overview?.totalFeatures}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Tasks Completed</p>
                      <p className="text-2xl font-bold text-foreground">
                        {overview?.completedTasks}/{overview?.totalTasks}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Bugs Resolved</p>
                      <p className="text-2xl font-bold text-foreground">
                        {overview?.resolvedBugs}/{overview?.totalBugs}
                      </p>
                    </div>
                    <Bug className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Avg Velocity</p>
                      <p className="text-2xl font-bold text-foreground">
                        {overview?.averageVelocity?.toFixed(1)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Velocity Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sprint Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {velocityLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="sprintName" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="planned" fill="hsl(var(--muted-foreground))" name="Planned" />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bug Resolution */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-orange-500" />
                Bug Resolution Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bugLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={bugData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="opened" stroke="#ef4444" name="Opened" />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Feature Completion */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Feature Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {featureLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={featureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="planned" fill="hsl(var(--muted-foreground))" name="Planned" />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Workload */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workloadLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                {workloadData?.map((member) => (
                  <div key={member.memberId} className="flex items-center gap-4">
                    <div className="w-32 truncate text-sm text-foreground">{member.memberName}</div>
                    <div className="flex-1">
                      <Progress value={member.utilizationPercent} className="h-2" />
                    </div>
                    <div className="w-20 text-right text-sm text-muted-foreground">
                      {member.utilizationPercent.toFixed(0)}%
                    </div>
                    <div className="w-24 text-right text-xs text-muted-foreground">
                      {member.tasksCount} tasks, {member.bugsCount} bugs
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Health */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Product Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthData?.map((product) => (
                  <Card key={product.productId} className="bg-background/50 border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-foreground">{product.productName}</h3>
                        <div
                          className={`text-lg font-bold ${
                            product.healthScore >= 80
                              ? 'text-green-500'
                              : product.healthScore >= 60
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                        >
                          {product.healthScore}%
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Open Bugs</span>
                          <span>{product.openBugs}</span>
                        </div>
                        {product.criticalBugs > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Critical
                            </span>
                            <span>{product.criticalBugs}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Features In Progress</span>
                          <span>{product.featuresInProgress}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
