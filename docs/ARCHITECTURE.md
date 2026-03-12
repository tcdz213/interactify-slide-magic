# WMS / ERP SaaS Platform — Architecture Overview

## 1. System Vision

A **multi-tenant WMS/ERP SaaS platform** serving two company archetypes within the same ecosystem:

| Archetype                  | Role                                  | Examples     |
| -------------------------- | ------------------------------------- | ------------ |
| **Supplier (Fournisseur)** | Produces or distributes goods         | Supplier 1–5 |
| **Depot (Entrepôt)**       | Buys, stores, sells/distributes goods | Depot 1–10   |

Both share the same application codebase; data is isolated per **company_id** (tenant).

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                   SaaS Platform                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Auth &   │  │Subscript.│  │  Platform Owner  │   │
│  │  Billing  │  │  Engine  │  │  Admin Portal    │   │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │                 │             │
│  ┌────▼──────────────▼─────────────────▼──────────┐  │
│  │              Tenant Isolation Layer             │  │
│  │         (company_id on every table)             │  │
│  └────┬───────────────────────────────────────┬───┘  │
│       │                                       │      │
│  ┌────▼────────────┐          ┌───────────────▼───┐  │
│  │  Supplier WMS   │◄────────►│   Depot WMS       │  │
│  │  Instance(s)    │  Orders  │   Instance(s)     │  │
│  └─────────────────┘          └───────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 3. Tenant Model

### 3.1 Company (Tenant)

Every company on the platform is a **tenant**. The `company_id` field on all data tables ensures strict isolation.

```
Company
├── id (UUID)
├── name
├── type: "supplier" | "depot"
├── status: "active" | "trial" | "suspended" | "cancelled"
├── subscription_plan_id (FK)
├── onboarded_at
└── settings (JSON — language, currency, timezone, country)
```

### 3.2 Multi-Instance (WMS Instances)

A single company may operate **multiple warehouses**, each modeled as a **WMS Instance**:

```
WMSInstance
├── id (slug)
├── company_id (FK → Company)
├── name / code
├── type: "warehouse" | "supplier"
├── warehouse_ids[]
├── features[] (enabled modules)
├── status
└── config (language, timezone, currency)
```

---

## 4. Subscription & Billing

Each company must purchase a plan **before** accessing the system.

| Plan       | Max Users | Max Warehouses | Price Model     |
| ---------- | --------- | -------------- | --------------- |
| Trial      | 3         | 1              | Free / 14 days  |
| Standard   | 10        | 2              | Monthly         |
| Pro        | 25        | 5              | Monthly         |
| Enterprise | Unlimited | Unlimited      | Yearly / Custom |

**Enforcement rules:**

- `max_users`: Block user creation when limit reached.
- `max_warehouses`: Block warehouse creation when limit reached.
- `status = suspended`: Read-only access, no mutations.
- `status = cancelled`: No access.

---

## 5. User Roles & RBAC

### 5.1 Platform-Level Roles

| Role          | Scope  | Description                        |
| ------------- | ------ | ---------------------------------- |
| PlatformOwner | Global | SaaS operator, manages all tenants |

### 5.2 Company-Level Roles

| Role                | Scope           | Description                       |
| ------------------- | --------------- | --------------------------------- |
| CEO                 | Company         | Full access, manages subscription |
| Admin / SystemAdmin | Company         | User & config management          |
| OpsDirector         | Company         | Operations oversight              |
| FinanceDirector     | Company         | Financial modules                 |
| RegionalManager     | Multi-warehouse | Cross-warehouse reporting         |
| WarehouseManager    | Warehouse       | Single warehouse operations       |
| PurchaseManager     | Company         | Purchase orders, suppliers        |
| SalesManager        | Company         | Sales orders, customers           |
| Worker              | Warehouse       | Picking, packing, receiving       |
| Driver              | Routes          | Delivery operations               |
| Auditor             | Company         | Read-only audit access            |

### 5.3 RBAC Implementation

Roles are stored in a **separate `user_roles` table** (never on the profile):

```sql
CREATE TYPE app_role AS ENUM ('CEO', 'Admin', 'WarehouseManager', ...);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  role app_role NOT NULL,
  UNIQUE (user_id, company_id, role)
);
```

---

## 6. Core Modules

```
┌─────────────────────────────────────────────┐
│              Platform Modules                │
├─────────────┬───────────────┬───────────────┤
│ Auth        │ Subscriptions │ Companies     │
├─────────────┼───────────────┼───────────────┤
│ Users       │ Warehouses    │ Products      │
├─────────────┼───────────────┼───────────────┤
│ Inventory   │ Suppliers     │ Purchase Ord. │
├─────────────┼───────────────┼───────────────┤
│ Sales Ord.  │ Shipments     │ Reports / BI  │
├─────────────┼───────────────┼───────────────┤
│ Quality     │ Returns       │ Accounting    │
├─────────────┼───────────────┼───────────────┤
│ Lot/Batch   │ Serial #s     │ Cycle Count   │
└─────────────┴───────────────┴───────────────┘
```

---

## 7. Cross-Tenant Interactions

### Supplier ↔ Depot Connection

Depots can **connect** to suppliers on the platform. This creates a B2B link:

```
Connection
├── id
├── requesting_company_id (Depot)
├── target_company_id (Supplier)
├── status: "pending" | "active" | "rejected" | "disconnected"
├── connected_at
└── permissions (catalog_access, order_create, etc.)
```

### Purchase Flow (Cross-Tenant)

```
Depot                          Supplier
  │                               │
  ├──► Create Purchase Order ────►│
  │                               ├──► Review & Accept
  │                               ├──► Prepare Goods
  │◄── Shipment Notification ◄────┤
  ├──► Receive Goods (GRN)        │
  ├──► Quality Control             │
  ├──► Putaway                     │
  └──► Inventory Updated           │
```

---

## 8. Technology Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | React 18 + TypeScript + Vite             |
| UI             | Tailwind CSS + shadcn/ui + Framer Motion |
| Routing        | React Router v6                          |
| State          | React Context + TanStack Query           |
| Backend        | rest api expressjs                       |
| Database       | PostgreSQL                               |
| Auth           | rest api expressjs Auth                  |
| Storage        | rest api expressjs Storage               |
| Edge Functions | rest api expressjs Edge Functions (Deno) |
| i18n           | i18next (fr, en, ar)                     |

---

## 9. Data Isolation Strategy

Every query MUST be scoped by `company_id`:

```typescript
// QueryBuilder enforces scope on every data access
const qb = createQueryBuilder<Product>({
  instanceId: "depot-alger",
  tenantId: "company-123",
  warehouseId: "wh-001",
});

const products = qb.filter(allProducts);
// → Only returns products belonging to company-123
```

**RLS (Row-Level Security)** at the database level ensures no data leakage even if application logic fails.

---

## 10. Deployment Architecture

```
                    ┌─────────────┐
                    │   CDN Edge  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  SPA (Vite) │
                    └──────┬──────┘
                           │
              ┌────────────▼───────────────┐
              │ restapi expressjs (Backend)│
              ├─────────┬──────────────────┤
              │ Auth    │ Edge Functions   │
              ├─────────┼──────────────────┤
              │ PostGIS │ Realtime         │
              ├─────────┼──────────────────┤
              │ Storage │ Webhooks         │
              └─────────┴──────────────────┘
```
