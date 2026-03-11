# Phase 5 — Mock Data Structure

---

> This document explains how mock data is organized, stored, and used throughout the application. All data is client-side with `localStorage` persistence.

---

## 1. Data Architecture Overview

### Storage Layer
- **Source**: Hardcoded TypeScript arrays in `src/data/` files
- **Persistence**: `localStorage` via `src/lib/wmsStorage.ts`
- **Version Control**: `DATA_VERSION = 19` — when bumped, stale localStorage is wiped and fresh data loads
- **State Management**: `WMSDataContext` (React Context) holds all data with setter functions
- **No API**: `USE_API = false` — all data is local; API integration is a future phase

### Data Flow
```
src/data/*.ts (hardcoded arrays)
      ↓
WMSDataContext.tsx (loads from localStorage or falls back to hardcoded)
      ↓
Components (read via useWMSData() hook, write via setter functions)
      ↓
localStorage (auto-persisted on every state change)
```

---

## 2. File Organization

### Barrel Export
`src/data/mockData.ts` — re-exports everything from domain files for backward compatibility.

| File | Domain | Description | Record Count |
|------|--------|-------------|--------------|
| `masterData.ts` | Master Data | Products, Vendors, Warehouses, Locations, Categories, UoMs, Carriers, Barcodes, Payment Terms | ~200+ records |
| `userData.ts` | Users & Auth | Users, Roles, Governance permissions | 35 users |
| `tenants.ts` | Multi-Tenant | Tenant registry (companies) | 8 tenants |
| `transactionalData.ts` | Transactions | POs, GRNs, Cycle Counts, Adjustments, Transfers, Customers, Sales Orders, Trips, Invoices, Payments, Returns, Alerts, Inventory, Credit Notes, Quality Claims | ~300+ records |
| `operationalData.ts` | Operations | QC Inspections, Putaway Tasks, Stock Movements, Cross-Docks, Kit Recipes/Orders, Stock Blocks, Repack Orders, Lot/Batches, Serial Numbers | ~100+ records |
| `historicalData.ts` | Historical | Historical POs, SOs, Invoices, Payments, GRNs, Cycle Counts (Jan 2024 → Nov 2025) | ~100+ records |
| `connectionData.ts` | Connections | Supplier-Warehouse connections and notifications | 12 connections, 5 notifications |
| `productUnitConversions.ts` | Unit System | Product-specific unit conversion tables | ~80+ conversions |
| `salesAgentsData.ts` | Sales | Sales agents, route plans, planned visits | ~10 agents |
| `mockDataPhase20_22.ts` | Yard/Dock | Dock slots, truck check-ins, gate logs, putaway rules, alert rules, location types, integrations | ~60+ records |

---

## 3. Data Entities — Detailed Schema

### 3.1 Products (`masterData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (e.g., "P001") |
| `name` | string | Product name in French |
| `sku` | string | SKU code (e.g., "CONST-001", "FOOD-002", "TECH-003") |
| `category` | string | Category name |
| `subcategoryId` | string? | Subcategory reference |
| `uom` | string | Display unit of measure |
| `unitCost` | number | Purchase cost in DZD |
| `unitPrice` | number | Selling price in DZD |
| `reorderPoint` | number | Minimum stock trigger |
| `isActive` | boolean | Active/inactive flag |
| `tenantId` | string? | Multi-tenant scope |
| `productType` | "Storable" \| "Consumable" \| "Service" | |
| `costMethod` | "Standard" \| "Average" \| "FIFO" | |
| `defaultVendorId` | string? | Preferred vendor |

**57 products** across 4 sectors: Construction (16), Agroalimentaire (18), Technologie (16), Electricité/Logistique (7)

**Used in**: ProductsPage, PurchaseOrdersPage, GrnPage, OrdersPage, InventoryPage, PricingPage, all mobile/portal screens

---

### 3.2 Vendors (`masterData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | "V001" to "V008" |
| `name` | string | Company name |
| `contact` | string | Contact person |
| `phone`, `email`, `city`, `address` | string | Contact details |
| `rating` | number | Vendor score (0-5) |
| `status` | "Active" \| "On Hold" \| "Blocked" | |
| `totalPOs` | number | Historical PO count |
| `totalValue` | number | Historical total value (DZD) |
| `avgLeadDays` | number | Average lead time |
| `paymentTerms` | VendorPaymentTerms | Default payment terms |
| `taxId` | string | NIF (15-digit Algerian tax ID) |
| `currencyId` | string | "DZD", "EUR", or "USD" |
| `bankAccount` | string | IBAN |
| `bankBIC` | string | SWIFT/BIC code |
| `procurementCategory` | string | "Construction", "Agroalimentaire", "Electronique", "Boissons" |

**8 vendors**: GICA, ArcelorMittal, SEROR, Cevital, SIM Blida, Ifri, Condor, Iris

**Used in**: VendorsPage, PurchaseOrdersPage, GrnPage, VendorScorecardPage, ConnectionsTab

---

### 3.3 Warehouses (`masterData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g., "wh-alger-construction" |
| `shortCode` | string | e.g., "WH-ALG-CONST" |
| `name` | string | Display name |
| `type` | "construction" \| "food" \| "technology" \| "general" | |
| `city`, `wilaya` | string | Location |
| `zones` | number | Number of storage zones |
| `capacity` | number | Total capacity |
| `utilization` | number | Utilization % |
| `manager` | string | Assigned manager |
| `status` | "active" \| "inactive" \| "maintenance" | |
| `temperature` | string? | Cold chain info |
| `certifications` | string[]? | e.g., ["HACCP", "ISO 22000"] |
| `companyId` | string? | For supplier warehouses |

**9 warehouses**: 5 client entrepôts + 4 supplier warehouses

**Used in**: WarehousesPage, Dashboard, WarehouseScopeBanner, all warehouse-scoped pages

---

### 3.4 Warehouse Locations (`masterData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g., "ALG-A1-01" (prefix-zone-aisle-rack) |
| `warehouseId` | string | Parent warehouse |
| `zone`, `aisle`, `rack`, `level` | string | Physical coordinates |
| `type` | "Ambient" \| "Chilled" \| "Frozen" \| "Dry" | Storage condition |
| `capacity`, `used` | number | Capacity tracking |
| `status` | "Available" \| "Full" \| "Reserved" \| "Maintenance" | |

**31 locations** across all warehouses

---

### 3.5 Purchase Orders (`transactionalData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g., "PO-2026-0101" |
| `vendorId`, `vendorName` | string | Linked vendor |
| `status` | "Draft" \| "Sent" \| "Confirmed" \| "Partially_Received" \| "Received" \| "Cancelled" | |
| `orderDate`, `expectedDate` | string (ISO) | Dates |
| `subtotal`, `taxAmount`, `totalAmount` | number | Financials (DZD) |
| `taxRatePct` | number | 19% (Algerian TVA) |
| `deliveryWarehouseId` | string | Target warehouse |
| `paymentTerms` | string | Payment terms |
| `lines[]` | POLine[] | Product line items with unit conversion |

**~20 current POs** (Dec 2025 → Mar 2026) + **~40 historical POs** (Jan 2024 → Nov 2025)

Each `POLine` includes: `productId`, `productName`, `sku`, `uom`, `unitId`, `unitAbbr`, `conversionFactor`, `baseQty`, `qty`, `receivedQty`, `unitCost`, `lineTotal`

---

### 3.6 GRNs — Goods Receipt Notes (`transactionalData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g., "GRN-20260213-001" |
| `poId` | string | Linked PO |
| `vendorId`, `vendorName` | string | |
| `receivedBy`, `qcBy`, `approvedBy` | string | Workflow participants |
| `status` | "Draft" \| "QC_Pending" \| "Approval_Pending" \| "Approved" \| "Rejected" | |
| `lines[]` | GrnLine[] | Per-product: received/rejected qty, batch, expiry, location, QC status |

---

### 3.7 Inventory Items (`transactionalData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique inventory line ID |
| `productId`, `productName`, `sku`, `category` | string | Product info |
| `warehouseId`, `warehouseName` | string | Location |
| `locationId` | string | Bin location |
| `batchNumber`, `expiryDate` | string | Traceability |
| `qtyOnHand`, `qtyReserved`, `qtyAvailable`, `qtyInTransit` | number | Quantities |
| `unitCostAvg` | number | Average unit cost |
| `reorderPoint`, `minStockLevel` | number | Replenishment triggers |
| `daysToExpiry`, `daysSinceMovement` | number | Aging metrics |
| `baseUnitId`, `baseUnitAbbr` | string | Base unit reference |
| `version` | number | Optimistic locking |

---

### 3.8 Customers (`transactionalData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | "C001" to "C020" |
| `name` | string | Business name |
| `type` | "Détaillant" \| "Grossiste" \| "Demi-Grossiste" \| "Grande Surface" | Customer classification |
| `zone` | string | Geographic zone |
| `lat`, `lng` | number | GPS coordinates (for geo-sort) |
| `creditLimit`, `creditUsed` | number | Credit management (DZD) |
| `status` | "Active" \| "Blocked" | |
| `paymentTerms` | string | Default terms |

**~20 customers** with real Algerian city coordinates

---

### 3.9 Sales Orders (`transactionalData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g., "ORD-20260220-001" |
| `customerId`, `customerName` | string | |
| `salesRep` | string | Assigned sales rep |
| `channel` | "Web" \| "Phone" \| "Manual" \| "Mobile_App" | Order source |
| `status` | Draft → Approved → Picking → Packed → Shipped → Delivered → Invoiced \| Cancelled \| Credit_Hold | |
| `lines[]` | SOLine[] | Product lines with pricing and unit conversion |
| `subtotal`, `taxAmount`, `totalAmount` | number | |
| `discountPct` | number | Order-level discount |
| `paymentTerms` | string | |

---

### 3.10 Invoices & Payments (`transactionalData.ts`)

**Invoices**: `id`, `orderId`, `customerId`, `issueDate`, `dueDate`, `status` (Draft/Sent/Partially_Paid/Paid/Overdue/Disputed/Cancelled), `totalAmount`, `paidAmount`, `balance`

**Payments**: `id`, `invoiceId`, `amount`, `method` (Cash/Cheque/Virement/Mobile_Payment/Traite), `date`, `reference`, `collectedBy`, `status`

---

### 3.11 Connections (`connectionData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | "CONN-001" to "CONN-012" |
| `supplierId`, `supplierName`, `supplierEmail` | string | |
| `warehouseId`, `warehouseName`, `warehouseEmail` | string | |
| `status` | "CONNECTED" \| "PENDING" \| "REJECTED" \| "BLOCKED" | |
| `createdBy` | "SUPPLIER" \| "WAREHOUSE" | Who initiated |
| `invitationMessage` | string? | Optional message |
| `createdAt`, `updatedAt` | string (ISO) | Timestamps |

**Connection Notifications**: `type` (connection_request/accepted/refused), `fromEntity`, `toEntity`, `entityType`, `read`, `referenceId`

---

### 3.12 Product Unit Conversions (`productUnitConversions.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | "PUC-001" etc. |
| `productId` | string | Parent product |
| `unitName` | string | e.g., "Sac (50kg)" |
| `unitAbbreviation` | string | e.g., "Sac" |
| `conversionFactor` | number | Factor to base unit (1 = base unit) |
| `allowBuy`, `allowSell` | boolean | Where unit can be used |
| `isInteger` | boolean | Fractional quantities allowed? |
| `lockedAt` | string? | Lock date (prevents changes after use in transactions) |
| `decimalPlaces` | number | Display precision |

**Examples**:
- Ciment (P001): kg (×1) → Sac (×50) → Palette (×2000) → Tonne (×1000)
- Huile (P010): Litre (×1) → Bidon 5L (×5) → Carton 4 bidons (×20)
- Laptop (P017): Pièce (×1) — single unit only

---

### 3.13 Users (`userData.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | "U001" to "U702" |
| `name` | string | Full name |
| `role` | UserRole | 13 possible roles |
| `tenantId` | string | Company assignment |
| `assignedWarehouseIds` | "all" \| string[] | Warehouse scope |
| `approvalThresholdPct` | number \| null | Variance approval limit |
| `canSelfApprove` | boolean | Self-approval flag |
| `governancePermissions` | GovernancePermission[] | System-level permissions |

**35 users** across 8 tenants + 1 platform owner

---

### 3.14 Other Data Entities

| Entity | File | Key Fields | Used In |
|--------|------|------------|---------|
| **QC Inspections** | `operationalData.ts` | grnId, warehouseId, inspector, lines with defect types, temperature checks | QualityControlPage |
| **Putaway Tasks** | `operationalData.ts` | grnId, productId, batchNumber, qty, suggestedLocation, strategy (FIFO/FEFO/Zone) | PutawayPage |
| **Stock Movements** | `operationalData.ts` | movementType (11 types), referenceId, qty, direction (In/Out/Internal) | MovementJournalPage |
| **Cycle Counts** | `transactionalData.ts` | warehouseId, zone, scheduledDate, lines with system/counted/variance | CycleCountPage |
| **Stock Adjustments** | `transactionalData.ts` | type (Increase/Decrease), qty, reason, status with approval chain | StockAdjustmentsPage |
| **Stock Transfers** | `transactionalData.ts` | fromWarehouse, toWarehouse, product, qty, status workflow | StockTransfersPage |
| **Delivery Trips** | `transactionalData.ts` | driverId, stops[], status, cashCollected | DeliveriesPage, DriverApp |
| **Returns** | `transactionalData.ts` | type (Customer/Supplier), reason codes, disposition (Restock/Dispose/QC) | ReturnsPage |
| **Credit Notes** | `transactionalData.ts` | linkedReturn/claim, lines, credit amount | CreditNotesPage |
| **Quality Claims** | `transactionalData.ts` | claimType, priority, rootCause, settlement | QualityClaimsPage |
| **Alerts** | `transactionalData.ts` | priority (Critical/High/Medium/Low), category, read flag | Dashboard, AlertsPage |
| **Dock Slots** | `mockDataPhase20_22.ts` | dockNumber, type (Inbound/Outbound), status, schedule | YardDockPage |
| **Truck Check-ins** | `mockDataPhase20_22.ts` | truckPlate, driver, dockId, purpose, sealNumber | YardDockPage |
| **Kit Recipes** | `operationalData.ts` | components[], output product, BOM | KittingPage |
| **Lot/Batches** | `operationalData.ts` | productId, batchNumber, mfgDate, expiryDate, status | LotBatchPage |
| **Serial Numbers** | `operationalData.ts` | productId, serialNumber, lifecycle status | SerialNumbersPage |
| **Sales Agents** | `salesAgentsData.ts` | name, zone, quota, visits | RoutePlanPage, MobileApp |
| **Tenants** | `tenants.ts` | type (entrepot/fournisseur), plan, sector, ceoUserId | Login, InstanceSwitcher, OwnerDashboard |
| **Historical Data** | `historicalData.ts` | Jan 2024 → Nov 2025 POs/SOs/Invoices with seasonal patterns | BI charts, trend analysis |

---

## 4. Data Relationships

```
Tenant (1) ──── (N) Users
   │                  │
   └──── (N) Warehouses ──── (N) WarehouseLocations
                │
                ├──── Inventory Items ──── Product
                │                          │
                ├──── Purchase Orders ─────┘
                │         │
                │         └──── GRN ──── QC Inspection ──── Putaway Task
                │
                ├──── Sales Orders ──── Customer
                │         │
                │         └──── Invoice ──── Payment
                │
                ├──── Stock Transfers (from/to)
                ├──── Cycle Counts
                └──── Stock Adjustments

Vendor ──── (N) Purchase Orders
  │
  └──── Connection ──── Warehouse

Product ──── (N) Unit Conversions
  │
  ├──── (N) Inventory Items
  ├──── (N) PO Lines / SO Lines / GRN Lines
  ├──── (N) Lot/Batches
  └──── (N) Serial Numbers
```

---

## 5. Persistence Mechanism (`wmsStorage.ts`)

### Persisted State Shape (`PersistedWMSState`)
Contains **33 arrays** covering all data domains:

```typescript
interface PersistedWMSState {
  // Core
  grns, purchaseOrders, inventory, stockAdjustments, stockTransfers,
  cycleCounts, returns, salesOrders, customers, invoices, payments,
  deliveryTrips, alerts, vendors, warehouses, warehouseLocations,
  sectors, productCategories, subCategories, unitsOfMeasure,
  carriers, barcodes, products,
  // Operations
  qcInspections, putawayTasks, stockMovements,
  crossDocks, kitRecipes, kitOrders, stockBlocks, repackOrders,
  lotBatches, serialNumbers,
  // Yard/Dock
  dockSlots, truckCheckIns, gateLogs,
  // Settings
  putawayRules, alertRules, locationTypes, integrations, importJobs,
  // Unit System
  productUnitConversions, productBaseUnits, productDimensions, warehouseProducts,
  // Audit
  productHistory,
  // ERP
  paymentTerms, creditNotes, qualityClaims,
  // Multi-WMS
  incomingPOs,
  // Connections
  connections, connectionNotifications,
}
```

### Version Migration
- Version stored in `localStorage` key `flow-food-wms-version`
- On mismatch with `DATA_VERSION (19)`, all data is wiped and reloaded from hardcoded arrays
- "Reset Data" button in topbar triggers manual wipe

---

## 6. Currency & Locale

- **Primary currency**: DZD (Algerian Dinar)
- **Format**: `v.toLocaleString("fr-DZ") + " DZD"` → e.g., "1 200 000 DZD"
- **Tax rate**: 19% TVA (hardcoded as `PO_TAX_RATE = 0.19`)
- **FX vendors**: V007 (EUR @ 146.30), V008 (USD @ 134.60)
- **Date format**: French locale (`fr-FR`)

---

## 7. Seasonal Data Patterns (Historical)

The historical data simulates realistic Algerian business patterns:

| Sector | Peak Season | Low Season | Special Events |
|--------|-------------|------------|----------------|
| Construction (Alger) | Apr–Sep (BTP season) | Nov–Feb | — |
| Agroalimentaire (Oran) | Year-round baseline | — | Ramadan spike (Mar 2024, Feb–Mar 2025) |
| Technologie (Constantine) | Aug–Sep, Nov–Dec | Jan–Mar | Back-to-school, year-end purchases |

---

*✅ Phase 5 complete. Confirm to proceed to Phase 6 — Future Backend Mapping.*
