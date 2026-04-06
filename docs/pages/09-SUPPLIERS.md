# Suppliers Page

## Route
`/suppliers` — Roles: `warehouse`, `trader`

## UI Components
- **PageWrapper** with breadcrumbs
- **KPI Cards** (4): Active/total suppliers, Pending POs, Total PO value (DA), Unmatched reconciliations
- **Tab Bar**: Suppliers | Purchase Orders | Receiving | Reconciliation

### Suppliers Tab
- Search by name/city
- Card grid (2 cols): Name, contact, status badge, phone, email, address, NIF/NIS/RC
- Click card → navigate to `/suppliers/:id`

### Purchase Orders Tab
- Search by PO number/supplier name
- Expandable PO cards: PO number, status, approval status, supplier, date, total TTC, receiving progress bar
- Expanded: HT/TVA breakdown, expected date, items table (product, SKU, qty, unit price, total, qty received progress)

### Receiving Tab
- Receipt cards: receipt number, supplier, PO ref, warehouse, date
- Items table: product, qty ordered, qty received (green if complete, yellow if partial)
- Notes section

### Reconciliation Tab
- Cards: invoice ref, PO number, date
- Status: matched (green check) or unmatched (red alert with variance amount)

## Supplier Detail (`/suppliers/:id`)

### UI Components
- **Info card**: Status, created date, phone/email/address, NIF/NIS/RC, KPIs (PO count, received, total value)
- **Purchase Orders section**: Same expandable PO cards filtered for this supplier
- **Goods Receipts section**: Receipt cards filtered for this supplier
- **Reconciliation section**: Reconciliation items filtered for this supplier

## Edge Cases
- Loading → text loading in PageWrapper
- Supplier not found → error + back link
- No POs/receipts → "No results" text
- All reconciliations matched → green check

## Improvements
- [ ] Create new supplier form
- [ ] Create purchase order form
- [ ] Supplier rating/scoring system
- [ ] Supplier payment tracking
- [ ] Automated reorder suggestions
- [ ] Supplier communication log
- [ ] Document management (contracts, certifications)
- [ ] Price comparison across suppliers
- [ ] Lead time tracking
