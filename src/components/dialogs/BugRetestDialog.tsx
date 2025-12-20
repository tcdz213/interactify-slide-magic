import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';

interface BugRetestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { status: 'passed' | 'failed'; notes?: string; environment: string }) => Promise<void>;
}

export function BugRetestDialog({
  open,
  onOpenChange,
  onSubmit,
}: BugRetestDialogProps) {
  const [status, setStatus] = useState<'passed' | 'failed'>('passed');
  const [environment, setEnvironment] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!environment.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        status,
        environment: environment.trim(),
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      // Reset form
      setStatus('passed');
      setEnvironment('');
      setNotes('');
    } catch (error) {
      console.error('Failed to add retest:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Add Retest Result
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retest-status">Test Result</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'passed' | 'failed')}>
              <SelectTrigger id="retest-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="passed">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Passed - Bug is fixed
                  </span>
                </SelectItem>
                <SelectItem value="failed">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Failed - Bug still exists
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retest-environment">Environment *</Label>
            <Input
              id="retest-environment"
              placeholder="e.g., Staging, Production, QA"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retest-notes">Notes (optional)</Label>
            <Textarea
              id="retest-notes"
              placeholder="Additional notes about the test results..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!environment.trim() || submitting}
              className="w-full sm:w-auto"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
