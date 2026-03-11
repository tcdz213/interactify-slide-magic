# Jawda SaaS — File Structure & Quick Reference Guide

---

## Quick Navigation

### By Phase
- **Phase 1 (Week 1):** Foundation → `File Structure Section 1`
- **Phase 2 (Week 2-3):** Connections & Procurement → `File Structure Section 2`
- **Phase 3 (Week 4-5):** Sales & Delivery → `File Structure Section 3`
- **Phase 4 (Week 6):** Financial → `File Structure Section 4`
- **Phase 5 (Week 7):** Operations → `File Structure Section 5`
- **Phase 6 (Week 8-9):** Historical & Platform → `File Structure Section 6`
- **Phase 7 (Week 10):** Role-Based Tests → `File Structure Section 7`

### By File Purpose
- **Seed Data** (static, change rarely) → `seeds/` directory
- **Transaction Data** (current state, update daily) → `transactions/` directory
- **Operations Data** (warehouse workflows) → `operations/` directory
- **Financial Data** (accounting) → `financial/` directory
- **Gap Data** (incremental additions) → `gaps/` directory
- **Test Files** → `__tests__/` directory

---

## File Structure — Detailed Breakdown

### PHASE 1: FOUNDATION (Week 1)

#### File: `src/__mocks__/seeds/platformOwner.ts`
**Purpose:** Owns the platform, manages subscriptions  
**Records:** 1  
**Size:** ~50 lines  
**Change Frequency:** Never (static)

```typescript
export const PLATFORM_OWNER = {
  id: 'OWNER-001',
  firstName: 'Yacine',
  lastName: 'Bouzid',
  email: 'yacine@jawda.dz',
  phone: '+213 555 000 001',
  role: 'PLATFORM_OWNER',
  pin: '999999',
  permissions: ['*'], // Full platform access
  createdAt: '2024-01-01T00:00:00Z',
};

export const SUBSCRIPTION_PLANS = [
  {
    id: 'PLAN-TRIAL',
    name: 'trial',
    monthlyFee: 0,
    maxUsers: 3,
    maxWarehouses: 1,
    features: ['BASIC_WMS'],
    durationDays: 30,
  },
  {
    id: 'PLAN-STANDARD',
    name: 'standard',
    monthlyFee: 25_000, // DZD
    maxUsers: 10,
    maxWarehouses: 2,
    features: ['FULL_WMS', 'BASIC_REPORTING'],
  },
  {
    id: 'PLAN-PRO',
    name: 'pro',
    monthlyFee: 55_000,
    maxUsers: 25,
    maxWarehouses: 5,
    features: ['FULL_WMS', 'BI_REPORTING', 'MULTI_WAREHOUSE', 'CONNECTIONS'],
  },
  {
    id: 'PLAN-ENTERPRISE',
    name: 'enterprise',
    monthlyFee: 120_000,
    maxUsers: 9999,
    maxWarehouses: 9999,
    features: ['*'],
  },
];
```

---

#### File: `src/__mocks__/seeds/tenants.ts`
**Purpose:** 8 organizations (5 entrepôts + 3 fournisseurs)  
**Records:** 8  
**Size:** ~250 lines  
**Change Frequency:** Very low (when new tenant added)

```typescript
export const TENANTS = [
  // === ENTREPÔTS (Warehouses) ===
  {
    id: 'T-ENT-01',
    name: 'Alger Construction Materials',
    type: 'WAREHOUSE',
    sector: 'BTP',
    city: 'Alger',
    country: 'DZ',
    plan: 'PLAN-ENTERPRISE',
    status: 'ACTIVE',
    createdAt: '2024-01-15T00:00:00Z',
    onboardedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'T-ENT-02',
    name: 'Blida Agro Distribution',
    type: 'WAREHOUSE',
    sector: 'AGROALIMENTAIRE',
    city: 'Blida',
    country: 'DZ',
    plan: 'PLAN-PRO',
    status: 'ACTIVE',
    createdAt: '2024-02-01T00:00:00Z',
  },
  // ... 3 more entrepôts
  
  // === FOURNISSEURS (Suppliers) ===
  {
    id: 'T-FRN-01',
    name: 'Condor Distribution',
    type: 'SUPPLIER',
    sector: 'ELECTRONIQUE',
    city: 'Bordj Bou Arréridj',
    country: 'DZ',
    plan: 'PLAN-PRO',
    status: 'ACTIVE',
    createdAt: '2024-02-15T00:00:00Z',
  },
  // ... 2 more fournisseurs
];
```

---

#### File: `src/__mocks__/seeds/users.ts`
**Purpose:** 35 users across all roles  
**Records:** 35  
**Size:** ~800 lines  
**Change Frequency:** Low (when new user added)

```typescript
export const USERS = [
  // === T-ENT-01 Users (14) ===
  {
    id: 'U001',
    tenantId: 'T-ENT-01',
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed@ent01.dz',
    role: 'CEO',
    permissions: ['SYSTEM_ADMIN', 'MANAGE_USERS', 'MANAGE_ROLES', ...],
    assignedWarehouseIds: ['wh-alger-construction', 'wh-alger-general'],
    active: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'U002',
    tenantId: 'T-ENT-01',
    firstName: 'Anis',
    lastName: 'Cherif',
    email: 'anis@ent01.dz',
    role: 'FINANCE_DIRECTOR',
    permissions: ['DATA_EXPORT', 'AUDIT_LOG'],
    assignedWarehouseIds: ['wh-alger-construction', 'wh-alger-general'],
    active: true,
  },
  // ... 12 more users for T-ENT-01
  
  // === T-ENT-02 Users (5) ===
  // === T-ENT-03 Users (4) ===
  // === T-ENT-04 Users (3) ===
  // === T-ENT-05 Users (2 — trial) ===
  // === T-FRN-01 Users (3) ===
  // === T-FRN-02 Users (2) ===
  // === T-FRN-03 Users (2) ===
];
```

---

#### File: `src/__mocks__/seeds/products.ts`
**Purpose:** 57 products across 4 sectors  
**Records:** 57  
**Size:** ~500 lines  
**Change Frequency:** Very low

```typescript
export const PRODUCTS = [
  // === CONSTRUCTION (16) ===
  {
    id: 'P001',
    sku: 'CONST-001',
    name: 'Ciment CPJ 42.5',
    sector: 'BTP',
    category: 'GROS_OEUVRE',
    subcategory: 'BÉTON',
    uom: 'UOM-KG',
    unitCost: 12,
    unitPrice: 18,
    active: true,
  },
  // ... 15 more construction products
  
  // === AGROALIMENTAIRE (18) ===
  {
    id: 'P017',
    sku: 'FOOD-001',
    name: 'Farine T55',
    sector: 'AGROALIMENTAIRE',
    category: 'CÉRÉALES_FARINES',
    subcategory: 'FARINE',
    uom: 'UOM-KG',
    unitCost: 45,
    unitPrice: 68,
    active: true,
    expiryRequired: true, // For FEFO logic
  },
  // ... 17 more food products
  
  // === ELECTRONIQUE (16) ===
  // === LOGISTIQUE (7) ===
];
```

---

#### File: `src/__mocks__/seeds/warehouses.ts`
**Purpose:** 9 warehouses + 31 locations  
**Records:** 9 + 31  
**Size:** ~400 lines  
**Change Frequency:** Low

```typescript
export const WAREHOUSES = [
  {
    id: 'wh-alger-construction',
    tenantId: 'T-ENT-01',
    name: 'Entrepôt Alger BTP',
    type: 'CONSTRUCTION',
    city: 'Alger',
    address: '123 Rue de la Paix, Alger',
    zones: ['A', 'B', 'C', 'D', 'E', 'F'],
    capacity: 10_000, // units
    manager: 'U004',
    active: true,
  },
  // ... 8 more warehouses
];

export const WAREHOUSE_LOCATIONS = [
  {
    id: 'ALG-A1-01',
    warehouseId: 'wh-alger-construction',
    prefix: 'ALG',
    zone: 'A',
    aisle: '1',
    rack: '01',
    type: 'AMBIENT',
    active: true,
  },
  // ... 30 more locations (3-6 per warehouse)
];
```

---

#### File: `src/__mocks__/seeds/masterData.ts`
**Purpose:** Categories, UoMs, customers, vendors, carriers  
**Records:** 100+  
**Size:** ~600 lines  
**Change Frequency:** Very low

```typescript
export const PRODUCT_CATEGORIES = [
  {
    id: 'CAT-GROS_OEUVRE',
    sector: 'BTP',
    name: 'Gros Œuvre',
  },
  // ... 8 more categories
];

export const UNITS_OF_MEASURE = [
  { id: 'UOM-KG', name: 'Kilogramme', abbr: 'kg', kind: 'WEIGHT' },
  { id: 'UOM-L', name: 'Litre', abbr: 'L', kind: 'VOLUME' },
  // ... 13 more UoMs
];

export const CUSTOMERS = [
  {
    id: 'C001',
    tenantId: 'T-ENT-01',
    name: 'Retail Store #1',
    city: 'Alger',
    creditLimit: 500_000,
    active: true,
  },
  // ... 19 more customers (grouped by tenant)
];

export const VENDORS = [
  {
    id: 'V001',
    name: 'GICA Ciment',
    city: 'Alger',
    sector: 'BTP',
    status: 'ACTIVE',
    currency: 'DZD',
  },
  // ... 7 more vendors
];

export const CARRIERS = [
  {
    id: 'CAR-001',
    name: 'Trans Express Alger',
    vehicles: 12,
    coverage: ['Alger', 'Blida', 'Tipaza', 'Boumerdes'],
  },
  // ... 3 more carriers
];
```

---

### PHASE 2: CONNECTIONS & PROCUREMENT (Week 2-3)

#### File: `src/__mocks__/transactions/connections.ts`
**Purpose:** 12 supplier-warehouse connections  
**Records:** 12  
**Size:** ~250 lines  
**Change Frequency:** Medium (test different states)

```typescript
export const SUPPLIER_WAREHOUSE_CONNECTIONS = [
  {
    id: 'CONN-001',
    supplierId: 'T-FRN-01', // Condor
    warehouseId: 'wh-alger-construction', // T-ENT-01
    status: 'CONNECTED',
    initiatedBy: 'SUPPLIER',
    initiatedAt: '2024-06-01T00:00:00Z',
    approvedAt: '2024-06-02T00:00:00Z',
    approvedBy: 'U001',
  },
  // CONN-002: CONNECTED (other warehouse)
  // CONN-003: CONNECTED (food supplier)
  // CONN-004: CONNECTED (tech parts)
  // CONN-005: PENDING (supplier requested, awaiting approval)
  // CONN-006: REJECTED (warehouse rejected)
  // CONN-007: PENDING (warehouse requested)
  // CONN-008: CONNECTED (cross-sector)
  // CONN-009: CONNECTED (food→general)
  // CONN-010: BLOCKED (tests blocked state)
  // CONN-011: CONNECTED (tech parts→BTP)
  // CONN-012: PENDING (supplier requested)
];

export const CONNECTION_NOTIFICATIONS = [
  // When connection status changes, create notification record
];
```

---

#### File: `src/__mocks__/transactions/purchaseOrders.ts`
**Purpose:** 20 current POs covering 6 scenarios  
**Records:** 20 POs + lines  
**Size:** ~600 lines  
**Change Frequency:** Medium (add scenarios)

```typescript
export const PURCHASE_ORDERS = [
  // === PO-01: Happy path ===
  {
    id: 'PO-2026-0101',
    vendorId: 'V001',
    warehouseId: 'wh-alger-construction',
    status: 'RECEIVED',
    lines: [
      {
        productId: 'P001',
        quantity: 2_000,
        uom: 'UOM-KG',
        unitPrice: 12,
        totalPrice: 24_000,
      },
      {
        productId: 'P005',
        quantity: 50,
        uom: 'UOM-M3',
        unitPrice: 3_000,
        totalPrice: 150_000,
      },
    ],
    totalAmount: 174_000,
    createdBy: 'U004',
    createdAt: '2026-02-10T00:00:00Z',
    sentAt: '2026-02-10T10:00:00Z',
    deliveryDate: '2026-02-13T00:00:00Z',
  },
  
  // === PO-02: Partial GRN ===
  {
    id: 'PO-2026-0102',
    vendorId: 'V001',
    status: 'PARTIALLY_RECEIVED',
    lines: [
      { productId: 'P001', quantity: 1_000, unitPrice: 12, totalPrice: 12_000 },
      { productId: 'P003', quantity: 5_000, unitPrice: 25, totalPrice: 125_000 },
      { productId: 'P004', quantity: 100, unitPrice: 3_500, totalPrice: 350_000 },
    ],
    totalAmount: 487_000,
    createdBy: 'U004',
    createdAt: '2026-02-15T00:00:00Z',
    linkedGRN: 'GRN-20260220-001', // Partial: only 2 lines received
  },
  
  // === PO-03: QC failure ===
  {
    id: 'PO-2026-0103',
    vendorId: 'V004',
    warehouseId: 'wh-blida-food',
    status: 'CONFIRMED',
    lines: [
      { productId: 'P017', quantity: 1_000, unitPrice: 45, totalPrice: 45_000 },
      { productId: 'P018', quantity: 500, unitPrice: 650, totalPrice: 325_000 },
    ],
    totalAmount: 370_000,
    linkedGRN: 'GRN-20260310-003',
    // QC inspection will reject items
  },
  
  // ... 17 more POs covering scenarios
];
```

---

#### File: `src/__mocks__/transactions/goodsReceipts.ts`
**Purpose:** 15 GRNs with QC integration  
**Records:** 15 GRNs + lines  
**Size:** ~400 lines  
**Change Frequency:** Medium

```typescript
export const GOODS_RECEIPTS = [
  {
    id: 'GRN-20260213-001',
    poId: 'PO-2026-0101',
    warehouseId: 'wh-alger-construction',
    status: 'ACCEPTED',
    receivedAt: '2026-02-13T14:30:00Z',
    receivedBy: 'U006',
    lines: [
      {
        productId: 'P001',
        qtyReceived: 2_000,
        qtyInvoiced: 2_000,
        locationId: 'ALG-A1-01',
      },
      {
        productId: 'P005',
        qtyReceived: 50,
        qtyInvoiced: 50,
        locationId: 'ALG-B1-01',
      },
    ],
    qcInspectionId: 'QC-20260213-001',
    qcStatus: 'PASSED',
  },
  
  // GRN-20260220-001: Partial GRN (only 2 lines)
  // GRN-20260310-003: QC failed → linked to quality claim
  // ... 12 more GRNs
];
```

---

#### File: `src/__mocks__/operations/qcInspections.ts`
**Purpose:** 6 QC inspections (passed, failed, pending)  
**Records:** 6  
**Size:** ~300 lines  
**Change Frequency:** Medium

```typescript
export const QC_INSPECTIONS = [
  {
    id: 'QC-20260213-001',
    grnId: 'GRN-20260213-001',
    inspectorId: 'U005',
    inspectedAt: '2026-02-13T15:00:00Z',
    status: 'PASSED',
    samplesInspected: 5,
    defectCount: 0,
    findings: 'All samples conform to specifications',
  },
  
  {
    id: 'QC-20260310-001',
    grnId: 'GRN-20260310-003',
    inspectorId: 'U005',
    status: 'FAILED',
    samplesInspected: 5,
    defectCount: 12,
    findings: 'Non-conforming packaging, 2.4% defect rate',
    failureReason: 'PACKAGING_DAMAGE',
  },
  
  // QC-020260315-001: On hold pending inspection
  // ... 3 more QC records
];
```

---

### PHASE 3: SALES & DELIVERY (Week 4-5)

#### File: `src/__mocks__/transactions/salesOrders.ts`
**Purpose:** 15 current SOs covering 6 scenarios  
**Records:** 15 SOs + lines  
**Size:** ~500 lines  
**Change Frequency:** Medium

```typescript
export const SALES_ORDERS = [
  // === SO-01: Happy path ===
  {
    id: 'ORD-20260213-001',
    customerId: 'C003',
    warehouseId: 'wh-alger-construction',
    status: 'DELIVERED',
    lines: [
      {
        productId: 'P001',
        quantity: 500,
        unitPrice: 18,
        totalPrice: 9_000,
      },
      {
        productId: 'P003',
        quantity: 2_000,
        unitPrice: 38,
        totalPrice: 76_000,
      },
    ],
    subtotal: 85_000,
    tax: 16_150,
    totalAmount: 101_150,
    createdBy: 'C003', // Portal order
    createdAt: '2026-02-13T08:00:00Z',
    approvedAt: '2026-02-13T08:15:00Z',
    pickedAt: '2026-02-13T14:00:00Z',
    packedAt: '2026-02-13T15:30:00Z',
    shippedAt: '2026-02-14T08:00:00Z',
    deliveredAt: '2026-02-14T10:30:00Z',
    linkedInvoice: 'INV-20260214-001',
  },
  
  // === SO-02: Credit hold ===
  {
    id: 'ORD-20260214-002',
    customerId: 'C005',
    status: 'CREDIT_HOLD',
    lines: [{...}],
    totalAmount: 250_000,
    holdReason: 'Customer credit limit exceeded',
    holdAt: '2026-02-14T10:00:00Z',
  },
  
  // === SO-03: Offline order ===
  {
    id: 'ORD-20260215-003',
    createdBy: 'U013', // Field sales rep
    createdAt: '2026-02-15T09:30:00Z', // Offline
    syncedAt: '2026-02-15T14:00:00Z', // When online
    status: 'APPROVED',
  },
  
  // ... 12 more SOs
];
```

---

#### File: `src/__mocks__/gaps/taskQueues.ts`
**Purpose:** 10-15 task records for picking, packing, counting, putaway  
**Records:** 15  
**Size:** ~300 lines  
**Change Frequency:** High (daily updates)

```typescript
export const TASK_QUEUE = [
  // === PICKING TASKS ===
  {
    id: 'TASK-PICK-001',
    type: 'PICKING',
    soId: 'ORD-20260213-001',
    warehouseId: 'wh-alger-construction',
    assignedTo: 'U006',
    status: 'IN_PROGRESS',
    lines: [
      { productId: 'P001', location: 'ALG-A1-01', quantity: 500 },
      { productId: 'P003', location: 'ALG-D1-02', quantity: 2_000 },
    ],
    createdAt: '2026-02-13T08:00:00Z',
    startedAt: '2026-02-13T08:15:00Z',
  },
  
  {
    id: 'TASK-PICK-002',
    soId: 'ORD-20260214-001',
    status: 'ASSIGNED',
    // Not yet started
  },
  
  // === PACKING TASKS ===
  {
    id: 'TASK-PACK-001',
    type: 'PACKING',
    soId: 'ORD-20260213-001',
    assignedTo: 'U006',
    status: 'READY',
    createdAt: '2026-02-13T14:00:00Z',
  },
  
  // === PUTAWAY TASKS ===
  {
    id: 'TASK-PUT-001',
    type: 'PUTAWAY',
    grnId: 'GRN-20260213-001',
    warehouseId: 'wh-alger-construction',
    assignedTo: 'U013',
    status: 'ASSIGNED',
  },
  
  // === CYCLE COUNT TASKS ===
  {
    id: 'TASK-CC-001',
    type: 'CYCLE_COUNT',
    warehouseId: 'wh-alger-construction',
    zone: 'A',
    assignedTo: 'U013',
    status: 'ASSIGNED',
  },
  
  // ... more task records
];
```

---

#### File: `src/__mocks__/transactions/deliveryTrips.ts`
**Purpose:** 5 delivery trips with 20+ stops  
**Records:** 5 trips + stops  
**Size:** ~400 lines  
**Change Frequency:** High (daily updates)

```typescript
export const DELIVERY_TRIPS = [
  {
    id: 'TRIP-20260214-001',
    driverId: 'U007', // Omar
    vehicleId: 'VH-001',
    startDate: '2026-02-14T07:00:00Z',
    status: 'COMPLETED',
    stops: [
      {
        id: 'STOP-001',
        sequence: 1,
        soId: 'ORD-20260213-001',
        customerId: 'C003',
        address: 'Alger Site #1',
        latitude: 36.7538,
        longitude: 3.0588,
        plannedTime: '2026-02-14T10:00:00Z',
        actualTime: '2026-02-14T10:15:00Z',
        status: 'DELIVERED',
        cashCollected: 101_150,
        proofUrl: 's3://proofs/stop001.jpg',
      },
      {
        id: 'STOP-002',
        soId: 'ORD-20260213-002',
        customerId: 'C005',
        status: 'DELIVERED',
        // ...
      },
      // ... 4 more stops
    ],
    totalStops: 6,
    completedStops: 6,
    totalCashCollected: 450_000,
  },
  
  {
    id: 'TRIP-20260214-002',
    driverId: 'U012', // Youssef
    status: 'IN_PROGRESS',
    stops: [
      // Stop 1 completed
      // Stop 2 in progress
      // Stop 3-4 pending
    ],
  },
  
  // ... 3 more trips
];
```

---

### PHASE 4: FINANCIAL (Week 6)

#### File: `src/__mocks__/transactions/invoices.ts`
**Purpose:** 12 invoices (paid, partial, overdue, disputed)  
**Records:** 12  
**Size:** ~300 lines  
**Change Frequency:** Medium

```typescript
export const INVOICES = [
  {
    id: 'INV-20260214-001',
    soId: 'ORD-20260213-001',
    customerId: 'C003',
    status: 'PAID',
    subtotal: 85_000,
    tax: 16_150,
    totalAmount: 101_150,
    invoiceDate: '2026-02-14T00:00:00Z',
    dueDate: '2026-03-01T00:00:00Z',
    invoicedBy: 'U008',
    linkedPayment: 'PAY-20260214-001',
    paidAt: '2026-02-14T14:30:00Z',
  },
  
  {
    id: 'INV-20260215-002',
    customerId: 'C005',
    status: 'PARTIALLY_PAID',
    totalAmount: 250_000,
    paidAmount: 150_000,
    remainingAmount: 100_000,
    linkedPayments: ['PAY-20260215-001'],
  },
  
  {
    id: 'INV-20260101-003',
    customerId: 'C001',
    status: 'OVERDUE',
    totalAmount: 500_000,
    dueDate: '2026-02-01T00:00:00Z',
    overdueBy: 38, // days
    paidAmount: 0,
  },
  
  // ... 9 more invoices
];
```

---

#### File: `src/__mocks__/transactions/payments.ts`
**Purpose:** 10 payments (cash, bank, cheque, mobile)  
**Records:** 10  
**Size:** ~250 lines  
**Change Frequency:** Medium

```typescript
export const PAYMENTS = [
  {
    id: 'PAY-20260214-001',
    invoiceId: 'INV-20260214-001',
    customerId: 'C003',
    amount: 101_150,
    method: 'CASH',
    reference: 'Cash collected by driver U007',
    recordedBy: 'U008',
    recordedAt: '2026-02-14T15:00:00Z',
    status: 'RECORDED',
  },
  
  {
    id: 'PAY-20260215-001',
    invoiceId: 'INV-20260215-002',
    amount: 150_000,
    method: 'BANK_TRANSFER',
    reference: 'Virement bancaire',
    recordedAt: '2026-02-15T10:00:00Z',
    status: 'RECORDED',
  },
  
  // ... 8 more payments (cheque, mobile, etc.)
];
```

---

#### File: `src/__mocks__/operations/qualityClaims.ts`
**Purpose:** 3 quality claims linked to returns/QC failures  
**Records:** 3  
**Size:** ~200 lines  
**Change Frequency:** Low

```typescript
export const QUALITY_CLAIMS = [
  {
    id: 'QC-CLAIM-001',
    grnId: 'GRN-20260310-003',
    vendorId: 'V004',
    qcInspectionId: 'QC-20260310-001',
    defectCount: 12,
    defectReason: 'PACKAGING_DAMAGE',
    claimAmount: 36_000, // 12 units × 3,000 each
    status: 'OPEN',
    createdBy: 'U005',
    createdAt: '2026-03-10T15:00:00Z',
    linkedCreditNote: 'CN-20260312-001',
  },
  
  // ... 2 more claims
];
```

---

### PHASE 5: OPERATIONS (Week 7)

#### File: `src/__mocks__/operations/cycleCounts.ts`
**Purpose:** 3 cycle counts (no variance, 1.5% variance, 8% variance)  
**Records:** 3  
**Size:** ~300 lines  
**Change Frequency:** Medium

```typescript
export const CYCLE_COUNTS = [
  {
    id: 'CC-01',
    warehouseId: 'wh-alger-construction',
    zone: 'A',
    status: 'COMPLETED',
    countedBy: 'U013',
    countedAt: '2026-03-05T14:00:00Z',
    lines: [
      {
        productId: 'P001',
        locationId: 'ALG-A1-01',
        systemQty: 1_000,
        countedQty: 1_000,
        variance: 0,
      },
      // ... 10 more lines
    ],
    totalVariance: 0,
    variancePercent: 0,
    status: 'APPROVED',
  },
  
  {
    id: 'CC-02',
    zone: 'B',
    status: 'COMPLETED',
    lines: [
      // Variance: 15 units counted, system says 1,000
      // Variance %: 1.5%
    ],
    totalVariance: 15,
    variancePercent: 1.5,
    status: 'APPROVED',
    approvedBy: 'U003', // Ops director
  },
  
  {
    id: 'CC-03',
    zone: 'C',
    status: 'PENDING_APPROVAL',
    lines: [
      // System: 500 units, Counted: 410 units
      // Variance: 90 units (18% loss)
    ],
    totalVariance: 90,
    variancePercent: 18, // Will be escalated to CEO
    status: 'PENDING_APPROVAL',
    escalatedTo: 'U001',
  },
];
```

---

#### File: `src/__mocks__/operations/stockTransfers.ts`
**Purpose:** 3 inter-warehouse transfers  
**Records:** 3  
**Size:** ~200 lines  
**Change Frequency:** Medium

```typescript
export const STOCK_TRANSFERS = [
  {
    id: 'TRF-01',
    fromWarehouse: 'wh-alger-construction',
    toWarehouse: 'wh-alger-general',
    status: 'COMPLETED',
    lines: [
      {
        productId: 'P001',
        quantity: 500,
        locationFrom: 'ALG-A1-01',
        locationTo: 'AGN-A1-01',
      },
    ],
    createdAt: '2026-02-20T00:00:00Z',
    shippedAt: '2026-02-20T10:00:00Z',
    receivedAt: '2026-02-21T14:00:00Z',
    receivedBy: 'U302',
  },
  
  {
    id: 'TRF-02',
    fromWarehouse: 'wh-blida-food',
    toWarehouse: 'wh-alger-construction',
    status: 'IN_TRANSIT',
    lines: [{...}],
    shippedAt: '2026-03-10T08:00:00Z',
    expectedDelivery: '2026-03-11T16:00:00Z',
  },
  
  // TRF-03: Cancelled (insufficient stock)
];
```

---

#### File: `src/__mocks__/operations/stockAdjustments.ts`
**Purpose:** 4 stock adjustments (positive, negative, needs approval)  
**Records:** 4  
**Size:** ~200 lines  
**Change Frequency:** Medium

```typescript
export const STOCK_ADJUSTMENTS = [
  {
    id: 'ADJ-01',
    warehouseId: 'wh-alger-construction',
    productId: 'P001',
    type: 'INCREASE',
    quantity: 50,
    reason: 'Found during cycle count',
    status: 'APPROVED',
    approvedBy: 'U004',
    approvedAt: '2026-03-05T15:00:00Z',
  },
  
  {
    id: 'ADJ-02',
    warehouseId: 'wh-alger-construction',
    productId: 'P003',
    type: 'DECREASE',
    quantity: 250, // Damaged goods
    reason: 'Damaged by forklift',
    status: 'PENDING_APPROVAL',
    needsApproval: true,
    approvalThreshold: 100, // Needs approval >100 units
  },
  
  // ... 2 more adjustments
];
```

---

### PHASE 6: HISTORICAL & PLATFORM (Week 8-9)

#### File: `src/__mocks__/historical/seasonalPatterns.ts`
**Purpose:** Config for seasonal volume multipliers  
**Records:** 24 months  
**Size:** ~150 lines  
**Change Frequency:** Never (static)

```typescript
export const SEASONAL_PATTERNS = {
  '2024-01': { construction: 0.6, food: 1.0, tech: 0.8 }, // Low season
  '2024-02': { construction: 0.7, food: 1.0, tech: 0.85 },
  '2024-03': { construction: 1.0, food: 2.5, tech: 1.0 }, // Ramadan spike
  '2024-04': { construction: 2.0, food: 1.0, tech: 1.0 }, // BTP season
  '2024-05': { construction: 2.2, food: 1.0, tech: 1.0 },
  '2024-06': { construction: 2.0, food: 1.0, tech: 1.0 },
  '2024-07': { construction: 1.8, food: 1.0, tech: 1.2 }, // Tech back-to-school
  '2024-08': { construction: 1.5, food: 1.0, tech: 1.5 },
  '2024-09': { construction: 1.2, food: 1.0, tech: 2.0 }, // School peak
  '2024-10': { construction: 1.0, food: 1.0, tech: 1.0 },
  '2024-11': { construction: 0.8, food: 1.5, tech: 2.0 }, // Year-end
  '2024-12': { construction: 0.6, food: 2.0, tech: 2.5 },
  // ... 2025, 2026
};

// Usage: for each month, multiply baseline volume by factor
// e.g., March 2024 food = 20 SO/month × 2.5 = 50 SOs
```

---

#### File: `src/__mocks__/historical/historicalPOs.ts`
**Purpose:** 180 POs spanning Jan 2024 → Nov 2025  
**Records:** 180  
**Size:** ~1000 lines  
**Change Frequency:** Never (static historical)

```typescript
// Generate POs per month following seasonal patterns
// Example structure:
export const HISTORICAL_POS = [
  // === Jan 2024 (low season) ===
  {
    id: 'PO-2024-0101',
    vendorId: 'V001',
    warehouseId: 'wh-alger-construction',
    createdAt: '2024-01-05T10:00:00Z',
    totalAmount: 150_000,
    status: 'COMPLETED',
    // ...
  },
  {
    id: 'PO-2024-0102',
    createdAt: '2024-01-12T10:00:00Z',
    // ...
  },
  // Total: 3 POs in Jan (construction baseline)
  
  // === Feb 2024 ===
  // 4 POs (0.7 × baseline)
  
  // === Mar 2024 (Ramadan) ===
  // 8 POs for food (2.5 × baseline)
  // 3 POs for construction (1.0 × baseline)
  
  // ... continues to Nov 2025 = 180 total
];
```

---

#### File: `src/__mocks__/platform/subscribers.ts`
**Purpose:** 8 subscribers with KPI snapshots  
**Records:** 8  
**Size:** ~250 lines  
**Change Frequency:** Low

```typescript
export const SAAS_SUBSCRIBERS = [
  {
    id: 'SUB-001',
    tenantId: 'T-ENT-01',
    planId: 'PLAN-ENTERPRISE',
    monthlyFee: 120_000,
    status: 'ACTIVE',
    activeSince: '2024-01-15',
    users: 14,
    warehouses: 1,
    gmv: 45_000_000, // Total transaction value
    mrr: 120_000,
    kpis: {
      dailyOrders: 12.5,
      fulfillmentRate: 98.5,
      customerSatisfaction: 4.6, // /5
    },
  },
  {
    id: 'SUB-002',
    tenantId: 'T-ENT-02',
    planId: 'PLAN-PRO',
    monthlyFee: 55_000,
    status: 'ACTIVE',
    users: 5,
    warehouses: 1,
  },
  // ... 6 more subscribers
];
```

---

### PHASE 7: ROLE-BASED TESTS (Week 10)

#### File: `src/__tests__/role-based/ceo.test.ts`
**Purpose:** CEO (U001) action verification  
**Test Cases:** 8+  
**Size:** ~400 lines

```typescript
describe('Role: CEO (U001)', () => {
  const ceo = users.find(u => u.id === 'U001');
  
  test('Can approve variance >5%', () => {
    const cc = cycleCounts.find(c => c.id === 'CC-03');
    expect(cc.variancePercent).toBeGreaterThan(5);
    
    const result = approveVariance(cc.id, ceo.id, 'Approved');
    expect(result.status).toBe('APPROVED');
    expect(result.approvedBy).toBe('U001');
  });
  
  test('Can approve SO >1M DZD', () => {
    const so = salesOrders.find(s => s.id === 'SO-10');
    expect(so.totalAmount).toBeGreaterThan(1_000_000);
    
    const result = approveSalesOrder(so.id, ceo.id);
    expect(result.status).toBe('APPROVED');
  });
  
  test('Can manage users', () => {
    const newUser = {
      firstName: 'Test',
      lastName: 'User',
      role: 'OPERATOR',
      tenantId: 'T-ENT-01',
    };
    const result = createUser(newUser, ceo.id);
    expect(result.createdBy).toBe('U001');
  });
  
  test('Can export audit log', () => {
    const log = exportAuditLog(ceo.id);
    expect(log).toHaveLength(expect.any(Number));
    expect(log[0]).toHaveProperty('action', 'user', 'timestamp');
  });
  
  test('Cannot approve 2% variance (too low)', () => {
    const cc = cycleCounts.find(c => c.id === 'CC-01');
    expect(cc.variancePercent).toBeLessThan(5);
    
    const result = approveVariance(cc.id, ceo.id);
    expect(result).toEqual(expect.objectContaining({
      error: 'Variance approval not required'
    }));
  });
});
```

---

## Quick Reference: Which File to Edit for...

### "I need to add a new supplier"
→ `src/__mocks__/seeds/tenants.ts` (add to TENANTS array)

### "I need to test a new supplier connection"
→ `src/__mocks__/transactions/connections.ts` (add new CONN record)

### "I need to add purchase orders"
→ `src/__mocks__/transactions/purchaseOrders.ts`

### "I need to test picking/packing flow"
→ `src/__mocks__/gaps/taskQueues.ts` (add PICKING/PACKING tasks)

### "I need to test financial closing"
→ `src/__mocks__/transactions/invoices.ts` + `payments.ts`

### "I need to verify CEO approvals"
→ `src/__tests__/role-based/ceo.test.ts`

### "I need to test complete order-to-cash"
→ `src/__tests__/e2e-scenarios/ORDER_TO_CASH.test.ts`

---

## File Dependencies (Import Order)

```
1. constants/ (no deps)
   ├─ roles.ts
   ├─ statuses.ts
   └─ currencies.ts

2. seeds/ (deps: constants)
   ├─ platformOwner.ts
   ├─ tenants.ts
   ├─ users.ts (deps: tenants, roles)
   ├─ products.ts (deps: categories, UoMs)
   ├─ warehouses.ts (deps: tenants)
   └─ masterData.ts (deps: all seeds)

3. transactions/ (deps: seeds)
   ├─ connections.ts (deps: tenants)
   ├─ purchaseOrders.ts (deps: vendors, products)
   ├─ goodsReceipts.ts (deps: purchaseOrders)
   ├─ salesOrders.ts (deps: customers, products)
   ├─ invoices.ts (deps: PO/SO)
   ├─ payments.ts (deps: invoices)
   ├─ deliveryTrips.ts (deps: SO, drivers)
   └─ returns.ts (deps: SO)

4. operations/ (deps: seeds, transactions)
   ├─ qcInspections.ts (deps: GRN)
   ├─ cycleCounts.ts (deps: warehouse)
   ├─ stockAdjustments.ts (deps: products)
   ├─ stockTransfers.ts (deps: warehouses)
   ├─ stockBlocks.ts (deps: inventory)
   └─ qualityClaims.ts (deps: GRN, QC)

5. gaps/ (deps: seeds, transactions)
   └─ taskQueues.ts, incomingPOs.ts, etc.

6. historical/ (deps: all seeds)
   └─ Generate programmatically using seasonalPatterns

7. platform/ (deps: seeds, historical)
   └─ ownerProfile, subscribers, KPIs

8. tests/ (deps: all above)
   └─ Can import any mock data
```

---

*Ready for Phase 1 implementation. Use this as a checklist during each week.*
