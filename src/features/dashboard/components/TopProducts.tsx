/**
 * Phase 6 — Top Products widget: best sellers by revenue.
 */
import { useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TopProducts() {
  const { salesOrders, products } = useWMSData();
  const { t } = useTranslation();

  const topProducts = useMemo(() => {
    const revenueMap = new Map<string, number>();
    for (const order of salesOrders) {
      for (const item of order.lines ?? []) {
        revenueMap.set(item.productId, (revenueMap.get(item.productId) ?? 0) + (item.orderedQty ?? 0) * (item.unitPrice ?? 0));
      }
    }
    return Array.from(revenueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, revenue]) => {
        const product = products.find((p: any) => p.id === productId);
        return { id: productId, name: product?.name ?? productId, revenue };
      });
  }, [salesOrders, products]);

  const maxRevenue = topProducts[0]?.revenue ?? 1;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("dashboard.topProducts", "Top produits")}</h3>
      </div>
      <div className="space-y-3">
        {topProducts.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">{t("common.noResults")}</p>
        ) : (
          topProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-foreground shrink-0">{currency(p.revenue)}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
