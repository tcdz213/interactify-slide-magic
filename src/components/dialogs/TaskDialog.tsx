import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, CreateTaskData, UpdateTaskData, TaskType, TaskPriority } from '@/types/task';
import { productsApi } from '@/services/productApi';
import { sprintsApi } from '@/services/sprintApi';
import { featuresApi } from '@/services/featureApi';

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'mobile_android', label: 'Android' },
  { value: 'mobile_ios', label: 'iOS' },
  { value: 'api', label: 'API' },
  { value: 'design', label: 'Design' },
  { value: 'qa', label: 'QA' },
  { value: 'devops', label: 'DevOps' },
  { value: 'documentation', label: 'Docs' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
}

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'frontend' as TaskType,
    priority: 'medium' as TaskPriority,
    estimatedHours: '',
    dueDate: '',
    labels: '',
    productId: '',
    sprintId: '',
    featureId: '',
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => productsApi.list({ limit: 100, status: 'active' }),
    enabled: open,
  });

  // Fetch sprints filtered by product
  const { data: sprintsData } = useQuery({
    queryKey: ['sprints-list', formData.productId],
    queryFn: () => sprintsApi.list({ 
      limit: 100, 
      productId: formData.productId || undefined,
      status: ['planning', 'active'],
    }),
    enabled: open,
  });

  // Fetch features filtered by product
  const { data: featuresData } = useQuery({
    queryKey: ['features-list', formData.productId],
    queryFn: () => featuresApi.list({ 
      limit: 100, 
      productId: formData.productId || undefined,
    }),
    enabled: open,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        estimatedHours: task.estimatedHours?.toString() || '',
        dueDate: task.dueDate || '',
        labels: task.labels.join(', '),
        productId: '',
        sprintId: task.sprintId || '',
        featureId: task.featureId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'frontend',
        priority: 'medium',
        estimatedHours: '',
        dueDate: '',
        labels: '',
        productId: '',
        sprintId: '',
        featureId: '',
      });
    }
  }, [task, open]);

  const handleProductChange = (productId: string) => {
    setFormData({ 
      ...formData, 
      productId, 
      sprintId: '', 
      featureId: '' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CreateTaskData | UpdateTaskData = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        labels: formData.labels ? formData.labels.split(',').map(l => l.trim()).filter(Boolean) : undefined,
        sprintId: formData.sprintId || undefined,
        featureId: formData.featureId || undefined,
      };

      if (!task && formData.dueDate) {
        (data as CreateTaskData).dueDate = formData.dueDate;
      }

      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const products = productsData?.data || [];
  const sprints = sprintsData?.data || [];
  const features = featuresData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details' : 'Add a new task to your project'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description"
              rows={3}
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as TaskType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product, Sprint, Feature Selection */}
          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={formData.productId}
                onValueChange={handleProductChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sprint</Label>
                <Select
                  value={formData.sprintId}
                  onValueChange={(v) => setFormData({ ...formData, sprintId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Feature</Label>
                <Select
                  value={formData.featureId}
                  onValueChange={(v) => setFormData({ ...formData, featureId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feature..." />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map((feature) => (
                      <SelectItem key={feature.id} value={feature.id}>
                        {feature.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                max="999"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="8"
              />
            </div>

            {!task && (
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <Input
              id="labels"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              placeholder="ui, settings, accessibility (comma-separated)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
