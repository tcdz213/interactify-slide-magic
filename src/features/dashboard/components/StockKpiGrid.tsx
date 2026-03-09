import KpiCard from "@/components/KpiCard";
import { Package, AlertTriangle, Clock, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  totalStockItems: number;
  refCount: number;
  lowStockCount: number;
  expiringSoon: number;
  activeOrders: number;
  pickingCount: number;
}

export default function StockKpiGrid({ totalStockItems, refCount, lowStockCount, expiringSoon, activeOrders, pickingCount }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <KpiCard title={t("dashboard.stockItems")} value={String(totalStockItems)} change={`${refCount} ${t("dashboard.references")}`} changeType="neutral" icon={Package} delay={0} />
      <KpiCard title={t("dashboard.criticalStock")} value={String(lowStockCount)} change={lowStockCount > 0 ? t("dashboard.belowMinThreshold") : t("dashboard.allOk")} changeType={lowStockCount > 0 ? "down" : "neutral"} icon={AlertTriangle} delay={50} />
      <KpiCard title={t("dashboard.expiringSoon")} value={String(expiringSoon)} change={expiringSoon > 0 ? t("dashboard.attentionRequired") : t("dashboard.none")} changeType={expiringSoon > 0 ? "down" : "neutral"} icon={Clock} delay={100} />
      <KpiCard title={t("dashboard.activeOrders")} value={String(activeOrders)} change={pickingCount ? `${pickingCount} ${t("dashboard.inPicking")}` : "—"} changeType="neutral" icon={ShoppingCart} delay={150} />
    </>
  );
}
