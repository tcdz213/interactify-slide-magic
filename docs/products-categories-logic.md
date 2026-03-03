# Produits & Catégories — Logique, Relations et Flux

## 1. Data Model

### Product (`Product` — `src/data/masterData.ts`)
```ts
{
  id: string;          // "P001", "P-XXXXXXXX"
  name: string;        // "Ciment CPJ 42.5 (50kg)"
  sku: string;         // "CONST-001" — unique, alphanumeric + dashes
  category: string;    // ⚠ TEXT reference to ProductCategory.name (not ID!)
  uom: string;         // Base unit label ("Sac", "Pièce", "m²")
  baseUnitId?: string; // FK → UnitOfMeasure.id (optional)
  unitCost: number;
  unitPrice: number;
  reorderPoint: number;
  isActive: boolean;
  isDeleted?: boolean; // Soft-delete flag
}
```

### ProductCategory (`ProductCategory` — `src/data/masterData.ts`)
```ts
{
  id: string;          // "CAT-001"
  name: string;        // "Ciment & Liants" — used as FK by Product.category
  parentId?: string;   // Hierarchical parent (defined in type, unused in UI)
  description: string;
  productCount: number; // Static seed value (overridden by dynamic count in UI)
  status: "Active" | "Inactive";
}
```

## 2. Relationship Diagram

```
┌──────────────────────┐         ┌──────────────────────┐
│    ProductCategory   │◄────────│       Product         │
│                      │  by     │                       │
│  id: "CAT-001"       │  name   │  category: "Ciment…"  │
│  name: "Ciment…"     │ (text)  │  sku: "CONST-001"     │
│  status: Active      │         │  isActive: true       │
│  parentId?: …        │         │  isDeleted?: false    │
└──────────────────────┘         └───────────┬───────────┘
                                             │
                                             │ productId
                                             ▼
                                 ┌───────────────────────┐
                                 │    InventoryItem       │
                                 │  productId → Product.id│
                                 │  warehouseId           │
                                 │  qtyOnHand             │
                                 └───────────────────────┘
```

### ⚠ Key Issue: Category Link is by NAME, not by ID
- `Product.category` stores the **category name string** (e.g. `"Ciment & Liants"`)
- This is **NOT** a foreign key to `ProductCategory.id`
- Renaming a category does NOT automatically update products

## 3. State Management (`WMSDataContext`)

Both `products` and `productCategories` live as React state arrays in `WMSDataContext`:

| State | Setter | Used by |
|-------|--------|---------|
| `products` | `setProducts` | ProductsPage, filters, orders, inventory |
| `productCategories` | `setProductCategories` | CategoriesPage, ProductFormDialog (dropdown) |
| `inventory` | `setInventory` | Stock totals per product |

## 4. Action Flows

### 4.1 Create Product (`ProductsPage → useProductCRUD`)
```
User clicks "+ Nouveau produit"
  → openCreate() → empty form opens
  → User fills: name, sku, category (dropdown from productCategories), uom, costs…
  → handleSave()
     ├─ Zod validation (productSchema)
     ├─ SKU uniqueness check against existing products
     ├─ Generate ID: "P-{uuid8}"
     └─ setProducts(prev => [...prev, newProduct])
```

### 4.2 Edit Product
```
User clicks pencil icon on product row
  → openEdit(product) → form pre-filled
  → handleSave()
     ├─ Zod validation
     ├─ SKU uniqueness (excluding self)
     ├─ setProducts(prev => prev.map(…))
     └─ If unitCost changed → onCostChanged() callback (financial tracking)
```

### 4.3 Delete Product (Soft Delete)
```
User clicks trash icon
  → setDeleteConfirm(product)
  → Delete dialog opens
  → getDeleteBlockReasons() checks:
     ├─ Stock > 0 in inventory? → BLOCKED
     ├─ Open Purchase Orders? → BLOCKED
     └─ Open Sales Orders? → BLOCKED
  → If no blockers: setProducts(prev => prev.map(p => 
       p.id === id ? { ...p, isActive: false, isDeleted: true } : p
     ))
  → Product is archived (soft delete), NOT removed from array
```

### 4.4 Toggle Active/Inactive
```
User clicks toggle switch
  → handleToggleActive(product)
  → If deactivating:
     └─ Check open Sales Orders → BLOCKED if any
  → setProducts(prev => prev.map(p => { ...p, isActive: !p.isActive }))
```

### 4.5 Create Category (`CategoriesPage`)
```
User clicks "+ Nouvelle catégorie"
  → openCreate() → empty form (name, description, status)
  → handleSave()
     ├─ Duplicate name check (case-insensitive)
     └─ setData(prev => [...prev, { id: "CAT-{n}", ...form }])
```

### 4.6 Edit Category
```
User clicks pencil icon
  → openEdit(category) → form pre-filled
  → handleSave()
     ├─ Duplicate name check (excluding self)
     ├─ setData(prev => prev.map(…))
     └─ ⚠ If name changed: toast warns user but does NOT update products!
```

### 4.7 Delete Category
```
User clicks trash icon
  → dynamicCounts checks: how many non-deleted products use this category name?
  → If count > 0 → BLOCKED (toast: "Réassignez d'abord")
  → If count = 0 → confirm dialog → setData(prev => prev.filter(…))
  → ⚠ HARD delete (removed from array, not soft-deleted)
```

## 5. Filter & Display Flow (Products)

```
useProductFilters()
  ├─ search: matches product name or SKU
  ├─ filterCat: matches Product.category (name string)
  ├─ filterWh: filters by warehouse via inventory items
  ├─ filterStatus: "active" | "inactive" | "all"
  └─ Computed:
       ├─ stockTotals: Map<productId, totalQty> from inventory
       ├─ categories: unique category names from products
       ├─ activeCount, criticalStockCount
       └─ avgCost, avgPrice
```

## 6. Cross-Module Dependencies

| Module | How it uses Products/Categories |
|--------|-------------------------------|
| **Purchase Orders** | PO lines reference `productId` |
| **Sales Orders** | SO lines reference `productId` |
| **Inventory** | `InventoryItem.productId` → stock levels |
| **GRN** | Goods receipt lines reference `productId` |
| **Pricing** | Price rules reference products |
| **Unit Conversions** | `productUnitConversions` keyed by `productId` |
| **Stock Adjustments** | Reference `productId` |
| **Cycle Counts** | Reference `productId` |
| **Delete Guard** | Checks PO, SO, Inventory before allowing delete |

## 7. Known Issues & UX Improvement Opportunities

### 🔴 Critical
1. **Category → Product link is by name, not ID**
   - Renaming a category breaks the link to all its products
   - Fix: migrate `Product.category` to store `categoryId` and resolve name at display time

2. **No cascade rename**
   - CategoriesPage warns but doesn't update products when a category name changes
   - Fix: on category rename, bulk-update all `product.category` that match old name

### 🟡 Important
3. **Category delete is hard-delete vs product soft-delete**
   - Inconsistent: products use `isDeleted` flag, categories are removed from array
   - Fix: add `isDeleted` to `ProductCategory` for consistency

4. **`productCount` on category is static seed data**
   - The UI dynamically computes it via `dynamicCounts`, but the field still exists
   - Fix: remove `productCount` from `ProductCategory` type or keep it as cache

5. **No category on product form validates against active categories only**
   - An inactive category can still appear in dropdowns
   - Fix: filter category dropdown to `status === "Active"` only

### 🟢 Nice to Have
6. **No category hierarchy in UI**
   - `parentId` exists in the type but is unused
   - Opportunity: tree view, breadcrumb trail, nested filtering

7. **No category-level defaults**
   - Could set default UOM, default reorder point, or pricing rules per category

8. **No bulk category reassignment**
   - When merging/renaming categories, no way to reassign products in bulk

9. **Filter bar on CategoriesPage is minimal**
   - Only search by name; no status filter, no sort

10. **No visual indicator linking category count to products**
    - Clicking the count badge could navigate to products filtered by that category

## 8. Suggested Improvements (Priority Order)

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 1 | Migrate category link to `categoryId` FK | Fixes data integrity | Medium |
| 2 | Auto-cascade category rename to products | Prevents broken links | Low |
| 3 | Filter inactive categories from product form | Better UX | Low |
| 4 | Click category count → navigate to filtered products | Discovery | Low |
| 5 | Add status filter & sort to CategoriesPage | Consistency | Low |
| 6 | Bulk reassign products when deleting/merging category | Power user feature | Medium |
| 7 | Category hierarchy (tree view) | Visual clarity | High |
| 8 | Category-level default settings | Reduces data entry | Medium |
