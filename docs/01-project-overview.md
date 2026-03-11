# Phase 1 — Project Overview

---

## 1. What the Application Does

**Jawda WMS** is a **multi-tenant SaaS Warehouse Management System (WMS)** and **ERP-lite platform** designed for **all types of B2B distribution warehouses (entrepôts)** in Algeria and similar markets. It is **sector-agnostic** and supports warehouses across all industries including construction materials (BTP), agro-food, electronics, pharmaceuticals, general distribution, retail, and more.

It provides end-to-end operational management covering:

- **Warehouse operations**: Inventory, receiving (GRN), putaway, picking, packing, shipping, cycle counts, stock adjustments, transfers, quality control, lot/batch & serial tracking, cross-docking, kitting, repacking, and stock blocking.
- **Procurement**: Purchase orders, vendor management, supplier contracts, 3-way matching, vendor scorecards, and a **bidirectional supplier-warehouse connection system** with invitation workflows.
- **Sales & Distribution**: Sales orders, customer management, route planning, delivery trip management, invoicing, payments, credit notes, and pricing management.
- **Accounting & Finance**: Invoices, payments, payment runs, bank reconciliation, chart of accounts, budget/cost centers, GRNI reports, and stock valuation (FIFO/PMP).
- **Business Intelligence**: Performance dashboards, profitability analysis, category distribution, alert management, and a custom report builder.
- **Multi-WMS Instance Architecture**: Each tenant operates in its own isolated WMS instance with independent data, supporting multiple warehouses per tenant.

The platform also provides **4 specialized mobile/portal applications** for different user personas (see below).

---

## 2. Main Goal

To provide a **comprehensive, role-based, multi-tenant warehouse and distribution management platform** that:

1. Enables warehouse operators (entrepôts) of all types to manage full inventory lifecycle from procurement to delivery.
2. Allows suppliers (fournisseurs) to connect with warehouses, receive purchase orders, and track fulfillment.
3. Gives customers (clients) a self-service portal to place orders, track deliveries, and manage payments.
4. Provides delivery drivers a mobile-optimized app for trip management, proof of delivery, and cash collection.
5. Offers field sales agents a mobile app for customer visits, order taking, and route management.
6. Gives platform owners a super-admin dashboard to manage all tenant subscriptions, onboarding, and monitoring.

> **Current state**: Frontend-only with mock data persisted in `localStorage`. No real backend/API — designed to be connected to a real backend in a future phase.

---

## 3. Target Users

The platform targets **B2B distribution companies and warehouses (entrepôts) across all sectors in Algeria and similar markets**, including construction materials (BTP), agro-food, electronics, pharmaceuticals, and general distribution. Specific user groups:

| User Group                          | Description                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| **Warehouse Owners / CEOs**         | Company directors who need full visibility over operations, finances, and governance |
| **Operations Directors**            | Manage logistics, warehouse workflows, and operational KPIs                          |
| **Finance Directors / Accountants** | Handle invoicing, payments, budgets, and financial reporting                         |
| **Warehouse Managers**              | Day-to-day warehouse operations: receiving, putaway, inventory, shipping             |
| **QC Officers**                     | Quality control inspections, claims, and compliance checks                           |
| **Supervisors / Operators**         | Floor-level workers: picking, packing, counting, receiving                           |
| **Delivery Drivers**                | Mobile app for trip execution, proof of delivery, cash collection                    |
| **Sales Agents (Mobile)**           | Field sales reps: customer visits, order taking, route planning                      |
| **Suppliers**                       | External vendors who connect with warehouses, receive POs, and track fulfillment     |
| **Customers (Portal)**              | End-clients who place orders, view invoices, and track deliveries                    |
| **Platform Owner**                  | SaaS super-admin managing all tenant subscriptions and system health                 |

---

## 4. Applications

| Application                | Route Prefix                                                        | Description                                                                                          | Target Users                                                                   |
| -------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Admin Dashboard (Web)**  | `/` , `/wms/*`, `/sales/*`, `/accounting/*`, `/bi/*`, `/settings/*` | Full ERP/WMS web application with sidebar navigation. Core operational interface.                    | CEO, Directors, Managers, QC, Accountants, BI Analysts, Supervisors, Operators |
| **Multi-WMS Instance App** | `/i/:instanceId/*`                                                  | Tenant-isolated WMS views within the multi-instance architecture                                     | All warehouse users (scoped to their tenant)                                   |
| **Supplier Portal (Web)**  | `/my/*` (inside admin layout)                                       | Supplier-specific views for products, orders, invoices, stats, and profile                           | Supplier users                                                                 |
| **Supplier Mobile App**    | `/supplier/*`                                                       | Mobile-optimized supplier portal with bottom navigation                                              | Supplier users (mobile)                                                        |
| **Client Portal**          | `/portal/*`                                                         | Customer self-service: place orders, view invoices, track deliveries, statements                     | Customers / Clients                                                            |
| **Mobile Sales App**       | `/mobile/*`                                                         | Field sales agent app: customer list, new orders, order history, route map, offline queue            | Sales Agents (mobile)                                                          |
| **Delivery Driver App**    | `/delivery/*`                                                       | Driver app: daily trips, stop details, proof of delivery, cash collection, vehicle checks, incidents | Delivery Drivers                                                               |
| **Owner Dashboard**        | `/owner/*`                                                          | Platform super-admin: subscriptions, billing, monitoring, onboarding, support                        | Platform Owner                                                                 |

---

## 5. User Types (Roles)

| Role                       | Code               | Level | Description                                                                                     |
| -------------------------- | ------------------ | ----- | ----------------------------------------------------------------------------------------------- |
| **Platform Owner**         | `PlatformOwner`    | 0     | SaaS super-admin — manages all tenants, subscriptions, system configuration                     |
| **CEO / Director General** | `CEO`              | 0     | Company-level full access — all warehouses, full approval authority, all governance permissions |
| **Finance Director**       | `FinanceDirector`  | 1     | Financial oversight — invoices, payments, budgets, approval up to 5% variance                   |
| **Operations Director**    | `OpsDirector`      | 1     | Logistics & operations oversight — all warehouses, approval up to 5% variance                   |
| **Regional Manager**       | `RegionalManager`  | 2     | Multi-site supervision — manages subset of warehouses, approval up to 2%                        |
| **Warehouse Manager**      | `WarehouseManager` | 3     | Single warehouse management — inventory, receiving, shipping, approval up to 2%                 |
| **QC Officer**             | `QCOfficer`        | 3     | Quality control — inspections, claims, compliance checks, can span multiple sites               |
| **Accountant**             | `Accountant`       | 3     | Financial operations — invoicing, payments, data export                                         |
| **BI Analyst**             | `BIAnalyst`        | 3     | Business intelligence — reporting, dashboards, analytics                                        |
| **Supervisor**             | `Supervisor`       | 4     | Team lead — floor-level supervision, no approval authority                                      |
| **Operator**               | `Operator`         | 5     | Warehouse worker — receiving, counting, picking, packing                                        |
| **Driver**                 | `Driver`           | 5     | Delivery driver — assigned to specific warehouse, delivery execution                            |
| **Supplier**               | `Supplier`         | 6     | External vendor — product catalog, order fulfillment, connection management                     |

### Permission Model (3 Layers + Multi-WMS)

1. **Layer 1 — Role Permissions**: What actions a user type can perform (CRUD on documents)
2. **Layer 2 — Operational Scope**: Which warehouses the user can access (`"all"` or specific IDs)
3. **Layer 3 — Governance**: System-level capabilities (SYSTEM_ADMIN, MANAGE_USERS, MANAGE_ROLES, SYSTEM_CONFIG, AUDIT_LOG, DATA_EXPORT, EDITION_CONTROL)
4. **Layer 4 — Multi-WMS Instance**: Tenant-based isolation — users only see their tenant's WMS instance

---

## 6. Multi-Tenant Architecture

The system supports **8 tenants** organized as:

| Tenant ID | Name                         | Type        | Sector                       | City      |
| --------- | ---------------------------- | ----------- | ---------------------------- | --------- |
| T-ENT-01  | Alger Construction Materials | Entrepôt    | BTP / Construction Materials | Alger     |
| T-ENT-02  | Blida General Distribution   | Entrepôt    | General Distribution         | Blida     |
| T-ENT-03  | Boumerdes Electronics Hub    | Entrepôt    | Electronics / Technology     | Boumerdes |
| T-ENT-04  | Alger General Distribution   | Entrepôt    | General Distribution         | Alger     |
| T-ENT-05  | Blida Construction Supply    | Entrepôt    | BTP / Construction Materials | Blida     |
| T-FRN-01  | Condor Distribution          | Fournisseur | Distribution B2B             | Alger     |
| T-FRN-02  | Agro Sahel                   | Fournisseur | Food & Beverages             | —         |
| T-FRN-03  | TechParts                    | Fournisseur | Electronics                  | —         |

Each tenant has its own WMS instance, user set, and warehouse(s). **35 total users** across all tenants.

> **Note**: While the system supports all warehouse types (construction materials, electronics, general distribution, agro-food, etc.), it is **not specifically tailored to any single industry**. Quality control features, compliance tracking, and operational workflows are flexible and can be adapted to any sector's requirements.

---

## 7. Technology Stack

| Layer                | Technology                                                                 |
| -------------------- | -------------------------------------------------------------------------- |
| Framework            | React 18 + TypeScript                                                      |
| Build Tool           | Vite                                                                       |
| Styling              | Tailwind CSS + shadcn/ui components                                        |
| Routing              | React Router DOM v6                                                        |
| State Management     | React Context (AuthContext, WMSDataContext, InstanceContext, ThemeContext) |
| Data Persistence     | localStorage (mock data with versioning)                                   |
| Internationalization | i18next (English, French, Arabic)                                          |
| Charts               | Recharts                                                                   |
| Animations           | Framer Motion                                                              |
| Maps                 | Leaflet                                                                    |
| PDF Export           | jsPDF + jspdf-autotable                                                    |
| Forms                | React Hook Form + Zod validation                                           |
| PWA                  | vite-plugin-pwa                                                            |
