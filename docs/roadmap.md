# JAWDA B2B Distribution Platform — Frontend Roadmap

**Version:** 1.0  
**Based on:** `docs/architecture.md`  
**Date:** April 2025  
**Audience:** Development team, Product, CTO

---

## Executive Summary

This roadmap translates `architecture.md` into a phased, page-by-page, component-by-component execution plan for building the complete JAWDA B2B distribution SaaS frontend. All phases use **fake APIs only** (no real backend). The platform supports **FR / AR (RTL) / EN** from day one. The stack is **React 18 + Vite + Tailwind + shadcn/ui + React Query + react-router-dom + i18next + recharts + framer-motion**.

**Current state:** 9 pages built (Index, NotFound, AdminDashboard, TenantsPage, SubscriptionsPage, BusinessDashboard, ProductsPage, OrdersPage, CustomersPage), 5 custom components, 2 layouts. This roadmap covers everything remaining.

---

## Table of Contents

1. [Global Phases Overview](#1-global-phases-overview)
2. [Phase 0 — Foundation](#2-phase-0--foundation)
3. [Phase 1 — Auth & Layout Shell](#3-phase-1--auth--layout-shell)
4. [Phase 2 — Super Admin Platform](#4-phase-2--super-admin-platform)
5. [Phase 3 — Business Operations Core](#5-phase-3--business-operations-core)
6. [Phase 4 — Inventory & Catalog](#6-phase-4--inventory--catalog)
7. [Phase 5 — Orders & Delivery](#7-phase-5--orders--delivery)
8. [Phase 6 — Finance & Reports](#8-phase-6--finance--reports)
9. [Phase 7 — Mobile UX (Driver / Sales Rep / Retailer)](#9-phase-7--mobile-ux)
10. [Phase 8 — Advanced SaaS Features](#10-phase-8--advanced-saas-features)
11. [Phase 9 — Optimization & Launch](#11-phase-9--optimization--launch)
12. [Page Inventory (All Pages)](#12-page-inventory)
13. [Component Library Roadmap](#13-component-library-roadmap)
14. [Fake API Plan](#14-fake-api-plan)
15. [i18n Plan](#15-i18n-plan)
16. [QA Plan](#16-qa-plan)
17. [Launch Checklist](#17-launch-checklist)

---

## 1. Global Phases Overview

| Phase | Name | Pages | Duration | Priority |
|-------|------|-------|----------|----------|
| 0 | Foundation | 0 | 1 week | P0 |
| 1 | Auth & Layout Shell | 4 | 1 week | P0 |
| 2 | Super Admin Platform | 8 | 2 weeks | P0 |
| 3 | Business Operations Core | 6 | 2 weeks | P0 |
| 4 | Inventory & Catalog | 7 | 2 weeks | P0 |
| 5 | Orders & Delivery | 8 | 3 weeks | P0 |
| 6 | Finance & Reports | 7 | 2 weeks | P1 |
| 7 | Mobile UX | 12 | 3 weeks | P1 |
| 8 | Advanced SaaS | 6 | 2 weeks | P2 |
| 9 | Optimization & Launch | 0 | 2 weeks | P2 |
| **Total** | | **~58 pages** | **~20 weeks** | |

---

## 2. Phase 0 — Foundation

### Goals
- Design system tokens finalized
- Fake API infrastructure ready
- i18n framework wired
- Reusable base components built
- Project scaffolding complete

### Deliverables

#### 2.1 Design System (`src/index.css` + `tailwind.config.ts`)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `0 0% 100%` | `222.2 84% 4.9%` |
| `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` |
| `--primary` | `221.2 83.2% 53.3%` | `217.2 91.2% 59.8%` |
| `--secondary` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| `--success` | `142 76% 36%` | `142 70% 45%` |
| `--warning` | `38 92% 50%` | `38 92% 50%` |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` |
| `--info` | `199 89% 48%` | `199 89% 48%` |
| `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| `--accent` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |

**Typography scale:**
- `font-display`: Geist / Cairo (AR)
- `font-body`: Inter / Noto Sans Arabic (AR)
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48

**Spacing:** 4px base grid (0.5rem increments)

**Grid:** 12-column, 1280px max-width, responsive breakpoints: `sm:640 md:768 lg:1024 xl:1280 2xl:1536`

#### 2.2 Fake API Infrastructure

```
src/lib/fake-api/
├── index.ts          — Export all API functions
├── types.ts          — All TypeScript interfaces
├── data.ts           — Seed data (realistic Algerian business names)
├── delay.ts          — Configurable delay simulator
├── helpers.ts        — Pagination, filtering, sorting helpers
├── auth.ts           — Mock auth (login, me, roles)
├── tenants.ts        — Tenant CRUD
├── products.ts       — Product CRUD
├── orders.ts         — Order CRUD + state machine
├── inventory.ts      — Stock CRUD + adjustments
├── customers.ts      — Customer CRUD
├── deliveries.ts     — Delivery tasks
├── invoices.ts       — Invoice CRUD
├── pricing.ts        — Pricing rules engine
├── reports.ts        — Analytics data generators
├── billing.ts        — Subscription & plans
└── users.ts          — User management
```

#### 2.3 i18n Setup

```
src/locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── products.json
│   ├── orders.json
│   ├── inventory.json
│   ├── customers.json
│   ├── deliveries.json
│   ├── invoices.json
│   ├── reports.json
│   ├── settings.json
│   ├── admin.json
│   └── mobile.json
├── fr/   (same structure)
└── ar/   (same structure)
```

#### 2.4 Base Components to Build

| Component | Purpose | Variants |
|-----------|---------|----------|
| `DataTable` | Sortable, filterable, paginated table | default, compact, selectable |
| `EmptyState` | No-data placeholder | icon + message + CTA |
| `StatusBadge` | Order/tenant/invoice status | draft, active, suspended, etc. |
| `KPIWidget` | Single metric card | trend-up, trend-down, neutral |
| `ConfirmDialog` | Destructive action confirmation | delete, cancel, suspend |
| `PageHeader` | Page title + breadcrumb + actions | with/without tabs |
| `SearchInput` | Debounced search bar | with/without filters |
| `SkeletonLoader` | Loading placeholder | table, card, chart, form |
| `LanguageSwitcher` | FR/AR/EN toggle | dropdown |
| `ThemeToggle` | Light/dark mode | icon button |

### Validation Checklist
- [ ] Design tokens in `index.css` with dark mode
- [ ] Tailwind config extended with all custom tokens
- [ ] `i18n.ts` configured with `i18next` + `react-i18next`
- [ ] RTL detection working (`dir="rtl"` on `<html>`)
- [ ] Fake API `delay()` wrapper functional
- [ ] 10 base components built with Storybook-ready props
- [ ] All base components support RTL
- [ ] Seed data includes FR/AR/EN content

---

## 3. Phase 1 — Auth & Layout Shell

### Goals
- Login / Forgot Password / Reset Password pages
- Role-based routing guard
- Layout shells for all 3 dashboard levels
- Sidebar navigation per role

### Pages

#### 3.1 Login Page — `/login`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Authenticate user, determine role, redirect |
| **Roles** | All (pre-auth) |
| **Route** | `/login` |
| **States** | idle, loading, error, success |
| **Responsive** | Full-width form on mobile, split-screen on desktop |
| **SEO** | `<title>` "Connexion — JAWDA" |

**Components inside:**
| Component | Details |
|-----------|---------|
| Logo | Centered, brand mark |
| LoginForm | Email + Password + Remember me |
| LanguageSwitcher | Top-right corner |
| ErrorAlert | Invalid credentials message |
| ForgotPasswordLink | Navigates to `/forgot-password` |
| SubmitButton | Loading spinner state |
| DemoRoleSelector | Dev-mode only: quick role switch |

**Fake API:** `POST /auth/login` → `{ token, user: { id, name, email, role, tenantId } }`

#### 3.2 Forgot Password Page — `/forgot-password`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Request password reset email |
| **Roles** | All (pre-auth) |
| **Route** | `/forgot-password` |
| **States** | idle, loading, success (email sent), error |

**Components:** Logo, EmailInput, SubmitButton, BackToLoginLink, SuccessMessage

#### 3.3 Reset Password Page — `/reset-password`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set new password after email link |
| **Roles** | All (pre-auth) |
| **Route** | `/reset-password?token=xxx` |
| **States** | idle, loading, success, error, token-expired |

**Components:** Logo, NewPasswordInput, ConfirmPasswordInput, PasswordStrengthMeter, SubmitButton

#### 3.4 Role-Based Layout Shells

| Layout | Route Prefix | Sidebar Items | Header |
|--------|-------------|---------------|--------|
| `SuperAdminLayout` | `/admin/*` | Dashboard, Tenants, Subscriptions, Accounts, Billing, Audit Logs, Analytics, Settings | Notifications, Profile avatar |
| `BusinessLayout` | `/business/*` | Dashboard, Products, Orders, Customers, Inventory, Deliveries, Invoices, Reports, Users, Settings | Tenant name, Notifications, Profile |
| `MobileLayout` | `/m/*` | Bottom tab bar (context-dependent) | Minimal header |

**Components:**
| Component | Purpose |
|-----------|---------|
| `RoleGuard` | HOC: checks `user.role` against allowed roles, redirects to `/login` if unauthorized |
| `TenantSwitcher` | Super admin: switch active tenant context |
| `NotificationBell` | Badge count + dropdown panel |
| `UserMenu` | Avatar + dropdown (profile, settings, logout) |
| `BreadcrumbNav` | Auto-generated from route |
| `MobileSidebar` | Sheet-based sidebar for tablet |

### Validation Checklist
- [ ] Login flow: email → password → redirect by role
- [ ] Forgot password: email → success message
- [ ] RoleGuard prevents unauthorized access
- [ ] Sidebar highlights active route
- [ ] RTL: sidebar flips to right side
- [ ] All text translated (FR/AR/EN)
- [ ] Loading/error states on all forms
- [ ] Responsive: mobile, tablet, desktop

---

## 4. Phase 2 — Super Admin Platform

### Goals
- Complete platform management dashboard
- Tenant lifecycle management (create, suspend, delete)
- Subscription & billing management
- System monitoring & audit logs

### Pages

#### 4.1 Admin Dashboard — `/admin` ✅ (exists, enhance)

| Section | Components |
|---------|------------|
| KPI Row | `KPIWidget` × 4: MRR, Active Tenants, Total Orders, Churn Rate |
| Revenue Chart | `AreaChart` (recharts): MRR over 12 months |
| Tenant Distribution | `PieChart`: by plan (Starter/Growth/Enterprise) |
| Recent Activity | `ActivityTimeline`: last 10 tenant actions |
| System Health | `StatusIndicator` × 3: API, DB, Queue |
| Quick Actions | Buttons: Add Tenant, View Alerts, Export Report |

**Fake API:** `GET /admin/dashboard` → `{ kpis, revenueChart[], tenantDistribution[], recentActivity[], systemHealth }`

#### 4.2 Tenants Page — `/admin/tenants` ✅ (exists, enhance)

| Section | Components |
|---------|------------|
| Header | `PageHeader` with "Add Tenant" button |
| Filters | `SearchInput` + `Select` (status) + `Select` (plan) |
| Table | `DataTable`: name, plan, status, users, revenue, created |
| Row Actions | View, Suspend, Delete |
| Empty State | `EmptyState`: "No tenants yet" |

**Modals:**
| Modal | Fields |
|-------|--------|
| `CreateTenantModal` | Name, email, phone, address, plan, billing cycle |
| `TenantDetailDrawer` | Full tenant info, users list, usage stats, subscription history |
| `SuspendTenantDialog` | Reason, effective date, notify user |

**Fake API:**
- `GET /admin/tenants?status=&plan=&search=&page=&limit=`
- `POST /admin/tenants` → create
- `PATCH /admin/tenants/:id` → update
- `DELETE /admin/tenants/:id` → soft delete

#### 4.3 Subscriptions Page — `/admin/subscriptions` ✅ (exists, enhance)

| Section | Components |
|---------|------------|
| Plan Cards | `PlanCard` × 3: Starter, Growth, Enterprise (features, limits, price) |
| Active Subscriptions Table | `DataTable`: tenant, plan, status, next billing, revenue |
| Upgrade/Downgrade | `PlanChangeModal` with proration preview |
| Revenue Metrics | `KPIWidget` × 3: MRR, ARR, ARPU |

#### 4.4 Accounts Page — `/admin/accounts`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage platform-level user accounts (super admins) |
| **Roles** | `super_admin` |
| **Route** | `/admin/accounts` |
| **States** | loading, empty, populated, error |

| Section | Components |
|---------|------------|
| Table | `DataTable`: name, email, role, last login, status |
| Actions | Invite, Deactivate, Reset Password |
| Modal | `InviteUserModal`: email, role, permissions |

#### 4.5 Billing Page — `/admin/billing`

| Section | Components |
|---------|------------|
| Revenue Overview | `KPIWidget` × 4: Collected, Pending, Failed, Refunded |
| Invoice History | `DataTable`: tenant, amount, status, date, actions |
| Payment Methods | `PaymentMethodCard` per tenant |
| Dunning Queue | `DataTable`: failed payments, retry count, next retry |

#### 4.6 Audit Logs Page — `/admin/audit-logs`

| Section | Components |
|---------|------------|
| Filters | Date range, user, action type, tenant |
| Log Table | `DataTable`: timestamp, user, action, resource, details |
| Log Detail | `Drawer`: full JSON payload, diff view |

#### 4.7 Platform Analytics — `/admin/analytics`

| Section | Components |
|---------|------------|
| Tenant Growth | `LineChart`: new tenants/month |
| Feature Adoption | `BarChart`: feature usage % by plan |
| Churn Analysis | `AreaChart`: churn rate over time |
| Geographic Distribution | `MapChart` (optional): tenants by region |
| Cohort Table | `DataTable`: signup cohort, retention %, revenue |

#### 4.8 Platform Settings — `/admin/settings`

| Section | Components |
|---------|------------|
| General | Platform name, logo upload, support email |
| Plans | Edit plan features, limits, pricing |
| Notifications | Email templates, SMS config |
| API Keys | Generate/revoke platform API keys |
| Maintenance | Toggle maintenance mode |

### Validation Checklist
- [ ] Dashboard KPIs load from fake API
- [ ] Tenant CRUD: create, edit, suspend, delete
- [ ] Subscription management: upgrade/downgrade
- [ ] Audit logs filterable and paginated
- [ ] All 8 pages responsive
- [ ] All text in FR/AR/EN
- [ ] Empty states on all tables
- [ ] Loading skeletons on all data sections
- [ ] Role guard: only `super_admin` can access `/admin/*`

---

## 5. Phase 3 — Business Operations Core

### Goals
- Complete tenant admin dashboard
- User management (invite, roles, permissions)
- Settings page per tenant
- Staff activity monitoring

### Pages

#### 5.1 Business Dashboard — `/business` ✅ (exists, enhance)

| Section | Components |
|---------|------------|
| KPI Row | `KPIWidget` × 8: Products, Orders, Pending, Customers, Revenue, Inventory Value, Active Drivers, Delivery Rate |
| Revenue Chart | `AreaChart`: revenue last 6 months |
| Orders by Status | `BarChart` or `PieChart` |
| Recent Orders | `DataTable` (compact, 5 rows) |
| Low Stock Alerts | `AlertList`: products below reorder point |
| Quick Actions | Create Order, Add Product, View Deliveries |

#### 5.2 Users Page — `/business/users`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage tenant staff (managers, drivers, sales reps, accountants) |
| **Roles** | `admin`, `manager` |
| **Route** | `/business/users` |

| Section | Components |
|---------|------------|
| Table | `DataTable`: name, email, role, status, last login |
| Actions | Invite, Edit Role, Deactivate |
| Role Filter | `Select`: all, manager, driver, sales_rep, accountant |
| Invite Modal | `InviteUserModal`: email, role, warehouse assignment |
| Edit Drawer | `UserDetailDrawer`: profile, permissions, activity log |

**Fake API:**
- `GET /business/users?role=&status=&search=`
- `POST /business/users/invite`
- `PATCH /business/users/:id`
- `DELETE /business/users/:id`

#### 5.3 Business Settings — `/business/settings`

| Section | Components |
|---------|------------|
| Company Profile | Name, logo, address, phone, email |
| Warehouses | List + Add/Edit warehouse |
| Tax Configuration | TVA rates (9%, 19%) |
| Currency | DZD display format |
| Notifications | Email/SMS preferences |
| Integration | API keys (if plan allows) |

#### 5.4 Activity Log — `/business/activity`

| Section | Components |
|---------|------------|
| Timeline | `ActivityTimeline`: all tenant actions |
| Filters | User, action type, date range |
| Export | CSV download |

#### 5.5 Notifications Page — `/business/notifications`

| Section | Components |
|---------|------------|
| Notification List | `NotificationCard` × N: icon, title, body, time, read/unread |
| Filters | All, Unread, Critical |
| Mark All Read | Button |

#### 5.6 Help / Support — `/business/help`

| Section | Components |
|---------|------------|
| FAQ Accordion | `Accordion` with common questions |
| Contact Form | Subject, message, priority |
| Documentation Links | External links |

### Validation Checklist
- [ ] Dashboard enhanced with all 8 KPIs
- [ ] User CRUD: invite, edit role, deactivate
- [ ] Settings: company profile, tax, currency
- [ ] Activity log filterable
- [ ] Notifications: read/unread toggle
- [ ] Responsive on all breakpoints
- [ ] RTL layout correct
- [ ] All translations complete

---

## 6. Phase 4 — Inventory & Catalog

### Goals
- Full product catalog with units & conversion
- Pricing rules engine (segment-based, versioned)
- Inventory management (stock, adjustments, movements)
- Warehouse management

### Pages

#### 6.1 Products Page — `/business/products` ✅ (exists, enhance)

| Section | Components |
|---------|------------|
| Header | `PageHeader` + "Add Product" button |
| Filters | Search, Category, Status (active/inactive) |
| View Toggle | Grid / Table view |
| Product Table | `DataTable`: image, name, SKU, category, stock, price, status |
| Product Grid | `ProductCard` × N: image, name, price, stock badge |
| Empty State | "No products yet. Add your first product." |

**Modals/Drawers:**
| Component | Sections |
|-----------|----------|
| `CreateProductDrawer` | Basic info, SKU, category, base unit, image upload zone |
| `ProductDetailDrawer` | Info, units, pricing rules, stock levels, order history |
| `ProductUnitEditor` | Add/edit units with conversion factor |
| `PricingRuleBuilder` | Segment selector, unit selector, price input, effective date, volume tiers |

**Fake API:**
- `GET /products?tenantId=&category=&status=&search=&page=&limit=`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `GET /products/:id/pricing-rules`
- `POST /products/:id/pricing-rules`

#### 6.2 Product Detail Page — `/business/products/:id`

| Section | Components |
|---------|------------|
| Header | Product name, status toggle, edit button |
| Info Card | SKU, category, base unit, created date |
| Image Gallery | Main image + thumbnails (upload zone) |
| Units Tab | `DataTable`: unit name, conversion, list price |
| Pricing Tab | `PricingRuleTable`: segment, unit, price, effective dates, actions |
| Stock Tab | `StockByWarehouse`: warehouse name, quantity (in base + display units) |
| History Tab | `ActivityTimeline`: price changes, stock adjustments |

#### 6.3 Categories Page — `/business/categories`

| Section | Components |
|---------|------------|
| Category List | `DataTable`: name, product count, status |
| Add/Edit | Inline editing or modal |
| Drag Reorder | Optional: drag to reorder display priority |

#### 6.4 Pricing Rules Page — `/business/pricing`

| Section | Components |
|---------|------------|
| Overview | `KPIWidget` × 3: Active Rules, Segments, Products with custom pricing |
| Rules Table | `DataTable`: product, segment, unit, price, effective date, status |
| Filters | Product, Segment, Date range |
| Create Rule | `PricingRuleBuilder` modal |
| Bulk Import | CSV upload zone |
| Price Simulator | Select customer + products → show calculated prices |

#### 6.5 Inventory Dashboard — `/business/inventory`

| Section | Components |
|---------|------------|
| KPI Row | `KPIWidget` × 4: Total SKUs, Low Stock Items, Inventory Value, Turnover Rate |
| Stock Table | `DataTable`: product, warehouse, qty (pieces), qty (display unit), reorder point, status |
| Low Stock Alerts | `AlertBanner` for items below reorder point |
| Filters | Warehouse, Category, Stock status (normal/low/out) |

#### 6.6 Stock Adjustments Page — `/business/inventory/adjustments`

| Section | Components |
|---------|------------|
| Adjustment History | `DataTable`: date, product, warehouse, qty change, reason, user, status |
| Create Adjustment | `AdjustmentForm`: product, warehouse, qty (+/-), reason, approval |
| Pending Approvals | `DataTable`: adjustments awaiting manager approval |

**Fake API:**
- `GET /inventory?warehouseId=&category=&status=`
- `POST /inventory/adjustments`
- `PATCH /inventory/adjustments/:id/approve`

#### 6.7 Warehouses Page — `/business/warehouses`

| Section | Components |
|---------|------------|
| Warehouse Cards | `WarehouseCard` × N: name, address, manager, utilization bar, product count |
| Warehouse Detail | Drawer: zones, products, staff, capacity chart |
| Add Warehouse | Modal: name, address, manager, capacity |

### Validation Checklist
- [ ] Product CRUD with units and conversion display
- [ ] Pricing rules: create, version, segment-based
- [ ] Price simulator functional
- [ ] Inventory: view stock by warehouse
- [ ] Stock adjustments with approval flow
- [ ] Warehouse management
- [ ] Unit conversion displays correctly
- [ ] All pages responsive + RTL
- [ ] All translations complete
- [ ] Empty/loading/error states on every page

---

## 7. Phase 5 — Orders & Delivery

### Goals
- Complete order lifecycle (Draft → Settled)
- Order creation with pricing engine
- Delivery task management
- Driver assignment & GPS tracking UI
- Delivery proof (signature, photo)

### Pages

#### 7.1 Orders Page — `/business/orders` ✅ (exists, enhance)

| Section | Components |
|---------|------------|
| KPI Row | `KPIWidget` × 4: Total Orders, Pending, In Transit, Delivered Today |
| Status Pipeline | `OrderPipeline`: visual flow (Draft → Confirmed → Picking → Dispatched → Delivered → Settled) with counts |
| Orders Table | `DataTable`: #, customer, status, total, items, date, driver, actions |
| Filters | Status, Customer, Date range, Sales rep |
| Bulk Actions | Confirm selected, Assign driver, Export |

#### 7.2 Create Order Page — `/business/orders/create`

| Section | Components |
|---------|------------|
| Customer Select | `CustomerSearchSelect`: search + segment display |
| Product Lines | `OrderLineEditor` × N: product search, unit selector, qty, price (auto from engine), line total |
| Add Line | Button to add product row |
| Order Summary | Subtotal, Tax (TVA), Discount, Total |
| Notes | `Textarea` |
| Actions | Save as Draft, Confirm Order |
| Price Preview | Show segment-based pricing per line |

**Fake API:**
- `POST /orders` → create draft
- `PATCH /orders/:id/confirm` → confirm (locks prices, reserves inventory)

#### 7.3 Order Detail Page — `/business/orders/:id`

| Section | Components |
|---------|------------|
| Header | Order #, status badge, customer name |
| Status Timeline | `OrderTimeline`: visual state progression with timestamps |
| Order Lines | `DataTable`: product, unit, qty, price, total |
| Customer Info | Card: name, segment, phone, address |
| Delivery Info | Card: driver, vehicle, estimated arrival, GPS link |
| Invoice Link | Link to associated invoice |
| Actions | Based on status: Confirm, Start Picking, Assign Driver, Cancel |
| Activity Log | Timeline of all status changes |

#### 7.4 Deliveries Dashboard — `/business/deliveries`

| Section | Components |
|---------|------------|
| KPI Row | `KPIWidget` × 4: Today's Deliveries, In Transit, Completed, On-Time % |
| Map View | `DeliveryMapCard`: pins for all active deliveries |
| List View | `DataTable`: order, customer, driver, status, ETA |
| Driver Filter | `Select`: all drivers |

#### 7.5 Delivery Detail Page — `/business/deliveries/:id`

| Section | Components |
|---------|------------|
| Map | `DeliveryMap`: route from warehouse to customer |
| Status | Current delivery status with timeline |
| Items | Products to deliver (checklist) |
| Proof | Signature image, delivery photo |
| Customer | Name, address, phone |
| Driver | Name, phone, vehicle |

#### 7.6 Driver Management — `/business/drivers`

| Section | Components |
|---------|------------|
| Driver Cards | `DriverCard` × N: name, photo, status (available/on-route), deliveries today |
| Driver Detail | Drawer: profile, vehicle, performance stats, delivery history |
| Assign Route | Modal: select driver, select orders, optimize route |

#### 7.7 Route Planning — `/business/routes`

| Section | Components |
|---------|------------|
| Route Builder | `RouteBuilder`: map + drag-drop stop ordering |
| Unassigned Orders | Sidebar list of orders ready for dispatch |
| Route Summary | Distance, estimated time, stop count |

#### 7.8 Delivery Proof Page — `/business/deliveries/:id/proof`

| Section | Components |
|---------|------------|
| Signature | `SignaturePad`: canvas signature capture |
| Photo | `PhotoCapture`: camera capture or upload |
| Checklist | `DeliveryChecklist`: items delivered (check/uncheck) |
| Notes | `Textarea`: issues, comments |
| Submit | Complete delivery button |

### Validation Checklist
- [ ] Order creation with dynamic pricing from engine
- [ ] Order state machine: all transitions work
- [ ] Price locking verified on confirmation
- [ ] Delivery assignment flow complete
- [ ] Map view renders with pins
- [ ] Delivery proof: signature + photo capture
- [ ] Status pipeline visualization
- [ ] All pages responsive + RTL
- [ ] All translations complete
- [ ] Empty/loading/error states

---

## 8. Phase 6 — Finance & Reports

### Goals
- Invoice management
- Payment tracking & reconciliation
- Financial dashboards
- Report builder
- Tax compliance (DZD, TVA 9%/19%)

### Pages

#### 8.1 Invoices Page — `/business/invoices`

| Section | Components |
|---------|------------|
| KPI Row | `KPIWidget` × 4: Total Invoiced, Paid, Overdue, Partial |
| Invoice Table | `DataTable`: #, customer, order, amount, status, due date, actions |
| Filters | Status, Customer, Date range |
| Actions | View, Download PDF, Mark Paid, Send Reminder |

#### 8.2 Invoice Detail Page — `/business/invoices/:id`

| Section | Components |
|---------|------------|
| Invoice Header | Number, date, due date, status badge |
| From/To | Tenant info ↔ Customer info |
| Line Items | `DataTable`: product, unit, qty, price, total |
| Totals | Subtotal, TVA breakdown (9%/19%), Total |
| Payment History | Timeline of payments received |
| Actions | Download PDF, Record Payment, Send Reminder |

#### 8.3 Payments Page — `/business/payments`

| Section | Components |
|---------|------------|
| Payment History | `DataTable`: date, invoice, customer, amount, method, status |
| Record Payment | `PaymentForm`: invoice select, amount, method, date, reference |
| Reconciliation | Unmatched payments list |

#### 8.4 Accounting Dashboard — `/business/accounting`

| Section | Components |
|---------|------------|
| KPI Row | Revenue, Expenses, Net Profit, DSO |
| Revenue Chart | `AreaChart`: monthly revenue |
| Aging Receivables | `BarChart`: 0-30, 30-60, 60-90, 90+ days |
| Top Debtors | `DataTable`: customer, outstanding, days overdue |
| Tax Summary | TVA collected, TVA due, net |

#### 8.5 Reports Page — `/business/reports`

| Section | Components |
|---------|------------|
| Report Templates | Cards: Sales Report, Inventory Report, Customer Report, Financial Report, Delivery Report |
| Report Builder | Filters: date range, warehouse, segment, product category |
| Generated Report | `DataTable` + `Charts` + Export (CSV, PDF) |

#### 8.6 Sales Report — `/business/reports/sales`

| Section | Components |
|---------|------------|
| Revenue by Period | `LineChart` |
| Revenue by Segment | `PieChart` |
| Top Products | `BarChart` + `DataTable` |
| Top Customers | `DataTable` with spend ranking |
| Sales Rep Performance | `DataTable`: rep, orders, revenue, avg order value |

#### 8.7 Tax Report (G50) — `/business/reports/tax`

| Section | Components |
|---------|------------|
| Period Selector | Month/Quarter |
| TVA Summary | Table: tax rate, taxable base, TVA collected |
| G50 Preview | Formatted for Algerian tax declaration |
| Export | PDF download |

### Validation Checklist
- [ ] Invoice CRUD with correct TVA calculation
- [ ] Payment recording and reconciliation
- [ ] Aging receivables chart accurate
- [ ] Reports generate with real mock data
- [ ] G50 tax report formatted correctly
- [ ] PDF export functional (client-side)
- [ ] DZD currency formatting everywhere
- [ ] All pages responsive + RTL
- [ ] All translations complete

---

## 9. Phase 7 — Mobile UX

### Goals
- Mobile-optimized layouts for Driver, Sales Rep, Retailer roles
- Bottom tab navigation
- Touch-friendly interactions
- Offline-ready architecture (UI only, no real offline)
- Camera & signature UX

### Mobile Navigation

| Role | Bottom Tabs |
|------|-------------|
| **Driver** | Home, Route, Deliveries, Profile |
| **Sales Rep** | Home, Orders, Customers, Collections, Profile |
| **Retailer** | Home, Catalog, Cart, Orders, Account |

### Pages

#### 9.1 Driver — Home — `/m/driver`

| Section | Components |
|---------|------------|
| Greeting | "Bonjour, Yacine" + date |
| Today Summary | `MobileKPICard` × 3: Deliveries, Completed, Remaining |
| Start Route | Large CTA button |
| Current Location | Mini map |

#### 9.2 Driver — Route View — `/m/driver/route`

| Section | Components |
|---------|------------|
| Map | Full-screen map with stop pins |
| Stop List | Bottom sheet: swipeable stop cards |
| Navigation | "Navigate" button (opens Google Maps) |
| Progress | "3 of 8 stops completed" bar |

#### 9.3 Driver — Delivery Stop — `/m/driver/delivery/:id`

| Section | Components |
|---------|------------|
| Customer Info | Name, address, phone (tap to call) |
| Items List | `MobileChecklist`: product, qty, check |
| Signature Pad | `SignaturePad` (full-width canvas) |
| Photo Capture | `CameraButton` → capture delivery proof |
| Notes | `Textarea` (collapsible) |
| Complete | "Swipe to Complete" gesture |

#### 9.4 Driver — Delivery History — `/m/driver/history`

| Section | Components |
|---------|------------|
| Date Filter | Horizontal date scroller |
| Delivery List | `MobileDeliveryCard` × N: customer, status, time |

#### 9.5 Sales Rep — Home — `/m/sales`

| Section | Components |
|---------|------------|
| Greeting + Summary | Pending orders, collections due, today's visits |
| Quick Actions | Create Order, View Customers |
| Recent Orders | `MobileOrderCard` × 5 |

#### 9.6 Sales Rep — Create Order — `/m/sales/orders/create`

| Section | Components |
|---------|------------|
| Customer Search | `SearchInput` with recent customers |
| Product Picker | `MobileProductPicker`: search, category tabs, add to order |
| Order Summary | Sticky bottom bar: items count, total, "Submit" |

#### 9.7 Sales Rep — Customer List — `/m/sales/customers`

| Section | Components |
|---------|------------|
| Search | `SearchInput` |
| Segment Filter | Tabs: All, Superette, Wholesale, Shadow |
| Customer Cards | `MobileCustomerCard`: name, segment, last order, outstanding |
| Tap Action | Navigate to customer detail |

#### 9.8 Sales Rep — Collections — `/m/sales/collections`

| Section | Components |
|---------|------------|
| Overdue List | `MobileInvoiceCard` × N: customer, amount, days overdue |
| Tap to Call | Phone icon on each card |
| Record Payment | "Mark Paid" + amount input |

#### 9.9 Retailer — Home — `/m/shop`

| Section | Components |
|---------|------------|
| Welcome | Tenant logo + name |
| Quick Reorder | Last order summary + "Reorder" CTA |
| Featured Products | Horizontal scroll of `MobileProductCard` |
| Active Order | Status tracker if order in progress |

#### 9.10 Retailer — Catalog — `/m/shop/catalog`

| Section | Components |
|---------|------------|
| Search Bar | `SearchInput` (sticky top) |
| Category Tabs | Horizontal scroll tabs |
| Product Grid | 2-column `MobileProductCard` grid |
| Add to Cart | Quantity selector + unit dropdown + Add button |

#### 9.11 Retailer — Cart — `/m/shop/cart`

| Section | Components |
|---------|------------|
| Cart Items | `MobileCartItem` × N: product, unit, qty, price, remove |
| Edit Quantity | Inline +/- buttons |
| Summary | Subtotal, TVA, Total |
| Checkout | "Place Order" CTA (sticky bottom) |

#### 9.12 Retailer — Order Tracking — `/m/shop/orders/:id`

| Section | Components |
|---------|------------|
| Status Tracker | Visual pipeline: Confirmed → Picking → On the way → Delivered |
| ETA | Estimated delivery time |
| Driver Info | Name, phone (tap to call), live location map |
| Order Details | Collapsible item list |
| Invoice | Download link |

### Validation Checklist
- [ ] All mobile pages render correctly at 375px width
- [ ] Bottom tab navigation works per role
- [ ] Touch targets ≥ 44px
- [ ] Signature pad draws correctly
- [ ] Camera button triggers file input
- [ ] Swipe gestures functional
- [ ] RTL: layout mirrored correctly
- [ ] All translations complete
- [ ] Loading/empty/error states on all pages
- [ ] No horizontal scroll on any page

---

## 10. Phase 8 — Advanced SaaS Features

### Goals
- Feature gating per subscription plan
- B2B interconnect UI
- AI recommendations (mock)
- Automation rules
- Advanced notifications

### Pages

#### 10.1 Feature Gate UI

| Component | Purpose |
|-----------|---------|
| `UpgradeBanner` | Shown when user tries to access a locked feature |
| `PlanComparisonModal` | Side-by-side plan features |
| `FeatureGate` | HOC: wraps component, shows `UpgradeBanner` if plan insufficient |

#### 10.2 B2B Interconnect — `/business/b2b`

| Section | Components |
|---------|------------|
| Connected Partners | `DataTable`: partner name, sync status, last sync |
| Incoming Orders | `DataTable`: from partner, items, status |
| Outgoing Orders | `DataTable`: to partner, items, status |
| Setup | `ConnectPartnerModal`: webhook URL, API key |

#### 10.3 Automation Rules — `/business/automation`

| Section | Components |
|---------|------------|
| Rules List | `DataTable`: name, trigger, action, status, last run |
| Create Rule | `AutomationBuilder`: trigger (event) → condition → action |
| Rule Templates | Pre-built: auto-settle, low stock alert, overdue reminder |

#### 10.4 AI Recommendations — `/business/insights`

| Section | Components |
|---------|------------|
| Demand Forecast | `LineChart`: predicted vs actual orders |
| Product Recommendations | Cards: "Customers who buy X also buy Y" |
| Churn Risk | `DataTable`: customers at risk, signals, suggested actions |
| Reorder Suggestions | `DataTable`: product, current stock, forecast demand, suggested reorder qty |

#### 10.5 API Management — `/business/api`

| Section | Components |
|---------|------------|
| API Keys | `DataTable`: key (masked), created, last used, status |
| Generate Key | Modal with scopes selector |
| Usage | `BarChart`: API calls per day |
| Documentation | Link to API docs |

#### 10.6 White Label Settings — `/admin/white-label`

| Section | Components |
|---------|------------|
| Branding | Logo upload, primary color picker, favicon |
| Custom Domain | Domain input, DNS instructions |
| Email Templates | Template editor with variables |

### Validation Checklist
- [ ] Feature gating blocks/upgrades correctly per plan
- [ ] B2B partner connection flow works
- [ ] Automation rules CRUD
- [ ] AI insights render with mock data
- [ ] API key management
- [ ] White label preview
- [ ] All pages responsive + RTL
- [ ] All translations complete

---

## 11. Phase 9 — Optimization & Launch

### Goals
- Performance optimization
- Accessibility audit (WCAG AA)
- SEO meta tags
- Error boundary implementation
- Final QA pass
- Documentation

### Tasks

| Task | Details |
|------|---------|
| **Performance** | Code splitting per route, lazy loading images, bundle analysis, lighthouse score >90 |
| **Accessibility** | Keyboard navigation, screen reader labels, focus management, color contrast AA |
| **SEO** | `<title>` + `<meta description>` per page, `robots.txt`, JSON-LD for landing page |
| **Error Boundaries** | Wrap each route in `ErrorBoundary` with fallback UI |
| **404 Page** | Enhanced with navigation suggestions |
| **Maintenance Mode** | Banner component for scheduled downtime |
| **Analytics Events** | Track page views, CTA clicks, feature usage |
| **Documentation** | Component docs, API docs, deployment guide |

### Validation Checklist
- [ ] Lighthouse performance >90
- [ ] Lighthouse accessibility >90
- [ ] All pages have `<title>` and `<meta description>`
- [ ] Keyboard navigation works on all interactive elements
- [ ] Error boundaries catch and display errors gracefully
- [ ] Bundle size < 500KB gzipped
- [ ] All 58+ pages tested on mobile + desktop
- [ ] All 3 languages verified (no missing keys)
- [ ] RTL layout verified on all pages
- [ ] Dark mode verified on all pages

---

## 12. Page Inventory

Complete list of all pages across the platform:

### Super Admin (`/admin/*`) — 8 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Admin Dashboard | `/admin` | ✅ Exists → Enhance |
| 2 | Tenants | `/admin/tenants` | ✅ Exists → Enhance |
| 3 | Subscriptions | `/admin/subscriptions` | ✅ Exists → Enhance |
| 4 | Accounts | `/admin/accounts` | ❌ Build |
| 5 | Billing | `/admin/billing` | ❌ Build |
| 6 | Audit Logs | `/admin/audit-logs` | ❌ Build |
| 7 | Analytics | `/admin/analytics` | ❌ Build |
| 8 | Settings | `/admin/settings` | ❌ Build |

### Business Manager (`/business/*`) — 26 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Business Dashboard | `/business` | ✅ Exists → Enhance |
| 2 | Products | `/business/products` | ✅ Exists → Enhance |
| 3 | Product Detail | `/business/products/:id` | ❌ Build |
| 4 | Categories | `/business/categories` | ❌ Build |
| 5 | Pricing Rules | `/business/pricing` | ❌ Build |
| 6 | Orders | `/business/orders` | ✅ Exists → Enhance |
| 7 | Create Order | `/business/orders/create` | ❌ Build |
| 8 | Order Detail | `/business/orders/:id` | ❌ Build |
| 9 | Customers | `/business/customers` | ✅ Exists → Enhance |
| 10 | Inventory | `/business/inventory` | ❌ Build |
| 11 | Stock Adjustments | `/business/inventory/adjustments` | ❌ Build |
| 12 | Warehouses | `/business/warehouses` | ❌ Build |
| 13 | Deliveries | `/business/deliveries` | ❌ Build |
| 14 | Delivery Detail | `/business/deliveries/:id` | ❌ Build |
| 15 | Drivers | `/business/drivers` | ❌ Build |
| 16 | Routes | `/business/routes` | ❌ Build |
| 17 | Invoices | `/business/invoices` | ❌ Build |
| 18 | Invoice Detail | `/business/invoices/:id` | ❌ Build |
| 19 | Payments | `/business/payments` | ❌ Build |
| 20 | Accounting | `/business/accounting` | ❌ Build |
| 21 | Reports | `/business/reports` | ❌ Build |
| 22 | Sales Report | `/business/reports/sales` | ❌ Build |
| 23 | Tax Report (G50) | `/business/reports/tax` | ❌ Build |
| 24 | Users | `/business/users` | ❌ Build |
| 25 | Settings | `/business/settings` | ❌ Build |
| 26 | Activity Log | `/business/activity` | ❌ Build |

### Auth — 3 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Login | `/login` | ❌ Build |
| 2 | Forgot Password | `/forgot-password` | ❌ Build |
| 3 | Reset Password | `/reset-password` | ❌ Build |

### Mobile Driver (`/m/driver/*`) — 4 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Driver Home | `/m/driver` | ❌ Build |
| 2 | Route View | `/m/driver/route` | ❌ Build |
| 3 | Delivery Stop | `/m/driver/delivery/:id` | ❌ Build |
| 4 | History | `/m/driver/history` | ❌ Build |

### Mobile Sales Rep (`/m/sales/*`) — 4 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Sales Home | `/m/sales` | ❌ Build |
| 2 | Create Order | `/m/sales/orders/create` | ❌ Build |
| 3 | Customer List | `/m/sales/customers` | ❌ Build |
| 4 | Collections | `/m/sales/collections` | ❌ Build |

### Mobile Retailer (`/m/shop/*`) — 4 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Shop Home | `/m/shop` | ❌ Build |
| 2 | Catalog | `/m/shop/catalog` | ❌ Build |
| 3 | Cart | `/m/shop/cart` | ❌ Build |
| 4 | Order Tracking | `/m/shop/orders/:id` | ❌ Build |

### Advanced SaaS — 5 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | B2B Interconnect | `/business/b2b` | ❌ Build |
| 2 | Automation | `/business/automation` | ❌ Build |
| 3 | AI Insights | `/business/insights` | ❌ Build |
| 4 | API Management | `/business/api` | ❌ Build |
| 5 | White Label | `/admin/white-label` | ❌ Build |

### Utility — 2 pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Landing | `/` | ✅ Exists |
| 2 | Not Found | `*` | ✅ Exists |

**TOTAL: 56 pages** (9 exist, 47 to build)

---

## 13. Component Library Roadmap

### Tier 1 — Foundation (Phase 0)

| Component | Props | Variants | Reuse |
|-----------|-------|----------|-------|
| `DataTable` | `columns, data, pagination, onSort, onFilter, onSelect, isLoading, emptyMessage` | default, compact, selectable, striped | Universal |
| `KPIWidget` | `title, value, change, changeType, icon, format` | trend-up (green), trend-down (red), neutral | Universal |
| `StatusBadge` | `status, variant` | draft, active, confirmed, picking, dispatched, delivered, settled, cancelled, suspended, trial, paid, unpaid, partial, overdue | Universal |
| `EmptyState` | `icon, title, description, actionLabel, onAction` | default, search, filter, error | Universal |
| `ConfirmDialog` | `title, description, confirmLabel, onConfirm, variant` | danger (red), warning (yellow), info (blue) | Universal |
| `PageHeader` | `title, description, breadcrumbs, actions, tabs` | with/without breadcrumb, with/without tabs | Universal |
| `SearchInput` | `placeholder, value, onChange, debounceMs` | default, with-filters | Universal |
| `SkeletonLoader` | `type` | table, card-grid, chart, form, detail | Universal |
| `LanguageSwitcher` | `currentLang, onChange` | dropdown, segmented | Global |
| `ThemeToggle` | none | icon-button | Global |

### Tier 2 — Domain Components (Phases 2-6)

| Component | Props | Variants | Phase |
|-----------|-------|----------|-------|
| `TenantSwitcher` | `tenants, active, onChange` | dropdown | 2 |
| `ActivityTimeline` | `events[]` | compact, detailed | 2 |
| `PlanCard` | `plan, features, price, isCurrent, onSelect` | starter, growth, enterprise | 2 |
| `NotificationBell` | `count, notifications[]` | badge, dropdown | 1 |
| `UserMenu` | `user, onLogout` | avatar-dropdown | 1 |
| `ProductCard` | `product, onAdd, onView` | grid, list | 4 |
| `PricingRuleBuilder` | `segments, units, onSave` | create, edit | 4 |
| `OrderPipeline` | `counts: Record<OrderStatus, number>` | horizontal, vertical | 5 |
| `OrderTimeline` | `transitions[]` | default | 5 |
| `OrderLineEditor` | `products, pricingEngine, onChange` | default | 5 |
| `DeliveryMapCard` | `deliveries[], center` | overview, single | 5 |
| `WarehouseCard` | `warehouse` | default | 4 |
| `InvoicePreview` | `invoice` | default, print | 6 |
| `PaymentForm` | `invoices, onSubmit` | record, reconcile | 6 |
| `AgingChart` | `data[]` | bar | 6 |

### Tier 3 — Mobile Components (Phase 7)

| Component | Props | Variants | Phase |
|-----------|-------|----------|-------|
| `MobileLayout` | `tabs[], activeTab` | driver, sales, retailer | 7 |
| `MobileKPICard` | `title, value, icon` | default | 7 |
| `MobileProductCard` | `product, onAdd` | grid, compact | 7 |
| `MobileOrderCard` | `order` | default | 7 |
| `MobileCustomerCard` | `customer` | default | 7 |
| `MobileCartItem` | `item, onQtyChange, onRemove` | default | 7 |
| `MobileChecklist` | `items[], onCheck` | delivery | 7 |
| `SignaturePad` | `onSave` | default | 7 |
| `PhotoCapture` | `onCapture` | default | 7 |
| `SwipeAction` | `onSwipe, label` | complete, delete | 7 |
| `BottomSheet` | `isOpen, onClose, children` | default, snap-points | 7 |

### Tier 4 — Advanced (Phase 8)

| Component | Props | Variants |
|-----------|-------|----------|
| `FeatureGate` | `requiredPlan, currentPlan, children` | soft (banner), hard (block) |
| `UpgradeBanner` | `feature, requiredPlan` | inline, modal |
| `AutomationBuilder` | `triggers, conditions, actions` | default |
| `PlanComparisonModal` | `plans[], currentPlan` | default |

### Accessibility Notes (All Components)

- All interactive elements: `role`, `aria-label`, `tabIndex`
- All modals: focus trap, `Escape` to close
- All forms: error messages linked via `aria-describedby`
- All tables: `<caption>`, sortable column `aria-sort`
- All charts: `aria-label` with data summary
- Color contrast: 4.5:1 minimum (AA)

---

## 14. Fake API Plan

### API Structure

| Endpoint | Method | Auth | Phase | Pagination | Delay |
|----------|--------|------|-------|------------|-------|
| `/auth/login` | POST | No | 1 | No | 500ms |
| `/auth/logout` | POST | Yes | 1 | No | 200ms |
| `/auth/me` | GET | Yes | 1 | No | 300ms |
| `/auth/forgot-password` | POST | No | 1 | No | 500ms |
| `/auth/reset-password` | POST | No | 1 | No | 500ms |
| `/admin/dashboard` | GET | super_admin | 2 | No | 400ms |
| `/admin/tenants` | GET | super_admin | 2 | Yes | 300ms |
| `/admin/tenants` | POST | super_admin | 2 | No | 500ms |
| `/admin/tenants/:id` | GET | super_admin | 2 | No | 300ms |
| `/admin/tenants/:id` | PATCH | super_admin | 2 | No | 400ms |
| `/admin/tenants/:id` | DELETE | super_admin | 2 | No | 400ms |
| `/admin/subscriptions` | GET | super_admin | 2 | Yes | 300ms |
| `/admin/accounts` | GET | super_admin | 2 | Yes | 300ms |
| `/admin/billing` | GET | super_admin | 2 | Yes | 300ms |
| `/admin/audit-logs` | GET | super_admin | 2 | Yes | 300ms |
| `/admin/analytics` | GET | super_admin | 2 | No | 500ms |
| `/products` | GET | tenant | 4 | Yes | 300ms |
| `/products` | POST | tenant (admin,manager) | 4 | No | 500ms |
| `/products/:id` | GET | tenant | 4 | No | 300ms |
| `/products/:id` | PATCH | tenant (admin,manager) | 4 | No | 400ms |
| `/products/:id/pricing-rules` | GET | tenant | 4 | No | 300ms |
| `/products/:id/pricing-rules` | POST | tenant (admin,manager) | 4 | No | 500ms |
| `/categories` | GET | tenant | 4 | No | 200ms |
| `/pricing/simulate` | POST | tenant | 4 | No | 300ms |
| `/inventory` | GET | tenant | 4 | Yes | 300ms |
| `/inventory/adjustments` | GET | tenant | 4 | Yes | 300ms |
| `/inventory/adjustments` | POST | tenant (admin,manager) | 4 | No | 500ms |
| `/inventory/adjustments/:id/approve` | PATCH | tenant (admin) | 4 | No | 400ms |
| `/warehouses` | GET | tenant | 4 | No | 200ms |
| `/orders` | GET | tenant | 5 | Yes | 300ms |
| `/orders` | POST | tenant (admin,manager,sales) | 5 | No | 500ms |
| `/orders/:id` | GET | tenant | 5 | No | 300ms |
| `/orders/:id/confirm` | PATCH | tenant (admin,manager) | 5 | No | 500ms |
| `/orders/:id/pick` | PATCH | tenant (admin,warehouse) | 5 | No | 400ms |
| `/orders/:id/dispatch` | PATCH | tenant (admin,manager) | 5 | No | 400ms |
| `/orders/:id/deliver` | PATCH | tenant (driver) | 5 | No | 500ms |
| `/orders/:id/settle` | PATCH | tenant (admin,accountant) | 5 | No | 400ms |
| `/orders/:id/cancel` | PATCH | tenant (admin,manager) | 5 | No | 400ms |
| `/deliveries` | GET | tenant | 5 | Yes | 300ms |
| `/deliveries/:id` | GET | tenant | 5 | No | 300ms |
| `/deliveries/:id/proof` | POST | tenant (driver) | 5 | No | 600ms |
| `/drivers` | GET | tenant | 5 | No | 200ms |
| `/routes` | GET | tenant | 5 | No | 400ms |
| `/routes` | POST | tenant (admin,manager) | 5 | No | 500ms |
| `/customers` | GET | tenant | 3 | Yes | 300ms |
| `/customers/:id` | GET | tenant | 3 | No | 300ms |
| `/customers` | POST | tenant (admin,manager,sales) | 3 | No | 500ms |
| `/invoices` | GET | tenant | 6 | Yes | 300ms |
| `/invoices/:id` | GET | tenant | 6 | No | 300ms |
| `/invoices/:id/pdf` | GET | tenant | 6 | No | 800ms |
| `/payments` | GET | tenant | 6 | Yes | 300ms |
| `/payments` | POST | tenant (admin,accountant) | 6 | No | 500ms |
| `/reports/sales` | GET | tenant (admin,manager,accountant) | 6 | No | 600ms |
| `/reports/tax` | GET | tenant (admin,accountant) | 6 | No | 600ms |
| `/reports/inventory` | GET | tenant (admin,manager,warehouse) | 6 | No | 600ms |
| `/users` | GET | tenant (admin,manager) | 3 | Yes | 300ms |
| `/users` | POST | tenant (admin) | 3 | No | 500ms |
| `/users/:id` | PATCH | tenant (admin) | 3 | No | 400ms |
| `/notifications` | GET | tenant | 3 | Yes | 200ms |
| `/notifications/mark-read` | PATCH | tenant | 3 | No | 200ms |

### Mock Data Rules

- **Tenant names:** Algerian businesses (Mama Foods, Atlas Distribution, Sahara Goods, etc.)
- **Product names:** Algerian food products (Couscous, Huile d'Olive, Semoule, etc.)
- **Currency:** DZD with proper formatting (1,200.00 DA)
- **Addresses:** Algerian cities (Alger, Oran, Constantine, Blida, Sétif, Batna, etc.)
- **Phone numbers:** +213 format
- **Languages:** Labels available in FR/AR/EN
- **Dataset sizes:** ≥50 products, ≥100 orders, ≥30 customers, ≥10 drivers, ≥200 invoices
- **Status distribution:** Realistic spread across all statuses
- **Date ranges:** Last 12 months of historical data
- **Edge cases:** Empty tenant (new), maxed-out tenant, suspended tenant, shadow customers, cancelled orders

### Pagination Response Shape

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Response Shape

```typescript
interface ApiError {
  code: string;       // "NOT_FOUND", "FORBIDDEN", "VALIDATION_ERROR"
  message: string;    // Human-readable
  details?: Record<string, string[]>; // Field-level errors
}
```

---

## 15. i18n Plan

### Translation Architecture

```
i18next configuration:
  - Backend: static JSON files
  - Detection: localStorage > browser language > default (fr)
  - Fallback: fr → en
  - Namespaces: per module (reduces bundle)
  - Interpolation: {{ variable }}
  - Pluralization: key_one / key_other
```

### Namespace Map

| Namespace | Keys (approx) | Phase |
|-----------|---------------|-------|
| `common` | 80 | 0 |
| `auth` | 30 | 1 |
| `admin` | 60 | 2 |
| `dashboard` | 40 | 3 |
| `products` | 50 | 4 |
| `inventory` | 40 | 4 |
| `orders` | 60 | 5 |
| `deliveries` | 40 | 5 |
| `customers` | 30 | 3 |
| `invoices` | 40 | 6 |
| `reports` | 35 | 6 |
| `settings` | 30 | 3 |
| `mobile` | 50 | 7 |
| `b2b` | 25 | 8 |
| **Total** | **~610 keys** | |

### RTL Support Plan

| Area | Implementation |
|------|---------------|
| **Layout direction** | `document.dir = lang === 'ar' ? 'rtl' : 'ltr'` |
| **Tailwind RTL** | Use `rtl:` prefix or logical properties (`ms-`, `me-`, `ps-`, `pe-`) |
| **Sidebar** | Flips from left to right |
| **Tables** | Text alignment flips |
| **Icons** | Directional icons (arrows, chevrons) flip |
| **Charts** | X-axis direction unchanged (numbers are universal) |
| **Forms** | Labels right-aligned, inputs right-aligned |
| **Drawers** | Open from left in RTL |
| **Breadcrumbs** | Separator direction flips |
| **Pagination** | Previous/Next arrows flip |

### Currency & Date Formatting

| Locale | Currency | Date Format | Number |
|--------|----------|-------------|--------|
| `fr` | `1 200,00 DA` | `06/12/2024` | `1 200,50` |
| `en` | `1,200.00 DZD` | `12/06/2024` | `1,200.50` |
| `ar` | `١٬٢٠٠٫٠٠ د.ج` | `٠٦/١٢/٢٠٢٤` | `١٬٢٠٠٫٥٠` |

### QA Process

- [ ] Script: scan all TSX files for hardcoded strings (non-i18n)
- [ ] Script: compare EN/FR/AR JSON keys (detect missing)
- [ ] Visual test: each page in all 3 languages
- [ ] RTL overflow test: no horizontal scroll in Arabic
- [ ] Mixed content test: Arabic labels with Latin product names
- [ ] Pluralization test: "1 order" vs "5 orders" in all languages

---

## 16. QA Plan

### Per-Phase QA Checklist

For **every phase**, before marking complete:

| # | Check | Tool |
|---|-------|------|
| 1 | All pages render without errors | Console check |
| 2 | All fake API connections working | Network tab |
| 3 | Loading states display correctly | Throttle network |
| 4 | Empty states display correctly | Empty dataset |
| 5 | Error states display correctly | Force API error |
| 6 | Responsive: mobile (375px) | Viewport resize |
| 7 | Responsive: tablet (768px) | Viewport resize |
| 8 | Responsive: desktop (1280px) | Viewport resize |
| 9 | FR language complete | Switch to FR |
| 10 | AR language complete + RTL | Switch to AR |
| 11 | EN language complete | Switch to EN |
| 12 | Dark mode correct | Toggle theme |
| 13 | Keyboard navigation | Tab through page |
| 14 | Role permissions enforced | Login as each role |
| 15 | No TypeScript errors | `tsc --noEmit` |
| 16 | All tests passing | `vitest run` |

### Role Testing Matrix

| Page Category | admin | manager | warehouse | driver | sales_rep | accountant | retailer |
|---------------|-------|---------|-----------|--------|-----------|------------|----------|
| Admin Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Business Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Products | ✅ | ✅ | ✅(R) | ❌ | ✅(R) | ❌ | ❌ |
| Orders | ✅ | ✅ | ✅(R) | ❌ | ✅ | ✅(R) | ❌ |
| Inventory | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Deliveries | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Driver Mobile | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Sales Mobile | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Retailer Mobile | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*(R) = Read-only access*

---

## 17. Launch Checklist

### Pre-Launch

- [ ] All 56 pages built and functional
- [ ] All 45+ components built with proper props/variants
- [ ] All fake API endpoints returning correct data
- [ ] All 610+ i18n keys translated in FR/AR/EN
- [ ] RTL layout verified on all pages
- [ ] Dark mode verified on all pages
- [ ] Responsive on 375px / 768px / 1280px / 1536px
- [ ] Role-based access enforced on all routes
- [ ] Loading / Empty / Error states on all data pages
- [ ] Keyboard navigation on all interactive elements
- [ ] Color contrast AA on all text
- [ ] `<title>` and `<meta description>` on all pages
- [ ] `robots.txt` configured
- [ ] Error boundaries on all route groups
- [ ] Bundle size < 500KB gzipped
- [ ] Lighthouse performance >90
- [ ] Lighthouse accessibility >90
- [ ] All vitest tests passing
- [ ] No TypeScript errors
- [ ] No console errors/warnings in production build

### Post-Launch (Backend Migration Prep)

- [ ] Fake API → Real API migration plan documented
- [ ] All API response shapes match expected Supabase schema
- [ ] Auth mock → Supabase Auth migration path clear
- [ ] RLS policies drafted for all tables
- [ ] Environment variable strategy for API URLs
- [ ] Feature flags for gradual rollout

---

*End of roadmap. This document should be treated as the single source of truth for frontend development planning.*
