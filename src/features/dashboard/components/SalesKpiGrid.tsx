import KpiCard from "@/components/KpiCard";
import { ShoppingCart, Truck, CreditCard, TrendingUp } from "lucide-react";
import { currency } from "@/data/mockData";
import { useTranslation } from "react-i18next";

interface Props {
  totalSales: number;
  orderCount: number;
  activeOrders: number;
  pickingCount: number;
  inTransitDeliveries: number;
  totalDeliveries: number;
  totalCollected: number;
  collectedPct: number;
  totalInvoiced: number;
}

export default function SalesKpiGrid({ totalSales, orderCount, activeOrders, pickingCount, inTransitDeliveries, totalDeliveries, totalCollected, collectedPct, totalInvoiced }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <KpiCard title={t("dashboard.totalRevenue")} value={currency(totalSales)} change={`${orderCount} ${t("dashboard.orders")}`} changeType="neutral" icon={TrendingUp} delay={0} />
      <KpiCard title={t("dashboard.activeOrders")} value={String(activeOrders)} change={pickingCount ? `${pickingCount} ${t("dashboard.inPicking")}` : "—"} changeType="neutral" icon={ShoppingCart} delay={50} />
      <KpiCard title={t("dashboard.deliveriesInProgress")} value={String(inTransitDeliveries)} change={`${totalDeliveries} ${t("dashboard.total")}`} changeType="neutral" icon={Truck} delay={100} />
      <KpiCard title={t("dashboard.collections")} value={currency(totalCollected)} change={totalInvoiced > 0 ? `${collectedPct}% ${t("dashboard.ofInvoiced")}` : "—"} changeType="up" icon={CreditCard} delay={150} />
    </>
  );
}
