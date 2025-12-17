import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Zap, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle2,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import { sprintsApi } from '@/services/sprintApi';
import { SprintDialog } from '@/components/dialogs/SprintDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import type { Sprint, SprintStatus, CreateSprintData, UpdateSprintData } from '@/types/sprint';

const STATUS_COLORS: Record<SprintStatus, string> = {
  planning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<SprintStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function Sprints() {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SprintStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deleteSprint, setDeleteSprint] = useState<Sprint | null>(null);
  const [actionSprint, setActionSprint] = useState<{ sprint: Sprint; action: 'start' | 'complete' } | null>(null);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const response = await sprintsApi.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setSprints(response.data);
    } catch (error) {
      toast.error('Failed to load sprints');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [statusFilter]);

  const filteredSprints = sprints.filter((sprint) =>
    sprint.name.toLowerCase().includes(search.toLowerCase()) ||
    sprint.goal.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingSprint(null);
    setDialogOpen(true);
  };

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setDialogOpen(true);
  };

  const handleSave = async (data: CreateSprintData | UpdateSprintData) => {
    try {
      if (editingSprint) {
        await sprintsApi.update(editingSprint.id, data as UpdateSprintData);
        toast.success('Sprint updated successfully');
      } else {
        await sprintsApi.create(data as CreateSprintData);
        toast.success('Sprint created successfully');
      }
      fetchSprints();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save sprint');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteSprint) return;
    try {
      await sprintsApi.delete(deleteSprint.id);
      toast.success('Sprint deleted successfully');
      setDeleteSprint(null);
      fetchSprints();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sprint');
    }
  };

  const handleStartComplete = async () => {
    if (!actionSprint) return;
    try {
      if (actionSprint.action === 'start') {
        await sprintsApi.start(actionSprint.sprint.id);
        toast.success('Sprint started successfully');
      } else {
        await sprintsApi.complete(actionSprint.sprint.id);
        toast.success('Sprint completed successfully');
      }
      setActionSprint(null);
      fetchSprints();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionSprint.action} sprint`);
    }
  };

  const getSprintProgress = (sprint: Sprint) => {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const now = new Date();
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;
    
    const total = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    return Math.round((elapsed / total) * 100);
  };

  const getDaysRemaining = (sprint: Sprint) => {
    const end = new Date(sprint.endDate);
    const now = new Date();
    const days = differenceInDays(end, now);
    return days > 0 ? days : 0;
  };

  return (
    <DashboardLayout
      title="Sprints"
      description="Manage your agile sprints and track progress"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SprintStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sprints Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
              <div className="h-4 bg-secondary rounded w-full mb-2" />
              <div className="h-4 bg-secondary rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : filteredSprints.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No sprints found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first sprint'}
          </p>
          {!search && statusFilter === 'all' && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSprints.map((sprint) => (
            <Card 
              key={sprint.id} 
              className="p-6 hover:border-primary/30 transition-colors group cursor-pointer"
              onClick={() => navigate(`/dashboard/sprints/${sprint.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{sprint.name}</h3>
                    {sprint.productName && (
                      <p className="text-xs text-muted-foreground">{sprint.productName}</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {sprint.status === 'planning' && (
                      <>
                        <DropdownMenuItem onClick={() => handleEdit(sprint)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActionSprint({ sprint, action: 'start' })}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Sprint
                        </DropdownMenuItem>
                      </>
                    )}
                    {sprint.status === 'active' && (
                      <DropdownMenuItem onClick={() => setActionSprint({ sprint, action: 'complete' })}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Sprint
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteSprint(sprint)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Badge variant="outline" className={`mb-3 ${STATUS_COLORS[sprint.status]}`}>
                {STATUS_LABELS[sprint.status]}
              </Badge>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {sprint.goal}
              </p>

              {/* Date Range */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                </span>
              </div>

              {/* Progress for active sprints */}
              {sprint.status === 'active' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">{getDaysRemaining(sprint)} days left</span>
                  </div>
                  <Progress value={getSprintProgress(sprint)} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{sprint.taskIds.length} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{sprint.bugIds.length} bugs</span>
                </div>
                {sprint.velocity !== null && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{sprint.velocity} pts</span>
                  </div>
                )}
                {sprint.capacity > 0 && sprint.velocity === null && (
                  <span>{sprint.capacity}h capacity</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <SprintDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sprint={editingSprint}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteSprint}
        onOpenChange={(open) => !open && setDeleteSprint(null)}
        title="Delete Sprint"
        description={`Are you sure you want to delete "${deleteSprint?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!actionSprint}
        onOpenChange={(open) => !open && setActionSprint(null)}
        title={actionSprint?.action === 'start' ? 'Start Sprint' : 'Complete Sprint'}
        description={
          actionSprint?.action === 'start'
            ? `Are you sure you want to start "${actionSprint?.sprint.name}"? Once started, you won't be able to edit sprint details.`
            : `Are you sure you want to complete "${actionSprint?.sprint.name}"? This will calculate the final velocity.`
        }
        confirmLabel={actionSprint?.action === 'start' ? 'Start' : 'Complete'}
        onConfirm={handleStartComplete}
      />
    </DashboardLayout>
  );
}
