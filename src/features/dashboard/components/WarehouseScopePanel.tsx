import { Building2, AlertTriangle } from "lucide-react";
import { currency } from "@/data/mockData";
import { getWarehouseShortName, getWarehouseBadgeStyle } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Props {
  accessibleWarehouseIds: string[];
  warehouses: any[];
  inventory: any[];
}

export default function WarehouseScopePanel({ accessibleWarehouseIds, warehouses, inventory }: Props) {
  const { t } = useTranslation();
  return (
    <div className="glass-card rounded-xl p-5 animate-slide-in" style={{ animationDelay: "180ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("dashboard.myScope")}</h3>
        <span className="text-xs text-muted-foreground">— {t("dashboard.stockByWarehouse")}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accessibleWarehouseIds.map(whId => {
          const wh = warehouses.find((w: any) => w.id === whId);
          const whInventory = inventory.filter((i: any) => i.warehouseId === whId);
          const totalValue = whInventory.reduce((s: number, i: any) => s + i.qtyOnHand * i.unitCostAvg, 0);
          const totalItems = whInventory.length;
          const lowStock = whInventory.filter((i: any) => i.qtyAvailable < i.reorderPoint).length;
          const expiring = whInventory.filter((i: any) => i.daysToExpiry <= 30).length;
          return (
            <div key={whId} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border", getWarehouseBadgeStyle(whId))}>
                  <Building2 className="h-3 w-3" />
                  {getWarehouseShortName(whId)}
                </span>
                <span className="text-xs text-muted-foreground">{wh?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">{t("dashboard.stockValue")}</p>
                  <p className="font-semibold text-sm">{currency(totalValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.itemCount")}</p>
                  <p className="font-semibold text-sm">{totalItems}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    {lowStock > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                    {t("dashboard.lowStock")}
                  </p>
                  <p className={`font-semibold text-sm ${lowStock > 0 ? "text-warning" : ""}`}>{lowStock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    {expiring > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    {t("dashboard.expiring")}
                  </p>
                  <p className={`font-semibold text-sm ${expiring > 0 ? "text-destructive" : ""}`}>{expiring}</p>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, (wh?.utilization ?? 0))}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">{wh?.utilization ?? 0}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
