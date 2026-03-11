# Jawda SaaS — Implementation Checklist & Quick Start

---

## Pre-Implementation Setup (Day 1)

### Step 1: Create Directory Structure
```bash
# Create main mock data directory
mkdir -p src/__mocks__/{seeds,transactions,operations,financial,platform,gaps,historical,utils,constants}

# Create test directories  
mkdir -p src/__tests__/{unit,integration,e2e-scenarios,role-based}
mkdir -p src/__tests__/unit/seeds
mkdir -p src/__tests__/integration
```

### Step 2: Create Constants Files First
These have no dependencies, create them first.

- [ ] `src/__mocks__/constants/roles.ts` — 12 role definitions
- [ ] `src/__mocks__/constants/statuses.ts` — All status enums
- [ ] `src/__mocks__/constants/currencies.ts` — FX rates
- [ ] `src/__mocks__/constants/businessRules.ts` — Credit limits, tax rates, thresholds

**Effort:** 2-3 hours  
**Blocker:** None — start here

---

## WEEK 1: FOUNDATION DATA

### Step 3: Create Seed Data (8 files)

**Monday:**
- [ ] `platformOwner.ts` (OWNER-001 + 4 subscription plans)
- [ ] `tenants.ts` (5 entrepôts + 3 fournisseurs)
- [ ] `users.ts` (35 users across 8 tenants, 12 roles)

**Checklist for these 3 files:**
- [ ] All 8 tenants have valid subscription plans
- [ ] All 35 users have valid tenantIds
- [ ] All users have assignedWarehouseIds that exist
- [ ] No duplicate user IDs
- [ ] All roles exist in constants/roles.ts

**Tuesday:**
- [ ] `products.ts` (57 products, 4 sectors)
- [ ] `vendors.ts` (8 vendors)
- [ ] `warehouses.ts` (9 warehouses)
- [ ] `masterData.ts` (customers, categories, UoMs, carriers)

**Checklist for these 4 files:**
- [ ] All 57 products reference valid categories
- [ ] All warehouses reference existing tenants
- [ ] All 20 customers reference existing tenants
- [ ] All UoMs are defined (15 total)
- [ ] All carriers are defined (4 total)

**Wednesday-Thursday:**
- [ ] Create `src/__tests__/unit/seeds/mock-data.test.ts` with 25+ validation tests

**Test Cases to Include:**
```typescript
- No duplicate IDs across all entities
- Every user.tenantId exists
- Every user.assignedWarehouseIds exist
- Every product has valid category
- Every warehouse has valid tenant
- Every customer has valid tenant
- No circular references
- All roles defined
- All UoMs defined
- All statuses defined
```

**Friday:**
- [ ] Run validation tests
- [ ] Fix all referential integrity errors
- [ ] Verify all 25+ tests pass

**Exit Gate 1 Criteria:**
✅ All foundation data populated (8 files, ~2500 lines)  
✅ All validation tests pass (25+ tests)  
✅ 0 referential integrity errors  
✅ Ready to move to transactions  

---

## WEEK 2-3: CONNECTIONS & PROCUREMENT

### Step 4: Supplier Connections (3 days)

**Monday-Tuesday:**
- [ ] `transactions/connections.ts` (12 connections with different states)
  - 4 CONNECTED
  - 2 PENDING
  - 1 REJECTED
  - 1 BLOCKED
  - 4 other state variations

- [ ] `gaps/supplierFulfillment.ts` (supplier-side fulfillment tracking)
  - Add states: PREPARING, SHIPPED, DELIVERED
  - Link to IncomingPO

**Checklist:**
- [ ] All connections reference valid suppliers + warehouses
- [ ] Connection status machine validated: PENDING → CONNECTED | REJECTED
- [ ] BLOCKED state prevents PO submission
- [ ] Supplier can only send PO after CONNECTED

**Wednesday:**
- [ ] Create `src/__tests__/integration/supplierConnection.test.ts`
- [ ] Write 6 test cases covering all connection flows

**Test Cases:**
```
1. Supplier can initiate connection request
2. Warehouse receives connection notification
3. Warehouse can approve/reject connection
4. Supplier can send PO only after CONNECTED
5. Connection status flows correctly
6. Blocked connections prevent PO submission
```

**Exit Gate 2a Criteria:**
✅ 12 connection records created  
✅ Supplier fulfillment states defined  
✅ 6 connection tests passing  

---

### Step 5: Purchase Orders & GRNs (4 days)

**Thursday:**
- [ ] `transactions/purchaseOrders.ts` (20 POs covering 6 scenarios)

**PO Scenarios to Create:**
| # | Scenario | PO ID | Status | Purpose |
|---|----------|-------|--------|---------|
| 1 | Happy path | PO-01 | RECEIVED | Complete cycle |
| 2 | Partial delivery | PO-02 | PARTIALLY_RECEIVED | Multi-line partial |
| 3 | QC failure | PO-03 | CONFIRMED | Rejection flow |
| 4 | Unit conversion | PO-04 | RECEIVED | kg→sac→pallet |
| 5 | Foreign currency | PO-05 | SENT | EUR vendor |
| 6 | Large PO | PO-10 | SENT | 15+ lines |
| 7-20 | Current/ongoing | Mixed | Various | Dashboard data |

**Checklist:**
- [ ] Each PO has valid vendorId
- [ ] Each PO has valid warehouseId
- [ ] Each PO line has valid productId
- [ ] Quantities realistic (min 10, max 10,000)
- [ ] Dates within last 2 months
- [ ] Totals calculated correctly (qty × price)

**Friday (Week 2):**
- [ ] `transactions/goodsReceipts.ts` (15 GRNs)
- [ ] `operations/qcInspections.ts` (6 QC records)

**GRN Scenarios:**
| # | PO | Status | QC Result | Purpose |
|---|----|----|-----------|---------|
| 1 | PO-01 | ACCEPTED | PASSED | Happy path |
| 2 | PO-02 | RECEIVED | — | Partial only |
| 3 | PO-03 | RECEIVED | FAILED | QC rejection |
| 4-15 | Various | Mixed | Mixed | Coverage |

**QC Scenarios:**
| # | GRN | Status | Result | Defects |
|---|-----|--------|--------|---------|
| 1 | GRN-01 | COMPLETED | PASSED | 0 |
| 2 | GRN-03 | COMPLETED | FAILED | 12 |
| 3-6 | Various | Mixed | Mixed | 0-50 |

**Checklist:**
- [ ] Each GRN references valid PO
- [ ] Each GRN line matches PO line products
- [ ] Received quantities ≤ PO quantities
- [ ] Each GRN has QC inspection
- [ ] QC results match GRN status

**Monday-Wednesday (Week 3):**
- [ ] Create `src/__tests__/integration/procurement.test.ts` (6 test cases)
- [ ] Create `src/__tests__/e2e-scenarios/PROCURE_TO_PAY.test.ts`

**Procurement Tests:**
```
1. Happy path: PO → Full GRN → QC PASSED → Invoice → Paid
2. Partial delivery: PO → Partial GRN, remainder pending
3. QC failure: GRN → QC FAILED → Items rejected
4. Unit conversion: PO kg → GRN sacs → Inventory pieces
5. Variance >5%: GRN variance → Escalation
6. Foreign currency: PO EUR → Invoice DZD (FX conversion)
```

**Thursday-Friday (Week 3):**
- [ ] `gaps/incomingPOs.ts` (5+ supplier-sent POs)
- [ ] Link IncomingPOs to GRNs (when received at warehouse)

**Checklist:**
- [ ] IncomingPO references valid supplier + warehouse
- [ ] Connection must be CONNECTED before sending IncomingPO
- [ ] IncomingPO → Warehouse receives → GRN created
- [ ] Supplier can track fulfillment status

**Exit Gate 2 Criteria:**
✅ 20 PO records with realistic scenarios  
✅ 15 GRN records linked to POs  
✅ 6 QC inspections with passed/failed results  
✅ 5+ IncomingPO records  
✅ Complete PO→GRN→QC chain validated  
✅ Procurement integration tests passing (6 tests)  
✅ PROCURE_TO_PAY E2E test passing  

---

## WEEK 4-5: SALES & DELIVERY

### Step 6: Sales Orders & Delivery (5 days, Week 4)

**Monday-Tuesday:**
- [ ] `transactions/salesOrders.ts` (15 SOs covering 6 scenarios)

**SO Scenarios:**
| # | Scenario | SO ID | Status | Purpose |
|---|----------|-------|--------|---------|
| 1 | Happy path | SO-01 | DELIVERED | Complete cycle |
| 2 | Credit hold | SO-02 | CREDIT_HOLD | Credit limit |
| 3 | Offline order | SO-03 | APPROVED | Mobile app |
| 4 | Partial delivery | SO-04 | SHIPPED | Split delivery |
| 5 | With discount | SO-05 | DELIVERED | 5% discount |
| 6 | High-value | SO-10 | APPROVED | >1M DZD, CEO approval |
| 7-15 | Current/pending | Mixed | Various | Dashboard data |

**Checklist:**
- [ ] Each SO has valid customerId
- [ ] Each SO has valid warehouseId
- [ ] Each SO line has valid productId
- [ ] Credit check: totalAmount ≤ (creditLimit - used)
- [ ] Tax calculated: total = subtotal × 1.19
- [ ] SO-02 is CREDIT_HOLD (customer over limit)
- [ ] SO-10 is high-value (>1M, needs CEO approval)

**Wednesday:**
- [ ] `gaps/taskQueues.ts` (10-15 picking/packing/putaway/counting tasks)

**Task Types & States:**
- PICKING: ASSIGNED → IN_PROGRESS → COMPLETED
- PACKING: ASSIGNED → IN_PROGRESS → COMPLETED
- PUTAWAY: ASSIGNED → IN_PROGRESS → COMPLETED
- CYCLE_COUNT: ASSIGNED → IN_PROGRESS → COMPLETED

**Checklist:**
- [ ] Each picking task links to valid SO
- [ ] Each packing task links to picking completion
- [ ] Each putaway task links to valid GRN
- [ ] Each task assigned to valid operator
- [ ] Task sequences are logical (pick → pack → ship)

**Thursday:**
- [ ] `transactions/deliveryTrips.ts` (5 trips with 20+ stops)

**Trip Scenarios:**
| # | Driver | Stops | Status | Purpose |
|---|--------|-------|--------|---------|
| 1 | U007 | 6 | COMPLETED | Full day |
| 2 | U012 | 4 | IN_PROGRESS | Partial day |
| 3 | U007 | 5 | COMPLETED | Incident |
| 4 | U105 | 3 | COMPLETED | Cash collection |
| 5 | U007 | 4 | COMPLETED | Vehicle check |

**Checklist:**
- [ ] Each trip has valid driverId
- [ ] Each stop has valid soId + customerId
- [ ] Stop coordinates are realistic (Algeria)
- [ ] Times are sequential (stop 1 before stop 2)
- [ ] Cash collected matches invoice totals

**Friday:**
- [ ] `transactions/returns.ts` (4 return orders)
- [ ] Create `src/__tests__/integration/sales.test.ts` (6 tests)
- [ ] Create `src/__tests__/e2e-scenarios/ORDER_TO_CASH.test.ts`

**Return Scenarios:**
| # | Original SO | Reason | Credit Note | Status |
|---|-------------|--------|-------------|--------|
| 1 | SO-01 | Defective | CN-001 | COMPLETED |
| 2 | SO-02 | Wrong item | CN-002 | PENDING |
| 3 | SO-03 | Damaged | CN-003 | COMPLETED |
| 4 | SO-04 | Customer request | CN-004 | PENDING |

**Sales Tests:**
```
1. Happy path: SO → Picking → Packing → Shipped → Delivered → Invoiced → Paid
2. Credit hold: Customer over limit → SO CREDIT_HOLD
3. Partial delivery: SO with multi-line → split into 2 shipments
4. Return: Delivered SO → Return created → Credit note
5. Offline order: Mobile order → Synced when online
6. High-value: SO >1M → CEO approval required
```

**Exit Gate 3 Criteria:**
✅ 15 SO records with realistic scenarios  
✅ 10-15 task queue records (picking/packing/putaway)  
✅ 5 delivery trips with 20+ stops  
✅ 4 return orders with credit notes  
✅ Complete SO→Picking→Packing→Shipping→Delivery chain  
✅ Sales integration tests passing (6 tests)  
✅ ORDER_TO_CASH E2E test passing  

---

## WEEK 6: FINANCIAL OPERATIONS

### Step 7: Invoices, Payments & Financials (5 days)

**Monday-Tuesday:**
- [ ] `transactions/invoices.ts` (12 invoices in various states)

**Invoice States:**
| # | Customer | Amount | Status | Purpose |
|---|----------|--------|--------|---------|
| 1 | C003 | 101,150 | PAID | Paid same day |
| 2 | C005 | 250,000 | PARTIALLY_PAID | 150K paid, 100K due |
| 3 | C001 | 500,000 | OVERDUE | 38 days overdue |
| 4 | C002 | 180,000 | SENT | Not yet paid |
| 5 | C004 | 225,000 | DISPUTED | In dispute |
| 6-12 | Various | Mixed | Mixed | Dashboard data |

**Checklist:**
- [ ] Each invoice references valid SO or PO
- [ ] Invoice amount matches SO/PO total (including tax)
- [ ] Invoice date ≤ delivery date
- [ ] Due date calculated from invoice date + payment terms
- [ ] Overdue invoices have ageing days calculated
- [ ] Partial payments sum < total amount

**Wednesday:**
- [ ] `transactions/payments.ts` (10 payments in various methods)

**Payment Methods:**
| # | Invoice | Method | Amount | Status |
|---|---------|--------|--------|--------|
| 1 | INV-01 | CASH | 101,150 | RECORDED |
| 2 | INV-02 | BANK_TRANSFER | 150,000 | RECORDED |
| 3 | INV-04 | CHEQUE | 180,000 | PENDING |
| 4 | INV-02 | MOBILE | 100,000 | RECORDED |
| 5-10 | Various | Mixed | Mixed | Mixed |

**Checklist:**
- [ ] Each payment references valid invoice
- [ ] Payment amount ≤ invoice amount
- [ ] Payment recorded date ≤ today
- [ ] Bank transfer has valid reference
- [ ] Cheque has number
- [ ] Mobile payment has reference

**Thursday:**
- [ ] `operations/qualityClaims.ts` (3 quality claims)
- [ ] `gaps/chartOfAccounts.ts` (50 accounts, ledger structure)

**Quality Claims:**
| # | GRN | Defects | Claim Amount | Credit Note |
|---|-----|---------|-------------|-------------|
| 1 | GRN-03 | 12 | 36,000 | CN-05 |
| 2 | GRN-08 | 5 | 15,000 | CN-06 |
| 3 | GRN-12 | 20 | 60,000 | CN-07 |

**Chart of Accounts Structure:**
```
ASSETS (1000-1999)
├─ 1000: Cash
├─ 1200: Accounts Receivable
├─ 1300: Inventory
└─ 1400: Fixed Assets

LIABILITIES (2000-2999)
├─ 2000: Accounts Payable
├─ 2100: Sales Tax Payable
└─ 2200: Short-term Debt

EQUITY (3000-3999)

REVENUE (4000-4999)
├─ 4000: Sales Revenue
└─ 4100: Other Revenue

EXPENSES (5000-5999)
├─ 5000: Cost of Goods Sold
├─ 5100: Salaries
├─ 5200: Utilities
└─ 5300: Depreciation
```

**Friday:**
- [ ] `gaps/bankReconciliation.ts` (30 bank transactions)
- [ ] Create `src/__tests__/integration/financial.test.ts` (6 tests)
- [ ] Create `src/__tests__/e2e-scenarios/FINANCIAL_CLOSING.test.ts`

**Bank Reconciliation:**
- [ ] 30 bank transactions spanning 3 months
- [ ] Match to recorded payments
- [ ] Identify timing differences
- [ ] Mark reconciled transactions

**Financial Tests:**
```
1. Invoice creation: SO delivered → Invoice auto-created
2. 3-way match: PO = GRN = Invoice (amount, qty, date)
3. Partial payment: Invoice paid in multiple payments
4. Overdue tracking: Invoice >30 days past due
5. Quality claim: Defects → Credit note created
6. FX conversion: EUR PO → DZD invoice (FX rate applied)
```

**Exit Gate 4 Criteria:**
✅ 12 invoice records in various states  
✅ 10 payment records covering multiple methods  
✅ 3 quality claims linked to GRNs  
✅ 50-account chart of accounts  
✅ 30 bank transactions for reconciliation  
✅ 3-way match logic validated  
✅ Financial integration tests passing (6 tests)  
✅ FINANCIAL_CLOSING E2E test passing  

---

## WEEK 7: WAREHOUSE OPERATIONS

### Step 8: Operations & Inventory Management (5 days)

**Monday-Tuesday:**
- [ ] `operations/cycleCounts.ts` (3 cycle counts with different variance levels)

**Cycle Count Scenarios:**
| # | Zone | Variance % | Status | Approver |
|---|------|-----------|--------|----------|
| 1 | A | 0% | APPROVED | None needed |
| 2 | B | 1.5% | APPROVED | U003 (Ops Director) |
| 3 | C | 18% | ESCALATED | U001 (CEO) |

**Checklist:**
- [ ] Each cycle count in valid warehouse zone
- [ ] Counted qty vs system qty calculated
- [ ] Variance % = |counted - system| / system × 100
- [ ] CC-01: 0% → Auto-approved
- [ ] CC-02: 1.5% → Manager approval
- [ ] CC-03: 18% → CEO escalation (>5%)

**Wednesday:**
- [ ] `operations/stockAdjustments.ts` (4 adjustments)
- [ ] `operations/stockTransfers.ts` (3 inter-WH transfers)

**Stock Adjustments:**
| # | Product | Type | Qty | Reason | Needs Approval |
|---|---------|------|-----|--------|----------------|
| 1 | P001 | INCREASE | 50 | Found in count | No |
| 2 | P003 | DECREASE | 250 | Damaged | Yes (>100 qty) |
| 3 | P005 | INCREASE | 10 | Invoice error | No |
| 4 | P010 | DECREASE | 500 | Obsolete | Yes |

**Stock Transfers:**
| # | From WH | To WH | Status | Purpose |
|---|---------|-------|--------|---------|
| 1 | Alger-Const | Alger-General | COMPLETED | Rebalance |
| 2 | Blida-Food | Alger-Const | IN_TRANSIT | Demand |
| 3 | Alger-Const | Blida-Food | CANCELLED | Insufficient qty |

**Checklist:**
- [ ] Each adjustment references valid product + warehouse
- [ ] Adjustment qty is realistic (min 1, max 5000)
- [ ] Negative adjustments >threshold require approval
- [ ] Each transfer links valid source + destination warehouses
- [ ] Transfer qty ≤ available stock

**Thursday:**
- [ ] `operations/stockBlocks.ts` (3 blocked stock records)
- [ ] `gaps/replenishmentRules.ts` (20 reorder rules)

**Stock Blocks:**
| # | Product | Location | Qty | Reason | Hold Date |
|---|---------|----------|-----|--------|-----------|
| 1 | P001 | ALG-A1-01 | 100 | QC failed | 2026-03-10 |
| 2 | P017 | BLD-A1-02 | 500 | Expired | 2026-03-05 |
| 3 | P003 | ALG-D1-02 | 200 | Damaged | 2026-03-11 |

**Replenishment Rules:**
- 20 rules for high-turnover products
- Define reorder points per product per warehouse
- Configure safety stock + EOQ (Economic Order Qty)
- Link to preferred vendor

**Friday:**
- [ ] Create `src/__tests__/integration/warehouse.test.ts` (6 tests)
- [ ] Create `src/__tests__/e2e-scenarios/WAREHOUSE_OPERATIONS_DAY.test.ts`

**Warehouse Tests:**
```
1. Daily check: Low stock items → Alerts
2. Cycle count: Count zone → Compare system → Approve variance
3. Adjustment: Found items → Increase stock → Approve (if threshold)
4. Transfer: Send to other WH → Track in-transit → Receive
5. Stock block: QC failure → Block stock → Cannot allocate to SO
6. Reorder: Stock <threshold → Auto-alert → Create PO
```

**Exit Gate 5 Criteria:**
✅ 3 cycle counts with variance scenarios  
✅ 4 stock adjustment records  
✅ 3 stock transfer records  
✅ 3 blocked stock records  
✅ 20 replenishment rules configured  
✅ Complete warehouse operations workflow tested  
✅ Warehouse integration tests passing (6 tests)  
✅ WAREHOUSE_OPERATIONS_DAY E2E test passing  

---

## WEEK 8-9: HISTORICAL DATA & PLATFORM

### Step 9: Generate 24-Month Historical Data (5 days, Week 8)

**Monday-Tuesday:**
- [ ] Create generator functions in `utils/generators.ts`
- [ ] Implement seasonal pattern logic
- [ ] Generate `historical/historicalPOs.ts` (180 POs)

**Generation Logic:**
```typescript
// Pseudocode
for (month = Jan2024 to Nov2025) {
  factor = seasonalPatterns[month][sector];
  count = baselineVolume × factor;
  
  for (i = 0; i < count; i++) {
    po = generatePO({
      createdDate: randomDateInMonth(month),
      vendor: randomVendor(sector),
      lineCount: random(1, 8),
      totalAmount: randomAmount(50K, 2M)
    });
    historicalPOs.push(po);
  }
}

// Validation: Total POs = 180, dates = Jan2024-Nov2025
```

**Checklist:**
- [ ] 180 total POs generated
- [ ] Dates span Jan 2024 → Nov 2025 only
- [ ] Seasonal patterns applied (Mar food spike, Apr-Jun BTP peak)
- [ ] All POs have valid vendors
- [ ] Vendor distribution realistic (80% GICA, 10% ArcelorMittal, etc.)

**Wednesday:**
- [ ] Generate `historical/historicalSOs.ts` (350 SOs)
- [ ] Generate `historical/historicalInvoices.ts` (280 invoices)

**Checklist:**
- [ ] 350 total SOs with seasonal spikes
- [ ] 280 invoices (not all SOs invoiced yet)
- [ ] Payment aging realistic (70% paid, 15% partial, 15% pending)
- [ ] Dates align with PO/SO dates

**Thursday:**
- [ ] Generate `historical/historicalPayments.ts` (250 payments)
- [ ] Generate `historical/historicalGrns.ts` (140 GRNs)

**Friday:**
- [ ] Validate historical data integrity
- [ ] Create trend reports (monthly volumes)

**Checklist:**
- [ ] 140 GRNs with valid PO linkage
- [ ] 250 payments matching invoices
- [ ] No future-dated records
- [ ] Financial records balanced (invoices = payments + pending)

**Exit Gate 6 Criteria:**
✅ 180 historical POs (Jan2024 → Nov2025)  
✅ 350 historical SOs with seasonal patterns  
✅ 280 historical invoices  
✅ 250 historical payments  
✅ 140 historical GRNs  
✅ Payment aging distribution realistic  
✅ All historical data validated  

---

### Step 10: Owner SaaS Platform Data (4 days, Week 9)

**Monday:**
- [ ] `platform/subscribers.ts` (8 subscribers with KPIs)
- [ ] `platform/saasKpis.ts` (MRR, churn, ARPU, GMV computed)

**Subscriber Data:**
- T-ENT-01: Enterprise, 120K/mo, active since Jan2024
- T-ENT-02: Pro, 55K/mo, active since Feb2024
- T-ENT-03: Pro, 55K/mo, active since Feb2024
- T-ENT-04: Standard, 25K/mo, active since Jun2024
- T-ENT-05: Trial, 0K/mo, active since Feb2026 (current)
- T-FRN-01: Pro, 55K/mo, active since Mar2024
- T-FRN-02: Standard, 25K/mo, active since Apr2024
- T-FRN-03: Standard, 25K/mo, active since May2024

**KPI Calculations:**
- MRR = Sum of active monthly fees = 120 + 55 + 55 + 25 + 0 + 55 + 25 + 25 = 360K
- Active Subscribers = 7 (excluding trial)
- ARPU = 360K / 7 = ~51K DZD
- GMV = Sum of all transaction values across platform
- Churn = 0% (no cancellations)

**Tuesday:**
- [ ] `platform/subscriptionInvoices.ts` (24 monthly invoices)
- [ ] `platform/onboardingRequests.ts` (3 requests)

**Subscription Invoices:**
- One invoice per active subscriber per month (last 3 months)
- T-ENT-01: 3 × 120K = 360K
- T-ENT-02: 3 × 55K = 165K
- ... etc.
- Total = 8 subscribers × 3 months = 24 invoices

**Onboarding Requests:**
| # | Company | Status | Reason |
|---|---------|--------|--------|
| 1 | Oran Maritime | PENDING | Awaiting approval |
| 2 | Constantine Auto | APPROVED | Ready for setup |
| 3 | Setif Textile | REJECTED | Duplicate account |

**Wednesday:**
- [ ] `platform/supportTickets.ts` (5 support tickets)
- [ ] `platform/systemMetrics.ts` (CPU, memory, errors)

**Support Tickets:**
| ID | Subscriber | Priority | Status | Category |
|----|-----------|----------|--------|----------|
| TKT-001 | T-ENT-02 | HIGH | OPEN | Billing |
| TKT-002 | T-FRN-01 | MEDIUM | IN_PROGRESS | Technical |
| TKT-003 | T-ENT-04 | LOW | OPEN | Feature |
| TKT-004 | T-ENT-01 | CRITICAL | RESOLVED | Data |
| TKT-005 | T-FRN-03 | MEDIUM | CLOSED | Onboarding |

**System Metrics:**
- CPU: 35-45% (peak during business hours)
- Memory: 60-70% (stable)
- Error rate: <0.1% (healthy)
- Uptime: 99.95% (last 30 days)
- P95 latency: 250ms (acceptable)

**Thursday:**
- [ ] Create `src/__tests__/e2e-scenarios/OWNER_PLATFORM.test.ts`

**Owner Platform Tests:**
```
1. Owner login → Dashboard loads with KPIs
2. View subscribers → All 8 visible with metrics
3. Manage subscription → Upgrade T-ENT-01 to enterprise
4. View onboarding → 3 requests, approve/reject
5. Support tickets → Open, in-progress, resolved
6. System metrics → CPU, memory, error rate
7. MRR trending → Chart showing growth
```

**Exit Gate 7 Criteria:**
✅ 8 subscribers configured with plans  
✅ MRR calculated correctly (360K DZD)  
✅ 24 subscription invoices generated  
✅ 3 onboarding requests in different states  
✅ 5 support tickets covering all statuses  
✅ System metrics baseline established  
✅ Owner platform E2E test passing  

---

## WEEK 10: ROLE-BASED TESTS

### Step 11: Create 12 Role-Based Test Files (5 days)

**Monday:**
- [ ] `ceo.test.ts` — 8 actions (approvals, user mgmt, config)
- [ ] `financeDirector.test.ts` — 7 actions (reports, FX, credit)
- [ ] `opsDirector.test.ts` — 7 actions (warehouse oversight)
- [ ] `warehouseManager.test.ts` — 7 actions (daily ops)

**Tuesday:**
- [ ] `operator.test.ts` — 7 actions (picking, packing, receiving)
- [ ] `driver.test.ts` — 6 actions (delivery, cash collection)
- [ ] `accountant.test.ts` — 7 actions (invoicing, payments, 3WM)
- [ ] `qcOfficer.test.ts` — 6 actions (inspections, claims)

**Wednesday:**
- [ ] `biAnalyst.test.ts` — 6 actions (reporting, dashboards)
- [ ] `supplier.test.ts` — 6 actions (connections, POs)
- [ ] `fieldSalesRep.test.ts` — 4 actions (orders, visits)
- [ ] `regionalManager.test.ts` — 5 actions (multi-site)

**Thursday-Friday:**
- [ ] Run all 12 role tests
- [ ] Verify each role can execute all primary actions
- [ ] Verify authorization denials for out-of-scope actions
- [ ] Fix any failing tests

**Checklist for Each Role Test:**
- [ ] 6-8 positive action tests (can do)
- [ ] 2-3 authorization denial tests (cannot do)
- [ ] Data assertions verify role-specific fields
- [ ] Error messages are appropriate

**Test Template (for each role file):**
```typescript
describe('Role: [RoleName] (U[ID])', () => {
  const user = users.find(u => u.id === 'U[ID]');
  const role = user.role;
  
  // PRIMARY ACTIONS
  test('Can perform action 1', () => {
    const result = action1(user.id);
    expect(result.success).toBe(true);
  });
  
  // ... more primary actions
  
  // AUTHORIZATION DENIALS
  test('Cannot perform unauthorized action', () => {
    const result = unauthorizedAction(user.id);
    expect(result.error).toMatch(/unauthorized|forbidden/i);
  });
});
```

**Exit Gate 8 Criteria:**
✅ 12 role test files created  
✅ 6-8 positive actions per role (76+ tests)  
✅ 2-3 authorization tests per role (36+ tests)  
✅ All 100+ role tests passing  
✅ Role coverage matrix completed  

---

## WEEK 11: FINAL VALIDATION & UAT READY

### Step 12: Full Test Suite & Documentation (5 days)

**Monday-Tuesday:**
- [ ] Run complete test suite
```bash
npm test # Run all 47 test files
```

**Expected Results:**
- Unit tests: 25+ pass
- Integration tests: 20+ pass
- E2E scenario tests: 7 pass
- Role-based tests: 100+ pass
- **Total: 150+ tests passing**

**Fix any failing tests immediately**

**Wednesday:**
- [ ] Verify all data integrity
  - Run `mock-data.test.ts` → All 25+ validation tests pass
  - Check for: duplicate IDs, broken references, invalid dates

- [ ] Verify test coverage
  - All seed data tested ✅
  - All transactions tested ✅
  - All operations tested ✅
  - All 12 roles tested ✅
  - All 7 E2E scenarios tested ✅

**Thursday:**
- [ ] Performance testing
  - Dashboard loads < 2 seconds ✅
  - List pages load < 1 second (with pagination) ✅
  - Reports generate < 5 seconds ✅
  - No N+1 query issues ✅

- [ ] Update documentation
  - Document all 8 tenants (sizes, use cases)
  - Document all 35 users (roles, access)
  - Document test scenarios & coverage
  - Create "Getting Started" guide for QA

**Friday:**
- [ ] Prepare for UAT
  - Export mock data snapshots (JSON files)
  - Create UAT test plan document
  - Prepare demo scenarios
  - Brief QA/product team on test data

**Deliverables:**
- [ ] All test files (47 files) ✅
- [ ] All mock data files (62 files) ✅
- [ ] Test results report (coverage, pass rate) ✅
- [ ] Documentation (this guide + others) ✅
- [ ] UAT readiness checklist ✅

**Exit Gate 9 Criteria (UAT Ready):**
✅ 150+ tests passing  
✅ 100% data integrity validation  
✅ All mock data files complete  
✅ Performance requirements met  
✅ Documentation complete  
✅ QA team trained  
✅ Ready for user acceptance testing  

---

## Quick Checklist by Week

```
WEEK 1: Foundation
├─ [ ] File structure created (8 directories)
├─ [ ] Constants files done (4 files)
├─ [ ] Seed data done (8 files, ~2500 lines)
├─ [ ] Validation tests done (25+ tests)
└─ Gate 1: PASS → All foundation data valid

WEEK 2-3: Procurement
├─ [ ] Connections done (12 records)
├─ [ ] Purchase orders done (20 POs)
├─ [ ] GRNs done (15 GRNs)
├─ [ ] QC inspections done (6 records)
├─ [ ] IncomingPOs done (5+ records)
├─ [ ] Integration tests done (6 tests)
├─ [ ] E2E PROCURE_TO_PAY done
└─ Gate 2: PASS → Full procurement cycle works

WEEK 4-5: Sales
├─ [ ] Sales orders done (15 SOs)
├─ [ ] Task queues done (10-15 tasks)
├─ [ ] Delivery trips done (5 trips, 20+ stops)
├─ [ ] Returns done (4 returns)
├─ [ ] Integration tests done (6 tests)
├─ [ ] E2E ORDER_TO_CASH done
└─ Gate 3: PASS → Full sales cycle works

WEEK 6: Financial
├─ [ ] Invoices done (12 invoices)
├─ [ ] Payments done (10 payments)
├─ [ ] Quality claims done (3 claims)
├─ [ ] Chart of accounts done (50 accounts)
├─ [ ] Bank reconciliation done (30 transactions)
├─ [ ] Integration tests done (6 tests)
├─ [ ] E2E FINANCIAL_CLOSING done
└─ Gate 4: PASS → Financial cycle complete

WEEK 7: Operations
├─ [ ] Cycle counts done (3 with variance)
├─ [ ] Stock adjustments done (4 records)
├─ [ ] Stock transfers done (3 transfers)
├─ [ ] Stock blocks done (3 blocks)
├─ [ ] Replenishment rules done (20 rules)
├─ [ ] Integration tests done (6 tests)
├─ [ ] E2E WAREHOUSE_OPERATIONS done
└─ Gate 5: PASS → Warehouse operations complete

WEEK 8-9: Historical & Platform
├─ [ ] Historical POs done (180 records)
├─ [ ] Historical SOs done (350 records)
├─ [ ] Historical invoices done (280 records)
├─ [ ] Historical payments done (250 records)
├─ [ ] Historical GRNs done (140 records)
├─ [ ] Subscribers done (8 records)
├─ [ ] Subscription invoices done (24 records)
├─ [ ] Onboarding requests done (3 records)
├─ [ ] Support tickets done (5 records)
├─ [ ] System metrics done
├─ [ ] E2E OWNER_PLATFORM done
└─ Gate 6-7: PASS → Platform & historical data complete

WEEK 10: Roles
├─ [ ] CEO tests done (8 actions)
├─ [ ] Finance Director tests done (7 actions)
├─ [ ] Ops Director tests done (7 actions)
├─ [ ] Warehouse Manager tests done (7 actions)
├─ [ ] Operator tests done (7 actions)
├─ [ ] Driver tests done (6 actions)
├─ [ ] Accountant tests done (7 actions)
├─ [ ] QC Officer tests done (6 actions)
├─ [ ] BI Analyst tests done (6 actions)
├─ [ ] Supplier tests done (6 actions)
├─ [ ] Field Sales tests done (4 actions)
├─ [ ] Regional Manager tests done (5 actions)
└─ Gate 8: PASS → All 12 roles covered (100+ tests)

WEEK 11: Final
├─ [ ] Full test suite run (150+ tests)
├─ [ ] Data integrity verified
├─ [ ] Test coverage confirmed
├─ [ ] Performance validated
├─ [ ] Documentation updated
├─ [ ] QA team trained
└─ Gate 9: PASS → Ready for UAT
```

---

## Common Errors & Fixes

### Error: "User U001 has invalid tenantId"
**Fix:** Check users.ts → user.tenantId must exist in tenants.ts

### Error: "Product P001 references invalid category"
**Fix:** Check products.ts → categoryId must exist in masterData.ts/PRODUCT_CATEGORIES

### Error: "PO references nonexistent vendor"
**Fix:** Check purchaseOrders.ts → vendorId must exist in vendors.ts

### Error: "GRN line productId doesn't match PO"
**Fix:** GRN lines must have exact same productIds as linked PO

### Error: "Invoice amount ≠ SO total"
**Fix:** Invoice total = SO subtotal + tax (×1.19)

### Error: "Cycle count variance calculation wrong"
**Fix:** Variance % = |counted - system| / system × 100

### Error: "Stock transfer qty exceeds available"
**Fix:** Transfer qty ≤ inventory.availableQty

---

## Need Help?

**Reference files:**
- `JAWDA_TESTING_REFACTORING_STRATEGY.md` — Full strategy & scenarios
- `JAWDA_FILE_STRUCTURE_TEMPLATES.md` — File templates & examples
- This file — Implementation checklist

**File dependencies chart:** See JAWDA_FILE_STRUCTURE_TEMPLATES.md Section: "File Dependencies"

**Test templates:** See JAWDA_TESTING_REFACTORING_STRATEGY.md Section: "Mock Data Generation Workflow"

---

**Start with Week 1 Foundation. Do not skip validation. One gate at a time.**

**Good luck! 🚀**
