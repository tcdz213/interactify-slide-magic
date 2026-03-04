# ERP Purchase Order — Pre-Creation Prerequisites

> **Scope**: This document covers every configuration element that must be in place **before** a Purchase Order can be created. Post-PO processes (goods receipt, three-way match, invoice verification, payment) are explicitly out of scope.
>
> **Platform Reference**: Generic ERP architecture with inline annotations for **[Odoo]** (Community/Enterprise 17) and **[Dynamics]** (D365 Finance & Supply Chain Management).

---

## Table of Contents

1. [Master Data Modules](#1-master-data-modules)
2. [Role & Permission Structure](#2-role--permission-structure)
3. [Workflow Configuration](#3-workflow-configuration)
4. [Integration Layer](#4-integration-layer)
5. [Data Validation Rules](#5-data-validation-rules)
6. [System Readiness Checklist](#6-system-readiness-checklist)
7. [Is the Platform Ready for PO Creation?](#7-is-the-platform-ready-for-po-creation)

---

## 1. Master Data Modules

### 1.1 Vendor / Supplier Management

**Purpose**: Establish a validated, deduplicated registry of all entities from which the organisation is authorised to procure goods or services.

#### Required Fields

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `vendor_code` | String | Unique, system-generated or manual | [Dynamics] Called `VendAccount` in `VendTable` |
| `legal_name` | String | Mandatory | Must match trade-register entry |
| `tax_id` | String | Mandatory; format-validated per jurisdiction | [Odoo] `vat` field with VIES validation for EU |
| `currency_id` | FK → Currency | Mandatory | Default transaction currency |
| `payment_terms_id` | FK → Payment Terms | Mandatory | Drives AP ageing |
| `bank_account` | Composite | IBAN + BIC or local format | [Dynamics] Stored in `VendBankAccount` entity |
| `address` | Composite | Street, city, country, postal code | At least one address of type "Remit-To" |
| `status` | Enum | `Active`, `On Hold`, `Blocked` | Only `Active` vendors appear in PO lookups |
| `fiscal_position_id` | FK → Fiscal Position | Recommended | [Odoo] Drives automatic tax mapping on PO lines |
| `procurement_category` | FK → Category | Recommended | [Dynamics] `ProcCategory` links vendor to sourcing |

#### Platform-Specific Configuration

- **[Odoo]**: Enable the **Purchase** module on the vendor's contact form (`is_company = True`, `supplier_rank > 0`). Pricelists are attached via `product.supplierinfo` records per product.
- **[Dynamics]**: Vendor must be created within a **Legal Entity** (`DataAreaId`). Cross-company procurement requires **Intercompany** setup and shared vendor numbering via the **Global Address Book**.

#### Common Setup Failures

1. Vendor created without `payment_terms_id` → PO saves but AP ageing reports produce nulls.
2. Missing or invalid `tax_id` → Tax engine returns zero tax, causing fiscal audit findings.
3. Vendor status set to `Blocked` for "All" → PO line creation silently rejected without user-facing error. [Dynamics]
4. No `product.supplierinfo` record → Odoo cannot auto-populate unit price on PO line. [Odoo]

---

### 1.2 Products & Items (Purchasing Configuration)

**Purpose**: Define every stockable, consumable, or service item that may appear on a PO line, including purchasing-specific flags and costing method.

#### Required Fields

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `product_code` / `sku` | String | Unique | [Dynamics] `ItemId` in `InventTable` |
| `product_name` | String | Mandatory | |
| `product_type` | Enum | `Storable`, `Consumable`, `Service` | [Odoo] `type` field: `product`, `consu`, `service` |
| `can_be_purchased` | Boolean | Must be `True` | [Odoo] `purchase_ok`; [Dynamics] Item must belong to a procurement category or have `PurchActive = Yes` |
| `uom_id` | FK → UoM | Mandatory | Purchase UoM; may differ from stock UoM |
| `uom_po_id` | FK → UoM | Recommended | [Odoo] Separate purchase UoM field |
| `cost_method` | Enum | `Standard`, `Average`, `FIFO` | Set at category or item level |
| `expense_account_id` | FK → CoA | Mandatory for non-stock items | Drives journal entry on receipt |
| `asset_category_id` | FK → Asset Category | If capital item | Required for fixed-asset procurement |
| `tax_schedule` | FK → Tax Code | Mandatory | [Dynamics] `TaxItemGroupId` |

#### Platform-Specific Configuration

- **[Odoo]**: Product categories (`product.category`) carry default accounting properties (`property_account_expense_categ_id`). Every product inherits these unless overridden at product level.
- **[Dynamics]**: Items require an **Item Model Group** (inventory policy), a **Storage Dimension Group** (Site/Warehouse/Location tracking), and a **Tracking Dimension Group** (Batch/Serial).

#### Common Setup Failures

1. `can_be_purchased` left `False` → Product does not appear in PO line search.
2. Missing `cost_method` at category level → Inventory valuation produces unreliable COGS.
3. No purchase UoM conversion defined → Quantities recorded in stock UoM, creating order-quantity mismatches.

---

### 1.3 Warehouses & Storage Locations

**Purpose**: Define the physical or logical receiving points referenced on PO headers and lines to direct inbound goods flow.

#### Required Fields

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `warehouse_code` | String | Unique | [Dynamics] `InventSiteId` + `InventLocationId` |
| `warehouse_name` | String | Mandatory | |
| `address` | Composite | Mandatory | Used for delivery address on PO |
| `input_location_id` | FK → Location | Mandatory for WMS | [Odoo] `wh_input_stock_loc_id` |
| `is_active` | Boolean | Must be `True` | |
| `company_id` | FK → Company | Mandatory | Multi-company isolation |

#### Location / Bin Structure

| Level | [Odoo] | [Dynamics] |
|---|---|---|
| Site | N/A (single level) | `InventSite` — top grouping |
| Warehouse | `stock.warehouse` | `InventLocation` |
| Zone | `stock.location` (type = `view`) | `WHSZone` |
| Bin / Location | `stock.location` (type = `internal`) | `WMSLocation` or `WHSLocationProfile` |

#### Common Setup Failures

1. Warehouse created without an **Input Location** → Receipts land in the root location, breaking putaway rules.
2. [Dynamics] Warehouse not linked to a **Site** → PO line dimension validation fails.
3. Multi-step reception enabled without intermediate locations → Stock appears directly in pick area, bypassing quality control.

---

### 1.4 Units of Measure (UoM & UoM Categories)

**Purpose**: Guarantee consistent quantity expression across purchase, stock, and sales transactions through a unified conversion framework.

#### Required Configuration

| Element | Description | Example |
|---|---|---|
| **UoM Category** | Groups interconvertible units | `Weight` (kg, g, t) |
| **Reference UoM** | Category base unit (factor = 1.0) | `kg` |
| **Derived UoM** | Non-base unit with explicit conversion factor | `Carton` = 12 × `Unit` |
| **Purchase UoM** | Unit used on PO lines | May differ from stock UoM |
| **Rounding Precision** | Decimal places for quantity | Typically 0.001 for weight, 1 for discrete |

#### Platform-Specific Configuration

- **[Odoo]**: UoM categories enforce that conversions stay within the same category. Cross-category conversion is architecturally blocked. Purchase UoM is set per `product.supplierinfo` record or via `uom_po_id` on the product.
- **[Dynamics]**: Unit conversions are defined at either the **global** level (all items) or the **product-specific** level in `UnitOfMeasureConversion`. A product may have different purchase, inventory, and sales units.

#### Common Setup Failures

1. Conversion factor inverted (÷ instead of ×) → Order quantities off by orders of magnitude.
2. Purchase UoM not in the same category as stock UoM → [Odoo] system raises `UserError` at PO confirmation.
3. Rounding precision too coarse for fractional items → Received quantities silently truncated.

---

### 1.5 Currency & Exchange Rate Configuration

**Purpose**: Enable multi-currency purchasing with accurate rate application, revaluation, and reporting-currency translation.

#### Required Configuration

| Element | Description | Notes |
|---|---|---|
| `base_currency` | Company's functional currency | Set at company creation; immutable |
| `active_currencies` | All currencies used in vendor transactions | Each must have an active exchange-rate record |
| `rate_type` | `Spot`, `Budget`, `Average` | [Dynamics] Multiple rate types per currency pair |
| `rate_source` | Manual, ECB feed, custom API | [Odoo] ECB auto-fetch via `currency_rate_live` module |
| `rate_date` | Effective date of each rate entry | PO uses rate as of `order_date` |
| `gain_loss_accounts` | Realised and unrealised FX accounts | Must exist in CoA before first multi-currency PO |

#### Common Setup Failures

1. No exchange rate for PO date → System uses rate = 1.0 or blocks PO, depending on configuration.
2. Gain/loss accounts not mapped → Journal entries fail at invoice-matching stage (downstream impact but must be configured pre-PO).
3. [Dynamics] Rate type on vendor record mismatches the rate type populated daily → Inconsistent PO amounts.

---

### 1.6 Tax Configuration

**Purpose**: Ensure correct tax calculation on every PO line based on vendor jurisdiction, product tax classification, and warehouse delivery point.

#### Required Configuration

| Element | [Odoo] | [Dynamics] |
|---|---|---|
| Tax Code / Rate | `account.tax` (type = `purchase`) | `TaxCode` + `TaxValue` |
| Tax Group on Product | `taxes_id` (M2M on product) | `TaxItemGroupId` on `InventTableModule` |
| Tax Group on Vendor | Via **Fiscal Position** mapping | `TaxGroupId` on `VendTable` |
| Jurisdiction Mapping | Fiscal Position (`account.fiscal.position`) maps tax A → tax B | `TaxJurisdiction` table |
| Reverse Charge | Fiscal Position with 0% output rule | `Reverse charge` flag on Sales Tax Group |
| Withholding Tax | Community: not native; Enterprise: partial | `WithholdingTax_*` configuration tables |

#### Common Setup Failures

1. Product has no purchase tax assigned → PO line created at 0% tax; discovered only at audit.
2. Fiscal Position not assigned to vendor → Domestic tax applied to foreign vendor.
3. Tax rounding method mismatch between ERP and local authority rules → Centime-level discrepancies in declarations.

---

### 1.7 Payment Terms

**Purpose**: Define when and how vendor invoices become due, driving cash-flow forecasting and AP ageing.

#### Required Fields

| Field | Type | Example |
|---|---|---|
| `name` | String | `Net 30`, `2/10 Net 30` |
| `line_ids` | Collection of due-date rules | Day 0 → 100% due in 30 days |
| `discount_pct` | Decimal | 2% early-payment discount |
| `discount_days` | Integer | Discount valid within 10 days |

- **[Odoo]**: Configured in `account.payment.term` with one or more lines specifying `value` (percent/balance), `days`, and `day_of_month`.
- **[Dynamics]**: `PaymTermId` with associated `PaymDay`, `PaymSched` (payment schedule), and cash-discount setup in `CashDisc`.

#### Common Setup Failures

1. Payment term lines do not sum to 100% → Partial invoice amount left unscheduled.
2. Discount terms configured but no discount GL account mapped → Discount taken but not posted.

---

### 1.8 Chart of Accounts (CoA)

**Purpose**: Provide the ledger structure that absorbs every financial dimension of a purchase transaction.

#### Minimum Required Accounts for Purchasing

| Account Purpose | Typical Code Range | Notes |
|---|---|---|
| **AP Control** | 4010xx | [Dynamics] Must be of type `Vendor` |
| **Inventory (raw materials)** | 3100xx | Debited on receipt for storable items |
| **Expense — Direct** | 6100xx | Debited for consumables/services |
| **Expense — Indirect** | 6200xx | Overhead, freight, insurance |
| **Tax Receivable (Input VAT)** | 4450xx | Debited when purchase tax is deductible |
| **FX Gain / Loss** | 7560xx / 7660xx | For multi-currency settlements |
| **Accrued Liabilities** | 4080xx | Goods received / invoice not received |
| **Fixed Assets** | 2xxx | When PO is for capital items |

#### Common Setup Failures

1. AP control account not flagged as "reconcilable" → [Odoo] Partner balances cannot be computed.
2. No accrued-liabilities account → Goods receipt creates an unbalanced journal entry.
3. Account locked or archived → PO confirmation fails with an opaque accounting error.

---

### 1.9 Budget Configuration & Cost Centers

**Purpose**: Enforce spending governance by validating PO amounts against pre-approved budgets and allocating costs to organisational dimensions.

#### Required Configuration

| Element | Description | Notes |
|---|---|---|
| `budget_period` | Fiscal year or custom period | Aligned with company fiscal calendar |
| `budget_lines` | Amount per account per period | [Odoo] `crossovered.budget.lines` |
| `cost_center` | Organisational dimension | [Odoo] Analytic Account; [Dynamics] `Financial Dimension` (e.g., `Department`, `CostCenter`) |
| `budget_control_action` | `Warn`, `Block`, `None` | [Dynamics] Set per budget model; [Odoo] no native hard block — requires custom module or approval workflow |
| `budget_checking_scope` | Actual + Committed (encumbrance) | [Dynamics] Budget control configuration includes PO encumbrance |

#### Common Setup Failures

1. Budget control enabled without encumbrance mapping → PO amounts not reserved against budget.
2. Cost centre mandatory on PO line but no default set → Users cannot save PO without manual entry, causing friction.
3. [Dynamics] Budget period status not set to `Open` → PO creation blocked even when funds are available.

---

## 2. Role & Permission Structure

### 2.1 User Roles

| Role | Scope | Key Permissions |
|---|---|---|
| **Procurement Manager** | Global | Create, edit, approve, cancel POs; manage vendors; configure approval rules |
| **Buyer / Purchaser** | Assigned categories or warehouses | Create and edit draft POs; submit for approval; view vendor master |
| **Warehouse Manager** | Assigned warehouse(s) | View POs for their warehouse; confirm receipt readiness |
| **Finance Controller** | Company-wide financial data | View POs; validate budget availability; override fiscal holds |
| **Accounts Payable Clerk** | AP transactions | View approved POs (read-only); no PO creation rights |
| **Department Requester** | Own cost centre | Create Purchase Requisitions; cannot create POs directly |
| **System Administrator** | Full system | Manage roles, workflows, integrations; no transactional access in production |
| **Auditor** | Read-only, all modules | View all POs, logs, and configuration; no write access |

### 2.2 Permission Matrix

| Module / Action | Requester | Buyer | Proc. Manager | Warehouse Mgr | Finance Controller | AP Clerk | Auditor |
|---|---|---|---|---|---|---|---|
| Create Purchase Requisition | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Draft PO | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Draft PO | ❌ | ✅ (own) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Submit PO for Approval | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve PO (Tier 1) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve PO (Tier 2 — Financial) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Cancel / Void PO | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View PO | ❌ | ✅ (own) | ✅ | ✅ (own WH) | ✅ | ✅ | ✅ |
| Manage Vendors | ❌ | ✅ (propose) | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Configure Workflows | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> `System Administrator` has workflow/config rights and is intentionally excluded from the transactional matrix.

### 2.3 Approval Hierarchy

```
Purchase Requisition
  └─► Dept. Manager (if amount > 0)
        └─► [Optional] Budget Holder
              └─► Buyer converts to Draft PO

Draft PO
  └─► Tier 1: Procurement Manager
  │     Condition: PO total ≤ Tier 1 limit
  │
  └─► Tier 2: Finance Controller
  │     Condition: PO total > Tier 1 limit OR flagged vendor
  │
  └─► Tier 3: CFO / Managing Director
        Condition: PO total > Tier 2 limit OR exceptional override
```

### 2.4 Financial Approval Limits

| Tier | Role | Maximum PO Value | Escalation Target |
|---|---|---|---|
| 0 | Buyer (auto-approve) | ≤ 5,000 (local currency) | Procurement Manager |
| 1 | Procurement Manager | ≤ 50,000 | Finance Controller |
| 2 | Finance Controller | ≤ 250,000 | CFO |
| 3 | CFO / Managing Director | Unlimited | Board (if policy requires) |

> Limits are illustrative. Each organisation must define values aligned with its delegation-of-authority policy.

---

## 3. Workflow Configuration

### 3.1 PO Lifecycle States

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
│  Draft   │────►│ Submitted │────►│ Approved │────►│ Confirmed│────►│  Sent  │
└──────────┘     └───────────┘     └──────────┘     └──────────┘     └────────┘
      │                │                                                  │
      │                ▼                                                  │
      │          ┌──────────┐                                             │
      └─────────►│ Rejected │◄────────────────────────────────────────────┘
                 └──────────┘                                      (Vendor declines)
                       │
                       ▼
                 ┌──────────┐
                 │ Cancelled│
                 └──────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Draft` | PO created, editable | → `Submitted`, → `Cancelled` |
| `Submitted` | Pending approval routing | → `Approved`, → `Rejected` |
| `Approved` | All tiers approved | → `Confirmed` |
| `Confirmed` | Quantities reserved, budget encumbered | → `Sent` |
| `Sent` | Transmitted to vendor (email/EDI/API) | → `Cancelled` (by Proc. Manager) |
| `Rejected` | Returned with comments | → `Draft` (for revision) |
| `Cancelled` | Terminal state; PO void | None |

#### Platform Notes

- **[Odoo]**: Native states are `draft`, `sent`, `purchase`, `done`, `cancel`. The approval tier is typically implemented via the **Approvals** module or `purchase.approval` (Enterprise) or a custom `ir.rule`-based workflow.
- **[Dynamics]**: Uses the **Workflow** framework. PO workflow is configured in **Procurement and sourcing → Setup → Procurement and sourcing workflows** with conditions on amount, vendor group, and category.

### 3.2 Approval Routing Logic

| Rule | Condition | Action |
|---|---|---|
| Auto-approve | `po_total ≤ auto_approve_limit` AND `vendor.risk_level = low` | Skip Tier 1; move to `Confirmed` |
| Single-tier | `po_total ≤ tier_1_limit` | Route to Procurement Manager |
| Dual-tier | `po_total > tier_1_limit` | Route to Procurement Manager → Finance Controller |
| Escalation | Approver does not act within `sla_hours` | Escalate to next tier + notify requester |
| Conflict of interest | `po.created_by == approver` | [Dynamics] Block self-approval; [Odoo] configurable via `self_approve` flag |
| Blacklisted vendor | `vendor.is_blacklisted = True` | Block submission; require Compliance Officer override |

### 3.3 Notification Triggers

| Event | Channel | Recipients |
|---|---|---|
| PO submitted for approval | In-app + Email | Tier 1 approver |
| PO approved (all tiers) | In-app + Email | Buyer, Warehouse Manager |
| PO rejected | In-app + Email | Buyer + rejection comment |
| Approval SLA breached | Email + SMS (optional) | Current approver + escalation target |
| PO cancelled | In-app | All stakeholders on the PO |
| Budget threshold exceeded | In-app + Email | Finance Controller |
| Vendor auto-blocked | In-app | Procurement Manager |

### 3.4 Audit Logging Policy

| Attribute | Requirement |
|---|---|
| **Events Logged** | Create, edit (field-level diff), state transition, approval, rejection, cancellation, print, email-send |
| **Fields Captured** | `timestamp`, `user_id`, `ip_address`, `old_value`, `new_value`, `event_type`, `document_ref` |
| **Retention Period** | Minimum 7 years (aligned with most fiscal-record-retention laws) |
| **Access** | Read-only for `Auditor` and `Finance Controller` roles |
| **Tamper Protection** | Logs stored in append-only table; no `UPDATE` or `DELETE` grants |
| **Platform** | [Odoo] `mail.tracking.value` + custom audit model; [Dynamics] `DatabaseLog` + `SysAuditLog` |

---

## 4. Integration Layer

### 4.1 ERP–WMS Integration Readiness Checklist

- [ ] Warehouse codes synchronised between ERP and WMS
- [ ] Product master (SKU, UoM, weight, dimensions) replicated to WMS
- [ ] Vendor master shared or mapped between systems
- [ ] Inbound PO data pushed to WMS upon PO confirmation
- [ ] ASN (Advance Shipping Notice) structure agreed with WMS vendor
- [ ] Location/bin structure in WMS mirrors ERP storage locations
- [ ] UoM conversion table consistent across both systems
- [ ] Error queue and dead-letter handling configured
- [ ] Retry policy defined (exponential backoff, max attempts)
- [ ] Monitoring and alerting active on integration middleware

### 4.2 API Endpoints

| Resource | Method | Path | Purpose |
|---|---|---|---|
| Vendors | `GET` | `/api/v1/vendors` | List active vendors with pagination |
| Vendors | `POST` | `/api/v1/vendors` | Create new vendor record |
| Vendors | `PATCH` | `/api/v1/vendors/{id}` | Update vendor fields |
| Products | `GET` | `/api/v1/products?purchase_ok=true` | Purchasable product catalogue |
| Products | `GET` | `/api/v1/products/{id}/suppliers` | Supplier-info records for a product |
| PO | `POST` | `/api/v1/purchase-orders` | Create draft PO |
| PO | `GET` | `/api/v1/purchase-orders/{id}` | Retrieve PO with lines |
| PO | `PATCH` | `/api/v1/purchase-orders/{id}` | Update draft PO |
| PO | `POST` | `/api/v1/purchase-orders/{id}/submit` | Submit PO for approval |
| PO | `POST` | `/api/v1/purchase-orders/{id}/approve` | Approve PO (tier-aware) |
| PO | `POST` | `/api/v1/purchase-orders/{id}/cancel` | Cancel PO |
| Budget | `GET` | `/api/v1/budgets/check?account={id}&amount={val}` | Budget availability check |
| Exchange Rates | `GET` | `/api/v1/exchange-rates?base={cur}&date={d}` | Rate lookup |
| UoM | `GET` | `/api/v1/uom/convert?from={id}&to={id}&qty={q}` | Unit conversion |
| Audit Log | `GET` | `/api/v1/audit-logs?document_type=PO&ref={id}` | Audit trail for a PO |

### 4.3 Event Triggers & Webhook Structure

| Event | Trigger Point | Payload Summary |
|---|---|---|
| `po.created` | PO saved as Draft | `{ po_id, vendor_id, lines[], total, currency, created_by }` |
| `po.submitted` | PO moves to Submitted | `{ po_id, submitted_by, approval_route }` |
| `po.approved` | Final tier approval granted | `{ po_id, approved_by, tier, timestamp }` |
| `po.confirmed` | PO confirmed and budget encumbered | `{ po_id, warehouse_id, expected_date, lines[] }` |
| `po.sent` | PO transmitted to vendor | `{ po_id, channel (email/EDI/API), sent_at }` |
| `po.cancelled` | PO voided | `{ po_id, cancelled_by, reason }` |
| `vendor.blocked` | Vendor status changed to Blocked | `{ vendor_id, blocked_by, reason, affected_pos[] }` |
| `budget.exceeded` | PO amount exceeds available budget | `{ po_id, budget_id, requested, available, overage }` |

**Webhook Contract**

```json
{
  "event": "po.approved",
  "timestamp": "2026-03-04T14:32:00Z",
  "source": "erp",
  "payload": { ... },
  "metadata": {
    "correlation_id": "uuid-v4",
    "retry_count": 0,
    "idempotency_key": "uuid-v4"
  }
}
```

### 4.4 Message Queue Configuration

| Attribute | Value |
|---|---|
| **Broker** | RabbitMQ / Azure Service Bus / AWS SQS (per infrastructure) |
| **Exchange / Topic** | `erp.procurement.events` |
| **Queues** | `wms.inbound`, `finance.budget`, `notifications.email` |
| **Message Format** | JSON with schema version header |
| **Retry Policy** | Exponential backoff: 1s → 5s → 30s → 5m; max 5 attempts |
| **Dead Letter Queue** | `erp.procurement.dlq` — manual review required |
| **Idempotency** | Consumer deduplicates on `idempotency_key` |
| **Ordering** | Per-PO ordering via `partition_key = po_id` |
| **TTL** | Messages expire after 72 hours if unprocessed |

---

## 5. Data Validation Rules

### 5.1 Vendor Validation

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| V-01 | `vendor.status == 'Active'` | Blocking | Reject PO creation |
| V-02 | `vendor.tax_id` is non-empty and format-valid | Blocking | Reject PO creation |
| V-03 | At least one bank account with status `Verified` | Warning | Allow PO; block payment later |
| V-04 | Vendor not on internal blacklist | Blocking | Reject PO; notify Compliance |
| V-05 | Vendor not on government sanctions list (OFAC/EU) | Blocking | Reject PO; log to compliance audit |
| V-06 | Vendor has valid insurance certificate (if applicable) | Warning | Allow PO; flag for procurement review |
| V-07 | `vendor.payment_terms_id` is set | Blocking | Reject PO creation |

### 5.2 Product Purchasing Eligibility

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| P-01 | `product.can_be_purchased == True` | Blocking | Product excluded from PO line search |
| P-02 | `product.status == 'Active'` | Blocking | Product excluded from PO line search |
| P-03 | Product has at least one `supplier_info` record for the selected vendor | Warning | Allow PO; unit price defaults to 0.00 |
| P-04 | Purchase UoM conversion exists (purchase UoM → stock UoM) | Blocking | Reject PO line |
| P-05 | Product tax classification is set | Warning | PO line created at 0% tax; flag for review |

### 5.3 Accounting Linkage

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| A-01 | Vendor has AP control account mapped | Blocking | PO confirmation fails |
| A-02 | Product/category has expense or inventory account mapped | Blocking | PO confirmation fails |
| A-03 | Tax accounts (input VAT, reverse charge) exist in CoA | Blocking | Tax engine raises exception |
| A-04 | FX gain/loss accounts configured for PO currency pair | Warning | PO created; settlement journal fails later |
| A-05 | Cost centre / analytic account set on PO line (if mandatory) | Blocking | PO line save rejected |

### 5.4 Compliance & Spending Controls

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| C-01 | PO total ≤ user's approval authority | Routing | Escalate to higher approval tier |
| C-02 | PO total ≤ available budget for target account + period | Configurable | Warn or Block per `budget_control_action` |
| C-03 | No single PO line exceeds `max_line_amount` threshold | Warning | Flag for manager review |
| C-04 | Vendor is not in conflict-of-interest registry for the buyer | Blocking | Reject submission; log event |
| C-05 | PO currency matches vendor default currency (or override justified) | Warning | Allow PO; require currency-override reason |
| C-06 | Delivery date is ≥ today + minimum lead time | Warning | Allow PO; flag potential late delivery |

---

## 6. System Readiness Checklist

### Master Data Readiness

- [ ] At least one active vendor with complete record (tax ID, bank, payment terms, fiscal position)
- [ ] At least one purchasable product with valid UoM, cost method, and expense/inventory account
- [ ] At least one warehouse with active input location
- [ ] UoM categories and conversions verified (purchase → stock)
- [ ] All active transaction currencies have exchange rates loaded for current period
- [ ] Purchase tax codes created and assigned to products and vendors/fiscal positions
- [ ] Payment terms defined and assigned to at least one vendor
- [ ] Chart of Accounts includes: AP control, inventory, expense, tax, FX, accrual accounts
- [ ] Budget periods open and budget lines entered (if budget control is active)
- [ ] Cost centres / analytic accounts created and mapped to organisational structure

### Security & Roles

- [ ] All procurement roles created and assigned to named users
- [ ] Permission matrix validated: buyers can create POs, approvers can approve, AP can view
- [ ] No user holds both `Buyer` and `Approver` roles on the same PO scope (segregation of duties)
- [ ] Approval limits configured per tier and tested with boundary-value POs
- [ ] Audit log access restricted to authorised roles

### Workflow & Process

- [ ] PO approval workflow published and active
- [ ] Approval routing tested: single-tier, dual-tier, escalation, self-approval block
- [ ] Notification templates created for all trigger events
- [ ] Notification delivery confirmed (email SMTP, in-app channel)
- [ ] Rejected-PO resubmission flow tested end-to-end
- [ ] Cancellation flow tested with budget de-encumbrance verification

### Integration

- [ ] ERP–WMS product and warehouse sync verified
- [ ] API authentication configured (API keys / OAuth tokens)
- [ ] Webhook endpoints registered and responding with `2xx`
- [ ] Message queue broker running; consumers healthy
- [ ] Dead-letter queue monitored with alerting
- [ ] End-to-end integration test: PO confirmed → WMS receives inbound order

### Data Quality

- [ ] No duplicate vendors (deduplicated on tax ID + legal name)
- [ ] No orphan products (products without category or UoM)
- [ ] All mandatory fields populated (run validation report)
- [ ] Historical exchange rates back-loaded (if migrating open POs)
- [ ] Sanctions/blacklist database current (loaded within last 30 days)

---

## 7. Is the Platform Ready for PO Creation?

### Domain Summary

| # | Domain | Status | Blockers |
|---|---|---|---|
| 1 | Vendor Master | ⬜ `PENDING` | |
| 2 | Product Master | ⬜ `PENDING` | |
| 3 | Warehouses & Locations | ⬜ `PENDING` | |
| 4 | Units of Measure | ⬜ `PENDING` | |
| 5 | Currency & Exchange Rates | ⬜ `PENDING` | |
| 6 | Tax Configuration | ⬜ `PENDING` | |
| 7 | Payment Terms | ⬜ `PENDING` | |
| 8 | Chart of Accounts | ⬜ `PENDING` | |
| 9 | Budget & Cost Centres | ⬜ `PENDING` | |
| 10 | Roles & Permissions | ⬜ `PENDING` | |
| 11 | Approval Workflow | ⬜ `PENDING` | |
| 12 | Notifications | ⬜ `PENDING` | |
| 13 | Audit Logging | ⬜ `PENDING` | |
| 14 | ERP–WMS Integration | ⬜ `PENDING` | |
| 15 | API & Webhooks | ⬜ `PENDING` | |
| 16 | Data Validation Rules | ⬜ `PENDING` | |

### Readiness Score

```
Score: __ / 16 domains verified
```

### Verdict

| Score Range | Verdict | Meaning |
|---|---|---|
| 16 / 16 | ✅ **READY** | All prerequisites met. PO creation may proceed. |
| 12–15 / 16 | 🟡 **CONDITIONALLY READY** | Non-blocking gaps exist. Document accepted risks and proceed with monitoring. |
| < 12 / 16 | 🔴 **NOT READY** | Blocking gaps remain. Resolve listed blockers before go-live. |

### Blocking-Domain Recommendations

> Complete this section after evaluating each domain above.

| Domain | Recommendation |
|---|---|
| *(example)* Vendor Master | Load and validate all active vendors with complete tax ID and bank details before cutover. |
| *(example)* Approval Workflow | Publish and test dual-tier approval with escalation before enabling PO creation for Buyers. |

---

*Document version: 1.0 — Generated 2026-03-04*
*Applicable platforms: Odoo 17, Microsoft Dynamics 365 F&SCM, Generic ERP*
