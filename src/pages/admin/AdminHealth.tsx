import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { systemHealthApi } from '@/services/systemHealthApi';
import { toast } from 'sonner';
import { 
  Activity, RefreshCw, Database, Server, Wifi, Clock, 
  AlertTriangle, CheckCircle, XCircle, HardDrive, Cpu, 
  MemoryStick, TrendingUp, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { HealthStatus } from '@/types/systemHealth';

const statusConfig: Record<HealthStatus, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Degraded' },
  unhealthy: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Unhealthy' },
  unknown: { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' },
};

export default function AdminHealth() {
  const queryClient = useQueryClient();

  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['admin-health'],
    queryFn: systemHealthApi.getHealth,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const triggerCheckMutation = useMutation({
    mutationFn: systemHealthApi.triggerHealthCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-health'] });
      toast.success('Health check completed');
    },
    onError: () => toast.error('Health check failed'),
  });

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const StatusBadge = ({ status }: { status: HealthStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={`${config.bg} ${config.color} border-0 gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout title="System Health" description="Monitor system performance and status">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Last updated: {health?.lastUpdated ? format(new Date(health.lastUpdated), 'PPp') : 'Never'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => triggerCheckMutation.mutate()} 
              disabled={triggerCheckMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              Run Health Check
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className={`border-2 ${health?.overall === 'healthy' ? 'border-green-500/30' : health?.overall === 'degraded' ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isLoading ? (
                  <Skeleton className="h-16 w-16 rounded-full" />
                ) : (
                  <div className={`p-4 rounded-full ${statusConfig[health?.overall || 'unknown'].bg}`}>
                    {(() => {
                      const Icon = statusConfig[health?.overall || 'unknown'].icon;
                      return <Icon className={`h-8 w-8 ${statusConfig[health?.overall || 'unknown'].color}`} />;
                    })()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">System Status</h2>
                  {!isLoading && health && <StatusBadge status={health.overall} />}
                </div>
              </div>
              {health?.api && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">{formatUptime(health.api.uptime)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Database Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </span>
                {isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : health?.database && (
                  <StatusBadge status={health.database.status} />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : health?.database && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-medium">{health.database.latency}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-medium">
                      {health.database.connections.active} / {health.database.connections.max}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Connection Usage</span>
                      <span>{Math.round((health.database.connections.active / health.database.connections.max) * 100)}%</span>
                    </div>
                    <Progress value={(health.database.connections.active / health.database.connections.max) * 100} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{health.database.size}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  API Server
                </span>
                {isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : health?.api && (
                  <StatusBadge status={health.api.status} />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : health?.api && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests/min</span>
                    <span className="font-medium">{health.api.requestsPerMinute}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Response</span>
                    <span className="font-medium">{health.api.averageResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Error Rate</span>
                    <span className={`font-medium ${health.api.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {health.api.errorRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Server Resources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-4 w-4" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : health?.resources ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Cpu className="h-3 w-3" /> CPU
                      </span>
                      <span>{health.resources.cpu.usage.toFixed(1)}%</span>
                    </div>
                    <Progress value={health.resources.cpu.usage} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" /> Memory
                      </span>
                      <span>{health.resources.memory.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={health.resources.memory.percentage} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <HardDrive className="h-3 w-3" /> Disk
                      </span>
                      <span>{health.resources.disk.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={health.resources.disk.percentage} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Resource metrics not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        {health?.services && health.services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Services
              </CardTitle>
              <CardDescription>External service connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {health.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.latency !== undefined && (
                        <p className="text-xs text-muted-foreground">{service.latency}ms</p>
                      )}
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Response Time
              </CardTitle>
              <CardDescription>API response time trends</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : health?.responseTimeMetrics && health.responseTimeMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={health.responseTimeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(v) => format(new Date(v), 'HH:mm')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(v) => format(new Date(v), 'PPp')}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" name="Average" dot={false} />
                    <Line type="monotone" dataKey="p95" stroke="hsl(var(--chart-2))" name="P95" dot={false} />
                    <Line type="monotone" dataKey="p99" stroke="hsl(var(--chart-3))" name="P99" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Error Rate
              </CardTitle>
              <CardDescription>Error rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : health?.errorMetrics && health.errorMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={health.errorMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(v) => format(new Date(v), 'HH:mm')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(v) => format(new Date(v), 'PPp')}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="errorRate" 
                      stroke="hsl(var(--destructive))" 
                      fill="hsl(var(--destructive) / 0.2)" 
                      name="Error Rate %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
