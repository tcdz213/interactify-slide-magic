import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { currency } from "@/data/mockData";
import { useTranslation } from "react-i18next";
import ChartCard from "@/shared/components/ChartCard";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_STYLE } from "@/shared/constants/chartColors";

interface Props {
  data: { name: string; ventes: number; commandes: number }[];
}

export default function WeeklySalesChart({ data }: Props) {
  const { t } = useTranslation();
  return (
    <ChartCard
      title={t("dashboard.weeklySales")}
      subtitle={t("dashboard.dailyRevenue")}
      className="lg:col-span-2"
      height={240}
      isEmpty={data.length === 0}
      ariaLabel={t("dashboard.weeklySales")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} role="img" aria-label={t("dashboard.weeklySales")}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
          <XAxis dataKey="name" tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: number) => [currency(value), t("dashboard.weeklySales")]} />
          <Area type="monotone" dataKey="ventes" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#salesGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
