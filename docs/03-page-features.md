# Phase 3 — Page Features

---

> This document details the features, UI components, user actions, displayed data, and mock data sources for every page in the application, organized by domain.

---

## 1. Dashboard (`/`)

### Purpose
Central command center providing real-time KPIs, charts, and quick actions. Content adapts based on user role (financial vs operational view).

### Main UI Components
- `PageHeader` — title with icon
- `QuickActions` — shortcut buttons (New PO, New GRN, New Order, etc.)
- `SalesKpiGrid` (financial roles) — Total Sales, Order Count, Active Orders, Picking Count, In-Transit Deliveries, Cash Collected %, Total Invoiced
- `StockKpiGrid` (operational roles) — Total Stock Items, Reference Count, Low Stock Count, Expiring Soon, Active Orders, Picking Count
- `SalesPerformanceBar` — pipeline value, conversion rate, delivered count, avg order value, credit hold count, active clients
- `WarehouseScopePanel` — restricted users see only their assigned warehouse data
- `WeeklySalesChart` — bar chart of weekly sales (financial roles)
- `InventoryPieChart` — pie chart by product category
- `CashFlowSparkline` — sparkline of cash inflows/outflows
- `WarehouseBarChart` — per-warehouse revenue comparison (full-access only)
- `RecentOrdersTable` — last 10 sales orders
- `AlertsFeed` — system alerts with unread count
- `TopProducts` — best-selling products ranked
- `ActivityTimeline` — recent operational events chronologically

### User Actions
- Click quick action buttons to navigate to create forms
- View alerts and mark as read
- Filter dashboard by warehouse scope (automatic per user)

### Displayed Data
- Sales totals, order counts, delivery stats, cash collection %
- Inventory breakdown by category, low stock warnings
- Weekly sales trends, top products, recent orders
- System alerts (stock low, expired items, overdue invoices)

### Mock Data Used
- `salesOrders`, `inventory`, `customers`, `invoices`, `payments`, `deliveryTrips`, `alerts`, `warehouses`, `products` from `WMSDataContext`

---

## 2. WMS — Inbound Pages

### 2.1 GRN / Réception (`/wms/grn`)

**Purpose**: Create and manage Goods Receipt Notes against Purchase Orders.

**Main UI Components**:
- `WarehouseScopeBanner` — shows user's warehouse context
- KPI cards: QC Pending, Approval Pending, Approved, Rejected, Draft counts
- Filter bar: search, status dropdown, date range (`DateFilter`)
- Sortable data table (date, vendor, value, status)
- `ExportDialog` — CSV/Excel export
- Create/Edit GRN dialog with multi-line form
- `ThreeWayMatchPanel` — PO vs GRN vs Invoice comparison
- QC status per line (Passed/Failed/Conditional)
- Reject reason dialog

**User Actions**:
- Create new GRN from eligible POs (status: Sent/Confirmed, with remaining quantities)
- Set received/rejected quantities per product line
- Assign batch number, production date, expiry date, storage location
- Select unit of measure per line (with conversion)
- Submit as Draft or QC_Pending
- QC Pass/Fail individual GRN (advances to Approval_Pending)
- Approve/Reject GRN (triggers inventory update + PMP recalculation)
- Edit/delete draft GRNs
- Export GRN list

**Displayed Data**:
- GRN ID, PO reference, vendor name, received date, total items/value, status
- Line details: product, ordered qty, received qty, rejected qty, batch, expiry, location, QC status

**Mock Data Used**:
- `grns`, `purchaseOrders`, `inventory`, `products`, `warehouseLocations`, `warehouses`, `invoices`

---

### 2.2 Quality Control (`/wms/quality-control`)

**Purpose**: Manage QC inspections for received goods (HACCP compliance).

**Main UI Components**:
- KPI cards: pending inspections, passed, failed, conditional
- Inspection table with product, batch, result, inspector
- Inspection detail dialog
- QC action buttons (Pass/Fail/Conditional)

**User Actions**:
- Review pending inspections
- Pass/Fail/Conditionally accept items
- Add inspector notes and rejection reasons
- View inspection history

**Mock Data Used**: `qcInspections`, `grns`, `products`

---

### 2.3 Putaway (`/wms/putaway`)

**Purpose**: Assign received goods to specific storage locations.

**Main UI Components**:
- Pending putaway task list
- Location selector (zone → aisle → rack → level)
- Capacity indicators per location
- Task completion buttons

**User Actions**:
- View pending putaway tasks from approved GRNs
- Assign products to specific bin locations
- Mark tasks as complete
- View location capacity

**Mock Data Used**: `putawayTasks`, `warehouseLocations`, `inventory`

---

### 2.4 Cross Docking (`/wms/cross-docking`)

**Purpose**: Direct transfer from inbound to outbound without storage.

**Main UI Components**:
- Cross-dock order table
- Matching inbound/outbound panel
- Status workflow indicators

**User Actions**:
- Create cross-dock orders
- Match incoming shipments to outgoing orders
- Track cross-dock status

**Mock Data Used**: `crossDocks`, `purchaseOrders`, `salesOrders`

---

### 2.5 Purchase Orders (`/wms/purchase-orders`)

**Purpose**: Create and manage purchase orders to suppliers, with connection-aware vendor selection.

**Main UI Components**:
- KPI summary bar (Draft, Sent, Confirmed, Received, Cancelled counts)
- Filter bar: search, status dropdown, date range
- Sortable data table (date, vendor, amount, status)
- PO detail dialog with line items
- Create PO dialog with:
  - Vendor dropdown (grouped: Connected ✅ / Not Connected ⚠️)
  - `ProductCombobox` for adding line items
  - Live subtotal/tax/total calculation (19% TVA)
  - Warehouse selector, delivery date, vendor reference, notes
  - Payment terms selector
- `ExportDialog` for CSV/PDF export
- Status badges with workflow indicators

**User Actions**:
- Create new PO (vendor, products, quantities, expected date, warehouse)
- Edit draft POs
- Send PO to supplier (Draft → Sent)
- Confirm PO
- View PO detail with line breakdown
- Duplicate existing PO
- Export PO list
- Connection warning when selecting non-connected vendor

**Displayed Data**:
- PO number, vendor name, order/expected date, total HT/TTC, status, warehouse, payment terms
- Line items: product SKU/name, quantity, unit cost, line total

**Mock Data Used**: `purchaseOrders`, `vendors`, `products`, `warehouses`, `connections`

---

### 2.6 Match Exceptions (`/wms/match-exceptions`)

**Purpose**: Identify and resolve 3-way match discrepancies (PO vs GRN vs Invoice).

**Main UI Components**:
- Exception list with variance indicators
- `ThreeWayMatchPanel` comparison view
- Resolution action buttons

**User Actions**:
- Review quantity/price discrepancies
- Approve exceptions with justification
- Escalate to management

**Mock Data Used**: `purchaseOrders`, `grns`, `invoices`

---

### 2.7 Supplier Contracts (`/wms/supplier-contracts`)

**Purpose**: Manage vendor contracts, pricing agreements, and terms.

**Main UI Components**:
- Contract list with status and expiry
- Contract detail view
- Create/edit contract forms

**User Actions**:
- Create/edit supplier contracts
- Track contract expiry dates
- Link contracts to purchase orders

**Mock Data Used**: `vendors`, `purchaseOrders`

---

## 3. WMS — Outbound Pages

### 3.1 Waves (`/wms/waves`)

**Purpose**: Plan wave-based batch order processing for efficient picking.

**User Actions**: Create waves, assign orders to waves, release waves for picking

### 3.2 Picking (`/wms/picking`)

**Purpose**: Generate and manage pick lists for warehouse operators.

**User Actions**: Start picking session, scan/confirm items, record shortages, complete pick lists

### 3.3 Packing (`/wms/packing`)

**Purpose**: Pack station operations — assemble orders for shipment.

**User Actions**: Scan picked items, assign to packages, print packing slips, close packages

### 3.4 Shipping (`/wms/shipping`)

**Purpose**: Confirm shipments and assign carriers.

**User Actions**: Create shipments, assign carriers, generate tracking numbers, confirm dispatch

### 3.5 Replenishment Rules (`/wms/replenishment-rules`)

**Purpose**: Configure automatic replenishment triggers and rules.

**User Actions**: Set min/max levels, define replenishment sources, enable/disable rules

### 3.6 Reservations (`/wms/reservations`)

**Purpose**: Manage stock reservations for pending sales orders.

**User Actions**: View reserved stock, manually reserve/release quantities, see reservation conflicts

**Mock Data Used** (all outbound): `salesOrders`, `inventory`, `warehouses`, `warehouseLocations`, `carriers`

---

## 4. WMS — Stock Pages

### 4.1 Stock Dashboard (`/wms/stock-dashboard`)

**Purpose**: Visual overview of stock health across all warehouses.

**Main UI Components**: Stock level gauges, category breakdown charts, warehouse comparison, aging analysis

### 4.2 Inventory (`/wms/inventory`)

**Purpose**: Full inventory listing with search, filter, and stock details.

**Main UI Components**:
- Data table with columns: SKU, product, warehouse, location, batch, qty on hand, reserved, available, in transit, expiry
- Filter bar: search, warehouse, category, stock level
- `ColumnToggle` for show/hide columns
- `SavedFiltersBar` for quick presets
- Export to CSV/Excel

**User Actions**: Search/filter inventory, view stock details, export data, check expiry warnings

### 4.3 Movement Journal (`/wms/movements`)

**Purpose**: Complete audit trail of all stock movements.

**User Actions**: View movement history, filter by type/date/product/warehouse

### 4.4 Cycle Count (`/wms/cycle-count`)

**Purpose**: Plan and execute physical inventory counts with variance analysis.

**Main UI Components**:
- Cycle count list with status and variance indicators
- Create count dialog (warehouse, zone, date)
- Counting interface: enter physical counts per product
- Variance analysis with approval levels:
  - ≤0.5% → auto-approval
  - ≤2% → warehouse manager review
  - ≤5% → DAF investigation
  - >5% → admin/DG investigation
- `ExportDialog`
- `WarehouseScopeBanner`

**User Actions**:
- Create new cycle count (select warehouse, zone, date)
- Start counting session
- Enter physical count values per product
- Submit count → auto-calculates variance
- Approve/investigate based on variance thresholds
- Inventory auto-adjusted on approval
- Export results

**Mock Data Used**: `cycleCounts`, `inventory`, `warehouses`

### 4.5 Stock Adjustments (`/wms/adjustments`)

**Purpose**: Manual stock corrections with approval workflow.

**User Actions**: Create adjustment (product, warehouse, qty, reason), submit for approval, approve/reject

### 4.6 Stock Transfers (`/wms/transfers`)

**Purpose**: Inter-warehouse and intra-warehouse stock transfers.

**Main UI Components**:
- Transfer list with status
- Create transfer dialog: product, from/to warehouse, from/to location, quantity, unit selector with conversion, reason, expected date
- Stock availability check (warns if insufficient)
- `WarehouseScopeBanner`
- `ExportDialog`

**User Actions**:
- Create transfer request (with RBAC: must have authority on source warehouse)
- Approve/reject transfers
- Dispatch transfer (source warehouse marks as In_Transit)
- Receive transfer (destination warehouse confirms receipt + inventory update)
- Export transfer list

**Mock Data Used**: `stockTransfers`, `inventory`, `warehouses`, `warehouseLocations`, `products`

### 4.7 Stock Block (`/wms/stock-block`)

**Purpose**: Quarantine/block stock for quality or legal holds.

**User Actions**: Block stock (product, warehouse, qty, reason), release blocked stock, view block history

**Mock Data Used**: `stockBlocks`, `inventory`

---

## 5. WMS — Traceability Pages

### 5.1 Lot / Batch (`/wms/lot-batch`)
**Purpose**: Track products by lot/batch number with expiry management.
**User Actions**: View lots, filter by expiry, trace lot origin (GRN → PO)

### 5.2 Serial Numbers (`/wms/serial-numbers`)
**Purpose**: Individual serial number tracking for high-value items.
**User Actions**: View serial numbers, track lifecycle (received → sold/returned)

### 5.3 Stock Valuation (`/wms/stock-valuation`)
**Purpose**: FIFO and PMP (weighted average) stock valuation reports.
**User Actions**: View valuation by product/category/warehouse, compare methods, export

### 5.4 Price History (`/wms/price-history`)
**Purpose**: Historical purchase/sale price trends per product.
**User Actions**: View price evolution charts, compare vendor prices

**Mock Data Used**: `lotBatches`, `serialNumbers`, `inventory`, `products`, `purchaseOrders`, `productHistory`

---

## 6. WMS — Internal Operations Pages

### 6.1 Kitting (`/wms/kitting`)
**Purpose**: Kit assembly using bill of materials (BOM).
**User Actions**: Create kit recipes, create kit orders, track assembly progress

### 6.2 Repacking (`/wms/repacking`)
**Purpose**: Reconditioning and repackaging operations.
**User Actions**: Create repack orders, specify input/output products and quantities

### 6.3 Returns (`/wms/returns`)
**Purpose**: Process customer and supplier returns.
**User Actions**: Create return, inspect returned goods, restock or dispose, generate credit notes

### 6.4 Credit Notes (`/wms/credit-notes`)
**Purpose**: Generate credit notes for returns/claims.
**User Actions**: Create credit note from return, track credit note status

### 6.5 Quality Claims (`/wms/quality-claims`)
**Purpose**: Track quality complaints from customers.
**User Actions**: Create claim, investigate, resolve, track claim history

### 6.6 Vendor Scorecard (`/wms/vendor-scorecard`)
**Purpose**: Supplier performance scoring and ranking.
**User Actions**: View scorecard metrics (on-time %, quality %, price compliance), compare vendors

**Mock Data Used**: `kitRecipes`, `kitOrders`, `repackOrders`, `returns`, `creditNotes`, `qualityClaims`, `vendors`, `grns`, `purchaseOrders`

---

## 7. WMS — Field Management Pages

### 7.1 Task Queue (`/wms/tasks`)
**Purpose**: Assign and track operator tasks (picking, putaway, counting).
**User Actions**: View pending tasks, assign to operators, mark complete, prioritize

### 7.2 Yard & Dock (`/wms/yard-dock`)
**Purpose**: Dock slot scheduling and truck check-in management.
**User Actions**: Schedule dock slots, check in trucks, manage dock assignments, view yard overview

### 7.3 Automation & API (`/wms/automation`)
**Purpose**: Robotics integration and API management.
**User Actions**: View API endpoints, manage integrations, configure automation rules

**Mock Data Used**: `dockSlots`, `truckCheckIns`, `gateLogs`, `integrations`

---

## 8. Master Data Pages

### 8.1 Products (`/wms/products`)

**Purpose**: Product catalog management with full CRUD, pricing, and unit conversion.

**Main UI Components**:
- `ProductKPICards` — active count, critical stock count, avg cost, avg price
- `ProductFilterBar` — search, category, subcategory, status filters
- `ProductTable` — sortable, paginated table with `ColumnToggle`
- `ProductFormDialog` — create/edit product (name, SKU, category, subcategory, UoM, cost, price, reorder point)
- `ProductDeleteDialog` — delete confirmation with dependency check (blocks if used in POs or SOs)
- `ProductDetailDrawer` — side drawer with full product info, stock by warehouse, pricing history
- `ProductPricingDialog` — edit cost/price with margin calculation
- `ProductUnitsDialog` — manage unit conversions (buy/sell/stock units)
- `ExportDialog`
- `WarehouseScopeBanner`
- `RBACGuard` — role-based visibility for financial fields

**User Actions**:
- Create/edit/delete products
- Configure unit conversions (e.g., Pack of 12 → individual pieces)
- View stock levels per warehouse
- Edit pricing with live margin calculation
- Export product catalog
- View product audit history (`productHistory`)

**Displayed Data**: SKU, name, category, subcategory, base UoM, conversions, total stock, status

**Mock Data Used**: `products`, `productCategories`, `subCategories`, `sectors`, `unitsOfMeasure`, `inventory`, `purchaseOrders`, `salesOrders`, `productHistory`, `productUnitConversions`

---

### 8.2 Categories (`/wms/categories`)
**Purpose**: Manage product category hierarchy.
**User Actions**: Create/edit/delete categories and subcategories

### 8.3 Units of Measure (`/wms/uom`)
**Purpose**: Define units of measure and conversion factors.
**User Actions**: Create/edit UoMs, define conversion relationships

### 8.4 Barcodes (`/wms/barcodes`)
**Purpose**: Barcode management and printing.
**User Actions**: Generate barcodes for products, print barcode labels

### 8.5 Vendors (`/wms/vendors`)

**Purpose**: Vendor management with integrated connection system.

**Main UI Components**:
- Tabs: "Fournisseurs" (vendor list) | "Connexions" (connection management with badge count)
- Vendor list: search, status filter, vendor cards with contact info
- Create vendor dialog (name, contact, phone, email, city, NIF tax ID with 15-digit validation, bank account, payment terms)
- Edit vendor dialog
- Vendor detail dialog (contact, payment terms, rating, total POs, total value)
- `VendorConnectionsTab`:
  - KPI cards: connected, pending sent, pending received, rejected
  - Invite supplier dialog (name, email, message)
  - Incoming requests list with Accept/Refuse buttons
  - Connection list filterable by status
- Export to CSV

**User Actions**:
- CRUD vendors (role-gated: level ≤ 3)
- Toggle vendor status (Active ↔ On Hold)
- Send connection invitation to supplier
- Accept/refuse incoming connection requests
- Remove existing connections
- Export vendor list

**Mock Data Used**: `vendors`, `connections`, `connectionNotifications`

---

### 8.6 Carriers (`/wms/carriers`)
**Purpose**: Shipping carrier configuration.
**User Actions**: Create/edit carriers, set rates, assign service levels

### 8.7 Payment Terms (`/wms/payment-terms`)
**Purpose**: Define payment term options (Net 15, Net 30, Net 60, etc.).
**User Actions**: Create/edit payment terms

### 8.8 Warehouses (`/wms/warehouses`)

**Purpose**: Warehouse configuration and bin location management.

**Main UI Components**:
- Warehouse cards: name, type (construction/food/technology/general), city, capacity bar, zone count, utilization %, status
- Warehouse CRUD dialog (name, short code, type, city, wilaya, address, manager, phone, speciality, zones, capacity)
- Location management section: zone/aisle/rack/level grid
- Location CRUD dialog (warehouse, zone, aisle, rack, level, type: Ambient/Chilled/Frozen/Dry, capacity)
- Delete confirmation dialogs
- Filter locations by warehouse
- Export warehouse/location lists

**User Actions**:
- Create/edit/delete warehouses (full-access users only)
- Create/edit/delete storage locations within warehouses
- View capacity utilization per warehouse
- Filter locations by warehouse

**Mock Data Used**: `warehouses`, `warehouseLocations`

---

### 8.9 Locations (`/wms/locations`)
**Purpose**: Detailed bin/shelf/zone management (alternative view).
**User Actions**: Create/edit locations, set location types, manage capacity

**Mock Data Used**: `warehouseLocations`, `warehouses`

---

## 9. Sales Pages

### 9.1 Orders (`/sales/orders`)

**Purpose**: Full sales order lifecycle management.

**Main UI Components**:
- KPI grid: total orders, in-progress, delivered, blocked (credit hold), total revenue
- Search + status filter
- Orders table: order ID, client, sales rep, date, delivery date, channel (Web/Phone/Manual/Mobile_App), total, status
- `OrderFormDialog` — create/edit order with:
  - Customer selector, sales rep, channel, dates, payment terms, discount %
  - Product lines with `ProductCombobox`, unit selection, pricing
  - Live total calculation
- `OrderDetailDrawer` — full order detail with line items, status history, actions
- Status workflow buttons (Draft → Approved → Picking → Packed → Shipped → Delivered → Invoiced)
- Credit hold detection and blocking
- Duplicate order, cancel order with confirmation
- Status history dialog

**User Actions**:
- Create/edit/duplicate/cancel sales orders
- Advance order through status workflow (RBAC-gated approval)
- View order detail with line items
- Filter/search orders

**Mock Data Used**: `salesOrders`, `customers`, `products`, `inventory`

---

### 9.2 Customers (`/sales/customers`)

**Purpose**: Customer directory with credit management and auto-blocking.

**Main UI Components**:
- Customer cards: name, type (Détaillant/Grossiste/Demi-Grossiste/Grande Surface), zone, credit usage %, status
- `CreditBadge` — color-coded credit utilization indicator
- Create/edit customer dialog
- Geo-sort by proximity (uses browser geolocation + Haversine distance)
- Auto-block logic: blocks customer if credit > 100% OR overdue > 60 days
- Navigate to customer detail page

**User Actions**:
- Create/edit customers
- Sort by geographic proximity
- View credit utilization and auto-block status
- Navigate to customer detail

**Mock Data Used**: `customers`, `invoices`

---

### 9.3 Customer Detail (`/sales/customers/:id`)
**Purpose**: Individual customer profile with order history, invoices, credit analysis.
**User Actions**: View all orders/invoices for customer, update credit limit, view location on map

### 9.4 Route Plan (`/sales/route-plan`)
**Purpose**: Sales route planning with interactive map.
**User Actions**: Plan delivery routes, optimize route order, assign drivers, view on Leaflet map

**Mock Data Used**: `customers`, `salesOrders`, `deliveryTrips`

---

## 10. Pricing Pages

### 10.1 Client Types (`/pricing/client-types`)
**Purpose**: Customer classification for tiered pricing.
**User Actions**: Create/edit client types (Détail, Gros, Demi-Gros, Grande Surface), set discount rules

### 10.2 Price Management (`/pricing/prices`)
**Purpose**: Price grid management with margin analysis.
**User Actions**: Set prices per product per client type, bulk update prices, view margins, view price history

**Mock Data Used**: `products`, `pricing store` (Zustand)

---

## 11. Distribution Pages

### 11.1 Routes (`/distribution/routes`)
**Purpose**: Delivery route management.
**User Actions**: Create/edit routes, assign stops, optimize sequence

### 11.2 Deliveries (`/distribution/deliveries`)
**Purpose**: Delivery tracking and status management.
**User Actions**: View delivery status, track in-transit shipments, confirm deliveries

### 11.3 Daily Closing (`/closing`)
**Purpose**: End-of-day reconciliation for cash, deliveries, and returns.
**User Actions**: Review day's transactions, reconcile cash, close day

**Mock Data Used**: `deliveryTrips`, `salesOrders`, `payments`

---

## 12. Accounting Pages (Financial-gated)

### 12.1 Invoices (`/accounting/invoices`)

**Purpose**: Invoice lifecycle management with auto-generation from delivered orders.

**Main UI Components**:
- "Orders to Invoice" section — delivered orders without invoice
- KPI cards: total invoiced, collected, outstanding, overdue
- Invoice table with filters
- Invoice detail dialog
- Auto-generate invoice from delivered order (calculates due date from payment terms)
- PDF export per invoice (`jsPDF`)
- Send invoice action
- Over-billing prevention (blocks if cumulative > 105% of order total)

**User Actions**:
- Auto-create invoice from delivered order
- Send invoice to customer
- Download invoice as PDF
- View invoice detail
- Filter by status (Draft, Sent, Partially_Paid, Paid, Overdue, Disputed, Cancelled)

**Mock Data Used**: `invoices`, `salesOrders`

---

### 12.2 Payments (`/accounting/payments`)

**Purpose**: Record and track customer payments with FX gain/loss analysis.

**Main UI Components**:
- Payment recording form (invoice selector, amount, method, reference, collected by, notes)
- Payment validation (blocks overpayment)
- FX gain/loss summary for foreign currency vendors
- Payment history table
- Charts: revenue by month, payment method distribution

**User Actions**:
- Record payment against invoice (updates invoice status: Partially_Paid or Paid)
- View FX exposure analysis
- Filter/search payments

**Mock Data Used**: `payments`, `invoices`, `purchaseOrders`

---

### 12.3 Payment Runs (`/accounting/payment-runs`)
**Purpose**: Batch payment processing for supplier invoices.

### 12.4 GRNI Report (`/accounting/grni`)
**Purpose**: Goods Received Not Invoiced — identifies receiving/invoicing gaps.

### 12.5 Bank Reconciliation (`/accounting/bank-reconciliation`)
**Purpose**: Match bank statements to recorded payments.

### 12.6 Chart of Accounts (`/accounting/chart-of-accounts`)
**Purpose**: General ledger account structure.

### 12.7 Budget & Cost Centers (`/accounting/budgets`)
**Purpose**: Budget planning and cost center management.

### 12.8 Accounting Reports (`/accounting/reports`)
**Purpose**: Financial reports (P&L, balance sheet, aging).

---

## 13. BI & Reports Pages

### 13.1 Reports Overview (`/reports`)
**Purpose**: Report catalog with quick access to all available reports.

### 13.2 Report Builder (`/reports/builder`)
**Purpose**: Custom report creation tool with drag-and-drop fields.

### 13.3 Margin History (`/reports/margin-history`)
**Purpose**: Product margin trend analysis over time.

### 13.4 Performance (`/bi/performance`)
**Purpose**: Operational performance dashboards with KPIs.

### 13.5 Profitability (`/bi/profitability`)
**Purpose**: Profitability analysis by product, customer, and category.

### 13.6 Category Distribution (`/bi/categories`)
**Purpose**: Sales distribution breakdown by product category.

### 13.7 Alerts (`/bi/alerts`)
**Purpose**: System alert management, configuration, and history.

---

## 14. Admin / Settings Pages

### 14.1 User Management (`/settings/users`)
**Purpose**: User CRUD with role assignment and warehouse access configuration.
**User Actions**: Create/edit/delete users, assign roles, set warehouse access, set governance permissions

### 14.2 System Settings (`/settings/system`)
**Purpose**: Global system configuration (company info, default settings).

### 14.3 Audit Log (`/settings/audit-log`)
**Purpose**: Complete audit trail of all system actions.
**User Actions**: Filter by date/user/action, view action details

### 14.4 Picking Strategy (`/settings/picking-strategy`)
**Purpose**: Configure picking algorithms (FIFO, FEFO, zone-based, wave).

### 14.5 Approval Workflows (`/settings/approval-workflows`)
**Purpose**: Define approval chains and thresholds.

### 14.6 Putaway Rules (`/settings/putaway-rules`)
**Purpose**: Automated putaway zone assignment rules.

### 14.7 Alert Rules (`/settings/alert-rules`)
**Purpose**: Configure alert triggers (low stock, expiry, overdue, etc.).

### 14.8 Location Types (`/settings/location-types`)
**Purpose**: Define storage location categories (Ambient, Chilled, Frozen, etc.).

### 14.9 Integrations (`/settings/integrations`)
**Purpose**: External system connections and API management.

### 14.10 Currency Rates (`/settings/currencies`)
**Purpose**: Multi-currency exchange rate management (DZD, EUR, USD).

### 14.11 Tax Config (`/settings/tax-config`)
**Purpose**: Tax rules and rates configuration (TVA 19%, etc.).

---

## 15. Supplier Portal — In-App (`/my/*`)

### 15.1 Supplier Dashboard (`/my/dashboard`)
**Purpose**: Supplier's overview of orders, invoices, and stats.
**Displayed Data**: Active POs, pending deliveries, invoice totals, performance score

### 15.2 Supplier Products (`/my/products`)
**Purpose**: Supplier's product catalog management.

### 15.3 Supplier Orders (`/my/orders`)
**Purpose**: View incoming purchase orders from connected warehouses.

### 15.4 Supplier Invoices (`/my/invoices`)
**Purpose**: View invoices and payment status.

### 15.5 Supplier Stats (`/my/stats`)
**Purpose**: Performance analytics (on-time %, quality %, volume trends).

### 15.6 Supplier Profile (`/my/profile`)
**Purpose**: Company profile and contact information management.

---

## 16. Supplier Mobile App (`/supplier/*`)

### 16.1 Dashboard (`/supplier/`)
**Purpose**: Mobile-optimized supplier dashboard with key metrics.

### 16.2 Orders (`/supplier/orders`)
**Purpose**: Incoming PO list with filter and search.

### 16.3 Order Detail (`/supplier/orders/:id`)
**Purpose**: PO detail with confirm/refuse/counter-offer actions.

### 16.4 Deliveries (`/supplier/deliveries`)
**Purpose**: Track outgoing deliveries and shipments.

### 16.5 Invoices (`/supplier/invoices`)
**Purpose**: Invoice list and payment tracking.

### 16.6 Products (`/supplier/products`)
**Purpose**: Product catalog browsing.

### 16.7 Performance (`/supplier/performance`)
**Purpose**: Supplier scorecard and performance metrics.

### 16.8 Connections (`/supplier/connections`)

**Purpose**: Manage warehouse connections (bidirectional invitation system).

**Main UI Components**:
- KPI cards: connected warehouses, pending sent, pending received, rejected
- "Add Warehouse" dialog (name, email, message)
- Incoming requests list with Accept/Refuse buttons
- Connection list filterable by status
- Connection detail cards with status badges

**User Actions**:
- Send connection invitation to warehouse
- Accept/refuse incoming warehouse requests
- Remove connections
- Filter by connection status

### 16.9 Notifications (`/supplier/notifications`)
**Purpose**: Notification feed (new POs, status updates, connection activity).

### 16.10 Settings (`/supplier/settings`)
**Purpose**: Account and notification preferences.

---

## 17. Client Portal (`/portal/*`)

### 17.1 Dashboard (`/portal/dashboard`)
**Purpose**: Customer's order summary with credit gauge.
**Main UI Components**: Order KPIs, `CreditGauge`, recent orders, quick actions

### 17.2 My Orders (`/portal/orders`)
**Purpose**: Order history list with status tracking.

### 17.3 Order Detail (`/portal/orders/:orderId`)
**Purpose**: Individual order tracking with line items and timeline.

### 17.4 Place Order (`/portal/place-order`)
**Purpose**: Self-service order creation.
**User Actions**: Browse product catalog, add to cart, set quantities, submit order

### 17.5 Invoices (`/portal/invoices`)
**Purpose**: View and download invoices.

### 17.6 Payments (`/portal/payments`)
**Purpose**: Payment history.

### 17.7 Statement (`/portal/statement`)
**Purpose**: Account statement with balance.

### 17.8 Return Request (`/portal/return`)
**Purpose**: Initiate product returns.
**User Actions**: Select order, specify return items and reason, submit request

### 17.9 Notifications (`/portal/notifications`)
**Purpose**: Order updates, invoice alerts, promotional notifications.

---

## 18. Mobile Sales App (`/mobile/*`)

### 18.1 Dashboard (`/mobile/dashboard`)
**Purpose**: Daily sales KPIs for field agents.
**Main UI Components**: Today's targets, completed visits, pending orders, revenue

### 18.2 Customer List (`/mobile/customers`)
**Purpose**: Customer directory with search and geo-sort.
**Main UI Components**: Customer cards, search, proximity sorting, visit status

### 18.3 Customer Detail (`/mobile/customers/:id`)
**Purpose**: Customer profile with order history and visit log.

### 18.4 New Order (`/mobile/new-order`)
**Purpose**: Quick order creation in the field.
**User Actions**: Select customer, add products, set quantities, submit (online or queue offline)

### 18.5 Order History (`/mobile/orders`)
**Purpose**: Recent orders submitted by the agent.

### 18.6 Route (`/mobile/route`)
**Purpose**: GPS-tracked daily route with map.
**Main UI Components**: Leaflet map, stop markers, route line, current position

### 18.7 Offline Queue (`/mobile/offline-queue`)
**Purpose**: View and manage orders pending sync.
**User Actions**: View queued items, retry sync, delete pending items

---

## 19. Delivery Driver App (`/delivery/*`)

### 19.1 Vehicle Check (`/delivery/vehicle-check`)
**Purpose**: Pre-trip vehicle inspection checklist.
**User Actions**: Complete checklist items, report defects, submit check

### 19.2 Today's Trip (`/delivery/trip`)
**Purpose**: Current day trip overview with stop count and progress.

### 19.3 Stops List (`/delivery/stops`)
**Purpose**: All delivery stops for the day.

### 19.4 Stop Detail (`/delivery/stop/:stopId`)
**Purpose**: Individual stop information (customer, address, items, special instructions).

### 19.5 Delivery Confirm (`/delivery/confirm/:stopId`)
**Purpose**: Proof of delivery with signature capture.
**Main UI Components**: `SignatureCanvas`, photo upload, customer confirmation
**User Actions**: Capture signature, take delivery photo, record delivered quantities, confirm

### 19.6 Cash Collection (`/delivery/cash/:stopId`)
**Purpose**: Collect cash payment at delivery stop.
**User Actions**: Record cash amount, select denominations, issue receipt

### 19.7 Proofs (`/delivery/proofs`)
**Purpose**: Gallery of delivery proofs (signatures, photos).

### 19.8 Cash Summary (`/delivery/cash`)
**Purpose**: Daily cash collection totals and reconciliation.

### 19.9 Trip Map (`/delivery/map`)
**Purpose**: Live map with route visualization and stop markers.

### 19.10 End of Day (`/delivery/end-of-day`)
**Purpose**: EOD reconciliation — cash handover, trip summary, incident log.

### 19.11 Incident Report (`/delivery/incident`)
**Purpose**: Report delivery incidents (damaged goods, access issues, customer absent).

---

## 20. Owner Dashboard (`/owner/*`)

### 20.1 Dashboard (`/owner/`)
**Purpose**: Platform KPIs: total subscribers, active tenants, revenue, uptime.

### 20.2 Subscriptions (`/owner/subscriptions`)
**Purpose**: Manage tenant subscriptions.
**Main UI Components**: Subscriber list, `SubscriberDetailDrawer`, `CreateSubscriberDialog`, `ChangePlanDialog`, `RejectReasonDialog`
**User Actions**: View/create/edit subscribers, change plans, approve/reject, view details

### 20.3 Billing (`/owner/billing`)
**Purpose**: Platform billing and revenue tracking.

### 20.4 Onboarding (`/owner/onboarding`)
**Purpose**: New tenant onboarding workflow.
**User Actions**: Guide new tenants through setup steps

### 20.5 Monitoring (`/owner/monitoring`)
**Purpose**: System health dashboard (CPU, memory, errors, response times).

### 20.6 Support (`/owner/support`)
**Purpose**: Support ticket management.

### 20.7 Settings (`/owner/settings`)
**Purpose**: Platform-level configuration.

---

## 21. Multi-WMS Instance Pages (`/i/:instanceId/*`)

### 21.1 Incoming PO List (`/i/:instanceId/wms/incoming-pos`)
**Purpose**: Cross-instance PO routing — view POs routed to this WMS instance from other instances.
**User Actions**: View incoming POs, accept/reject, route to receiving

### 21.2 Incoming PO Detail (`/i/:instanceId/wms/incoming-pos/:poId`)
**Purpose**: Individual incoming PO review with line items and routing info.

All other pages under `/i/:instanceId/*` mirror the admin routes with instance-scoped data via `WMSInstanceLayout` + `InstanceContext`.

---

## 22. Login Page (`/login`)

**Purpose**: Enterprise persona picker with multi-step authentication.

**Main UI Components**:
- Step 1 — Company Selection: grid of company cards (8 tenants)
- Step 2 — User Selection: grid of user cards filtered by company, sorted by role level, with:
  - Role badge (color-coded by level)
  - Warehouse assignment badges
  - Approval threshold indicator
- Step 3 — PIN Authentication: 6-digit OTP input with:
  - Demo PIN display for easy testing
  - Shake animation on error
  - Biometric authentication option (WebAuthn)
- Back navigation between steps

**User Actions**:
- Select company → select user → enter PIN → login
- Optional biometric authentication
- View demo PINs for testing

**Mock Data Used**: `users` (35 users across 8 tenants), `USER_PINS` (hardcoded PIN map)

---

*✅ Phase 3 complete. Confirm to proceed to Phase 4 — User Flows.*
