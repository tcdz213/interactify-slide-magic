import { Truck, Package, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supplierDeliveries } from "../data/mockSupplierData";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  Preparing: { label: "En préparation", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Package },
  InTransit: { label: "En transit", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400", icon: Truck },
  Delivered: { label: "Livrée", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  Partial: { label: "Partielle", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", icon: Clock },
};

export default function SupplierDeliveriesScreen() {
  return (
    <div className="p-4 space-y-4 pb-6">
      <h1 className="text-lg font-bold">Livraisons</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "En cours", value: supplierDeliveries.filter((d) => d.status === "InTransit").length, color: "text-blue-600" },
          { label: "Préparation", value: supplierDeliveries.filter((d) => d.status === "Preparing").length, color: "text-amber-600" },
          { label: "Livrées", value: supplierDeliveries.filter((d) => d.status === "Delivered").length, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {supplierDeliveries.map((del) => {
          const meta = STATUS_MAP[del.status] || STATUS_MAP.Preparing;
          const Icon = meta.icon;
          return (
            <div key={del.id} className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", meta.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold">{del.id}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", meta.color)}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">PO : {del.poId} · {del.itemCount} articles</p>
                {del.dispatchedAt && (
                  <p className="text-[10px] text-muted-foreground">
                    Expédié le {new Date(del.dispatchedAt).toLocaleDateString("fr-FR")}
                    {del.deliveredAt && ` → Livré le ${new Date(del.deliveredAt).toLocaleDateString("fr-FR")}`}
                  </p>
                )}
                {del.grnId && (
                  <p className="text-[10px] text-muted-foreground">GRN : {del.grnId}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
