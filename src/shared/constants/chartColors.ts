/**
 * Chart color constants using CSS custom properties.
 * Always use these instead of hardcoded HSL values in chart components.
 */

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  fontSize: "12px",
  color: "hsl(var(--foreground))",
} as const;

export const CHART_GRID_STROKE = "hsl(var(--border))";

export const CHART_AXIS_STYLE = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
} as const;

/** Named color mapping for semantic chart usage */
export const CHART_SEMANTIC_COLORS = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  warning: "hsl(var(--chart-3))",
  purple: "hsl(var(--chart-4))",
  pink: "hsl(var(--chart-5))",
  success: "hsl(var(--success))",
  destructive: "hsl(var(--destructive))",
  info: "hsl(var(--info))",
} as const;
