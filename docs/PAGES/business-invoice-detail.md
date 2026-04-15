# Business Invoice Detail

## Route
`/business/invoices/:id`

## Status
- Complete: 60%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Read-only
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
View invoice details — line items, tax breakdown, payment history, print/download.

## Existing Features
- Invoice header (number, customer, dates, status)
- Line items table with TVA rates
- Tax summary (TVA 9%/19%)
- Payment history section
- Print-friendly layout

## Existing User Actions
- ✅ View invoice details
- ❌ Record payment
- ❌ Download PDF
- ❌ Send by email
- ❌ Cancel invoice

## Backend/API Needed
- `GET /invoices/:id`
- `POST /invoices/:id/payments`
- `GET /invoices/:id/pdf`
- `POST /invoices/:id/send`

## Missing Features
- [ ] Record payment action
- [ ] PDF download
- [ ] Email send
- [ ] Credit note generation
- [ ] Invoice editing (draft only)

## Final Score
**60/100**
