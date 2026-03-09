export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--foreground))",
};

export const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-info/10 text-info",
  Picking: "bg-warning/10 text-warning",
  Shipped: "bg-primary/10 text-primary",
  Delivered: "bg-success/10 text-success",
  Invoiced: "bg-muted text-muted-foreground",
  Draft: "bg-muted/50 text-muted-foreground",
};

export const ALERT_PRIORITY_STYLES: Record<string, string> = {
  Critical: "border-l-destructive bg-destructive/5",
  High: "border-l-destructive/80 bg-destructive/5",
  Medium: "border-l-warning bg-warning/5",
  Low: "border-l-info bg-info/5",
};
