# Business Invoices

## Route
`/business/invoices`

## Status
- Complete: 65%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Read + filters, uses React Query + DataTable
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Invoice management — view, filter, track payments, navigate to detail.

## Existing Features
- 4 KPI widgets (Total, Paid, Overdue, Pending) with DZD currency
- Status filter dropdown
- DataTable with sortable columns
- StatusBadge component
- Link to invoice detail
- DZD number formatting (Intl.NumberFormat)

## Existing UI
- KPIWidgets, Select, DataTable, StatusBadge, search, "New Invoice" button

## Existing User Actions
- ✅ Filter by status
- ✅ Navigate to invoice detail
- ❌ Create invoice
- ❌ Send invoice
- ❌ Export as PDF

## Backend/API Needed
- `GET /invoices?status=&page=`
- `POST /invoices`
- `POST /invoices/:id/send`
- `GET /invoices/:id/pdf`

## Missing Features
- [ ] Create invoice form
- [ ] Send invoice by email
- [ ] PDF generation
- [ ] Search functionality
- [ ] Date range filter
- [ ] Bulk actions

## Priority Tasks
- **Critical**: Auth guard, CRUD
- **High**: PDF generation, search
- **Medium**: Email sending

## Final Score
**65/100**
