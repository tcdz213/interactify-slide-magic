import { AlertTriangle } from "lucide-react";
import { currency } from "@/data/mockData";
import { RBACGuard } from "@/components/RBACGuard";

interface ProductKPICardsProps {
  totalProducts: number;
  categoriesCount: number;
  activeCount: number;
  criticalStockCount: number;
  avgCost: number;
  avgPrice: number;
}

export function ProductKPICards({ totalProducts, categoriesCount, activeCount, criticalStockCount, avgCost, avgPrice }: ProductKPICardsProps) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Total produits" value={totalProducts} />
        <KPICard label="Catégories" value={categoriesCount} />
        <KPICard label="Produits actifs" value={activeCount} valueClass="text-primary" />
        <div className="glass-card rounded-lg p-3 border border-border/50 hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Stock critique
          </p>
          <p className="text-xl font-semibold text-destructive">{criticalStockCount}</p>
        </div>
      </div>

      <RBACGuard permission="view_financials">
        <div className="grid grid-cols-2 gap-3">
          <KPICard label="Coût moyen" value={currency(avgCost)} />
          <KPICard label="Prix moyen" value={currency(avgPrice)} />
        </div>
      </RBACGuard>
    </>
  );
}

function KPICard({ label, value, valueClass = "" }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="glass-card rounded-lg p-3 border border-border/50 hover:shadow-md transition-shadow">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
