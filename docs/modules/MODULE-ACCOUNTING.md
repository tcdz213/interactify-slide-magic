# Module: Accounting

## Overview
Double-entry bookkeeping with Algerian PCN (Plan Comptable National) compliance. Provides journal entries, trial balance, P&L, and chart of accounts.

## Pages
- `/accounting` — 4-tab accounting view

## Sub-Modules

### Journal des Écritures
- Each entry has: entryNumber, date, description, reference, referenceType, status, lines[]
- Each line: accountCode, accountLabel, debit, credit, description
- Statuses: posted, draft, void
- Reference types: invoice, payment, purchase, salary, adjustment

### Balance Générale (Trial Balance)
- Aggregates all account balances
- Shows debit/credit totals per account
- Balance verification (debit total = credit total)
- Account types: asset, liability, equity, revenue, expense

### Compte de Résultat (P&L)
- Revenue items with totals
- Expense items with totals
- Gross profit and net income

### Plan Comptable (Chart of Accounts)
- Hierarchical account structure
- Grouped by type (asset, liability, equity, revenue, expense)

## Data Flow
```
Order → Invoice → Journal Entry (auto-generated)
                 ├── Debit: Client Account (411xxx)
                 ├── Credit: Revenue (70xxxx)
                 └── Credit: TVA Collected (4457xx)
```

## Missing Features
- [ ] Manual journal entry creation
- [ ] Bank reconciliation
- [ ] Multi-period comparison
- [ ] Balance sheet
- [ ] Cash flow statement
- [ ] VAT declaration (G50/G50A)
- [ ] Fixed assets management
- [ ] Cost center / profit center
- [ ] Budget management
- [ ] Fiscal year closing
- [ ] Export to external accounting software
