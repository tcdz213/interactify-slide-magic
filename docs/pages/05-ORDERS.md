# Orders Page

## Route
`/orders` — Roles: `trader`, `warehouse`, `sales`, `support`

## UI Components
- **Header**: Title + "New Order" button
- **KPI Cards** (4): Pending, Preparing, Shipped, Delivered counts
- **Filters**: Search (order number / trader name) + status pill buttons (all + 7 statuses)
- **Orders Table**: Order number, trader, status badge, total TTC (DA), date, "View" link
- **CreateOrderDrawer**: Product selection, unit/qty, price preview, delivery address, payment terms

## Order Lifecycle (Rule 3)
```
PENDING → APPROVED → PREPARING → SHIPPED → DELIVERED
                  ↘ PARTIALLY_PREPARED ↗
Any state → CANCELLED
```

## Data
- Loaded async via `fetchOrders()` service
- Order fields: id, orderNumber, traderId, traderName, warehouseId, warehouseName, status, items[], totalHT, totalTVA, totalTTC, deliveryAddress, paymentTerms, notes, statusHistory[], createdAt

## Order Detail (`/orders/:id`)

### UI Components
- **Back button + header**: Order number, trader, warehouse, status badge
- **Linked invoice button**: If invoice exists, navigate to it
- **Transition actions**: Buttons for valid next statuses + optional note + confirm
- **Items table**: Product, qty requested, qty prepared, unit price, TVA%, line total TTC
- **Totals**: HT / TVA / TTC summary
- **Info cards**: Delivery address, payment terms, notes
- **Timeline**: Visual status history with dot colors, by whom, timestamps, notes

### Status Transition
1. Click target status button
2. Optionally add note
3. Confirm → `changeOrderStatus()` → reload
4. Toast success

## Edge Cases
- Order not found → "No orders" + back link
- Loading → spinner
- No valid transitions → transition section hidden
- Qty prepared < requested → orange text
- Cancelled status → red destructive button style

## Improvements
- [ ] Order preparation view (scan-to-pick)
- [ ] Partial fulfillment with backorder creation
- [ ] Credit limit check before approval
- [ ] Customer-specific pricing integration
- [ ] Order duplication
- [ ] Bulk status transitions
- [ ] PDF export of order
- [ ] Delivery scheduling from order
- [ ] Payment recording on order
