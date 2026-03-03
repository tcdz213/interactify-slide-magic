import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import PortalStatusBadge from "../components/PortalStatusBadge";
import { portalOrders } from "../data/mockPortalData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const FILTERS = ["Toutes", "En cours", "Livrées", "Annulées"] as const;
type Filter = (typeof FILTERS)[number];

const filterMatch = (status: string, f: Filter) => {
  if (f === "Toutes") return true;
  if (f === "En cours") return ["Draft", "Pending", "Approved", "Picking", "Shipped"].includes(status);
  if (f === "Livrées") return status === "Delivered";
  if (f === "Annulées") return ["Cancelled", "Credit_Hold"].includes(status);
  return true;
};

export default function MyOrdersScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("Toutes");
  const [search, setSearch] = useState("");

  const filtered = portalOrders
    .filter((o) => filterMatch(o.status, filter))
    .filter((o) => !search || o.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold">Mes commandes</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-2">
        {filtered.map((o) => (
          <button
            key={o.id}
            onClick={() => navigate(`/portal/orders/${o.id}`)}
            className="w-full rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-medium">{o.id}</span>
              <PortalStatusBadge status={o.status} />
            </div>
            <p className="text-sm font-semibold">{currency(o.totalAmount)}</p>
            <p className="text-[10px] text-muted-foreground">{o.lines.length} article(s) · {new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
            {o.eta && <p className="text-[10px] text-primary mt-1">Livraison prévue: {o.eta}</p>}
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] text-primary hover:underline">Détail</span>
              {o.status === "Delivered" && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <RefreshCw className="h-3 w-3" /> Recommander
                </span>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">Aucune commande trouvée</div>
        )}
      </div>
    </div>
  );
}
