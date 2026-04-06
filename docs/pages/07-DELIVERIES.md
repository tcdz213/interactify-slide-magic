# Deliveries Page

## Route
`/deliveries` — Roles: `warehouse`, `driver`, `sales`

## UI Components
- **PageWrapper** with breadcrumbs
- **KPI Cards** (5): Total, In Transit, Delivered, Failed, Pending Returns
- **Status Filter**: Pill buttons for all + 6 statuses (with counts)
- **Deliveries Table**: Delivery #, order #, client, driver, vehicle plate, scheduled date, status badge, total TTC

## Delivery Lifecycle
```
PENDING → ASSIGNED → IN_TRANSIT → DELIVERED
                              ↘ PARTIALLY_DELIVERED
                              ↘ FAILED
```

## Data
- Loaded async via `fetchDeliveries()` service
- Fields: id, deliveryNumber, orderId, orderNumber, clientName, driverName, vehiclePlate, deliveryAddress, scheduledDate, status, totalTTC, items[], proof, returns[], statusHistory[]

## Delivery Detail (`/deliveries/:id`)

### UI Components (3-column layout)
**Left (2/3)**:
- **Status & Info card**: Status badge, order link, driver, vehicle, total, address + transition buttons
- **Proof of Delivery**: Shows signed info or form to submit (signer name + notes)
- **Returns section**: Create return form (product, qty, reason, condition) + list existing returns with approve/reject

**Right (1/3)**:
- **Timeline**: Status history with icons, colors, timestamps, notes
- **Quick Info**: Scheduled date, warehouse, item count

### Return Management
- Reasons: damaged, wrong_item, expired, quality_issue, excess_quantity, client_refused
- Conditions: damaged or resalable (auto-assigned based on reason)
- Status: pending → approved/rejected

## Edge Cases
- No deliveries for filter → empty state with MapPin icon
- Loading → simple text loading state
- Delivery not found → error text
- No proof → form to add proof; proof exists → read-only display
- No returns → text message; returns exist → list with approve/reject buttons

## Improvements
- [ ] GPS tracking / live map view
- [ ] Route optimization
- [ ] Photo proof upload (delivery photos)
- [ ] Digital signature capture
- [ ] Vehicle management module
- [ ] Delivery scheduling with time windows
- [ ] Driver performance metrics
- [ ] Automated SMS/WhatsApp notifications to client
- [ ] Multi-stop route planning
