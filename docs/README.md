# JAWDA — Documentation Audit Hub

> Generated: 2026-04-12 | Audit Version: 1.0

## Project Overview

**JAWDA** is a multi-tenant B2B distribution SaaS platform built with React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It serves four user audiences through distinct portals:

| Portal | Route Prefix | Target User |
|--------|-------------|-------------|
| Landing | `/` | Visitors |
| Super Admin | `/admin/*` | Platform operators |
| Business Manager | `/business/*` | Tenant managers |
| Mobile Driver | `/m/driver/*` | Delivery drivers |
| Mobile Sales | `/m/sales/*` | Sales representatives |

## Documentation Index

| File | Description |
|------|-------------|
| [CURRENT_ADVANCEMENT.md](./CURRENT_ADVANCEMENT.md) | Page-by-page completion status |
| [GLOBAL_GAP_ANALYSIS.md](./GLOBAL_GAP_ANALYSIS.md) | Missing features, workflows, integrations |
| [ROADMAP.md](./ROADMAP.md) | Phased production readiness plan |
| [API_REQUIREMENTS.md](./API_REQUIREMENTS.md) | Full REST API specification |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Security vulnerabilities & recommendations |
| [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md) | Performance analysis & optimizations |
| [UX_AUDIT.md](./UX_AUDIT.md) | UX/accessibility gaps |
| [PAGES/](./PAGES/) | Individual page audits (40+ files) |

## Tech Stack

- **Frontend**: React 18 + TypeScript 5 + Vite 5
- **Styling**: Tailwind CSS 3 + shadcn/ui + CSS variables
- **Routing**: React Router 6 (lazy-loaded)
- **State**: TanStack Query + React useState
- **Charts**: Recharts
- **i18n**: i18next (EN/FR/AR with RTL)
- **Data**: Fake API (in-memory mock data, no real backend)

## Key Architecture Decisions

1. **No real backend** — All data is mock/in-memory. No Supabase, no REST API, no persistence.
2. **No authentication** — Login page exists in fake-api but no auth guards on routes.
3. **No RBAC enforcement** — Roles defined in types but not enforced on UI routes.
4. **Lazy loading** — All page components are lazy-loaded with Suspense.
5. **Error boundaries** — Global ErrorBoundary wraps all routes.
6. **Multi-language** — i18n setup with FR/EN/AR, partial coverage (~33%).
