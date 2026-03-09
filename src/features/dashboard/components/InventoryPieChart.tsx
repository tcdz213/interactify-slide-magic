import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import ChartCard from "@/shared/components/ChartCard";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/shared/constants/chartColors";

interface Props {
  data: { name: string; value: number }[];
}

export default function InventoryPieChart({ data }: Props) {
  const { t } = useTranslation();

  const legend = (
    <div className="space-y-1.5">
      {data.map((cat, i) => (
        <div key={cat.name} className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-muted-foreground">{cat.name}</span>
          </div>
          <span className="font-medium">{cat.value}%</span>
        </div>
      ))}
    </div>
  );

  return (
    <ChartCard
      title={t("dashboard.stockByCategory")}
      subtitle={t("dashboard.currentDistribution")}
      height={180}
      isEmpty={data.length === 0}
      legend={legend}
      ariaLabel={t("dashboard.stockByCategory")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart role="img" aria-label={t("dashboard.stockByCategory")}>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, ""]} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
