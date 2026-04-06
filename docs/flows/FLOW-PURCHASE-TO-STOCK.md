# Flow: Purchase Order → Goods Receipt → Stock Update

## Complete Workflow

```
┌──────────┐    ┌────────┐    ┌───────────┐    ┌──────────┐    ┌───────────────┐
│  DRAFT   │───▶│  SENT  │───▶│ CONFIRMED │───▶│ PARTIAL  │───▶│   RECEIVED    │
└──────────┘    └────────┘    └───────────┘    └──────────┘    └───────────────┘
                                    │                │                │
                               Supplier          Goods             Stock
                               confirms         Receipt           updated
                                                created           (inbound)
                                                    │                │
                                                    ▼                ▼
                                              Reconciliation    Movement
                                              with invoice      logged
```

## Step-by-Step

### 1. Purchase Order Creation (`/suppliers` → Purchase Orders tab)
- Select supplier, add product lines (product, qty, unit price)
- System calculates HT + TVA = TTC
- Set expected delivery date
- Status: **DRAFT**, Approval: **PENDING**

### 2. PO Approval & Sending
- Manager approves PO
- PO sent to supplier
- Status: **SENT**

### 3. Supplier Confirmation
- Supplier confirms availability and dates
- Status: **CONFIRMED**

### 4. Goods Reception (`/suppliers` → Receiving tab)
- Warehouse receives goods physically
- GoodsReceipt created: receipt number, supplier, PO ref, warehouse
- Per-line qty received vs qty ordered
- Notes for discrepancies
- If partial → Status: **PARTIAL**
- If complete → Status: **RECEIVED**

### 5. Stock Update
- Inbound movement logged in inventory
- Product stock increased
- Movement: type=inbound, reference=PO number

### 6. Invoice Reconciliation (`/suppliers` → Reconciliation tab)
- Supplier invoice matched against PO
- Status: **MATCHED** or **UNMATCHED** (with variance amount)
- Variance triggers investigation

## Current Gaps
- No PO creation form (data is static mock)
- No automated stock update on receipt
- No quality inspection step
- No partial receipt handling with backorder
- No supplier invoice entry form
