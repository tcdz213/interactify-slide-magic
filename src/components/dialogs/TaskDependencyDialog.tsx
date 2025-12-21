import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { tasksApi } from '@/services/taskApi';
import { ArrowRight, ArrowLeft, Plus, Trash2, Loader2, Search } from 'lucide-react';
import type { Task, TaskDependency, DependencyType } from '@/types/task';

interface TaskDependencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export function TaskDependencyDialog({ open, onOpenChange, task }: TaskDependencyDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [dependencyType, setDependencyType] = useState<DependencyType>('blocked_by');

  // Fetch all tasks for selection
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => tasksApi.list({ limit: 100 }),
    enabled: open,
  });

  const addDependencyMutation = useMutation({
    mutationFn: ({ dependsOnTaskId, type }: { dependsOnTaskId: string; type: DependencyType }) =>
      tasksApi.addDependency(task.id, dependsOnTaskId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      toast({ title: 'Dependency added' });
      setSelectedTaskId('');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: (dependencyTaskId: string) => tasksApi.removeDependency(task.id, dependencyTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      toast({ title: 'Dependency removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const availableTasks = tasksData?.data?.filter(
    (t) =>
      t.id !== task.id &&
      !task.dependencies?.some((d) => d.taskId === t.id) &&
      t.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const blockedByDeps = task.dependencies?.filter((d) => d.type === 'blocked_by') || [];
  const blocksDeps = task.dependencies?.filter((d) => d.type === 'blocks') || [];

  const handleAddDependency = () => {
    if (!selectedTaskId) return;
    addDependencyMutation.mutate({ dependsOnTaskId: selectedTaskId, type: dependencyType });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Dependencies</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Dependency */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add Dependency</h4>
            <div className="flex gap-2">
              <Select value={dependencyType} onValueChange={(v) => setDependencyType(v as DependencyType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked_by">Blocked By</SelectItem>
                  <SelectItem value="blocks">Blocks</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {tasksLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                {availableTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No available tasks
                  </p>
                ) : (
                  availableTasks.slice(0, 10).map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 ${
                        selectedTaskId === t.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => setSelectedTaskId(t.id)}
                    >
                      <span className="text-sm truncate">{t.title}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {t.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            <Button
              onClick={handleAddDependency}
              disabled={!selectedTaskId || addDependencyMutation.isPending}
              className="w-full"
            >
              {addDependencyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Dependency
            </Button>
          </div>

          {/* Current Dependencies */}
          <div className="space-y-4">
            {/* Blocked By */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 text-destructive" />
                Blocked By ({blockedByDeps.length})
              </h4>
              {blockedByDeps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No blocking dependencies</p>
              ) : (
                <div className="space-y-2">
                  {blockedByDeps.map((dep) => (
                    <div
                      key={dep.taskId}
                      className="flex items-center justify-between p-2 bg-destructive/10 rounded border border-destructive/20"
                    >
                      <span className="text-sm">{dep.taskTitle}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeDependencyMutation.mutate(dep.taskId)}
                        disabled={removeDependencyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blocks */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-amber-500" />
                Blocks ({blocksDeps.length})
              </h4>
              {blocksDeps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not blocking any tasks</p>
              ) : (
                <div className="space-y-2">
                  {blocksDeps.map((dep) => (
                    <div
                      key={dep.taskId}
                      className="flex items-center justify-between p-2 bg-amber-500/10 rounded border border-amber-500/20"
                    >
                      <span className="text-sm">{dep.taskTitle}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeDependencyMutation.mutate(dep.taskId)}
                        disabled={removeDependencyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
