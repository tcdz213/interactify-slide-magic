import { useState, useMemo } from "react";
import type { Product } from "@/data/mockData";
import type { InventoryItem } from "@/data/transactionalData";

interface UseProductFiltersOptions {
  products: Product[];
  inventory: InventoryItem[];
}

export function useProductFilters({ products, inventory }: UseProductFiltersOptions) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterWh, setFilterWh] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const stockTotals = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((i) => map.set(i.productId, (map.get(i.productId) ?? 0) + i.qtyOnHand));
    return map;
  }, [inventory]);

  const productIdsInWarehouse = useMemo(() => {
    if (filterWh === "all") return null;
    return new Set(inventory.filter(inv => inv.warehouseId === filterWh).map(inv => inv.productId));
  }, [inventory, filterWh]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (p.isDeleted) return false;
      if (filterCat !== "all" && p.category !== filterCat) return false;
      if (productIdsInWarehouse !== null && !productIdsInWarehouse.has(p.id)) return false;
      if (filterStatus === "active" && !p.isActive) return false;
      if (filterStatus === "inactive" && p.isActive) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, search, filterCat, productIdsInWarehouse, filterStatus]);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const activeCount = useMemo(() => products.filter(p => p.isActive).length, [products]);
  const criticalStockCount = useMemo(() => {
    return products.filter(p => (stockTotals.get(p.id) ?? 0) < 20).length;
  }, [products, stockTotals]);

  const avgCost = useMemo(() => Math.round(filtered.reduce((s, p) => s + p.unitCost, 0) / (filtered.length || 1)), [filtered]);
  const avgPrice = useMemo(() => Math.round(filtered.reduce((s, p) => s + p.unitPrice, 0) / (filtered.length || 1)), [filtered]);

  return {
    search, setSearch,
    filterCat, setFilterCat,
    filterWh, setFilterWh,
    filterStatus, setFilterStatus,
    stockTotals, filtered, categories,
    activeCount, criticalStockCount,
    avgCost, avgPrice,
  };
}
