# Dashboard Page

## Route
`/dashboard` — Authenticated (all roles)

## Smart Routing
The `<SmartDashboard>` component checks `user.role`:
- `admin` → renders `AdminDashboard` (platform-level KPIs)
- All others → renders `Dashboard` (operational KPIs)

---

## Operational Dashboard (non-admin)

### UI Components
- **KPI Cards** (4): Total products, total stock, stock value, low stock items — each with trend indicator
- **Quick Actions** (4 buttons): New product, new order, deliveries, inventory
- **Low Stock Alerts**: Scrollable list of up to 5 low-stock products with threshold
- **Categories Breakdown**: Progress bars showing product distribution by category
- **Top Products by Value**: Table of top 5 products sorted by stock × cost

### Data Sources
- `getAllProducts()`, `getLowStockProducts()`, `CATEGORIES` from fakeApi

### Edge Cases
- No low stock → "No alerts" empty state
- Currency formatted as M/K DZD for large values

---

## Admin Dashboard

### UI Components
- **Header** with Crown icon + personalized greeting
- **PlatformKpiCards**: Total tenants, MRR, active users, etc.
- **RevenueChart** (2/3 width): Line/bar chart of revenue history
- **PlanDistributionChart** (1/3 width): Pie chart of plan distribution
- **AdminAlertsWidget**: Critical platform alerts
- **AdminActivityFeed**: Recent admin activities
- **TopTenantsTable**: Top tenants by revenue

### Data Sources
- `admin-dashboard.service.ts`: KPIs, revenue history, plan distribution, alerts, activity, top tenants

## Improvements
- [ ] Role-specific widgets (stock heatmap for warehouse, route map for driver)
- [ ] Date range picker for KPIs
- [ ] Real-time data refresh with polling/websockets
- [ ] Customizable dashboard layout (drag & drop widgets)
- [ ] Export dashboard as PDF
