import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
} from 'lucide-react';
import { bugsApi } from '@/services/bugApi';
import type { BugStatus, BugSeverity } from '@/types/bug';

interface BugStatisticsProps {
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const STATUS_COLORS: Record<BugStatus, string> = {
  new: 'bg-blue-500',
  confirmed: 'bg-purple-500',
  in_progress: 'bg-amber-500',
  fixed: 'bg-cyan-500',
  verified: 'bg-emerald-500',
  closed: 'bg-green-500',
  reopened: 'bg-orange-500',
  wont_fix: 'bg-gray-500',
  duplicate: 'bg-slate-500',
};

const STATUS_LABELS: Record<BugStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  verified: 'Verified',
  closed: 'Closed',
  reopened: 'Reopened',
  wont_fix: "Won't Fix",
  duplicate: 'Duplicate',
};

const SEVERITY_COLORS: Record<BugSeverity, string> = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const SEVERITY_LABELS: Record<BugSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function BugStatistics({ productId, dateFrom, dateTo }: BugStatisticsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bug-statistics', productId, dateFrom, dateTo],
    queryFn: () => bugsApi.getStatistics({ productId, dateFrom, dateTo }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <Card className="p-6 text-center">
        <Bug className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Failed to load bug statistics</p>
      </Card>
    );
  }

  const stats = data.data;
  const resolutionHours = Math.round(stats.averageResolutionTime / (1000 * 60 * 60));
  const resolutionDays = Math.round(resolutionHours / 24);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Total Bugs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Critical Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">{stats.criticalOpen}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-green-500">
              {Math.round(stats.resolutionRate)}%
            </p>
            <Progress value={stats.resolutionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Avg. Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-amber-500">
              {resolutionDays > 0 ? `${resolutionDays}d` : `${resolutionHours}h`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Bugs by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byStatus)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[status as BugStatus]}`} />
                          {STATUS_LABELS[status as BugStatus]}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
              {Object.values(stats.byStatus).every((v) => v === 0) && (
                <p className="text-muted-foreground text-sm text-center py-4">No bug data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Bugs by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.bySeverity)
                .filter(([, count]) => count > 0)
                .sort(([a], [b]) => {
                  const order = { critical: 0, high: 1, medium: 2, low: 3 };
                  return order[a as BugSeverity] - order[b as BugSeverity];
                })
                .map(([severity, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={severity} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${SEVERITY_COLORS[severity as BugSeverity]}`} />
                          {SEVERITY_LABELS[severity as BugSeverity]}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
              {Object.values(stats.bySeverity).every((v) => v === 0) && (
                <p className="text-muted-foreground text-sm text-center py-4">No bug data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open vs Closed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Open vs Closed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Open Bugs</p>
                <p className="text-2xl font-bold">{stats.openBugs}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Closed Bugs</p>
                <p className="text-2xl font-bold">{stats.closedBugs}</p>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="h-4 rounded-full bg-muted overflow-hidden flex">
                <div 
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.openBugs / stats.total) * 100 : 0}%` }}
                />
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.closedBugs / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
