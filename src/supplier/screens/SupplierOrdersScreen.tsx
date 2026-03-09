import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supplierPOs } from "../data/mockSupplierData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Shipped: "bg-primary/15 text-primary",
  Delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-destructive/15 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  Pending: "En attente",
  Confirmed: "Confirmée",
  Shipped: "Expédiée",
  Delivered: "Livrée",
  Rejected: "Rejetée",
};

const FILTERS = ["Tous", "Pending", "Confirmed", "Shipped", "Delivered", "Rejected"] as const;

export default function SupplierOrdersScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");

  const filtered = supplierPOs.filter((po) => {
    if (statusFilter !== "Tous" && po.status !== statusFilter) return false;
    if (search && !po.id.toLowerCase().includes(search.toLowerCase()) && !po.warehouseName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4 pb-6">
      <h1 className="text-lg font-bold">Commandes reçues</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par n° PO ou entrepôt…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              "shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors",
              statusFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "Tous" ? "Tous" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-40" />
            Aucune commande trouvée
          </div>
        )}
        {filtered.map((po) => (
          <button
            key={po.id}
            onClick={() => navigate(`/supplier/orders/${po.id}`)}
            className="w-full rounded-xl border border-border bg-card p-3.5 flex items-center gap-3 text-left active:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold">{po.id}</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[po.status])}>
                  {STATUS_LABELS[po.status]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{po.warehouseName}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">{currency(po.totalAmount)}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {new Date(po.expectedDelivery).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </span>
                <span>{po.lines.length} ligne{po.lines.length > 1 ? "s" : ""}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
