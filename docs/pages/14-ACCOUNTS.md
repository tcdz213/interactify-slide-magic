# Accounts Management

## Routes
- `/accounts` — Account list (admin only)
- `/accounts/:id` — Account detail (admin only)

## Account List

### UI Components
- **PageWrapper**
- **Filters**: Search (name/email), status, instance, role
- **Action buttons**: Export CSV, Create account
- **Table**: Name + avatar, email, instance, role, last login activity indicator, status badge, actions (view, change role)
- **RoleAssignmentModal**: Change user role with dropdown
- **CreateAccountDrawer**: New account form

### Activity Indicator
- Active (≤3 days): green
- Recent (≤30 days): amber with "Xd ago"
- Inactive (30d+): red

### Role Types (17 available)
`platform_owner`, `instance_admin`, `warehouse_manager`, `inventory_clerk`, `receiving_agent`, `shipping_agent`, `picker`, `packer`, `quality_inspector`, `accountant`, `sales_rep`, `supplier`, `driver`, `warehouse`, `trader`, `sales`, `support`

## Improvements
- [ ] Bulk role assignment
- [ ] Account suspension/deletion
- [ ] Two-factor authentication management
- [ ] Login history
- [ ] Permission audit trail
