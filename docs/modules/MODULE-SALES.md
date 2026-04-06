# Module: Sales & Orders

## Overview
Manages the complete sales cycle from order creation through delivery to invoicing, with Algerian fiscal compliance.

## Pages
- `/orders` — Order list with KPIs and status filtering
- `/orders/:id` — Order detail with lifecycle management
- `/invoices` — Invoice list with payment tracking
- `/invoices/:id` — Printable invoice with fiscal details
- `/deliveries` — Delivery tracking and management
- `/deliveries/:id` — Delivery detail with POD and returns

## Order Lifecycle
```
PENDING → APPROVED → PREPARING → SHIPPED → DELIVERED
                  ↘ PARTIALLY_PREPARED ↗
Any state → CANCELLED
```

## Business Rules
1. **Stock reservation**: On approval, requested quantities are reserved
2. **TVA calculation**: 9% for food/agriculture, 19% standard
3. **Price tiers**: Support for BRONZE/SILVER/GOLD/VIP pricing
4. **Totals**: HT (hors taxe) + TVA = TTC (toutes taxes comprises)

## Invoice Generation
- Invoices linked to orders via `orderId`
- Seller/buyer info with NIF/NIS/RC/AI (Algerian fiscal identifiers)
- Print-ready layout with `window.print()`

## Delivery Flow
1. Order status → SHIPPED triggers delivery creation
2. Driver assigned with vehicle
3. In-transit tracking
4. Proof of delivery (signer + notes)
5. Returns management (damaged, wrong item, etc.)

## Missing Features
- [ ] Customer management (client database)
- [ ] Quotation/proforma workflow
- [ ] Credit terms and limits
- [ ] Partial delivery handling
- [ ] Automated invoice generation from delivered orders
- [ ] Payment recording and reconciliation
- [ ] Sales commission tracking
- [ ] Customer portal (track orders/deliveries)
