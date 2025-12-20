import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Zap, Unlink } from 'lucide-react';
import { featuresApi } from '@/services/featureApi';
import type { Feature } from '@/types/feature';

interface BugLinkFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFeatureId?: string;
  currentFeatureTitle?: string;
  onLink: (featureId: string) => Promise<void>;
  onUnlink: () => Promise<void>;
}

const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-purple-500/20 text-purple-400',
  approved: 'bg-green-500/20 text-green-400',
  planning: 'bg-blue-500/20 text-blue-400',
  design: 'bg-cyan-500/20 text-cyan-400',
  development: 'bg-amber-500/20 text-amber-400',
  testing: 'bg-orange-500/20 text-orange-400',
  release: 'bg-emerald-500/20 text-emerald-400',
  live: 'bg-green-600/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  review: 'bg-yellow-500/20 text-yellow-400',
};

export function BugLinkFeatureDialog({
  open,
  onOpenChange,
  currentFeatureId,
  currentFeatureTitle,
  onLink,
  onUnlink,
}: BugLinkFeatureDialogProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFeatures();
    }
  }, [open, search]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await featuresApi.list({
        search: search || undefined,
        limit: 50,
      });
      setFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedFeatureId) return;
    try {
      setSubmitting(true);
      await onLink(selectedFeatureId);
      onOpenChange(false);
      setSelectedFeatureId('');
    } catch (error) {
      console.error('Failed to link feature:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    try {
      setSubmitting(true);
      await onUnlink();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to unlink feature:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Link to Feature
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentFeatureId && (
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">Currently linked to:</p>
              <div className="flex items-center justify-between">
                <span className="font-medium">{currentFeatureTitle}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleUnlink}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4 mr-2" />}
                  Unlink
                </Button>
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a feature to link" />
            </SelectTrigger>
            <SelectContent className="max-h-64 z-[200]">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : features.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No features found
                </div>
              ) : (
                features.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{feature.title}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[feature.status] || ''}`}>
                        {feature.status}
                      </Badge>
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
            onClick={handleLink} 
            disabled={!selectedFeatureId || submitting}
            className="w-full sm:w-auto"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Link Feature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
