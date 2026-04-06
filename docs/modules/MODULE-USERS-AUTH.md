# Module: Users & Authentication

## Overview
Handles user authentication, role-based access control (RBAC), and menu visibility per role.

## Current Implementation
- **AuthContext**: React context with `login()`, `logout()`, `user` state
- **Persistence**: `localStorage` under `derfta_user` key
- **Mock auth**: Matches email against `MOCK_USERS` array (password ignored for demo)
- **Route protection**: `ProtectedRoute` component wrapping `AppLayout`

## Roles & Permissions
| Role | Menu Items |
|------|-----------|
| admin | dashboard, tenants, plans, accounts, billing, audit, analytics, notifications, accounting, suppliers, users, settings |
| warehouse | dashboard, inventory, orders, deliveries, suppliers |
| driver | dashboard, deliveries |
| trader | dashboard, products, orders, invoices, accounting, suppliers |
| sales | dashboard, orders, deliveries |
| support | dashboard, orders, invoices |

## Mock Users (6)
| Email | Name | Role | Company |
|-------|------|------|---------|
| admin@jawda.dz | Mohamed Allal | admin | Jawda Platform |
| depot.oran@wms.dz | Youcef Hadj | warehouse | Derfta Corp |
| driver@wms.dz | Samir Boudiaf | driver | Derfta Corp |
| fournisseur@wms.dz | Rachid Meziane | trader | Meziane Distribution |
| sales@wms.dz | Nadia Cherif | sales | Derfta Corp |
| support@wms.dz | Amina Khelifi | support | Derfta Corp |

## Platform Roles (17 granular)
Used in account management: platform_owner, instance_admin, warehouse_manager, inventory_clerk, receiving_agent, shipping_agent, picker, packer, quality_inspector, accountant, sales_rep, supplier, driver, warehouse, trader, sales, support

## Missing Features
- [ ] Real authentication (JWT/session)
- [ ] Password hashing
- [ ] User registration / invitation flow
- [ ] Password reset
- [ ] Two-factor authentication (2FA)
- [ ] SSO / OAuth (Google, Microsoft)
- [ ] Session management (timeout, concurrent sessions)
- [ ] Fine-grained permissions (CRUD per module)
- [ ] User profile editing
- [ ] Activity tracking per user
