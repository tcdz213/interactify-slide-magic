import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, History, Save, TrendingUp, TrendingDown, Minus, Pencil, ExternalLink } from "lucide-react";
import { useFinancialTracking } from "@/contexts/FinancialTrackingContext";
import { useAuth } from "@/contexts/AuthContext";
import { currency } from "@/data/mockData";
import type { Product } from "@/data/mockData";
import type { ProductPrice, PriceHistoryEntry } from "@/modules/pricing/pricing.types";
import { calcMargin } from "@/modules/pricing/pricing.types";
import { toast } from "@/hooks/use-toast";

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductPricingDialog({ product, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { pricingStore } = useFinancialTracking();
  const { currentUser } = useAuth();
  const [editingCtId, setEditingCtId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const activeClientTypes = useMemo(
    () => pricingStore.clientTypes.filter((ct) => ct.status === "active"),
    [pricingStore.clientTypes]
  );

  const productPrices = useMemo(() => {
    if (!product) return [];
    return pricingStore.productPrices.filter((pp) => pp.productId === product.id);
  }, [pricingStore.productPrices, product]);

  const priceMap = useMemo(() => {
    const m = new Map<string, ProductPrice>();
    productPrices.forEach((pp) => m.set(pp.clientTypeId, pp));
    return m;
  }, [productPrices]);

  // All history entries for this product's prices
  const allHistory = useMemo(() => {
    if (!product) return [];
    const ppIds = new Set(productPrices.map((pp) => pp.id));
    return pricingStore.priceHistory
      .filter((h) => ppIds.has(h.productPriceId))
      .sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  }, [pricingStore.priceHistory, productPrices, product]);

  const costHistory = useMemo(
    () => allHistory.filter((h) => h.changeType === "cost"),
    [allHistory]
  );

  const priceHistory = useMemo(
    () => allHistory.filter((h) => h.changeType !== "cost"),
    [allHistory]
  );

  const startEdit = (ctId: string, currentPrice: number) => {
    setEditingCtId(ctId);
    setEditPrice(currentPrice);
  };

  const handleSave = async (ctId: string) => {
    if (!product) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    pricingStore.upsertPrice(
      {
        productId: product.id,
        clientTypeId: ctId,
        unitPrice: editPrice,
        approvalStatus: "pending",
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name ?? "system",
      },
      currentUser?.name ?? "system"
    );
    toast({ title: "Prix mis à jour", description: `${product.name} — ${activeClientTypes.find((c) => c.id === ctId)?.name}` });
    setEditingCtId(null);
    setSaving(false);
  };

  const getCtName = (ppId: string) => {
    const pp = pricingStore.productPrices.find((p) => p.id === ppId);
    if (!pp) return "—";
    return activeClientTypes.find((c) => c.id === pp.clientTypeId)?.name ?? pp.clientTypeId;
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tarification — {product.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>SKU : {product.sku} · Coût : {currency(product.unitCost)} · Prix catalogue : {currency(product.unitPrice)}</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs gap-1 text-primary"
              onClick={() => {
                onOpenChange(false);
                navigate(`/pricing/prices?productId=${product.id}`);
              }}
            >
              <ExternalLink className="h-3 w-3" />
              Voir dans la Grille Tarifaire
            </Button>
          </p>
        </DialogHeader>

        <Tabs defaultValue="prices" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prices">Prix par type client</TabsTrigger>
            <TabsTrigger value="cost-history">Historique coût</TabsTrigger>
            <TabsTrigger value="price-history">Historique prix</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Prices by client type ── */}
          <TabsContent value="prices" className="flex-1 overflow-auto mt-4">
            <div className="space-y-2">
              {activeClientTypes.map((ct) => {
                const pp = priceMap.get(ct.id);
                const price = pp?.unitPrice ?? product.unitPrice;
                const margin = calcMargin(price, product.unitCost);
                const isEditing = editingCtId === ct.id;

                return (
                  <div
                    key={ct.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{ct.name}</p>
                      <p className="text-xs text-muted-foreground">{ct.description}</p>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-28 h-8 text-sm"
                          autoFocus
                        />
                        <Button size="sm" variant="default" onClick={() => handleSave(ct.id)} disabled={saving} className="h-8 gap-1">
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCtId(null)} className="h-8">
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{currency(price)}</p>
                          <MarginBadgeInline margin={margin} />
                        </div>
                        {pp?.approvalStatus === "pending" && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">En attente</Badge>
                        )}
                        <button
                          onClick={() => startEdit(ct.id, price)}
                          className="p-1.5 rounded-md hover:bg-muted"
                          title="Modifier le prix"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {activeClientTypes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun type client actif.</p>
              )}
            </div>
          </TabsContent>

          {/* ── Tab 2: Cost History ── */}
          <TabsContent value="cost-history" className="flex-1 overflow-auto mt-4">
            <HistoryTable entries={costHistory} getCtName={getCtName} type="cost" />
          </TabsContent>

          {/* ── Tab 3: Price History ── */}
          <TabsContent value="price-history" className="flex-1 overflow-auto mt-4">
            <HistoryTable entries={priceHistory} getCtName={getCtName} type="price" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function MarginBadgeInline({ margin }: { margin: number }) {
  const color = margin >= 25 ? "text-emerald-600" : margin >= 10 ? "text-amber-600" : "text-destructive";
  const Icon = margin > 0 ? TrendingUp : margin < 0 ? TrendingDown : Minus;
  return (
    <span className={`text-xs flex items-center gap-0.5 ${color}`}>
      <Icon className="h-3 w-3" />
      {margin.toFixed(1)}%
    </span>
  );
}

function HistoryTable({
  entries,
  getCtName,
  type,
}: {
  entries: PriceHistoryEntry[];
  getCtName: (ppId: string) => string;
  type: "cost" | "price";
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <History className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">Aucun historique {type === "cost" ? "de coût" : "de prix"} disponible.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-muted-foreground">
            <th className="text-left px-3 py-2 font-medium">Date</th>
            <th className="text-left px-3 py-2 font-medium">Type client</th>
            <th className="text-right px-3 py-2 font-medium">
              {type === "cost" ? "Ancien coût" : "Ancien prix"}
            </th>
            <th className="text-right px-3 py-2 font-medium">
              {type === "cost" ? "Nouveau coût" : "Nouveau prix"}
            </th>
            <th className="text-right px-3 py-2 font-medium">Marge</th>
            <th className="text-left px-3 py-2 font-medium">Par</th>
            {type === "price" && <th className="text-left px-3 py-2 font-medium">Raison</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((h) => {
            const oldVal = type === "cost" ? h.oldCost : h.oldPrice;
            const newVal = type === "cost" ? h.newCost : h.newPrice;
            const diff = newVal - oldVal;
            return (
              <tr key={h.id} className="border-b border-border/30 hover:bg-muted/20">
                <td className="px-3 py-2 text-xs">
                  {new Date(h.changedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-3 py-2 text-xs">{getCtName(h.productPriceId)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{currency(oldVal)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  <span className={diff > 0 ? "text-emerald-600" : diff < 0 ? "text-destructive" : ""}>
                    {currency(newVal)}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <MarginBadgeInline margin={h.newMargin} />
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{h.changedBy}</td>
                {type === "price" && (
                  <td className="px-3 py-2 text-xs text-muted-foreground">{h.reason ?? "—"}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
