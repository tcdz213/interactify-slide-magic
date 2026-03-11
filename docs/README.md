# Jawda WMS — Technical Documentation Index

> Complete technical reference for the Jawda WMS multi-tenant SaaS platform. 6 documents covering architecture, features, data, and backend migration planning.

---

## Documents

| # | Document | Description | Lines |
|---|----------|-------------|-------|
| 1 | [Project Overview](./01-project-overview.md) | What the app does, target users, tech stack, multi-tenant architecture, 6 layout shells, 4 specialized portals | 136 |
| 2 | [Frontend Structure](./02-frontend-structure.md) | Layouts, routing (90+ routes), sidebar navigation, guards (RBAC, Admin, Financial), shared components, state management | 531 |
| 3 | [Page Features](./03-page-features.md) | Detailed inventory of every page: UI components, user actions, data sources, across 22 functional domains | 997 |
| 4 | [User Flows](./04-user-flows.md) | 30+ step-by-step journeys for each role: CEO, buyer, warehouse operator, driver, sales agent, supplier, customer, platform owner | 553 |
| 5 | [Mock Data Structure](./05-mock-data.md) | Data architecture, 14 entity schemas, persistence via `localStorage`, unit conversions, currency/locale, seasonal patterns | 413 |
| 6 | [Future Backend Mapping](./06-backend-mapping.md) | Migration plan: ~52 PostgreSQL tables, 12 edge functions, 4 storage buckets, RLS patterns, seeding strategy | 321 |
| 7 | [Testing Strategy](./07-testing-strategy.md) | Test suite structure: 47 files, tooling (Vitest/RTL), patterns, coverage matrix, fixtures, naming conventions | 230 |

---

## Quick Reference

### Tech Stack
React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · React Router 6 · React Query · Framer Motion · i18next (FR/EN/AR) · Recharts · Leaflet · jsPDF

### Key Numbers
- **57 products** across 4 sectors (Construction, Agroalimentaire, Technologie, Électricité)
- **8 vendors**, **9 warehouses**, **20 customers**, **35 users**, **8 tenants**
- **13 user roles** with RBAC enforcement
- **90+ pages** organized in 6 layout shells
- **33 persisted data arrays** in `WMSDataContext`
- **Currency**: DZD (Algerian Dinar), 19% TVA

### Architecture At-a-Glance
```
src/
├── app/           Routes & guards
├── components/    Global UI (sidebar, topbar, dialogs)
├── contexts/      Auth, WMSData, Theme, Instance, FinancialTracking
├── data/          Mock data (masterData, transactional, operational, historical)
├── features/      Feature modules (dashboard)
├── modules/       Domain modules (products, pricing, sales, client-types)
├── pages/         Route page components (wms/, sales/, settings/, accounting/, bi/)
├── shared/        Reusable components (DataTable, PageShell, FilterBar, ChartCard)
├── lib/           Business logic engines (FIFO, PMP, FX, transfer, 3-way match)
├── services/      Audit, offline sync, CRUD, push notifications
├── delivery/      Driver mobile app
├── mobile/        Sales agent mobile app
├── portal/        Customer self-service portal
├── supplier/      Supplier mobile portal
├── owner/         Platform owner super-admin
├── wms/           Multi-WMS instance components & core services
└── i18n/          FR/EN/AR translations
```

---

*Last updated: 2026-03-10*
