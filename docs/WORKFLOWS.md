# WMS / ERP SaaS — Business Workflows

---

## 1. Platform Onboarding

```
Step 1: CEO creates account (auth.users)
    │
Step 2: CEO creates company
    │   → type: supplier | depot
    │   → status: "pending"
    │
Step 3: CEO selects subscription plan
    │   → trial / standard / pro / enterprise
    │   → system validates payment (if paid plan)
    │
Step 4: System provisions workspace
    │   → creates company record
    │   → creates subscription record
    │   → assigns CEO role in user_roles
    │   → status → "active" or "trial"
    │
Step 5: CEO enters company setup wizard
        → create warehouses
        → invite users
        → configure products
```

---

## 2. User Management

```
CEO/Admin → "Add User"
    │
    ├─ Check subscription.current_users < plan.max_users
    │   ├─ NO  → Error: "User limit reached. Upgrade plan."
    │   └─ YES → Continue
    │
    ├─ Create user in auth.users
    ├─ Create profile (company_id = current company)
    ├─ Assign role(s) in user_roles
    ├─ Increment subscription.current_users
    │
    └─ Send invitation email
```

### User Limit Enforcement

```
current_users >= max_users?
    YES → Block creation, show upgrade prompt
    NO  → Allow creation
```

---

## 3. Warehouse Setup

```
Admin → "Create Warehouse"
    │
    ├─ Check subscription.current_warehouses < plan.max_warehouses
    │   ├─ NO  → Error: "Warehouse limit reached."
    │   └─ YES → Continue
    │
    ├─ Create warehouse record (company_id)
    ├─ Create default locations (Receiving, Storage, Shipping zones)
    ├─ Increment subscription.current_warehouses
    │
    └─ Warehouse ready for operations
```

---

## 4. Product Catalog Setup

```
Admin → "Add Product"
    │
    ├─ Fill product form:
    │   ├─ Name, SKU, Category, Subcategory
    │   ├─ UOM (Unit of Measure)
    │   ├─ Unit Cost, Unit Price
    │   ├─ Reorder Point
    │   ├─ Product Type (Storable/Consumable/Service)
    │   ├─ Cost Method (Standard/Average/FIFO)
    │   └─ Default Vendor
    │
    ├─ System validates SKU uniqueness (per company)
    ├─ Create product record (company_id)
    ├─ Optionally create barcode records
    │
    └─ Product available in catalog
```

---

## 5. Supplier ↔ Depot Connection

```
Depot Admin → "Connect to Supplier"
    │
    ├─ Search platform suppliers
    ├─ Send connection request
    │   → status: "pending"
    │
Supplier Admin receives notification
    │
    ├─ Review request
    ├─ Accept or Reject
    │   ├─ Accept → status: "active"
    │   │   ├─ Depot can view supplier's catalog
    │   │   ├─ Depot can create purchase orders
    │   │   └─ Supplier receives orders in "Incoming POs"
    │   └─ Reject → status: "rejected"
    │
    └─ Connection established (or denied)
```

---

## 6. Purchase Order Flow

### 6.1 Depot Side (Buyer)

```
Purchase Manager → "Create PO"
    │
    ├─ Select vendor (connected supplier)
    ├─ Add line items (products, qty, price)
    ├─ Set expected delivery date
    ├─ Select receiving warehouse
    │
    ├─ Status: "Draft"
    ├─ Review & Submit → Status: "Sent"
    │
    │   [PO transmitted to Supplier via platform]
    │
    ├─ Wait for supplier response
    │   ├─ Confirmed → Status: "Confirmed"
    │   └─ Rejected → Status: "Cancelled"
    │
    ├─ Supplier ships goods
    │
    ├─ Depot receives goods → Create GRN
    │   ├─ Inspect quantities
    │   ├─ Run QC inspection
    │   ├─ Accept / Reject items
    │   └─ Status: "Received" or "Partially Received"
    │
    ├─ Putaway (move to storage locations)
    │
    └─ Inventory updated automatically
```

### 6.2 Supplier Side (Seller)

```
Incoming PO received
    │
    ├─ Review order details
    ├─ Accept → Status: "Accepted"
    │   ├─ Pick items from inventory
    │   ├─ Pack items
    │   ├─ Create shipment
    │   │   ├─ Assign carrier
    │   │   ├─ Generate tracking
    │   │   └─ Ship
    │   └─ Status: "Shipped"
    │
    └─ Or Reject → Status: "Rejected"
        └─ Depot notified
```

---

## 7. Sales Order Flow

```
Sales Manager → "Create Sales Order"
    │
    ├─ Select customer
    ├─ Check customer credit limit
    │   ├─ Exceeded → Warning / Block
    │   └─ OK → Continue
    │
    ├─ Add line items
    ├─ Apply pricing rules / discounts
    ├─ Select shipping warehouse
    │
    ├─ Status: "Draft" → "Confirmed"
    │
    ├─ Picking
    │   ├─ System generates pick list
    │   ├─ Worker picks items from locations
    │   ├─ Scan barcodes for verification
    │   └─ Status: "Picking" → "Picked"
    │
    ├─ Packing
    │   ├─ Items grouped into packages
    │   ├─ Weight & dimensions recorded
    │   └─ Status: "Packed"
    │
    ├─ Shipping
    │   ├─ Assign carrier
    │   ├─ Generate shipping label
    │   ├─ Create delivery trip
    │   └─ Status: "Shipped"
    │
    ├─ Delivery
    │   ├─ Driver delivers goods
    │   ├─ Customer signs (proof of delivery)
    │   ├─ Collect payment (if COD)
    │   └─ Status: "Delivered"
    │
    ├─ Invoicing
    │   ├─ Auto-generate invoice
    │   └─ Send to customer
    │
    └─ Payment
        ├─ Record payment
        ├─ Update outstanding balance
        └─ Reconcile
```

---

## 8. Inventory Operations

### 8.1 Receiving (GRN)

```
PO arrives at warehouse
    │
    ├─ Create GRN against PO
    ├─ Count received quantities
    ├─ Compare with ordered quantities
    ├─ Flag discrepancies
    ├─ QC inspection (if required)
    ├─ Accept/Reject lines
    ├─ Update inventory (qty_on_hand ++)
    └─ Trigger putaway tasks
```

### 8.2 Putaway

```
GRN validated
    │
    ├─ System suggests locations (based on rules)
    │   ├─ Same product zone
    │   ├─ Available capacity
    │   └─ Temperature requirements
    │
    ├─ Worker moves goods
    ├─ Scan location barcode
    ├─ Confirm putaway
    └─ Location.used updated
```

### 8.3 Cycle Count

```
Schedule or ad-hoc count
    │
    ├─ Select scope (warehouse / zone / product)
    ├─ Generate count sheets
    ├─ Workers count physical stock
    ├─ Enter counts in system
    ├─ System calculates variance
    ├─ Review & approve adjustments
    └─ Create stock adjustments for discrepancies
```

### 8.4 Stock Transfer

```
Manager → "Transfer Stock"
    │
    ├─ Source warehouse + destination warehouse
    ├─ Select products & quantities
    ├─ Status: "Draft" → "In Transit"
    │
    ├─ Source: qty_on_hand --, qty_in_transit ++
    │
    ├─ Destination receives
    ├─ Status: "Received"
    └─ Destination: qty_on_hand ++, qty_in_transit --
```

---

## 9. Returns & Quality Claims

### 9.1 Customer Return

```
Customer requests return
    │
    ├─ Create return order
    ├─ Specify items & reason
    ├─ Approve return
    ├─ Receive goods back at warehouse
    ├─ QC inspection
    │   ├─ Pass → Restock
    │   └─ Fail → Scrap / Quarantine
    ├─ Issue credit note
    └─ Update customer balance
```

### 9.2 Supplier Return

```
QC finds defective goods
    │
    ├─ Create supplier return
    ├─ Specify defective items
    ├─ Ship back to supplier
    ├─ Receive credit note from supplier
    └─ Update vendor scorecard
```

---

## 10. Subscription Lifecycle

```
Trial (14 days)
    │
    ├─ Auto-notify at day 7, 12, 14
    │
    ├─ Upgrade to paid plan → Status: "active"
    │
    └─ No action at day 14
        └─ Status: "suspended" (read-only)
            │
            ├─ Pay within 30 days → Reactivate
            └─ No action → Status: "cancelled"
                └─ Data retained 90 days, then purged

Monthly billing:
    ├─ Invoice generated on renewal_date
    ├─ Payment collected
    │   ├─ Success → Renew
    │   └─ Failed → Grace period (7 days)
    │       ├─ Retry payment
    │       └─ Suspend after 3 failures
```
