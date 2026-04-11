import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Trend = 'up' | 'down' | 'neutral';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: Trend;
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

const trendConfig: Record<Trend, { icon: typeof ArrowUp; color: string }> = {
  up: { icon: ArrowUp, color: 'text-success' },
  down: { icon: ArrowDown, color: 'text-destructive' },
  neutral: { icon: Minus, color: 'text-muted-foreground' },
};

export function KPIWidget({ title, value, subtitle, trend, trendValue, icon, className }: KPIWidgetProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-1">
            {trend && TrendIcon && (
              <span className={cn('flex items-center gap-0.5 text-xs font-medium', trendConfig[trend].color)}>
                <TrendIcon className="h-3 w-3" />
                {trendValue}
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
