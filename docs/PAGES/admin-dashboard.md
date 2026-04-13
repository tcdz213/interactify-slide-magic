# Admin Dashboard

## Route
`/admin`

## Status
- Complete: 65%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Read-only mock data
- API Status: ❌ Fake API only
- Production Ready: No

## Purpose
Platform-wide overview for super admins showing tenant metrics, MRR, revenue charts, alerts, and recent tenants.

## Existing Features
- 4 KPI stat cards (Total Tenants, MRR, Total Users, Total Orders)
- Revenue bar chart (6 months)
- Alerts panel (trial expiring, payment failed, new signup, milestone)
- Recent tenants table (6 rows)

## Existing UI
- StatCard components with trends
- BarChart (Recharts) with themed colors
- Alert cards with colored borders
- Table with status badges (TenantStatusBadge, PlanBadge)

## Existing User Actions
- View dashboard data (read-only)
- No interactive actions

## Frontend Logic Review
- **State**: `useState` for stats, tenants, revenue
- **Validation**: None
- **Loading**: ✅ Pulse animation while loading
- **Errors**: ❌ No error handling on fetch failure
- **Responsive**: ✅ Grid: md:2 lg:4 for KPIs, lg:5 for chart/alerts
- **i18n**: ✅ Full i18n with `useTranslation()`
- **RTL**: ✅ Layout supports RTL
- **Permissions**: ❌ No auth check — anyone can access `/admin`

## Backend/API Needed
- `GET /admin/stats` — Platform statistics
- `GET /admin/tenants?limit=6` — Recent tenants
- `GET /admin/revenue?months=6` — Revenue chart data
- `GET /admin/alerts` — Active alerts

## Missing Features
- [ ] Real-time data refresh
- [ ] Date range selector
- [ ] Click-through on tenant rows to detail
- [ ] Clickable alerts with resolution actions
- [ ] Export dashboard as PDF
- [ ] Comparison metrics (vs previous period)
- [ ] Tenant health score

## UX Improvements
- [ ] Add date range picker for chart
- [ ] Add tooltip on stat cards
- [ ] Make table rows clickable → tenant detail
- [ ] Add loading skeleton (not just pulse text)

## Security Notes
- ❌ No authentication required to access
- ❌ Alerts are hardcoded, not from real data

## Performance Notes
- ✅ Uses lazy loading
- ⚠️ Fetches all tenants then slices to 6 — should paginate
- ⚠️ Uses `useEffect` instead of React Query

## Priority Tasks
- **Critical**: Add auth guard
- **High**: Connect to real API
- **Medium**: Add date range, interactivity
- **Low**: Export, health scores

## Final Score
**65/100**
