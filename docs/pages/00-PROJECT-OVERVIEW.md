# Jawda — Project Overview

## What is Jawda?

**Jawda** is a multi-tenant SaaS platform for **Warehouse Management (WMS)** and **ERP** operations, targeting the Algerian market. It supports multiple business types (suppliers, warehouses, logistics) with role-based access, multi-language (FR/EN/AR with RTL), and Algerian fiscal compliance (DZD, TVA 9%/19%, NIF/NIS/RC/AI).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript 5 + Vite 5 |
| Styling | Tailwind CSS v3 + shadcn/ui components |
| Routing | React Router v6 (nested layout routes) |
| State | React Context (Auth) + local component state |
| i18n | i18next (FR/EN/AR namespaced JSON files) |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Data | In-memory mock API (fakeApi/) with service layer abstraction |
| Testing | Vitest + Testing Library |

## Architecture

```
src/
├── components/        # Reusable UI (admin/, layout/, orders/, products/, shared/, users/)
├── contexts/          # AuthContext (mock auth with localStorage persistence)
├── fakeApi/           # Mock data + CRUD operations (products, orders, invoices, etc.)
├── lib/               # Utilities (i18n, featureFlags, healthCheck, utils)
├── locales/           # i18n JSON files (en/, fr/, ar/)
├── mock/              # Static mock data (users, admin, audit, billing, plans, platform)
├── pages/             # Route-level page components
│   ├── admin/         # Platform admin pages (10 pages)
│   └── *.tsx          # Operational pages (12 pages)
├── services/          # Service layer abstracting mock/real API calls
└── App.tsx            # Route definitions + auth guard
```

## User Roles

| Role | Menu Access | Description |
|------|------------|-------------|
| `admin` | Full platform + operational | Platform owner, manages tenants, billing, settings |
| `warehouse` | Dashboard, Inventory, Orders, Deliveries, Suppliers | Warehouse operator |
| `driver` | Dashboard, Deliveries | Delivery driver |
| `trader` | Dashboard, Products, Orders, Invoices, Accounting, Suppliers | Supplier/trader |
| `sales` | Dashboard, Orders, Deliveries | Sales representative |
| `support` | Dashboard, Orders, Invoices | Customer support |

## Authentication

- Mock-based: matches email against `MOCK_USERS` array
- Persisted in `localStorage` under `derfta_user`
- `ProtectedRoute` component redirects to `/login` if not authenticated
- Demo login buttons on login page for quick role switching

## Multi-Tenancy

- Platform supports multiple WMS instances (tenants)
- Each tenant has: type (supplier/warehouse/logistics), plan (free/starter/pro/enterprise), status, quotas
- Admin manages tenants, accounts, subscriptions from dedicated pages

## Currency & Locale

- Primary currency: **DZD** (Dinar Algérien)
- Formatting: `fr-DZ` locale, suffix "DA"
- TVA rates: 9% (food/agriculture) and 19% (standard)
- Fiscal identifiers: NIF, NIS, RC, AI (Algerian tax compliance)

## Route Map

| Route | Page | Role Access |
|-------|------|------------|
| `/login` | Login | Public |
| `/dashboard` | Smart Dashboard (admin vs operational) | All authenticated |
| `/products` | Products CRUD | trader |
| `/inventory` | Stock management (4 tabs) | warehouse |
| `/orders` | Order list + create | trader, warehouse, sales, support |
| `/orders/:id` | Order detail + status transitions | Same |
| `/invoices` | Invoice list | trader, support |
| `/invoices/:id` | Invoice detail (printable) | Same |
| `/deliveries` | Delivery list | warehouse, driver, sales |
| `/deliveries/:id` | Delivery detail + POD + returns | Same |
| `/accounting` | Journal, Balance, P&L, Chart of Accounts | trader |
| `/suppliers` | Supplier management (4 tabs) | warehouse, trader |
| `/suppliers/:id` | Supplier detail | Same |
| `/users` | Platform users (admin only) | admin |
| `/tenants` | Tenant list | admin |
| `/tenants/:id` | Tenant detail | admin |
| `/plans` | Plans & pricing management | admin |
| `/accounts` | Platform accounts | admin |
| `/accounts/:id` | Account detail | admin |
| `/billing` | Billing dashboard (MRR, ARR, invoices) | admin |
| `/audit` | Audit logs | admin |
| `/analytics` | Platform analytics | admin |
| `/notifications` | Notification center | admin |
| `/settings` | Platform settings | admin |
