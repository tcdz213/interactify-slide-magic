# Admin Tenants

## Route
`/admin/tenants`

## Status
- Complete: 60%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Search only, no CRUD
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Manage all tenants on the platform — view, search, create, edit, suspend companies.

## Existing Features
- Tenant table with search
- View dialog with tenant details (status, plan, subscription, contact info, stats)
- "Add Tenant" button (non-functional)
- Status badges (TenantStatusBadge, PlanBadge, SubStatusBadge)

## Existing UI
- Search input with icon
- Table (8 columns): company, status, plan, subscription, users, warehouses, revenue, actions
- View dialog with grid layout
- "Add Tenant" button

## Existing User Actions
- ✅ Search tenants
- ✅ View tenant details (dialog)
- ❌ Create tenant (button exists, no form)
- ❌ Edit tenant
- ❌ Suspend/activate tenant
- ❌ Delete tenant

## Frontend Logic Review
- **State**: `useState` for tenants, search, selectedTenant
- **Validation**: None
- **Loading**: ❌ No loading state
- **Errors**: ❌ No error handling
- **Responsive**: ✅ Table responsive
- **i18n**: ✅ Translated
- **RTL**: ✅ Uses `start-3` / `ps-9`
- **Permissions**: ❌ No auth guard

## Backend/API Needed
- `GET /admin/tenants` — List with pagination
- `POST /admin/tenants` — Create tenant
- `PUT /admin/tenants/:id` — Update
- `DELETE /admin/tenants/:id` — Suspend
- `POST /admin/tenants/:id/activate` — Reactivate

## Missing Features
- [ ] Create tenant form
- [ ] Edit tenant inline or in sheet
- [ ] Suspend/activate toggle
- [ ] Pagination
- [ ] Filter by status, plan
- [ ] Sort by columns
- [ ] Bulk actions (suspend multiple)
- [ ] Tenant provisioning workflow

## UX Improvements
- [ ] Add skeleton loading
- [ ] Add confirmation dialog for suspend
- [ ] Add tenant creation wizard
- [ ] Add empty state
- [ ] Add export to CSV

## Security Notes
- ❌ No auth required
- ❌ No confirmation on destructive actions

## Performance Notes
- ⚠️ Loads all tenants at once
- ⚠️ Uses `useEffect` not React Query

## Priority Tasks
- **Critical**: Auth guard, create/edit tenant CRUD
- **High**: Pagination, filters
- **Medium**: Bulk actions
- **Low**: Export

## Final Score
**60/100**
