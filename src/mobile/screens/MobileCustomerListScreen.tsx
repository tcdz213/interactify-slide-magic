import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { type MobileCustomer } from "@/mobile/data/mockSalesData";
import { Search, MapPin, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PullToRefresh from "@/mobile/components/PullToRefresh";
import SwipeCard from "@/mobile/components/SwipeCard";
import { toast } from "@/hooks/use-toast";
import { useMobileCustomers, useDeltaSync } from "@/mobile/hooks/useMobileData";
import { MobileSkeletonList } from "@/mobile/components/MobileSkeletons";

type Filter = "all" | "nearby" | "atrisk";

function getCreditStatus(c: MobileCustomer) {
  if (c.oldestOverdueDays >= 60) return { label: "BLOQUÉ", variant: "destructive" as const, color: "text-destructive" };
  const pct = c.creditUsed / c.creditLimit;
  if (pct >= 0.9 || c.oldestOverdueDays >= 30) return { label: `${Math.round(pct * 100)}%`, variant: "outline" as const, color: "text-amber-600" };
  return { label: "OK", variant: "secondary" as const, color: "text-emerald-600" };
}

const currency = (v: number) => v.toLocaleString("fr-DZ", { maximumFractionDigits: 0 });

/** Simulated geo-distance from rep (Alger centre) */
function mockDistance(c: MobileCustomer): number {
  const dlat = c.lat - 36.7538;
  const dlng = c.lng - 3.0588;
  return Math.sqrt(dlat * dlat + dlng * dlng) * 111;
}

export default function MobileCustomerListScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { data: customers = [], isLoading } = useMobileCustomers();
  const { performDeltaSync } = useDeltaSync();

  const filtered = useMemo(() => {
    let list = customers.map(c => ({ ...c, distance: mockDistance(c) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }
    if (filter === "atrisk") list = list.filter(c => c.oldestOverdueDays >= 30 || c.creditUsed / c.creditLimit >= 0.9);
    if (filter === "nearby") list.sort((a, b) => a.distance - b.distance);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, filter, customers]);

  const handleRefresh = useCallback(async () => {
    await performDeltaSync();
    toast({ title: "🔄 Liste actualisée" });
  }, [performDeltaSync]);

  const handleCall = (c: MobileCustomer) => {
    window.open(`tel:${c.phone}`, "_self");
    navigator.vibrate?.(30);
  };

  if (isLoading) return <MobileSkeletonList />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 bg-background sticky top-0 z-10">
        <h1 className="text-lg font-bold text-foreground">Mes Clients</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "nearby", "atrisk"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {f === "all" ? "Tous" : f === "nearby" ? "📍 Proches" : "⚠️ À risque"}
            </button>
          ))}
        </div>
      </div>

      {/* List with pull-to-refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 px-4 pb-4">
        <div className="space-y-2 pt-1">
          {filtered.map((c) => {
            const credit = getCreditStatus(c);
            return (
              <SwipeCard
                key={c.id}
                onSwipeRight={() => handleCall(c)}
                onSwipeLeft={() => navigate(`/mobile/new-order?customer=${c.id}`)}
                rightLabel="Appeler"
                leftLabel="Commander"
              >
                <button
                  onClick={() => navigate(`/mobile/customers/${c.id}`)}
                  className="w-full bg-card border border-border rounded-xl p-3 text-left active:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{c.name}</span>
                        <Badge variant={credit.variant} className="text-[10px] shrink-0">{credit.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{c.address}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          📍 {c.distance.toFixed(1)} km • Crédit: {currency(c.creditUsed)} / {currency(c.creditLimit)} DZD
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              </SwipeCard>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">Aucun client trouvé</p>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
