import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type MobileOrderStatus } from "@/mobile/data/mockSalesData";
import { ArrowLeft, Search, Package, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMobileOrders } from "@/mobile/hooks/useMobileData";
import { MobileSkeletonList } from "@/mobile/components/MobileSkeletons";

const currency = (v: number) => v.toLocaleString("fr-DZ", { maximumFractionDigits: 0 }) + " DZD";

const STATUS_CONFIG: Record<MobileOrderStatus, { bg: string; text: string }> = {
  Draft: { bg: "bg-muted", text: "text-muted-foreground" },
  Pending: { bg: "bg-amber-500/10", text: "text-amber-700" },
  Approved: { bg: "bg-blue-500/10", text: "text-blue-700" },
  Rejected: { bg: "bg-destructive/10", text: "text-destructive" },
  Picking: { bg: "bg-purple-500/10", text: "text-purple-700" },
  Shipped: { bg: "bg-cyan-500/10", text: "text-cyan-700" },
  Delivered: { bg: "bg-emerald-500/10", text: "text-emerald-700" },
  Cancelled: { bg: "bg-muted", text: "text-muted-foreground" },
};

const FILTER_TABS: { label: string; statuses: MobileOrderStatus[] | null }[] = [
  { label: "Toutes", statuses: null },
  { label: "En cours", statuses: ["Pending", "Approved", "Picking", "Shipped"] },
  { label: "Livrées", statuses: ["Delivered"] },
  { label: "Annulées", statuses: ["Rejected", "Cancelled"] },
];

export default function MobileOrderHistoryScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const { data: orders = [], isLoading } = useMobileOrders();

  const filtered = useMemo(() => {
    let list = [...orders];
    const tab = FILTER_TABS[activeFilter];
    if (tab.statuses) list = list.filter(o => tab.statuses!.includes(o.status));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, activeFilter, orders]);

  if (isLoading) return <MobileSkeletonList />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-foreground">Historique Commandes</h1>
          <Badge variant="secondary" className="ml-auto">{orders.length}</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="N° commande ou client..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 text-sm" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(i)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeFilter === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">Aucune commande trouvée</p>
          </div>
        )}
        {filtered.map(order => {
          const sc = STATUS_CONFIG[order.status];
          return (
            <button
              key={order.id}
              onClick={() => navigate(`/mobile/customers/${order.customerId}`)}
              className="w-full bg-card border border-border rounded-xl p-3 text-left active:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                <Badge className={cn("text-[10px] border-0", sc.bg, sc.text)}>{order.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{order.customerName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {order.lines.length} produit(s) • {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-foreground">{currency(order.totalAmount)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
