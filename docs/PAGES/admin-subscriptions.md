# Admin Subscriptions

## Route
`/admin/subscriptions`

## Status
- Complete: 55%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Read-only
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Monitor subscription health — MRR, active subscriptions, trials, and manage plan changes.

## Existing Features
- 3 KPI cards (Total MRR, Active Subscriptions, Active Trials)
- Subscription table with plan/status badges
- "Manage" button per row (non-functional)

## Existing UI
- StatCard components
- Table: company, plan, status, MRR, since, actions
- PlanBadge, SubStatusBadge components

## Existing User Actions
- ✅ View subscriptions
- ❌ Upgrade/downgrade plan
- ❌ Cancel subscription
- ❌ Extend trial
- ❌ Apply discount

## Frontend Logic Review
- **State**: `useState` for tenants
- **i18n**: ✅ Translated
- **Loading**: ❌ No loading state
- **Errors**: ❌ No error handling
- **Permissions**: ❌ No auth guard

## Backend/API Needed
- `GET /admin/subscriptions`
- `PUT /admin/subscriptions/:id/upgrade`
- `PUT /admin/subscriptions/:id/cancel`
- `POST /admin/subscriptions/:id/extend-trial`

## Missing Features
- [ ] Plan change dialog
- [ ] Cancel subscription with reason
- [ ] Trial extension
- [ ] Revenue charts over time
- [ ] Churn prediction
- [ ] Discount/coupon management
- [ ] Pagination and filters

## Priority Tasks
- **Critical**: Auth guard, plan management CRUD
- **High**: Revenue trends
- **Medium**: Trial management
- **Low**: Churn prediction

## Final Score
**55/100**
