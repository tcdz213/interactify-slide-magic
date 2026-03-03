import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, DollarSign, Warehouse, ArrowRightLeft } from "lucide-react";
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

export default function ProductDetailDrawer({ product, open, onOpenChange }: ProductDetailDrawerProps) {
  const navigate = useNavigate();
  const { inventory, warehouses, productUnitConversions, productBaseUnits } = useWMSData();

  const stockByWarehouse = useMemo(() => {
    if (!product) return [];
    const grouped = new Map<string, number>();
    inventory
      .filter((i) => i.productId === product.id)
      .forEach((i) => grouped.set(i.warehouseId, (grouped.get(i.warehouseId) ?? 0) + i.qtyOnHand));
    return Array.from(grouped.entries()).map(([whId, qty]) => ({
      warehouseId: whId,
      warehouseName: warehouses.find((w) => w.id === whId)?.name ?? whId,
      quantity: qty,
    }));
  }, [product, inventory, warehouses]);

  const totalStock = stockByWarehouse.reduce((s, w) => s + w.quantity, 0);

  const baseUnit = useMemo(
    () => product ? productBaseUnits.find(b => b.productId === product.id) : undefined,
    [product, productBaseUnits]
  );

  const conversions = useMemo(
    () => product ? productUnitConversions.filter(c => c.productId === product.id).sort((a, b) => a.conversionFactor - b.conversionFactor) : [],
    [product, productUnitConversions]
  );

  const stockBreakdown = useMemo(() => {
    if (!baseUnit || conversions.length === 0 || totalStock <= 0) return null;
    return calculateBreakdown(totalStock, conversions, "sell");
  }, [baseUnit, conversions, totalStock]);

  if (!product) return null;

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

        <div className="mt-6 space-y-6">
          {/* Product info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informations</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="font-mono text-sm">{product.sku}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Catégorie</p>
                <p className="text-sm">{product.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unité affichée</p>
                <p className="text-sm">{product.uom}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Statut</p>
                <StatusBadge status={product.isActive ? "active" : "inactive"} />
              </div>
              {baseUnit && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Unité de base (stock)</p>
                  <p className="text-sm font-semibold text-primary">{baseUnit.baseUnitName} ({baseUnit.baseUnitAbbreviation})</p>
                </div>
              )}
            </div>
          </div>

          {/* Unit Conversions */}
          {conversions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4" /> Conversions d'unités
              </h3>
              <div className="space-y-1.5">
                {conversions.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.unitName}</span>
                      <span className="font-mono text-xs text-muted-foreground">({c.unitAbbreviation})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">×{c.conversionFactor}</span>
                      <div className="flex gap-1">
                        {c.allowBuy && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Achat</span>}
                        {c.allowSell && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Vente</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock summary with breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Warehouse className="h-4 w-4" /> Stock par entrepôt
              </h3>
              <span className="text-sm font-bold">
                {totalStock} {baseUnit?.baseUnitAbbreviation ?? product.uom}
              </span>
            </div>

            {/* Stock breakdown visualization */}
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
                {stockByWarehouse.map((sw) => (
                  <div key={sw.warehouseId} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <p className="text-sm">{sw.warehouseName}</p>
                    <span className="font-mono text-sm font-semibold">
                      {sw.quantity} {baseUnit?.baseUnitAbbreviation ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate(`/pricing/prices?productId=${product.id}`);
              }}
            >
              <DollarSign className="h-4 w-4" /> Voir Tarification
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
