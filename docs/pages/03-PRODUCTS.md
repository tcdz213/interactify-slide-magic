# Products Page

## Route
`/products` — Roles: `trader`

## UI Components
- **Header**: Icon + title + count ("X of Y products") + "Add Product" button
- **Filters**: Search (name/SKU/barcode), category dropdown, status dropdown
- **Products Table**: SKU, name, category, price (DZD), stock (with reserved), unit, status badge, actions
- **ProductDrawer**: Slide-over form for create/edit product
- **ProductDetailDrawer**: Read-only detail view

## Data
- Loaded async via `fetchProducts()` service (mock API with delay simulation)
- Categories from `CATEGORIES`, Units from `UNITS`
- Product fields: id, sku, barcode, name, categoryId, baseUnitId, price, cost, stock, reserved, lowStockThreshold, status

## User Actions
| Action | Trigger | Result |
|--------|---------|--------|
| Create product | Click "+" button → fill form → save | New product added, list refreshed |
| Edit product | Click pencil icon → modify form → save | Product updated |
| Delete product | Click trash icon | Product removed (no confirmation!) |
| View detail | Click eye icon | Detail drawer opens |
| Search | Type in search field | Filters by name, SKU, barcode |
| Filter by category | Select from dropdown | Filters table |
| Filter by status | Select from dropdown | Filters by active/inactive/discontinued |

## Status Types
- `active` → green badge
- `inactive` → muted badge
- `discontinued` → red badge

## Edge Cases
- Loading state → centered spinner
- No results → "No results" message spanning all columns
- Low stock → orange bold text for available quantity
- Reserved stock → shown in parentheses next to available

## Improvements
- [ ] Bulk delete / bulk status change
- [ ] Product images upload
- [ ] Barcode scanner integration
- [ ] Product variants (size, color)
- [ ] Import/export CSV
- [ ] Pagination for large datasets
- [ ] Delete confirmation dialog
- [ ] Price history tracking
- [ ] Multi-unit pricing (wholesale vs retail)
