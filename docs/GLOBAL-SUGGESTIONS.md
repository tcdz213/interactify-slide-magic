# Global Suggestions & Missing Features

## Critical Missing Modules

### 1. Customer Management (Clients)

**Priority: HIGH** — Currently orders reference traders but there's no client database.

- Client CRUD (name, address, NIF/RC, contact, credit limit)
- Client tiers (BRONZE/SILVER/GOLD/VIP) for pricing
- Client statement (orders, invoices, payments, balance)
- Credit management and payment terms

### 2. Payment Management

**Priority: HIGH** — Invoices can be marked paid/unpaid but there's no payment tracking.

- Payment recording (amount, date, method, reference)
- Partial payment support
- Payment reconciliation with invoices
- Overdue payment reminders
- Payment methods: cash, bank transfer, check, CIB

### 3. Vehicle & Fleet Management

**Priority: MEDIUM** — Deliveries reference vehicles but there's no vehicle module.

- Vehicle CRUD (plate, brand, model, capacity, fuel type)
- Vehicle availability tracking
- Maintenance scheduling
- Fuel consumption tracking
- Insurance/document expiry alerts

### 4. Price Management

**Priority: HIGH** — Basic pricing exists but lacks tiered and client-specific pricing.

- Price tiers per product (BRONZE/SILVER/GOLD/VIP)
- Client-specific pricing overrides
- Supplier pricing by warehouse
- Price history tracking
- Promotion/discount management
- Volume-based pricing

### 5. Reporting & Export

**Priority: MEDIUM** — Limited to CSV export of tenants.

- Sales reports (daily, weekly, monthly)
- Stock valuation reports
- Client aging reports
- PDF export for invoices and reports
- Scheduled report generation
- Dashboard export as PDF

## Architecture Improvements

### Backend Readiness

- [ ] Implement proper authentication (JWT, refresh tokens)
- [ ] Add API error handling and retry logic
- [ ] Implement optimistic updates for better UX
- [ ] Add request caching (React Query / TanStack Query)

### Data Management

- [ ] Replace localStorage auth with secure session
- [ ] Implement pagination for all list views
- [ ] Add data validation with Zod schemas on all forms
- [ ] Implement undo/redo for destructive actions
- [ ] Add offline support with service workers

### UX Improvements

- [ ] Confirmation dialogs for delete actions
- [ ] Bulk operations (select multiple items)
- [ ] Keyboard shortcuts
- [ ] Dark mode toggle accessible from all pages
- [ ] Responsive mobile layout optimization
- [ ] PWA installation support

### i18n Completeness

- [ ] Some pages have hardcoded French strings (Inventory tab headers, Accounting labels)
- [ ] Missing translation keys for some dynamic content
- [ ] Number formatting should respect locale (comma vs period)
- [ ] Date formatting inconsistent (some use format(), some use toLocaleDateString)

### Testing

- [ ] Integration tests for complete workflows
- [ ] E2E tests with Playwright/Cypress
- [ ] Visual regression testing
- [ ] Accessibility testing (WCAG compliance)
- [ ] Performance testing (large datasets)

## Market-Specific Features (Algeria)

### Fiscal Compliance

- [ ] G50 VAT declaration generation
- [ ] Stamp duty (timbre fiscal) for invoices > 100K DZD
- [ ] Commercial register validation
- [ ] Electronic invoicing (facturation électronique)

### Local Integration

- [ ] Algérie Poste payment integration
- [ ] CIB/DAHABIA card payments
- [ ] SMS via local providers (Djezzy, Mobilis, Ooredoo)
- [ ] Wilaya-based shipping zones and rates

### Industry-Specific

- [ ] BTP: Construction material tracking (batch/lot, cement expiry)
- [ ] Agro: Cold chain monitoring, harvest season pricing
- [ ] Pharmaceutical: Strict lot tracking, recall management
- [ ] FMCG: Shelf life management, promotional campaigns
