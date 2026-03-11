# Phase 4 — User Flows

---

> This document maps every key user flow for each role, showing the step-by-step journey through the application.

---

## 1. CEO / Director General

### Flow 1.1 — Morning Overview
```
Open app → /login → Select company → Select CEO user → Enter PIN
→ Dashboard (/) → View Sales KPI Grid (revenue, orders, cash collected)
→ View Sales Performance Bar (pipeline, conversion, credit holds)
→ Check Alerts Feed (low stock, overdue invoices, expiring items)
→ Review Recent Orders Table → Click order → Order Detail Drawer
→ Check Warehouse Bar Chart (per-warehouse revenue comparison)
```

### Flow 1.2 — Approve High-Variance Cycle Count
```
Dashboard → Alerts Feed → Click "Cycle count variance >5%"
→ Navigate to /wms/cycle-count → Select flagged count
→ View variance analysis (product-by-product)
→ Review approval level: "Admin/DG Investigation"
→ Approve or reject adjustment → Inventory auto-updated
→ Toast confirmation
```

### Flow 1.3 — Review Supplier Performance
```
Sidebar → Données de base → Fournisseurs (/wms/vendors)
→ Click vendor row → View detail dialog (rating, total POs, total value, avg lead days)
→ Navigate to /wms/vendor-scorecard → Compare vendors by on-time %, quality %, price compliance
```

### Flow 1.4 — User & Access Management
```
Sidebar → Admin → Utilisateurs & Accès (/settings/users)
→ View user list → Click "+ Nouveau" → Fill user form
→ Assign role, warehouse access, governance permissions
→ Save → User created with RBAC applied
```

### Flow 1.5 — Financial Review
```
Sidebar → Comptabilité → Factures (/accounting/invoices)
→ View KPIs: total invoiced, collected, outstanding, overdue
→ Filter by "Overdue" → Identify delinquent customers
→ Navigate to /accounting/payments → Record payment
→ Navigate to /bi/profitability → Review profitability by product/customer
```

---

## 2. Finance Director / Accountant

### Flow 2.1 — Invoice Generation
```
Login → Dashboard → Sidebar → Comptabilité → Factures
→ "Orders to Invoice" section shows delivered orders without invoice
→ Click "Créer Facture" on eligible order
→ System auto-generates invoice (ID, amounts from order, due date from payment terms)
→ Order status → "Invoiced"
→ Click Send → Invoice sent to customer
→ Click Download → PDF generated via jsPDF
```

### Flow 2.2 — Record Payment
```
Sidebar → Comptabilité → Paiements (/accounting/payments)
→ Click "Nouveau Paiement" → Select unpaid invoice from dropdown
→ Enter amount, method (Cash/Check/Transfer/Mobile), reference, collected by
→ Submit → Invoice status updated (Partially_Paid or Paid)
→ Customer credit usage recalculated
```

### Flow 2.3 — 3-Way Match Exception Resolution
```
Sidebar → WMS → Inbound → Exceptions (/wms/match-exceptions)
→ View PO vs GRN vs Invoice discrepancies
→ Open ThreeWayMatchPanel → Compare quantities and prices
→ Approve with justification or escalate to management
```

### Flow 2.4 — FX Gain/Loss Analysis
```
Sidebar → Comptabilité → Paiements
→ Scroll to FX Summary section
→ View foreign currency payments (EUR, USD vendors)
→ Compare PO exchange rate vs payment exchange rate
→ Review total gain, total loss, net FX impact
```

### Flow 2.5 — GRNI Report
```
Sidebar → Comptabilité → GRNI (/accounting/grni)
→ View goods received but not yet invoiced
→ Identify aging items → Follow up with suppliers
```

---

## 3. Operations Director / Regional Manager

### Flow 3.1 — Create Purchase Order
```
Sidebar → WMS → Inbound → Bons de commande (/wms/purchase-orders)
→ Click "+ Nouveau BC" → Create PO dialog opens
→ Select vendor from dropdown (grouped: Connected ✅ / Not Connected ⚠️)
→ If non-connected vendor selected → Warning hint shown
→ Add product lines via ProductCombobox (search by name/SKU)
→ Set quantities → Live subtotal/tax/total auto-calculated (19% TVA)
→ Select delivery warehouse, expected date, payment terms
→ Add vendor reference and notes
→ Submit → PO created as "Draft"
→ Click "Envoyer" → Status changes to "Sent"
→ Supplier receives notification
```

### Flow 3.2 — Receive Goods (GRN Flow)
```
Sidebar → WMS → Inbound → Réception (/wms/grn)
→ Click "Nouvelle Réception" → Select PO from eligible list
→ System pre-fills product lines with remaining quantities
→ For each line: enter received qty, rejected qty, batch, expiry, location, QC status
→ Optionally select unit of measure (conversion applied automatically)
→ Submit as "QC Pending"
→ QC Officer reviews → Passes QC → Status: "Approval Pending"
→ Manager approves → Status: "Approved"
→ System auto-updates: inventory +, PO status → "Received" or "Partially_Received"
→ PMP (weighted avg cost) recalculated on product master
```

### Flow 3.3 — Inter-Warehouse Transfer
```
Sidebar → WMS → Stock → Transferts (/wms/transfers)
→ Click "+ Nouveau Transfert"
→ Select product, source warehouse, destination warehouse
→ Select source/destination locations
→ Enter quantity (with unit conversion option)
→ System checks stock availability → Warning if insufficient
→ RBAC check: user must have authority on source warehouse
→ Submit → Transfer created as "Pending"
→ Source warehouse dispatches → Status: "In_Transit"
→ Destination warehouse receives → Status: "Completed"
→ Inventory auto-adjusted (source -, destination +)
```

### Flow 3.4 — Manage Supplier Connections (Warehouse Side)
```
Sidebar → Données de base → Fournisseurs (/wms/vendors)
→ Click "Connexions" tab → View connection KPIs
→ Click "+ Inviter un fournisseur"
→ Enter supplier name, email, optional message
→ Submit → Connection created as "PENDING"
→ Supplier receives notification
→ When supplier accepts → Status: "CONNECTED"
→ Supplier now appears in PO vendor dropdown as "Connected ✅"
```

### Flow 3.5 — Review Incoming Connection Requests
```
/wms/vendors → Connexions tab → "Demandes reçues" section
→ View pending requests from suppliers
→ Click "Accepter" → Connection established
→ Or click "Refuser" → Connection rejected
→ Notification sent to requesting party
```

---

## 4. Warehouse Manager

### Flow 4.1 — Daily Operations Check
```
Login → Dashboard → View Stock KPI Grid
→ Check low stock count → Navigate to /wms/inventory
→ Filter by "Low Stock" → Identify products needing replenishment
→ Navigate to /wms/purchase-orders → Create PO for restocking
```

### Flow 4.2 — Cycle Count Execution
```
Sidebar → WMS → Stock → Inventaire tournant (/wms/cycle-count)
→ Click "+ Nouveau Comptage" → Select warehouse, zone, date
→ System generates count lines from current inventory in that zone
→ Click "Démarrer" on created count
→ Enter physical quantities per product
→ Submit → System calculates variance per line and overall
→ Variance ≤ 0.5%: auto-approved, inventory adjusted
→ Variance ≤ 2%: manager review required → Approve/reject
→ Variance > 2%: escalated to DAF/DG
```

### Flow 4.3 — Putaway Management
```
Sidebar → WMS → Inbound → Rangement (/wms/putaway)
→ View pending putaway tasks (from approved GRNs)
→ Select task → Assign to storage location (zone/aisle/rack/level)
→ Check location capacity → Confirm putaway
→ Mark task as complete → Inventory location updated
```

### Flow 4.4 — Stock Adjustment
```
Sidebar → WMS → Stock → Ajustements (/wms/adjustments)
→ Click "+ Nouvel Ajustement"
→ Select product, warehouse, quantity change (+/-), reason
→ Submit for approval
→ Higher-level manager approves/rejects based on variance
→ Inventory auto-adjusted on approval
```

---

## 5. QC Officer

### Flow 5.1 — QC Inspection on GRN
```
Login → Dashboard → Sidebar → WMS → Inbound → Réception
→ Filter by "QC_Pending" → Select GRN
→ Review each line: product, received qty, batch, expiry
→ Per line: set QC status (Passed / Failed / Conditional)
→ Add rejection reason if Failed
→ Submit QC → GRN status → "Approval_Pending"
```

### Flow 5.2 — Quality Claim Investigation
```
Sidebar → WMS → Opérations Internes → Réclamations (/wms/quality-claims)
→ View claim list → Select claim
→ Investigate: review product, batch, customer complaint
→ Resolve: accept claim, create credit note, or reject
→ Update claim status → Notify customer
```

### Flow 5.3 — Stock Block for Quality Issue
```
Sidebar → WMS → Stock → Blocage stock (/wms/stock-block)
→ Click "+ Bloquer" → Select product, warehouse, quantity
→ Enter reason (quality hold, regulatory, investigation)
→ Submit → Stock quarantined (unavailable for picking/shipping)
→ After investigation → Release or dispose
```

---

## 6. Supervisor / Operator

### Flow 6.1 — Picking Execution
```
Login → Dashboard → Sidebar → WMS → Outbound → Picking
→ View assigned pick lists
→ Start picking session → Navigate to locations
→ Scan/confirm each item → Record shortages if any
→ Complete pick list → Status: "Picked"
→ Items move to packing station
```

### Flow 6.2 — Packing & Shipping
```
Sidebar → WMS → Outbound → Packing (/wms/packing)
→ View picked orders ready for packing
→ Scan items into packages → Print packing slips
→ Close packages → Status: "Packed"
→ Navigate to Shipping (/wms/shipping)
→ Assign carrier → Generate tracking number
→ Confirm dispatch → Status: "Shipped"
→ Sales order auto-updated
```

### Flow 6.3 — Task Queue
```
Sidebar → WMS → Gestion Terrain → File de tâches (/wms/tasks)
→ View assigned tasks (picking, putaway, counting)
→ Start task → Execute → Mark complete
→ Next task auto-assigned
```

---

## 7. Driver

### Flow 7.1 — Complete Delivery Day
```
Open app → /delivery/login → Enter credentials
→ /delivery/vehicle-check → Complete pre-trip checklist
→ /delivery/trip → View today's trip overview (X stops, estimated time)
→ /delivery/stops → View all stops in sequence
→ Select first stop → /delivery/stop/:stopId → View customer, address, items
→ Arrive at customer → /delivery/confirm/:stopId
→ Customer signs on SignatureCanvas
→ Take delivery photo (optional)
→ Record delivered quantities (partial delivery possible)
→ Confirm delivery
→ If cash payment → /delivery/cash/:stopId → Record amount, denominations
→ Move to next stop → Repeat
→ After all stops → /delivery/end-of-day
→ Review trip summary, cash total, incidents
→ Cash handover → Day closed
```

### Flow 7.2 — Report Incident
```
During delivery → /delivery/incident
→ Select incident type (damaged goods, customer absent, access issue, other)
→ Add description and photo
→ Submit → Notification sent to manager
→ Continue route
```

### Flow 7.3 — View Route Map
```
/delivery/map → Leaflet map with:
→ Route line connecting all stops
→ Stop markers (color-coded: completed ✅, current 🔵, pending ⚪)
→ Current GPS position
→ Tap marker → View stop details
```

---

## 8. Sales Agent (Mobile)

### Flow 8.1 — Field Sales Day
```
Open app → /mobile/login → Enter credentials
→ /mobile/dashboard → View daily targets, completed visits, revenue
→ /mobile/customers → Customer list (searchable, geo-sortable)
→ Select customer → /mobile/customers/:id → View profile, order history
→ Click "Nouvelle Commande" → /mobile/new-order
→ Select customer (pre-filled)
→ Add products (search/browse catalog)
→ Set quantities → View live total
→ Submit order → Sent to backend or added to offline queue
→ GPS visit logged automatically
→ Move to next customer → Repeat
```

### Flow 8.2 — Offline Order Submission
```
In area with no connectivity → Create order as usual
→ Order saved to offline queue (IndexedDB via idb)
→ /mobile/offline-queue → View pending items
→ When connectivity returns → Auto-sync or manual retry
→ Orders uploaded → Queue cleared
→ Toast: "X orders synced successfully"
```

### Flow 8.3 — Route Navigation
```
/mobile/route → GPS-tracked map view
→ See planned stops and current position
→ Get directions to next customer
→ Visit logged with timestamp and coordinates
```

---

## 9. Supplier

### Flow 9.1 — Manage Warehouse Connections (Supplier Side)
```
Open app → /supplier/login → Enter credentials
→ /supplier/ → Dashboard overview
→ Navigate to /supplier/connections → Entrepôts tab
→ View KPIs: connected, pending, rejected
→ Click "+ Ajouter un entrepôt"
→ Enter warehouse name, email, message
→ Submit → Invitation sent as "PENDING"
→ When warehouse accepts → Status: "CONNECTED"
```

### Flow 9.2 — Accept Incoming Connection
```
/supplier/connections → "Demandes reçues" section
→ See pending request from warehouse
→ Click "Accepter" → Connection established
→ Or click "Refuser" → Request rejected
→ Connected warehouse can now send POs
```

### Flow 9.3 — Process Incoming Purchase Order
```
/supplier/ → Dashboard shows "New PO" notification
→ Navigate to /supplier/orders → View incoming POs
→ Select PO → /supplier/orders/:id → View detail (items, quantities, delivery date)
→ Actions:
  → "Confirm" → Accept entire order → Status: CONFIRMED
  → "Refuse" → Reject order → Status: REFUSED
  → Partial Accept / Counter Offer (modify quantities or dates)
→ Warehouse receives notification of supplier's response
```

### Flow 9.4 — Track Fulfillment
```
/supplier/orders → Filter by "In Progress"
→ Update PO status through workflow:
  CONFIRMED → PREPARING → READY_FOR_SHIPMENT → SHIPPED
→ Each status change → Warehouse notified
→ Warehouse confirms delivery → Status: DELIVERED → COMPLETED
```

### Flow 9.5 — View Performance Metrics
```
Navigate to /supplier/performance
→ View scorecard: on-time delivery %, quality pass %, fill rate
→ Compare to platform benchmarks
→ Identify areas for improvement
```

---

## 10. Customer (Client Portal)

### Flow 10.1 — Place Order via Portal
```
Open app → /portal/login → Enter credentials
→ /portal/dashboard → View credit gauge, recent orders
→ Click "Commander" → /portal/place-order
→ Browse product catalog → Add items to cart
→ Set quantities → View total with taxes
→ Submit order → Order created as "Draft"
→ Warehouse receives notification → Processes order
→ Customer tracks status in /portal/orders/:orderId
```

### Flow 10.2 — Track Order Status
```
/portal/orders → View order list with status badges
→ Click order → /portal/orders/:orderId
→ View timeline: Draft → Approved → Picking → Packed → Shipped → Delivered
→ View line items and totals
```

### Flow 10.3 — View & Pay Invoices
```
/portal/invoices → View invoice list with balances
→ Click invoice → View detail (subtotal, tax, paid, balance)
→ /portal/payments → View payment history
→ /portal/statement → View account statement
```

### Flow 10.4 — Request Return
```
/portal/return → Select order to return
→ Specify items and quantities to return
→ Select return reason
→ Submit request → Warehouse reviews and processes
→ Credit note generated if approved
```

---

## 11. Platform Owner

### Flow 11.1 — Manage Subscriptions
```
Open app → /owner/login → Enter PIN (999999)
→ /owner/ → Dashboard: subscriber count, revenue, system health
→ /owner/subscriptions → View all tenants with plans
→ Click subscriber → SubscriberDetailDrawer opens
→ Actions: change plan, suspend, activate
→ Click "+" → CreateSubscriberDialog → Onboard new tenant
```

### Flow 11.2 — Onboard New Tenant
```
/owner/onboarding → Start onboarding flow
→ Enter company details (name, sector, city, plan)
→ Create admin user for new tenant
→ Assign warehouses
→ Configure initial settings
→ Tenant goes live
```

### Flow 11.3 — Monitor System Health
```
/owner/monitoring → View system metrics
→ Check CPU, memory, error rates, response times
→ Identify issues → Take action
```

### Flow 11.4 — Handle Support Tickets
```
/owner/support → View open tickets
→ Assign to team → Respond → Resolve → Close
```

---

## 12. Cross-Role Flows

### Flow 12.1 — Complete Procurement Cycle
```
[Warehouse Manager] Create PO → Send to supplier
→ [Supplier] Receive PO notification → Confirm order
→ [Supplier] Prepare → Ship → Update status
→ [Warehouse Operator] Create GRN against PO
→ [QC Officer] Inspect received goods → Pass/Fail
→ [Warehouse Manager] Approve GRN → Inventory updated
→ [Accountant] 3-way match (PO vs GRN vs Invoice)
→ [Accountant] Record payment → Invoice closed
```

### Flow 12.2 — Complete Sales Cycle
```
[Sales Agent / Mobile] Create sales order at customer site
→ [Manager] Review and approve → Status: Approved
→ [System] Credit check → If OK: proceed; if exceeded: Credit_Hold
→ [Operator] Pick items from warehouse → Status: Picking
→ [Operator] Pack items → Status: Packed
→ [Manager] Create shipment, assign carrier → Status: Shipped
→ [Driver] Deliver to customer → Signature + photo → Status: Delivered
→ [Driver] Collect cash if applicable
→ [Accountant] Generate invoice → Status: Invoiced
→ [Accountant] Record payment → Invoice paid
→ [Manager] Daily closing reconciliation
```

### Flow 12.3 — Supplier-Warehouse Connection + First PO
```
[Supplier] /supplier/connections → Click "Add Warehouse" → Send invitation
→ [Warehouse Manager] /wms/vendors → Connexions tab → See incoming request
→ [Warehouse Manager] Click "Accepter" → Status: CONNECTED
→ [Warehouse Manager] /wms/purchase-orders → Create PO → Select connected supplier (✅)
→ [Supplier] Receives PO → Confirms → Prepares → Ships
→ [Warehouse] Receives goods → GRN → QC → Approved → Inventory updated
```

### Flow 12.4 — Return & Credit Note Flow
```
[Customer] /portal/return → Submit return request
→ [Warehouse Manager] Review return request
→ [QC Officer] Inspect returned goods → Accept/reject
→ [Manager] Process return → Restock or dispose
→ [Accountant] Generate credit note
→ [System] Customer credit balance adjusted
```

### Flow 12.5 — Multi-WMS Instance Cross-Routing
```
[Manager at Instance A] Create PO → System routes to Instance B (supplier's instance)
→ [Manager at Instance B] /i/:instanceId/wms/incoming-pos → View routed PO
→ Accept → Fulfill from Instance B's inventory
→ Ship to Instance A → GRN created at Instance A
```

---

*✅ Phase 4 complete. Confirm to proceed to Phase 5 — Mock Data Structure.*
