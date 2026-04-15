import { useTranslation } from 'react-i18next';
import type { DeliveryRoute } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface Props {
  routes: DeliveryRoute[];
}

// Generate deterministic positions for stops
function stopPositions(route: DeliveryRoute, index: number, total: number) {
  const colors = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))'];
  const color = colors[index % colors.length];
  const depot = { x: 50, y: 180 };
  const points = route.stops.map((_, i) => ({
    x: 80 + ((i + 1) * (320 / (route.stops.length + 1))),
    y: 30 + (i % 2 === 0 ? 40 : 120) + index * 15,
  }));
  return { depot, points, color };
}

export default function RouteMapMock({ routes }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />{t('routes.mapView', 'Route Map')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-muted border border-border overflow-hidden">
          <svg viewBox="0 0 440 220" className="w-full h-auto" style={{ minHeight: 180 }}>
            {/* Grid */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`g${i}`} x1={i * 55} y1="0" x2={i * 55} y2="220" stroke="hsl(var(--border))" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 55} x2="440" y2="220" stroke="hsl(var(--border))" strokeWidth="0.5" />
            ))}

            {/* Depot */}
            <rect x="35" y="170" width="30" height="20" rx="3" className="fill-primary/20 stroke-primary" strokeWidth="1" />
            <text x="50" y="185" textAnchor="middle" className="fill-primary text-[8px] font-bold">{t('deliveries.depot', 'Depot')}</text>

            {/* Routes */}
            {routes.slice(0, 3).map((route, ri) => {
              const { depot, points, color } = stopPositions(route, ri, routes.length);
              return (
                <g key={route.id}>
                  {/* Lines */}
                  {points.map((p, i) => {
                    const prev = i === 0 ? depot : points[i - 1];
                    return <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={color} strokeWidth="2" strokeDasharray={route.status === 'planned' ? '6,3' : undefined} opacity={0.7} />;
                  })}
                  {/* Stop dots */}
                  {points.map((p, i) => (
                    <g key={`s${i}`}>
                      <circle cx={p.x} cy={p.y} r={route.stops[i]?.status === 'completed' ? 7 : 6} fill={route.stops[i]?.status === 'completed' ? 'hsl(var(--success))' : color} opacity={0.9} />
                      <text x={p.x} y={p.y + 3} textAnchor="middle" className="fill-background text-[7px] font-bold">{i + 1}</text>
                      <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-muted-foreground text-[6px]">{route.stops[i]?.customerName.split(' ')[0]}</text>
                    </g>
                  ))}
                </g>
              );
            })}

            {/* Legend */}
            {routes.slice(0, 3).map((route, i) => {
              const { color } = stopPositions(route, i, routes.length);
              return (
                <g key={`l${i}`}>
                  <line x1="350" y1={15 + i * 14} x2="370" y2={15 + i * 14} stroke={color} strokeWidth="2" />
                  <text x="375" y={18 + i * 14} className="fill-muted-foreground text-[7px]">{route.driverName}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
