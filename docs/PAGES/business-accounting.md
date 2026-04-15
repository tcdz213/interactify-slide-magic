# Business Accounting

## Route
`/business/accounting`

## Status
- Complete: 60%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Read-only, uses React Query
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Financial overview — revenue, expenses, profit, DSO, aging analysis, top debtors.

## Existing Features
- 4 KPIs (Revenue, Expenses, Net Profit, DSO) with DZD formatting
- Monthly revenue area chart
- Aging buckets bar chart
- Top debtors DataTable

## Existing UI
- KPIWidgets, AreaChart, BarChart, DataTable

## Existing User Actions
- ✅ View financial data
- ❌ No interactive actions

## Backend/API Needed
- `GET /accounting/stats`
- `GET /accounting/aging`
- `GET /accounting/top-debtors`
- `GET /accounting/revenue?months=6`

## Missing Features
- [ ] Date range selection
- [ ] P&L statement
- [ ] Balance sheet
- [ ] Cash flow statement
- [ ] Journal entries
- [ ] Chart of accounts
- [ ] Tax declaration reports

## Final Score
**60/100**
