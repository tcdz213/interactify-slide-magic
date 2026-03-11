# Jawda SaaS — Complete Testing & Refactoring Strategy
## Comprehensive Plan: Documentation → Implementation → Testing

**Document Version:** 1.0  
**Last Updated:** March 11, 2026  
**Status:** Ready for Implementation  

---

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [File Organization Strategy](#file-organization-strategy)
3. [Testing Implementation Phases](#testing-implementation-phases)
4. [Mock Data Generation Workflow](#mock-data-generation-workflow)
5. [End-to-End Scenario Coverage](#end-to-end-scenario-coverage)
6. [Role-Based Action Matrix](#role-based-action-matrix)
7. [Documentation Gap Analysis](#documentation-gap-analysis)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Validation & Quality Gates](#validation--quality-gates)

---

## Executive Overview

### Objectives
1. **Eliminate Documentation Gaps** — Identify missing scenarios and implement them
2. **Structured Testing** — Phase-based implementation with progressive complexity
3. **File Organization** — Logical separation of concerns for maintainability
4. **Role Coverage** — Verify every user role has actionable workflows
5. **Scenario Completeness** — All A-Z workflows tested end-to-end

### Current State
- ✅ Phase 8 Strategy document (layers 0-12 defined)
- ⚠️ 15 identified gaps (task queues, supplier fulfillment, system metrics, etc.)
- ⚠️ File organization unclear (all data mixed in one file?)
- ❌ Test structure not aligned with implementation phases
- ❌ No clear role-based action verification

### Target State
- ✅ Well-organized file structure (separated by domain)
- ✅ Gap-filling implementation with tests
- ✅ Role-based test suites (one per role)
- ✅ End-to-end scenario tests (complete workflows)
- ✅ 100% documentation coverage

---

## File Organization Strategy

### Current Problem
If all mock data is in one large file, it becomes:
- Hard to navigate (~5000+ lines)
- Difficult to maintain (changes break multiple features)
- Impossible to test incrementally
- Risky for version control (merge conflicts)

### Recommended Structure

```
src/
├── __mocks__/                          # Mock data root
│   ├── index.ts                        # Central export (re-exports all domains)
│   ├── seeds/                          # Foundation data (static)
│   │   ├── platformOwner.ts            # OWNER-001 profile + subscription plans
│   │   ├── tenants.ts                  # 8 tenant definitions (5 entrepôts + 3 fournisseurs)
│   │   ├── users.ts                    # 35 users with roles
│   │   ├── products.ts                 # 57 products (4 sectors)
│   │   ├── vendors.ts                  # 8 vendors
│   │   ├── warehouses.ts               # 9 warehouses + 31 locations
│   │   ├── carriers.ts                 # 4 carriers
│   │   └── masterData.ts               # Categories, UoMs, customers (20), payment terms
│   │
│   ├── transactions/                   # Current operational data
│   │   ├── connections.ts              # 12 supplier-warehouse connections
│   │   ├── purchaseOrders.ts           # 20 current POs with lines
│   │   ├── goodsReceipts.ts            # 15 GRNs with lines
│   │   ├── salesOrders.ts              # 15 current SOs with lines
│   │   ├── inventory.ts                # 80+ stock levels
│   │   ├── invoices.ts                 # 12 invoices
│   │   ├── payments.ts                 # 10 payments
│   │   ├── deliveryTrips.ts            # 5 trips with stops
│   │   └── returns.ts                  # 4 returns + 3 credit notes
│   │
│   ├── operations/                     # Warehouse & supply chain operations
│   │   ├── qcInspections.ts            # 6 QC records with lines
│   │   ├── putawayTasks.ts             # 8 putaway task records
│   │   ├── stockMovements.ts           # 30+ stock movement records
│   │   ├── cycleCounts.ts              # 3 cycle counts with lines
│   │   ├── stockAdjustments.ts         # 4 adjustment records
│   │   ├── stockTransfers.ts           # 3 transfer records
│   │   ├── stockBlocks.ts              # 3 blocked stock records
│   │   ├── kitOrders.ts                # 2 kit orders
│   │   ├── crossDocks.ts               # 2 cross-dock records
│   │   ├── lotBatches.ts               # 15 lot/batch records
│   │   └── serialNumbers.ts            # 20 serial number records
│   │
│   ├── financial/                      # Finance & accounting
│   │   ├── qualityClaims.ts            # 3 quality claims
│   │   ├── creditNotes.ts              # (moved from returns)
│   │   ├── bankReconciliation.ts       # GAP-11: Bank statement data
│   │   ├── chartOfAccounts.ts          # GAP-12: Account hierarchy
│   │   └── budgetCostCenters.ts        # GAP-10: Budget allocations
│   │
│   ├── platform/                       # Owner SaaS portal
│   │   ├── ownerProfile.ts             # OWNER-001 + subscription plans
│   │   ├── subscribers.ts              # 8 subscribers with KPIs
│   │   ├── subscriptionInvoices.ts     # 24 monthly invoices
│   │   ├── onboardingRequests.ts       # 3 pending/approved/rejected
│   │   ├── supportTickets.ts           # 5 support tickets
│   │   ├── systemMetrics.ts            # GAP-03: CPU, memory, errors
│   │   └── saasKpis.ts                 # MRR, churn, ARPU, GMV
│   │
│   ├── historical/                     # Time-series data (24 months)
│   │   ├── historicalPOs.ts            # 180 POs (Jan 2024 → Nov 2025)
│   │   ├── historicalSOs.ts            # 350 SOs with seasonal patterns
│   │   ├── historicalInvoices.ts       # 280 invoices
│   │   ├── historicalPayments.ts       # 250 payments
│   │   ├── historicalGrns.ts           # 140 GRNs
│   │   └── seasonalPatterns.ts         # Config: monthly volume multipliers
│   │
│   ├── gaps/                           # Gap-filling data (incremental)
│   │   ├── taskQueues.ts               # GAP-01: 10-15 task records
│   │   ├── incomingPOs.ts              # GAP-04: 5+ IncomingPO records
│   │   ├── supplierFulfillment.ts      # GAP-02: Supplier-side PO states
│   │   ├── replenishmentRules.ts       # GAP-05: Rule configurations
│   │   ├── approvalWorkflows.ts        # GAP-09: Workflow rules
│   │   ├── dockScheduling.ts           # GAP-07: Time slot data
│   │   ├── importJobs.ts               # GAP-08: Import history
│   │   ├── reservations.ts             # GAP-06: Reservation records
│   │   ├── wavePickings.ts             # GAP-14: Wave groupings
│   │   ├── offlineQueue.ts             # GAP-15: Mobile offline queue
│   │   └── salesRoutes.ts              # GAP-13: Route plans & visit logs
│   │
│   ├── utils/                          # Helpers & generators
│   │   ├── generators.ts               # Factory functions for IDs, dates
│   │   ├── dateHelpers.ts              # Seasonal date generation
│   │   ├── financialHelpers.ts         # FX conversion, tax calculation
│   │   └── validationHelpers.ts        # Data integrity checks
│   │
│   └── constants/                      # Static configuration
│       ├── roles.ts                    # 12+ role definitions with permissions
│       ├── statuses.ts                 # Status enums (DRAFT, SENT, RECEIVED, etc.)
│       ├── currencies.ts               # DZD, EUR, USD with FX rates
│       └── businessRules.ts            # Credit limits, tax rates, approval thresholds
│
├── __tests__/                          # Test suites (mirror __mocks__ structure)
│   ├── unit/
│   │   ├── seeds/                      # Foundation data tests
│   │   │   └── mock-data.test.ts       # Referential integrity validation
│   │   ├── transactions/
│   │   │   ├── purchaseOrders.test.ts
│   │   │   ├── salesOrders.test.ts
│   │   │   ├── invoices.test.ts
│   │   │   └── payments.test.ts
│   │   └── ...
│   │
│   ├── integration/                    # Cross-domain workflows
│   │   ├── procurement.test.ts         # PO → GRN → Invoice
│   │   ├── sales.test.ts               # SO → Picking → Packing → Shipping → Invoice
│   │   ├── supplierConnection.test.ts  # Connection → Incoming PO → Fulfillment
│   │   ├── delivery.test.ts            # Delivery trip → Stops → Proof of delivery
│   │   ├── return.test.ts              # SO → Return → Credit Note
│   │   ├── qualityClaim.test.ts        # QC Failure → Hold → Claim → Credit Note
│   │   └── transfer.test.ts            # Transfer → In-transit → Received
│   │
│   ├── e2e-scenarios/                  # End-to-end workflows (complete business days)
│   │   ├── CEO_MORNING_OVERVIEW.test.ts     # CEO reviews dashboard
│   │   ├── PROCURE_TO_PAY.test.ts           # Complete procurement cycle
│   │   ├── ORDER_TO_CASH.test.ts            # Complete sales cycle
│   │   ├── WAREHOUSE_OPERATIONS_DAY.test.ts # Operator's complete day
│   │   ├── DELIVERY_COMPLETE_DAY.test.ts    # Driver's complete delivery day
│   │   ├── FINANCIAL_CLOSING.test.ts        # Month-end closing process
│   │   └── SUPPLIER_ONBOARDING.test.ts      # New supplier connection flow
│   │
│   └── role-based/                    # Per-role action verification
│       ├── ceo.test.ts                 # CEO: Approvals, reporting, oversight
│       ├── financeDirector.test.ts     # Finance: Invoices, payments, reconciliation
│       ├── opsDirector.test.ts         # Ops: Warehouse oversight, KPIs
│       ├── warehouseManager.test.ts    # Manager: Daily ops, team supervision
│       ├── operator.test.ts            # Operator: Picking, packing, receiving
│       ├── driver.test.ts              # Driver: Delivery trips, cash collection
│       ├── accountant.test.ts          # Accountant: Invoicing, 3-way match
│       ├── qcOfficer.test.ts           # QC: Inspections, claims
│       ├── biAnalyst.test.ts           # BI: Reporting, dashboards
│       ├── supplier.test.ts            # Supplier: Manage connections, PO processing
│       ├── fieldSalesRep.test.ts       # Sales: Orders, customer visits
│       └── regionalManager.test.ts     # Regional: Multi-site supervision
│
├── src/
│   └── types/
│       └── mockDataTypes.ts            # TypeScript interfaces for all mock entities
```

### Separation of Concerns

| Layer | Files | Purpose | Change Frequency |
|-------|-------|---------|-----------------|
| Seeds | 10 files (1500 lines) | Static foundation data | Low (once per tenant change) |
| Transactions | 8 files (2000 lines) | Current operational state | Medium (daily scenario updates) |
| Operations | 10 files (1500 lines) | Warehouse operations | Medium (operational scenarios) |
| Financial | 5 files (800 lines) | Accounting & Finance | Medium (accounting scenarios) |
| Platform | 6 files (1000 lines) | Owner SaaS portal | Low (stable) |
| Historical | 6 files (2000 lines) | Time-series data | Low (generated once) |
| Gaps | 11 files (1500 lines) | Incremental gap-filling | High (being added) |

**Total:** ~10,000 lines across 62 files (manageable vs. 5,000+ line monolith)

---

## Testing Implementation Phases

### Phase 1: Foundation Validation (Week 1)
**Goal:** Ensure all static data is valid and references resolve

**Files to test:**
- `seeds/platformOwner.ts` — Owner profile, plans
- `seeds/tenants.ts` — 8 tenants with correct plans
- `seeds/users.ts` — 35 users with valid tenantIds, role permissions
- `seeds/products.ts` — 57 products with categories, UoMs
- `seeds/vendors.ts` — 8 vendors with status
- `seeds/warehouses.ts` — 9 warehouses + 31 locations
- `seeds/masterData.ts` — Customers, categories, UoMs

**Test file:** `__tests__/unit/seeds/mock-data.test.ts`

**Test cases:**
```typescript
describe('Mock Data Integrity', () => {
  test('Every user has valid tenantId', () => {...})
  test('Every user has valid assignedWarehouseIds', () => {...})
  test('Every product has valid category & UoM', () => {...})
  test('Every warehouse has valid locations', () => {...})
  test('Every customer has valid tenant', () => {...})
  test('All role permissions are defined', () => {...})
  test('No duplicate IDs across all entities', () => {...})
})
```

**Exit Criteria:**
- ✅ 0 referential integrity errors
- ✅ All users resolve to valid warehouses
- ✅ All products have valid categories

---

### Phase 2: Connection & Supplier Data (Week 1-2)
**Goal:** Validate supplier-warehouse connections and test connection workflows

**Files to populate:**
- `transactions/connections.ts` — 12 connections with states (CONNECTED, PENDING, REJECTED, BLOCKED)
- Gap: `gaps/supplierFulfillment.ts` — Supplier-side PO statuses

**Test file:** `__tests__/integration/supplierConnection.test.ts`

**Test cases:**
```typescript
describe('Supplier Connections', () => {
  test('Supplier can initiate connection request', () => {...})
  test('Warehouse receives connection notification', () => {...})
  test('Warehouse can approve/reject connection', () => {...})
  test('Supplier can send PO only after CONNECTED status', () => {...})
  test('Connection status flows: PENDING → CONNECTED | REJECTED', () => {...})
  test('Blocked connections prevent PO submission', () => {...})
})
```

**Implementation Order:**
1. Create connection test cases
2. Populate `connections.ts` (12 records covering all states)
3. Implement `supplierFulfillment.ts` (add PO_PREPARING, PO_SHIPPED, PO_DELIVERED states)
4. Test end-to-end: Connect → Send PO → Warehouse receives as IncomingPO

**Exit Criteria:**
- ✅ All 12 connection states correctly represented
- ✅ Supplier fulfillment statuses documented
- ✅ IncomingPO flow tested (T-FRN-01 sends PO to T-ENT-01)

---

### Phase 3: Procurement Cycle (Week 2-3)
**Goal:** Test complete PO → GRN → Invoice → Payment flow

**Files to populate:**
- `transactions/purchaseOrders.ts` — 20 current POs with scenarios
- `transactions/goodsReceipts.ts` — 15 GRNs
- `operations/qcInspections.ts` — 6 QC records
- Gap: `gaps/incomingPOs.ts` — 5+ supplier-sent POs

**Test files:**
- `__tests__/integration/procurement.test.ts` (happy path + exceptions)
- `__tests__/e2e-scenarios/PROCURE_TO_PAY.test.ts` (end-to-end)

**Test scenarios:**
1. **Happy Path:** PO → Full GRN → Accepted → Invoice → Paid
2. **Partial Delivery:** PO with 5 lines, GRN with 3, remaining pending
3. **QC Failure:** GRN → QC inspection fails → Items rejected → Return to vendor
4. **Unit Conversion:** PO in kg → GRN in sacs → Inventory in pieces
5. **Variance >5%:** GRN quantity variance → Escalation to CEO
6. **Foreign Currency:** PO in EUR → FX conversion → Invoice in DZD

**Implementation Order:**
```
1. Create PO test cases (6 scenarios above)
2. Populate purchaseOrders.ts (20 POs covering scenarios)
3. Populate goodsReceipts.ts (15 GRNs)
4. Create qcInspections.ts (6 inspection records)
5. Implement incomingPOs.ts (5 supplier-sent POs)
6. Run integration tests
7. Create E2E test (complete procurement day)
```

**Exit Criteria:**
- ✅ All 6 procurement scenarios tested
- ✅ QC failure flow verified
- ✅ FX conversion calculated correctly
- ✅ Variance escalation rules validated

---

### Phase 4: Sales Cycle (Week 3-4)
**Goal:** Test complete SO → Picking → Packing → Shipping → Invoice → Payment flow

**Files to populate:**
- `transactions/salesOrders.ts` — 15 current SOs
- `operations/putawayTasks.ts` — 8 putaway records (from GRNs)
- Gap: `gaps/taskQueues.ts` — 10-15 picking/packing/counting task records
- `transactions/deliveryTrips.ts` — 5 delivery trips with stops
- `transactions/returns.ts` — 4 returns

**Test files:**
- `__tests__/integration/sales.test.ts`
- `__tests__/e2e-scenarios/ORDER_TO_CASH.test.ts`

**Test scenarios:**
1. **Happy Path:** SO → Picking → Packing → Shipped → Delivered → Invoice → Paid
2. **Credit Hold:** Customer over credit limit → SO blocked
3. **Partial Delivery:** Multi-line SO, shipping in 2 waves
4. **Return:** Delivered SO → Customer returns item → Credit note issued
5. **Offline Order:** Mobile app (offline mode) → Order submitted when online
6. **High-Value Approval:** SO >1M DZD → CEO approval required

**Implementation Order:**
```
1. Create SO test cases (6 scenarios above)
2. Populate salesOrders.ts (15 SOs)
3. Create taskQueues.ts (picking/packing/counting tasks)
4. Populate deliveryTrips.ts (5 trips with driver + stops)
5. Populate returns.ts (4 return orders)
6. Implement delivery trip completion (stops → proofs)
7. Run integration tests
8. Create E2E test (complete sales day)
```

**Exit Criteria:**
- ✅ All 6 sales scenarios tested
- ✅ Credit limit enforcement verified
- ✅ Offline → online order flow tested
- ✅ Return → Credit note flow validated

---

### Phase 5: Warehouse Operations (Week 4-5)
**Goal:** Test daily warehouse operations and inventory management

**Files to populate:**
- `operations/cycleCounts.ts` — 3 cycle counts with variance scenarios
- `operations/stockAdjustments.ts` — 4 adjustments (positive/negative/needs approval)
- `operations/stockTransfers.ts` — 3 inter-warehouse transfers
- `operations/stockBlocks.ts` — 3 blocked stock records (quality hold)
- Gap: `gaps/replenishmentRules.ts` — Reorder point configurations

**Test files:**
- `__tests__/integration/stockManagement.test.ts`
- `__tests__/e2e-scenarios/WAREHOUSE_OPERATIONS_DAY.test.ts`

**Test scenarios:**
1. **Daily Check:** Operator reviews low stock items → Creates purchase request
2. **Cycle Count:** Count zone A (no variance), zone B (1.5%), zone C (8%)
3. **Stock Adjustment:** Found 5 items (positive), damaged 10 (negative, needs approval)
4. **Transfer:** Send 100 units to other warehouse → In-transit → Received
5. **Stock Block:** QC failure → Items blocked → Cannot be allocated to SO
6. **Reorder Point:** Inventory <50 units → Auto-alert to manager

**Implementation Order:**
```
1. Create warehouse ops test cases
2. Populate cycleCounts.ts (3 with different variance scenarios)
3. Populate stockAdjustments.ts (4 records)
4. Populate stockTransfers.ts (3 transfers)
5. Populate stockBlocks.ts (3 quality holds)
6. Create replenishmentRules.ts (low stock thresholds)
7. Run integration tests
8. Create E2E test (manager's day reviewing operations)
```

**Exit Criteria:**
- ✅ All cycle count variance levels tested
- ✅ Stock adjustment approval rules verified
- ✅ Transfer in-transit state validated
- ✅ Stock block prevents SO allocation

---

### Phase 6: Financial Operations (Week 5-6)
**Goal:** Test invoice processing, payments, and financial closing

**Files to populate:**
- `transactions/invoices.ts` — 12 invoices (paid, partial, overdue, disputed)
- `transactions/payments.ts` — 10 payments (cash, bank, cheque, mobile)
- `operations/qualityClaims.ts` — 3 quality claims
- Gap: `gaps/bankReconciliation.ts` — Bank statement data
- Gap: `gaps/chartOfAccounts.ts` — Account hierarchy

**Test files:**
- `__tests__/integration/financial.test.ts`
- `__tests__/e2e-scenarios/FINANCIAL_CLOSING.test.ts`

**Test scenarios:**
1. **Invoice Processing:** SO delivered → Invoice generated (auto-tax calculation)
2. **3-Way Match:** PO ≠ GRN ≠ Invoice → Exception flagged
3. **Partial Payment:** Invoice 500K, paid 300K → 200K pending
4. **Overdue Follow-up:** Invoice >30 days overdue → Alert
5. **Quality Claim:** Goods defective → Credit note issued
6. **FX Gain/Loss:** Vendor in EUR, paid at different rate → FX entry

**Implementation Order:**
```
1. Create financial test cases
2. Populate invoices.ts (12 with different payment states)
3. Populate payments.ts (10 with different payment methods)
4. Create qualityClaims.ts (3 claims)
5. Create bankReconciliation.ts (sample bank transactions)
6. Create chartOfAccounts.ts (debit/credit accounts)
7. Run integration tests
8. Create E2E test (month-end closing process)
```

**Exit Criteria:**
- ✅ 3-way match logic validated
- ✅ Overdue invoice aging report tested
- ✅ FX conversion entries verified
- ✅ Credit notes linked to returns/claims

---

### Phase 7: Role-Based Action Verification (Week 6)
**Goal:** Ensure every role can execute their workflows without errors

**Test files:**
- `__tests__/role-based/ceo.test.ts` — Approvals, reporting, system admin
- `__tests__/role-based/financeDirector.test.ts` — Financial oversight
- `__tests__/role-based/opsDirector.test.ts` — Operations oversight
- `__tests__/role-based/warehouseManager.test.ts` — Warehouse daily ops
- `__tests__/role-based/operator.test.ts` — Picking, packing, receiving
- `__tests__/role-based/driver.test.ts` — Delivery, cash collection
- `__tests__/role-based/accountant.test.ts` — Invoicing, payments
- `__tests__/role-based/qcOfficer.test.ts` — QC inspections, claims
- `__tests__/role-based/biAnalyst.test.ts` — Reporting, dashboards
- `__tests__/role-based/supplier.test.ts` — Connection, PO management
- `__tests__/role-based/fieldSalesRep.test.ts` — Order creation, customer visits
- `__tests__/role-based/regionalManager.test.ts` — Multi-site oversight

**Test template for each role:**
```typescript
describe('Role: [RoleName]', () => {
  let user; // User with this role
  
  beforeEach(() => {
    user = users.find(u => u.role === '[ROLE]');
  })
  
  test('Can perform primary action 1', () => {
    // Action test with authorization check
  })
  
  test('Can perform primary action 2', () => {...})
  
  test('Can perform primary action 3', () => {...})
  
  test('Cannot perform action outside scope', () => {
    // Verify authorization denial
  })
})
```

**Test Matrix:**

| Role | Actions | Access | Approvals |
|------|---------|--------|-----------|
| CEO | Dashboard, approvals >5%, user mgmt, config, audit | all warehouses | >5% variance, >1M SO |
| Finance Director | Reporting, invoice approval, FX management | all | 5% variance |
| Ops Director | Operations oversight, alert management | all | 5% variance |
| Warehouse Manager | Daily ops, team supervision, putaway | assigned WH | 2% variance |
| Operator | Picking, packing, receiving, counting | assigned WH | None |
| Driver | Delivery trips, cash collection, proof upload | assigned WH | None |
| Accountant | Invoicing, 3-way match, payment recording | all | None |
| QC Officer | Inspections, claim submission, hold release | all | None |
| BI Analyst | Report creation, dashboard access | all | None |
| Supplier | Manage connections, send PO, track fulfillment | supplier WH | None |
| Field Sales | Customer orders, offline sync, route planning | all customers | None |
| Regional Manager | Multi-site supervision, user management | 2+ WH | None |

**Exit Criteria:**
- ✅ All 12 roles have complete action coverage
- ✅ Authorization denials tested for each role
- ✅ Approval thresholds enforced per role

---

### Phase 8: Gap Filling (Week 7)
**Goal:** Implement remaining gaps identified in Phase 8 strategy

**Gaps to implement:**

| Gap | File | Records | Priority | Status |
|-----|------|---------|----------|--------|
| GAP-01 | taskQueues.ts | 10-15 | High | Phase 4 |
| GAP-02 | supplierFulfillment.ts | States | High | Phase 2 |
| GAP-03 | systemMetrics.ts | 5+ | Medium | Week 7 |
| GAP-04 | incomingPOs.ts | 5+ | High | Phase 2 |
| GAP-05 | replenishmentRules.ts | 20+ | Medium | Phase 5 |
| GAP-06 | reservations.ts | 10+ | Medium | Week 7 |
| GAP-07 | dockScheduling.ts | 15+ | Low | Week 7 |
| GAP-08 | importJobs.ts | 5+ | Low | Week 7 |
| GAP-09 | approvalWorkflows.ts | 10+ | Medium | Week 7 |
| GAP-10 | budgetCostCenters.ts | 20+ | Medium | Week 7 |
| GAP-11 | bankReconciliation.ts | 30+ | Medium | Phase 6 |
| GAP-12 | chartOfAccounts.ts | 50+ | Medium | Phase 6 |
| GAP-13 | salesRoutes.ts | 8+ | Medium | Week 7 |
| GAP-14 | wavePickings.ts | 5+ | Low | Week 8 |
| GAP-15 | offlineQueue.ts | 10+ | Low | Week 8 |

**Implementation approach:**
1. For each gap, create corresponding test file first (TDD)
2. Write test cases covering the feature
3. Populate the mock data file
4. Run tests and verify
5. Add to documentation

**Exit Criteria:**
- ✅ All 15 gaps implemented
- ✅ Test coverage >90% for each gap
- ✅ No referential integrity errors

---

### Phase 9: Historical Data & Reporting (Week 8-9)
**Goal:** Generate 24-month historical data for analytics and reporting

**Files to populate:**
- `historical/historicalPOs.ts` — 180 POs (seasonal patterns)
- `historical/historicalSOs.ts` — 350 SOs (seasonal patterns)
- `historical/historicalInvoices.ts` — 280 invoices
- `historical/historicalPayments.ts` — 250 payments
- `historical/historicalGrns.ts` — 140 GRNs
- `historical/seasonalPatterns.ts` — Config for monthly multipliers

**Test files:**
- `__tests__/unit/seeds/historicalDataValidation.test.ts`

**Implementation approach:**
```typescript
// Example: Generate seasonal PO volumes
const seasonalPatterns = {
  '2024-01': { construction: 0.6, food: 1.0, tech: 0.8 }, // Jan: low season
  '2024-03': { construction: 1.0, food: 2.5, tech: 1.0 }, // Mar: Ramadan spike
  '2024-04': { construction: 2.0, food: 1.0, tech: 1.0 }, // Apr: BTP season starts
  ...
}

// Generate POs per month following pattern
for (month in range(Jan2024 to Nov2025)) {
  factor = seasonalPatterns[month][sector]
  count = baselineVolume * factor
  // Generate `count` POs with random dates in month
}
```

**Exit Criteria:**
- ✅ 180 historical POs with proper seasonal distribution
- ✅ 350 historical SOs with seasonal spikes
- ✅ Invoice-to-PO and SO linkage maintained
- ✅ Payment aging distribution realistic (some overdue)

---

### Phase 10: Owner Platform & SaaS Data (Week 9)
**Goal:** Test owner/admin SaaS portal features

**Files to populate/verify:**
- `platform/ownerProfile.ts` — OWNER-001 + permissions
- `platform/subscribers.ts` — 8 subscribers with KPI snapshots
- `platform/subscriptionInvoices.ts` — 24 monthly invoices (3 months)
- `platform/onboardingRequests.ts` — 3 requests (pending/approved/rejected)
- `platform/supportTickets.ts` — 5 support tickets
- `platform/systemMetrics.ts` — System health data
- `platform/saasKpis.ts` — MRR, churn, ARPU, GMV

**Test files:**
- `__tests__/e2e-scenarios/OWNER_PLATFORM.test.ts`

**Test scenarios:**
1. **Owner Login:** Authenticate as OWNER-001 → Dashboard
2. **View Subscribers:** List 8 subscribers, metrics per subscriber
3. **Manage Subscription:** Upgrade T-ENT-01 from pro to enterprise
4. **Onboarding Request:** Review pending onboarding → Approve/Reject
5. **Support Tickets:** View open tickets, assign to support
6. **System Health:** Monitor CPU, memory, error rates
7. **Financial Reporting:** MRR chart, churn analysis, ARPU trend

**Exit Criteria:**
- ✅ All 8 subscribers visible in portal
- ✅ KPIs calculate correctly (MRR = sum of active subscriptions)
- ✅ Onboarding workflow tested
- ✅ Support ticket lifecycle complete

---

### Phase 11: End-to-End Scenario Tests (Week 10)
**Goal:** Test complete business workflows from start to finish

**Test files:**
- `__tests__/e2e-scenarios/CEO_MORNING_OVERVIEW.test.ts`
- `__tests__/e2e-scenarios/PROCURE_TO_PAY.test.ts`
- `__tests__/e2e-scenarios/ORDER_TO_CASH.test.ts`
- `__tests__/e2e-scenarios/WAREHOUSE_OPERATIONS_DAY.test.ts`
- `__tests__/e2e-scenarios/DELIVERY_COMPLETE_DAY.test.ts`
- `__tests__/e2e-scenarios/FINANCIAL_CLOSING.test.ts`
- `__tests__/e2e-scenarios/SUPPLIER_ONBOARDING.test.ts`

**Example: CEO_MORNING_OVERVIEW.test.ts**
```typescript
describe('CEO Morning Overview - Complete Workflow', () => {
  test('CEO logs in and views dashboard', () => {
    // 1. Authenticate as CEO (U001)
    // 2. Load dashboard KPIs
    // 3. Verify: today's SO count, pending approvals, alerts
    // 4. Verify: revenue YTD, profitability, top customers
    // 5. Verify: low stock alerts, overdue invoices, cycle count variances
    // 6. Click approval item (high-variance cycle count)
    // 7. Review and approve
    // 8. Verify status change in log
  })
  
  test('CEO reviews supplier performance', () => {
    // 1. Navigate to vendor scorecard
    // 2. Verify: on-time delivery %, defect rate %, lead time
    // 3. Compare T-FRN-01 (Condor) vs T-FRN-02 (Agro Sahel)
    // 4. Identify issues (e.g., high defect rate)
  })
  
  test('CEO manages user access', () => {
    // 1. Navigate to user management
    // 2. View all 35 users organized by tenant
    // 3. Create new user (test validation)
    // 4. Modify user role + warehouses
    // 5. Deactivate user
    // 6. Verify audit log entries
  })
})
```

**Exit Criteria:**
- ✅ All 7 end-to-end scenarios pass
- ✅ Data state consistent throughout workflow
- ✅ Audit trail recorded for all actions

---

### Phase 12: Load Testing & Performance (Week 11)
**Goal:** Validate system performance with large datasets

**Test scenarios:**
1. **Dashboard Load:** Load CEO dashboard with all KPIs (25+ queries)
2. **List Performance:** Display 350+ SOs with filters/pagination
3. **Report Generation:** Create monthly sales report (280+ invoices)
4. **Search Performance:** Search 57 products with filters
5. **Bulk Operations:** Upload 100 barcodes
6. **Concurrent Users:** 10 users accessing system simultaneously

**Exit Criteria:**
- ✅ Dashboard loads <2 seconds
- ✅ List pages load <1 second with pagination
- ✅ Reports generate <5 seconds
- ✅ No N+1 query issues

---

## Mock Data Generation Workflow

### Step-by-Step Workflow

**Week 1: Foundation**
```
Day 1-2: Create file structure & constants
  → Create __mocks__/ directory structure (20 files)
  → Populate seeds/platformOwner.ts (10 lines)
  → Populate constants/roles.ts (12 role definitions)
  
Day 3: Populate seed data
  → seeds/tenants.ts (8 records, 100 lines)
  → seeds/users.ts (35 records, 300 lines)
  → seeds/products.ts (57 products, 200 lines)
  → seeds/vendors.ts (8 vendors, 50 lines)
  
Day 4: Warehouse & Master Data
  → seeds/warehouses.ts (9 warehouses + 31 locations, 150 lines)
  → seeds/masterData.ts (customers, categories, 200 lines)
  
Day 5: Validation
  → Create & run mock-data.test.ts
  → Fix referential integrity errors
```

**Week 2-3: Transactions**
```
Day 1-2: Connections & Suppliers
  → transactions/connections.ts (12 records)
  → Run supplierConnection.test.ts
  
Day 3-4: Procurement
  → transactions/purchaseOrders.ts (20 POs)
  → transactions/goodsReceipts.ts (15 GRNs)
  → operations/qcInspections.ts (6 QC records)
  → Run procurement.test.ts
  
Day 5: Inventory
  → transactions/inventory.ts (80+ stock records)
  → Populate per product × warehouse × location
```

**Week 4-5: Sales & Operations**
```
Day 1-2: Sales Orders
  → transactions/salesOrders.ts (15 SOs)
  → gaps/taskQueues.ts (10-15 tasks)
  → Run sales.test.ts
  
Day 3-4: Delivery
  → transactions/deliveryTrips.ts (5 trips with 20+ stops)
  → transactions/returns.ts (4 returns)
  
Day 5: Warehouse Operations
  → operations/stockTransfers.ts (3 transfers)
  → operations/cycleCounts.ts (3 with variance)
  → operations/stockAdjustments.ts (4 records)
```

**Week 6: Financial**
```
Day 1-2: Invoices & Payments
  → transactions/invoices.ts (12 invoices)
  → transactions/payments.ts (10 payments)
  
Day 3: Finance Setup
  → operations/qualityClaims.ts (3 claims)
  → gaps/chartOfAccounts.ts (50 accounts)
  → gaps/bankReconciliation.ts (30 transactions)
```

**Week 7: Gaps**
```
Day 1: High Priority Gaps
  → gaps/incomingPOs.ts (5+ records)
  → gaps/supplierFulfillment.ts (states)
  → gaps/taskQueues.ts (complete)
  
Day 2-3: Medium Priority
  → gaps/approvalWorkflows.ts (10 rules)
  → gaps/replenishmentRules.ts (20 rules)
  → gaps/reservations.ts (10 records)
  
Day 4-5: Low Priority
  → gaps/dockScheduling.ts (15 slots)
  → gaps/importJobs.ts (5 jobs)
  → gaps/wavePickings.ts (5 waves)
  → gaps/offlineQueue.ts (10 items)
  → gaps/salesRoutes.ts (8 routes)
```

**Week 8-9: Historical Data**
```
Day 1-2: Generate historical POs
  → Create seasonalPatterns config
  → Generate 180 POs (Jan 2024 → Nov 2025)
  
Day 3-4: Generate historical SOs
  → Generate 350 SOs with seasonal spikes
  
Day 5: Remaining historical
  → 280 invoices
  → 250 payments
  → 140 GRNs
  → Verify aging distribution
```

**Week 10: Platform**
```
Day 1: Owner & Subscribers
  → platform/subscribers.ts (8 subscribers)
  → platform/saasKpis.ts (MRR, churn, ARPU)
  
Day 2-3: Onboarding & Support
  → platform/onboardingRequests.ts (3 requests)
  → platform/supportTickets.ts (5 tickets)
  → platform/subscriptionInvoices.ts (24 invoices)
  
Day 4-5: System Data
  → platform/systemMetrics.ts (CPU, memory, errors)
```

**Week 11: Testing & Validation**
```
All test files written and passing
```

---

## End-to-End Scenario Coverage

### Scenario 1: CEO Morning Overview (Complete Workflow)

**Narrative:** CEO logs in at 8 AM to review overnight activity and approve pending items.

**Setup:**
- Tenant: T-ENT-01 (Alger Construction Materials)
- User: U001 (Ahmed Benali — CEO)
- Data loaded: All current transactional data

**Steps:**
```
1. LOGIN: Authenticate as U001
   → Expected: Dashboard loads with KPIs

2. VIEW DASHBOARD:
   - Today's Sales Orders: 8 created
   - Yesterday's Deliveries: 6 completed, 2 pending
   - Pending Approvals: 3 items
     • Cycle count variance >5%
     • PO variance >5%
     • SO for 1.5M DZD (>1M threshold)
   - Alerts: 2
     • Overdue invoice >45 days
     • Stock below reorder point (5 items)

3. CLICK APPROVAL: Cycle count variance >5%
   → Navigate to CC-03 record (8% variance, zone C)
   → Review count details, system variance, reasons
   → Approve variance (manager counted correctly)
   → Record approval in audit log

4. CLICK APPROVAL: PO variance >5%
   → Navigate to PO-09 (variance on GRN)
   → Review GRN quantity vs. actual delivered
   → Approve with note "Quantity short due to packaging loss"

5. CLICK APPROVAL: High-value SO
   → Navigate to SO-10 (1.5M DZD sale)
   → Review customer credit limit (C008: 2M limit, used 1.5M)
   → Approve SO

6. VIEW OVERDUE INVOICES:
   → Navigate to Aged Receivables report
   → Filter >45 days: INV-F03 (60 days, customer C005)
   → Create collection task: "Call customer, request payment"

7. VIEW LOW STOCK ALERTS:
   → 5 products below reorder point
   → Click "Create Purchase Order" for cement (P001)
   → System pre-fills from default vendor + quantities
   → CEO approves PO creation
   → PO sent to GICA Ciment

8. VIEW SUPPLIER SCORECARD:
   → T-FRN-01 (Condor): 95% on-time, 2% defect rate, 5 days lead
   → T-FRN-02 (Agro Sahel): 88% on-time, 5% defect, 7 days lead
   → T-FRN-03 (TechParts): 92% on-time, 1% defect, 4 days lead

9. REVIEW FINANCIAL METRICS:
   → YTD Revenue: 8.5M DZD (12% YoY growth)
   → Profitability: 22% gross margin
   → Top 3 customers: C001, C002, C003
   → Outstanding receivables: 2.1M DZD (22 days DSO)

10. VIEW USER ACTIVITY LOG:
    → Last 24 hours: 43 transactions by 12 users
    → Failed logins: 0
    → Data exports: 1 (BI analyst report)

11. LOGOUT

EXPECTED OUTCOME:
✅ All 3 approvals recorded
✅ Collection task created
✅ PO sent to vendor
✅ Audit trail captures all actions with timestamps
✅ Financial metrics accurate
```

**Test Code Template:**
```typescript
describe('E2E: CEO Morning Overview', () => {
  const ceo = users.find(u => u.id === 'U001');
  
  test('CEO approves high-variance cycle count', () => {
    const cc = cycleCounts.find(c => c.id === 'CC-03');
    expect(cc.variancePercent).toBe(8);
    
    // Simulate approval
    approveVariance(cc.id, ceo.id, "Zone count verified");
    
    // Verify state change
    expect(getStatus(cc.id)).toBe('APPROVED');
    expect(getAuditLog(cc.id).last()).toMatch({
      action: 'APPROVED',
      by: 'U001',
      timestamp: expect.any(Date)
    });
  });
  
  test('CEO creates PO for low stock item', () => {
    const alert = alerts.find(a => a.type === 'LOW_STOCK' && a.productId === 'P001');
    expect(alert).toBeDefined();
    
    // Create PO
    const po = createPurchaseOrder({
      vendorId: 'V001',
      lines: [{ productId: 'P001', quantity: 500 }]
    });
    
    expect(po.status).toBe('SENT');
    expect(po.createdBy).toBe('U001');
  });
});
```

---

### Scenario 2: Complete Procurement Cycle

**Narrative:** A warehouse manager creates a PO, receives goods, performs QC, invoices the purchase, and pays the vendor — all in one workflow.

**Setup:**
- Tenant: T-ENT-01 (Alger Construction Materials)
- User 1: U004 (Karim Meziane — Warehouse Manager)
- User 2: U008 (Nadia Ferhat — Accountant)
- User 3: U005 (Sara Boudjemaa — QC Officer)

**Steps:**
```
Day 1 - MORNING: Create PO
  User: U004 (Warehouse Manager)
  
  1. LOGIN as warehouse manager
  2. NAVIGATE to Procurement → Create Purchase Order
  3. SELECT VENDOR: V001 (GICA Ciment)
  4. ADD LINES:
     - Ciment CPJ 42.5 (P001): 2,000 kg @ 12 DZD/kg
     - Gravier 15/25 (P005): 50 m³ @ 3,000 DZD/m³
  5. SELECT DELIVERY WAREHOUSE: wh-alger-construction
  6. SET DELIVERY DATE: 3 days from now
  7. SAVE & SEND PO
  
  Expected:
  ✅ PO created: PO-2026-0101
  ✅ Status: SENT
  ✅ Total: 176,000 DZD
  ✅ Vendor receives notification

Day 2 - AFTERNOON: Goods Arrive
  User: U006 (Tarek Ouali — Operator)
  
  1. RECEIVE goods at dock
  2. CREATE GRN: GRN-20260212-001
  3. SCAN ITEMS:
     - Ciment: 2,000 kg ✓
     - Gravier: 50 m³ ✓
  4. ALLOCATE TO LOCATIONS:
     - Ciment: 1,000 to ALG-A1-01, 1,000 to ALG-A1-02
     - Gravier: 50 to ALG-B1-01
  5. SAVE GRN
  
  Expected:
  ✅ GRN status: RECEIVED
  ✅ Stock levels updated
  ✅ Items allocated to locations

Day 2 - EVENING: QC Inspection
  User: U005 (Sara Boudjemaa — QC Officer)
  
  1. NAVIGATE to pending GRN: GRN-20260212-001
  2. INSPECT SAMPLES:
     - Ciment: Sample 1-5 (5 bags) — All pass
     - Gravier: Sample 6-10 (bucket scoop) — All pass
  3. CREATE QC RECORD:
     - Status: PASSED
     - Notes: "All samples conform to specifications"
  4. MARK GRN ACCEPTED
  
  Expected:
  ✅ QC record created: QC-20260212-001
  ✅ GRN status: ACCEPTED
  ✅ Stock now available for SO allocation

Day 3: Vendor Invoice Received
  User: U008 (Nadia Ferhat — Accountant)
  
  1. RECEIVE invoice from GICA Ciment
  2. ENTER INVOICE DATA:
     - Invoice #: GICA-20260212-5421
     - Amount: 176,000 DZD + 19% TVA = 209,440 DZD
     - Payment terms: Net 30
  3. MATCH 3-WAY:
     - PO (176K) = GRN (176K) = Invoice (176K) ✓
  4. SAVE INVOICE & APPROVE
  5. RECORD IN LEDGER:
     - DR: Inventory (209,440)
     - CR: Accounts Payable (209,440)
  
  Expected:
  ✅ Invoice created: INV-20260212-001
  ✅ Status: APPROVED (3-way match passed)
  ✅ Ledger entries recorded

Day 10 (End of payment terms): Payment
  User: U008 (Accountant)
  
  1. NAVIGATE to Payables Aging
  2. FIND invoice INV-20260212-001 (due today)
  3. CREATE PAYMENT:
     - Type: Bank Transfer (virement)
     - Amount: 209,440 DZD
     - Reference: "Payment GICA-20260212-5421"
  4. CONFIRM & SEND
  
  Expected:
  ✅ Payment created: PAY-20260222-001
  ✅ Invoice status: PAID
  ✅ Ledger entries:
     - DR: Accounts Payable (209,440)
     - CR: Bank (209,440)
  ✅ Vendor statement updated

VALIDATION:
✅ PO → GRN → Invoice → Payment chain complete
✅ Stock levels accurate
✅ Financial records balanced
✅ Audit trail complete (4 users, 7 actions, 4 days)
```

---

### Scenario 3: Complete Sales Cycle with Delivery

**Narrative:** A customer places an order online, warehouse staff picks & packs, driver delivers and collects cash, accountant invoices, customer pays.

**Setup:**
- Tenant: T-ENT-01 (Alger Construction Materials)
- Customer: C003 (Retail customer in Alger)
- Users: U006 (Operator), U007 (Driver), U008 (Accountant)

**Steps:**
```
Day 1 - MORNING: Customer Orders
  User: Customer (C003) via portal
  
  1. LOGIN to customer portal
  2. BROWSE products in catalog
  3. ADD TO CART:
     - Ciment CPJ 42.5 (P001): 500 kg @ 18 DZD/kg = 9,000 DZD
     - Brique Rouge (P003): 2,000 pcs @ 38 DZD/pc = 76,000 DZD
  4. CHECKOUT:
     - Subtotal: 85,000 DZD
     - Tax (19%): 16,150 DZD
     - Delivery: Free (>50K order)
     - Total: 101,150 DZD
  5. CONFIRM ORDER

  Expected:
  ✅ SO created: ORD-20260213-001
  ✅ Status: APPROVED (credit limit sufficient)
  ✅ Items reserved from inventory

Day 1 - AFTERNOON: Picking
  User: U006 (Operator)
  
  1. RECEIVE PICKING TASK for ORD-20260213-001
  2. NAVIGATE warehouse:
     - Go to ALG-A1-01: Pick 500 kg ciment (P001)
     - Go to ALG-D1-02: Pick 2,000 bricks (P003)
  3. SCAN each item to confirm:
     - Ciment: Scan barcode, quantity shows 500 ✓
     - Bricks: Scan barcode, quantity shows 2,000 ✓
  4. COMPLETE PICKING
  
  Expected:
  ✅ Picking task status: COMPLETED
  ✅ SO status: READY_TO_PACK

Day 1 - LATE AFTERNOON: Packing
  User: U006 (Operator)
  
  1. RECEIVE PACKING TASK for ORD-20260213-001
  2. PREPARE SHIPMENT:
     - Ciment: 1 pallet (50-bag bundles)
     - Bricks: 4 pallets (500 bricks each)
     - Total weight: 8,500 kg
  3. GENERATE SHIPPING LABEL
  4. ALLOCATE TO VEHICLE: Trans Express Van #3
  5. COMPLETE PACKING
  
  Expected:
  ✅ Packing task status: COMPLETED
  ✅ SO status: PACKED
  ✅ Shipment ready for delivery

Day 2 - MORNING: Delivery
  User: U007 (Omar Belkacem — Driver)
  
  1. RECEIVE DELIVERY ASSIGNMENT
     - Route: Alger construction sites (3 stops)
     - Stop 1: ORD-20260213-001 (C003) @ 10 AM
     - Stop 2: ORD-20260213-002 (C005) @ 11 AM
     - Stop 3: ORD-20260213-003 (C008) @ 2 PM
  
  2. AT STOP 1 (C003):
     - Arrive: 10:15 AM
     - Deliver: Unload 5 pallets
     - Customer confirms receipt
     - Collect cash: 101,150 DZD
     - Upload proof: Photo + signature
     - Mark delivered
  
  Expected:
  ✅ Delivery trip status: STOP_COMPLETED
  ✅ SO status: DELIVERED
  ✅ Cash collected: 101,150 DZD
  ✅ Proof of delivery uploaded

Day 2 - AFTERNOON: Invoice & Payment
  User: U008 (Nadia Ferhat — Accountant)
  
  1. NAVIGATE to Delivered Orders Pending Invoice
  2. SELECT ORD-20260213-001
  3. CREATE INVOICE:
     - Invoice #: Auto-generated INV-20260213-001
     - Customer: C003
     - SO reference: ORD-20260213-001
     - Subtotal: 85,000 DZD
     - Tax: 16,150 DZD
     - Total: 101,150 DZD
     - Status: SENT
  
  4. RECEIVE CASH PAYMENT:
     - Payment type: Cash
     - Amount: 101,150 DZD
     - Reference: "Cash collected by U007 at delivery"
     - Match invoice: INV-20260213-001
  
  5. RECORD PAYMENT:
     - Invoice status: PAID
     - Ledger entries:
       DR: Cash (101,150)
       CR: Sales Revenue (85,000)
       CR: Sales Tax Payable (16,150)
  
  Expected:
  ✅ Invoice created & sent
  ✅ Payment recorded
  ✅ Invoice status: PAID
  ✅ Financial records balanced

VALIDATION:
✅ SO → Picking → Packing → Shipping → Delivery → Invoice → Payment
✅ Stock levels reduced
✅ Cash collected & recorded
✅ Customer receives order on time
✅ All audit trail captured
```

---

## Role-Based Action Matrix

### Detailed Actions per Role

#### 1. CEO (U001 — Ahmed Benali)

**Primary Actions:**

| Action | Scope | Approval Authority | Related Scenarios |
|--------|-------|-------------------|-------------------|
| View Dashboard | All tenants | Self | CEO Morning Overview |
| Approve variance >5% | All WH | SYSTEM_ADMIN | Cycle count approval |
| Approve SO >1M DZD | All customers | SYSTEM_ADMIN | High-value sale |
| Manage users | All users | SYSTEM_ADMIN | User access control |
| Configure system | Platform | SYSTEM_ADMIN | Approval rules, alerts |
| Export data | All data | DATA_EXPORT | Reporting, audit |
| View audit log | All actions | AUDIT_LOG | Compliance review |
| Manage approval rules | All rules | SYSTEM_ADMIN | Change approval thresholds |

**Test Cases:**
```typescript
describe('Role: CEO', () => {
  const ceo = users.find(u => u.id === 'U001');
  
  test('Can approve variance >5%', () => {
    // CC-03 has 8% variance
    const result = approveVariance('CC-03', ceo.id);
    expect(result).toBe(APPROVED);
  });
  
  test('Can approve SO >1M DZD', () => {
    // SO-10 is 1.5M DZD
    const result = approveSalesOrder('SO-10', ceo.id);
    expect(result).toBe(APPROVED);
  });
  
  test('Can export audit log', () => {
    const data = exportAuditLog(ceo.id);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('action', 'user', 'timestamp');
  });
  
  test('Cannot approve 2% variance (too low)', () => {
    // CC-01 has 0% variance
    const result = approveVariance('CC-01', ceo.id);
    expect(result).toBe(ERROR_NOT_REQUIRED);
  });
});
```

---

#### 2. Finance Director (U002 — Anis Cherif)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| View financial reports | All tenants | All | Financial review |
| Approve variance 3-5% | All WH | AUDIT_LOG | High-variance cycle count |
| Approve payment >500K | All customers | AUDIT_LOG | Large payment authorization |
| Review FX gains/losses | All vendors | DATA_EXPORT | Currency conversion |
| Manage credit limits | Customers | AUDIT_LOG | Credit policy |
| Reconcile bank statements | All | AUDIT_LOG | Bank reconciliation |
| Approve credit notes | All | AUDIT_LOG | Return & claim approvals |

**Test Cases:**
```typescript
describe('Role: Finance Director', () => {
  const fd = users.find(u => u.id === 'U002');
  
  test('Can approve variance 3-5%', () => {
    // CC-02 has 1.5% variance
    const result = approveVariance('CC-02', fd.id);
    expect(result).toBe(APPROVED);
  });
  
  test('Can review FX gain/loss on EUR PO', () => {
    const po = purchaseOrders.find(p => p.vendorId === 'V002'); // EUR vendor
    const fxData = calculateFXGainLoss(po);
    expect(fxData).toHaveProperty('fxGain', 'fxRate', 'originalCurrency');
  });
  
  test('Cannot approve variance >5% (requires CEO)', () => {
    // CC-03 has 8% variance
    const result = approveVariance('CC-03', fd.id);
    expect(result).toBe(ERROR_INSUFFICIENT_AUTHORITY);
  });
});
```

---

#### 3. Operations Director (U003 — Rachid Hamidi)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| View operations dashboard | All WH | All | Daily ops check |
| Approve variance 3-5% | All WH | AUDIT_LOG | Cycle count review |
| Manage alerts | All | AUDIT_LOG | Alert configuration |
| Review KPIs | All | All | Operational metrics |
| Approve stock transfers | All | AUDIT_LOG | Inter-WH transfers |
| Manage warehouse rules | All | AUDIT_LOG | Reorder points, zones |
| Schedule cycle counts | All | AUDIT_LOG | Counting assignments |

**Test Cases:**
```typescript
describe('Role: Operations Director', () => {
  const od = users.find(u => u.id === 'U003');
  
  test('Can approve stock transfer Alger → General', () => {
    const transfer = stockTransfers.find(t => t.id === 'TRF-01');
    const result = approveTransfer(transfer.id, od.id);
    expect(result).toBe(APPROVED);
  });
  
  test('Can view all warehouse KPIs', () => {
    const kpis = getWarehouseKPIs(od.id);
    expect(kpis.length).toBe(9); // All 9 warehouses
    expect(kpis[0]).toHaveProperty('warehouseId', 'stockTurnover', 'receivingError');
  });
});
```

---

#### 4. Warehouse Manager (U004 — Karim Meziane)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| View warehouse dashboard | Assigned WH only | All | Daily operations |
| Create purchase orders | Assigned WH | 2% approval authority | Procure materials |
| Receive goods (GRN) | Assigned WH | All | Goods receipt |
| Manage putaway | Assigned WH | All | Stock placement |
| Schedule cycle counts | Assigned WH | All | Counting operations |
| Approve adjustments <500 units | Assigned WH | 2% authority | Stock reconciliation |
| Manage team assignments | Assigned WH | Team mgmt | Operator scheduling |

**Test Cases:**
```typescript
describe('Role: Warehouse Manager', () => {
  const wm = users.find(u => u.id === 'U004');
  
  test('Can create PO for assigned warehouse', () => {
    const po = createPurchaseOrder({
      warehouseId: 'wh-alger-construction', // Assigned to U004
      createdBy: wm.id
    });
    expect(po.status).toBe(DRAFT);
  });
  
  test('Cannot create PO for other warehouse', () => {
    const result = createPurchaseOrder({
      warehouseId: 'wh-blida-food', // Not assigned
      createdBy: wm.id
    });
    expect(result).toBe(ERROR_UNAUTHORIZED);
  });
  
  test('Can approve stock adjustment <500 units', () => {
    const adj = stockAdjustments.find(a => a.quantity < 500);
    const result = approveAdjustment(adj.id, wm.id);
    expect(result).toBe(APPROVED);
  });
});
```

---

#### 5. Operator (U006, U013, U014 — Tarek, Amina, Sofiane)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| Execute picking | Assigned WH | All | Pick SO items |
| Execute packing | Assigned WH | All | Pack shipments |
| Receive goods (GRN) | Assigned WH | All | Dock receiving |
| Perform putaway | Assigned WH | All | Place stock |
| Scan barcodes | Assigned WH | All | Inventory updates |
| Cycle counting | Assigned WH | All | Count zones |
| Record stock movements | Assigned WH | All | Movement logs |

**Test Cases:**
```typescript
describe('Role: Operator', () => {
  const operator = users.find(u => u.id === 'U006');
  
  test('Can execute picking task', () => {
    const task = pickingTasks.find(t => t.operatorId === 'U006');
    const result = executePicking(task.id, operator.id);
    expect(result.status).toBe(COMPLETED);
  });
  
  test('Cannot execute picking in other warehouse', () => {
    const task = pickingTasks.find(t => t.warehouseId !== 'wh-alger-construction');
    const result = executePicking(task.id, operator.id);
    expect(result).toBe(ERROR_UNAUTHORIZED);
  });
});
```

---

#### 6. Driver (U007, U012 — Omar, Youssef)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| View assigned deliveries | Today's route | All | Morning assignment |
| Execute delivery | Assigned stops | All | Delivery execution |
| Collect cash | Assigned stops | All | Payment collection |
| Upload proof of delivery | Assigned stops | All | Photo/signature |
| Report incident | Assigned stops | All | Issue reporting |
| Record vehicle check | Before trip | All | Vehicle condition |

**Test Cases:**
```typescript
describe('Role: Driver', () => {
  const driver = users.find(u => u.id === 'U007');
  
  test('Can complete delivery stop', () => {
    const stop = deliveryStops.find(s => s.driverId === 'U007');
    const result = completeStop(stop.id, driver.id, {
      proof: 'photo_url',
      cashCollected: 101150
    });
    expect(result.status).toBe(DELIVERED);
  });
  
  test('Can upload proof of delivery', () => {
    const stop = deliveryStops.find(s => s.driverId === 'U007');
    const result = uploadProof(stop.id, driver.id, {
      photoUrl: 's3://proof.jpg',
      signature: 'base64_signature'
    });
    expect(result.proof).toBeDefined();
  });
  
  test('Cannot execute delivery for other driver', () => {
    const stop = deliveryStops.find(s => s.driverId === 'U012');
    const result = completeStop(stop.id, driver.id);
    expect(result).toBe(ERROR_UNAUTHORIZED);
  });
});
```

---

#### 7. Accountant (U008 — Nadia Ferhat)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| Create invoices | All tenants | All | Invoice generation |
| Record payments | All tenants | All | Payment recording |
| 3-way match | All documents | All | Invoice approval |
| Reconcile bank | All accounts | All | Bank reconciliation |
| Record credit notes | All | All | Return/claim processing |
| View aging reports | All | DATA_EXPORT | AR/AP aging |
| Record journal entries | All | All | Manual GL entries |

**Test Cases:**
```typescript
describe('Role: Accountant', () => {
  const accountant = users.find(u => u.id === 'U008');
  
  test('Can create invoice from delivered SO', () => {
    const so = salesOrders.find(s => s.status === 'DELIVERED');
    const invoice = createInvoice(so.id, accountant.id);
    expect(invoice.status).toBe(SENT);
    expect(invoice.totalAmount).toBeGreaterThan(0);
  });
  
  test('Can perform 3-way match', () => {
    const po = purchaseOrders.find(p => p.id === 'PO-01');
    const grn = goodsReceipts.find(g => g.poId === po.id);
    const invoice = invoices.find(i => i.grn === grn.id);
    
    const match = perform3WayMatch(po.id, grn.id, invoice.id);
    expect(match.status).toBe(MATCHED);
  });
  
  test('Can record payment', () => {
    const invoice = invoices.find(i => i.status === 'SENT');
    const payment = recordPayment(invoice.id, accountant.id, {
      amount: invoice.totalAmount,
      method: 'BANK_TRANSFER'
    });
    expect(payment.status).toBe(RECORDED);
  });
});
```

---

#### 8. QC Officer (U005 — Sara Boudjemaa)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| Perform QC inspection | All GRNs | All | Goods quality check |
| Accept/reject GRN | All | All | Quality approval |
| Create quality claim | All | All | Defect claim |
| Place stock hold | All | All | Quality quarantine |
| Release held stock | All | All | Hold release |
| Generate defect reports | All | All | Quality reporting |

**Test Cases:**
```typescript
describe('Role: QC Officer', () => {
  const qc = users.find(u => u.id === 'U005');
  
  test('Can perform QC inspection on GRN', () => {
    const grn = goodsReceipts.find(g => g.status === 'RECEIVED');
    const inspection = performQCInspection(grn.id, qc.id, {
      samplesInspected: 5,
      result: 'PASSED'
    });
    expect(inspection.inspector).toBe(qc.id);
  });
  
  test('Can reject GRN with defects', () => {
    const grn = goodsReceipts.find(g => g.id === 'GRN-with-defects');
    const result = rejectGRN(grn.id, qc.id, {
      reason: 'Non-conforming to specifications',
      defectCount: 50
    });
    expect(result.status).toBe(REJECTED);
  });
  
  test('Can create quality claim', () => {
    const claim = createQualityClaim(qc.id, {
      grn: 'GRN-02',
      defectCount: 20,
      reason: 'Packaging damage'
    });
    expect(claim.status).toBe(OPEN);
    expect(claim.createdBy).toBe(qc.id);
  });
});
```

---

#### 9. BI Analyst (U009 — Leila Amrani)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| Create reports | All data | DATA_EXPORT | Custom reporting |
| Build dashboards | All | All | KPI dashboards |
| Export data | All | DATA_EXPORT | Data extraction |
| Access historical data | 24 months | All | Trend analysis |
| Create alerts | All | All | Automated alerts |
| Schedule reports | All | All | Report automation |

**Test Cases:**
```typescript
describe('Role: BI Analyst', () => {
  const bi = users.find(u => u.id === 'U009');
  
  test('Can create custom report', () => {
    const report = createReport(bi.id, {
      name: 'Monthly Sales by Category',
      metrics: ['revenue', 'units', 'margin'],
      filters: { month: 'March', year: 2026 }
    });
    expect(report.createdBy).toBe(bi.id);
  });
  
  test('Can export historical data', () => {
    const data = exportHistoricalData(bi.id, {
      startDate: '2024-01-01',
      endDate: '2025-11-30',
      entities: ['SO', 'INVOICE', 'PAYMENT']
    });
    expect(data.records.length).toBeGreaterThan(500);
  });
});
```

---

#### 10. Supplier (U501, U502, U503 — Condor team)

**Primary Actions:**

| Action | Scope | Authority | Related Scenarios |
|--------|-------|-----------|-------------------|
| Manage connections | Own WH | All | Connection requests |
| Accept/reject connections | Incoming | All | Connection approval |
| Send purchase orders | Connected WH | All | Order fulfillment |
| Track fulfillment | Sent orders | All | Order status |
| View customer performance | Connected WH | All | Customer scoring |
| Manage invoices | Own orders | All | Billing & AR |

**Test Cases:**
```typescript
describe('Role: Supplier', () => {
  const supplier = users.find(u => u.id === 'U501');
  
  test('Can initiate connection request', () => {
    const conn = initiateConnection(supplier.id, {
      warehouseId: 'wh-alger-construction',
      message: 'Request to supply construction materials'
    });
    expect(conn.status).toBe(PENDING);
    expect(conn.initiator).toBe(supplier.id);
  });
  
  test('Can send PO after connection is CONNECTED', () => {
    const conn = connections.find(c => c.supplierId === 'T-FRN-01' && c.status === 'CONNECTED');
    expect(conn).toBeDefined();
    
    const po = sendPurchaseOrder(supplier.id, {
      connectionId: conn.id,
      items: [{productId: 'TECH-001', qty: 10}]
    });
    expect(po.status).toBe(SENT);
  });
  
  test('Cannot send PO before connection approved', () => {
    const conn = connections.find(c => c.status === 'PENDING');
    const result = sendPurchaseOrder(supplier.id, {
      connectionId: conn.id,
      items: [{productId: 'TECH-001', qty: 10}]
    });
    expect(result).toBe(ERROR_CONNECTION_NOT_APPROVED);
  });
});
```

---

### Summary of Role Coverage

| Role | # Users | # Actions | Data Access | Approval Authority |
|------|---------|-----------|-------------|-------------------|
| CEO | 1 | 8 | All | >5% variance, >1M SO |
| Finance Director | 1 | 7 | All Financial | 3-5% variance, >500K payment |
| Ops Director | 1 | 7 | All WH | 3-5% variance |
| WH Manager | 1 | 7 | Assigned WH | 2% variance |
| Operator | 3 | 7 | Assigned WH | None |
| Driver | 2 | 6 | Assigned route | None |
| Accountant | 1 | 7 | All Financial | None |
| QC Officer | 1 | 6 | All WH | None |
| BI Analyst | 1 | 6 | All (read-only) | None |
| Supplier | 3 | 6 | Own WH + Connected | None |
| Field Sales | — | 4 | Customers | None |
| Regional Manager | 1 | 5 | 2+ WH | None |

**Total Coverage:** 12+ roles, 76+ actions, 100+ test cases

---

## Documentation Gap Analysis

### Gap-by-Gap Implementation Plan

#### GAP-01: Task Queue Data

**Problem:** TaskQueuePage shows empty queues (picking, packing, counting, putaway)

**Solution:**
- Create `gaps/taskQueues.ts` with 10-15 task records
- Link tasks to SOs (picking/packing), GRNs (putaway), and cycle counts
- Implement task state machine: ASSIGNED → IN_PROGRESS → COMPLETED

**Mock Data:**
```typescript
// Example task records
const pickingTasks = [
  {
    id: 'TASK-PICK-001',
    soId: 'ORD-20260213-001',
    warehouseId: 'wh-alger-construction',
    operatorId: 'U006',
    status: 'IN_PROGRESS',
    items: [
      { productId: 'P001', location: 'ALG-A1-01', qty: 500 },
      { productId: 'P003', location: 'ALG-D1-02', qty: 2000 }
    ],
    createdAt: '2026-03-11T08:00:00Z',
    startedAt: '2026-03-11T08:15:00Z'
  },
  // 4 more picking tasks in different statuses
  // 3 packing tasks
  // 4 putaway tasks
  // 2 cycle count tasks
]
```

**Test:**
```typescript
test('Operator can see assigned picking tasks', () => {
  const tasks = getAssignedTasks('U006'); // Operator
  expect(tasks.length).toBeGreaterThan(0);
  expect(tasks.find(t => t.type === 'PICKING')).toBeDefined();
});
```

---

#### GAP-02: Supplier Fulfillment Tracking

**Problem:** Supplier portal doesn't show fulfillment status (PREPARING, SHIPPED, DELIVERED)

**Solution:**
- Add supplier-side PO states: DRAFT → CONFIRMED → PREPARING → SHIPPED → DELIVERED
- Link IncomingPO to GRN (when received)
- Create supplier order tracking timeline

**Mock Data:**
```typescript
// Supplier fulfillment status
const supplierPOStatuses = [
  {
    id: 'SPO-001', // Supplier PO (IncomingPO at warehouse)
    warehousePoId: 'ORD-20260101-001', // Warehouse sees as IncomingPO
    supplierId: 'T-FRN-01',
    status: 'SHIPPED',
    sentAt: '2026-03-10T14:00:00Z',
    shippedAt: '2026-03-11T08:00:00Z',
    expectedDelivery: '2026-03-13T17:00:00Z',
    trackingNumber: 'CONDOR-123456'
  },
  // More supplier fulfillment records
]
```

---

#### GAP-04: IncomingPO Records

**Problem:** Multi-WMS cross-routing (T-FRN-01 sends PO to T-ENT-01) not tested

**Solution:**
- Create IncomingPO records for supplier→warehouse orders
- Link to GRN when received
- Track order status from supplier perspective

**Mock Data:**
```typescript
const incomingPOs = [
  {
    id: 'IPO-001',
    supplierId: 'T-FRN-01',
    supplierUserId: 'U501',
    warehouseId: 'wh-alger-construction',
    warehouseContactId: 'U001',
    status: 'SENT',
    lines: [
      { productId: 'TECH-001', qty: 20, unitPrice: 5000 }
    ],
    sentAt: '2026-03-10T10:00:00Z',
    linkedGRN: 'GRN-20260311-001',
    linkedGRNReceivedAt: '2026-03-11T15:00:00Z'
  },
  // 4 more IncomingPO records in different states
]
```

---

#### GAP-05: Replenishment Rules

**Problem:** ReplenishmentRulesPage empty — no reorder point configurations

**Solution:**
- Create reorder point rules per product per warehouse
- Trigger PO creation when stock falls below threshold
- Configure safety stock and economic order quantity

**Mock Data:**
```typescript
const replenishmentRules = [
  {
    id: 'RPL-001',
    productId: 'P001', // Ciment
    warehouseId: 'wh-alger-construction',
    reorderPoint: 500, // kg
    safetyStock: 200,
    economicOrderQuantity: 1000,
    vendorId: 'V001',
    leadTimeDays: 3
  },
  // 20+ rules covering all high-turnover products
]
```

---

#### GAP-09: Approval Workflow Configurations

**Problem:** ApprovalWorkflowsPage empty — no workflow rules defined

**Solution:**
- Define workflow rules: Variance thresholds, monetary limits, custom rules
- Assign approvers per rule
- Track approval history

**Mock Data:**
```typescript
const approvalWorkflows = [
  {
    id: 'WF-001',
    name: 'Stock Adjustment >500 Units',
    entity: 'STOCK_ADJUSTMENT',
    trigger: { quantity: { gt: 500 } },
    approvers: [{ role: 'OPS_DIRECTOR', level: 1 }],
    escalateTo: [{ role: 'CEO', level: 2, condition: 'if amount > 100K' }]
  },
  // 10+ workflow rules
]
```

---

#### GAP-10: Budget & Cost Centers

**Problem:** BudgetCostCentersPage empty — no budget allocations

**Solution:**
- Create cost centers per warehouse + department
- Allocate monthly budgets
- Track spending vs. budget

**Mock Data:**
```typescript
const budgetAllocations = [
  {
    id: 'BDG-2026-001',
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    costCenter: 'WH-ALGER-LABOR',
    budgetAmount: 500000,
    allocations: [
      { category: 'SALARIES', amount: 400000 },
      { category: 'OVERTIME', amount: 50000 },
      { category: 'TRAINING', amount: 50000 }
    ],
    spentAmount: 425000
  },
  // 20+ budget allocations
]
```

---

#### GAP-11: Bank Reconciliation

**Problem:** BankReconciliationPage empty — no bank statement data

**Solution:**
- Import bank transactions from mock bank statement
- Match to recorded payments
- Identify discrepancies (timing, amounts)

**Mock Data:**
```typescript
const bankTransactions = [
  {
    id: 'BANK-001',
    date: '2026-03-10',
    description: 'Payment GICA Ciment Invoice 5421',
    debit: 209440,
    credit: 0,
    balance: 5000000,
    reference: 'GICA-20260212-5421'
  },
  // 30+ bank transactions spanning 3 months
]
```

---

#### GAP-12: Chart of Accounts

**Problem:** ChartOfAccountsPage empty — no account hierarchy

**Solution:**
- Create account structure: Assets, Liabilities, Equity, Revenue, Expenses
- Map transactions to accounts
- Ensure accounting equation balances

**Mock Data:**
```typescript
const chartOfAccounts = [
  { code: '1000', name: 'Cash', type: 'ASSET', parent: '1' },
  { code: '1200', name: 'Accounts Receivable', type: 'ASSET', parent: '1' },
  { code: '1300', name: 'Inventory', type: 'ASSET', parent: '1' },
  { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', parent: '2' },
  { code: '3000', name: 'Sales Revenue', type: 'REVENUE', parent: '3' },
  { code: '4000', name: 'COGS', type: 'EXPENSE', parent: '4' },
  // 50+ accounts total
]
```

---

### Gap Implementation Priority & Timeline

| Priority | Gaps | Timeline | Owner |
|----------|------|----------|-------|
| P0 (Critical) | 01, 02, 04 | Week 2-3 | Backend |
| P1 (High) | 03, 09, 10, 11, 12 | Week 4-6 | Backend |
| P2 (Medium) | 05, 06, 13 | Week 6-7 | Backend |
| P3 (Low) | 07, 08, 14, 15 | Week 8 | Backend |

---

## Implementation Roadmap

### Timeline Overview (11 Weeks)

```
WEEK 1: Foundation
├─ Day 1-2: File structure setup
├─ Day 3-4: Seed data population (users, tenants, products)
├─ Day 5: Validation tests
└─ Deliverable: All foundation data with referential integrity

WEEK 2-3: Connections & Procurement
├─ Day 1: Supplier connections
├─ Day 2-3: PO & GRN data
├─ Day 4-5: QC inspections, integration tests
├─ Gap-02, GAP-04 implementation
└─ Deliverable: Complete procurement cycle E2E test passing

WEEK 4-5: Sales & Delivery
├─ Day 1-2: Sales orders + task queues (GAP-01)
├─ Day 3-4: Delivery trips + returns
├─ Day 5: Sales cycle E2E test
├─ Gap-01 implementation
└─ Deliverable: Complete order-to-cash E2E test passing

WEEK 6: Financial Operations
├─ Day 1-2: Invoices, payments, credit notes
├─ Day 3-4: Financial tests + (GAP-11, GAP-12)
├─ Day 5: Month-end closing E2E test
├─ Gap-11, GAP-12 implementation
└─ Deliverable: Complete financial cycle E2E test passing

WEEK 7: Gaps & Operational Data
├─ Day 1: High-priority gaps (GAP-03, GAP-09, GAP-10)
├─ Day 2-3: Cycle counts, transfers, adjustments
├─ Day 4-5: Warehouse operations E2E test
├─ Gap-03, GAP-05, GAP-09, GAP-10 implementation
└─ Deliverable: All warehousing workflows tested

WEEK 8: Historical Data
├─ Day 1-3: Generate 24-month historical data (seasonal patterns)
├─ Day 4-5: Validation + reporting tests
└─ Deliverable: 700+ historical records (PO, SO, INV, PAY)

WEEK 9: Platform & Owner Portal
├─ Day 1-2: Subscriber data, SaaS KPIs
├─ Day 3-4: Onboarding requests, support tickets
├─ Day 5: Owner portal E2E test
└─ Deliverable: Complete owner SaaS platform tested

WEEK 10: Role-Based Tests
├─ Day 1-5: Implement 12 role-based test suites
├─ Each role has 6-8 action tests
├─ Authorization denial tests
└─ Deliverable: 12 complete role-based test files

WEEK 11: Final Validation & Documentation
├─ Day 1-2: Run full test suite (47 test files)
├─ Day 3: Performance testing
├─ Day 4: Documentation updates
├─ Day 5: Demo preparation + UAT readiness
└─ Deliverable: Ready for user acceptance testing
```

### Incremental Release Gates

| Gate | Criteria | Date |
|------|----------|------|
| **Gate 1: Foundation** | All seed data + validation tests pass | Week 1 |
| **Gate 2: Procurement** | PO→GRN→Invoice cycle complete | Week 3 |
| **Gate 3: Sales** | SO→Delivery→Payment cycle complete | Week 5 |
| **Gate 4: Financial** | 3-way match + bank reconciliation | Week 6 |
| **Gate 5: Operations** | Warehouse cycles + transfers complete | Week 7 |
| **Gate 6: Historical** | 24-month data with seasonal patterns | Week 8 |
| **Gate 7: Platform** | Owner portal fully functional | Week 9 |
| **Gate 8: Roles** | All 12 roles with 100% action coverage | Week 10 |
| **Gate 9: UAT** | Full system E2E test passing | Week 11 |

---

## Validation & Quality Gates

### Data Integrity Validation

**Test File:** `__tests__/unit/seeds/mock-data.test.ts`

```typescript
describe('Mock Data Integrity Validation', () => {
  
  test('No duplicate IDs across all entities', () => {
    const allIds = [
      ...tenants.map(t => t.id),
      ...users.map(u => u.id),
      ...products.map(p => p.id),
      ...warehouses.map(w => w.id),
      // ... all entities
    ];
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });
  
  test('Every user.tenantId exists in tenants', () => {
    users.forEach(user => {
      expect(tenants.find(t => t.id === user.tenantId)).toBeDefined();
    });
  });
  
  test('Every user.assignedWarehouseIds exist in warehouses', () => {
    users.forEach(user => {
      user.assignedWarehouseIds?.forEach(whId => {
        expect(warehouses.find(w => w.id === whId)).toBeDefined();
      });
    });
  });
  
  test('Every PO.vendorId exists', () => {
    purchaseOrders.forEach(po => {
      expect(vendors.find(v => v.id === po.vendorId)).toBeDefined();
    });
  });
  
  test('Every SO.customerId exists', () => {
    salesOrders.forEach(so => {
      expect(customers.find(c => c.id === so.customerId)).toBeDefined();
    });
  });
  
  test('Every GRN references valid PO', () => {
    goodsReceipts.forEach(grn => {
      expect(purchaseOrders.find(po => po.id === grn.poId)).toBeDefined();
    });
  });
  
  test('Every Invoice references valid SO or PO', () => {
    invoices.forEach(inv => {
      const hasSO = salesOrders.find(so => so.id === inv.soId);
      const hasPO = purchaseOrders.find(po => po.id === inv.poId);
      expect(hasSO || hasPO).toBeDefined();
    });
  });
  
  test('Every Payment references valid Invoice', () => {
    payments.forEach(pay => {
      expect(invoices.find(inv => inv.id === pay.invoiceId)).toBeDefined();
    });
  });
  
  test('Every inventory item references valid product & warehouse', () => {
    inventory.forEach(inv => {
      expect(products.find(p => p.id === inv.productId)).toBeDefined();
      expect(warehouses.find(w => w.id === inv.warehouseId)).toBeDefined();
    });
  });
  
  test('Every warehouse location references valid warehouse', () => {
    warehouseLocations.forEach(loc => {
      expect(warehouses.find(w => w.id === loc.warehouseId)).toBeDefined();
    });
  });
  
  test('Every connection references valid supplier & warehouse', () => {
    connections.forEach(conn => {
      expect(tenants.find(t => t.id === conn.supplierId)).toBeDefined();
      expect(warehouses.find(w => w.id === conn.warehouseId)).toBeDefined();
    });
  });
  
  test('Product categories form valid hierarchy', () => {
    products.forEach(prod => {
      const category = productCategories.find(c => c.id === prod.categoryId);
      expect(category).toBeDefined();
      expect(category.sector).toBeDefined();
    });
  });
  
  test('All role permissions are defined', () => {
    users.forEach(user => {
      expect(user.role).toBeDefined();
      expect(roleDefinitions[user.role]).toBeDefined();
    });
  });
  
  test('Historical data has no future dates', () => {
    const now = new Date();
    historicalPOs.forEach(po => {
      expect(po.createdAt).toBeLessThanOrEqual(now);
    });
    historicalSOs.forEach(so => {
      expect(so.createdAt).toBeLessThanOrEqual(now);
    });
  });
  
  test('Invoice amounts match SO line totals', () => {
    invoices.forEach(inv => {
      if (inv.soId) {
        const so = salesOrders.find(s => s.id === inv.soId);
        const soTotal = so.lines.reduce((sum, line) => 
          sum + (line.quantity * line.unitPrice), 0);
        const invAmount = inv.totalAmount / 1.19; // Remove tax
        expect(invAmount).toBeCloseTo(soTotal, 0);
      }
    });
  });
  
  test('Customer credit used + available = credit limit', () => {
    customers.forEach(cust => {
      const usedCredit = salesOrders
        .filter(so => so.customerId === cust.id && so.status !== 'CANCELLED')
        .reduce((sum, so) => sum + so.totalAmount, 0);
      
      expect(usedCredit).toBeLessThanOrEqual(cust.creditLimit);
    });
  });
  
  test('Stock levels match allocations', () => {
    inventory.forEach(inv => {
      const allocated = salesOrders
        .filter(so => so.status === 'READY_TO_PACK')
        .flatMap(so => so.lines)
        .filter(line => line.productId === inv.productId)
        .reduce((sum, line) => sum + line.quantity, 0);
      
      expect(allocated).toBeLessThanOrEqual(inv.availableQty);
    });
  });
});
```

**Exit Criteria:**
- ✅ All 100+ test cases pass
- ✅ 0 referential integrity errors
- ✅ Financial records balanced
- ✅ Historical data consistent

---

### Test Coverage Metrics

| Category | Target | Actual |
|----------|--------|--------|
| Unit tests | 100+ | — |
| Integration tests | 20+ | — |
| E2E scenario tests | 7 | — |
| Role-based tests | 12 | — |
| Total test files | 47+ | — |
| Test cases | 500+ | — |
| Code coverage | >90% | — |

---

## Conclusion

This comprehensive testing and refactoring strategy provides:

1. **Clear Organization** — 62 files organized by domain (not 1 monolithic 5000-line file)
2. **Phased Implementation** — 11-week roadmap with clear deliverables
3. **Gap Coverage** — All 15 identified gaps with implementation plans
4. **Role Verification** — 12 roles with 6-8 actions each, fully tested
5. **E2E Scenarios** — 7 complete business workflows
6. **Quality Gates** — Validation checkpoints at each phase
7. **Documentation** — Aligned to actual system capabilities

**Next Steps:**
1. Create file structure (Week 1, Day 1-2)
2. Populate foundation data (Week 1, Day 3-4)
3. Run validation tests and fix errors (Week 1, Day 5)
4. Follow phased roadmap sequentially
5. Update documentation as gaps are filled

---

**Ready for implementation. Contact for clarifications.**
