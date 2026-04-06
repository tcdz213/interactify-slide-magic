# Inventory Page

## Route
`/inventory` — Roles: `warehouse`

## UI Components
- **Header**: Warehouse icon + title + subtitle
- **KPI Cards** (4): Tracked products, total units, low stock count, critical count
- **Tab Bar**: Overview | Movements | Adjustments | Alerts (with counts)
- **Overview Tab**: Search + category filter + inventory table (SKU, product, category, total, reserved, available, status)
- **Movements Tab**: Table of stock movements (type, product, qty, before/after, reason, reference, date)
- **Adjustments Tab**: Table with approve/reject actions for pending adjustments
- **Alerts Tab**: List of stock alerts with severity

## Data
- Loaded via `Promise.all` of 4 service calls: snapshots, movements, adjustments, alerts
- Each snapshot: productId, productSku, productName, categoryId, totalStock, reserved, available, isLowStock, isCritical

## User Actions
| Action | Tab | Description |
|--------|-----|-------------|
| Search/filter | Overview | By product name/SKU and category |
| View movements | Movements | Read-only log of all stock changes |
| Approve adjustment | Adjustments | Click green check → marks as approved |
| Reject adjustment | Adjustments | Click red X → marks as rejected |
| View alerts | Alerts | Read-only list of stock alerts |

## Movement Types
- `inbound` (green arrow down), `outbound` (red arrow up), `adjustment`, `transfer`, `return`

## Status Indicators
- **OK**: Green badge with upward trend
- **Low**: Orange badge with downward trend  
- **Critical**: Red badge with alert triangle

## Edge Cases
- Loading → centered spinner
- Empty tabs → no special empty state (table just has no rows)
- Adjustment already processed → no action buttons shown

## Improvements
- [ ] Receive goods form (link to supplier PO)
- [ ] Stock transfer between warehouses
- [ ] Batch/lot tracking with expiration dates
- [ ] Inventory count / cycle count workflow
- [ ] Reorder point automation
- [ ] Stock valuation methods (FIFO, LIFO, weighted average)
- [ ] Export movements to CSV/Excel
- [ ] Barcode-based stock reception
