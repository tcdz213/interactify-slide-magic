import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan, SubscriptionStatus, TenantStatus, OrderStatus, CustomerSegment } from '@/lib/fake-api/types';

const planStyles: Record<SubscriptionPlan, string> = {
  starter: 'bg-muted text-muted-foreground border-border',
  professional: 'bg-primary/10 text-primary border-primary/20',
  enterprise: 'bg-accent/10 text-accent border-accent/20',
};

const statusStyles: Record<TenantStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-destructive/10 text-destructive border-destructive/20',
  onboarding: 'bg-warning/10 text-warning border-warning/20',
};

const subStatusStyles: Record<SubscriptionStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  trial: 'bg-info/10 text-info border-info/20',
  suspended: 'bg-warning/10 text-warning border-warning/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const orderStatusStyles: Record<OrderStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  confirmed: 'bg-info/10 text-info border-info/20',
  picking: 'bg-warning/10 text-warning border-warning/20',
  dispatched: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  delivered: 'bg-success/10 text-success border-success/20',
  settled: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const segmentStyles: Record<CustomerSegment, string> = {
  depot: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  wholesale: 'bg-accent/10 text-accent border-accent/20',
  retail: 'bg-primary/10 text-primary border-primary/20',
  small_trader: 'bg-warning/10 text-warning border-warning/20',
  special_client: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  superette: 'bg-info/10 text-info border-info/20',
  shadow: 'bg-muted text-muted-foreground border-border',
};

const segmentLabels: Record<CustomerSegment, string> = {
  depot: 'Dépôt',
  wholesale: 'Grossiste',
  retail: 'Détaillant',
  small_trader: 'Petit commerce',
  special_client: 'Client spécial',
  superette: 'Supérette',
  shadow: 'Shadow',
};

export function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  return <Badge variant="outline" className={`text-xs font-medium capitalize ${planStyles[plan]}`}>{plan}</Badge>;
}

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  return <Badge variant="outline" className={`text-xs font-medium capitalize ${statusStyles[status]}`}>{status}</Badge>;
}

export function SubStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge variant="outline" className={`text-xs font-medium capitalize ${subStatusStyles[status]}`}>{status}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant="outline" className={`text-xs font-medium capitalize ${orderStatusStyles[status]}`}>{status}</Badge>;
}

export function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  return <Badge variant="outline" className={`text-xs font-medium ${segmentStyles[segment] || 'bg-muted text-muted-foreground border-border'}`}>{segmentLabels[segment] || segment}</Badge>;
}
