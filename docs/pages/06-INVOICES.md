# Invoices Page

## Route
`/invoices` — Roles: `trader`, `support`

## UI Components
- **Header**: FileText icon + title + count
- **KPI Cards** (4): Paid count, Unpaid count, Total revenue (DA), Outstanding (DA)
- **Filters**: Search (invoice #, buyer, order ref) + status pills (All/Paid/Unpaid)
- **Invoices Table**: Invoice #, buyer, order ref, status badge, total TTC, issued date, due date, toggle action

## Data
- Loaded synchronously from `getAllInvoices()` (fakeApi)
- Invoice fields: id, invoiceNumber, orderId, orderNumber, seller{}, buyer{}, items[], totalHT, totalTVA, totalTTC, status, issuedAt, dueDate, paidAt, paymentTerms

## User Actions
| Action | Trigger | Result |
|--------|---------|--------|
| Toggle paid/unpaid | Click button in table | Calls markAsPaid/markAsUnpaid, refreshes |
| View detail | Click row | Navigate to `/invoices/:id` |
| Search | Type in search | Filters by invoice #, buyer, order ref |
| Filter by status | Click pill | Filters table |

## Invoice Detail (`/invoices/:id`)

### UI Components
- **Header**: Invoice number, order ref, status badge (paid/unpaid with icon)
- **Action buttons**: Toggle paid/unpaid, Print, View linked order
- **Print-ready invoice card**:
  - Invoice header with number + dates (issued, due, paid)
  - Seller info: name, address, NIF, NIS, RC, AI
  - Buyer info: name, address, NIF, RC
  - Items table: product, qty, unit price, TVA%, total HT, total TTC
  - Totals: HT / TVA / TTC
  - Payment terms

### Algerian Fiscal Compliance
- Seller/buyer blocks include NIF, NIS, RC, AI identifiers
- TVA rates shown per line item
- Dual currency display not needed (DZD only)

## Edge Cases
- Invoice not found → error + back link
- Print → `window.print()` (uses `.no-print` class to hide nav elements)
- All invoices paid → "0" unpaid, "0 DA" outstanding

## Improvements
- [ ] Generate invoice from order automatically
- [ ] Credit notes / refunds
- [ ] Multi-payment tracking (partial payments)
- [ ] Invoice aging report
- [ ] PDF export with company letterhead
- [ ] Email invoice to buyer
- [ ] Stamp duty (timbre fiscal) integration
- [ ] Recurring invoices for subscriptions
