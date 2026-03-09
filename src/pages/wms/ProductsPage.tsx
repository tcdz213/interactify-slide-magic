import { useState } from "react";
import { Package, Plus, Download } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialTracking } from "@/contexts/FinancialTrackingContext";
import { canViewFinancials } from "@/lib/rbac";
import { useTranslation } from "react-i18next";
import type { Product } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { useSortableTable } from "@/components/SortableHeader";
import { useColumnVisibility, type ColumnDef } from "@/components/ColumnToggle";
import EmptyState from "@/components/EmptyState";
import ExportDialog from "@/components/ExportDialog";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { RBACGuard } from "@/components/RBACGuard";
import ProductDetailDrawer from "@/components/ProductDetailDrawer";
import ProductPricingDialog from "@/components/ProductPricingDialog";
import ProductUnitsDialog from "@/modules/products/ProductUnitsDialog";
import type { ExportColumn } from "@/lib/exportUtils";

import { useProductFilters } from "@/modules/products/useProductFilters";
import { useProductCRUD } from "@/modules/products/useProductCRUD";
import { ProductKPICards } from "@/modules/products/ProductKPICards";
import { ProductFilterBar } from "@/modules/products/ProductFilterBar";
import { ProductTable } from "@/modules/products/ProductTable";
import { ProductFormDialog } from "@/modules/products/ProductFormDialog";
import { ProductDeleteDialog } from "@/modules/products/ProductDeleteDialog";

const COLUMNS: ColumnDef[] = [
  { key: "sku", label: "SKU", alwaysVisible: true },
  { key: "name", label: "Nom", alwaysVisible: true },
  { key: "category", label: "Catégorie" },
  { key: "subcategory", label: "Sous-catégorie" },
  { key: "uom", label: "Unité base" },
  { key: "conversions", label: "Conversions" },
  { key: "stock", label: "Stock Total" },
  { key: "status", label: "Statut" },
  { key: "actions", label: "Actions", alwaysVisible: true },
];

const EXPORT_COLUMNS: ExportColumn<Product>[] = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Nom" },
  { key: "category", label: "Catégorie" },
  { key: "uom", label: "Unité" },
];

export default function ProductsPage() {
  const { products, setProducts, productCategories, subCategories, sectors, unitsOfMeasure, warehouses, inventory, purchaseOrders, salesOrders, productHistory, setProductHistory } = useWMSData();
  const { currentUser } = useAuth();
  const { onProductCostChanged } = useFinancialTracking();
  const showFinancials = currentUser ? canViewFinancials(currentUser) : false;

  const filters = useProductFilters({ products, inventory, productCategories, subCategories, sectors });
  const { filtered, categories, activeCount, criticalStockCount, avgCost, avgPrice, stockTotals, subCatMap } = filters;

  const { sorted, sortKey, sortDir, onSort } = useSortableTable(filtered);
  const { visible, toggle, isVisible } = useColumnVisibility(COLUMNS);
  const { paginatedItems, currentPage, totalPages, setCurrentPage, pageSize, setPageSize, totalItems } = usePagination(sorted, 10);

  const crud = useProductCRUD({
    products, setProducts, stockTotals, purchaseOrders, salesOrders,
    onCostChanged: onProductCostChanged,
    currentUserName: currentUser?.name,
    productHistory, setProductHistory,
  });

  const [exportOpen, setExportOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [pricingProduct, setPricingProduct] = useState<Product | null>(null);
  const [unitsProduct, setUnitsProduct] = useState<Product | null>(null);
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("productPage.catalog")}</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} {t("common.product").toLowerCase()}{filtered.length > 1 ? "s" : ""}{" "}
              {filters.filterWh !== "all" ? `${t("productPage.inWarehouse", { name: warehouses.find(w => w.id === filters.filterWh)?.name ?? filters.filterWh })}` : t("productPage.referenced")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1">
            <Download className="h-4 w-4" /> {t("common.export")}
          </Button>
          <RBACGuard permission="manage_products">
            <Button onClick={crud.openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t("productPage.newProduct")}</Button>
          </RBACGuard>
        </div>
      </div>

      <ProductKPICards
        totalProducts={filtered.length}
        categoriesCount={categories.length}
        activeCount={activeCount}
        criticalStockCount={criticalStockCount}
        avgCost={avgCost}
        avgPrice={avgPrice}
      />

      <ProductFilterBar
        search={filters.search} onSearchChange={filters.setSearch}
        filterSector={filters.filterSector} onFilterSectorChange={filters.setFilterSector}
        filterWh={filters.filterWh} onFilterWhChange={filters.setFilterWh}
        filterCat={filters.filterCat} onFilterCatChange={filters.setFilterCat}
        filterSubCat={filters.filterSubCat} onFilterSubCatChange={filters.setFilterSubCat}
        filterStatus={filters.filterStatus} onFilterStatusChange={filters.setFilterStatus}
        warehouses={warehouses} categories={categories}
        sectors={filters.sectors} subCategories={filters.subCategoriesForCat}
        columns={COLUMNS} visible={visible} onToggle={toggle}
      />

      <div className="glass-card rounded-xl overflow-hidden">
        <ProductTable
          items={paginatedItems}
          isVisible={isVisible}
          sortKey={sortKey} sortDir={sortDir} onSort={onSort}
          onView={setDetailProduct}
          onEdit={crud.openEdit}
          onPricing={setPricingProduct}
          onToggle={crud.handleToggleActive}
          onDelete={crud.setDeleteConfirm}
          onUnits={setUnitsProduct}
           onClone={crud.handleClone}
           subCatMap={subCatMap}
        />
        {filtered.length === 0 && (
          <EmptyState
            icon={Package}
            title="Aucun produit trouvé"
            description="Essayez de modifier vos filtres ou créez un nouveau produit."
            actionLabel="Nouveau produit"
            onAction={crud.openCreate}
          />
        )}
        <DataTablePagination
          currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
          pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={totalItems}
        />
      </div>

      <ProductDetailDrawer product={detailProduct} open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)} />
      <ProductPricingDialog product={pricingProduct} open={!!pricingProduct} onOpenChange={(open) => !open && setPricingProduct(null)} />
      <ProductUnitsDialog product={unitsProduct} open={!!unitsProduct} onOpenChange={(open) => !open && setUnitsProduct(null)} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={EXPORT_COLUMNS} filename="produits" />

      <ProductFormDialog
        open={crud.showForm} onOpenChange={crud.setShowForm}
        editing={crud.editing} form={crud.form} setForm={crud.setForm}
        formErrors={crud.formErrors} setFormErrors={crud.setFormErrors}
        isSubmitting={crud.isSubmitting} showFinancials={showFinancials}
        productCategories={productCategories} unitsOfMeasure={unitsOfMeasure}
        onSave={crud.handleSave}
      />

      <ProductDeleteDialog
        product={crud.deleteConfirm}
        reasons={crud.deleteReasons}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteConfirm(null)}
      />
    </div>
  );
}
