# Accounting Page

## Route
`/accounting` — Roles: `trader`

## UI Components
- **PageWrapper** with breadcrumbs
- **KPI Cards** (4): Total entries, Total debit, Total credit, Net income
- **Tab Bar**: Journal | Trial Balance | P&L | Chart of Accounts

### Journal Tab
- Search by description/entry number/reference
- Expandable entry cards: entry number, date, reference, description, total, status badge
- Expanded view: debit/credit lines table with account code, label, amounts, totals

### Trial Balance Tab
- Balance status banner (balanced ✓ / unbalanced ⚠)
- Table: account code, label, type badge, debit, credit, balance
- Footer: totals row
- Account types: asset (blue), liability (orange), equity (purple), revenue (green), expense (red)

### P&L Tab
- Revenue section: green-themed list of revenue items with total
- Expenses section: red-themed list of expense items with total
- Summary: gross profit + net income with color coding (green/red)

### Chart of Accounts Tab
- Hierarchical list grouped by account type
- Expandable groups showing individual accounts with code, label, type

## Data
- 4 parallel async loads: journal entries, trial balance, P&L report, chart of accounts
- All via `accounting.service.ts` → `fakeApi/accounting.ts`

## Formatting
- `formatDZD()`: French-DZ locale, 2 decimals, suffix "DA"

## Edge Cases
- Loading → text loading state in PageWrapper
- Empty journal → no entries shown
- Unbalanced trial balance → red warning banner

## Improvements
- [ ] Create journal entries manually
- [ ] Bank reconciliation
- [ ] Multi-period P&L comparison
- [ ] Balance sheet generation
- [ ] Cash flow statement
- [ ] VAT declaration report (G50/G50A)
- [ ] Export to accounting software (Sage, etc.)
- [ ] Fiscal year closing
- [ ] Cost center tracking
- [ ] Budget vs actual analysis
