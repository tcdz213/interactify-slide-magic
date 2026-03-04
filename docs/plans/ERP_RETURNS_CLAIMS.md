# ERP Returns, Credit Notes, Quality Disputes & Claim Management

> **Scope**: This document covers the complete lifecycle of **supplier returns** (RMA to vendor), **customer returns** (RMA from customer), **credit/debit notes**, **quality disputes**, and the **claim resolution workflow**. Pre-PO prerequisites are in [ERP_PO_PREREQUISITES.md](./ERP_PO_PREREQUISITES.md); post-PO processing in [ERP_POST_PO_LIFECYCLE.md](./ERP_POST_PO_LIFECYCLE.md).
>
> **Platform Reference**: Generic ERP architecture with inline annotations for **[Odoo]** (Community/Enterprise 17) and **[Dynamics]** (D365 Finance & Supply Chain Management).

---

## Table of Contents

1. [Supplier Returns (RMA to Vendor)](#1-supplier-returns-rma-to-vendor)
2. [Customer Returns (RMA from Customer)](#2-customer-returns-rma-from-customer)
3. [Quality Dispute & Claim Workflow](#3-quality-dispute--claim-workflow)
4. [Credit Notes & Debit Notes](#4-credit-notes--debit-notes)
5. [Inventory Impact of Returns](#5-inventory-impact-of-returns)
6. [Accounting Entries & Journal Flow](#6-accounting-entries--journal-flow)
7. [Tolerance & Auto-Approval Rules](#7-tolerance--auto-approval-rules)
8. [Role & Permission Matrix](#8-role--permission-matrix)
9. [Integration Layer](#9-integration-layer)
10. [Data Validation Rules](#10-data-validation-rules)
11. [Process Readiness Checklist](#11-process-readiness-checklist)
12. [Is the Platform Ready for Returns & Claims?](#12-is-the-platform-ready-for-returns--claims)

---

## 1. Supplier Returns (RMA to Vendor)

### 1.1 Purpose

Manage the process of returning defective, damaged, expired, or incorrect goods **back to the supplier**, recover value through credit notes or replacements, and update inventory and financial records accordingly.

### 1.2 Supplier Return Lifecycle States

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
│  Draft   │────►│ Submitted │────►│ Pending_QC │────►│ Approved │────►│ Shipped  │
└──────────┘     └───────────┘     └────────────┘     └──────────┘     └──────────┘
      │                │                  │                                  │
      ▼                ▼                  ▼                                  ▼
┌──────────┐     ┌──────────┐      ┌──────────┐                       ┌──────────┐
│ Cancelled│     │ Rejected │      │ Rejected │                       │ Credited │
└──────────┘     └──────────┘      └──────────┘                       └──────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Draft` | Return request initiated; editable | → `Submitted`, → `Cancelled` |
| `Submitted` | Sent for review (warehouse manager or QC team) | → `Pending_QC`, → `Rejected` |
| `Pending_QC` | Goods under quality inspection before return | → `Approved`, → `Rejected` |
| `Approved` | Return authorised; ready for shipment to vendor | → `Shipped` |
| `Shipped` | Goods dispatched to vendor; awaiting credit note | → `Credited` |
| `Credited` | Vendor credit note received and matched | Terminal |
| `Rejected` | Return request denied (goods acceptable or claim invalid) | Terminal |
| `Cancelled` | Return voided before processing | Terminal |

### 1.3 Supplier Return Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `return_id` | String | System-generated | RMA reference number |
| `type` | Enum | `Vendor` | Fixed for supplier returns |
| `vendor_id` | FK → Vendor | Mandatory | Supplier receiving the return |
| `vendor_name` | String | Denormalised | Display convenience |
| `grn_id` | FK → GRN | Recommended | Original goods receipt reference |
| `po_id` | FK → PO | Recommended | Source purchase order |
| `return_date` | Date | Auto-set at creation | |
| `reason` | Enum | Mandatory | See §1.4 |
| `status` | Enum | See lifecycle above | |
| `lines` | Collection | ≥ 1 line required | Return line items |
| `total_value` | Decimal | Computed | Sum of line values |
| `credit_note_id` | FK → Credit Note | Set on credit receipt | Links to §4 |
| `claim_id` | FK → Claim | Optional | Links to §3 if quality dispute |
| `created_by` | FK → User | Auto-set | Initiator |
| `approved_by` | FK → User | Set on approval | Approving authority |
| `shipped_at` | DateTime | Set on shipment | Carrier handover timestamp |
| `carrier_id` | FK → Carrier | Optional | Return shipment carrier |
| `tracking_number` | String | Optional | Carrier tracking reference |
| `notes` | Text | Optional | Free-text observations |

### 1.4 Return Reason Codes

| Code | Label | Description | Typical Action |
|---|---|---|---|
| `DEFECTIVE` | Produit défectueux | Manufacturing defect discovered at QC or in use | Credit note + replacement |
| `DAMAGED` | Endommagé au transport | Shipping or handling damage | Credit note; claim against carrier if applicable |
| `EXPIRED` | Périmé / proche péremption | Product expired or shelf life below acceptance threshold | Full credit; destroy or return |
| `WRONG_ITEM` | Mauvais produit livré | Product does not match PO line specification | Return + correct item shipment |
| `WRONG_QTY` | Quantité incorrecte | Over-delivery beyond tolerance (excess returned) | Partial credit for excess |
| `QUALITY_FAIL` | Échec contrôle qualité | Failed QC inspection parameters (see §3) | Credit note; vendor corrective action requested |
| `RECALL` | Rappel fournisseur | Vendor-initiated product recall | Full credit; vendor bears logistics cost |
| `CONTRACT_BREACH` | Non-conformité contractuelle | Specs, packaging, or labelling non-compliance | Credit note; potential penalty per contract terms |

### 1.5 Return Line Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `line_id` | String | Unique within return | |
| `product_id` | FK → Product | Mandatory | Must match original GRN/PO product |
| `return_qty` | Decimal | > 0 | Quantity being returned |
| `unit_id` | FK → UoM | Mandatory | Must match or convert to base UoM |
| `conversion_factor` | Decimal | > 0 | To base (stock) UoM |
| `base_qty` | Computed | `return_qty × conversion_factor` | Inventory adjustment quantity |
| `unit_cost` | Decimal | From original PO/GRN | Cost basis for credit calculation |
| `line_value` | Computed | `base_qty × unit_cost` | Credit amount for this line |
| `batch_number` | String | Mandatory for batch-tracked | Must match received batch |
| `serial_numbers` | Array | Mandatory for serialised | Must match received serials |
| `qc_result` | Enum | `Failed`, `Conditional` | QC outcome triggering return |
| `qc_inspection_id` | FK → QC Inspection | Optional | Link to inspection record |
| `defect_type` | Enum | From QC defect codes | `Damaged`, `Expired`, `Wrong Item`, `Contaminated`, etc. |
| `disposition` | Enum | `Return_To_Vendor`, `Scrap`, `Rework`, `Quarantine` | Action taken on the goods |
| `location_id` | FK → Location | Returns/quarantine zone | Source location for the return shipment |

### 1.6 Unit Conversion at Return

**Business Rule BR-R01**: All return quantities are processed in **base units** for inventory consistency.

```
return_qty (purchase UoM) × conversion_factor = base_qty (stock UoM)

Example:
  Original PO: 100 Cartons of Product X (1 Carton = 24 Units)
  QC rejects 5 Cartons
  base_qty = 5 × 24 = 120 Units removed from inventory
  credit_value = 120 × unit_cost_per_unit
```

### 1.7 Platform-Specific Handling

- **[Odoo]**: Supplier returns are handled via **reverse transfers** (`stock.picking` with `picking_type_code = 'outgoing'` linked to a purchase return). The refund invoice (credit note) is created via `account.move` with `move_type = 'in_refund'`. Quantities must be within the originally received qty.
- **[Dynamics]**: **Return orders** created from the original PO or GRN. Disposition codes (`ReturnDispositionCode`) drive inventory and financial actions: `Credit`, `Replace`, `Scrap`, `Return to vendor`. Credit notes generated as **Vendor credit notes** in AP journal.

### 1.8 Common Setup Failures

1. No returns/quarantine warehouse location configured → Returned goods mixed with saleable stock.
2. Return quantity exceeds original GRN received qty → Negative inventory or system error.
3. Credit note not linked to original PO → AP balance incorrect; vendor statement mismatch.
4. Disposition code missing → Inventory not updated (goods gone but stock count unchanged).
5. Batch/serial validation disabled → Wrong batch returned; traceability broken.

---

## 2. Customer Returns (RMA from Customer)

### 2.1 Purpose

Process goods returned **by customers** due to defects, wrong deliveries, over-shipments, or contractual claims. Update inventory, issue credit notes, and manage the financial impact on AR.

### 2.2 Customer Return Lifecycle States

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐
│  Draft   │────►│ Submitted │────►│ Pending_QC │────►│ Approved  │────►│Processed │
└──────────┘     └───────────┘     └────────────┘     └───────────┘     └──────────┘
      │                │                  │                                   │
      ▼                ▼                  ▼                                   ▼
┌──────────┐     ┌──────────┐      ┌──────────┐                        ┌──────────┐
│ Cancelled│     │ Rejected │      │ Rejected │                        │ Credited │
└──────────┘     └──────────┘      └──────────┘                        └──────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Draft` | Return request created (by sales team or via portal) | → `Submitted`, → `Cancelled` |
| `Submitted` | Sent for warehouse/QC review | → `Pending_QC`, → `Rejected` |
| `Pending_QC` | Goods received back; under inspection | → `Approved`, → `Rejected` |
| `Approved` | Return accepted; inventory and financial adjustment pending | → `Processed` |
| `Processed` | Stock updated (re-stock, scrap, or quarantine) | → `Credited` |
| `Credited` | Credit note issued to customer; AR adjusted | Terminal |
| `Rejected` | Return denied (goods acceptable, warranty expired, etc.) | Terminal |
| `Cancelled` | Return voided | Terminal |

### 2.3 Customer Return Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `return_id` | String | System-generated | RMA reference |
| `type` | Enum | `Customer` | Fixed for customer returns |
| `customer_id` | FK → Customer | Mandatory | Customer returning goods |
| `customer_name` | String | Denormalised | Display convenience |
| `so_id` | FK → Sales Order | Recommended | Original sales order |
| `invoice_id` | FK → Invoice | Recommended | Original customer invoice |
| `delivery_id` | FK → Delivery Order | Recommended | Original delivery reference |
| `return_date` | Date | Auto-set | |
| `reason` | Enum | Mandatory | See §2.4 |
| `status` | Enum | See lifecycle above | |
| `lines` | Collection | ≥ 1 line required | |
| `total_value` | Decimal | Computed | |
| `credit_note_id` | FK → Credit Note | Set on credit issuance | |
| `refund_method` | Enum | `Credit_Note`, `Cash_Refund`, `Replacement`, `Store_Credit` | How customer is compensated |
| `restocking_fee_pct` | Decimal | 0–100% | Applied to return value if policy allows |
| `net_credit` | Computed | `total_value × (1 - restocking_fee_pct/100)` | Actual credit after fee |
| `pickup_required` | Boolean | Default: False | Whether company collects goods from customer |
| `created_by` | FK → User | Auto-set | Initiator (sales rep, portal user) |

### 2.4 Customer Return Reason Codes

| Code | Label | Description | Restocking Fee? |
|---|---|---|---|
| `DEFECTIVE` | Produit défectueux | Manufacturing defect | No |
| `DAMAGED_DELIVERY` | Endommagé à la livraison | Damage during delivery | No |
| `WRONG_PRODUCT` | Mauvais produit livré | Product does not match order | No |
| `WRONG_QTY` | Quantité incorrecte | Over-delivery by sales/warehouse | No |
| `QUALITY_COMPLAINT` | Plainte qualité | Customer dissatisfied with quality | Depends on policy |
| `CHANGE_OF_MIND` | Changement d'avis | Customer no longer wants the product | Yes (typically 10–15%) |
| `EXPIRED` | Produit périmé | Product expired at delivery or shortly after | No |
| `WARRANTY` | Retour sous garantie | Defect within warranty period | No |
| `DUPLICATE_ORDER` | Commande en double | Accidental duplicate order | No |

### 2.5 Disposition Actions

| Disposition | Inventory Impact | Financial Impact |
|---|---|---|
| `Restock` | Add back to saleable inventory at original location | Full credit (less restocking fee) |
| `Restock_Discounted` | Add to discounted/clearance inventory | Partial credit |
| `Scrap` | Write off; move to scrap location | Full credit; expense booked |
| `Quarantine` | Hold for further inspection | Credit pending QC resolution |
| `Return_To_Vendor` | Chain return back to supplier (see §1) | Credit to customer; debit note to vendor |
| `Repair` | Move to repair/rework zone | Credit or replacement after repair |

### 2.6 Platform-Specific Handling

- **[Odoo]**: Customer returns via **reverse delivery** (`stock.picking` with `picking_type_code = 'incoming'` from customer location). Credit note created as `account.move` with `move_type = 'out_refund'`. Can be initiated from the original `sale.order` or standalone.
- **[Dynamics]**: **Sales return orders** with disposition codes controlling inventory and financial treatment. **Return item receipt** updates inventory; **Credit note** updates AR. RMA number auto-generated from number sequence.

### 2.7 Common Setup Failures

1. No restocking fee policy configured → Every return processed at full credit, eroding margins.
2. Credit note issued before QC inspection → Credited goods turn out to be customer-damaged.
3. Return-to-vendor chain not automated → Defective goods sit in warehouse without vendor claim.
4. Customer portal return request not linked to original SO → Manual matching required, delaying processing.
5. Warranty period not tracked per product/serial → All returns accepted regardless of warranty status.

---

## 3. Quality Dispute & Claim Workflow

### 3.1 Purpose

Provide a structured process for raising, investigating, and resolving quality disputes with suppliers, including corrective action tracking, root cause analysis, and financial settlement.

### 3.2 Claim Lifecycle States

```
┌──────────┐     ┌────────────────┐     ┌───────────────┐     ┌──────────┐
│  Opened  │────►│ Under Review   │────►│ Vendor Notified│────►│ Resolved │
└──────────┘     └────────────────┘     └───────────────┘     └──────────┘
      │                  │                      │                    │
      ▼                  ▼                      ▼                    ▼
┌──────────┐      ┌──────────┐           ┌──────────┐         ┌──────────┐
│ Cancelled│      │ Escalated│           │ Disputed │         │  Closed  │
└──────────┘      └──────────┘           └──────────┘         └──────────┘
```

| State | Description | Allowed Transitions |
|---|---|---|
| `Opened` | Claim created from QC failure, GRN variance, or customer complaint | → `Under_Review`, → `Cancelled` |
| `Under_Review` | Internal investigation in progress (QC team, warehouse) | → `Vendor_Notified`, → `Escalated` |
| `Vendor_Notified` | Formal claim sent to vendor with evidence package | → `Resolved`, → `Disputed` |
| `Disputed` | Vendor contests the claim; negotiation in progress | → `Resolved`, → `Escalated` |
| `Escalated` | Routed to management for decision (high value or repeated issues) | → `Resolved` |
| `Resolved` | Settlement agreed (credit note, replacement, penalty) | → `Closed` |
| `Closed` | All financial and inventory actions completed | Terminal |
| `Cancelled` | Claim withdrawn (e.g., error in QC, goods actually acceptable) | Terminal |

### 3.3 Claim Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `claim_id` | String | System-generated | Claim reference |
| `claim_type` | Enum | `Quality`, `Quantity`, `Delivery`, `Contract`, `Pricing` | Category of dispute |
| `vendor_id` | FK → Vendor | Mandatory | Vendor against whom claim is raised |
| `grn_id` | FK → GRN | Recommended | Related goods receipt |
| `po_id` | FK → PO | Recommended | Related purchase order |
| `return_id` | FK → Return | Optional | Associated supplier return |
| `qc_inspection_id` | FK → QC Inspection | Optional | Failed inspection triggering claim |
| `opened_date` | Date | Auto-set | |
| `status` | Enum | See lifecycle above | |
| `priority` | Enum | `Low`, `Medium`, `High`, `Critical` | Drives SLA and escalation |
| `claimed_amount` | Decimal | > 0 | Financial value of the claim |
| `settled_amount` | Decimal | Set on resolution | Agreed settlement value |
| `settlement_type` | Enum | See §3.5 | How the claim is settled |
| `root_cause` | Enum | See §3.4 | Root cause classification |
| `corrective_action` | Text | Optional | Vendor's corrective action plan (CAPA) |
| `evidence_documents` | Array | Recommended | Photos, QC reports, lab results |
| `sla_due_date` | Date | Computed from priority | Escalation trigger if not resolved by this date |
| `assigned_to` | FK → User | Mandatory | Claim handler |
| `escalated_to` | FK → User | Set on escalation | Management escalation target |
| `resolution_notes` | Text | Set on resolution | Summary of settlement terms |

### 3.4 Root Cause Classification

| Code | Label | Description |
|---|---|---|
| `MFG_DEFECT` | Défaut de fabrication | Product manufactured outside specifications |
| `RAW_MATERIAL` | Matière première non-conforme | Vendor's raw materials caused the defect |
| `PACKAGING` | Emballage inadéquat | Insufficient or damaged packaging |
| `TRANSPORT` | Dommage au transport | Damage during transit (carrier or vendor responsibility) |
| `STORAGE_VENDOR` | Stockage fournisseur | Improper storage at vendor site (temperature, humidity) |
| `LABELLING` | Étiquetage non-conforme | Wrong labels, missing info, regulatory non-compliance |
| `SPEC_DEVIATION` | Déviation des spécifications | Product does not match agreed specifications |
| `CONTAMINATION` | Contamination | Foreign body, chemical, or microbiological contamination |
| `SHELF_LIFE` | Durée de vie insuffisante | Delivered with insufficient remaining shelf life |
| `DOCUMENTATION` | Documentation manquante | Missing certificates, COA, or regulatory documents |

### 3.5 Settlement Types

| Type | Description | Financial Impact |
|---|---|---|
| `Full_Credit` | Vendor issues credit note for full claim amount | AP credit; return goods if required |
| `Partial_Credit` | Negotiated partial settlement | AP credit for settled amount |
| `Replacement` | Vendor ships replacement goods at no charge | New GRN; no AP impact |
| `Price_Reduction` | Discount applied to current or future orders | PO amendment or future PO discount |
| `Penalty` | Contractual penalty applied | Deduction from vendor payment |
| `No_Action` | Claim resolved without financial impact | Documentation only |
| `Mixed` | Combination of above (e.g., partial credit + replacement) | Multiple financial entries |

### 3.6 SLA & Escalation Rules

| Priority | Response SLA | Resolution SLA | Escalation Target |
|---|---|---|---|
| `Low` | 5 business days | 30 business days | Procurement Manager |
| `Medium` | 3 business days | 15 business days | Procurement Manager |
| `High` | 1 business day | 7 business days | Ops Director |
| `Critical` | 4 hours | 3 business days | CEO / Managing Director |

**Escalation triggers:**
1. Response SLA breached → Auto-escalate to next level.
2. Resolution SLA at 80% → Warning notification to assigned handler and manager.
3. Resolution SLA breached → Auto-escalate + vendor flagged for performance review.
4. Repeat claim (same vendor, same root cause, within 90 days) → Auto-escalate to `High`.

### 3.7 Vendor Scorecard Impact

| Metric | Weight | Measurement |
|---|---|---|
| `claim_count` | — | Total claims in rolling 12 months |
| `claim_rate` | 20% | Claims / total GRNs for this vendor |
| `avg_resolution_days` | 10% | Average days from `Opened` to `Resolved` |
| `claim_value_ratio` | 15% | Total claimed amount / total PO value |
| `repeat_offences` | 15% | Same root cause within 90 days |
| `corrective_action_compliance` | 10% | % of claims with documented CAPA from vendor |

> Vendors scoring below threshold (configurable, e.g., 60/100) should be flagged for review or placed on probation (`status = On_Hold`).

### 3.8 Platform-Specific Handling

- **[Odoo]**: No native claim module in Community. Enterprise offers **Quality Alerts** (`quality.alert`) with team assignment and stages. Claims are typically managed via the **Helpdesk** module repurposed for vendor claims, or a custom model. Credit notes linked manually or via automation.
- **[Dynamics]**: **Non-conformance** orders in Quality Management with disposition codes. **Vendor collaboration** portal allows vendor to view and respond to claims. Corrective actions tracked via **Case management** or custom workflow.

### 3.9 Common Setup Failures

1. No SLA configured → Claims languish indefinitely without escalation.
2. Claim not linked to GRN/PO → Financial reconciliation impossible.
3. Evidence documents not required → Vendor disputes claim due to lack of proof.
4. Vendor scorecard not updated → Repeat offenders continue receiving orders.
5. No automated escalation → Critical quality issues handled with same urgency as minor ones.

---

## 4. Credit Notes & Debit Notes

### 4.1 Purpose

Formalise financial adjustments arising from returns, disputes, pricing corrections, or service-level breaches, maintaining a complete audit trail between the original transaction and the adjustment.

### 4.2 Document Types

| Document | Direction | Purpose | Impact |
|---|---|---|---|
| **Vendor Credit Note** | Vendor → Company | Vendor acknowledges liability (return, price error) | Reduces AP balance |
| **Vendor Debit Note** | Company → Vendor | Company claims amount from vendor (penalty, shortage) | Reduces AP balance or creates AR |
| **Customer Credit Note** | Company → Customer | Company acknowledges liability to customer (return, complaint) | Reduces AR balance |
| **Customer Debit Note** | Company → Customer | Additional charge to customer (restocking fee, service charge) | Increases AR balance |

### 4.3 Credit Note Data Model

| Field | Type | Constraint | Notes |
|---|---|---|---|
| `credit_note_id` | String | System-generated | |
| `document_type` | Enum | `Vendor_Credit`, `Vendor_Debit`, `Customer_Credit`, `Customer_Debit` | |
| `party_id` | FK → Vendor or Customer | Mandatory | |
| `party_name` | String | Denormalised | |
| `reference_type` | Enum | `Return`, `Claim`, `Invoice`, `PO`, `SO` | What triggered this note |
| `reference_id` | String | Mandatory | Link to source document |
| `date` | Date | Mandatory | Issue date |
| `currency_id` | FK → Currency | Mandatory | Must match or convert from original transaction |
| `lines` | Collection | ≥ 1 line | |
| `subtotal` | Decimal | Computed | |
| `tax_amount` | Decimal | Computed | Reversal of original tax |
| `total_amount` | Decimal | Computed | |
| `status` | Enum | `Draft`, `Validated`, `Posted`, `Applied`, `Cancelled` | |
| `applied_to_invoice_id` | FK → Invoice | Set when offset against open invoice | |
| `applied_to_payment_id` | FK → Payment | Set when refunded | |

### 4.4 Credit Note Lifecycle

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  Draft   │────►│ Validated │────►│  Posted  │────►│ Applied  │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
      │                                                   │
      ▼                                              ┌─────────┐
┌──────────┐                                         │ Refunded│
│ Cancelled│                                         └─────────┘
└──────────┘
```

| State | Description |
|---|---|
| `Draft` | Note created; amounts editable |
| `Validated` | Amounts verified; tax computed |
| `Posted` | Journal entries created (AP/AR adjusted) |
| `Applied` | Offset against an open invoice or payment |
| `Refunded` | Cash refund issued (for customer credits with `refund_method = Cash_Refund`) |
| `Cancelled` | Voided |

### 4.5 Tax Treatment on Credit Notes

| Scenario | Tax on Credit Note | Journal Entry |
|---|---|---|
| Full return of taxed goods | Reverse original tax (same rate, negative amount) | Dr AP/AR, Cr Tax Receivable/Payable |
| Partial credit (negotiated) | Tax on credited amount only | Proportional reversal |
| Non-taxable adjustment (penalty, goodwill) | No tax | Dr Expense/Income, Cr AP/AR |
| Mixed (partial return + penalty) | Tax on return portion only; no tax on penalty | Split journal entries |

### 4.6 Platform-Specific Handling

- **[Odoo]**: Credit notes are `account.move` records with `move_type` = `in_refund` (vendor) or `out_refund` (customer). Can be auto-generated from the original invoice via "Add Credit Note" button. Reconciliation handled via the partner's AP/AR account.
- **[Dynamics]**: Vendor credit notes created in **AP journals** or via **Purchase credit note** form. Customer credit notes via **Free text credit note** or **Sales return order invoice**. Application to open invoices via **Settlement** function.

### 4.7 Common Setup Failures

1. Credit note not linked to original invoice → Cannot auto-reconcile; manual matching required.
2. Tax reversal not applied → Tax balance inflated; incorrect VAT declaration.
3. Credit note posted without approval → Unauthorised financial adjustments.
4. Exchange rate on credit note differs from original transaction → Unintended FX gain/loss.
5. Customer credit note issued but not communicated → Customer pays full invoice amount; overpayment created.

---

## 5. Inventory Impact of Returns

### 5.1 Supplier Return — Outbound Inventory Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│ Saleable Stock   │────►│ Returns/QC Zone  │────►│ Shipped to    │
│ (or Quarantine)  │     │ (Quarantine Loc) │     │ Vendor        │
└─────────────────┘     └──────────────────┘     └───────────────┘
                              │
                              ├──► Scrap Location (if disposition = Scrap)
                              └──► Rework Location (if disposition = Rework)
```

### 5.2 Customer Return — Inbound Inventory Flow

```
┌───────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Customer Site  │────►│ Returns Dock     │────►│ QC Inspection   │
└───────────────┘     │ (Input Location) │     └─────────────────┘
                      └──────────────────┘            │
                                            ┌─────────┼──────────┐
                                            ▼         ▼          ▼
                                      ┌──────────┐ ┌───────┐ ┌──────────┐
                                      │ Restock  │ │ Scrap │ │Quarantine│
                                      └──────────┘ └───────┘ └──────────┘
```

### 5.3 Stock Transaction Rules

| Scenario | Transaction Type | Quantity Impact | Valuation Impact |
|---|---|---|---|
| Supplier return shipped | Stock Out (Return) | -base_qty from quarantine/stock | -value at original cost |
| Customer return received & restocked | Stock In (Return) | +base_qty to saleable location | +value at original sale cost or current cost |
| Customer return scrapped | Stock In + immediate Write-off | Net zero (in then out) | Expense booked for scrap value |
| Customer return to quarantine | Stock In (Blocked) | +base_qty to blocked location | Not available for allocation |
| Chain return (customer → vendor) | Stock In + Stock Out | Net zero after vendor return shipped | Credit from vendor offsets customer credit |

### 5.4 Business Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-R01 | All return quantities in **base units** | System-enforced via conversion |
| BR-R02 | Supplier return qty ≤ original GRN accepted qty for that batch/serial | Blocking validation |
| BR-R03 | Customer return qty ≤ original SO delivered qty for that line | Blocking validation |
| BR-R04 | Batch/serial numbers on return must match original receipt/delivery | Blocking validation |
| BR-R05 | Expired products cannot be restocked to saleable locations | Blocking; force `Scrap` or `Quarantine` |
| BR-R06 | Inventory value on return uses **original transaction cost**, not current cost | Prevents margin manipulation |
| BR-R07 | Returns after warranty period require management approval | Workflow escalation |

---

## 6. Accounting Entries & Journal Flow

### 6.1 Supplier Return — Goods Shipped to Vendor

| Transaction | Debit | Credit | Amount |
|---|---|---|---|
| Remove goods from inventory | GRNI / Accrued Liabilities (4080xx) | Inventory Asset (3100xx) | `base_qty × standard_cost` |
| On credit note receipt | Accounts Payable (4010xx) | GRNI / Accrued Liabilities (4080xx) | Credit note amount |
| Tax reversal (if applicable) | Tax Payable (4450xx) | Accounts Payable (4010xx) | Original tax on returned goods |
| Cost variance (if credit ≠ inventory value) | Purchase Price Variance (6150xx) | GRNI (4080xx) | Difference |

### 6.2 Customer Return — Credit Note Issued

| Transaction | Debit | Credit | Amount |
|---|---|---|---|
| Receive goods back to inventory | Inventory Asset (3100xx) | COGS / Returns Expense (7100xx) | `base_qty × original_cost` |
| Issue credit note to customer | Sales Returns (7050xx) | Accounts Receivable (3400xx) | Credit note amount |
| Tax reversal | Accounts Receivable (3400xx) | Tax Collected (4470xx) | Tax on credited amount |
| Restocking fee (if applicable) | Accounts Receivable (3400xx) | Other Income (7700xx) | Fee amount |
| Scrap write-off (if disposition = Scrap) | Scrap Expense (6400xx) | Inventory Asset (3100xx) | Scrapped value |

### 6.3 Vendor Debit Note (Penalty / Shortage)

| Transaction | Debit | Credit | Amount |
|---|---|---|---|
| Raise debit note | Accounts Payable (4010xx) | Other Income / Penalty Income (7750xx) | Debit note amount |

### 6.4 Journal Verification Checklist

| Check | Rule | Severity |
|---|---|---|
| JV-R01 | Debit total = Credit total for every return-related journal | Blocking |
| JV-R02 | Inventory account reflects correct quantity × cost | Warning |
| JV-R03 | AP/AR balance matches credit/debit note total | Blocking |
| JV-R04 | Tax reversal amount matches original tax proportionally | Warning |
| JV-R05 | GRNI account balance approaches zero (no dangling accruals) | Periodic audit |
| JV-R06 | FX gain/loss recorded if credit note currency ≠ functional currency | Warning |

---

## 7. Tolerance & Auto-Approval Rules

### 7.1 Return Tolerances

| Parameter | Description | Default | Notes |
|---|---|---|---|
| `max_return_days_vendor` | Maximum days after GRN to initiate vendor return | 90 | Configurable per vendor contract |
| `max_return_days_customer` | Maximum days after delivery for customer return | 30 | Configurable per sales policy |
| `warranty_months` | Product warranty period | 12 | Per product or product category |
| `min_shelf_life_pct` | Minimum remaining shelf life at delivery | 66% | Below this → eligible for return |
| `max_return_value_auto` | Auto-approve returns below this value (DZD) | 10,000 | Above → requires manager approval |
| `restocking_fee_default` | Default restocking fee for non-defective returns | 10% | Overridable per customer/policy |
| `scrap_threshold_pct` | If repair cost > this % of product value → auto-scrap | 60% | Drives disposition recommendation |

### 7.2 Auto-Approval Matrix

| Return Value | Reason Category | Approval Required |
|---|---|---|
| ≤ `max_return_value_auto` | Defective / Damaged / Wrong Item | Auto-approve |
| ≤ `max_return_value_auto` | Change of Mind | Auto-approve with restocking fee |
| > `max_return_value_auto` | Any | Warehouse Manager approval |
| > 5 × `max_return_value_auto` | Any | Ops Director approval |
| Any | Recall | Auto-approve (vendor-initiated) |
| Any | After `max_return_days` | Ops Director approval (exception) |

---

## 8. Role & Permission Matrix

### 8.1 User Roles for Returns & Claims

| Role | Scope | Key Permissions |
|---|---|---|
| **Warehouse Operator** | Assigned warehouse | Receive returned goods; update QC status; scan batch/serial |
| **QC Inspector** | QC operations | Perform inspection; set QC result; attach evidence |
| **Warehouse Manager** | Assigned warehouse(s) | Approve/reject returns within limit; oversee disposition |
| **Sales Representative** | Own customers | Initiate customer return requests; view return status |
| **Procurement Officer** | Assigned vendors | Initiate vendor returns; raise claims; track credit notes |
| **Ops Director** | Company-wide operations | Approve high-value returns; escalate claims; override dispositions |
| **Finance Controller** | Company-wide financial | Validate credit/debit notes; post journals; reconcile AP/AR |
| **Customer (Portal)** | Own orders | Request return via portal; track status; view credit notes |

### 8.2 Permission Matrix

| Action | WH Operator | QC Inspector | WH Manager | Sales Rep | Procurement | Ops Director | Finance | Customer Portal |
|---|---|---|---|---|---|---|---|---|
| Create customer return request | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Create vendor return request | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Perform QC inspection | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve return (standard) | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Approve return (high value) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Set disposition | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Create credit/debit note | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Post credit note journal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Open quality claim | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Resolve quality claim | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| View return status | ✅ | ✅ | ✅ | ✅ (own) | ✅ | ✅ | ✅ | ✅ (own) |
| View audit logs | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 9. Integration Layer

### 9.1 Internal Module Dependencies

| Module | Integration Point | Data Flow |
|---|---|---|
| **Purchasing (PO/GRN)** | Vendor return references original PO & GRN | Return → PO (validate qty); GRN (validate receipt) |
| **Sales (SO/Delivery)** | Customer return references original SO & Delivery | Return → SO (validate line); Delivery (validate shipment) |
| **Inventory (WMS)** | Stock movements on return receipt/shipment | Return → Stock Move (location transfers) |
| **Quality Control** | QC inspection drives return approval | QC → Return (pass/fail decision) |
| **Accounting (AP/AR)** | Credit/debit notes adjust balances | Return → Credit Note → Journal Entry |
| **Customer Portal** | Self-service return requests | Portal → Return (create draft) |
| **Vendor Scorecard** | Claims update vendor performance metrics | Claim → Scorecard (quality KPIs) |

### 9.2 External Integration Points

| System | Protocol | Data Exchanged |
|---|---|---|
| **Carrier / 3PL** | API / EDI | Return shipment booking, tracking, POD |
| **Vendor Portal** | API / Email | Claim notification, RMA number, credit note |
| **Customer Notification** | Email / SMS / Push | Return status updates, credit note issued |
| **Insurance Provider** | Manual / API | Claim for transit damage exceeding threshold |
| **Regulatory Body** | Manual | Recall notifications, product safety reports |

---

## 10. Data Validation Rules

| Rule ID | Field / Process | Rule | Severity | Action on Failure |
|---|---|---|---|---|
| VR-01 | `return_qty` | > 0 | Blocking | Cannot save line with zero quantity |
| VR-02 | `return_qty` (vendor) | ≤ `grn_accepted_qty` for that product/batch | Blocking | Reject; display original received qty |
| VR-03 | `return_qty` (customer) | ≤ `delivered_qty` for that SO line | Blocking | Reject; display original delivered qty |
| VR-04 | `batch_number` | Must exist in inventory for batch-tracked products | Blocking | Reject; prompt for valid batch |
| VR-05 | `serial_numbers` | Each serial must exist and be in expected status | Blocking | Reject invalid serials |
| VR-06 | `return_date` (vendor) | ≤ `grn_date + max_return_days_vendor` | Warning | Allow with manager override |
| VR-07 | `return_date` (customer) | ≤ `delivery_date + max_return_days_customer` | Warning | Allow with manager override |
| VR-08 | `credit_note.total` | ≤ original invoice total (for full returns) | Blocking | Cannot over-credit |
| VR-09 | `disposition` | Mandatory before status = `Processed` | Blocking | Cannot process without disposition |
| VR-10 | `reason` | Mandatory on all returns | Blocking | Cannot submit without reason |
| VR-11 | `qc_result` | Mandatory if product requires QC (category flag) | Blocking | Cannot approve without QC |
| VR-12 | Credit note tax | Must reverse original tax proportionally | Warning | Flag for finance review |

---

## 11. Process Readiness Checklist

### 11.1 Master Data Prerequisites

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | Returns/quarantine warehouse location exists | ⬜ | Separate from saleable stock |
| 2 | Scrap location configured | ⬜ | For disposition = Scrap |
| 3 | Return reason codes defined | ⬜ | Both vendor and customer |
| 4 | Disposition codes configured | ⬜ | Restock, Scrap, Quarantine, etc. |
| 5 | Restocking fee policy defined | ⬜ | Per customer tier or global |
| 6 | Warranty periods set per product/category | ⬜ | For customer return eligibility |
| 7 | Vendor contracts include return terms | ⬜ | Max return days, conditions |
| 8 | Credit/debit note number sequences configured | ⬜ | |
| 9 | AP/AR accounts for returns exist in CoA | ⬜ | Including Sales Returns, COGS Returns |
| 10 | QC inspection plans include return-specific checks | ⬜ | Incoming QC for customer returns |

### 11.2 Workflow Prerequisites

| # | Requirement | Status | Notes |
|---|---|---|---|
| 11 | Return approval workflow configured | ⬜ | Value-based routing |
| 12 | Claim SLA rules configured | ⬜ | Per priority level |
| 13 | Auto-approval thresholds set | ⬜ | Below max_return_value_auto |
| 14 | Escalation rules active | ⬜ | SLA breach → auto-escalate |
| 15 | Credit note approval workflow configured | ⬜ | Prevents unauthorised credits |
| 16 | Vendor scorecard updated with claims metrics | ⬜ | |

### 11.3 Integration Prerequisites

| # | Requirement | Status | Notes |
|---|---|---|---|
| 17 | Customer portal return request form active | ⬜ | |
| 18 | Email/notification templates for return status | ⬜ | |
| 19 | Carrier integration for return shipments | ⬜ | If applicable |
| 20 | Accounting integration tested (credit note → journal) | ⬜ | |

---

## 12. Is the Platform Ready for Returns & Claims?

### 12.1 Current Implementation Status (Jawda Platform)

| Feature | Status | Gap |
|---|---|---|
| Return list page (`SupplierReturnsPage`) | ✅ Implemented | Basic table with approve/process actions |
| Vendor vs Customer return filtering | ✅ Implemented | Tab-based filtering |
| Return status management | ⚠️ Partial | Only Approve (Pending_QC → Approved) and Process (Approved → Processed); missing Draft → Submitted, Shipped, Credited |
| Return creation form | ❌ Missing | No UI to create new returns; data is mock-only |
| Return line detail view | ❌ Missing | No drill-down into return lines, products, quantities |
| QC integration on returns | ❌ Missing | QC inspection not linked to return workflow |
| Credit note generation from return | ❌ Missing | No credit note entity or auto-generation |
| Debit note support | ❌ Missing | No debit note entity |
| Quality claim workflow | ❌ Missing | No claim entity, lifecycle, or SLA tracking |
| Vendor scorecard | ❌ Missing | No vendor performance metrics from claims |
| Disposition management | ❌ Missing | No restock/scrap/quarantine disposition actions |
| Customer portal return requests | ⚠️ Partial | `ReturnRequestScreen` exists but not linked to main returns engine |
| Batch/serial validation on returns | ❌ Missing | No validation against original receipt |
| Return-to-vendor chain (customer → vendor) | ❌ Missing | Cannot cascade a customer return to a vendor claim |
| Accounting entries for returns | ❌ Missing | No journal generation from returns |
| Restocking fee calculation | ❌ Missing | No fee logic |
| Warranty period enforcement | ❌ Missing | No warranty tracking per product/serial |
| Approval workflow for returns | ⚠️ Partial | `ApprovalWorkflowsPage` has `Return` document type but not enforced in return flow |
| Return tolerance configuration | ❌ Missing | No configurable max return days, auto-approve thresholds |
| Return analytics / KPIs | ❌ Missing | No dashboards for return rates, costs, trends |

### 12.2 Priority Implementation Roadmap

| Phase | Features | Effort | Business Impact |
|---|---|---|---|
| **Phase 1** | Return creation form + full lifecycle + line detail view | Medium | Enables digital return processing |
| **Phase 2** | Credit/debit note entity + auto-generation from returns | Medium | Financial accuracy |
| **Phase 3** | QC integration + disposition management | Medium | Quality-driven inventory management |
| **Phase 4** | Quality claim workflow + SLA + escalation | High | Vendor accountability |
| **Phase 5** | Vendor scorecard + analytics dashboard | Medium | Strategic procurement decisions |
| **Phase 6** | Portal integration + chain returns + accounting entries | High | End-to-end automation |

### 12.3 Critical Gaps Summary

> **⚠️ The platform can display and manually advance return statuses but cannot create returns, generate financial documents, enforce validations, or track quality disputes. Returns processing is effectively manual/mock-only.**

**Immediate action items:**
1. Implement return creation form with reason codes and line items (Phase 1).
2. Add validation rules VR-01 through VR-05 (quantity, batch, serial checks).
3. Create credit note entity and link to return lifecycle.
4. Connect QC inspection results to return approval decisions.
5. Enforce approval workflow thresholds already configured in `ApprovalWorkflowsPage`.
