import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Layers, 
  Bug, 
  Users, 
  Zap, 
  CheckCircle, 
  Clock,
  Activity
} from 'lucide-react';
import type { ProductStats } from '@/types/product';
import { format } from 'date-fns';

interface ProductStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  productName: string;
}

export function ProductStatsDialog({ 
  open, 
  onOpenChange, 
  productId, 
  productName 
}: ProductStatsDialogProps) {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && productId) {
      fetchStats();
    }
  }, [open, productId]);

  const fetchStats = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const response = await productsApi.getStats(productId);
      setStats(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue,
    color 
  }: { 
    icon: any; 
    label: string; 
    value: number | string; 
    subValue?: string;
    color: string;
  }) => (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stats for {productName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Layers}
                label="Total Features"
                value={stats.totalFeatures}
                color="bg-primary/10 text-primary"
              />
              <StatCard
                icon={CheckCircle}
                label="Completed"
                value={stats.completedFeatures}
                subValue={`${stats.activeFeatures} active`}
                color="bg-green-500/10 text-green-500"
              />
              <StatCard
                icon={Bug}
                label="Open Bugs"
                value={stats.openBugs}
                subValue={`${stats.resolvedBugs} resolved`}
                color="bg-red-500/10 text-red-500"
              />
              <StatCard
                icon={Zap}
                label="Active Sprints"
                value={stats.activeSprintsCount}
                color="bg-yellow-500/10 text-yellow-500"
              />
              <StatCard
                icon={Users}
                label="Team Members"
                value={stats.teamMembersCount}
                color="bg-blue-500/10 text-blue-500"
              />
              <StatCard
                icon={Activity}
                label="Last Activity"
                value={format(new Date(stats.lastActivityAt), 'MMM d')}
                subValue={format(new Date(stats.lastActivityAt), 'h:mm a')}
                color="bg-purple-500/10 text-purple-500"
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stats available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
