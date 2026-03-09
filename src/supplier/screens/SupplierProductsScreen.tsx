import { useState } from "react";
import { Package, Search, CheckCircle2, XCircle, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supplierProducts } from "../data/mockSupplierData";
import { toast } from "@/hooks/use-toast";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

export default function SupplierProductsScreen() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(supplierProducts);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
    toast({ title: "Disponibilité mise à jour" });
  };

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Catalogue produits</h1>
        <span className="text-xs text-muted-foreground">{products.length} produits</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((product) => (
          <div key={product.id} className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
              product.available ? "bg-emerald-500/10" : "bg-muted"
            )}>
              <Package className={cn("h-5 w-5", product.available ? "text-emerald-600" : "text-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{product.category}</span>
                <span>·</span>
                <span>{product.unit}</span>
              </div>
              <p className="text-xs font-semibold">{currency(product.unitPrice)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAvailability(product.id)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  product.available ? "text-emerald-600 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-muted"
                )}
                title={product.available ? "Marquer indisponible" : "Marquer disponible"}
              >
                {product.available ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </button>
              <button
                onClick={() => toast({ title: "Modifier", description: `Édition de ${product.name}` })}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
