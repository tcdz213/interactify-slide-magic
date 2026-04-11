# B2B Distribution SaaS Platform

## Complete Strategy & Architecture Blueprint

**Document Version:** 1.0  
**Status:** Production-Ready Blueprint  
**Last Updated:** April 2025

---

## EXECUTIVE SUMMARY

This is a **multi-tenant B2B distribution platform** enabling businesses to manage their entire supply chain: product catalogs, dynamic pricing, order fulfillment, inventory, and delivery tracking. The platform owner monetizes via subscription tiers, while tenants (distributors) run their operations.

**Core Value Proposition:**

- Distributors eliminate fragmented spreadsheets and manual workflows
- Real-time inventory, pricing, and order visibility
- Mobile-first experience for sales reps, drivers, and retailers
- Automated invoicing and payment settlement
- B2B interconnection (supplier ↔ buyer real-time sync)

**Target Scale:** 100s of tenants, 10,000s of end users, millions of orders/year

---

## SECTION 1: SYSTEM ARCHITECTURE

### 1.1 Multi-Tenant Strategy

#### Database Design: Shared DB + Row-Level Security (RLS)

**Why Shared DB?**

- Simpler operations (one database to backup, monitor, scale)
- Cost-efficient at early stages
- Easier debugging and cross-tenant analytics
- Simpler billing and feature tracking

**Architecture:**

```
┌─────────────────────────────────────────────┐
│         Single PostgreSQL Database          │
│  (All tenants, all environments, all data)  │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│     Row-Level Security (RLS) Policies       │
│  - tenant_id filter on ALL queries          │
│  - Applied at DB layer (not app)            │
│  - Cannot be bypassed from app              │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  Schema: tenant_id on ALL tables            │
│  - users.tenant_id                          │
│  - products.tenant_id                       │
│  - orders.tenant_id                         │
│  - inventory.tenant_id                      │
│  - etc.                                     │
└─────────────────────────────────────────────┘
```

**RLS Implementation Rules:**

- Every table has a `tenant_id` column (non-nullable, indexed)
- RLS policy: `current_user_tenant_id = table.tenant_id`
- Database connection includes `SET app.tenant_id = 'xxx'` before queries
- Admin queries bypass RLS (via special role)

**Migration Path:**

- Start with shared DB + RLS (MVP)
- If single tenant grows to >1M records, migrate to isolated DB (minimal code change)
- Keep tenant_id in schema even after isolation (simplifies potential re-migration)

---

### 1.2 Service Architecture (Modular Monolith → Microservices)

#### MVP: Modular Monolith

Single codebase, multiple modules. Extract to services at inflection points.

```
┌─────────────────────────────────────────────────────┐
│              API Gateway + Auth Middleware            │
│  - JWT validation + tenant_id extraction             │
│  - Request logging + rate limiting                   │
│  - CORS handling                                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│                  Core Application Layer                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Auth Module     │  │  Tenant Module   │              │
│  ├──────────────────┤  ├──────────────────┤              │
│  │ - Login/signup   │  │ - Onboarding     │              │
│  │ - Role assign    │  │ - Subscription   │              │
│  │ - Token mgmt     │  │ - Plan features  │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Catalog Module  │  │  Pricing Module  │              │
│  ├──────────────────┤  ├──────────────────┤              │
│  │ - Products       │  │ - Rules engine   │              │
│  │ - Units + conv   │  │ - Customer seg   │              │
│  │ - Categories     │  │ - Price locking  │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Order Module    │  │  Inventory Mod   │              │
│  ├──────────────────┤  ├──────────────────┤              │
│  │ - Order CRUD     │  │ - Stock tracking │              │
│  │ - State machine  │  │ - Adjustments    │              │
│  │ - Notifications  │  │ - Base unit conv │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Delivery Module │  │  Billing Module  │              │
│  ├──────────────────┤  ├──────────────────┤              │
│  │ - Tasks + routes │  │ - Invoicing      │              │
│  │ - GPS tracking   │  │ - Payment sync   │              │
│  │ - Signature      │  │ - Subscriptions  │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Analytics Mod   │  │  Sync Module     │              │
│  ├──────────────────┤  ├──────────────────┤              │
│  │ - Dashboards     │  │ - B2B sync       │              │
│  │ - Reports        │  │ - Queue mgmt     │              │
│  │ - Metrics        │  │ - Webhooks       │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│                  External Services                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Stripe/Razorpay │  │  SMS/Email Svc   │              │
│  │  (Billing)       │  │  (Notifications) │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Google Maps API │  │  Analytics Tool  │              │
│  │  (Routing)       │  │  (Amplitude)     │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Services to Extract (Phase 3+)

**Micro-services Extraction Points:**

1. **Billing Service** (extract when: >1000 tenant subscriptions)
   - Handles subscription lifecycle
   - Integrates with payment processors
   - Generates invoices
   - Manages dunning flows
   - Interfaces: REST API + webhooks

2. **Pricing Service** (extract when: >10M daily price lookups)
   - Caches rules
   - Calculates dynamic prices
   - Versions pricing rules
   - Performance-critical

3. **Delivery Service** (extract when: >50K deliveries/month)
   - Route optimization
   - GPS tracking
   - Real-time updates
   - Handles high-frequency updates

4. **Analytics Service** (extract when: >100GB data)
   - Separate OLAP database
   - Real-time dashboards
   - Report generation
   - ML-ready data

**Communication:**

- Services communicate via REST + async queues (RabbitMQ/Kafka)
- Event-driven for order state changes, delivery updates
- Transactional consistency via saga pattern

---

### 1.3 Scalability Approach

#### Horizontal Scaling

**API Layer:**

- Stateless API servers (Node.js / Python / Go)
- Load balancer distributes requests
- Auto-scale: 2-10 instances based on load

**Database:**

- Read replicas for analytics and heavy queries
- Connection pooling (PgBouncer)
- Partitioning by tenant_id at scale (>1TB data)

**Cache Layer:**

- Redis for:
  - Session storage
  - Pricing rules (cache warmed hourly)
  - Customer segments
  - Frequently accessed catalogs
- Cache-aside pattern with 24-hour TTL

**Async Processing:**

- Background jobs (order processing, invoicing, reports)
- Job queue: Bull (Redis-backed) or Kafka
- Workers scale independently

#### Data Partition Strategy (Year 2-3)

**Current (Year 1): Shared DB**

```
PostgreSQL (Single Instance)
├── tenant_123.users
├── tenant_123.orders
├── tenant_124.users
├── tenant_124.orders
└── ...
```

**Scaling (Year 2): Tenant-Based Sharding**

```
Database Shard 1 (Tenants 1-100)
├── users
├── orders
├── inventory

Database Shard 2 (Tenants 101-200)
├── users
├── orders
├── inventory

Shard Director Service
└── Routes queries to correct shard based on tenant_id
```

---

## SECTION 2: DATA MODELING STRATEGY

### 2.1 Core Entities & Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     TENANT HIERARCHY                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tenant (Mama Foods Ltd)                                   │
│  ├── subscription_plan: "Premium"                          │
│  ├── active: true                                          │
│  ├── created_at, billing_period                           │
│  │                                                         │
│  ├─→ Users (managers, sales reps, drivers)               │
│  │   └── role: admin, manager, sales_rep, driver, etc    │
│  │       permissions: [read_orders, confirm_orders, etc] │
│  │                                                         │
│  ├─→ Warehouses                                          │
│  │   ├── name, location, capacity                        │
│  │   └── Inventory (tracks stock in base units)          │
│  │                                                         │
│  ├─→ Catalog                                             │
│  │   └── Products                                        │
│  │       ├── name, sku, description                      │
│  │       └── ProductUnits                                │
│  │           ├── piece (base_unit=true)                  │
│  │           ├── pack (12 pieces)                        │
│  │           └── pallet (50 packs = 600 pieces)          │
│  │                                                         │
│  ├─→ Customers                                           │
│  │   ├── name, code, type (superette/wholesale/shadow)  │
│  │   ├── is_shadow: true/false                           │
│  │   └── segment: assigned pricing tier                  │
│  │                                                         │
│  ├─→ PricingRules (versioned)                            │
│  │   ├── (customer_segment, product_unit) → price        │
│  │   ├── effective_date                                  │
│  │   └── (can have multiple versions)                    │
│  │                                                         │
│  └─→ Orders                                              │
│      ├── status: draft → confirmed → picking →           │
│      │             dispatched → delivered → settled       │
│      ├── OrderLines                                      │
│      │   ├── product_unit, quantity                      │
│      │   ├── unit_price (locked from pricing rules)      │
│      │   └── line_total                                  │
│      ├── Invoice                                         │
│      │   ├── invoice_number                              │
│      │   ├── amount, tax                                 │
│      │   ├── due_date                                    │
│      │   └── payment_status: unpaid/partial/paid         │
│      │                                                     │
│      └── DeliveryTask                                    │
│          ├── driver_id                                   │
│          ├── route, gps_tracking                         │
│          └── signature_proof                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Key Tables & Attributes

#### Tenants Table

```
tenants
├── id (UUID)
├── name (string) - "Mama Foods"
├── subscription_plan_id (FK → subscription_plans)
├── status (enum: active, suspended, cancelled)
├── billing_email
├── webhook_url (for B2B sync)
├── created_at, updated_at
└── deleted_at (soft delete)
```

#### Users Table

```
users
├── id (UUID)
├── tenant_id (FK → tenants) *** CRITICAL RLS FIELD ***
├── email
├── password_hash
├── full_name
├── roles (JSON: ["admin", "manager"])
├── permissions (JSON: computed from roles)
├── warehouse_id (optional - restrict to specific warehouse)
├── is_active
├── created_at, updated_at
└── RLS: SELECT * WHERE tenant_id = current_user_tenant_id
```

#### Products Table

```
products
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── sku (string)
├── name
├── description
├── category_id (FK → categories)
├── base_unit_id (FK → units) - always "piece" or "kg"
├── current_price (denormalized for quick access)
├── tax_rate
├── is_active
├── created_at, updated_at
└── Unique: (tenant_id, sku)
```

#### ProductUnits Table (Conversion Logic)

```
product_units
├── id (UUID)
├── product_id (FK)
├── unit_id (FK → units)
├── conversion_to_base (int)
│   Example: unit="pack", base="piece", conversion=12
│   Example: unit="pallet", base="piece", conversion=600
├── list_price (default price for this unit)
├── created_at, updated_at

// Example Data
├── Product: "Couscous 1kg"
│   ├── ProductUnit: piece (conversion=1, base)
│   ├── ProductUnit: pack (conversion=12, 12 pieces)
│   └── ProductUnit: pallet (conversion=600, 50 packs)
```

#### Customers Table

```
customers
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── code (string, unique per tenant)
├── name
├── address
├── contact_person
├── phone, email
├── segment_id (FK → customer_segments)
│   Values: "superette", "wholesale", "shadow"
├── is_shadow (bool)
├── is_promotable (bool) - can move from shadow → normal
├── credit_limit
├── payment_terms_days
├── created_at, updated_at
└── Unique: (tenant_id, code)
```

#### PricingRules Table (Versioned)

```
pricing_rules
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── product_unit_id (FK)
├── customer_segment_id (FK)
├── price (decimal)
├── effective_date (date)
├── expires_at (optional, null = indefinite)
├── priority (int: 1=customer-specific, 2=segment, 3=default)
├── created_at, updated_at
├── created_by (user_id)

// Example Data: Couscous 1kg pack
├── (segment="wholesale", product_unit="pack", price=9.00, priority=2)
├── (segment="superette", product_unit="pack", price=10.00, priority=2)
├── (segment=null (default), product_unit="pack", price=8.00, priority=3)

// Lookup: Given customer (segment=wholesale), product (pack)
// Returns: price=9.00 (highest priority match)
```

#### Orders Table

```
orders
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── customer_id (FK → customers)
├── created_by (user_id)
├── status (enum: DRAFT, CONFIRMED, PICKING, DISPATCHED, DELIVERED, SETTLED)
├── order_date
├── promised_delivery_date
├── subtotal (decimal)
├── tax_amount (decimal)
├── total_amount (decimal)
├── discount_applied (decimal, default 0)
├── notes
├── created_at, updated_at
└── RLS: SELECT * WHERE tenant_id = current_user_tenant_id
```

#### OrderLines Table

```
order_lines
├── id (UUID)
├── order_id (FK)
├── product_unit_id (FK)
├── quantity (int)
├── unit_price (decimal) *** LOCKED at order creation ***
├── line_total (decimal)
├── created_at
```

**CRITICAL RULE:** `unit_price` is immutable after creation. If pricing changes, does NOT affect existing orders.

#### Inventory Table

```
inventory
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── warehouse_id (FK)
├── product_id (FK)
├── quantity_pieces (int) *** ALWAYS IN BASE UNITS ***
├── last_counted_at
├── created_at, updated_at

// Example
├── product="Couscous 1kg", quantity_pieces=1200
│   (This = 100 packs OR 2 pallets, conversion happens on read)
```

#### Invoices Table

```
invoices
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── order_id (FK)
├── invoice_number (string, unique per tenant)
├── issue_date
├── due_date
├── subtotal, tax, total
├── payment_status (unpaid, partial, paid)
├── payment_method (cash, bank_transfer, credit)
├── paid_date (nullable)
├── notes
├── created_at, updated_at

// Automation: generated when order → CONFIRMED state
```

#### DeliveryTasks Table

```
delivery_tasks
├── id (UUID)
├── tenant_id (FK) *** RLS FIELD ***
├── order_id (FK)
├── driver_id (FK → users)
├── assigned_date
├── pickup_location (warehouse_id)
├── delivery_location (customer address)
├── status (assigned, in_transit, arrived, completed, failed)
├── route_sequence (int) - order in daily route
├── gps_location (lat, lng) - updated in real-time
├── gps_last_updated
├── signature_image_url (S3)
├── delivered_at
├── notes
├── created_at, updated_at
```

#### Subscriptions Table (Multi-Tenant Billing)

```
subscriptions
├── id (UUID)
├── tenant_id (FK)
├── plan_id (FK → subscription_plans)
├── billing_cycle (monthly, yearly)
├── current_period_start
├── current_period_end
├── next_billing_date
├── status (active, past_due, cancelled)
├── cancellation_date
├── stripe_subscription_id (external reference)
├── auto_renew
├── created_at, updated_at
```

---

### 2.3 Critical Design Rules

#### Rule 1: Inventory in Base Units Only

- Stored: `quantity_pieces` (always pieces)
- Display/Order: convert on-the-fly using ProductUnits
- Prevents: decimal mismatches, rounding errors
- Example: "2.5 packs" is invalid; must be whole pieces

#### Rule 2: Price Locking at Order Creation

- When order created: look up price from PricingRules
- Store in OrderLines.unit_price
- Future rule changes: do NOT affect existing orders
- Audit trail: pricing_rules versioned by effective_date

#### Rule 3: Tenant Isolation via RLS

- Every row-returning query filtered by tenant_id
- Enforced at DB layer
- Cannot be bypassed from app
- Admin-only queries disable RLS selectively

#### Rule 4: Soft Deletes for Compliance

- `deleted_at` timestamp, not hard delete
- Aids auditing, recovery, compliance (GDPR)
- Queries: WHERE deleted_at IS NULL by default

#### Rule 5: Orders Are Immutable After Confirmation

- Once CONFIRMED: order lines cannot be changed
- Reason: pricing locked, inventory reserved
- Changes: create new order (easier UX)

---

## SECTION 3: UX/UI STRATEGY

### 3.1 Dashboard Hierarchy

#### Level 1: Platform Owner (Super Admin Dashboard)

**Purpose:** Manage the entire SaaS platform

**Key Sections:**

1. **Subscription Management**
   - Active tenants (table: name, plan, status, annual value)
   - Upgrade/downgrade workflows
   - Churn alerts (tenants past due)
   - Monthly recurring revenue (MRR) chart
   - Feature usage per tenant

2. **Billing & Revenue**
   - MRR, ARR, churn rate
   - Payment status (collected, pending, failed)
   - Invoice history
   - Refund management

3. **System Monitoring**
   - API health (uptime %)
   - Database size & performance
   - Error rates & logs
   - User count per tenant
   - Peak load times

4. **Global Analytics**
   - Total orders processed
   - Total revenue tracked
   - Active users
   - Tenant geography
   - Feature adoption

5. **User Management**
   - Create/edit tenants
   - Manage tenant admins
   - Reset passwords
   - View activity logs

**Key Metrics Dashboard:**

```
┌─────────────────────────────────────────┐
│  MRR: $45,000 ↑ 12% | ARR: $540K       │
├─────────────────────────────────────────┤
│                                         │
│  Active Tenants: 38 | New This Month: 3 │
│  Churn Rate: 2% | Avg Plan Value: $1.2K │
│                                         │
│  [Revenue Chart]  [Tenant Growth]      │
│  [System Health]  [Top Features Used]  │
│                                         │
└─────────────────────────────────────────┘
```

---

#### Level 2: Tenant Admin Dashboard (Mama Foods Warehouse Manager)

**Purpose:** Manage day-to-day operations

**Key Sections:**

1. **Overview/Home**
   - KPIs: Today's orders, pending deliveries, inventory alerts
   - Quick actions: Create order, assign delivery, adjust inventory
   - Recent activity feed

2. **Orders & Fulfillment**
   - Active orders (status pipeline: draft → confirmed → picking → dispatched → delivered → settled)
   - Filter by status, customer, date
   - Bulk actions (confirm multiple, assign to warehouse)
   - Order detail: lines, customer info, delivery address, notes

3. **Inventory**
   - Stock levels by warehouse
   - Low stock alerts (red)
   - Inventory adjustments (add/remove, reason, approval)
   - Movement history (consumed, adjusted, received)
   - Reorder point configuration

4. **Pricing & Catalog**
   - Product list (sku, units, current price)
   - Bulk pricing rules (by segment)
   - Edit pricing (effective date, expiration)
   - Pricing rule versioning (view history)

5. **Customers**
   - Customer directory (segment, status, credit limit)
   - Shadow customers (mark as promotable)
   - Contact info, delivery addresses
   - Payment history

6. **Deliveries**
   - Route view (map + list)
   - Driver assignments
   - Real-time GPS tracking
   - Delivery proof (signature, photo)

7. **Finance & Reports**
   - Invoices (issued, paid, overdue)
   - Revenue by customer, product, segment
   - Collections aging (0-30, 30-60, 60+ days)
   - Payment reconciliation

8. **Staff Management**
   - Invite users (roles: manager, sales, driver, accountant)
   - Permissions per role
   - Activity logs

---

#### Level 3: Mobile App (Role-Based Experiences)

**Architecture:** Single app, multiple experiences based on role/tenant_id

##### 3A: Retailer (Customer) Experience

**Home Screen:**

- Welcome message
- Quick cart (show last order)
- Browse catalog (with search)
- Account menu

**Catalog:**

- Product grid (image, name, price per unit shown)
- Filter by category
- Search by name/sku
- Unit selector dropdown (piece, pack, pallet)
- Add to cart

**Cart:**

- Line items (product, unit, qty, price, subtotal)
- Edit quantity, remove
- Apply discount code
- Checkout button (reserved cart for 2 hours)

**Order History:**

- Past orders (date, items, total, status)
- Click to reorder
- Delivery tracking (real-time: in-warehouse → in-transit → delivered)
- Invoice download

**Account:**

- Profile (company, address)
- Saved addresses
- Payment methods
- Notifications
- Help & Support

---

##### 3B: Sales Rep Experience

**Home Screen:**

- Assigned customers (quick jump)
- Pending orders (awaiting confirmation)
- Collections due (overdue invoices)

**Create Order:**

- Customer search/select
- Show customer's segment & default pricing
- Add products (with pricing preview)
- Show order total before submit
- Confirmation screen (digital signature request from customer - can be email link)

**Orders:**

- My orders (created by me)
- Status filter (draft, confirmed, picking, etc)
- Customer info, delivery date
- Quick actions: confirm, cancel, reassign

**Customers:**

- Customer list (assigned to me)
- Details: contact, credit limit, payment history
- Shadow customer → mark as promotable

**Collections:**

- Overdue invoices (red)
- Contact info for follow-up
- Mark as paid

**Reports:**

- My orders (daily/weekly)
- My sales (value, quantity, customers)
- Commission tracker (if applicable)

---

##### 3C: Driver Experience (Most Mobile-Optimized)

**Home Screen:**

- Today's deliveries (count, total items)
- Route map (start button)
- Current location

**Daily Route:**

- Map view (all stops pinned)
- List view (stops in order, address, customer, items)
- Swipe to expand stop details

**At Delivery Stop:**

- Customer name, address, phone
- Items to deliver (qty per product)
- Check-off as delivered
- Customer signature pad (tap to sign)
- Photo capture (proof)
- Notes field (any issues)
- Swipe right → mark complete, go to next

**Real-Time Tracking:**

- GPS on by default (background tracking)
- Breadcrumb trail visible to manager
- ETA calculation
- Offline mode: queue deliveries, sync when online

**Notifications:**

- New delivery assigned
- Manager message
- Customer confirmation receipt

---

### 3.2 State Transitions & User Journeys

#### Order Lifecycle (State Machine)

```
DRAFT
  │ (Sales rep creates, customer views)
  │ (Can add/remove lines, edit quantity)
  ↓
CONFIRMED
  │ (Manager/system confirms, inventory reserved)
  │ (Price locked, invoice generated)
  ├─→ CANCELLED (within 1 hour if no picking started)
  ↓
PICKING
  │ (Warehouse staff picks items)
  │ (Stock deducted from inventory)
  ↓
DISPATCHED
  │ (Driver assigned, leaves warehouse)
  │ (GPS tracking active)
  ↓
DELIVERED
  │ (Driver gets signature)
  │ (Photo proof stored)
  ↓
SETTLED
  │ (Invoice marked paid OR auto-settled)
  │ (End state)

Parallel Events:
  - CONFIRMED → Invoice generated
  - CONFIRMED → Inventory reserved (not deducted)
  - PICKING → Inventory deducted (becomes fact)
  - DELIVERED → Delivery proof stored
  - SETTLED → Accounting finalized
```

#### Key User Journey: "From Retailer Order to Delivery"

```
RETAILER
  1. Opens app, browses catalog
  2. Adds 20 packs of Couscous to cart
  3. Checkout → Order created (DRAFT)
  4. Awaits Sales Rep confirmation

SALES REP (Receives notification)
  1. Views order in "Pending Confirmation"
  2. Verifies customer segment pricing (wholesale = $9/pack)
  3. Clicks "Confirm Order"
     - System locks price ($9/pack)
     - Creates Invoice
     - Reserves inventory (20 packs = 240 pieces)
  4. Sends notification to warehouse manager

WAREHOUSE MANAGER (Receives notification)
  1. Sees order in "Picking" queue
  2. Staff manually picks items from shelves
  3. QA checks quantity
  4. Mark as "Ready for Dispatch"

DRIVER (Receives notification)
  1. Gets delivery assignment
  2. Drives to warehouse (pickup)
  3. App shows optimized route for today's stops
  4. Navigates to Retailer address
  5. Arrives → Scans delivery code (or taps "Arrived")
  6. Shows Retailer items to deliver
  7. Gets customer signature
  8. Takes photo (proof)
  9. Marks "Delivered"
     - GPS recorded
     - Signature stored
     - Photo stored
     - Notification sent to retailer & manager
  10. App syncs with server (or offline queue if no signal)

MANAGER (Real-Time Visibility)
  1. Sees order → DELIVERED (map + timestamp)
  2. Confirms driver GPS & signature proof
  3. Marks order → SETTLED (or auto-settles after 24h)

ACCOUNTANT (Later)
  1. Sees settled order in Finance
  2. Invoice shows: delivered, signed, photoed
  3. Payment recorded (auto or manual)
  4. Revenue recognized
```

---

### 3.3 Critical UX Decisions

#### Decision 1: Single App, Multiple Roles

- **Why:** Easier onboarding, fewer SKUs to maintain
- **How:** Role-based navigation (hide/show features per role)
- **Implementation:** After login, deep-link to role's home screen
- **Trade-off:** App size slightly larger, but unified codebase

#### Decision 2: Price Locking at Order Confirmation

- **Why:** Prevents disputes (customers see price, it's locked)
- **How:** Store unit_price in OrderLines, immutable after confirmation
- **UX Impact:** Show price clearly before customer confirms
- **Edge Case:** Price changes between cart and checkout? Show notification, let customer accept/reject

#### Decision 3: Inventory Reserved (Not Deducted) Until Picking

- **Why:** Orders can be cancelled in DRAFT/CONFIRMED states without inventory loss
- **How:** Two-phase: CONFIRMED→reserve, PICKING→deduct
- **UX Impact:** Manager sees "Available - 100 pieces", "Reserved - 50", "Free - 50"
- **Benefit:** Prevents overselling if orders cancelled before picking

#### Decision 4: Offline Mode for Driver

- **Why:** Delivery areas may have poor signal
- **How:** Service Worker caches route, stores signatures/photos locally, syncs when online
- **UX:** Transparent to driver (no visible "offline" state, just works)
- **Fallback:** Driver can take photo of signature pad, upload later

#### Decision 5: Digital Signature (Not Just Tap)

- **Why:** Proof of delivery (legal, audit trail)
- **How:** Canvas signature pad, store as image
- **Alternative:** QR code scanned by driver (faster, but less formal)
- **Decision:** MVP = QR/tap, V1 = signature pad, V2 = biometric

---

## SECTION 4: BUSINESS LOGIC REFINEMENT

### 4.1 Pricing Engine Design

#### Lookup Priority (Cascading)

Given: Customer (segment=wholesale), Product (Couscous pack)

```
Step 1: Check Customer-Specific Rules
  Query: PricingRules WHERE
    product_unit_id = couscous_pack AND
    customer_segment_id = wholesale AND
    effective_date <= today <= expires_at
  Result: $9.00 (priority=1, highest)

Step 2: If no match, check Segment Rules
  Query: PricingRules WHERE
    product_unit_id = couscous_pack AND
    customer_segment_id = wholesale AND
    priority = 2
  Result: $9.00 (priority=2)

Step 3: If no match, check Default Rules
  Query: PricingRules WHERE
    product_unit_id = couscous_pack AND
    customer_segment_id IS NULL AND
    priority = 3
  Result: $8.00 (default)

Final Price: $9.00
```

#### Pricing Rule Versioning

```
Scenario: Distributor changes wholesale price $9 → $8.50

Actions:
  1. Create new PricingRule row:
     (product_unit=pack, segment=wholesale, price=8.50,
      effective_date=2025-05-01, priority=2)

  2. Old rule:
     (product_unit=pack, segment=wholesale, price=9.00,
      effective_date=2025-04-01, expires_at=2025-04-30)

  3. Orders created before 2025-05-01:
     - Locked at $9.00 (immutable)

  4. Orders created from 2025-05-01:
     - Locked at $8.50

Benefits:
  - Audit trail (who changed, when)
  - Orders always have accurate historical pricing
  - No disputes (price is locked)
```

#### Special Cases

**Case 1: Volume Discounts**

```
PricingRules can include volume tiers:
  qty_min=1, qty_max=49 → price=10.00
  qty_min=50, qty_max=199 → price=9.50
  qty_min=200 → price=9.00

Lookup: Check all matching rules, sort by qty_min DESC
```

**Case 2: Promotional Pricing**

```
PricingRules with temporary overrides:
  (segment=wholesale, product=couscous_pack, price=8.00,
   effective_date=2025-05-01, expires_at=2025-05-07)

After expiry: auto-reverts to previous rule
```

**Case 3: Shadow Customer Pricing**

```
Shadow customers: created without full onboarding
  segment: set to "shadow"
  pricing: could be "wholesale" or "shadow" (negotiated)

Can transition: shadow → superette or shadow → wholesale
  (admin moves customer to new segment)
  (future orders use new pricing)
```

#### System Design

```
PricingService (or Pricing Module)

1. Input:
   - customer_id
   - product_unit_id
   - order_date (usually TODAY, but supports backdating)
   - quantity (optional, for volume discounts)

2. Process:
   - Get customer segment
   - Query PricingRules (sorted by priority, effective_date)
   - Apply volume discount if applicable
   - Check promotional overrides
   - Cache result (1-hour TTL)

3. Output:
   - unit_price
   - applicable_rule_id (for audit trail)
   - discount_percentage (if any)

4. Caching Strategy:
   - Cache key: (customer_id, product_unit_id, order_date)
   - TTL: 1 hour (tolerate stale pricing for this window)
   - Invalidate on: rule create/update
   - Warm cache: batch query top 100 products × segments

5. Fallback:
   - If cache miss + DB slow: return last_known_price
   - Log alert for ops team
   - No order halted due to pricing lookup failure
```

---

### 4.2 Unit Conversion System

#### Base Unit Principle

**All inventory stored in base units (pieces).**

```
Product: Couscous 1kg

Base Unit: PIECE (conversion_to_base = 1)
  - 1 piece = 1 piece

Unit: PACK
  - conversion_to_base = 12
  - 1 pack = 12 pieces

Unit: PALLET
  - conversion_to_base = 600
  - 1 pallet = 600 pieces
  - (50 packs × 12 pieces)

Database Inventory:
  quantity_pieces = 1200
  (This is 100 packs OR 2 pallets)

Display Logic:
  if unit_requested = "pack":
    display_quantity = 1200 / 12 = 100 packs

  if unit_requested = "pallet":
    display_quantity = 1200 / 600 = 2 pallets
```

#### Inventory Adjustment Rules

```
Scenario: Warehouse manager discovers 5 pieces missing

Step 1: Create InventoryAdjustment (not applied yet)
  - product_id: couscous_1kg
  - quantity_pieces: -5 (reduction)
  - reason: "Physical count discrepancy"
  - created_by: manager_id
  - status: PENDING

Step 2: Manager submits for approval
  - Warehouse manager (level 1)
    OR Admin (level 2, always approved)

Step 3: System applies adjustment
  - inventory.quantity_pieces -= 5
  - Log entry created (immutable audit trail)

Step 4: Accounting impact
  - If > $10 loss: flag for review
  - Adjustment can be assigned to cost center

Result:
  - Old: 1200 pieces
  - New: 1195 pieces
  - Audit: why, who, when
```

#### Conversion Validation

```
Prevent Invalid Conversions:

1. Fractional Pieces Prevented:
   - Order quantity MUST result in whole pieces
   - 5.5 packs = 66 pieces ✗ (not allowed if base_unit=piece)
   - 5 packs = 60 pieces ✓

2. Stock Validation:
   - Order 20 packs (= 240 pieces)
   - Available: 200 pieces
   - Error: "Only 200 pieces available (16.67 packs)"

3. Unit Consistency:
   - All conversions use same base unit per product
   - No mixing units (e.g., can't have pallet_grams for weight product)
```

---

### 4.3 Order Lifecycle & State Machine

#### State Definitions

```
DRAFT
  - Order created by sales rep or customer
  - Lines can be added/removed
  - Price not locked
  - Inventory not reserved
  - Duration: 0-24 hours (auto-expires if unpaid)
  - Actions: Edit, Confirm, Discard

CONFIRMED
  - Manager confirms order can be fulfilled
  - Price locked (immutable)
  - Inventory reserved (not deducted)
  - Invoice generated
  - Duration: 1-7 days
  - Actions: Cancel (within 1 hour), Dispatch, Hold

PICKING
  - Warehouse staff physically pulls items
  - Inventory deducted (becomes fact, not reversible)
  - Duration: 1-2 hours
  - Actions: Complete, Report Issue

DISPATCHED
  - Driver assigned, leaves warehouse
  - GPS tracking active
  - Duration: 1-4 hours
  - Actions: Complete, Report Problem

DELIVERED
  - Driver arrives, customer signs
  - Photo proof captured
  - Duration: 1 minute (snapshot)
  - Auto-transitions to SETTLED after 24h
  - Actions: Mark Paid (manual), Report Issue

SETTLED
  - Order complete
  - Accounting finalized
  - Cannot be modified
  - Permanent state
```

#### Automatic & Manual Transitions

```
DRAFT → CONFIRMED
  Trigger: Manager clicks "Confirm" OR Customer clicks "Checkout"
  Validation:
    - All lines have valid products
    - Quantity > 0
    - Customer credit limit not exceeded
    - No expired promotional pricing
  Side-effects:
    - Lock price (copy from PricingRules to OrderLines.unit_price)
    - Reserve inventory
    - Generate Invoice
    - Send notification to warehouse

CONFIRMED → PICKING (Manual OR Auto)
  Manual: Warehouse manager clicks "Start Picking"
  Auto: After 30 min if no activity (optional)
  Validation:
    - All items physically available
  Side-effects:
    - Deduct inventory (irreversible)
    - Update picking list

PICKING → DISPATCHED
  Trigger: Warehouse manager confirms all items picked
  Validation:
    - All items present (QA checked)
    - Driver assigned
  Side-effects:
    - Start GPS tracking
    - Notify driver
    - Notify customer (estimated arrival)

DISPATCHED → DELIVERED
  Trigger: Driver captures signature
  Validation:
    - GPS at delivery location (within 100m)
    - Signature image valid
  Side-effects:
    - Store signature & photo
    - Notify manager & customer
    - Auto-settle if payment received

DELIVERED → SETTLED (Auto after 24h)
  Trigger: Automatic job runs daily
  Condition: payment_status = "paid" OR default auto-settle = true
  Side-effects:
    - Mark invoice as settled
    - Release any holds
    - Recognize revenue (accounting)

ERROR: Any state → CANCELLED (within 1 hour only)
  Constraints:
    - Only before PICKING started
    - Releases reserved inventory
    - Cancels invoice
    - Notifies all stakeholders
```

#### Inventory Sync Rules

```
ORDER CONFIRMED
  Action: Reserve inventory
  Query: Check if (qty_pieces) available
  If insufficient:
    Error: Order cannot be confirmed
  If sufficient:
    - Create reservation record
    - Inventory.available -= qty_pieces
    - Do NOT change inventory.quantity_pieces yet

ORDER PICKING STARTED
  Action: Deduct inventory
  - Warehouse staff scans/confirms each item
  - System deducts from actual inventory
  - Inventory.quantity_pieces -= qty_pieces
  - Irreversible (cannot undo without adjustment)

ORDER CANCELLED (in DRAFT/CONFIRMED)
  Action: Release reservation
  - If PICKING not started: release reservation
  - Inventory.available += qty_pieces
  - If PICKING already started: blocked (manual adjustment needed)

ORDER PICKING ERROR (e.g., broken item found)
  Action: Inventory adjustment
  - Create InventoryAdjustment for damaged items
  - Adjust order quantity downward
  - Recalculate order total
  - Notify customer
```

---

## SECTION 5: SaaS MONETIZATION STRATEGY

### 5.1 Subscription Tiers

#### Three-Tier Model (Year 1)

```
STARTER
  Monthly: $199
  Annual: $1,990 (save $378)

  Limits:
    - 3 users
    - 1 warehouse
    - 500 orders/month
    - Basic analytics (last 30 days)
    - Email support
    - No API access
    - No B2B interconnect

  Features:
    - Core order management
    - Basic inventory
    - Simple pricing rules
    - Mobile app (driver + sales rep)
    - Basic reporting

---

GROWTH
  Monthly: $599
  Annual: $5,990 (save $1,178)

  Limits:
    - 15 users
    - 5 warehouses
    - 5,000 orders/month
    - Advanced analytics (last 12 months)
    - Priority support
    - API access (read-only)
    - B2B interconnect (basic)

  Features:
    - Everything in STARTER
    - Advanced pricing (volume discounts, promos)
    - Route optimization (basic)
    - Automation (auto-settlement, alerts)
    - Custom reports
    - Signature capture

---

ENTERPRISE
  Custom pricing (starting $1,500/month)
  Annual: negotiable

  Limits:
    - Unlimited users
    - Unlimited warehouses
    - Unlimited orders
    - Real-time analytics
    - Dedicated support
    - Full API access
    - B2B interconnect (advanced)
    - SLA: 99.5% uptime

  Features:
    - Everything in GROWTH
    - Advanced B2B sync
    - AI recommendations
    - White-label option
    - Multi-currency
    - Custom integrations
    - Training & onboarding
    - Success manager

---

PLATFORM GOAL: 80% GROWTH, 15% ENTERPRISE, 5% STARTER (Year 2)
```

### 5.2 Feature Gating

```
Pricing features controlled via subscription_plan_id

On every request:
  1. Get user.tenant_id
  2. Get tenant.subscription_plan_id
  3. Check if feature available for plan

Example Implementation:

Feature: route_optimization
  STARTER: false
  GROWTH: true (basic)
  ENTERPRISE: true (advanced)

Feature: api_access
  STARTER: false
  GROWTH: true (read-only, 100 req/min)
  ENTERPRISE: true (read-write, unlimited)

Feature: b2b_interconnect
  STARTER: false
  GROWTH: true (one-directional)
  ENTERPRISE: true (bi-directional)

Feature: automation_rules
  STARTER: false (max 0 rules)
  GROWTH: true (max 10 rules)
  ENTERPRISE: true (unlimited)

UX Implementation:
  - Hide disabled features in UI
  - Show "Upgrade" button for locked features
  - Log attempts to use disabled features (for product analytics)
  - Hard-block API access if over limit
```

### 5.3 Billing Logic

#### Invoice Generation

```
MONTHLY BILLING (on day X of each month)

For each active subscription:
  1. Check current_period_end
  2. If today >= current_period_end:
     a. Generate invoice (amount = plan.monthly_price)
     b. Create stripe_charge (or Razorpay payment)
     c. If payment succeeds:
        - next_billing_date += 1 month
        - current_period_start = yesterday
        - current_period_end = next_billing_date
        - Set status = ACTIVE
     d. If payment fails:
        - Set status = PAST_DUE
        - Send email reminder
        - Schedule retry (3 attempts, 3 days apart)

ANNUAL BILLING (yearly plans)

Same logic, but cycle = 1 year
```

#### Usage-Based Billing (V2)

```
Optional add-on: Pay per order

For high-volume customers:
  - Plan includes 10,000 orders/month
  - Overage: $0.05 per additional order

Each month:
  1. Count orders processed (across all states)
  2. If count > plan.included_orders:
     overage_qty = count - plan.included_orders
     overage_charge = overage_qty × $0.05
     total_invoice = plan.price + overage_charge
```

---

## SECTION 6: ADVANCED FEATURES (PROPOSED)

### 6.1 AI Recommendations (Phase 3)

#### Product Recommendations for Retailers

```
Goal: Suggest products retailer has NOT ordered recently

Algorithm:
  1. Get retailer's order history (last 90 days)
  2. Find products NOT in recent orders
  3. Rank by:
     - Popularity (other similar retailers ordered)
     - Seasonality (more ordered this time of year)
     - Margin (higher-margin products)
  4. Filter by: warehouse_stock > threshold
  5. Show top 5 with estimated demand

Example:
  Retailer A orders: Rice, Oil, Sugar
  Recommendation: "Customers like you also buy Pasta, Beans, Salt"

Monetization:
  - Premium feature (GROWTH+ only)
  - A/B test: recommend via notification
  - Metric: conversion rate (recommendation → order)

ML Training:
  - Offline: daily batch jobs
  - Use pseudo-labels: "if retailer bought X, likely wants Y"
  - No explicit user labeling needed
```

#### Demand Forecasting for Distributors

```
Goal: Predict order volume, help with inventory planning

Algorithm:
  1. Time series data: orders per product, per week (historical)
  2. Features:
     - Seasonality (holiday weeks, seasons)
     - Trend (is product growing/declining)
     - Promotions (external events)
  3. Model: ARIMA or Prophet (weekly forecasting)
  4. Output: forecasted volume ± confidence interval

Example:
  Couscous pack:
    Historical avg: 500 units/week
    Week of May (Ramadan): forecast 800 units
    Confidence: 95%
    Recommendation: "Pre-stock +300 units for May"

Dashboard:
  - Forecast vs Actual (for feedback)
  - Alert: if actual < (forecast - confidence_interval)
           = demand softer than expected

Monetization: ENTERPRISE feature
```

#### Churn Prediction for Platform

```
Goal: Identify tenants likely to cancel

Signals (after 3 months):
  - Active users declining
  - Order volume declining
  - Support tickets spike (frustration)
  - Feature usage low (not using platform)
  - Pricing complaints

Action:
  - Alert sales team
  - Proactive outreach (success manager call)
  - Offer discount/migration support
```

---

### 6.2 Advanced Analytics & Dashboards

#### Tenant Admin Dashboard Enhancements

```
PERFORMANCE DASHBOARD
  - Orders (daily/weekly/monthly volume)
  - Revenue (actual vs forecast)
  - Customer acquisition (new customers/month)
  - Customer churn (lost customers/month)
  - Average order value (trend)
  - Days sales outstanding (DSO, invoice collection time)

OPERATIONS DASHBOARD
  - Delivery on-time % (delivered by promised date)
  - Average delivery time (dispatch → delivered)
  - Driver utilization (deliveries/driver/day)
  - Inventory turnover (times per month)
  - Stock-out incidents (orders unfulfilled)
  - Picking accuracy (items picked correctly)

CUSTOMER ANALYTICS
  - Top customers (by revenue)
  - Most ordered products
  - Customer profitability (margin - delivery cost)
  - Segment analysis (superette vs wholesale performance)
  - Payment reliability (on-time % per customer)

FINANCIAL DASHBOARD
  - Gross margin % (revenue - COGS)
  - Operating costs (delivery, labor, overhead)
  - Profitability by customer
  - Cash conversion cycle
  - Aging receivables (invoice collection)
  - Tax summary (for accountants)
```

#### Notifications & Alerts

```
CRITICAL ALERTS (Real-time)
  - Stock-out (item out of stock, order blocked)
  - High-value order (> $1000, flagged for review)
  - Payment failed (subscription renewal, notify admin)
  - Order cancelled (show reason)

WARNINGS (Daily digest)
  - Low stock (approaching reorder point)
  - Overdue invoices (> 30 days unpaid)
  - Delivery delays (promised date < today)
  - High DSO (average payment time increasing)

INSIGHTS (Weekly digest)
  - "Couscous pack selling 20% more than last week"
  - "Wholesale segment more profitable than superette (data-driven)"
  - "Top 3 customers account for 40% of revenue"
  - "Delivery on-time rate dropped to 92% (usually 97%)"
```

---

### 6.3 Offline Mode (Mobile)

#### Driver App Offline Capability

```
PRE-DELIVERY SETUP (Driver starts shift, has WiFi)
  1. App downloads today's route (map, all stops, items)
  2. Cache map tiles (Google Maps offline)
  3. Pre-fetch customer info, photos
  4. Store in local IndexedDB

DURING DELIVERY (May be offline)
  1. GPS still works (hardware layer)
  2. Signature capture works (canvas, local storage)
  3. Camera photo capture works (device storage)
  4. Checks off items (local DB)

WHEN ONLINE AGAIN
  1. App detects connection
  2. Syncs: GPS breadcrumbs, signatures, photos
  3. Updates server state (orders → DELIVERED)
  4. Notifies manager + customer

SYNC CONFLICT RESOLUTION
  If manager manually marked order DELIVERED + driver goes offline:
    1. Server has: DELIVERED (timestamp T1)
    2. Driver has: DELIVERING (last sync T0)
    3. On reconnect: server wins (already delivered)
    4. Driver sees "This order was completed at HQ, skip it"
    5. No conflict, graceful recovery
```

---

### 6.4 B2B Interconnect (Phase 3)

#### Real-Time Sync Between Distributors

```
SCENARIO: Company A (distributor) sells to Company B (wholesaler)

Company A (Supplier):
  Creates order for Company B
  Status: CONFIRMED
  Total: $5,000

Company B (Buyer):
  Receives webhook:
    {
      event: "supplier.order.confirmed",
      supplier_tenant_id: "company_a_id",
      supplier_order_id: "order_123",
      items: [...],
      total: 5000,
      webhook_url: "company_a.webhook.url"
    }

Company B System:
  Auto-creates matching PO:
    {
      vendor: "Company A",
      vendor_order_id: "order_123",
      status: "CONFIRMED"
    }

  Company B Sales Rep sees:
    "Incoming shipment from Company A"
    "Expected arrival: 2025-05-15"

DELIVERY SYNC
  Company A Driver delivers to Company B warehouse
  Company A Driver captures signature
  System sends webhook to Company B:
    {
      event: "supplier.order.delivered",
      signature_proof_url: "...",
      delivered_at: "2025-05-15T14:30:00Z"
    }

  Company B System:
    Automatically moves PO → RECEIVED
    Updates inventory (new stock from Company A)
    Triggers accounting (now owes Company A)

FINANCIAL SYNC
  Company A Issues invoice (to Company B)
  Company B Receives invoice webhook
  Company B Accounting creates payable
  Company B Records as expense

  Payment flow:
    Company B pays Company A (via bank transfer)
    Company A marks invoice → PAID
    Webhook confirms to Company B
    Both sides reconciled
```

---

## SECTION 7: ROADMAP (MULTI-PHASE)

### Phase 1: MVP (Months 1-3)

**Goal:** Launch with core workflows, prove demand

**Deliverables:**

1. **Platform Owner Dashboard**
   - Tenant CRUD (create, view, suspend)
   - Subscription plan assignment
   - Global metrics (MRR, tenant count)

2. **Tenant Admin Dashboard**
   - Order management (create, confirm, track)
   - Inventory management (view, adjust)
   - Basic pricing rules (single price per product unit)
   - User management (invite users, roles)

3. **Mobile App (Starter)**
   - Retailer: browse products, place order, track
   - Sales Rep: create/confirm orders, manage customers
   - Driver: daily route, delivery checklist, signature capture

4. **Core Infrastructure**
   - Multi-tenant DB (PostgreSQL + RLS)
   - Auth system (JWT tokens, role-based access)
   - Payment processor integration (Stripe)
   - Mobile app (React Native or Flutter)

5. **Integrations**
   - Email notifications (SendGrid)
   - SMS alerts (Twilio)
   - Basic analytics (Amplitude or Mixpanel)

**Not in MVP:**

- Advanced pricing (volume discounts, promos)
- Route optimization
- B2B interconnect
- AI recommendations
- Offline mode
- Advanced reporting

**Success Metrics:**

- Acquire 5-10 pilot customers
- Process 1,000+ orders
- 80%+ user adoption (of features)
- NPS > 50

---

### Phase 2: V1 (Months 4-6)

**Goal:** Monetize, stabilize, add revenue drivers

**Deliverables:**

1. **Enhanced Pricing Engine**
   - Volume discounts (qty-based)
   - Promotional pricing (time-limited)
   - Customer-specific pricing
   - Pricing versioning & audit

2. **Delivery & Logistics**
   - Route optimization (Google Maps Directions API)
   - GPS real-time tracking
   - Delivery proof (signature + photo)
   - Driver app performance improvements

3. **Billing & Accounting**
   - Invoice generation (PDF)
   - Payment reconciliation
   - Aging report (overdue invoices)
   - Tax calculation & reporting

4. **Feature Gating**
   - Implement 3-tier subscription model (Starter/Growth/Enterprise)
   - Enforce limits (users, orders, features)
   - Upsell mechanics

5. **Data & Analytics**
   - Revenue by segment, product, customer
   - Delivery KPIs (on-time %, avg time)
   - Inventory metrics (turnover, stock-outs)
   - Custom report builder (basic)

6. **Quality & Scaling**
   - Performance optimization (caching, indexing)
   - Load testing (target: 1000 concurrent users)
   - Security hardening (PII encryption, API security)
   - Monitoring & alerts

**Success Metrics:**

- 20+ paying customers
- $50K MRR
- <1% monthly churn
- 99.5% uptime

---

### Phase 3: V2 (Months 7-12)

**Goal:** Premium features, advanced workflows, B2B interconnect

**Deliverables:**

1. **B2B Interconnect**
   - Webhook system (order ↔ PO sync)
   - Automated invoice ↔ PO matching
   - Real-time inventory visibility across companies
   - Payment reconciliation

2. **Advanced Analytics & AI**
   - Demand forecasting (for inventory planning)
   - Product recommendations (for retailers)
   - Churn prediction (for platform)
   - Cohort analysis

3. **Automation**
   - Auto-settlement (when delivered + paid)
   - Auto-invoicing rules (e.g., invoice when picking starts)
   - Alert automation (low stock, overdue invoices, DSO)
   - Report scheduling (weekly email digests)

4. **Mobile Enhancements**
   - Offline mode (driver app)
   - Biometric authentication
   - In-app notifications (real-time push)
   - Performance optimization (reduced app size)

5. **Localization**
   - Multi-currency support (USD, EUR, GHS, NGN, etc.)
   - Multi-language (English, French, Arabic)
   - Tax compliance (VAT, GST per region)

6. **API & Integrations**
   - REST API (read-write) for GROWTH+
   - Zapier integration (automate external workflows)
   - Third-party accounting system sync (QuickBooks, FreshBooks)

**Success Metrics:**

- 50+ customers
- $200K MRR
- 10% of revenue from B2B interconnect
- NPS > 70

---

### Phase 4: Scale (Months 13+)

**Goal:** Enterprise readiness, multiple regions, white-label

**Deliverables:**

1. **Enterprise Features**
   - White-label option (custom domain, branding)
   - Multi-tenant hierarchy (parent company, sub-companies)
   - Advanced permissions (sub-roles, approval workflows)
   - SLA guarantees (99.9% uptime)

2. **Global Expansion**
   - Multi-region deployment (Africa, Asia, Europe)
   - GDPR compliance
   - Data residency options
   - Localized payment processors

3. **Microservices Migration**
   - Extract billing service
   - Extract pricing service
   - Extract delivery service
   - Implement event streaming (Kafka)

4. **Advanced Analytics**
   - Real-time dashboards (Snowflake + Tableau)
   - Predictive analytics (ML models for demand)
   - Benchmarking (compare performance vs industry)

5. **Security & Compliance**
   - SOC 2 Type II certification
   - ISO 27001 compliance
   - Audit logging (immutable, tamper-proof)
   - Penetration testing

**Success Metrics:**

- 100+ customers
- $500K+ MRR
- Global presence (3+ regions)
- 99.9% uptime SLA met

---

## SECTION 8: RISKS & EDGE CASES

### 8.1 Multi-Tenant Data Isolation Risks

#### Risk 1: RLS Bypass (CRITICAL)

**Scenario:** Developer makes mistake, queries don't respect RLS

**Mitigation:**

- Code review checklist: "Does this query filter by tenant_id?"
- Automated tests: Query tenant A's data, assert tenant B cannot access
- RLS database role: separate read-only role with RLS enforced
- Audit logging: log all queries, flag cross-tenant access

**Example Test:**

```
Test: UserA cannot see UserB's orders
  1. Login as UserA (tenant_a_id)
  2. Query: GET /orders
  3. Assert: returns only tenant_a orders
  4. Repeat for UserB (tenant_b_id)
  5. Assert: no overlap
```

#### Risk 2: Admin Role Privilege Escalation

**Scenario:** Admin user with disabled RLS accidentally sees all data

**Mitigation:**

- Admin queries bypass RLS only via special flag
- Audit every admin query (who, what, when)
- Log whenever RLS disabled
- Separate admin DB role (never used in production code)

---

### 8.2 Pricing Conflicts

#### Risk 1: Price Changes Mid-Order

**Scenario:** Customer adds item to cart, price changes before checkout

**Mitigation:**

- Reserve pricing for 30 minutes (cache + DB record)
- Show "Price expires in X minutes" on cart
- On checkout: re-validate pricing, notify if changed
- Allow customer to: accept new price OR abandon order

**Example Flow:**

```
11:00 AM: Customer views Couscous pack, price = $10
11:15 AM: Admin changes price to $9
11:25 AM: Customer checks out
  System: "Price changed from $10 → $9. Accept?"
  Customer: "Yes, proceed"
  Order locked at $9
```

#### Risk 2: Negative Margin Orders

**Scenario:** Typo in pricing rule, cost > price, loss-making order

**Mitigation:**

- Admin approval required for rules with margin < 0%
- Alert on dashboard: "Couscous pack selling at loss"
- Historical report: "Negative margin orders this month"
- System blocks creation if margin < -5% (hard limit)

---

### 8.3 Unit Inconsistencies

#### Risk 1: Orphaned Product Units

**Scenario:** Product has units (pack, pallet) but unit definitions deleted

**Mitigation:**

- Cannot delete ProductUnit if orders exist with that unit
- Soft delete: mark inactive, hide from UI
- Audit trail: why deleted, when
- Migration script: reassign old orders to active unit

#### Risk 2: Fractional Pieces

**Scenario:** Order 2.5 packs, but base_unit=piece (whole units only)

**Mitigation:**

- Validation: qty_packs \* conversion_to_pieces must be integer
- On create order: validate quantity
- Frontend: only allow values resulting in whole pieces
- Error message: "Can only order whole packs (e.g., 2 or 3, not 2.5)"

---

### 8.4 Sync Issues (B2B Interconnect)

#### Risk 1: Webhook Delivery Failure

**Scenario:** Company A tries to send order to Company B, webhook fails

**Mitigation:**

- Retry logic: exponential backoff (1s, 5s, 30s, 5m, 1h)
- Max retries: 10
- After max retries: alert admins, require manual resend
- Queue: store failed webhooks in DB for later processing
- Monitoring: alert if webhook failure rate > 5%

#### Risk 2: Out-of-Order Events

**Scenario:** Events arrive out of order (DELIVERED before CONFIRMED)

**Mitigation:**

- State validation: Can only DELIVER if in DISPATCHED state
- Idempotency: webhook includes idempotency_key (UUID)
- Timestamp check: reject event if timestamp > system time (future event)
- Queue by order_id: process events for same order sequentially

#### Risk 3: Duplicate Sync

**Scenario:** Webhook sent twice, creates duplicate PO in buyer system

**Mitigation:**

- Idempotency key: webhook includes UUID
- On receive: check if idempotency_key already processed
- If duplicate: return 200 (success) without re-processing
- Log: track duplicate webhook attempts

---

### 8.5 Inventory Sync Issues

#### Risk 1: Race Condition on Reserve

**Scenario:**

```
Available: 100 pieces
Order A reserves 60 pieces
Order B reserves 60 pieces (simultaneously)
Result: Both succeed, but only 100 available = oversold
```

**Mitigation:**

- Database lock: use pessimistic locking during reserve
- Alternative: Optimistic locking with version numbers
- Query: `UPDATE inventory SET reserved += qty WHERE id=X AND version=V`
- If version mismatch: retry
- Test: load test with 100 concurrent orders

#### Risk 2: Inventory Adjustment During Order

**Scenario:**

```
Order confirmed: reserves 100 pieces
Warehouse discovers 50 pieces damaged (adjustment: -50)
Now reserved (100) > actual available (50)
```

**Mitigation:**

- Validate: cannot adjust below reserved amount
- Alert: "Cannot reduce inventory below reserved quantities"
- Option 1: Block adjustment, require order cancellation first
- Option 2: Allow adjustment, create backorder (order cannot be fulfilled)
- Choose: Option 1 (simpler UX)

---

### 8.6 Financial Edge Cases

#### Risk 1: Partial Delivery

**Scenario:** Order 100 units, deliver 80 (missing items)

**Mitigation:**

- Driver app: if qty delivered < qty ordered, flag "short delivery"
- Capture: reason (item out of stock, damaged, etc.)
- System creates:
  - Delivered order: 80 units (invoice for 80)
  - Backorder: 20 units (separate order, separate invoice)
- Notification: customer sees partial delivery + backorder

#### Risk 2: Invoice Before Delivery

**Scenario:** Invoice generated when order CONFIRMED, but delivery delayed

**Mitigation:**

- Policy decision: Invoice on CONFIRMED OR on DELIVERED?
- Recommendation: Invoice on CONFIRMED (cash flow)
- Reason: Customer has committed, inventory reserved
- Alternative: On DELIVERED (only bill what's delivered)
- Choose: CONFIRMED (standard B2B practice)

#### Risk 3: Payment Received, Partial Delivery

**Scenario:** Customer pays full invoice, but only 80% delivered

**Mitigation:**

- Partial delivery creates backorder (separate invoice)
- Customer pays for backorder when delivered
- Payment reconciliation: match payments to invoices
- Option: Issue credit (auto-reduce backorder price)
- Choose: Separate invoice (cleaner accounting)

---

### 8.7 Scalability Edge Cases

#### Risk 1: Cache Stampede

**Scenario:**

```
Pricing cache expires at 11:00 AM
1,000 concurrent requests hit pricing engine
All 1,000 queries hit DB (cache miss)
DB gets overwhelmed
```

**Mitigation:**

- Stale-while-revalidate: serve stale cache, refresh in background
- Cache key versioning: if key changes, recompute
- Probabilistic early expiry: expire at 10:58 AM (2-min buffer)
- Load test: simulate 10K concurrent pricing requests

#### Risk 2: Database Connection Pool Exhaustion

**Scenario:** 100 API instances × 20 connections = 2,000 connections, DB limit 1,000

**Mitigation:**

- Use connection pooling (PgBouncer in transaction mode)
- Pool size: (# instances) × 5 connections per instance
- Monitor: track open connections, alert at 80%
- Graceful degradation: queue requests if pool full (max wait 30s)

#### Risk 3: Large File Upload (Photo Proof)

**Scenario:** Driver uploads 50 MB photo (slow network, mobile app crashes)

**Mitigation:**

- Resize image client-side before upload
- Max size: 5 MB (compress before storage)
- Resume upload: if interrupted, restart from byte offset
- Alternative: store low-res in app, high-res async to S3
- Timeout: 60 seconds, fail gracefully

---

## SECTION 9: SUCCESS METRICS & KPIs

### Platform-Level KPIs

```
ACQUISITION
  - New tenants/month
  - Conversion rate (signups → paid)
  - CAC (customer acquisition cost)

RETENTION
  - Monthly churn rate (target: <2%)
  - NPS (Net Promoter Score, target: >50)
  - Expansion revenue (upgrades, add-ons)

REVENUE
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - ARPU (Average Revenue Per User)
  - Gross margin (revenue - infra costs)

OPERATIONS
  - Uptime (target: 99.5%+)
  - API latency (p95, target: <200ms)
  - Support response time (target: <4h)

ENGAGEMENT
  - Feature adoption (% of tenants using)
  - Monthly active tenants
  - Orders processed/month
  - GMV (Gross Merchandise Value)
```

### Tenant-Level KPIs (In-App Dashboards)

```
OPERATIONS
  - Orders/day
  - Delivery on-time rate (%)
  - Average delivery time (hours)
  - Days sales outstanding (DSO)
  - Inventory turnover (times/month)

SALES
  - Revenue/month
  - Revenue by segment
  - Customer churn rate
  - Average order value

PROFITABILITY
  - Gross margin %
  - Profitability by customer
  - Cost per delivery
```

---

## SECTION 10: IMPLEMENTATION PRIORITIES (MVP → SCALE)

### Critical Path (Must Have)

1. **Multi-tenant isolation** (RLS, data boundaries)
2. **Auth & RBAC** (users, roles, permissions)
3. **Order lifecycle** (DRAFT → SETTLED state machine)
4. **Inventory tracking** (base unit, reserve/deduct logic)
5. **Pricing engine** (lookup, caching, locking)
6. **Subscription billing** (Stripe integration, invoice generation)
7. **Mobile app** (driver, sales rep, retailer experiences)
8. **Notifications** (email, SMS alerts)

### High Priority (V1)

9. Route optimization (Google Maps API)
10. Invoice PDF generation
11. Advanced pricing (volume discounts, promos)
12. Payment reconciliation
13. Real-time GPS tracking
14. Signature capture & proof storage

### Medium Priority (V2)

15. B2B interconnect (webhooks, sync)
16. Offline mode (mobile)
17. AI recommendations
18. Advanced analytics
19. Custom report builder
20. Automation rules

### Nice-to-Have (V3+)

21. White-label
22. Multi-currency
23. Microservices migration
24. Advanced ML models
25. Global expansion

---

## CONCLUSION

This **B2B Distribution SaaS platform** is designed to scale from a 10-person MVP team to a globally distributed platform serving 100+ businesses. Key architectural decisions prioritize:

- **Data Security:** Row-level security at the database layer (cannot be bypassed)
- **Operational Simplicity:** Modular monolith starting point, microservices when needed
- **User Experience:** Role-based mobile experiences, offline-first for drivers
- **Financial Integrity:** Price locking, inventory versioning, audit trails
- **Scalability:** Stateless APIs, caching, async processing, eventual migration to sharding

The roadmap is realistic and achievable, with each phase building on the last. Success depends on tight execution in MVP (3 months), rapid learning in V1 (3 months), and strategic feature selection in V2+ (based on customer feedback).

---

**Document Complete**  
**Next Steps:** Convert this to detailed technical specifications for engineering team handoff.
