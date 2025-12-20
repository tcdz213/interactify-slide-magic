import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  MoreVertical,
  Bug,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Monitor,
  Smartphone,
  Server,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BarChart3,
} from 'lucide-react';
import { bugsApi } from '@/services/bugApi';
import { BugDialog } from '@/components/dialogs/BugDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { BugStatistics } from '@/components/bugs/BugStatistics';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Bug as BugType, BugStatus, BugSeverity, BugPlatform, CreateBugData, UpdateBugData } from '@/types/bug';

const STATUS_COLORS: Record<BugStatus, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  confirmed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  fixed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
  reopened: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  wont_fix: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  duplicate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
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
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-500',
};

const SEVERITY_LABELS: Record<BugSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const PLATFORM_ICONS: Record<BugPlatform, typeof Monitor> = {
  web: Monitor,
  android: Smartphone,
  ios: Smartphone,
  api: Server,
  desktop: Monitor,
};

const ALL_STATUSES: BugStatus[] = ['new', 'confirmed', 'in_progress', 'fixed', 'verified', 'closed', 'reopened', 'wont_fix', 'duplicate'];
const ALL_SEVERITIES: BugSeverity[] = ['low', 'medium', 'high', 'critical'];

export default function Bugs() {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState<BugType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<BugSeverity | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<BugType | null>(null);
  const [deleteBug, setDeleteBug] = useState<BugType | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState<'list' | 'statistics'>('list');

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const response = await bugsApi.list({
        page: pagination.page,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        search: search || undefined,
      });
      setBugs(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (error) {
      toast.error('Failed to load bugs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, [statusFilter, severityFilter, pagination.page]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pagination.page === 1) {
        fetchBugs();
      } else {
        setPagination((p) => ({ ...p, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleCreate = () => {
    setEditingBug(null);
    setDialogOpen(true);
  };

  const handleEdit = (bug: BugType) => {
    setEditingBug(bug);
    setDialogOpen(true);
  };

  const handleSave = async (data: CreateBugData | UpdateBugData) => {
    try {
      if (editingBug) {
        await bugsApi.update(editingBug.id, data as UpdateBugData);
        toast.success('Bug updated successfully');
      } else {
        await bugsApi.create(data as CreateBugData);
        toast.success('Bug reported successfully');
      }
      fetchBugs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save bug');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteBug) return;
    try {
      await bugsApi.delete(deleteBug.id);
      toast.success('Bug deleted successfully');
      setDeleteBug(null);
      fetchBugs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bug');
    }
  };

  const handleStatusChange = async (bug: BugType, status: BugStatus) => {
    try {
      await bugsApi.updateStatus(bug.id, status);
      toast.success('Status updated');
      fetchBugs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getRetestStatus = (bug: BugType) => {
    if (!bug.retestResults || bug.retestResults.length === 0) return null;
    const latest = bug.retestResults[0];
    return latest.status;
  };

  return (
    <DashboardLayout
      title="Bugs"
      description="Track and manage bug reports"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Report Bug
        </Button>
      }
    >
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'statistics')} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <Bug className="h-4 w-4" />
              Bug List
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bugs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BugStatus | 'all')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">All Status</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as BugSeverity | 'all')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">All Severity</SelectItem>
                {ALL_SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bugs List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-secondary rounded-lg" />
                    <div className="flex-1">
                      <div className="h-5 bg-secondary rounded w-1/3 mb-2" />
                      <div className="h-4 bg-secondary rounded w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : bugs.length === 0 ? (
            <Card className="p-12 text-center">
              <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No bugs found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No bugs reported yet - great job!'}
              </p>
              {!search && statusFilter === 'all' && severityFilter === 'all' && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {bugs.map((bug) => {
                const PlatformIcon = PLATFORM_ICONS[bug.platform];
                const retestStatus = getRetestStatus(bug);

            return (
              <Card 
                key={bug.id} 
                className="p-4 hover:border-primary/30 transition-colors group cursor-pointer"
                onClick={() => navigate(`/dashboard/bugs/${bug.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Severity Icon */}
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-red-500/10`}>
                    <Bug className={`h-5 w-5 ${SEVERITY_COLORS[bug.severity]}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{bug.title}</h3>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className={`h-4 w-4 ${SEVERITY_COLORS[bug.severity]}`} />
                        </TooltipTrigger>
                        <TooltipContent>{SEVERITY_LABELS[bug.severity]} Severity</TooltipContent>
                      </Tooltip>
                      {retestStatus && (
                        <Tooltip>
                          <TooltipTrigger>
                            {retestStatus === 'passed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            Last retest: {retestStatus === 'passed' ? 'Passed' : 'Failed'}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className={STATUS_COLORS[bug.status]}>
                        {STATUS_LABELS[bug.status]}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <PlatformIcon className="h-3 w-3" />
                        {bug.platform.toUpperCase()}
                      </Badge>

                      {bug.productName && (
                        <span className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {bug.productName}
                        </span>
                      )}

                      {bug.sprintName && (
                        <span className="flex items-center gap-1 text-primary/70">
                          <TestTube className="h-3 w-3" />
                          {bug.sprintName}
                        </span>
                      )}

                      {bug.environment && (
                        <Badge variant="outline" className="text-xs">
                          {bug.environment}
                        </Badge>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(bug.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {bug.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bug.description}</p>
                    )}
                  </div>

                  {/* Reporter/Assignee */}
                  <div className="flex items-center gap-2">
                    {bug.assigneeName && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                              {bug.assigneeName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>Assigned to: {bug.assigneeName}</TooltipContent>
                      </Tooltip>
                    )}
                    {bug.reporterName && !bug.assigneeName && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {bug.reporterName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>Reported by: {bug.reporterName}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/bugs/${bug.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(bug)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Change Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {ALL_STATUSES.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(bug, status)}
                              disabled={bug.status === status}
                            >
                              <Badge variant="outline" className={`mr-2 ${STATUS_COLORS[status]}`}>
                                {STATUS_LABELS[status]}
                              </Badge>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteBug(bug)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {bugs.length} of {pagination.total} bugs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <BugStatistics />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BugDialog open={dialogOpen} onOpenChange={setDialogOpen} bug={editingBug} onSave={handleSave} />

      <ConfirmDialog
        open={!!deleteBug}
        onOpenChange={(open) => !open && setDeleteBug(null)}
        title="Delete Bug"
        description={`Are you sure you want to delete "${deleteBug?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
