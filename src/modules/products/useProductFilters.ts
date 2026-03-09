import { useState, useMemo } from "react";
import type { Product } from "@/data/mockData";
import type { InventoryItem } from "@/data/transactionalData";
import type { ProductCategory, SubCategory, Sector } from "@/data/masterData";

interface UseProductFiltersOptions {
  products: Product[];
  inventory: InventoryItem[];
  productCategories: ProductCategory[];
  subCategories: SubCategory[];
  sectors: Sector[];
}

export function useProductFilters({ products, inventory, productCategories, subCategories, sectors }: UseProductFiltersOptions) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterWh, setFilterWh] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [filterSubCat, setFilterSubCat] = useState("all");

  // Map category name → sectorId for filtering
  const catNameToSectorId = useMemo(() => {
    const map = new Map<string, string>();
    productCategories.forEach(c => map.set(c.name, c.sectorId));
    return map;
  }, [productCategories]);

  // Map category name → categoryId for subcategory resolution
  const catNameToId = useMemo(() => {
    const map = new Map<string, string>();
    productCategories.forEach(c => map.set(c.name, c.id));
    return map;
  }, [productCategories]);

  const stockTotals = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((i) => map.set(i.productId, (map.get(i.productId) ?? 0) + i.qtyOnHand));
    return map;
  }, [inventory]);

  const productIdsInWarehouse = useMemo(() => {
    if (filterWh === "all") return null;
    return new Set(inventory.filter(inv => inv.warehouseId === filterWh).map(inv => inv.productId));
  }, [inventory, filterWh]);

  // Categories filtered by selected sector
  const categoriesForSector = useMemo(() => {
    if (filterSector === "all") return productCategories;
    return productCategories.filter(c => c.sectorId === filterSector);
  }, [productCategories, filterSector]);

  const categories = useMemo(() => categoriesForSector.map(c => c.name), [categoriesForSector]);

  // Subcategories filtered by selected category
  const subCategoriesForCat = useMemo(() => {
    if (filterCat === "all") {
      // Show subcategories for all categories in current sector scope
      const catIds = new Set(categoriesForSector.map(c => c.id));
      return subCategories.filter(sc => catIds.has(sc.categoryId));
    }
    const catId = catNameToId.get(filterCat);
    if (!catId) return [];
    return subCategories.filter(sc => sc.categoryId === catId);
  }, [filterCat, categoriesForSector, subCategories, catNameToId]);

  // Build subcategory lookup for table display
  const subCatMap = useMemo(() => {
    const map = new Map<string, string>();
    subCategories.forEach(sc => map.set(sc.id, sc.name));
    return map;
  }, [subCategories]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (p.isDeleted) return false;
      if (filterSector !== "all" && catNameToSectorId.get(p.category) !== filterSector) return false;
      if (filterCat !== "all" && p.category !== filterCat) return false;
      if (filterSubCat !== "all" && p.subcategoryId !== filterSubCat) return false;
      if (productIdsInWarehouse !== null && !productIdsInWarehouse.has(p.id)) return false;
      if (filterStatus === "active" && !p.isActive) return false;
      if (filterStatus === "inactive" && p.isActive) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, search, filterSector, filterCat, filterSubCat, productIdsInWarehouse, filterStatus, catNameToSectorId]);

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
    filterSector, setFilterSector,
    filterSubCat, setFilterSubCat,
    stockTotals, filtered, categories,
    sectors, subCategoriesForCat, subCatMap,
    activeCount, criticalStockCount,
    avgCost, avgPrice,
  };
}
