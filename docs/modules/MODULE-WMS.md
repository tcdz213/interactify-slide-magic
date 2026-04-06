# Module: Warehouse Management System (WMS)

## Overview
The WMS module handles all warehouse operations: inventory tracking, stock movements, goods reception, and stock adjustments.

## Pages
- `/inventory` — Stock overview, movements, adjustments, alerts
- `/suppliers` — Supplier management, purchase orders, receiving, reconciliation

## Core Data Models

### Product
```ts
{ id, sku, barcode, name, categoryId, baseUnitId, price, cost, stock, reserved, lowStockThreshold, status, dimensions, weight }
```

### InventorySnapshot
```ts
{ productId, productSku, productName, categoryId, totalStock, reserved, available, isLowStock, isCritical, lastMovement }
```

### StockMovement
```ts
{ id, productId, type, quantity, previousStock, newStock, reason, reference, createdBy, createdAt }
```

## Workflows

### Goods Reception
1. Supplier sends goods with a delivery note
2. Warehouse receives → creates GoodsReceipt (linked to PO)
3. Qty received vs ordered compared
4. Stock updated (inbound movement)
5. PO status updated (partial/received)

### Stock Adjustment
1. Discrepancy detected (count, damage, expiry)
2. Adjustment request created (pending)
3. Admin approves/rejects
4. If approved → stock updated + movement logged

### Alerts
- **Low stock**: Available < threshold
- **Critical**: Available = 0 or very low
- Generated from inventory snapshot comparison

## Missing Features (to implement)
- [ ] Multi-warehouse stock view
- [ ] Warehouse zones/locations (bin management)
- [ ] Batch/lot tracking with expiration dates
- [ ] Pick-pack-ship workflow
- [ ] Cycle counting schedules
- [ ] Reorder point automation
- [ ] Inter-warehouse transfers
- [ ] Quality inspection on receipt
- [ ] Barcode/RFID scanning
- [ ] Stock valuation reports
