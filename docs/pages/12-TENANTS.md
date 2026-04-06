# Tenant Management

## Routes
- `/tenants` — Tenant list (admin only)
- `/tenants/:id` — Tenant detail (admin only)

## Tenant List

### UI Components
- **PageWrapper** with breadcrumbs
- **Stats row** (4): Total, Active, Trial, Suspended
- **Filters** (5): Search (name/owner/email), Status, Plan, Type, Wilaya
- **Action buttons**: Export CSV, Create new tenant
- **Sortable table**: Name + type icon, wilaya, owner + email, plan badge, status badge, usage quotas, created date, actions (view/toggle status)
- **CreateTenantDrawer**: Form for new tenant creation

### Sorting
Sortable columns: name, createdAt, usersCount, productsCount (toggle asc/desc)

### Export
CSV export of filtered tenants with all fields

## Tenant Detail

### UI Components
- **PageWrapper** with breadcrumbs
- **Info card**: Type icon, plan badge, status badge, key fields (owner, email, wilaya, created date)
- **Quota progress bars**: Users used/limit, Products used/limit (color-coded: green < 70%, amber 70-90%, red > 90%)
- **Subscription details**: Plan, pricing, billing dates
- **Activity feed**: Recent activities filtered for this tenant

## Data
- `MOCK_WMS_INSTANCES` + `MOCK_SUBSCRIPTIONS` from `platform.mock.ts`
- Instance types: `supplier`, `warehouse`, `logistics`
- Plans: `free`, `starter`, `pro`, `enterprise`
- Statuses: `active`, `suspended`, `trial`

## Improvements
- [ ] Inline plan upgrade/downgrade
- [ ] Suspend/reactivate with reason and notification
- [ ] Tenant usage analytics
- [ ] Custom feature flags per tenant
- [ ] Data export per tenant
- [ ] Tenant impersonation (login as)
