# Users Page

## Route
`/users` — Roles: `admin` only

## Access Control
Non-admin users see a centered "no access" message.

## UI Components
- **Header**: Users icon + title + subtitle
- **Stats Cards** (4): Total instances, Active instances, Total accounts, Monthly revenue (DA)
- **Tab Bar**: Instances | Accounts | Subscriptions

### Instances Tab (`InstancesTab`)
- List of WMS instances from `MOCK_WMS_INSTANCES`

### Accounts Tab (`AccountsTab`)
- List of platform accounts from `MOCK_PLATFORM_ACCOUNTS`

### Subscriptions Tab (`SubscriptionsTab`)
- List of subscriptions from `MOCK_SUBSCRIPTIONS`

## Data
- Static mock data from `src/mock/platform.mock.ts`

## Edge Cases
- Non-admin → "No access" message
- Empty tabs → component-specific empty states

## Improvements
- [ ] Merge with Tenant/Account management or clearly differentiate scope
- [ ] Add user creation/editing from this page
- [ ] User activity timeline
- [ ] Permission matrix view
