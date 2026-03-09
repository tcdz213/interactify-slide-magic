/**
 * Phase J/K — Cash Flow Sparkline with consistent chart tokens, motion, empty state.
 */
import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CHART_TOOLTIP_STYLE } from "@/shared/constants/chartColors";
import EmptyChart from "@/shared/components/EmptyChart";

export default function CashFlowSparkline() {
  const { payments } = useWMSData();
  const { t } = useTranslation();

  const { data, totalInflow, totalOutflow } = useMemo(() => {
    const today = new Date();
    const days: { day: string; inflow: number; outflow: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("fr", { weekday: "short" });
      days.push({ day: dayLabel, inflow: 0, outflow: 0 });

      for (const p of payments) {
        const pDate = (p.date ?? "").slice(0, 10);
        if (pDate === key && p.status === "Completed") {
          days[days.length - 1].inflow += p.amount ?? 0;
        }
      }
    }

    const totalIn = days.reduce((s, d) => s + d.inflow, 0);
    const totalOut = days.reduce((s, d) => s + d.outflow, 0);
    return { data: days, totalInflow: totalIn, totalOutflow: totalOut };
  }, [payments]);

  const hasData = data.some((d) => d.inflow > 0 || d.outflow > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="glass-card rounded-xl p-5"
      role="figure"
      aria-label={t("dashboard.cashFlow", "Flux de trésorerie")}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("dashboard.cashFlow", "Flux de trésorerie")}</h3>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <ArrowUpRight className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{t("dashboard.inflow", "Encaissé")}</span>
          <span className="text-xs font-semibold text-success">{currency(totalInflow)}</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDownRight className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{t("dashboard.outflow", "Décaissé")}</span>
          <span className="text-xs font-semibold text-destructive">{currency(totalOutflow)}</span>
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [currency(v), ""]} />
            <Area type="monotone" dataKey="inflow" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#inflowGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart height={80} />
      )}
    </motion.div>
  );
}
