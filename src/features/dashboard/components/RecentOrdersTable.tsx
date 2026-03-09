import { Link } from "react-router-dom";
import { currency } from "@/data/mockData";
import { useTranslation } from "react-i18next";
import { STATUS_COLORS } from "../constants";

interface Props {
  orders: any[];
}

export default function RecentOrdersTable({ orders }: Props) {
  const { t } = useTranslation();
  return (
    <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{t("dashboard.recentOrders")}</h3>
        <Link to="/sales/orders" className="text-[11px] font-medium text-primary hover:underline">{t("dashboard.viewAll")} →</Link>
      </div>
      <div className="space-y-2.5">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("common.noResults")}</p>
        ) : (
          orders.map((order) => (
            <Link key={order.id} to="/sales/orders" className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded px-1 -mx-1">
              <div className="space-y-0.5">
                <p className="text-xs font-mono font-medium">{order.id}</p>
                <p className="text-[11px] text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-muted"}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-semibold w-24 text-right">{currency(order.totalAmount)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
