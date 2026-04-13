# Admin Accounts

## Route
`/admin/accounts`

## Status
- Complete: 55%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Display + invite dialog (non-functional)
- API Status: ❌ Mock data
- Production Ready: No

## Purpose
Manage platform admin accounts — super admins, support staff, billing admins.

## Existing Features
- Admin accounts table with search
- Invite user dialog (email + role selector)
- Role badges (super_admin, support, billing_admin)
- Dropdown menu: reset password, deactivate

## Existing UI
- Search input, table, dialog, dropdown menu
- Role select (Super Admin / Support / Billing Admin)

## Existing User Actions
- ✅ Search accounts
- ⚠️ Invite user (form exists, doesn't submit)
- ❌ Reset password (button exists, no action)
- ❌ Deactivate account (button exists, no action)

## Backend/API Needed
- `GET /admin/accounts`
- `POST /admin/accounts/invite`
- `PUT /admin/accounts/:id`
- `POST /admin/accounts/:id/reset-password`
- `DELETE /admin/accounts/:id`

## Missing Features
- [ ] Working invite flow with email
- [ ] Real password reset
- [ ] Account deactivation with confirmation
- [ ] Activity history per account
- [ ] Two-factor authentication management
- [ ] Permission matrix view

## Priority Tasks
- **Critical**: Auth guard, working CRUD
- **High**: 2FA management
- **Medium**: Activity log

## Final Score
**55/100**
