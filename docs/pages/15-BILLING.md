# Billing Dashboard

## Route
`/billing` — Admin only

## UI Components
- **KPI Cards** (4): MRR, ARR, Overdue amount, Pending invoices
- **Revenue by Plan** (Bar chart): Revenue breakdown per plan with colors
- **Monthly Revenue** (Bar chart): Revenue trend over months
- **Platform Invoices Table**: Invoice #, tenant, plan, amount, status badge, date + status filter

## Data
- `getBillingKpis()`: MRR, ARR, overdue totals/counts, pending
- `getRevenueByPlan()`: Revenue per plan for bar chart
- `getMonthlyRevenue()`: Monthly revenue for trend chart
- `getPlatformInvoices()`: Individual invoices with status

## Invoice Statuses
- `paid` (green), `pending` (amber), `overdue` (red), `cancelled` (muted)

## Currency
Values in centimes internally, displayed as DA with K/M suffixes

## Improvements
- [ ] Payment collection integration (Stripe, CIB, etc.)
- [ ] Automated invoice generation
- [ ] Dunning management (overdue follow-ups)
- [ ] Revenue forecasting
- [ ] Tax reporting (G50)
- [ ] Credit/debit memos
