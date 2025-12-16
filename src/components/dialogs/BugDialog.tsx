import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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
import { Loader2 } from 'lucide-react';
import type { Bug, CreateBugData, UpdateBugData, BugSeverity, BugPriority, BugPlatform } from '@/types/bug';

interface BugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bug?: Bug | null;
  onSave: (data: CreateBugData | UpdateBugData) => Promise<void>;
}

const SEVERITIES: { value: BugSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const PRIORITIES: { value: BugPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const PLATFORMS: { value: BugPlatform; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'api', label: 'API' },
  { value: 'desktop', label: 'Desktop' },
];

export function BugDialog({ open, onOpenChange, bug, onSave }: BugDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium' as BugSeverity,
    priority: 'medium' as BugPriority,
    platform: 'web' as BugPlatform,
    environment: '',
    version: '',
    browserInfo: '',
    productId: '',
  });

  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title,
        description: bug.description,
        stepsToReproduce: bug.stepsToReproduce,
        expectedBehavior: bug.expectedBehavior,
        actualBehavior: bug.actualBehavior,
        severity: bug.severity,
        priority: bug.priority,
        platform: bug.platform,
        environment: bug.environment,
        version: bug.version || '',
        browserInfo: bug.browserInfo || '',
        productId: bug.productId,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        severity: 'medium',
        priority: 'medium',
        platform: 'web',
        environment: 'Production',
        version: '',
        browserInfo: '',
        productId: '',
      });
    }
  }, [bug, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bug) {
        await onSave({
          title: formData.title,
          description: formData.description,
          stepsToReproduce: formData.stepsToReproduce,
          expectedBehavior: formData.expectedBehavior,
          actualBehavior: formData.actualBehavior,
          severity: formData.severity,
          priority: formData.priority,
        } as UpdateBugData);
      } else {
        await onSave(formData as CreateBugData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bug ? 'Edit Bug' : 'Report New Bug'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief, descriptive title"
              required
              minLength={10}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the bug"
              required
              minLength={20}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepsToReproduce">Steps to Reproduce *</Label>
            <Textarea
              id="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
              placeholder="1. Open the application&#10;2. Navigate to...&#10;3. Click on..."
              required
              minLength={10}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedBehavior">Expected Behavior *</Label>
              <Textarea
                id="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                placeholder="What should happen"
                required
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualBehavior">Actual Behavior *</Label>
              <Textarea
                id="actualBehavior"
                value={formData.actualBehavior}
                onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                placeholder="What actually happens"
                required
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(v) => setFormData({ ...formData, severity: v as BugSeverity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as BugPriority })}
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
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(v) => setFormData({ ...formData, platform: v as BugPlatform })}
                disabled={!!bug}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!bug && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment *</Label>
                  <Input
                    id="environment"
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    placeholder="Production, Staging, Development"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID *</Label>
                  <Input
                    id="productId"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    placeholder="Product UUID"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 2.1.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="browserInfo">Browser Info</Label>
                  <Input
                    id="browserInfo"
                    value={formData.browserInfo}
                    onChange={(e) => setFormData({ ...formData, browserInfo: e.target.value })}
                    placeholder="e.g., Chrome 120 on Windows 11"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {bug ? 'Update Bug' : 'Report Bug'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
