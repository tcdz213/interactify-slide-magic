import { cn } from '@/lib/utils';

type StatusVariant = 'draft' | 'active' | 'inactive' | 'suspended' | 'cancelled' | 'trial' | 'onboarding'
  | 'confirmed' | 'picking' | 'dispatched' | 'delivered' | 'settled' | 'pending' | 'paid' | 'overdue';

const variantStyles: Record<StatusVariant, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  suspended: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-destructive/10 text-destructive',
  trial: 'bg-info/10 text-info',
  onboarding: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  picking: 'bg-warning/10 text-warning',
  dispatched: 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  settled: 'bg-primary/10 text-primary',
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = status.toLowerCase() as StatusVariant;
  const style = variantStyles[variant] || 'bg-muted text-muted-foreground';

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
      style,
      className
    )}>
      {status}
    </span>
  );
}
