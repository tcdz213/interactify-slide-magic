# ERP Post-PO Lifecycle — GRN, 3-Way Match, Invoice Verification & AP Payment

> **Scope**: This document covers every process that occurs **after** a Purchase Order is approved and sent to the vendor: goods receipt (GRN), three-way matching, supplier invoice verification, and accounts payable settlement. Pre-PO prerequisites are covered in [ERP_PO_PREREQUISITES.md](./ERP_PO_PREREQUISITES.md).
>
> **Platform Reference**: Generic ERP architecture with inline annotations for **[Odoo]** (Community/Enterprise 17) and **[Dynamics]** (D365 Finance & Supply Chain Management).

---

## Table of Contents

1. [Goods Receipt (GRN)](#1-goods-receipt-grn)
2. [Quality Control at Receipt](#2-quality-control-at-receipt)
3. [Three-Way Match Engine](#3-three-way-match-engine)
4. [Supplier Invoice Verification](#4-supplier-invoice-verification)
5. [Accounts Payable Settlement](#5-accounts-payable-settlement)
6. [Accounting Entries & Journal Flow](#6-accounting-entries--journal-flow)
7. [Exception Handling & Dispute Resolution](#7-exception-handling--dispute-resolution)
8. [Role & Permission Matrix](#8-role--permission-matrix)
9. [Integration Layer](#9-integration-layer)
10. [Data Validation Rules](#10-data-validation-rules)
11. [Process Readiness Checklist](#11-process-readiness-checklist)
12. [Is the Platform Ready for Post-PO Processing?](#12-is-the-platform-ready-for-post-po-processing)

---

## 1. Goods Receipt (GRN)

### 1.1 Purpose

Record the physical arrival and acceptance of goods against an approved Purchase Order, creating the inventory transaction that updates stock levels and triggers accrual accounting.

### 1.2 GRN Lifecycle States

```
┌───────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐
│  Pending   │────►│ In Progress│────►│  Completed │────►│  Posted  │
└───────────┘     └────────────┘     └───────────┘     └──────────┘
      │                                     │
      │                                     ▼
      │                              ┌────────────┐
      └─────────────────────────────►│  Cancelled  │
                                     └────────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Pending` | GRN created from PO; awaiting physical receipt | → `In Progress`, → `Cancelled` |
| `In Progress` | Goods being unloaded, counted, inspected | → `Completed` |
| `Completed` | All lines verified; QC passed | → `Posted` |
| `Posted` | Inventory updated; accounting entries created | Terminal (corrections via Stock Adjustment) |
| `Cancelled` | GRN voided before posting | Terminal |

### 1.3 GRN Line Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `grn_id` | String | System-generated | Links to GRN header |
| `line_id` | String | Unique within GRN | |
| `po_id` | FK → PO | Mandatory | Source purchase order |
| `po_line_id` | FK → PO Line | Mandatory | Exact line reference |
| `product_id` | FK → Product | Mandatory | Must match PO line product |
| `ordered_qty` | Decimal | From PO line | Copied at GRN creation |
| `received_qty` | Decimal | ≥ 0 | Actual count by warehouse staff |
| `rejected_qty` | Decimal | ≥ 0 | Failed QC or damaged |
| `accepted_qty` | Computed | `received_qty - rejected_qty` | Net accepted into inventory |
| `unit_id` | FK → UoM | Mandatory | Must match PO line UoM or have valid conversion |
| `conversion_factor` | Decimal | > 0 | Factor to convert to base (stock) UoM |
| `base_qty` | Computed | `accepted_qty × conversion_factor` | Quantity posted to inventory in base units |
| `batch_number` | String | Mandatory for batch-tracked items | Generated or scanned at receipt |
| `serial_numbers` | Array | Mandatory for serialised items | One per unit received |
| `production_date` | Date | Optional | For FEFO/FIFO management |
| `expiry_date` | Date | Optional; must be > `production_date` | Blocks receipt if expired |
| `storage_location_id` | FK → Location | Mandatory if WMS active | Putaway destination |
| `qc_status` | Enum | `Passed`, `Failed`, `Conditional`, `Pending` | Default `Pending` at creation |
| `qc_inspector_id` | FK → User | Set on QC completion | |
| `qc_notes` | Text | Optional | Defect descriptions, photos |
| `received_by` | FK → User | Mandatory | Warehouse operator |
| `received_at` | DateTime | Auto-set | Timestamp of physical receipt |

### 1.4 Receipt Types

| Type | Description | Platform Notes |
|---|---|---|
| **Full Receipt** | All PO lines received in full | Standard flow |
| **Partial Receipt** | Subset of lines or reduced quantities | PO remains `Open` for remaining balance |
| **Over-Receipt** | `received_qty > ordered_qty` | Configurable: block, warn, or allow with tolerance % |
| **Blind Receipt** | Receiver cannot see ordered quantities | [Odoo] `stock.picking.type.show_reserved = False`; forces honest count |
| **ASN-Based Receipt** | Pre-populated from vendor's Advance Shipping Notice | [Dynamics] `WHSInbound` load; [Odoo] via EDI module |

### 1.5 Unit Conversion at Receipt

**Business Rule BR-U12**: All inventory updates occur in **base units**.

```
received_qty (purchase UoM) × conversion_factor = base_qty (stock UoM)

Example:
  PO orders 50 Cartons of Product A (1 Carton = 12 Units)
  GRN receives 48 Cartons
  base_qty = 48 × 12 = 576 Units posted to inventory
```

#### Platform-Specific Handling

- **[Odoo]**: Conversion handled automatically via `uom_id` on stock move. Receipt UoM must belong to same UoM category as product's stock UoM.
- **[Dynamics]**: `UnitOfMeasureConversion` table resolves factor. If product-specific conversion exists, it takes precedence over global conversion.

### 1.6 Over-Receipt & Under-Receipt Tolerance

| Parameter | Description | Default |
|---|---|---|
| `over_receipt_tolerance_pct` | Maximum allowed over-delivery (%) | 5% |
| `under_receipt_tolerance_pct` | Minimum delivery to auto-close PO line (%) | 95% |
| `over_receipt_action` | `block`, `warn`, `allow` | `warn` |
| `auto_close_threshold` | Close PO line if received ≥ this % | 95% |

#### Common Setup Failures

1. Over-receipt tolerance not configured → Warehouse blocked from receiving extra pallets that vendor shipped as "rounded up."
2. Auto-close threshold too aggressive (100%) → PO lines remain open forever for trivial shortages (1-2 units).
3. Blind receipt disabled for high-value items → Operators copy ordered quantity without counting.

### 1.7 Inventory Impact

On GRN posting:

| Transaction | Debit | Credit | Amount |
|---|---|---|---|
| Inventory receipt (storable) | Inventory Asset (3100xx) | Goods Received Not Invoiced — GRNI (4080xx) | `base_qty × standard_cost` |
| Expense receipt (consumable) | Expense Account (6100xx) | GRNI (4080xx) | `received_qty × PO unit_cost` |

> The GRNI (accrual) account is critical: it bridges the gap between goods receipt and invoice receipt, ensuring the balance sheet reflects the liability even before the invoice arrives.

---

## 2. Quality Control at Receipt

### 2.1 QC Inspection Workflow

```
┌──────────┐     ┌────────────┐     ┌──────────┐
│  Pending  │────►│ In Progress│────►│ Completed│
└──────────┘     └────────────┘     └──────────┘
                                         │
                              ┌──────────┼──────────┐
                              ▼          ▼          ▼
                         ┌────────┐ ┌─────────┐ ┌────────────┐
                         │ Passed │ │ Failed  │ │Conditional │
                         └────────┘ └─────────┘ └────────────┘
```

### 2.2 QC Actions by Result

| QC Result | Inventory Action | Downstream Impact |
|---|---|---|
| `Passed` | Move to designated storage location | Available for picking/sales |
| `Failed` | Move to returns/quarantine location; increment `rejected_qty` | Supplier return initiated; debit note raised |
| `Conditional` | Move to hold location; flag for re-inspection | Stock blocked from allocation until resolved |

### 2.3 QC Parameters

| Parameter | Description | Example |
|---|---|---|
| `inspection_plan_id` | Predefined checklist per product category | "Food Safety — Cold Chain" |
| `sample_size_pct` | Percentage of received lot to inspect | 10% |
| `defect_types` | Enumerated defect codes | `Damaged`, `Expired`, `Wrong Item`, `Short Count`, `Contaminated` |
| `auto_qc_products` | Products exempt from QC (low risk) | Office supplies |
| `quarantine_location_id` | Default hold location for failed/conditional items | `WH-01/QC-HOLD` |

### 2.4 Platform-Specific QC

- **[Odoo]**: Quality module (`quality.check`, `quality.alert`) with check types: `pass_fail`, `measure`, `take_picture`. Checks auto-created on receipt based on quality control points.
- **[Dynamics]**: **Quality management** module with quality orders, test instruments, and test variables. Quality orders auto-generated via quality associations linked to item, vendor, or warehouse.

---

## 3. Three-Way Match Engine

### 3.1 Purpose

Verify consistency across three independent documents before authorising vendor payment:

| Document | Source | Represents |
|---|---|---|
| **Purchase Order (PO)** | Buyer / Procurement | What was ordered |
| **Goods Receipt Note (GRN)** | Warehouse / Receiving | What was physically received |
| **Vendor Invoice** | Supplier / AP | What the vendor is billing |

### 3.2 Match Dimensions

| Dimension | PO Field | GRN Field | Invoice Field | Match Rule |
|---|---|---|---|---|
| **Quantity** | `po_line.qty` (base UoM) | `grn_line.base_qty` | `invoice_line.base_qty` | All three equal (within tolerance) |
| **Unit Price** | `po_line.unit_cost` | N/A | `invoice_line.unit_cost` | PO price = Invoice price (within tolerance) |
| **Line Total** | `po_line.line_total` | N/A | `invoice_line.line_total` | Computed from qty × price |
| **Product** | `po_line.product_id` | `grn_line.product_id` | `invoice_line.product_id` | Exact match |
| **Tax** | `po_line.tax_amount` | N/A | `invoice_line.tax_amount` | Within rounding tolerance |

### 3.3 Match Statuses

| Status | Icon | Meaning | Action Required |
|---|---|---|---|
| `matched` | ✅ | All dimensions within tolerance | Auto-approve for payment |
| `within_tolerance` | ⚠️ | Variance exists but ≤ threshold | Log variance; auto-approve (configurable) |
| `mismatch` | ❌ | Variance exceeds threshold | Block payment; route to exception queue |

### 3.4 Tolerance Configuration

| Parameter | Description | Default | Notes |
|---|---|---|---|
| `qty_tolerance_pct` | Acceptable quantity variance (%) | 5% | **BR-U14**: Variance > 5% requires manager approval |
| `price_tolerance_pct` | Acceptable unit price variance (%) | 2% | Covers minor price adjustments, rounding |
| `price_tolerance_abs` | Absolute price variance threshold | 10.00 (local currency) | Whichever of % or absolute is larger applies |
| `tax_tolerance_abs` | Tax rounding tolerance | 1.00 (local currency) | Covers penny-rounding differences |
| `total_tolerance_pct` | Overall document total variance (%) | 1% | Final safety net |

### 3.5 Match Computation (Base Units)

**Business Rule BR-U12**: All matching happens in **base units** to eliminate unit confusion.

```
For each PO line:
  1. po_base_qty  = po_qty × po_conversion_factor
  2. grn_base_qty = grn_received_qty × grn_conversion_factor
  3. inv_base_qty = inv_qty × inv_conversion_factor

  4. grn_variance     = grn_base_qty - po_base_qty
  5. grn_variance_pct = (grn_variance / po_base_qty) × 100

  6. inv_variance     = inv_base_qty - po_base_qty
  7. inv_variance_pct = (inv_variance / po_base_qty) × 100

  8. price_variance     = inv_unit_cost - po_unit_cost
  9. price_variance_pct = (price_variance / po_unit_cost) × 100
```

### 3.6 Match Decision Matrix

| GRN Qty vs PO | Invoice Qty vs PO | Invoice Price vs PO | Result |
|---|---|---|---|
| Within tolerance | Within tolerance | Within tolerance | ✅ `matched` or `within_tolerance` |
| Within tolerance | Within tolerance | **Exceeds tolerance** | ❌ `mismatch` — Price dispute |
| Within tolerance | **Exceeds tolerance** | Any | ❌ `mismatch` — Quantity dispute |
| **Exceeds tolerance** | Within tolerance | Any | ❌ `mismatch` — Receipt discrepancy |
| **Exceeds tolerance** | **Exceeds tolerance** | **Exceeds tolerance** | ❌ `mismatch` — Full review required |

### 3.7 Platform-Specific Match

- **[Odoo]**: Three-way match controlled via `purchase.bill.union` and `stock.picking` reconciliation. Setting `company.po_three_way_match = True` (Enterprise) requires receipt validation before invoice approval. Tolerance configured per vendor or globally.
- **[Dynamics]**: **Invoice matching** configured in **AP parameters** with matching policies: `Two-way` (PO ↔ Invoice), `Three-way` (PO ↔ GRN ↔ Invoice). Match tolerances set per legal entity. `Charges matching` adds freight/misc comparison. Workflow routes exceptions to AP supervisor.

### 3.8 Two-Way vs Three-Way Match

| Match Type | Documents Compared | Use Case |
|---|---|---|
| **Two-Way** | PO ↔ Invoice | Services, non-stockable items (no GRN) |
| **Three-Way** | PO ↔ GRN ↔ Invoice | Stockable goods (standard) |
| **Four-Way** | PO ↔ GRN ↔ Invoice ↔ Inspection | High-value or regulated items requiring QC sign-off |

### 3.9 Common Setup Failures

1. Tolerance set to 0% → Every minor rounding difference triggers an exception, overwhelming the AP team.
2. Match policy set to `Two-Way` for stockable items → Invoices paid without confirming goods were received.
3. Base-unit conversion not applied during match → Cartons compared to Units, producing false mismatches.
4. No price tolerance configured → Legitimate price adjustments (volume discounts, index clauses) flagged as mismatches.

---

## 4. Supplier Invoice Verification

### 4.1 Invoice Receipt & Registration

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `invoice_id` | String | System-generated or vendor's number | Duplicate detection on vendor + invoice number |
| `vendor_id` | FK → Vendor | Mandatory | Must match PO vendor |
| `invoice_date` | Date | Mandatory | Vendor's invoice date |
| `due_date` | Date | Computed | `invoice_date + payment_terms` |
| `po_id` | FK → PO | Recommended | Auto-populates lines from PO |
| `currency_id` | FK → Currency | Mandatory | Must match or convert from PO currency |
| `exchange_rate` | Decimal | Auto-fetched for `invoice_date` | Used for multi-currency transactions |
| `subtotal` | Decimal | Sum of line totals | |
| `tax_amount` | Decimal | Computed from tax rules | |
| `total_amount` | Decimal | `subtotal + tax_amount` | |
| `status` | Enum | See lifecycle below | |

### 4.2 Invoice Lifecycle States

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
│  Draft   │────►│ Validated │────►│ Matched  │────►│ Approved │────►│ Posted │
└──────────┘     └───────────┘     └──────────┘     └──────────┘     └────────┘
      │                │                │                                  │
      ▼                ▼                ▼                                  ▼
┌──────────┐     ┌──────────┐   ┌───────────┐                       ┌─────────┐
│ Cancelled│     │ Rejected │   │ Disputed  │                       │  Paid   │
└──────────┘     └──────────┘   └───────────┘                       └─────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Draft` | Invoice registered, not yet validated | → `Validated`, → `Cancelled` |
| `Validated` | Data entry verified (amounts, tax, vendor) | → `Matched`, → `Rejected` |
| `Matched` | Three-way match passed or within tolerance | → `Approved`, → `Disputed` |
| `Disputed` | Match failed; exception raised | → `Matched` (after resolution), → `Cancelled` |
| `Approved` | Authorised for payment | → `Posted` |
| `Posted` | Journal entries created; AP liability recorded | → `Paid` |
| `Rejected` | Returned to vendor | Terminal (new invoice expected) |
| `Cancelled` | Voided | Terminal |
| `Paid` | Payment applied | Terminal |

### 4.3 Invoice Validation Checks

| Check ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| IV-01 | Vendor invoice number not already registered for this vendor | Blocking | Reject as duplicate |
| IV-02 | `invoice_date ≤ today` | Warning | Flag for review (future-dated invoices) |
| IV-03 | PO referenced on invoice exists and is in `Confirmed` or `Sent` status | Blocking | Reject; request valid PO reference |
| IV-04 | Invoice currency matches PO currency (or explicit conversion applied) | Warning | Allow with documented exchange rate |
| IV-05 | Tax calculation matches ERP tax engine output (within `tax_tolerance_abs`) | Warning | Flag for tax team review |
| IV-06 | Invoice total ≤ PO remaining un-invoiced amount | Blocking | Reject over-billing |
| IV-07 | All invoice lines map to valid PO lines | Blocking | Unmatched lines sent to exception queue |
| IV-08 | Vendor bank account on invoice matches registered bank account | Warning | Flag for fraud review |

### 4.4 Invoice Line Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `line_id` | String | Unique within invoice | |
| `product_id` | FK → Product | Mandatory | Must match PO line product |
| `description` | String | From vendor | May differ from internal product name |
| `qty` | Decimal | > 0 | Invoiced quantity |
| `unit_id` | FK → UoM | Mandatory | Must match PO line UoM |
| `conversion_factor` | Decimal | > 0 | For base-unit match computation |
| `base_qty` | Computed | `qty × conversion_factor` | For three-way match |
| `unit_cost` | Decimal | ≥ 0 | Vendor's invoiced price per unit |
| `line_total` | Computed | `qty × unit_cost` | |
| `tax_code_id` | FK → Tax Code | Mandatory | Must align with PO line tax |
| `tax_amount` | Computed | Per tax engine | |
| `po_line_id` | FK → PO Line | Recommended | Direct line-level matching |
| `grn_line_id` | FK → GRN Line | Recommended | For four-way match traceability |

### 4.5 Credit Note / Debit Note Handling

| Document | Initiated By | Purpose | Impact |
|---|---|---|---|
| **Credit Note** | Vendor | Reduce amount owed (returned goods, pricing error) | Reduces AP balance; offsets against future invoices or triggers refund |
| **Debit Note** | Buyer | Claim against vendor (short delivery, quality defect) | Reduces AP balance; must be accepted by vendor |

### 4.6 Platform-Specific Invoice Processing

- **[Odoo]**: Vendor bills created via `account.move` (type = `in_invoice`). PO-linked bills auto-populate lines. OCR available in Enterprise via `account_invoice_extract`. Three-way match enforced if `po_three_way_match` company setting is active.
- **[Dynamics]**: Vendor invoices entered in **AP → Invoice journal** or **Invoice register**. Invoice matching runs automatically on posting. **Workflow** can require AP manager approval for invoices exceeding match tolerance. **Vendor invoice automation** (Enterprise) supports OCR and auto-matching.

---

## 5. Accounts Payable Settlement

### 5.1 Payment Lifecycle

```
┌───────────┐     ┌────────────┐     ┌───────────┐     ┌───────────┐
│  Scheduled │────►│  Approved  │────►│ Submitted │────►│  Cleared  │
└───────────┘     └────────────┘     └───────────┘     └───────────┘
      │                                                       │
      ▼                                                       ▼
┌───────────┐                                           ┌───────────┐
│  On Hold  │                                           │ Reconciled│
└───────────┘                                           └───────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Scheduled` | Payment date calculated from invoice due date | → `Approved`, → `On Hold` |
| `On Hold` | Payment blocked (dispute, cash-flow constraint) | → `Scheduled` (after resolution) |
| `Approved` | Authorised by AP manager or treasury | → `Submitted` |
| `Submitted` | Sent to bank (wire, check, ACH) | → `Cleared` |
| `Cleared` | Bank confirms settlement | → `Reconciled` |
| `Reconciled` | Matched with bank statement line | Terminal |

### 5.2 Payment Methods

| Method | Description | Use Case | Processing Time |
|---|---|---|---|
| `Bank Transfer` / Wire | Electronic fund transfer | Domestic & international | 1-3 business days |
| `ACH / SEPA` | Batch electronic payment | High-volume domestic | 1-2 business days |
| `Check` | Paper instrument | Legacy vendors | 5-10 business days |
| `Letter of Credit` | Bank-guaranteed payment | International, high-value | Per LC terms |
| `Cash` | Physical currency | Petty cash purchases | Immediate |
| `Offset` | Credit note netted against invoice | Internal adjustment | Immediate |

### 5.3 Payment Run Configuration

| Parameter | Description | Default |
|---|---|---|
| `payment_run_frequency` | How often AP generates payment batch | Weekly |
| `payment_date_selection` | Which invoices to include | Due within next 7 days |
| `early_payment_discount` | Apply discount if paying before discount deadline | Yes, if > configured threshold |
| `currency_grouping` | Group payments by currency | Yes |
| `vendor_grouping` | Consolidate multiple invoices per vendor into single payment | Yes |
| `minimum_payment_amount` | Skip payments below this threshold | 10.00 (local currency) |
| `bank_account_selection` | Default outbound bank account | Per currency or per vendor |

### 5.4 Early Payment Discount Logic

```
If payment_date ≤ invoice_date + discount_days:
  payment_amount = invoice_total × (1 - discount_pct / 100)
  discount_amount = invoice_total × (discount_pct / 100)

  Journal:
    DR  AP Control          invoice_total
    CR  Bank Account         payment_amount
    CR  Purchase Discount    discount_amount
```

### 5.5 Partial Payment

| Scenario | Handling | Notes |
|---|---|---|
| Cash flow constraint | Pay partial amount; remaining balance stays as open AP | Invoice remains `Partially Paid` |
| Disputed line items | Pay undisputed portion; hold disputed amount | Requires invoice split or partial allocation |
| Instalment terms | Payment schedule auto-generated from payment terms | Each instalment is a separate AP transaction |

### 5.6 Payment Approval Matrix

| Payment Amount | Required Approval | Escalation |
|---|---|---|
| ≤ 10,000 | AP Clerk (auto-approve batch) | AP Manager |
| 10,001 – 100,000 | AP Manager | Finance Controller |
| 100,001 – 500,000 | Finance Controller | CFO |
| > 500,000 | CFO | Board / Dual signature |

### 5.7 Platform-Specific Payment Processing

- **[Odoo]**: Payments created via `account.payment` or batch via `account.payment.register`. Payment methods configured per journal (bank). SEPA export via `account_sepa` module. Reconciliation via `account.bank.statement.line` matching.
- **[Dynamics]**: Payment proposals generated in **AP → Payment journal**. Payment methods linked to **Methods of payment** (`PaymMode`). Positive pay files for check fraud prevention. Electronic payment formats (ISO 20022, NACHA) configured per bank account.

---

## 6. Accounting Entries & Journal Flow

### 6.1 End-to-End Journal Entries

#### Step 1: PO Confirmation (Encumbrance — Optional)

| Account | Debit | Credit |
|---|---|---|
| Budget Encumbrance (off-balance) | PO total | |
| Budget Encumbrance Control | | PO total |

#### Step 2: Goods Receipt (GRN Posted)

| Account | Debit | Credit | Basis |
|---|---|---|---|
| Inventory Asset (3100xx) | ✅ | | `base_qty × standard_cost` |
| GRNI — Goods Received Not Invoiced (4080xx) | | ✅ | Same amount |

> For consumables/services: Debit goes to Expense account, not Inventory.

#### Step 3: Invoice Posted

| Account | Debit | Credit | Basis |
|---|---|---|---|
| GRNI — Goods Received Not Invoiced (4080xx) | ✅ | | Clears accrual |
| Input VAT / Tax Receivable (4450xx) | ✅ | | Tax amount |
| AP Control (4010xx) | | ✅ | Invoice total (incl. tax) |

> **Price Variance** (standard costing): If invoice unit price ≠ standard cost, the difference is posted to a Purchase Price Variance account (6500xx).

#### Step 4: Payment

| Account | Debit | Credit | Basis |
|---|---|---|---|
| AP Control (4010xx) | ✅ | | Clears vendor liability |
| Bank Account (5120xx) | | ✅ | Payment amount |
| Purchase Discount (6550xx) | | ✅ (if applicable) | Early payment discount |
| FX Gain/Loss (7560xx/7660xx) | ✅ or ✅ | | If payment currency rate differs from invoice rate |

### 6.2 Variance Accounts

| Variance Type | Account | Trigger |
|---|---|---|
| Purchase Price Variance (PPV) | 6500xx | Invoice price ≠ Standard cost |
| Invoice Price Variance (IPV) | 6510xx | Invoice price ≠ PO price |
| Quantity Variance | 6520xx | GRN qty ≠ PO qty (beyond tolerance) |
| Exchange Rate Variance | 7560xx / 7660xx | FX rate at payment ≠ rate at invoice |
| Rounding Variance | 6590xx | Penny differences from UoM conversions |

### 6.3 Period-End Accrual (GRNI Reconciliation)

At each period close, the GRNI account balance represents goods received but not yet invoiced:

```
GRNI Balance = Σ(GRN posted amounts) - Σ(Invoice posted amounts matching those GRNs)

If GRNI balance > 0:
  → Accrued liability on balance sheet (goods received, invoice pending)

If GRNI balance < 0:
  → Overstated AP (possible duplicate invoice or over-billing)
  → Investigate and correct
```

---

## 7. Exception Handling & Dispute Resolution

### 7.1 Exception Types

| Exception Code | Description | Source | Resolution Path |
|---|---|---|---|
| `EX-QTY-SHORT` | GRN quantity < PO quantity (beyond tolerance) | GRN | Contact vendor for backorder or credit note |
| `EX-QTY-OVER` | GRN quantity > PO quantity (beyond tolerance) | GRN | Return excess or amend PO |
| `EX-QC-FAIL` | Quality inspection failed | QC | Supplier return + debit note |
| `EX-PRICE-DIFF` | Invoice price ≠ PO price | 3-Way Match | Negotiate with vendor; accept or dispute |
| `EX-QTY-MISMATCH` | Invoice qty ≠ GRN qty | 3-Way Match | Request corrected invoice |
| `EX-DUPLICATE-INV` | Same vendor invoice number already exists | Invoice Registration | Reject duplicate; investigate |
| `EX-NO-PO` | Invoice references non-existent or cancelled PO | Invoice Registration | Return to vendor; request valid PO ref |
| `EX-OVER-BILL` | Invoice total exceeds PO remaining un-invoiced amount | Invoice Validation | Reject; request credit note or PO amendment |
| `EX-BANK-MISMATCH` | Invoice bank details don't match vendor master | Invoice Validation | Escalate to fraud review team |
| `EX-TAX-DIFF` | Tax amount differs from ERP computation | Invoice Validation | Route to tax team |
| `EX-FX-VARIANCE` | Exchange rate difference exceeds threshold | Payment | Accept and post to FX gain/loss; or request rate adjustment |

### 7.2 Exception Workflow

```
Exception Detected
  └─► Auto-categorise (type + severity)
        └─► Route to responsible team
              └─► Investigate & document
                    └─► Resolution action:
                          ├── Accept variance (post to variance account)
                          ├── Request credit note / corrected invoice
                          ├── Amend PO (with approval)
                          ├── Process supplier return
                          └── Escalate to management
```

### 7.3 Exception SLAs

| Severity | Resolution Target | Escalation After |
|---|---|---|
| `Critical` (> 10% variance or > 50,000 in value) | 24 hours | 12 hours |
| `High` (5-10% variance) | 3 business days | 2 business days |
| `Medium` (2-5% variance) | 5 business days | 3 business days |
| `Low` (< 2% variance, rounding) | 10 business days | 5 business days |

---

## 8. Role & Permission Matrix

### 8.1 Post-PO Roles

| Role | Scope | Key Permissions |
|---|---|---|
| **Warehouse Receiver** | Assigned warehouse(s) | Create & edit GRN lines; record received quantities; scan barcodes |
| **QC Inspector** | Assigned product categories | Perform inspections; update QC status; flag defects |
| **Warehouse Manager** | Assigned warehouse(s) | Approve/post GRN; manage putaway; handle over-receipt |
| **AP Clerk** | AP transactions | Register invoices; perform data entry; run three-way match |
| **AP Manager** | AP department | Approve invoices; resolve match exceptions; authorise payments within limit |
| **Finance Controller** | Company-wide | Override match tolerances; approve high-value payments; manage disputes |
| **Treasury** | Cash management | Execute payment runs; manage bank relationships; reconcile statements |
| **Procurement Manager** | Global | Amend POs for exception resolution; negotiate with vendors |
| **Auditor** | Read-only, all modules | Review match results, exception logs, payment trails |

### 8.2 Permission Matrix — Post-PO

| Action | WH Receiver | QC Inspector | WH Manager | AP Clerk | AP Manager | Finance Ctrl | Treasury | Proc. Mgr | Auditor |
|---|---|---|---|---|---|---|---|---|---|
| Create GRN | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit GRN lines | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Post GRN | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Perform QC | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Register invoice | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Run 3-way match | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Resolve exceptions | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Override tolerance | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve invoice | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Execute payment | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve payment | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reconcile bank | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View all records | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |

---

## 9. Integration Layer

### 9.1 API Endpoints — Post-PO

| Resource | Method | Path | Purpose |
|---|---|---|---|
| GRN | `POST` | `/api/v1/grns` | Create GRN from PO |
| GRN | `GET` | `/api/v1/grns/{id}` | Retrieve GRN with lines |
| GRN | `PATCH` | `/api/v1/grns/{id}` | Update GRN lines (pre-posting) |
| GRN | `POST` | `/api/v1/grns/{id}/post` | Post GRN (inventory + accounting) |
| QC | `POST` | `/api/v1/qc-inspections` | Create inspection record |
| QC | `PATCH` | `/api/v1/qc-inspections/{id}` | Update inspection result |
| Match | `POST` | `/api/v1/three-way-match` | Run match for PO + GRN + Invoice |
| Match | `GET` | `/api/v1/three-way-match/{po_id}` | Get match results |
| Invoice | `POST` | `/api/v1/vendor-invoices` | Register vendor invoice |
| Invoice | `GET` | `/api/v1/vendor-invoices/{id}` | Retrieve invoice with lines |
| Invoice | `POST` | `/api/v1/vendor-invoices/{id}/validate` | Validate invoice data |
| Invoice | `POST` | `/api/v1/vendor-invoices/{id}/approve` | Approve invoice for payment |
| Invoice | `POST` | `/api/v1/vendor-invoices/{id}/post` | Post journal entries |
| Payment | `POST` | `/api/v1/payment-runs` | Generate payment proposal |
| Payment | `GET` | `/api/v1/payment-runs/{id}` | Retrieve payment batch |
| Payment | `POST` | `/api/v1/payment-runs/{id}/approve` | Approve payment batch |
| Payment | `POST` | `/api/v1/payment-runs/{id}/submit` | Submit to bank |
| Payment | `POST` | `/api/v1/payments/{id}/reconcile` | Reconcile with bank statement |
| Exceptions | `GET` | `/api/v1/match-exceptions` | List open match exceptions |
| Exceptions | `PATCH` | `/api/v1/match-exceptions/{id}` | Update exception resolution |
| GRNI | `GET` | `/api/v1/reports/grni-balance` | GRNI account reconciliation |

### 9.2 Event Triggers & Webhooks

| Event | Trigger Point | Payload Summary |
|---|---|---|
| `grn.created` | GRN initiated from PO | `{ grn_id, po_id, warehouse_id, lines[], created_by }` |
| `grn.posted` | GRN posted to inventory | `{ grn_id, po_id, inventory_transactions[], journal_id }` |
| `qc.completed` | QC inspection finished | `{ inspection_id, grn_id, results[], overall_status }` |
| `qc.failed` | QC failed — supplier return needed | `{ inspection_id, product_id, defect_type, qty_rejected }` |
| `invoice.registered` | Vendor invoice entered | `{ invoice_id, vendor_id, po_id, total, currency }` |
| `invoice.matched` | Three-way match completed | `{ invoice_id, match_status, variances[], exceptions[] }` |
| `invoice.approved` | Invoice approved for payment | `{ invoice_id, approved_by, payment_due_date }` |
| `invoice.disputed` | Match exception raised | `{ invoice_id, exception_type, variance_details }` |
| `payment.scheduled` | Payment added to run | `{ payment_id, vendor_id, amount, currency, due_date }` |
| `payment.submitted` | Payment sent to bank | `{ payment_id, bank_ref, amount, currency, method }` |
| `payment.cleared` | Bank confirms settlement | `{ payment_id, bank_ref, cleared_date, amount }` |
| `payment.reconciled` | Matched with bank statement | `{ payment_id, statement_line_id, reconciled_by }` |

### 9.3 Webhook Contract

```json
{
  "event": "invoice.matched",
  "timestamp": "2026-03-04T14:32:00Z",
  "source": "erp",
  "payload": {
    "invoice_id": "INV-2026-0042",
    "po_id": "PO-2026-0015",
    "grn_id": "GRN-2026-0023",
    "match_status": "within_tolerance",
    "variances": [
      {
        "product_id": "P001",
        "dimension": "quantity",
        "po_value": 600,
        "grn_value": 588,
        "invoice_value": 588,
        "variance_pct": -2.0
      }
    ],
    "overall_variance_pct": -2.0,
    "auto_approved": true
  },
  "metadata": {
    "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
    "retry_count": 0,
    "idempotency_key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

---

## 10. Data Validation Rules

### 10.1 GRN Validation

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| G-01 | PO exists and is in `Confirmed` or `Sent` status | Blocking | Reject GRN creation |
| G-02 | `received_qty ≥ 0` for all lines | Blocking | Reject line |
| G-03 | `received_qty ≤ ordered_qty × (1 + over_receipt_tolerance_pct / 100)` | Configurable | Block or warn per tolerance setting |
| G-04 | Batch number provided for batch-tracked products | Blocking | Reject line |
| G-05 | Serial numbers unique and not already in system | Blocking | Reject line |
| G-06 | `expiry_date > today` for perishable items | Blocking | Reject line (no expired goods into stock) |
| G-07 | `expiry_date > production_date` | Blocking | Reject line (data integrity) |
| G-08 | Storage location is valid and active | Blocking | Reject line |
| G-09 | UoM conversion factor matches product unit configuration | Warning | Flag for review |
| G-10 | `base_qty = accepted_qty × conversion_factor` (within 0.01) | Blocking | Recalculate or reject |

### 10.2 Invoice Validation

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| I-01 | No duplicate `vendor_id + invoice_number` combination | Blocking | Reject as duplicate |
| I-02 | Referenced PO exists and is in post-approval state | Blocking | Reject |
| I-03 | All invoice lines map to valid PO lines | Blocking | Reject unmatched lines |
| I-04 | `invoice_total ≤ po_total - previously_invoiced_total` | Blocking | Reject over-billing |
| I-05 | Tax computation matches ERP tax engine (within `tax_tolerance_abs`) | Warning | Route to tax review |
| I-06 | Invoice currency matches PO currency or explicit rate applied | Warning | Allow with documented rate |
| I-07 | Vendor bank account matches master data | Warning | Escalate to fraud review |
| I-08 | `invoice_date` is within current or prior fiscal period | Warning | Flag if in closed period |

### 10.3 Payment Validation

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| P-01 | Invoice is in `Approved` or `Posted` status | Blocking | Exclude from payment run |
| P-02 | Payment amount ≤ invoice open balance | Blocking | Reject overpayment |
| P-03 | Vendor bank account is `Verified` status | Blocking | Hold payment; notify AP |
| P-04 | Payment amount within user's approval authority | Routing | Escalate to higher approver |
| P-05 | Sufficient bank balance (if cash management active) | Warning | Flag for treasury review |
| P-06 | No duplicate payment for same invoice | Blocking | Reject; investigate |
| P-07 | FX rate variance within threshold (for multi-currency) | Warning | Log variance; proceed |

### 10.4 Three-Way Match Validation

| Rule ID | Rule | Severity | Action on Failure |
|---|---|---|---|
| M-01 | PO, GRN, and Invoice reference the same vendor | Blocking | Reject match |
| M-02 | All three documents reference the same product on each line | Blocking | Reject line match |
| M-03 | Quantities converted to base units before comparison | Mandatory | System must enforce BR-U12 |
| M-04 | Quantity variance ≤ `qty_tolerance_pct` | Configurable | `matched` / `within_tolerance` / `mismatch` |
| M-05 | Price variance ≤ `price_tolerance_pct` or `price_tolerance_abs` | Configurable | Same as M-04 |
| M-06 | Tax variance ≤ `tax_tolerance_abs` | Warning | Flag for tax review |
| M-07 | Overall document total variance ≤ `total_tolerance_pct` | Configurable | Final safety net |
| M-08 | Match result logged with full audit trail | Mandatory | Compliance requirement |

---

## 11. Process Readiness Checklist

### GRN Readiness

- [ ] GRN creation from approved PO tested end-to-end
- [ ] Partial receipt flow tested (PO remains open for balance)
- [ ] Over-receipt tolerance configured and tested
- [ ] Blind receipt option configured for applicable warehouses
- [ ] UoM conversion verified at receipt (purchase UoM → stock UoM)
- [ ] Batch/serial number capture tested for tracked items
- [ ] Expiry date validation active for perishable products
- [ ] Putaway rules configured for received goods
- [ ] GRNI journal entry verified on GRN posting
- [ ] QC inspection auto-creation tested for applicable products

### Three-Way Match Readiness

- [ ] Match tolerance parameters configured (qty, price, tax, total)
- [ ] Two-way match configured for service/non-stock POs
- [ ] Three-way match configured for stockable goods POs
- [ ] Base-unit conversion applied in match computation (BR-U12)
- [ ] Exception routing configured (by type and severity)
- [ ] Match results logged with full audit trail
- [ ] Auto-approve within tolerance tested
- [ ] Manager approval workflow tested for mismatches

### Invoice Processing Readiness

- [ ] Duplicate invoice detection active
- [ ] Invoice-from-PO auto-population tested
- [ ] Tax validation against ERP tax engine tested
- [ ] Multi-currency invoice processing tested
- [ ] Credit note / debit note flow tested
- [ ] Invoice approval workflow active
- [ ] Journal entries verified on invoice posting (GRNI clearing)
- [ ] Price variance posting tested (standard costing)

### AP Payment Readiness

- [ ] Payment terms correctly compute due dates
- [ ] Payment run frequency and selection criteria configured
- [ ] Early payment discount logic tested
- [ ] Payment approval matrix configured and tested
- [ ] Bank payment file format (SEPA/ISO 20022/ACH) tested with bank
- [ ] Multi-currency payment and FX gain/loss posting tested
- [ ] Bank statement import and auto-reconciliation configured
- [ ] Partial payment flow tested
- [ ] Payment audit trail complete

### Integration Readiness

- [ ] GRN posting triggers inventory update in WMS
- [ ] Invoice match result available via API
- [ ] Payment submission generates bank file
- [ ] Webhook endpoints registered and responding
- [ ] Exception queue monitored with alerting
- [ ] End-to-end test: PO → GRN → Invoice → Match → Payment → Reconciliation

---

## 12. Is the Platform Ready for Post-PO Processing?

### Domain Summary

| # | Domain | Status | Blockers |
|---|---|---|---|
| 1 | GRN Creation & Posting | ⬜ `PENDING` | |
| 2 | QC Inspection Workflow | ⬜ `PENDING` | |
| 3 | Over/Under Receipt Handling | ⬜ `PENDING` | |
| 4 | Three-Way Match Engine | ⬜ `PENDING` | |
| 5 | Match Tolerance Configuration | ⬜ `PENDING` | |
| 6 | Exception Handling & Routing | ⬜ `PENDING` | |
| 7 | Invoice Registration | ⬜ `PENDING` | |
| 8 | Invoice Validation Rules | ⬜ `PENDING` | |
| 9 | Invoice Approval Workflow | ⬜ `PENDING` | |
| 10 | Credit Note / Debit Note | ⬜ `PENDING` | |
| 11 | GRNI Accounting (Accrual) | ⬜ `PENDING` | |
| 12 | Payment Run Configuration | ⬜ `PENDING` | |
| 13 | Payment Approval Matrix | ⬜ `PENDING` | |
| 14 | Bank File Generation | ⬜ `PENDING` | |
| 15 | Bank Reconciliation | ⬜ `PENDING` | |
| 16 | Variance Accounts (PPV, FX) | ⬜ `PENDING` | |
| 17 | Post-PO API Endpoints | ⬜ `PENDING` | |
| 18 | Event Webhooks | ⬜ `PENDING` | |
| 19 | Audit Trail | ⬜ `PENDING` | |
| 20 | Roles & Permissions | ⬜ `PENDING` | |

### Readiness Score

```
Score: __ / 20 domains verified
```

### Verdict

| Score Range | Verdict | Meaning |
|---|---|---|
| 20 / 20 | ✅ **READY** | All post-PO processes verified. Full procure-to-pay cycle operational. |
| 15–19 / 20 | 🟡 **CONDITIONALLY READY** | Non-blocking gaps exist. Document accepted risks and proceed with monitoring. |
| < 15 / 20 | 🔴 **NOT READY** | Blocking gaps remain. Resolve listed blockers before go-live. |

### Blocking-Domain Recommendations

> Complete this section after evaluating each domain above.

| Domain | Recommendation |
|---|---|
| *(example)* Three-Way Match Engine | Configure and test tolerance thresholds with real PO/GRN/Invoice data before enabling auto-approval. |
| *(example)* Bank Reconciliation | Complete bank statement import setup and test auto-matching rules before first payment run. |

---

*Document version: 1.0 — Generated 2026-03-04*
*Applicable platforms: Odoo 17, Microsoft Dynamics 365 F&SCM, Generic ERP*
*Companion document: [ERP_PO_PREREQUISITES.md](./ERP_PO_PREREQUISITES.md)*
