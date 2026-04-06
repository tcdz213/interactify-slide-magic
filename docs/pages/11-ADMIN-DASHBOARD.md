# Admin Dashboard

## Route
`/dashboard` (when user role = `admin`)

## UI Components
- **Header**: Crown icon + title + personalized subtitle
- **PlatformKpiCards**: Key metrics (tenants, MRR, active users, etc.)
- **RevenueChart** (line/bar): Revenue history over time (2/3 width)
- **PlanDistributionChart** (pie): Tenant distribution by plan (1/3 width)
- **AdminAlertsWidget**: Critical alerts requiring attention
- **AdminActivityFeed**: Recent platform activities
- **TopTenantsTable**: Top revenue-generating tenants

## Data Sources
All from `admin-dashboard.service.ts`:
- `getAdminKpis()`, `getRevenueHistory()`, `getPlanDistribution()`
- `getAdminAlerts()`, `getAdminActivity()`, `getTopTenantsByRevenue()`

## Improvements
- [ ] Configurable date range for all charts
- [ ] Drill-down from KPI cards to detailed views
- [ ] Real-time updates
- [ ] Customizable widget layout
