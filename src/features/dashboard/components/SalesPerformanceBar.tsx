import { TrendingUp } from "lucide-react";
import { currency } from "@/data/mockData";
import { useTranslation } from "react-i18next";

interface Props {
  pipelineValue: number;
  pipelineCount: number;
  conversionRate: number;
  deliveredCount: number;
  totalCount: number;
  avgOrderValue: number;
  creditHoldCount: number;
  activeClients: number;
  totalClients: number;
}

export default function SalesPerformanceBar({ pipelineValue, pipelineCount, conversionRate, deliveredCount, totalCount, avgOrderValue, creditHoldCount, activeClients, totalClients }: Props) {
  const { t } = useTranslation();
  return (
    <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "180ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("dashboard.salesPerformance")}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.pipeline")}</p>
          <p className="text-lg font-bold text-primary">{currency(pipelineValue)}</p>
          <p className="text-[10px] text-muted-foreground">{pipelineCount} {t("dashboard.orders")}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.conversionRate")}</p>
          <p className={`text-lg font-bold ${conversionRate >= 70 ? "text-success" : conversionRate >= 40 ? "text-warning" : "text-destructive"}`}>{conversionRate}%</p>
          <p className="text-[10px] text-muted-foreground">{deliveredCount}/{totalCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.avgBasket")}</p>
          <p className="text-lg font-bold">{currency(avgOrderValue)}</p>
          <p className="text-[10px] text-muted-foreground">{t("dashboard.perOrder")}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.creditBlocked")}</p>
          <p className={`text-lg font-bold ${creditHoldCount > 0 ? "text-destructive" : "text-success"}`}>{creditHoldCount}</p>
          <p className="text-[10px] text-muted-foreground">{t("dashboard.orders")}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("dashboard.activeClients")}</p>
          <p className="text-lg font-bold">{activeClients}</p>
          <p className="text-[10px] text-muted-foreground">/{totalClients} {t("common.total").toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
}
