import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { tasksApi } from '@/services/taskApi';
import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { TaskDependencyDialog } from '@/components/dialogs/TaskDependencyDialog';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Tag,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Link2,
} from 'lucide-react';
import type { UpdateTaskData } from '@/types/task';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-muted text-muted-foreground' },
  todo: { label: 'To Do', color: 'bg-secondary text-secondary-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
  in_review: { label: 'In Review', color: 'bg-purple-500/20 text-purple-400' },
  testing: { label: 'Testing', color: 'bg-orange-500/20 text-orange-400' },
  done: { label: 'Done', color: 'bg-green-500/20 text-green-400' },
  blocked: { label: 'Blocked', color: 'bg-destructive/20 text-destructive' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  critical: { label: 'Critical', color: 'bg-destructive/20 text-destructive' },
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dependencyDialogOpen, setDependencyDialogOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [timeLogData, setTimeLogData] = useState({ hours: '', date: '', description: '' });

  // Fetch task
  const { data: taskData, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(id!),
    enabled: !!id,
  });

  // Fetch time logs
  const { data: timeLogsData } = useQuery({
    queryKey: ['task-time-logs', id],
    queryFn: () => tasksApi.getTimeLogs(id!),
    enabled: !!id,
  });

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ['task-comments', id],
    queryFn: () => tasksApi.getComments(id!),
    enabled: !!id,
  });

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: (data: UpdateTaskData) => tasksApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast({ title: 'Task updated' });
      setEditDialogOpen(false);
    },
  });

  const addSubtaskMutation = useMutation({
    mutationFn: (title: string) => tasksApi.addSubtask(id!, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setNewSubtask('');
      toast({ title: 'Subtask added' });
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => tasksApi.toggleSubtask(id!, subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => tasksApi.deleteSubtask(id!, subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast({ title: 'Subtask deleted' });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] });
      setNewComment('');
      toast({ title: 'Comment added' });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => tasksApi.deleteComment(id!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] });
      toast({ title: 'Comment deleted' });
    },
  });

  const logTimeMutation = useMutation({
    mutationFn: (data: { hours: number; date: string; description?: string }) => 
      tasksApi.logTime(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-time-logs', id] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setTimeLogData({ hours: '', date: '', description: '' });
      toast({ title: 'Time logged' });
    },
  });

  const task = taskData?.data;
  const timeLogs = timeLogsData?.data || [];
  const comments = commentsData?.data || [];

  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout title="Task Not Found">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task not found</h2>
          <Button onClick={() => navigate('/dashboard/tasks')}>Go to Tasks</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.backlog;
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      addSubtaskMutation.mutate(newSubtask.trim());
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLogData.hours && timeLogData.date) {
      logTimeMutation.mutate({
        hours: parseFloat(timeLogData.hours),
        date: timeLogData.date,
        description: timeLogData.description || undefined,
      });
    }
  };

  return (
    <DashboardLayout title="Task Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/tasks')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
                <Badge variant="outline">{task.type}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDependencyDialogOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              Dependencies ({task.dependencies?.length || 0})
            </Button>
            <Button onClick={() => setEditDialogOpen(true)}>Edit Task</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {task.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="subtasks">
              <TabsList>
                <TabsTrigger value="subtasks">
                  Subtasks ({task.subtasks?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="timelogs">
                  Time Logs ({timeLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subtasks" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {/* Add subtask form */}
                    <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add a subtask..."
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                      />
                      <Button type="submit" size="icon" disabled={addSubtaskMutation.isPending}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </form>

                    {/* Subtask list */}
                    <div className="space-y-2">
                      {task.subtasks?.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => toggleSubtaskMutation.mutate(subtask.id)}
                          />
                          <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                            {subtask.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-8 w-8"
                            onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(!task.subtasks || task.subtasks.length === 0) && (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No subtasks yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {/* Add comment form */}
                    <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <Button type="submit" size="icon" disabled={addCommentMutation.isPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-4">
                      {comments.map((comment: any) => (
                        <div key={comment.id} className="border-b border-border pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No comments yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timelogs" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {/* Log time form */}
                    <form onSubmit={handleLogTime} className="grid grid-cols-3 gap-2 mb-4">
                      <Input
                        type="number"
                        placeholder="Hours"
                        step="0.5"
                        min="0.1"
                        max="24"
                        value={timeLogData.hours}
                        onChange={(e) => setTimeLogData({ ...timeLogData, hours: e.target.value })}
                        required
                      />
                      <Input
                        type="date"
                        value={timeLogData.date}
                        onChange={(e) => setTimeLogData({ ...timeLogData, date: e.target.value })}
                        required
                      />
                      <Button type="submit" disabled={logTimeMutation.isPending}>
                        Log Time
                      </Button>
                    </form>
                    <Input
                      placeholder="Description (optional)"
                      value={timeLogData.description}
                      onChange={(e) => setTimeLogData({ ...timeLogData, description: e.target.value })}
                      className="mb-4"
                    />

                    {/* Time logs list */}
                    <div className="space-y-2">
                      {timeLogs.map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <div>
                            <span className="font-medium">{log.hours}h</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                            {log.description && (
                              <p className="text-sm text-muted-foreground">{log.description}</p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{log.userName}</span>
                        </div>
                      ))}
                      {timeLogs.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No time logged yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.assigneeName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.assigneeName}</span>
                  </div>
                )}

                {task.sprintName && (
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.sprintName}</span>
                  </div>
                )}

                {task.featureTitle && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.featureTitle}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {task.loggedHours || 0}h / {task.estimatedHours || 0}h
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}

                {task.labels && task.labels.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {task.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={task}
        onSave={async (data) => {
          await updateTaskMutation.mutateAsync(data as UpdateTaskData);
        }}
      />

      <TaskDependencyDialog
        open={dependencyDialogOpen}
        onOpenChange={setDependencyDialogOpen}
        task={task}
      />
    </DashboardLayout>
  );
}
