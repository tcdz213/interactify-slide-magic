import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  ListTodo, 
  Bug, 
  Rocket, 
  Users, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApi.getActivityFeed({ limit: 5 }),
  });

  const { data: sprintSummary, isLoading: sprintsLoading } = useQuery({
    queryKey: ['dashboard', 'sprint-summary'],
    queryFn: dashboardApi.getSprintSummary,
  });

  const statCards = [
    { label: 'Active Sprints', value: stats?.activeSprints, icon: Zap, color: 'text-blue-500' },
    { label: 'Pending Tasks', value: stats?.pendingTasks, icon: ListTodo, color: 'text-amber-500' },
    { label: 'Open Bugs', value: stats?.openBugs, icon: Bug, color: 'text-red-500' },
    { label: 'Upcoming Releases', value: stats?.upcomingReleases, icon: Rocket, color: 'text-green-500' },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'completed':
      case 'fixed':
      case 'approved':
        return 'bg-green-500/10 text-green-500';
      case 'created':
      case 'started':
        return 'bg-blue-500/10 text-blue-500';
      case 'updated':
        return 'bg-amber-500/10 text-amber-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout
      title="Overview"
      description="Welcome back! Here's what's happening with your projects."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {statsLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stat.value ?? 0}</p>
                )}
              </div>
              <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Team Availability & Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Team Availability</h3>
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Available</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  {stats?.teamAvailability?.available ?? 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Busy</span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  {stats?.teamAvailability?.busy ?? 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Away</span>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  {stats?.teamAvailability?.away ?? 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Offline</span>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {stats?.teamAvailability?.offline ?? 0}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Today's Activity</h3>
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasks Completed</span>
                <span className="font-semibold text-green-500">
                  {stats?.recentActivity?.tasksCompletedToday ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bugs Fixed</span>
                <span className="font-semibold text-blue-500">
                  {stats?.recentActivity?.bugsFixedToday ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Features Approved</span>
                <span className="font-semibold text-purple-500">
                  {stats?.recentActivity?.featuresApprovedToday ?? 0}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Activity Feed & Sprint Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          {activityLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity?.data?.length ? (
            <div className="space-y-4">
              {activity.data.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.userAvatar} alt={item.userName} />
                    <AvatarFallback>{item.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">
                      <span className="font-medium">{item.userName}</span>{' '}
                      <Badge variant="outline" className={`text-xs ${getActionColor(item.action)}`}>
                        {item.action}
                      </Badge>{' '}
                      <span className="text-muted-foreground">{item.entityType}</span>
                    </p>
                    <p className="text-muted-foreground truncate">{item.entityTitle}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Active Sprints</h3>
          {sprintsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : sprintSummary?.activeSprints?.length ? (
            <div className="space-y-5">
              {sprintSummary.activeSprints.map((sprint) => (
                <div key={sprint.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sprint.name}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {sprint.daysRemaining} days left
                    </div>
                  </div>
                  <Progress value={sprint.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{sprint.tasksCompleted}/{sprint.tasksTotal} tasks</span>
                    <span>Velocity: {sprint.velocity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active sprints</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
