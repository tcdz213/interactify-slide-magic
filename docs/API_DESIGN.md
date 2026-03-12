# WMS / ERP SaaS — API Design

> All endpoints are scoped by `company_id` extracted from the authenticated user's JWT.

---

## 1. Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new CEO + company |
| POST | `/auth/login` | Login (email/password) |
| POST | `/auth/logout` | Logout |
| POST | `/auth/reset-password` | Send reset link |
| POST | `/auth/refresh` | Refresh JWT token |
| GET | `/auth/me` | Current user profile + roles |

---

## 2. Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies/me` | Current company details |
| PATCH | `/companies/me` | Update company settings |
| GET | `/companies/me/stats` | Company dashboard KPIs |

---

## 3. Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscriptions/current` | Current plan details |
| GET | `/subscriptions/plans` | Available plans |
| POST | `/subscriptions/upgrade` | Upgrade plan |
| GET | `/subscriptions/invoices` | Billing history |
| GET | `/subscriptions/usage` | Current usage (users, warehouses) |

---

## 4. Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List company users |
| POST | `/users` | Create user (checks plan limits) |
| GET | `/users/:id` | User detail |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Deactivate user |
| POST | `/users/:id/roles` | Assign role |
| DELETE | `/users/:id/roles/:role` | Remove role |

---

## 5. Warehouses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/warehouses` | List warehouses |
| POST | `/warehouses` | Create (checks plan limits) |
| GET | `/warehouses/:id` | Detail |
| PATCH | `/warehouses/:id` | Update |
| GET | `/warehouses/:id/locations` | List locations |
| POST | `/warehouses/:id/locations` | Create location |
| GET | `/warehouses/:id/stats` | Warehouse KPIs |

---

## 6. Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List (filterable, paginated) |
| POST | `/products` | Create |
| GET | `/products/:id` | Detail |
| PATCH | `/products/:id` | Update |
| DELETE | `/products/:id` | Soft delete |
| GET | `/products/:id/barcodes` | List barcodes |
| POST | `/products/:id/barcodes` | Add barcode |
| GET | `/products/:id/inventory` | Stock levels across warehouses |

---

## 7. Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | List (filter by warehouse, product) |
| GET | `/inventory/dashboard` | Stock dashboard KPIs |
| POST | `/inventory/adjustments` | Create adjustment |
| GET | `/inventory/adjustments` | List adjustments |
| POST | `/inventory/transfers` | Create transfer |
| GET | `/inventory/transfers` | List transfers |
| PATCH | `/inventory/transfers/:id` | Update status |
| POST | `/inventory/cycle-counts` | Create cycle count |
| GET | `/inventory/cycle-counts` | List counts |

---

## 8. Purchasing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendors` | List vendors |
| POST | `/vendors` | Create vendor |
| GET | `/vendors/:id` | Vendor detail + scorecard |
| GET | `/purchase-orders` | List POs |
| POST | `/purchase-orders` | Create PO |
| GET | `/purchase-orders/:id` | PO detail |
| PATCH | `/purchase-orders/:id` | Update PO |
| POST | `/purchase-orders/:id/send` | Send to supplier |
| POST | `/grns` | Create GRN |
| GET | `/grns` | List GRNs |
| POST | `/grns/:id/validate` | Validate GRN |

---

## 9. Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Customer detail |
| GET | `/sales-orders` | List orders |
| POST | `/sales-orders` | Create order |
| GET | `/sales-orders/:id` | Order detail |
| PATCH | `/sales-orders/:id` | Update order |
| POST | `/sales-orders/:id/confirm` | Confirm order |
| GET | `/invoices` | List invoices |
| POST | `/invoices` | Create invoice |
| POST | `/payments` | Record payment |
| GET | `/payments` | List payments |

---

## 10. WMS Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/picking` | List picking tasks |
| POST | `/picking/:id/start` | Start picking |
| POST | `/picking/:id/complete` | Complete picking |
| GET | `/packing` | List packing tasks |
| POST | `/packing/:id/pack` | Pack items |
| GET | `/shipments` | List shipments |
| POST | `/shipments` | Create shipment |
| PATCH | `/shipments/:id` | Update status |

---

## 11. Connections (Cross-Tenant)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/connections` | List connections |
| POST | `/connections/request` | Send connection request |
| POST | `/connections/:id/accept` | Accept request |
| POST | `/connections/:id/reject` | Reject request |
| DELETE | `/connections/:id` | Disconnect |
| GET | `/connections/:id/catalog` | View supplier catalog |

---

## 12. Incoming POs (Supplier Side)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incoming-pos` | List received POs |
| GET | `/incoming-pos/:id` | Detail |
| POST | `/incoming-pos/:id/accept` | Accept order |
| POST | `/incoming-pos/:id/reject` | Reject order |
| POST | `/incoming-pos/:id/ship` | Mark as shipped |

---

## 13. Returns & Quality

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/returns` | Create return |
| GET | `/returns` | List returns |
| PATCH | `/returns/:id` | Update return |
| POST | `/qc-inspections` | Create inspection |
| GET | `/qc-inspections` | List inspections |
| POST | `/credit-notes` | Issue credit note |
| GET | `/credit-notes` | List credit notes |

---

## 14. Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/stock-valuation` | Stock valuation |
| GET | `/reports/movement-journal` | Stock movements |
| GET | `/reports/sales-summary` | Sales summary |
| GET | `/reports/purchase-summary` | Purchase summary |
| GET | `/reports/profitability` | Profit & margin |
| GET | `/reports/vendor-scorecard` | Vendor performance |
| POST | `/reports/export` | Export (PDF/CSV) |

---

## 15. Platform Owner

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/subscribers` | List all companies |
| GET | `/admin/subscribers/:id` | Company detail |
| PATCH | `/admin/subscribers/:id` | Update status |
| GET | `/admin/kpis` | Platform KPIs (MRR, churn) |
| GET | `/admin/onboarding` | Pending requests |
| POST | `/admin/onboarding/:id/approve` | Approve |
| POST | `/admin/onboarding/:id/reject` | Reject |
| GET | `/admin/billing` | All invoices |
| GET | `/admin/support` | Support tickets |

---

## Error Response Format

```json
{
  "error": {
    "code": "LIMIT_REACHED",
    "message": "User limit reached for your current plan (15/15). Please upgrade.",
    "status": 403
  }
}
```

## Pagination

```
GET /products?page=1&per_page=25&sort=name&order=asc&search=ciment
```

Response:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 142,
    "total_pages": 6
  }
}
```
