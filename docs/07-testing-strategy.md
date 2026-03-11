# Phase 7 — Testing Strategy

---

> Technical reference for the existing test suite: tooling, structure, patterns, and coverage areas across 47 test files.

---

## 1. Tooling & Configuration

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | ^3.2.4 | Test runner (Vite-native, Jest-compatible) |
| jsdom | ^20.0.3 | Browser environment simulation |
| @testing-library/react | ^16.0.0 | Component rendering & queries |
| @testing-library/jest-dom | ^6.6.0 | DOM assertion matchers (`.toBeInTheDocument()`) |

### Config Files

| File | Role |
|------|------|
| `vitest.config.ts` | Runner config: jsdom env, globals, `@/` alias, setup file |
| `src/test/setup.ts` | Global setup: imports `@testing-library/jest-dom` and initializes `@/i18n` |
| `src/test/test-utils.tsx` | Custom `render()` wrapping components in `BrowserRouter`, `AuthProvider`, `WMSDataProvider`, `FinancialTrackingProvider` |
| `src/test/fixtures/testUsers.ts` | Shared user fixtures by role & tenant (CEO, WM, QC, Driver, etc.) + warehouse ID constants |

---

## 2. File Organization

All tests are centralized in `src/test/` — no co-located tests beside components.

### Test Categories (47 files)

| Category | Count | Pattern | Files |
|----------|-------|---------|-------|
| **Unit — Business Engines** | 11 | Pure TS, no DOM | `fifo-engine`, `pmp-engine`, `fx-engine`, `transfer-engine`, `three-way-match`, `unit-conversion`, `credit-check`, `export-utils`, `optimistic-lock`, `qty-anomaly-detector`, `rbac` |
| **Unit — Hooks** | 1 | Hook testing | `use-pagination` |
| **Component / Page** | 12 | `.test.tsx`, uses custom `render()` | `grn-page`, `cycle-count-page`, `purchase-orders-page`, `orders-page`, `payments-page`, `picking-page`, `shipping-page`, `locations-page`, `warehouses-page`, `stock-transfers-page`, `quality-control-page`, `data-table-pagination`, `status-badge`, `warehouse-scope-banner` |
| **Data Integrity** | 2 | Validate mock data consistency | `mock-data`, `i18n-language-tests` |
| **E2E Integration** | 2 | Multi-step business flows | `e2e-po-grn-stock`, `e2e-sale-picking-shipping` |
| **Phase Plan** | 10 | 90-day plan verification | `phase3-purchase-cycle`, `phase3-purchase-cycle-3-11-19`, `phase4-stock-management`, `phase5-transfers`, `phase6-sales`, `phase8-returns-quality`, `phase9-portal-mobile`, `phase11-bi-reporting-export`, `phase12-security-audit-governance`, `phase13-load-edge-closing` |
| **Cross-cutting** | 3 | Architecture & migration | `phase14-15-advanced-scenarios`, `phase-v3-5-multi-wms`, `phase-v3-6-deploy-migration`, `fix-plan-verification`, `wms-refactoring` |

---

## 3. Testing Patterns

### 3.1 Unit Tests — Business Logic Engines

Pure TypeScript tests against `src/lib/` modules. No DOM, no providers.

```ts
// Pattern: Import engine → call with mock data → assert result
import { allocateFIFO } from "@/lib/fifoEngine";

it("allocates oldest lots first (FIFO)", () => {
  const result = allocateFIFO("P009", "Farine T55", 250, mockLots, "FIFO");
  expect(result.fullyAllocated).toBe(true);
  expect(result.allocations[0].lotNumber).toBe("LOT-2025-001");
});
```

**Covered engines**: FIFO allocation, PMP valuation, FX conversion, transfer validation, 3-way match tolerance, unit conversion, credit checks, quantity anomaly detection, optimistic locking, RBAC authorization.

### 3.2 Component / Page Tests

Use custom `render()` from `test-utils.tsx` which wraps in all required providers.

```tsx
import { render } from "@/test/test-utils";
import { screen } from "@testing-library/react";

it("renders page title", () => {
  render(<GrnPage />);
  expect(screen.getByRole("heading", { name: /réception/i })).toBeInTheDocument();
});
```

**Typical assertions**:
- Page title renders (`getByRole("heading")`)
- KPI/recap cards present (`getByText(/brouillons/i)`)
- Table or empty state shown (`queryByText` + `querySelector("table")`)

### 3.3 E2E Integration Tests (In-Memory)

Multi-step business flow tests using real mock data — no API calls, no browser.

```ts
// e2e-po-grn-stock.test.ts — 474 lines, 10 scenarios:
// PO creation → unit conversion → GRN receipt → 3-way match
// → PMP calculation → stock movement → QC inspection
// → putaway → FIFO allocation → RBAC separation of duties
```

**Key technique**: Tests use actual `src/data/` arrays (not stubs), validating that mock data relationships are consistent end-to-end.

### 3.4 Phase Plan Tests

Structured as a 90-day verification plan. Each file covers a development phase:

| File | Phase | Scenarios | Key Coverage |
|------|-------|-----------|-------------|
| `phase3-purchase-cycle` | Procurement | 3.01–3.10 | PO creation, unit conversion, GRN matching, RBAC approval tiers |
| `phase3-purchase-cycle-3-11-19` | Procurement+ | 3.11–3.19 | Multi-line POs, vendor filtering, warehouse scoping |
| `phase4-stock-management` | Stock | 4.01–4.10 | Adjustments, cycle counts, variance thresholds, movements |
| `phase5-transfers` | Transfers | 5.01–5.08 | Inter-warehouse transfers, transit states, validation |
| `phase6-sales` | Sales | 6.01–6.10 | Order creation, credit checks, pricing, discounts |
| `phase8-returns-quality` | Returns/QC | 8.01–8.08 | Return reasons, dispositions, credit notes, quality claims |
| `phase9-portal-mobile` | Portals | 9.01–9.06 | Portal data structures, mobile data validation |
| `phase11-bi-reporting-export` | BI | 11.01–11.06 | Report data, export functions, chart data integrity |
| `phase12-security-audit-governance` | Security | 12.01–12.08 | RBAC enforcement, governance permissions, audit trail |
| `phase13-load-edge-closing` | Edge Cases | 13.01–13.06 | Large datasets, boundary conditions, daily closing |

### 3.5 Data Integrity Tests

Validate mock data consistency — no broken references, correct formats.

```ts
// mock-data.test.ts
it("every PO references a valid vendor", () => {
  purchaseOrders.forEach(po => {
    expect(vendors.find(v => v.id === po.vendorId)).toBeDefined();
  });
});
```

### 3.6 RBAC Tests

Comprehensive role-based access control verification:

- Approval tiers by variance percentage (auto/WM/RA/DG)
- Warehouse access scoping (`assignedWarehouseIds`)
- Document creation/approval permissions by role
- Self-approval restrictions
- Governance permissions (system-level flags)
- Role hierarchy levels

---

## 4. Test Fixtures

### User Fixtures (`fixtures/testUsers.ts`)

Pre-resolved user references by role and tenant:

| Variable | Role | Tenant |
|----------|------|--------|
| `userAhmed` | CEO | T-ENT-01 (Alger Construction) |
| `userKarim` | WarehouseManager | T-ENT-01 |
| `userSara` | QCOfficer | T-ENT-01 |
| `userNadia` | Accountant | T-ENT-01 |
| `userSamir` | WarehouseManager | T-ENT-02 (Blida Agro) |
| `userHassan` | WarehouseManager | T-ENT-03 (Boumerdes Tech) |

### Warehouse Constants

| Constant | Value |
|----------|-------|
| `WH_ALGER` | `"wh-alger-construction"` |
| `WH_BLIDA` | `"wh-blida-food"` |
| `WH_BOUMERDES` | `"wh-boumerdes-tech"` |

---

## 5. Naming Conventions

| Rule | Example |
|------|---------|
| **kebab-case** filenames | `credit-check.test.ts` |
| `.test.ts` for pure TS tests | `rbac.test.ts` |
| `.test.tsx` for JSX-rendering tests | `status-badge.test.tsx` |
| `phase{N}-` prefix for plan tests | `phase5-transfers.test.ts` |
| `e2e-` prefix for integration flows | `e2e-po-grn-stock.test.ts` |

---

## 6. Coverage Summary by Domain

| Domain | Unit | Component | Integration | Phase |
|--------|------|-----------|-------------|-------|
| **RBAC & Auth** | ✅ `rbac.test.ts` | — | — | ✅ phase12 |
| **FIFO/FEFO** | ✅ `fifo-engine` | — | ✅ e2e-po-grn | — |
| **PMP Valuation** | ✅ `pmp-engine` | — | ✅ e2e-po-grn | — |
| **FX Conversion** | ✅ `fx-engine` | — | — | — |
| **Unit Conversion** | ✅ `unit-conversion` | — | ✅ e2e-po-grn | ✅ phase3 |
| **3-Way Match** | ✅ `three-way-match` | — | ✅ e2e-po-grn | — |
| **Credit Check** | ✅ `credit-check` | — | — | ✅ phase6 |
| **Transfers** | ✅ `transfer-engine` | ✅ stock-transfers-page | — | ✅ phase5 |
| **Optimistic Lock** | ✅ `optimistic-lock` | — | — | — |
| **Anomaly Detection** | ✅ `qty-anomaly` | — | — | — |
| **Export** | ✅ `export-utils` | — | — | ✅ phase11 |
| **Procurement** | — | ✅ purchase-orders, grn | ✅ e2e-po-grn | ✅ phase3 |
| **Sales** | — | ✅ orders-page | ✅ e2e-sale | ✅ phase6 |
| **Stock Mgmt** | — | ✅ cycle-count, locations, warehouses | — | ✅ phase4 |
| **Picking/Shipping** | — | ✅ picking, shipping | ✅ e2e-sale | — |
| **Quality** | — | ✅ quality-control | — | ✅ phase8 |
| **Payments** | — | ✅ payments-page | — | — |
| **i18n** | ✅ `i18n-language` | — | — | — |
| **Mock Data** | ✅ `mock-data` | — | — | — |
| **Pagination** | ✅ `use-pagination` | ✅ data-table-pagination | — | — |
| **UI Components** | — | ✅ status-badge, warehouse-scope-banner | — | — |

---

## 7. Running Tests

```bash
pnpm test           # or: npx vitest run
pnpm test -- --watch   # watch mode
pnpm test -- src/test/rbac.test.ts   # single file
```

---

*✅ Phase 7 complete.*
