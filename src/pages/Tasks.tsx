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
  Plus, 
  Search, 
  MoreVertical, 
  CheckSquare, 
  Edit, 
  Trash2, 
  Clock,
  Calendar,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { tasksApi } from '@/services/taskApi';
import { teamApi } from '@/services/teamApi';
import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Task, TaskStatus, TaskType, TaskPriority, CreateTaskData, UpdateTaskData } from '@/types/task';
import type { TeamMember } from '@/types/team';

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  todo: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  testing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  done: 'bg-green-500/20 text-green-400 border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  testing: 'Testing',
  done: 'Done',
  blocked: 'Blocked',
};

const TYPE_COLORS: Record<TaskType, string> = {
  frontend: 'bg-cyan-500/20 text-cyan-400',
  backend: 'bg-emerald-500/20 text-emerald-400',
  mobile_android: 'bg-green-500/20 text-green-400',
  mobile_ios: 'bg-gray-500/20 text-gray-400',
  api: 'bg-violet-500/20 text-violet-400',
  design: 'bg-pink-500/20 text-pink-400',
  qa: 'bg-amber-500/20 text-amber-400',
  devops: 'bg-indigo-500/20 text-indigo-400',
  documentation: 'bg-teal-500/20 text-teal-400',
  other: 'bg-slate-500/20 text-slate-400',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

const ALL_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'testing', 'done', 'blocked'];

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksApi.list({
        page: pagination.page,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        assigneeId: assigneeFilter !== 'all' ? assigneeFilter : undefined,
        search: search || undefined,
      });
      setTasks(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, typeFilter, priorityFilter, assigneeFilter, pagination.page]);

  // Fetch team members for quick assign
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamApi.list({ limit: 100 });
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Failed to load team members');
      }
    };
    fetchTeamMembers();
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pagination.page === 1) {
        fetchTasks();
      } else {
        setPagination(p => ({ ...p, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSave = async (data: CreateTaskData | UpdateTaskData) => {
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, data as UpdateTaskData);
        toast.success('Task updated successfully');
      } else {
        await tasksApi.create(data as CreateTaskData);
        toast.success('Task created successfully');
      }
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save task');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      await tasksApi.delete(deleteTask.id);
      toast.success('Task deleted successfully');
      setDeleteTask(null);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await tasksApi.updateStatus(task.id, status);
      toast.success('Status updated');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleQuickAssign = async (task: Task, assigneeId: string) => {
    try {
      await tasksApi.assign(task.id, assigneeId);
      toast.success('Task assigned');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign task');
    }
  };

  const handleUnassign = async (task: Task) => {
    try {
      await tasksApi.unassign(task.id);
      toast.success('Task unassigned');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unassign task');
    }
  };

  return (
    <DashboardLayout
      title="Tasks"
      description="Manage development tasks and track progress"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TaskType | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="qa">QA</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="documentation">Docs</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
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
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'}
          </p>
          {!search && statusFilter === 'all' && typeFilter === 'all' && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="p-4 hover:border-primary/30 transition-colors group cursor-pointer"
              onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${TYPE_COLORS[task.type]}`}>
                  <CheckSquare className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{task.title}</h3>
                    <AlertCircle className={`h-4 w-4 ${PRIORITY_COLORS[task.priority]}`} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className={STATUS_COLORS[task.status]}>
                      {STATUS_LABELS[task.status]}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {task.type.replace('_', ' ')}
                    </Badge>
                    
                    {task.sprintName && (
                      <span className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {task.sprintName}
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    
                    {(task.loggedHours > 0 || task.estimatedHours) && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.loggedHours}h{task.estimatedHours ? ` / ${task.estimatedHours}h` : ''}
                      </span>
                    )}
                  </div>

                  {/* Labels */}
                  {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.labels.map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Subtasks progress */}
                  {task.subtasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <CheckSquare className="h-3 w-3" />
                      {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} subtasks
                    </div>
                  )}
                </div>

                {/* Assignee */}
                {task.assigneeName && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.assigneeAvatar} />
                    <AvatarFallback className="text-xs">
                      {task.assigneeName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(task)}>
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
                            onClick={() => handleStatusChange(task, status)}
                            disabled={task.status === status}
                          >
                            <Badge variant="outline" className={`mr-2 ${STATUS_COLORS[status]}`}>
                              {STATUS_LABELS[status]}
                            </Badge>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Quick Assign
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {task.assigneeId && (
                          <>
                            <DropdownMenuItem onClick={() => handleUnassign(task)}>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Unassign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {teamMembers.length === 0 ? (
                          <DropdownMenuItem disabled>
                            No team members
                          </DropdownMenuItem>
                        ) : (
                          teamMembers.map((member) => (
                            <DropdownMenuItem
                              key={member.id}
                              onClick={() => handleQuickAssign(task, member.userId)}
                              disabled={task.assigneeId === member.userId}
                            >
                              <Avatar className="h-5 w-5 mr-2">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {member.name}
                              {task.assigneeId === member.userId && (
                                <span className="ml-auto text-xs text-muted-foreground">Assigned</span>
                              )}
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteTask(task)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {tasks.length} of {pagination.total} tasks
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
