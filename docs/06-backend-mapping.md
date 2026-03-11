# Phase 6 — Future Backend Mapping

---

> This document maps every client-side data entity and operation to the backend tables, APIs, and services required to replace `localStorage` with a real backend. Currently `USE_API = false`.

---

## 1. Migration Strategy

### Current Architecture
```
React Components → WMSDataContext (React state) → localStorage (wmsStorage.ts)
```

### Target Architecture
```
React Components → React Query hooks → Edge Functions / Supabase Client → PostgreSQL (RLS)
                                                                        → Supabase Storage
                                                                        → Supabase Auth
```

### Migration Phases
1. **Auth** — Replace mock `AuthContext` with Supabase Auth
2. **Master Data** — Products, Vendors, Warehouses, Locations, Categories, UoMs
3. **Transactions** — POs, GRNs, Sales Orders, Invoices, Payments
4. **Operations** — QC, Putaway, Movements, Cycle Counts
5. **Advanced** — Connections, Lot/Batch, Serial Numbers, Yard/Dock
6. **Multi-tenant** — RLS policies scoped by `tenant_id`

---

## 2. Authentication Mapping

| Current (Mock) | Backend Target |
|----------------|----------------|
| `AuthContext.login(tenantId, userId, pin)` | Supabase Auth `signInWithPassword` (email + password) |
| `AuthContext.user` (from `userData.ts`) | `auth.users` + `profiles` table |
| `AuthContext.tenant` (from `tenants.ts`) | `tenants` table joined via `profiles.tenant_id` |
| 3-step login (Company → User → PIN) | Standard email/password + tenant selector post-login |
| Mobile biometric (`BiometricPrompt`) | WebAuthn / passkey via Supabase Auth |
| Driver login (`DriverLoginScreen`) | Supabase Auth with `driver` role check |
| Supplier login (`SupplierLoginScreen`) | Supabase Auth with `supplier` role check |
| Portal login (`PortalLoginScreen`) | Supabase Auth with `customer` role check |
| Owner login (`OwnerLoginScreen`) | Supabase Auth with `platform_owner` role check |

### Roles Table (per security guidelines)
```sql
create type public.app_role as enum (
  'admin', 'gestionnaire_stock', 'acheteur', 'responsable_achat',
  'operateur_reception', 'comptable', 'directeur_general',
  'commercial', 'livreur', 'superviseur_entrepot',
  'agent_qualite', 'platform_owner', 'supplier_admin',
  'supplier_user', 'customer_portal'
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
```

---

## 3. Database Tables — Entity Mapping

### 3.1 Multi-Tenant Core

| Table | Source Data | Key Columns | RLS Scope |
|-------|-----------|-------------|-----------|
| `tenants` | `tenants.ts` | `id`, `name`, `type`, `sector`, `plan`, `status` | Platform owner: all; others: own tenant |
| `profiles` | `userData.ts` | `id (= auth.uid)`, `tenant_id`, `name`, `assigned_warehouse_ids`, `approval_threshold_pct` | Own profile + admin sees tenant users |

### 3.2 Master Data

| Table | Source Data | Key Columns | Notes |
|-------|-----------|-------------|-------|
| `warehouses` | `masterData.warehouses` | `id`, `tenant_id`, `short_code`, `name`, `type`, `city`, `wilaya`, `capacity`, `utilization`, `status` | Tenant-scoped |
| `warehouse_locations` | `masterData.warehouseLocations` | `id`, `warehouse_id`, `zone`, `aisle`, `rack`, `level`, `type`, `capacity`, `used`, `status` | Via warehouse → tenant |
| `products` | `masterData.products` | `id`, `tenant_id`, `name`, `sku`, `category_id`, `uom`, `unit_cost`, `unit_price`, `reorder_point`, `is_active`, `product_type`, `cost_method` | Tenant-scoped |
| `product_categories` | `masterData.productCategories` | `id`, `tenant_id`, `name`, `sector` | |
| `sub_categories` | `masterData.subCategories` | `id`, `category_id`, `name` | Via category → tenant |
| `vendors` | `masterData.vendors` | `id`, `tenant_id`, `name`, `contact`, `phone`, `email`, `city`, `rating`, `status`, `tax_id`, `currency_id` | Tenant-scoped |
| `carriers` | `masterData.carriers` | `id`, `tenant_id`, `name`, `type`, `contact` | |
| `units_of_measure` | `masterData.unitsOfMeasure` | `id`, `tenant_id`, `name`, `abbreviation`, `type` | |
| `product_unit_conversions` | `productUnitConversions.ts` | `id`, `product_id`, `unit_name`, `unit_abbreviation`, `conversion_factor`, `allow_buy`, `allow_sell`, `is_integer`, `locked_at` | Via product → tenant |
| `barcodes` | `masterData.barcodes` | `id`, `product_id`, `unit_id`, `barcode`, `type` | Via product → tenant |
| `payment_terms` | `masterData.paymentTerms` | `id`, `tenant_id`, `name`, `days`, `discount_pct` | |
| `location_types` | `mockDataPhase20_22.locationTypes` | `id`, `tenant_id`, `name`, `temperature_range` | |

### 3.3 Procurement

| Table | Source Data | Key Columns | Notes |
|-------|-----------|-------------|-------|
| `purchase_orders` | `transactionalData.purchaseOrders` | `id`, `tenant_id`, `vendor_id`, `status`, `order_date`, `expected_date`, `subtotal`, `tax_amount`, `total_amount`, `delivery_warehouse_id`, `payment_terms` | Status enum: Draft→Sent→Confirmed→Partially_Received→Received→Cancelled |
| `purchase_order_lines` | `PO.lines[]` | `id`, `po_id`, `product_id`, `unit_id`, `conversion_factor`, `base_qty`, `qty`, `received_qty`, `unit_cost`, `line_total` | |
| `grns` | `transactionalData.grns` | `id`, `tenant_id`, `po_id`, `vendor_id`, `received_by`, `qc_by`, `approved_by`, `status`, `received_date` | Status: Draft→QC_Pending→Approval_Pending→Approved→Rejected |
| `grn_lines` | `GRN.lines[]` | `id`, `grn_id`, `product_id`, `received_qty`, `rejected_qty`, `batch_number`, `expiry_date`, `location_id`, `qc_status` | |

### 3.4 Inventory & Stock

| Table | Source Data | Key Columns | Notes |
|-------|-----------|-------------|-------|
| `inventory` | `transactionalData.inventory` | `id`, `tenant_id`, `product_id`, `warehouse_id`, `location_id`, `batch_number`, `expiry_date`, `qty_on_hand`, `qty_reserved`, `qty_available`, `qty_in_transit`, `unit_cost_avg`, `version` | Optimistic locking via `version` |
| `stock_adjustments` | `transactionalData.stockAdjustments` | `id`, `tenant_id`, `warehouse_id`, `product_id`, `type`, `qty`, `reason`, `status`, `requested_by`, `approved_by` | Approval workflow |
| `stock_transfers` | `transactionalData.stockTransfers` | `id`, `tenant_id`, `from_warehouse_id`, `to_warehouse_id`, `product_id`, `qty`, `status` | Status: Requested→In_Transit→Received→Cancelled |
| `cycle_counts` | `transactionalData.cycleCounts` | `id`, `tenant_id`, `warehouse_id`, `zone`, `scheduled_date`, `status`, `counted_by` | |
| `cycle_count_lines` | `CycleCount.lines[]` | `id`, `cycle_count_id`, `product_id`, `system_qty`, `counted_qty`, `variance`, `variance_pct` | |
| `stock_movements` | `operationalData.stockMovements` | `id`, `tenant_id`, `warehouse_id`, `movement_type`, `reference_id`, `product_id`, `qty`, `direction`, `timestamp` | Immutable journal |

### 3.5 Sales & Distribution

| Table | Source Data | Key Columns | Notes |
|-------|-----------|-------------|-------|
| `customers` | `transactionalData.customers` | `id`, `tenant_id`, `name`, `type`, `zone`, `lat`, `lng`, `credit_limit`, `credit_used`, `status`, `payment_terms` | |
| `sales_orders` | `transactionalData.salesOrders` | `id`, `tenant_id`, `customer_id`, `sales_rep`, `channel`, `status`, `subtotal`, `tax_amount`, `total_amount`, `discount_pct` | Complex status workflow |
| `sales_order_lines` | `SO.lines[]` | `id`, `so_id`, `product_id`, `unit_id`, `qty`, `unit_price`, `discount_pct`, `line_total` | |
| `invoices` | `transactionalData.invoices` | `id`, `tenant_id`, `order_id`, `customer_id`, `issue_date`, `due_date`, `status`, `total_amount`, `paid_amount`, `balance` | |
| `payments` | `transactionalData.payments` | `id`, `tenant_id`, `invoice_id`, `amount`, `method`, `date`, `reference`, `collected_by`, `status` | |
| `delivery_trips` | `transactionalData.deliveryTrips` | `id`, `tenant_id`, `driver_id`, `status`, `date`, `cash_collected` | |
| `delivery_stops` | `Trip.stops[]` | `id`, `trip_id`, `customer_id`, `order_id`, `sequence`, `status`, `signature_url`, `photo_url` | Files → Supabase Storage |

### 3.6 Quality & Returns

| Table | Source Data | Key Columns | Notes |
|-------|-----------|-------------|-------|
| `qc_inspections` | `operationalData.qcInspections` | `id`, `tenant_id`, `grn_id`, `warehouse_id`, `inspector`, `status`, `overall_result` | |
| `qc_inspection_lines` | `QC.lines[]` | `id`, `inspection_id`, `product_id`, `inspected_qty`, `passed_qty`, `defect_type`, `temperature` | |
| `returns` | `transactionalData.returns` | `id`, `tenant_id`, `type`, `reference_id`, `reason_code`, `disposition`, `status` | Type: Customer or Supplier |
| `credit_notes` | `transactionalData.creditNotes` | `id`, `tenant_id`, `linked_return_id`, `linked_claim_id`, `total_amount`, `status` | |
| `quality_claims` | `transactionalData.qualityClaims` | `id`, `tenant_id`, `claim_type`, `priority`, `root_cause`, `settlement_amount`, `status` | |

### 3.7 Warehouse Operations

| Table | Source Data | Key Columns | Notes |
|-------|-----------|-------------|-------|
| `putaway_tasks` | `operationalData.putawayTasks` | `id`, `tenant_id`, `grn_id`, `product_id`, `qty`, `suggested_location_id`, `actual_location_id`, `strategy`, `status` | |
| `lot_batches` | `operationalData.lotBatches` | `id`, `tenant_id`, `product_id`, `batch_number`, `mfg_date`, `expiry_date`, `status` | |
| `serial_numbers` | `operationalData.serialNumbers` | `id`, `tenant_id`, `product_id`, `serial_number`, `status` | |
| `cross_docks` | `operationalData.crossDocks` | `id`, `tenant_id`, `inbound_po_id`, `outbound_so_id`, `status` | |
| `kit_recipes` | `operationalData.kitRecipes` | `id`, `tenant_id`, `output_product_id`, `components[]` | JSONB for components |
| `kit_orders` | `operationalData.kitOrders` | `id`, `tenant_id`, `recipe_id`, `qty`, `status` | |
| `stock_blocks` | `operationalData.stockBlocks` | `id`, `tenant_id`, `product_id`, `warehouse_id`, `qty`, `reason`, `blocked_by` | |
| `repack_orders` | `operationalData.repackOrders` | `id`, `tenant_id`, `source_product_id`, `target_product_id`, `qty`, `status` | |

### 3.8 Yard & Dock

| Table | Source Data | Key Columns |
|-------|-----------|-------------|
| `dock_slots` | `mockDataPhase20_22.dockSlots` | `id`, `tenant_id`, `warehouse_id`, `dock_number`, `type`, `status` |
| `truck_check_ins` | `mockDataPhase20_22.truckCheckIns` | `id`, `dock_slot_id`, `truck_plate`, `driver`, `purpose`, `seal_number`, `check_in_time` |
| `gate_logs` | `mockDataPhase20_22.gateLogs` | `id`, `tenant_id`, `warehouse_id`, `direction`, `vehicle`, `timestamp` |

### 3.9 Connections (B2B)

| Table | Source Data | Key Columns |
|-------|-----------|-------------|
| `connections` | `connectionData.connections` | `id`, `supplier_tenant_id`, `warehouse_tenant_id`, `status`, `created_by`, `invitation_message` |
| `connection_notifications` | `connectionData.notifications` | `id`, `connection_id`, `type`, `from_entity`, `to_entity`, `read` |

### 3.10 Configuration & Settings

| Table | Source Data | Key Columns |
|-------|-----------|-------------|
| `putaway_rules` | `mockDataPhase20_22.putawayRules` | `id`, `tenant_id`, `category`, `strategy`, `priority` |
| `alert_rules` | `mockDataPhase20_22.alertRules` | `id`, `tenant_id`, `metric`, `operator`, `threshold`, `channel` |
| `integrations` | `mockDataPhase20_22.integrations` | `id`, `tenant_id`, `name`, `type`, `status`, `config` (JSONB) |

### 3.11 Audit Trail

| Table | Source (`auditService.ts`) | Key Columns |
|-------|---------------------------|-------------|
| `audit_log` | `logAudit()` entries | `id`, `tenant_id`, `timestamp`, `action`, `module`, `entity_id`, `performed_by`, `details`, `diff` (JSONB), `metadata` (JSONB) |

> Audit table should be **append-only** — no UPDATE/DELETE policies. Only SELECT for authorized roles.

---

## 4. Edge Functions

| Function | Purpose | Replaces |
|----------|---------|----------|
| `process-grn` | GRN approval → inventory update + stock movement creation + PO status update | `WMSDataContext` inline logic |
| `create-sale` | Credit check → reserve stock → create SO → stock movement | `useOrderForm` + `creditCheck.ts` |
| `three-way-match` | PO ↔ GRN ↔ Invoice matching with tolerance | `threeWayMatch.ts` |
| `transfer-stock` | Validate stock → deduct source → add transit → complete at destination | `transferEngine.ts` |
| `cycle-count-approve` | Variance check → auto/manual approval → adjustment creation | `WMSDataContext` inline logic |
| `fifo-valuation` | FIFO cost calculation across batches | `fifoEngine.ts` |
| `pmp-calculation` | Weighted average cost recalculation | `pmpEngine.ts` |
| `fx-convert` | Currency conversion for multi-currency POs | `fxEngine.ts` |
| `daily-closing` | End-of-day reconciliation and report generation | `DailyClosingPage` inline logic |
| `send-notification` | Push/email notifications for alerts, approvals | `pushNotificationService.ts` |
| `export-pdf` | Server-side PDF generation for invoices/reports | `pdfExport.ts` |
| `connection-invite` | B2B connection request with email notification | `connectionService.ts` |

---

## 5. Supabase Storage Buckets

| Bucket | Content | Access |
|--------|---------|--------|
| `delivery-proofs` | Signature images, delivery photos | Driver upload; admin/customer read |
| `documents` | Invoice PDFs, PO attachments, GRN documents | Tenant-scoped read/write |
| `product-images` | Product catalog images | Public read; admin write |
| `imports` | CSV/Excel import files | Admin upload; auto-delete after processing |

---

## 6. Realtime Subscriptions

| Channel | Tables | Use Case |
|---------|--------|----------|
| `inventory-updates` | `inventory` | Live stock level updates on dashboard |
| `order-status` | `sales_orders` | Portal customers see order progress |
| `connection-events` | `connections`, `connection_notifications` | B2B connection state changes |
| `alerts` | `audit_log`, `inventory` | Threshold-triggered alerts |
| `trip-tracking` | `delivery_trips`, `delivery_stops` | Live delivery tracking |

---

## 7. RLS Policy Patterns

### Tenant Isolation (applied to most tables)
```sql
create policy "Tenant isolation"
on public.products for all
to authenticated
using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()))
with check (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
```

### Warehouse Scope (for warehouse-specific tables)
```sql
create policy "Warehouse scope"
on public.inventory for select
to authenticated
using (
  warehouse_id = any(
    (select assigned_warehouse_ids from public.profiles where id = auth.uid())
  )
  or
  (select assigned_warehouse_ids from public.profiles where id = auth.uid()) = '{all}'
);
```

### Role-Based Access (using `has_role` security definer)
```sql
create policy "Admin full access"
on public.products for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Buyer can manage POs"
on public.purchase_orders for all
to authenticated
using (public.has_role(auth.uid(), 'acheteur'))
with check (public.has_role(auth.uid(), 'acheteur'));
```

### Append-Only Audit
```sql
create policy "Insert only"
on public.audit_log for insert
to authenticated
with check (true);

create policy "Read own tenant audit"
on public.audit_log for select
to authenticated
using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
```

---

## 8. Migration Checklist

| # | Task | Dependencies | Estimated Tables |
|---|------|-------------|-----------------|
| 1 | Enable Supabase Auth + create `profiles` & `user_roles` tables | None | 2 |
| 2 | Create `tenants` table + seed data | Auth | 1 |
| 3 | Master data tables (products, vendors, warehouses, locations, categories, UoMs, carriers, barcodes, payment_terms) | Tenants | 10 |
| 4 | Unit conversion tables (product_unit_conversions) | Products | 1 |
| 5 | Procurement tables (purchase_orders, po_lines, grns, grn_lines) | Vendors, Products, Warehouses | 4 |
| 6 | Inventory & stock tables (inventory, adjustments, transfers, movements) | Products, Warehouses | 4 |
| 7 | Sales tables (customers, sales_orders, so_lines, invoices, payments) | Products, Warehouses | 5 |
| 8 | Delivery tables (trips, stops) + Storage buckets | Sales Orders, Customers | 2 + buckets |
| 9 | Quality tables (qc_inspections, lines, returns, credit_notes, claims) | GRNs, Products | 5 |
| 10 | Operations tables (putaway, lot_batches, serial_numbers, cross_docks, kits, blocks, repack) | Inventory, Products | 8 |
| 11 | Yard/dock tables (dock_slots, truck_check_ins, gate_logs) | Warehouses | 3 |
| 12 | Connection tables (connections, notifications) | Tenants | 2 |
| 13 | Config tables (putaway_rules, alert_rules, location_types, integrations) | Warehouses | 4 |
| 14 | Audit log table | All | 1 |
| 15 | Edge functions for business logic | Tables 1-14 | 12 functions |
| 16 | Realtime subscriptions | Tables | 5 channels |
| **Total** | | | **~52 tables, 12 functions** |

---

## 9. Data Seeding Strategy

When migrating from mock to real backend:

1. **Export current mock data** → Generate SQL `INSERT` statements from `src/data/*.ts`
2. **Map IDs** → Replace string IDs (`"P001"`) with UUIDs; maintain a mapping table during migration
3. **Preserve relationships** → Foreign keys must reference migrated UUIDs
4. **Historical data** → `historicalData.ts` entries become seed data for BI/reporting tables
5. **Tenant isolation** → Each seed record gets correct `tenant_id` assignment

### ID Migration Example
```
Mock: "P001" → UUID: "a1b2c3d4-..."
Mock: "V001" → UUID: "e5f6g7h8-..."
Mock: PO.vendorId = "V001" → PO.vendor_id = "e5f6g7h8-..."
```

---

*✅ Phase 6 complete. All 6 documentation phases are now finished.*
