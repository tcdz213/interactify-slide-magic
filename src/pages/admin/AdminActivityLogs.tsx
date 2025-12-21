import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { activityLogApi } from '@/services/activityLogApi';
import { 
  Activity, Search, Download, Filter, Clock, User, 
  LogIn, LogOut, Plus, Pencil, Trash2, Eye, FileDown, 
  FileUp, CheckCircle, XCircle, Rocket, RotateCcw, 
  Settings, Shield, Key, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import type { ActivityAction, ResourceType } from '@/types/activityLog';

const actionIcons: Record<ActivityAction, typeof Activity> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Pencil,
  delete: Trash2,
  view: Eye,
  export: FileDown,
  import: FileUp,
  approve: CheckCircle,
  reject: XCircle,
  deploy: Rocket,
  rollback: RotateCcw,
  settings_change: Settings,
  role_change: Shield,
  password_change: Key,
  '2fa_enable': Shield,
  '2fa_disable': Shield,
};

const actionColors: Record<ActivityAction, string> = {
  login: 'bg-green-500/20 text-green-500',
  logout: 'bg-muted text-muted-foreground',
  create: 'bg-blue-500/20 text-blue-500',
  update: 'bg-yellow-500/20 text-yellow-500',
  delete: 'bg-red-500/20 text-red-500',
  view: 'bg-muted text-muted-foreground',
  export: 'bg-purple-500/20 text-purple-500',
  import: 'bg-purple-500/20 text-purple-500',
  approve: 'bg-green-500/20 text-green-500',
  reject: 'bg-red-500/20 text-red-500',
  deploy: 'bg-blue-500/20 text-blue-500',
  rollback: 'bg-orange-500/20 text-orange-500',
  settings_change: 'bg-muted text-muted-foreground',
  role_change: 'bg-amber-500/20 text-amber-500',
  password_change: 'bg-muted text-muted-foreground',
  '2fa_enable': 'bg-green-500/20 text-green-500',
  '2fa_disable': 'bg-red-500/20 text-red-500',
};

export default function AdminActivityLogs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-activity-logs', page, limit, actionFilter, resourceFilter],
    queryFn: () => activityLogApi.getAll({
      page,
      limit,
      action: actionFilter !== 'all' ? actionFilter as ActivityAction : undefined,
      resourceType: resourceFilter !== 'all' ? resourceFilter as ResourceType : undefined,
    }),
  });

  const filteredLogs = data?.data?.filter(log => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(searchLower) ||
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.resourceName?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const formatAction = (action: ActivityAction) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <AdminLayout title="Activity Logs" description="Monitor user activity across the platform">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, email, or resource..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="deploy">Deploy</SelectItem>
                  <SelectItem value="rollback">Rollback</SelectItem>
                  <SelectItem value="role_change">Role Change</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="sprint">Sprint</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              {data?.pagination?.total || 0} total activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No activity logs found</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredLogs.map((log) => {
                    const ActionIcon = actionIcons[log.action] || Activity;
                    const actionColor = actionColors[log.action] || 'bg-muted text-muted-foreground';
                    
                    return (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${actionColor}`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={log.userAvatar} />
                              <AvatarFallback className="text-xs">
                                {log.userName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{log.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatAction(log.action)}
                            </Badge>
                            {log.resourceType && (
                              <Badge variant="secondary" className="text-xs">
                                {log.resourceType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.details || `${formatAction(log.action)} ${log.resourceName || log.resourceType || ''}`}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.createdAt), 'PPp')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.userEmail}
                            </span>
                            {log.ipAddress && (
                              <span className="hidden sm:inline">IP: {log.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <PaginationControls
            page={page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            limit={limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </AdminLayout>
  );
}
