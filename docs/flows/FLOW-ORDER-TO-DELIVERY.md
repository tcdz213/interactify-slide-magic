# Flow: Order → Delivery → Invoice

## Complete Workflow

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌───────────┐
│  PENDING  │───▶│ APPROVED │───▶│ PREPARING │───▶│ SHIPPED │───▶│ DELIVERED │
└──────────┘    └──────────┘    └───────────┘    └─────────┘    └───────────┘
                     │                │                │              │
                     │           Stock reserved   Delivery         Invoice
                     │           from warehouse   created          generated
                     │                │                │              │
                     ▼                ▼                ▼              ▼
               Credit check    Pick & Pack      Driver assigned   Payment
               Stock verify    Partial prep     In transit        recorded
                                possible        POD submitted
                                                Returns managed
```

## Step-by-Step

### 1. Order Creation (`/orders` → CreateOrderDrawer)
- Select products, set quantities
- System calculates: unitPrice × qty = lineHT + TVA = lineTTC
- Set delivery address, payment terms, notes
- Status: **PENDING**

### 2. Order Approval (`/orders/:id`)
- Admin/manager reviews order
- Click "Approved" → stock reserved
- Status: **APPROVED**

### 3. Preparation (`/orders/:id`)
- Warehouse prepares items
- `preparedQty` tracked per line item
- If all items full → **PREPARING** → **SHIPPED**
- If some items short → **PARTIALLY_PREPARED**

### 4. Shipping & Delivery (`/deliveries/:id`)
- Delivery created with driver + vehicle
- Status flow: PENDING → ASSIGNED → IN_TRANSIT → DELIVERED
- Proof of Delivery: signer name + notes
- Returns possible after delivery (damaged, wrong item, etc.)

### 5. Invoicing (`/invoices/:id`)
- Invoice generated from delivered order
- Includes seller/buyer fiscal info (NIF/NIS/RC/AI)
- TVA breakdown per item
- Printable format
- Toggle paid/unpaid

### 6. Accounting
- Journal entry auto-generated from invoice
- Debit: Client account (411xxx)
- Credit: Revenue (70xxxx) + TVA collected (4457xx)

## Current Gaps
- No automated trigger between steps (manual transitions)
- No automated invoice generation from order
- No payment recording linked to invoice
- No credit limit enforcement
- No backorder management for partial preparation
