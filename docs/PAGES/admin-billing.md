# Admin Billing

## Route
`/admin/billing`

## Status
- Complete: 55%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Read-only
- API Status: ❌ Mock data
- Production Ready: No

## Purpose
Platform billing management — invoice history, payment status, dunning queue for failed payments.

## Existing Features
- 4 KPI cards (Collected, Pending, Failed, Refunded)
- Tabs: Invoice History + Dunning Queue
- Invoice table (6 columns)
- Dunning table with retry button
- Export button (non-functional)

## Existing UI
- StatCard, Tabs, Tables, Badge status indicators
- "Retry Now" button on dunning entries

## Existing User Actions
- ✅ View invoices and dunning queue
- ❌ Retry payment (button exists, no action)
- ❌ Export data
- ❌ Generate manual invoice
- ❌ Issue refund

## Backend/API Needed
- `GET /admin/billing/invoices`
- `GET /admin/billing/dunning`
- `POST /admin/billing/dunning/:id/retry`
- `POST /admin/billing/invoices/:id/refund`

## Missing Features
- [ ] Stripe webhook integration
- [ ] Real payment retry
- [ ] Invoice PDF generation
- [ ] Refund processing
- [ ] Payment analytics
- [ ] Date range filter

## Priority Tasks
- **Critical**: Auth guard, Stripe integration
- **High**: Payment retry, refund
- **Medium**: Analytics, export

## Final Score
**55/100**
