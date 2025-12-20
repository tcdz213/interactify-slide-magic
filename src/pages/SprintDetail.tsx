import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  Plus,
  MoreVertical,
  Play,
  CheckCircle2,
  Bug,
  CheckSquare,
  ArrowRight,
  GripVertical,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SprintRetrospective } from '@/components/sprint/SprintRetrospective';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { sprintsApi } from '@/services/sprintApi';
import { tasksApi } from '@/services/taskApi';
import { bugsApi } from '@/services/bugApi';
import { toast } from 'sonner';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import type { Sprint, SprintStatus, SprintMetrics } from '@/types/sprint';
import type { Task, TaskStatus } from '@/types/task';
import type { Bug as BugType, BugStatus } from '@/types/bug';

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

const TASK_COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'backlog', label: 'Backlog', color: 'bg-muted' },
  { status: 'todo', label: 'To Do', color: 'bg-slate-500/20' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20' },
  { status: 'in_review', label: 'Review', color: 'bg-purple-500/20' },
  { status: 'testing', label: 'Testing', color: 'bg-orange-500/20' },
  { status: 'done', label: 'Done', color: 'bg-green-500/20' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

// Draggable Task Card Component
function DraggableTaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: TaskStatus) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-grab hover:border-primary/50 transition-colors ${isDragging ? 'ring-2 ring-primary' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Link
            to={`/dashboard/tasks/${task.id}`}
            className="font-medium text-sm hover:text-primary line-clamp-2"
            onClick={(e) => e.stopPropagation()}
          >
            {task.title}
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </Badge>
            {task.assigneeName && (
              <span className="text-xs text-muted-foreground truncate">
                {task.assigneeName}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TASK_COLUMNS.filter(c => c.status !== task.status).map((col) => (
              <DropdownMenuItem
                key={col.status}
                onClick={() => onStatusChange(task.id, col.status)}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Move to {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

// Droppable Column Component
function DroppableColumn({ status, label, color, children }: { status: TaskStatus; label: string; color: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="min-w-[200px]">
      <div className={`rounded-t-lg px-3 py-2 ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{label}</h3>
        </div>
      </div>
      <ScrollArea
        ref={setNodeRef}
        className={`h-[500px] bg-muted/30 rounded-b-lg p-2 transition-colors ${isOver ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}`}
      >
        <div className="space-y-2">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function SprintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [metrics, setMetrics] = useState<SprintMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<BugType[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [backlogBugs, setBacklogBugs] = useState<BugType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [sprintRes, metricsRes, tasksRes, bugsRes] = await Promise.all([
        sprintsApi.getById(id),
        sprintsApi.getMetrics(id),
        tasksApi.list({ sprintId: id, limit: 100 }),
        bugsApi.list({ sprintId: id, limit: 100 }),
      ]);
      setSprint(sprintRes.data);
      setMetrics(metricsRes.data);
      setTasks(tasksRes.data);
      setBugs(bugsRes.data);

      // Fetch backlog items (not assigned to any sprint)
      const [backlogTasksRes, backlogBugsRes] = await Promise.all([
        tasksApi.list({ status: 'backlog', limit: 50 }),
        bugsApi.list({ status: 'new', limit: 50 }),
      ]);
      setBacklogTasks(backlogTasksRes.data.filter(t => !t.sprintId));
      setBacklogBugs(backlogBugsRes.data.filter(b => !b.sprintId));
    } catch (error) {
      toast.error('Failed to load sprint details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getSprintProgress = () => {
    if (!sprint) return 0;
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const now = new Date();
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;
    
    const total = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    return Math.round((elapsed / total) * 100);
  };

  const getDaysRemaining = () => {
    if (!sprint) return 0;
    const end = new Date(sprint.endDate);
    const now = new Date();
    const days = differenceInDays(end, now);
    return days > 0 ? days : 0;
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleAddTaskToSprint = async (taskId: string) => {
    if (!id) return;
    try {
      await sprintsApi.addTask(id, taskId);
      const task = backlogTasks.find(t => t.id === taskId);
      if (task) {
        setTasks([...tasks, { ...task, sprintId: id }]);
        setBacklogTasks(backlogTasks.filter(t => t.id !== taskId));
      }
      toast.success('Task added to sprint');
    } catch (error) {
      toast.error('Failed to add task to sprint');
    }
  };

  const handleAddBugToSprint = async (bugId: string) => {
    if (!id) return;
    try {
      await sprintsApi.addBug(id, bugId);
      const bug = backlogBugs.find(b => b.id === bugId);
      if (bug) {
        setBugs([...bugs, { ...bug, sprintId: id }]);
        setBacklogBugs(backlogBugs.filter(b => b.id !== bugId));
      }
      toast.success('Bug added to sprint');
    } catch (error) {
      toast.error('Failed to add bug to sprint');
    }
  };

  const handleRemoveTaskFromSprint = async (taskId: string) => {
    if (!id) return;
    try {
      await sprintsApi.removeTask(id, taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setBacklogTasks([...backlogTasks, { ...task, sprintId: undefined }]);
        setTasks(tasks.filter(t => t.id !== taskId));
      }
      toast.success('Task removed from sprint');
    } catch (error) {
      toast.error('Failed to remove task from sprint');
    }
  };

  const handleRemoveBugFromSprint = async (bugId: string) => {
    if (!id) return;
    try {
      await sprintsApi.removeBug(id, bugId);
      const bug = bugs.find(b => b.id === bugId);
      if (bug) {
        setBacklogBugs([...backlogBugs, { ...bug, sprintId: undefined }]);
        setBugs(bugs.filter(b => b.id !== bugId));
      }
      toast.success('Bug removed from sprint');
    } catch (error) {
      toast.error('Failed to remove bug from sprint');
    }
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      handleTaskStatusChange(taskId, newStatus);
    }
  };

  if (loading || !sprint) {
    return (
      <DashboardLayout title="Sprint Details" description="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary rounded-lg" />
          <div className="h-64 bg-secondary rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={sprint.name}
      description={sprint.goal}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/sprints')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {sprint.status === 'planning' && (
            <Button onClick={async () => {
              try {
                await sprintsApi.start(id!);
                toast.success('Sprint started');
                fetchData();
              } catch (error) {
                toast.error('Failed to start sprint');
              }
            }}>
              <Play className="h-4 w-4 mr-2" />
              Start Sprint
            </Button>
          )}
          {sprint.status === 'active' && (
            <Button onClick={async () => {
              try {
                await sprintsApi.complete(id!);
                toast.success('Sprint completed');
                fetchData();
              } catch (error) {
                toast.error('Failed to complete sprint');
              }
            }}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Sprint
            </Button>
          )}
        </div>
      }
    >
      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="outline" className={STATUS_COLORS[sprint.status]}>
                  {STATUS_LABELS[sprint.status]}
                </Badge>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">
                  {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">{getDaysRemaining()} days left</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <Progress value={getSprintProgress()} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-lg font-semibold">
                  {tasks.length} tasks • {bugs.length} bugs
                </p>
              </div>
              <CheckSquare className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="board">Task Board</TabsTrigger>
          <TabsTrigger value="burndown">Burndown Chart</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="retrospective">Retrospective</TabsTrigger>
        </TabsList>

        {/* Kanban Board */}
        <TabsContent value="board" className="mt-6">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
              {TASK_COLUMNS.map((column) => (
                <DroppableColumn
                  key={column.status}
                  status={column.status}
                  label={column.label}
                  color={column.color}
                >
                  <Badge variant="secondary" className="text-xs mb-2 w-full justify-center">
                    {getTasksByStatus(column.status).length} items
                  </Badge>
                  {getTasksByStatus(column.status).map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </DroppableColumn>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <Card className="p-3 cursor-grabbing shadow-lg border-primary">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{activeTask.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[activeTask.priority]}`}>
                          {activeTask.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Bugs Section */}
          {bugs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Sprint Bugs ({bugs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {bugs.map((bug) => (
                  <Card key={bug.id} className="p-3">
                    <Link
                      to={`/dashboard/bugs/${bug.id}`}
                      className="font-medium text-sm hover:text-primary line-clamp-2"
                    >
                      {bug.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[bug.severity]}`}>
                        {bug.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {bug.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Burndown Chart */}
        <TabsContent value="burndown" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Burndown</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.burndownData && metrics.burndownData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={metrics.burndownData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      name="Ideal"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="remaining"
                      name="Actual"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No burndown data available yet.</p>
                    <p className="text-sm">Start the sprint to track progress.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sprint Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{metrics.totalPoints}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Completed Points</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.completedPoints}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold">
                    {metrics.completedTasks}/{metrics.totalTasks}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Bugs Fixed</p>
                  <p className="text-2xl font-bold">
                    {metrics.fixedBugs}/{metrics.totalBugs}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Backlog Management */}
        <TabsContent value="backlog" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sprint Backlog */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sprint Backlog</span>
                  <Badge>{tasks.length + bugs.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                          <div>
                            <Link
                              to={`/dashboard/tasks/${task.id}`}
                              className="font-medium text-sm hover:text-primary"
                            >
                              {task.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTaskFromSprint(task.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {bugs.map((bug) => (
                      <div
                        key={bug.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Bug className="h-4 w-4 text-red-500" />
                          <div>
                            <Link
                              to={`/dashboard/bugs/${bug.id}`}
                              className="font-medium text-sm hover:text-primary"
                            >
                              {bug.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[bug.severity]}`}>
                                {bug.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {bug.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBugFromSprint(bug.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {tasks.length === 0 && bugs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No items in sprint backlog</p>
                        <p className="text-sm">Add items from the product backlog</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Product Backlog */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Product Backlog</span>
                  <Badge variant="secondary">{backlogTasks.length + backlogBugs.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {backlogTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTaskToSprint(task.id)}
                          disabled={sprint.status !== 'planning'}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                    {backlogBugs.map((bug) => (
                      <div
                        key={bug.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Bug className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="font-medium text-sm">{bug.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[bug.severity]}`}>
                                {bug.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddBugToSprint(bug.id)}
                          disabled={sprint.status !== 'planning'}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                    {backlogTasks.length === 0 && backlogBugs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No items in product backlog</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {sprint.status !== 'planning' && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Note:</strong> Adding items to the sprint is only available during the planning phase.
            </div>
          )}
        </TabsContent>

        {/* Retrospective */}
        <TabsContent value="retrospective" className="mt-6">
          <SprintRetrospective sprintId={id!} sprintStatus={sprint.status} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
