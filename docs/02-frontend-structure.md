# Phase 2 — Frontend Structure

---

## 1. Main Layout Architecture

The application uses **6 distinct layout shells**, each tailored to a specific user persona. All layouts are lazy-loaded and route-guarded.

### 1.1 Admin / WMS Layout (`AppLayout`)

> **Used by**: CEO, Directors, Managers, QC Officers, Accountants, BI Analysts, Supervisors, Operators, Suppliers (in-app portal)

```
┌─────────────────────────────────────────────────────────────┐
│ [Skip to Content Link — accessibility]                      │
├──────────┬──────────────────────────────────────────────────┤
│          │  ControlCenterTopbar                             │
│          │  ┌──────────────────────────────────────────────┐│
│  App     │  │ Breadcrumbs │ SpotlightSearch │ Notifications││
│  Sidebar │  │ Instance Switcher │ User Badge │ Logout      ││
│          │  └──────────────────────────────────────────────┘│
│  (macOS  │                                                  │
│  Finder  │  <main id="main-content">                       │
│  style)  │    <PageTransition> (framer-motion)              │
│          │      <Outlet /> ← routed page content            │
│  240px   │    </PageTransition>                              │
│  or 56px │  </main>                                         │
│ collapsed│                                                  │
├──────────┴──────────────────────────────────────────────────┤
│ [OfflineStatusBar — shown when offline]                     │
└─────────────────────────────────────────────────────────────┘
```

#### Sidebar (`AppSidebar`)
- **Style**: macOS Finder-inspired, glassmorphic with backdrop blur
- **Behavior**: Collapsible (240px → 56px), state persisted in `localStorage`
- **Mobile**: Full-screen overlay with hamburger toggle
- **Components**: `NavItem`, `NavGroup`, `WmsSubGroupNav`, `SidebarFooter`, `InstanceSwitcher`
- **RBAC Filtering**: Sidebar sections are filtered per role via `ROLE_VISIBLE_SECTIONS` map

#### Topbar (`ControlCenterTopbar`)
- Inline breadcrumbs with route-label mapping (French labels)
- `SpotlightSearch` — global search (Cmd+K / Ctrl+K)
- Notification bell with unread count badge
- User avatar, role badge, warehouse scope indicator
- WMS instance switcher (multi-tenant)
- Data reset button, logout with confirmation dialog

---

### 1.2 Mobile Sales Layout (`MobileLayout`)

> **Route**: `/mobile/*` | **Users**: Sales Agents

```
┌────────────────────────────┐
│  Mobile Header (app bar)   │
├────────────────────────────┤
│                            │
│  <Outlet /> (screen)       │
│                            │
├────────────────────────────┤
│  Bottom Tab Navigation     │
│  [Dashboard][Clients]      │
│  [New Order][Orders][More] │
└────────────────────────────┘
```

- Touch-optimized with pull-to-refresh, swipe cards
- Offline banner with sync queue
- GPS tracking for visit logging
- Biometric authentication prompt

---

### 1.3 Delivery Driver Layout (`DeliveryLayout`)

> **Route**: `/delivery/*` | **Users**: Drivers

```
┌────────────────────────────┐
│  Delivery Header           │
├────────────────────────────┤
│                            │
│  <Outlet /> (screen)       │
│                            │
├────────────────────────────┤
│  Bottom Tab Navigation     │
│  [Trip][Stops][Proofs]     │
│  [Cash][More]              │
└────────────────────────────┘
```

- Pre-trip vehicle check flow
- Signature canvas for proof of delivery
- Cash collection tracking
- GPS-tracked with offline sync engine

---

### 1.4 Client Portal Layout (`PortalLayout`)

> **Route**: `/portal/*` | **Users**: Customers / Clients

```
┌────────────────────────────┐
│  Portal Header + Branding  │
├────────────────────────────┤
│                            │
│  <Outlet /> (screen)       │
│                            │
├────────────────────────────┤
│  Bottom Tab Navigation     │
│  [Home][Orders][Place]     │
│  [Invoices][More]          │
└────────────────────────────┘
```

- Credit gauge component (credit limit visualization)
- Status badges for orders, invoices, payments
- Self-service return requests

---

### 1.5 Supplier Mobile Layout (`SupplierLayout`)

> **Route**: `/supplier/*` | **Users**: Suppliers (mobile)

```
┌────────────────────────────┐
│  Supplier Header           │
├────────────────────────────┤
│                            │
│  <Outlet /> (screen)       │
│                            │
├────────────────────────────┤
│  Bottom Tab Navigation     │
│  [Home][Orders][Warehouses]│
│  [Deliveries][More]        │
└────────────────────────────┘
```

- Connection management (warehouse invitations)
- Order detail with status tracking
- Performance metrics

---

### 1.6 Owner Dashboard Layout (`OwnerLayout`)

> **Route**: `/owner/*` | **Users**: Platform Owner (SaaS admin)

```
┌────────────────────────────┐
│  Owner Header + Branding   │
├────────────────────────────┤
│                            │
│  <Outlet /> (screen)       │
│                            │
├────────────────────────────┤
│  Bottom Tab Navigation     │
│  [Dashboard][Subscribers]  │
│  [Billing][Support][More]  │
└────────────────────────────┘
```

- Subscription management with plan change dialogs
- Tenant onboarding flow
- System monitoring dashboard

---

## 2. Navigation Structure

### 2.1 Admin Sidebar Sections

The sidebar is organized into **9 main sections** with RBAC-based visibility:

| # | Section | Icon | Key | Visible To |
|---|---------|------|-----|------------|
| 1 | **Dashboard** | `LayoutDashboard` | `dashboard` | All roles |
| 2 | **Données de base** (Master Data) | `Database` | `masterData` | CEO, Directors, Managers, QC, Accountants, BI, Supervisors |
| 3 | **WMS** | `Warehouse` | `wms` | CEO, Directors, Managers, QC, Operators, Supervisors |
| 4 | **Ventes** (Sales) | `ShoppingCart` | `sales` | CEO, Directors, Managers |
| 5 | **Tarification** (Pricing) | `BadgeDollarSign` | `pricing` | CEO, Directors, Managers |
| 6 | **Distribution** | `Truck` | `distribution` | CEO, Directors, Managers, Supervisors, Drivers |
| 7 | **Comptabilité** (Accounting) | `Calculator` | `accounting` | CEO, Finance Director, Accountants (financial gate) |
| 8 | **BI & Rapports** | `BarChart3` | `bi` | CEO, Directors, Accountants, BI Analysts |
| 9 | **Admin** (Settings) | `Settings` | `admin` | CEO, Directors, Managers (admin-level roles) |

**Special**: Supplier role sees only **"Mon Espace Fournisseur"** (Supplier Portal) section.

### 2.2 WMS Sub-Groups (Nested Navigation)

The WMS section uses a **sub-group navigation** pattern with 6 color-coded groups:

| Sub-Group | Color | Pages |
|-----------|-------|-------|
| **Inbound** | 🟢 Green | GRN, Quality Control, Putaway, Cross Docking, Purchase Orders, Match Exceptions, Supplier Contracts |
| **Outbound** | 🔵 Blue | Waves, Picking, Packing, Shipping, Replenishment Rules, Reservations |
| **Stock** | 🟣 Purple | Stock Dashboard, Inventory, Movement Journal, Cycle Count, Adjustments, Transfers, Stock Block |
| **Traçabilité** (Traceability) | 🟡 Yellow | Lot/Batch, Serial Numbers, Stock Valuation, Price History |
| **Opérations Internes** | 🔴 Red | Kitting, Repacking, Returns, Credit Notes, Quality Claims, Vendor Scorecard |
| **Gestion Terrain** (Field) | 🔵 Cyan | Task Queue, Yard & Dock, Automation & Robotics |

---

## 3. Route Guards

| Guard | File | Purpose |
|-------|------|---------|
| `ProtectedRoute` | `src/app/guards/ProtectedRoute.tsx` | Requires authenticated user (any role) |
| `AdminRoute` | `src/app/guards/AdminRoute.tsx` | Requires system admin governance permission |
| `FinancialRoute` | `src/app/guards/FinancialRoute.tsx` | Requires financial access (Finance Director, CEO, Accountant) |
| `RBACGuard` | `src/app/guards/RBACGuard.tsx` | Generic role-based access control wrapper |
| `MobileAuthGuard` | `src/mobile/components/MobileAuthGuard.tsx` | Mobile sales app authentication |
| `DeliveryAuthGuard` | `src/delivery/components/DeliveryAuthGuard.tsx` | Delivery driver authentication |
| `PortalAuthGuard` | `src/portal/components/PortalAuthGuard.tsx` | Client portal authentication |
| `SupplierAuthGuard` | `src/supplier/components/SupplierAuthGuard.tsx` | Supplier mobile app authentication |
| `OwnerAuthGuard` | `src/owner/components/OwnerAuthGuard.tsx` | Platform owner authentication |

---

## 4. Complete Pages List

### 4.1 Authentication Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Login | `/login` | Enterprise persona picker with company selection + PIN/biometric auth | All users |
| Mobile Login | `/mobile/login` | Sales agent mobile login | Sales Agents |
| Delivery Login | `/delivery/login` | Driver login | Drivers |
| Portal Login | `/portal/login` | Client portal login | Customers |
| Supplier Login | `/supplier/login` | Supplier portal login | Suppliers |
| Owner Login | `/owner/login` | Platform owner login | Platform Owner |

### 4.2 Dashboard Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Main Dashboard | `/` | KPI cards, sales charts, inventory pie, warehouse bar chart, activity timeline, alerts | All warehouse roles |
| Mobile Dashboard | `/mobile/dashboard` | Sales KPIs, quick actions, recent orders | Sales Agents |
| Portal Dashboard | `/portal/dashboard` | Order summary, credit gauge, recent activity | Customers |
| Supplier Dashboard | `/supplier/` | Order stats, delivery metrics, performance | Suppliers |
| Owner Dashboard | `/owner/` | Subscriber count, revenue, system health | Platform Owner |

### 4.3 WMS — Inbound Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| GRN (Réception) | `/wms/grn` | Goods receipt notes — receiving against POs | Managers, Operators, QC |
| Quality Control | `/wms/quality-control` | QC inspections, pass/fail, HACCP compliance | QC Officers, Managers |
| Putaway | `/wms/putaway` | Assign received goods to storage locations | Operators, Managers |
| Cross Docking | `/wms/cross-docking` | Direct transfer from inbound to outbound | Managers, Supervisors |
| Purchase Orders | `/wms/purchase-orders` | Create/manage POs to suppliers (connection-aware) | Managers, Directors |
| Match Exceptions | `/wms/match-exceptions` | 3-way match discrepancies (PO vs GRN vs Invoice) | Finance, Managers |
| Supplier Contracts | `/wms/supplier-contracts` | Manage supplier agreements and terms | Managers, Directors |

### 4.4 WMS — Outbound Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Waves | `/wms/waves` | Wave planning for batch order processing | Managers, Supervisors |
| Picking | `/wms/picking` | Pick list generation and execution | Operators, Supervisors |
| Packing | `/wms/packing` | Pack station operations | Operators |
| Shipping | `/wms/shipping` | Ship confirmation and carrier assignment | Managers, Operators |
| Replenishment Rules | `/wms/replenishment-rules` | Auto-replenishment rules and thresholds | Managers |
| Reservations | `/wms/reservations` | Stock reservations for pending orders | Managers |

### 4.5 WMS — Stock Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Stock Dashboard | `/wms/stock-dashboard` | Visual stock overview with warehouse breakdown | All warehouse roles |
| Inventory | `/wms/inventory` | Full inventory list with filters and search | All warehouse roles |
| Movement Journal | `/wms/movements` | Stock movement history and audit trail | Managers, Accountants |
| Cycle Count | `/wms/cycle-count` | Planned cycle counting with variance analysis | Managers, Operators |
| Stock Adjustments | `/wms/adjustments` | Manual stock corrections with approval workflow | Managers |
| Stock Transfers | `/wms/transfers` | Inter-warehouse and intra-warehouse transfers | Managers |
| Stock Block | `/wms/stock-block` | Block/quarantine stock for quality or legal holds | QC, Managers |

### 4.6 WMS — Traceability Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Lot / Batch | `/wms/lot-batch` | Lot/batch tracking with expiry management | QC, Managers |
| Serial Numbers | `/wms/serial-numbers` | Individual serial number tracking | QC, Managers |
| Stock Valuation | `/wms/stock-valuation` | FIFO/PMP valuation reports | Finance, Managers |
| Price History | `/wms/price-history` | Historical pricing trends per product | Finance, Managers |

### 4.7 WMS — Internal Operations Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Kitting | `/wms/kitting` | Kit assembly (BOM-based) | Operators, Managers |
| Repacking | `/wms/repacking` | Repackaging/reconditioning orders | Operators, Managers |
| Returns | `/wms/returns` | Customer and supplier return processing | Managers |
| Credit Notes | `/wms/credit-notes` | Credit note generation for returns | Finance, Managers |
| Quality Claims | `/wms/quality-claims` | Quality complaint tracking | QC, Managers |
| Vendor Scorecard | `/wms/vendor-scorecard` | Supplier performance scoring | Managers, Directors |

### 4.8 WMS — Field Management Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Task Queue | `/wms/tasks` | Operator task assignment and tracking | Supervisors, Operators |
| Yard & Dock | `/wms/yard-dock` | Dock slot scheduling, truck check-ins | Managers |
| Automation & API | `/wms/automation` | Robotics integration and API management | System Admin |

### 4.9 Master Data Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Products | `/wms/products` | Product catalog with CRUD, units, dimensions | Managers, Directors |
| Categories | `/wms/categories` | Product category hierarchy | Managers |
| Units of Measure | `/wms/uom` | UoM definitions and conversions | Managers |
| Barcodes | `/wms/barcodes` | Barcode management and printing | Managers, Operators |
| Vendors | `/wms/vendors` | Vendor management + connection system | Managers, Directors |
| Carriers | `/wms/carriers` | Shipping carrier configuration | Managers |
| Payment Terms | `/wms/payment-terms` | Payment term definitions | Finance, Managers |
| Warehouses | `/wms/warehouses` | Warehouse configuration and zones | Directors, Managers |
| Locations | `/wms/locations` | Bin/shelf/zone location management | Managers |

### 4.10 Sales Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Orders | `/sales/orders` | Sales order management with status workflow | Managers, Directors |
| Customers | `/sales/customers` | Customer directory and credit management | Managers, Directors |
| Customer Detail | `/sales/customers/:id` | Individual customer profile, history, credit | Managers |
| Route Plan | `/sales/route-plan` | Sales route planning with map view | Managers |

### 4.11 Pricing Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Client Types | `/pricing/client-types` | Customer classification (Détail, Gros, etc.) | Managers, Directors |
| Price Management | `/pricing/prices` | Price grid with margin tracking and bulk updates | Managers, Directors |

### 4.12 Distribution Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Routes | `/distribution/routes` | Delivery route management | Managers |
| Deliveries | `/distribution/deliveries` | Delivery tracking and status | Managers, Drivers |
| Daily Closing | `/closing` | End-of-day reconciliation | Managers |

### 4.13 Accounting Pages (Financial-gated)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Invoices | `/accounting/invoices` | Invoice management and AR tracking | Finance, Accountants |
| Payments | `/accounting/payments` | Payment recording and tracking | Finance, Accountants |
| Payment Runs | `/accounting/payment-runs` | Batch payment processing | Finance |
| GRNI Report | `/accounting/grni` | Goods Received Not Invoiced report | Finance |
| Bank Reconciliation | `/accounting/bank-reconciliation` | Bank statement matching | Finance |
| Chart of Accounts | `/accounting/chart-of-accounts` | General ledger structure | Finance |
| Budget & Cost Centers | `/accounting/budgets` | Budget management | Finance, Directors |
| Accounting Reports | `/accounting/reports` | Financial reports and statements | Finance |

### 4.14 BI & Reports Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Reports Overview | `/reports` | Report catalog and quick access | Managers, BI Analysts |
| Report Builder | `/reports/builder` | Custom report creation tool | BI Analysts |
| Margin History | `/reports/margin-history` | Product margin trend analysis | Finance, BI Analysts |
| Performance | `/bi/performance` | Operational performance dashboards | Directors, BI Analysts |
| Profitability | `/bi/profitability` | Profitability analysis by product/customer | Finance, Directors |
| Category Distribution | `/bi/categories` | Sales distribution by category | BI Analysts |
| Alerts | `/bi/alerts` | System alert management and rules | Directors, Managers |

### 4.15 Admin / Settings Pages

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| User Management | `/settings/users` | User CRUD with role assignment (Admin-gated) | System Admins |
| System Settings | `/settings/system` | Global system configuration (Admin-gated) | System Admins |
| Audit Log | `/settings/audit-log` | Full audit trail with filters | Directors, Managers |
| Picking Strategy | `/settings/picking-strategy` | Configure picking algorithms (FIFO, FEFO, etc.) | Managers |
| Approval Workflows | `/settings/approval-workflows` | Configure approval chains and thresholds | Directors |
| Putaway Rules | `/settings/putaway-rules` | Automated putaway zone assignment rules | Managers |
| Alert Rules | `/settings/alert-rules` | Configure alert triggers and notifications | Managers |
| Location Types | `/settings/location-types` | Define storage location categories | Managers |
| Integrations | `/settings/integrations` | External system connections | System Admins |
| Currency Rates | `/settings/currencies` | Multi-currency exchange rates | Finance |
| Tax Config | `/settings/tax-config` | Tax rules and rates | Finance |

### 4.16 Supplier Portal Pages (Inside Admin Layout — `/my/*`)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Supplier Dashboard | `/my/dashboard` | Overview: orders, invoices, stats | Supplier |
| Supplier Products | `/my/products` | Manage product catalog | Supplier |
| Supplier Orders | `/my/orders` | View and manage incoming orders | Supplier |
| Supplier Invoices | `/my/invoices` | View invoices and payment status | Supplier |
| Supplier Stats | `/my/stats` | Performance analytics | Supplier |
| Supplier Profile | `/my/profile` | Company profile management | Supplier |

### 4.17 Supplier Mobile App Pages (`/supplier/*`)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Supplier Dashboard | `/supplier/` | Mobile dashboard with key metrics | Supplier |
| Orders List | `/supplier/orders` | Incoming PO list | Supplier |
| Order Detail | `/supplier/orders/:id` | PO detail with confirm/refuse actions | Supplier |
| Deliveries | `/supplier/deliveries` | Delivery tracking | Supplier |
| Invoices | `/supplier/invoices` | Invoice list | Supplier |
| Products | `/supplier/products` | Product catalog | Supplier |
| Performance | `/supplier/performance` | Supplier scorecard metrics | Supplier |
| Connections | `/supplier/connections` | Warehouse connection management (invite/accept/refuse) | Supplier |
| Notifications | `/supplier/notifications` | Notification center | Supplier |
| Settings | `/supplier/settings` | Account settings | Supplier |
| More | `/supplier/more` | Additional menu items | Supplier |

### 4.18 Client Portal Pages (`/portal/*`)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Portal Dashboard | `/portal/dashboard` | Order summary, credit gauge | Customer |
| My Orders | `/portal/orders` | Order history list | Customer |
| Order Detail | `/portal/orders/:orderId` | Individual order tracking | Customer |
| Place Order | `/portal/place-order` | New order creation | Customer |
| Invoices | `/portal/invoices` | Invoice list and download | Customer |
| Payments | `/portal/payments` | Payment history | Customer |
| Statement | `/portal/statement` | Account statement | Customer |
| Return Request | `/portal/return` | Initiate product returns | Customer |
| Notifications | `/portal/notifications` | Notification feed | Customer |
| More | `/portal/more` | Additional settings | Customer |

### 4.19 Mobile Sales App Pages (`/mobile/*`)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Mobile Dashboard | `/mobile/dashboard` | Daily sales KPIs | Sales Agent |
| Customer List | `/mobile/customers` | Customer directory with search | Sales Agent |
| Customer Detail | `/mobile/customers/:id` | Customer profile and history | Sales Agent |
| New Order | `/mobile/new-order` | Quick order creation | Sales Agent |
| Order History | `/mobile/orders` | Recent orders list | Sales Agent |
| Route Map | `/mobile/route` | GPS-tracked daily route | Sales Agent |
| Offline Queue | `/mobile/offline-queue` | Pending sync items | Sales Agent |
| More | `/mobile/more` | Settings, sync, logout | Sales Agent |

### 4.20 Delivery Driver App Pages (`/delivery/*`)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Vehicle Check | `/delivery/vehicle-check` | Pre-trip vehicle inspection checklist | Driver |
| Today's Trip | `/delivery/trip` | Current day trip overview | Driver |
| Stops List | `/delivery/stops` | All delivery stops for the day | Driver |
| Stop Detail | `/delivery/stop/:stopId` | Individual stop info and actions | Driver |
| Delivery Confirm | `/delivery/confirm/:stopId` | Proof of delivery with signature | Driver |
| Cash Collection | `/delivery/cash/:stopId` | Cash payment collection per stop | Driver |
| Proofs | `/delivery/proofs` | Photo/signature proof gallery | Driver |
| Cash Summary | `/delivery/cash` | Daily cash collection totals | Driver |
| Trip Map | `/delivery/map` | Live map with route visualization | Driver |
| End of Day | `/delivery/end-of-day` | EOD reconciliation and cash handover | Driver |
| Incident Report | `/delivery/incident` | Report delivery incidents | Driver |
| More | `/delivery/more` | Settings and info | Driver |

### 4.21 Owner Dashboard Pages (`/owner/*`)

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Owner Dashboard | `/owner/` | Platform KPIs: subscribers, revenue, uptime | Platform Owner |
| Subscriptions | `/owner/subscriptions` | Manage tenant subscriptions and plans | Platform Owner |
| Billing | `/owner/billing` | Invoice and payment tracking for tenants | Platform Owner |
| Onboarding | `/owner/onboarding` | New tenant onboarding workflow | Platform Owner |
| Monitoring | `/owner/monitoring` | System health, performance metrics | Platform Owner |
| Support | `/owner/support` | Support ticket management | Platform Owner |
| Settings | `/owner/settings` | Platform-level configuration | Platform Owner |

### 4.22 Multi-WMS Instance Pages (`/i/:instanceId/*`)

All admin pages are mirrored under `/i/:instanceId/` with `WMSInstanceLayout` wrapper for tenant isolation. This adds 2 unique pages:

| Page | Route | Purpose | Users |
|------|-------|---------|-------|
| Incoming PO List | `/i/:instanceId/wms/incoming-pos` | Cross-instance PO routing | Managers |
| Incoming PO Detail | `/i/:instanceId/wms/incoming-pos/:poId` | Individual incoming PO review | Managers |

---

## 5. Shared UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `DataTable` | `src/shared/components/` | Reusable data table with sorting, filtering, pagination |
| `VirtualDataTable` | `src/shared/components/` | Virtualized table for large datasets |
| `PageShell` | `src/shared/components/` | Consistent page wrapper with header |
| `PageHeader` | `src/shared/components/` | Title, description, action buttons |
| `FilterBar` | `src/shared/components/` | Horizontal filter controls |
| `FormDialog` | `src/shared/components/` | Modal form pattern |
| `DetailDrawer` | `src/shared/components/` | Side drawer for record details |
| `ChartCard` | `src/shared/components/` | Card wrapper for chart visualizations |
| `SectionCard` | `src/shared/components/` | Grouped content card |
| `ActionMenu` | `src/shared/components/` | Dropdown action menu for table rows |
| `EmptyChart` / `ListEmptyState` | `src/shared/components/` | Empty state illustrations |
| `InfoPanel` | `src/shared/components/` | Information callout panel |
| `KpiCard` | `src/components/` | Animated KPI display card |
| `StatusBadge` | `src/components/` | Color-coded status indicator |
| `ColumnToggle` | `src/components/` | Show/hide table columns |
| `DateFilter` | `src/components/` | Date range filter component |
| `SavedFiltersBar` | `src/components/` | Quick-access saved filter presets |
| `ExportDialog` | `src/components/` | Export to CSV/PDF dialog |
| `ConfirmDialog` | `src/components/` | Confirmation modal |
| `ProductCombobox` | `src/components/` | Searchable product selector |
| `UnitSelector` | `src/components/` | Unit of measure picker |
| `ThreeWayMatchPanel` | `src/components/` | PO/GRN/Invoice matching comparison |

---

## 6. Internationalization

- **Framework**: i18next + react-i18next
- **Supported Languages**: English (`en`), French (`fr`), Arabic (`ar`)
- **Default**: French (UI labels are primarily in French)
- **Locale Files**: `src/i18n/locales/{en,fr,ar}.json`

---

## 7. Theming

- **System**: `ThemeContext` with light/dark mode toggle
- **Sidebar themes**: Configurable sidebar appearance
- **CSS Variables**: HSL-based semantic tokens in `index.css`
- **Tailwind**: Custom design tokens in `tailwind.config.ts`

---

*✅ Phase 2 complete. Confirm to proceed to Phase 3 — Page Features.*
