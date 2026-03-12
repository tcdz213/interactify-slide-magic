# WMS / ERP SaaS — Database Schema

> All tables include `company_id` for tenant isolation. RLS policies enforce scoping.

---

## 1. Platform & Auth

### companies
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| type | ENUM('supplier', 'depot') | NOT NULL |
| status | ENUM('active', 'trial', 'suspended', 'cancelled') | NOT NULL, default 'trial' |
| subscription_plan_id | UUID | FK → subscription_plans |
| contact_name | VARCHAR(255) | |
| contact_email | VARCHAR(255) | NOT NULL |
| contact_phone | VARCHAR(50) | |
| city | VARCHAR(100) | |
| wilaya | VARCHAR(100) | |
| sector | VARCHAR(100) | |
| settings | JSONB | {language, timezone, currency, country} |
| onboarded_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

### subscription_plans
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(50) | NOT NULL (trial, standard, pro, enterprise) |
| max_users | INT | NOT NULL |
| max_warehouses | INT | NOT NULL |
| monthly_fee | DECIMAL(12,2) | |
| yearly_fee | DECIMAL(12,2) | |
| features | JSONB | Enabled module list |
| is_active | BOOLEAN | default true |

### subscriptions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| plan_id | UUID | FK → subscription_plans |
| status | ENUM('active', 'trial', 'suspended', 'cancelled', 'pending') | NOT NULL |
| start_date | DATE | NOT NULL |
| renewal_date | DATE | |
| billing_cycle | ENUM('monthly', 'yearly') | |
| current_users | INT | default 0 |
| current_warehouses | INT | default 0 |
| created_at | TIMESTAMPTZ | default now() |

### users (auth.users + profiles)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, references auth.users |
| company_id | UUID | FK → companies, NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(50) | |
| avatar_url | TEXT | |
| is_active | BOOLEAN | default true |
| last_login | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | default now() |

### user_roles
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users, NOT NULL |
| company_id | UUID | FK → companies, NOT NULL |
| role | app_role ENUM | NOT NULL |
| UNIQUE | (user_id, company_id, role) | |

---

## 2. Warehouse & Locations

### warehouses
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| short_code | VARCHAR(10) | NOT NULL |
| type | ENUM('construction', 'food', 'technology', 'general') | |
| city | VARCHAR(100) | |
| wilaya | VARCHAR(100) | |
| address | TEXT | |
| manager | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| zones | INT | default 1 |
| capacity | INT | |
| utilization | DECIMAL(5,2) | default 0 |
| status | ENUM('active', 'inactive', 'maintenance') | default 'active' |
| temperature | VARCHAR(50) | |
| input_location_id | UUID | FK → warehouse_locations |
| created_at | TIMESTAMPTZ | default now() |

### warehouse_locations
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| warehouse_id | UUID | FK → warehouses, NOT NULL |
| zone | VARCHAR(10) | |
| aisle | VARCHAR(10) | |
| rack | VARCHAR(10) | |
| level | VARCHAR(10) | |
| type | ENUM('Ambient', 'Chilled', 'Frozen', 'Dry') | |
| capacity | INT | |
| used | INT | default 0 |
| status | ENUM('Available', 'Full', 'Reserved', 'Maintenance') | default 'Available' |

---

## 3. Product Catalog

### sectors
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| code | VARCHAR(20) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| status | ENUM('Active', 'Inactive') | default 'Active' |

### product_categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| sector_id | UUID | FK → sectors |
| code | VARCHAR(20) | |
| name | VARCHAR(100) | NOT NULL |
| status | ENUM('Active', 'Inactive') | default 'Active' |
| is_deleted | BOOLEAN | default false |

### sub_categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| category_id | UUID | FK → product_categories |
| name | VARCHAR(100) | NOT NULL |
| status | ENUM('Active', 'Inactive') | default 'Active' |
| is_deleted | BOOLEAN | default false |

### units_of_measure
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| name | VARCHAR(50) | NOT NULL |
| abbreviation | VARCHAR(10) | NOT NULL |
| kind | ENUM('Weight', 'Volume', 'Length', 'Area', 'Piece', 'Packaging', 'Count') | NOT NULL |
| conversion_to_base | DECIMAL(12,6) | default 1 |
| base_unit_id | UUID | FK → units_of_measure (self-ref) |
| base_unit | VARCHAR(50) | |
| is_default | BOOLEAN | default false |
| is_active | BOOLEAN | default true |

### products
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| sku | VARCHAR(50) | UNIQUE per company |
| category | VARCHAR(100) | |
| subcategory_id | UUID | FK → sub_categories |
| uom | VARCHAR(20) | |
| base_unit_id | UUID | FK → units_of_measure |
| unit_cost | DECIMAL(12,2) | default 0 |
| unit_price | DECIMAL(12,2) | default 0 |
| reorder_point | INT | default 0 |
| product_type | ENUM('Storable', 'Consumable', 'Service') | default 'Storable' |
| cost_method | ENUM('Standard', 'Average', 'FIFO') | default 'Average' |
| can_be_purchased | BOOLEAN | default true |
| can_be_sold | BOOLEAN | default true |
| is_active | BOOLEAN | default true |
| is_deleted | BOOLEAN | default false |
| default_vendor_id | UUID | FK → vendors |
| created_at | TIMESTAMPTZ | default now() |

### barcodes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| product_id | UUID | FK → products, NOT NULL |
| type | ENUM('EAN13', 'EAN-13', 'EAN-8', 'UPC', 'UPC-A', 'Code128', 'QR', 'DataMatrix') | |
| value | VARCHAR(100) | NOT NULL |
| is_primary | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | default now() |

---

## 4. Inventory

### inventory
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| product_id | UUID | FK → products, NOT NULL |
| warehouse_id | UUID | FK → warehouses, NOT NULL |
| location_id | UUID | FK → warehouse_locations |
| qty_on_hand | DECIMAL(12,3) | default 0 |
| qty_reserved | DECIMAL(12,3) | default 0 |
| qty_available | DECIMAL(12,3) | GENERATED (on_hand - reserved) |
| qty_in_transit | DECIMAL(12,3) | default 0 |
| unit_cost_avg | DECIMAL(12,4) | |
| batch_number | VARCHAR(50) | |
| lot_id | UUID | FK → lot_batches |
| serial_number | VARCHAR(100) | |
| expiry_date | DATE | |
| last_counted | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | default now() |

### stock_adjustments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| warehouse_id | UUID | FK → warehouses |
| product_id | UUID | FK → products |
| adjustment_type | ENUM('count', 'damage', 'correction', 'write-off') | |
| qty_before | DECIMAL(12,3) | |
| qty_after | DECIMAL(12,3) | |
| reason | TEXT | |
| adjusted_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | default now() |

### stock_transfers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| from_warehouse_id | UUID | FK → warehouses |
| to_warehouse_id | UUID | FK → warehouses |
| status | ENUM('Draft', 'In Transit', 'Received', 'Cancelled') | |
| items | JSONB | [{product_id, qty, uom}] |
| requested_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | default now() |

---

## 5. Purchasing

### vendors
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| contact | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| email | VARCHAR(255) | |
| city | VARCHAR(100) | |
| address | TEXT | |
| rating | DECIMAL(3,2) | default 0 |
| status | ENUM('Active', 'On Hold', 'Blocked') | default 'Active' |
| payment_terms | VARCHAR(50) | |
| tax_id | VARCHAR(50) | |
| bank_account | VARCHAR(50) | |
| created_at | TIMESTAMPTZ | default now() |

### purchase_orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| vendor_id | UUID | FK → vendors |
| warehouse_id | UUID | FK → warehouses |
| po_number | VARCHAR(50) | UNIQUE per company |
| status | ENUM('Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled') | |
| order_date | DATE | |
| expected_date | DATE | |
| total_amount | DECIMAL(14,2) | |
| currency | VARCHAR(3) | default 'DZD' |
| items | JSONB | |
| notes | TEXT | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | default now() |

### goods_received_notes (GRN)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| po_id | UUID | FK → purchase_orders |
| warehouse_id | UUID | FK → warehouses |
| grn_number | VARCHAR(50) | |
| received_date | TIMESTAMPTZ | |
| status | ENUM('Draft', 'Validated', 'Cancelled') | |
| items | JSONB | [{product_id, qty_ordered, qty_received, qty_rejected}] |
| received_by | UUID | FK → users |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | default now() |

---

## 6. Sales & Distribution

### customers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| type | VARCHAR(50) | |
| contact | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| email | VARCHAR(255) | |
| city | VARCHAR(100) | |
| address | TEXT | |
| credit_limit | DECIMAL(14,2) | default 0 |
| outstanding_balance | DECIMAL(14,2) | default 0 |
| status | ENUM('Active', 'Inactive', 'Blocked') | default 'Active' |
| created_at | TIMESTAMPTZ | default now() |

### sales_orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| customer_id | UUID | FK → customers |
| warehouse_id | UUID | FK → warehouses |
| order_number | VARCHAR(50) | |
| status | ENUM('Draft', 'Confirmed', 'Picking', 'Packed', 'Shipped', 'Delivered', 'Cancelled') | |
| order_date | DATE | |
| delivery_date | DATE | |
| total_amount | DECIMAL(14,2) | |
| items | JSONB | |
| notes | TEXT | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | default now() |

### invoices
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| order_id | UUID | FK → sales_orders |
| customer_id | UUID | FK → customers |
| invoice_number | VARCHAR(50) | |
| issue_date | DATE | |
| due_date | DATE | |
| subtotal | DECIMAL(14,2) | |
| tax_amount | DECIMAL(14,2) | |
| total_amount | DECIMAL(14,2) | |
| status | ENUM('Draft', 'Sent', 'Paid', 'Partial', 'Overdue', 'Cancelled') | |
| paid_amount | DECIMAL(14,2) | default 0 |
| created_at | TIMESTAMPTZ | default now() |

### payments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies, NOT NULL |
| invoice_id | UUID | FK → invoices |
| customer_id | UUID | FK → customers |
| amount | DECIMAL(14,2) | NOT NULL |
| method | ENUM('Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Mobile') | |
| payment_date | DATE | |
| reference | VARCHAR(100) | |
| status | ENUM('Pending', 'Completed', 'Failed', 'Refunded') | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | default now() |

---

## 7. Cross-Tenant (Supplier ↔ Depot)

### connections
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| requesting_company_id | UUID | FK → companies (Depot) |
| target_company_id | UUID | FK → companies (Supplier) |
| status | ENUM('pending', 'active', 'rejected', 'disconnected') | |
| permissions | JSONB | {catalog_access, order_create} |
| connected_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | default now() |

### incoming_purchase_orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| supplier_company_id | UUID | FK → companies |
| depot_company_id | UUID | FK → companies |
| source_po_id | UUID | FK → purchase_orders |
| status | ENUM('Pending', 'Accepted', 'Rejected', 'Processing', 'Shipped', 'Delivered') | |
| items | JSONB | |
| total_amount | DECIMAL(14,2) | |
| received_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | default now() |

---

## 8. Quality & Returns

### qc_inspections
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| grn_id | UUID | FK → goods_received_notes |
| product_id | UUID | FK → products |
| result | ENUM('Pass', 'Fail', 'Conditional') | |
| qty_inspected | DECIMAL(12,3) | |
| qty_rejected | DECIMAL(12,3) | |
| inspector | UUID | FK → users |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | default now() |

### return_orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| type | ENUM('customer_return', 'supplier_return') | |
| reference_order_id | UUID | |
| status | ENUM('Draft', 'Approved', 'Received', 'Refunded', 'Closed') | |
| items | JSONB | |
| reason | TEXT | |
| created_at | TIMESTAMPTZ | default now() |

### credit_notes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| return_id | UUID | FK → return_orders |
| invoice_id | UUID | FK → invoices |
| amount | DECIMAL(14,2) | |
| status | ENUM('Draft', 'Issued', 'Applied', 'Cancelled') | |
| issued_at | TIMESTAMPTZ | |

---

## 9. WMS Operations

### picking_tasks
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| sales_order_id | UUID | FK → sales_orders |
| warehouse_id | UUID | FK → warehouses |
| status | ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') | |
| assigned_to | UUID | FK → users |
| items | JSONB | [{product_id, location_id, qty}] |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

### packing_tasks
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| picking_task_id | UUID | FK → picking_tasks |
| status | ENUM('Pending', 'Packed', 'Shipped') | |
| packages | JSONB | [{weight, dimensions, items}] |
| packed_by | UUID | FK → users |
| packed_at | TIMESTAMPTZ | |

### shipments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| sales_order_id | UUID | FK → sales_orders |
| carrier_id | UUID | FK → carriers |
| tracking_number | VARCHAR(100) | |
| status | ENUM('Pending', 'In Transit', 'Delivered', 'Failed') | |
| shipped_at | TIMESTAMPTZ | |
| delivered_at | TIMESTAMPTZ | |
| proof_of_delivery | TEXT | |

### putaway_tasks
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| grn_id | UUID | FK → goods_received_notes |
| product_id | UUID | FK → products |
| from_location | UUID | FK → warehouse_locations |
| to_location | UUID | FK → warehouse_locations |
| qty | DECIMAL(12,3) | |
| status | ENUM('Pending', 'In Progress', 'Completed') | |
| assigned_to | UUID | FK → users |

---

## 10. Lot & Serial Tracking

### lot_batches
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| product_id | UUID | FK → products |
| lot_number | VARCHAR(50) | |
| manufacture_date | DATE | |
| expiry_date | DATE | |
| qty | DECIMAL(12,3) | |
| status | ENUM('Active', 'Quarantine', 'Expired', 'Consumed') | |

### serial_numbers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| product_id | UUID | FK → products |
| serial | VARCHAR(100) | UNIQUE per company |
| status | ENUM('Available', 'Sold', 'Returned', 'Scrapped') | |
| location_id | UUID | FK → warehouse_locations |

---

## 11. Audit Trail

### audit_log
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies |
| user_id | UUID | FK → users |
| action | VARCHAR(50) | (create, update, delete) |
| entity_type | VARCHAR(50) | (product, order, etc.) |
| entity_id | UUID | |
| changes | JSONB | {before, after} |
| ip_address | VARCHAR(50) | |
| created_at | TIMESTAMPTZ | default now() |
