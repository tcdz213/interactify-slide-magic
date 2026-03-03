/**
 * U-08 — Warehouse Stock Dashboard with multi-unit toggle
 * Shows stock per warehouse with toggle: Stock Unit / Base Unit / All
 */
import { useState, useMemo } from "react";
import { Warehouse, Package, ArrowLeftRight } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { fromBaseUnits } from "@/lib/unitConversion";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type UnitMode = "stock" | "base" | "all";

export default function WarehouseStockDashboard() {
  const { products, inventory, warehouses, productUnitConversions } = useWMSData();
  const { getStockUnitFactor, getBaseUnitAbbr, getUnitsForProduct } = useUnitConversion();

  const [unitMode, setUnitMode] = useState<UnitMode>("stock");
  const [selectedWh, setSelectedWh] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Aggregate inventory by product + warehouse
  const stockRows = useMemo(() => {
    const map = new Map<string, { productId: string; warehouseId: string; qtyOnHand: number; qtyReserved: number; qtyAvailable: number }>();
    inventory.forEach(inv => {
      if (selectedWh !== "all" && inv.warehouseId !== selectedWh) return;
      const key = `${inv.productId}::${inv.warehouseId}`;
      const existing = map.get(key);
      if (existing) {
        existing.qtyOnHand += inv.qtyOnHand;
        existing.qtyReserved += inv.qtyReserved;
        existing.qtyAvailable += inv.qtyAvailable;
      } else {
        map.set(key, { productId: inv.productId, warehouseId: inv.warehouseId, qtyOnHand: inv.qtyOnHand, qtyReserved: inv.qtyReserved, qtyAvailable: inv.qtyAvailable });
      }
    });
    return Array.from(map.values());
  }, [inventory, selectedWh]);

  // Filtered + enriched rows
  const rows = useMemo(() => {
    return stockRows
      .map(row => {
        const product = products.find(p => p.id === row.productId);
        const wh = warehouses.find(w => w.id === row.warehouseId);
        if (!product || product.isDeleted) return null;
        if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !product.sku.toLowerCase().includes(search.toLowerCase())) return null;

        const baseAbbr = getBaseUnitAbbr(row.productId);
        const stockFactor = getStockUnitFactor(row.productId);
        const stockUom = product.uom;

        // Base qty is always the raw inventory qty (stored in base units)
        const baseQty = row.qtyOnHand;
        const stockQty = fromBaseUnits(row.qtyOnHand, stockFactor);
        const baseAvail = row.qtyAvailable;
        const stockAvail = fromBaseUnits(row.qtyAvailable, stockFactor);

        // All units for this product
        const allUnits = getUnitsForProduct(row.productId, "sell");

        // Stock fill level (0-100)
        const reorderPoint = product.reorderPoint ?? 0;
        const fillPct = reorderPoint > 0 ? Math.min(100, Math.round((baseQty / (reorderPoint * 2)) * 100)) : 50;

        return {
          ...row,
          product,
          warehouse: wh,
          baseAbbr,
          stockUom,
          stockFactor,
          baseQty,
          stockQty,
          baseAvail,
          stockAvail,
          allUnits,
          fillPct,
          isCritical: reorderPoint > 0 && baseQty < reorderPoint,
        };
      })
      .filter(Boolean) as NonNullable<ReturnType<typeof Object>>[];
  }, [stockRows, products, warehouses, search, getBaseUnitAbbr, getStockUnitFactor, getUnitsForProduct]);

  // KPIs
  const totalProducts = new Set(rows.map(r => r.productId)).size;
  const criticalCount = rows.filter(r => r.isCritical).length;
  const totalBaseValue = rows.reduce((s, r) => s + r.baseQty * (r.product.unitCost ?? 0), 0);

  const formatQty = (qty: number, decimals = 2) => {
    if (Number.isInteger(qty)) return qty.toLocaleString("fr-DZ");
    return qty.toLocaleString("fr-DZ", { maximumFractionDigits: decimals });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Warehouse className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tableau de bord Stock</h1>
            <p className="text-sm text-muted-foreground">
              Vue multi-unités du stock par entrepôt
            </p>
          </div>
        </div>

        {/* Unit mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">Affichage :</span>
          <ToggleGroup type="single" value={unitMode} onValueChange={(v) => v && setUnitMode(v as UnitMode)} variant="outline" size="sm">
            <ToggleGroupItem value="stock" className="text-xs gap-1">
              <Package className="h-3.5 w-3.5" /> Unité stock
            </ToggleGroupItem>
            <ToggleGroupItem value="base" className="text-xs gap-1">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Unité base
            </ToggleGroupItem>
            <ToggleGroupItem value="all" className="text-xs gap-1">
              Toutes
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Produits en stock</p>
          <p className="text-xl font-semibold">{totalProducts}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Lignes stock</p>
          <p className="text-xl font-semibold">{rows.length}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Stock critique</p>
          <p className="text-xl font-semibold text-destructive">{criticalCount}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Valeur totale</p>
          <p className="text-xl font-semibold">{(totalBaseValue / 1_000_000).toFixed(1)} M DA</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Rechercher produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-9"
        />
        <Select value={selectedWh} onValueChange={setSelectedWh}>
          <SelectTrigger className="w-64 h-9">
            <SelectValue placeholder="Entrepôt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les entrepôts</SelectItem>
            {warehouses.map(w => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Produit</TableHead>
                <TableHead>Entrepôt</TableHead>
                {unitMode === "stock" && <TableHead className="text-right">Qté (Stock)</TableHead>}
                {unitMode === "base" && <TableHead className="text-right">Qté (Base)</TableHead>}
                {unitMode === "all" && (
                  <>
                    <TableHead className="text-right">Qté Stock</TableHead>
                    <TableHead className="text-right">Qté Base</TableHead>
                    <TableHead>Autres unités</TableHead>
                  </>
                )}
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="w-[120px]">Niveau</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i} className={row.isCritical ? "bg-destructive/5" : ""}>
                  <TableCell>
                    <div>
                      <span className="font-medium text-sm">{row.product.name}</span>
                      <span className="block text-xs text-muted-foreground">{row.product.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{row.warehouse?.name ?? row.warehouseId}</span>
                  </TableCell>

                  {unitMode === "stock" && (
                    <TableCell className="text-right font-mono text-sm">
                      {formatQty(row.stockQty)} <span className="text-muted-foreground text-xs">{row.stockUom}</span>
                    </TableCell>
                  )}

                  {unitMode === "base" && (
                    <TableCell className="text-right font-mono text-sm">
                      {formatQty(row.baseQty)} <span className="text-muted-foreground text-xs">{row.baseAbbr}</span>
                    </TableCell>
                  )}

                  {unitMode === "all" && (
                    <>
                      <TableCell className="text-right font-mono text-sm">
                        {formatQty(row.stockQty)} <span className="text-muted-foreground text-xs">{row.stockUom}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatQty(row.baseQty)} <span className="text-muted-foreground text-xs">{row.baseAbbr}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.allUnits
                            .filter((u: any) => u.conversionFactor !== 1 && !u.isStockUnit)
                            .slice(0, 3)
                            .map((u: any) => {
                              const qty = fromBaseUnits(row.baseQty, u.conversionFactor);
                              return (
                                <Tooltip key={u.id}>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                                      {formatQty(qty, 1)} {u.unitAbbreviation}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>{u.unitName}: {formatQty(qty)} {u.unitAbbreviation}</TooltipContent>
                                </Tooltip>
                              );
                            })}
                        </div>
                      </TableCell>
                    </>
                  )}

                  <TableCell className="text-right font-mono text-sm">
                    {unitMode === "base"
                      ? <>{formatQty(row.baseAvail)} <span className="text-muted-foreground text-xs">{row.baseAbbr}</span></>
                      : <>{formatQty(row.stockAvail)} <span className="text-muted-foreground text-xs">{row.stockUom}</span></>
                    }
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.fillPct} className="h-2 w-16" />
                      {row.isCritical && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Critique</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={unitMode === "all" ? 7 : 5} className="text-center py-8 text-muted-foreground">
                    Aucun stock trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
