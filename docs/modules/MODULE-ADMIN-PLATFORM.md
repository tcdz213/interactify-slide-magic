# Module: Admin Platform (SaaS Management)

## Overview
Super-admin panel for managing the multi-tenant SaaS platform. Controls tenants, accounts, billing, analytics, audit trail, and platform configuration.

## Pages
- `/dashboard` (admin) — Platform KPIs, revenue chart, top tenants
- `/tenants` — Tenant list with filters, sorting, CSV export
- `/tenants/:id` — Tenant detail with quota tracking
- `/plans` — Subscription plan management with feature comparison
- `/accounts` — User account management with role assignment
- `/accounts/:id` — Account detail
- `/billing` — MRR/ARR dashboard, revenue by plan, invoice tracking
- `/audit` — Audit trail with 14 event types, severity filtering
- `/analytics` — Platform analytics (MRR, churn, ARPU, geographic)
- `/notifications` — Notification center with priority system
- `/settings` — Platform configuration (currency, language, maintenance)

## Tenant Model
```ts
{
  id, name, type: "supplier" | "warehouse" | "logistics",
  plan: "free" | "starter" | "pro" | "enterprise",
  status: "active" | "trial" | "suspended",
  owner, ownerEmail, wilaya, 
  usersCount, productsCount, ordersCount,
  createdAt
}
```

## Subscription Model
```ts
{
  instanceId, plan, monthlyPrice,
  usersUsed, usersLimit, productsUsed, productsLimit,
  startDate, renewalDate, status
}
```

## Key Metrics
- MRR, ARR, ARPU, Churn Rate, Trial→Paid Conversion, DAU/MAU

## Missing Features
- [ ] Tenant impersonation (login-as)
- [ ] Automated billing integration
- [ ] SLA monitoring
- [ ] Feature flag management per tenant
- [ ] Tenant data backup/restore
- [ ] API usage metering
- [ ] White-label configuration per tenant
- [ ] Onboarding wizard for new tenants
