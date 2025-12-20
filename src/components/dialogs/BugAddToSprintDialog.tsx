import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Unlink } from 'lucide-react';
import { sprintsApi } from '@/services/sprintApi';
import type { Sprint } from '@/types/sprint';
import { format } from 'date-fns';

interface BugAddToSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSprintId?: string;
  currentSprintName?: string;
  productId?: string;
  onAddToSprint: (sprintId: string) => Promise<void>;
  onRemoveFromSprint: () => Promise<void>;
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export function BugAddToSprintDialog({
  open,
  onOpenChange,
  currentSprintId,
  currentSprintName,
  productId,
  onAddToSprint,
  onRemoveFromSprint,
}: BugAddToSprintDialogProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSprints();
    }
  }, [open, productId]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const response = await sprintsApi.list({
        productId: productId || undefined,
        status: ['planning', 'active'],
        limit: 50,
      });
      setSprints(response.data);
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedSprintId) return;
    try {
      setSubmitting(true);
      await onAddToSprint(selectedSprintId);
      onOpenChange(false);
      setSelectedSprintId('');
    } catch (error) {
      console.error('Failed to add to sprint:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    try {
      setSubmitting(true);
      await onRemoveFromSprint();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to remove from sprint:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Add to Sprint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentSprintId && (
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">Currently in sprint:</p>
              <div className="flex items-center justify-between">
                <span className="font-medium">{currentSprintName}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4 mr-2" />}
                  Remove
                </Button>
              </div>
            </div>
          )}

          <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sprint" />
            </SelectTrigger>
            <SelectContent className="max-h-64 z-[200]">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : sprints.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No available sprints found
                </div>
              ) : (
                sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[180px]">{sprint.name}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[sprint.status] || ''}`}>
                        {sprint.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!selectedSprintId || submitting}
            className="w-full sm:w-auto"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add to Sprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
