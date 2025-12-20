import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Zap } from 'lucide-react';
import { sprintsApi } from '@/services/sprintApi';
import { featuresApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Sprint } from '@/types/sprint';

interface FeatureSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureId: string;
  featureTitle: string;
  currentSprintId?: string;
  currentSprintName?: string;
  onSuccess?: () => void;
}

export function FeatureSprintDialog({
  open,
  onOpenChange,
  featureId,
  featureTitle,
  currentSprintId,
  currentSprintName,
  onSuccess,
}: FeatureSprintDialogProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>(currentSprintId || '');
  const [loading, setLoading] = useState(false);
  const [fetchingSprintds, setFetchingSprints] = useState(true);

  useEffect(() => {
    if (open) {
      setSelectedSprintId(currentSprintId || '');
      fetchSprints();
    }
  }, [open, currentSprintId]);

  const fetchSprints = async () => {
    setFetchingSprints(true);
    try {
      const response = await sprintsApi.list({ limit: 100, status: 'active' });
      // Also include planning sprints
      const planningResponse = await sprintsApi.list({ limit: 100, status: 'planning' });
      const allSprints = [...response.data, ...planningResponse.data];
      // Remove duplicates
      const uniqueSprints = allSprints.filter(
        (sprint, index, self) => index === self.findIndex((s) => s.id === sprint.id)
      );
      setSprints(uniqueSprints);
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
    } finally {
      setFetchingSprints(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedSprintId) return;

    setLoading(true);
    try {
      await featuresApi.assignToSprint(featureId, selectedSprintId);
      toast.success('Feature assigned to sprint');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign feature to sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      await featuresApi.unassignFromSprint(featureId);
      toast.success('Feature removed from sprint');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove feature from sprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Assign to Sprint
          </DialogTitle>
          <DialogDescription>
            {currentSprintName
              ? `"${featureTitle}" is currently in ${currentSprintName}`
              : `Assign "${featureTitle}" to a sprint`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Sprint</Label>
            {fetchingSprintds ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : sprints.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No active or planning sprints available.
              </p>
            ) : (
              <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      <div className="flex items-center gap-2">
                        <span>{sprint.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({sprint.status})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {currentSprintId && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              Remove from Sprint
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedSprintId || selectedSprintId === currentSprintId}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {currentSprintId ? 'Move to Sprint' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
