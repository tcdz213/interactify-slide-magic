import { useWMSData } from "@/contexts/WMSDataContext";
import { useMemo } from "react";

interface ProductStockBadgeProps {
  productId: string;
}

export default function ProductStockBadge({ productId }: ProductStockBadgeProps) {
  const { inventory } = useWMSData();

  const totalStock = useMemo(
    () => inventory.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.qtyOnHand, 0),
    [inventory, productId]
  );

  const config =
    totalStock > 100
      ? { label: "En stock", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" }
      : totalStock >= 20
        ? { label: "Stock faible", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" }
        : { label: "Critique", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {totalStock} <span className="text-[10px] opacity-75">({config.label})</span>
    </span>
  );
}
