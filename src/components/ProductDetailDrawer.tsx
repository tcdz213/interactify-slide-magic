import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, DollarSign, Warehouse, ArrowRightLeft, History, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { Product } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { calculateBreakdown, formatBreakdown } from "@/lib/unitConversion";

interface ProductDetailDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "info" | "units" | "history" | "stock";

export default function ProductDetailDrawer({ product, open, onOpenChange }: ProductDetailDrawerProps) {
  const navigate = useNavigate();
  const { inventory, warehouses, productUnitConversions, productBaseUnits, productHistory } = useWMSData();
  const [tab, setTab] = useState<Tab>("info");

  const stockByWarehouse = useMemo(() => {
    if (!product) return [];
    const grouped = new Map<string, number>();
    inventory.filter(i => i.productId === product.id).forEach(i => grouped.set(i.warehouseId, (grouped.get(i.warehouseId) ?? 0) + i.qtyOnHand));
    return Array.from(grouped.entries()).map(([whId, qty]) => ({
      warehouseId: whId,
      warehouseName: warehouses.find(w => w.id === whId)?.name ?? whId,
      quantity: qty,
    }));
  }, [product, inventory, warehouses]);

  const totalStock = stockByWarehouse.reduce((s, w) => s + w.quantity, 0);

  const baseUnit = useMemo(() => product ? productBaseUnits.find(b => b.productId === product.id) : undefined, [product, productBaseUnits]);
  const conversions = useMemo(() => product ? productUnitConversions.filter(c => c.productId === product.id).sort((a, b) => a.conversionFactor - b.conversionFactor) : [], [product, productUnitConversions]);

  // Sprint 4: Product history for this product
  const history = useMemo(() => product ? productHistory.filter(h => h.productId === product.id).sort((a, b) => b.changedAt.localeCompare(a.changedAt)) : [], [product, productHistory]);

  const stockBreakdown = useMemo(() => {
    if (!baseUnit || conversions.length === 0 || totalStock <= 0) return null;
    return calculateBreakdown(totalStock, conversions, "sell");
  }, [baseUnit, conversions, totalStock]);

  if (!product) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Infos" },
    { key: "units", label: `Unités (${conversions.length})` },
    { key: "history", label: `Historique (${history.length})` },
    { key: "stock", label: "Stock" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {product.name}
          </SheetTitle>
          <SheetDescription>Détail produit — {product.sku}</SheetDescription>
        </SheetHeader>

        {/* Tab navigation */}
        <div className="flex gap-1 mt-4 mb-4 border-b border-border/50">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Tab: Info */}
          {tab === "info" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">SKU</p><p className="font-mono text-sm">{product.sku}</p></div>
                <div><p className="text-xs text-muted-foreground">Catégorie</p><p className="text-sm">{product.category}</p></div>
                <div><p className="text-xs text-muted-foreground">Unité affichée</p><p className="text-sm">{product.uom}</p></div>
                <div><p className="text-xs text-muted-foreground">Statut</p><StatusBadge status={product.isActive ? "active" : "inactive"} /></div>
                {baseUnit && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Unité de base (stock)</p>
                    <p className="text-sm font-semibold text-primary">{baseUnit.baseUnitName} ({baseUnit.baseUnitAbbreviation})</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Unit Conversions */}
          {tab === "units" && (
            <div className="space-y-3">
              {conversions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune conversion configurée.</p>
              ) : (
                conversions.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.unitName}</span>
                      <span className="font-mono text-xs text-muted-foreground">({c.unitAbbreviation})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">×{c.conversionFactor}</span>
                      <div className="flex gap-1">
                        {c.allowBuy && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Achat</span>}
                        {c.allowSell && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Vente</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: History (Sprint 4 — Audit Trail) */}
          {tab === "history" && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucun historique disponible.</p>
              ) : (
                history.map(h => (
                  <div key={h.id} className="rounded-lg border border-border/50 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        h.action === "created" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        h.action === "deleted" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        h.action === "cloned" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {h.action === "created" ? "Créé" : h.action === "modified" ? "Modifié" : h.action === "deleted" ? "Archivé" : h.action === "cloned" ? "Cloné" : "Restauré"}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(h.changedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Par : {h.changedBy}</p>
                    {h.reason && <p className="text-xs italic text-muted-foreground">{h.reason}</p>}
                    {h.changedFields && Object.keys(h.changedFields).length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(h.changedFields).map(([field, { oldValue, newValue }]) => (
                          <p key={field} className="text-[10px] font-mono">
                            <span className="text-muted-foreground">{field}:</span>{" "}
                            <span className="text-destructive line-through">{String(oldValue)}</span>{" → "}
                            <span className="text-emerald-600 dark:text-emerald-400">{String(newValue)}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Stock */}
          {tab === "stock" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Warehouse className="h-4 w-4" /> Stock par entrepôt
                </h3>
                <span className="text-sm font-bold">{totalStock} {baseUnit?.baseUnitAbbreviation ?? product.uom}</span>
              </div>
              {stockBreakdown && stockBreakdown.lines.length > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <p className="text-xs text-muted-foreground mb-2">Équivalent emballage :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stockBreakdown.lines.map((line, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {line.quantity} {line.unitAbbreviation}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{formatBreakdown(stockBreakdown)}</p>
                </div>
              )}
              {stockByWarehouse.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucun stock disponible</p>
              ) : (
                <div className="space-y-2">
                  {stockByWarehouse.map(sw => (
                    <div key={sw.warehouseId} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                      <p className="text-sm">{sw.warehouseName}</p>
                      <span className="font-mono text-sm font-semibold">{sw.quantity} {baseUnit?.baseUnitAbbreviation ?? ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-border/50">
            <Button variant="outline" className="w-full gap-2" onClick={() => { onOpenChange(false); navigate(`/pricing/prices?productId=${product.id}`); }}>
              <DollarSign className="h-4 w-4" /> Voir Tarification
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
