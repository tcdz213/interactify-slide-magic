import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Building2 } from "lucide-react";
import { currency } from "@/data/mockData";
import { useTranslation } from "react-i18next";
import ChartCard from "@/shared/components/ChartCard";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_STYLE } from "@/shared/constants/chartColors";

interface WarehouseData {
  name: string;
  value: number;
  items: number;
  type: string;
  utilization: number;
}

interface Props {
  data: WarehouseData[];
}

export default function WarehouseBarChart({ data }: Props) {
  const { t } = useTranslation();

  const detailPanel = (
    <div className="space-y-3">
      {data.map((wh, i) => (
        <div key={i} className="rounded-lg border border-border/40 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{wh.name}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{wh.type}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{currency(wh.value)}</span>
            <span>{wh.items} {t("dashboard.itemCount").toLowerCase()}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2" role="progressbar" aria-valuenow={wh.utilization} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, wh.utilization)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground text-end mt-0.5">{wh.utilization}%</p>
        </div>
      ))}
    </div>
  );

  return (
    <ChartCard
      title={t("dashboard.stockByWarehouse")}
      subtitle={t("dashboard.stockByWarehouse")}
      isEmpty={data.length === 0}
      height={200}
      ariaLabel={t("dashboard.stockByWarehouse")}
      actions={<Building2 className="h-4 w-4 text-primary" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} role="img" aria-label={t("dashboard.stockByWarehouse")}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
            <XAxis dataKey="name" tick={{ ...CHART_AXIS_STYLE, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ ...CHART_AXIS_STYLE, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: number) => [currency(value), t("dashboard.stockValue")]} />
            <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {detailPanel}
      </div>
    </ChartCard>
  );
}
