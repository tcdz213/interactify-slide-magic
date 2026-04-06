# Audit Logs

## Route
`/audit` — Admin only

## UI Components
- **Header** with ScrollText icon
- **Stats**: Total events, info/warning/critical counts
- **Filters**: Search (description/actor/target), category tabs (all/tenant/account/plan/payment/system), severity filter
- **Event list**: Cards with event icon, type, description, actor, target, IP address, timestamp, severity badge

## Event Types (14)
- Tenant: CREATED, SUSPENDED, DELETED, REACTIVATED
- Account: CREATED, ROLE_CHANGED, SUSPENDED
- Plan: UPGRADED, DOWNGRADED, CANCELLED
- Payment: RECEIVED, FAILED
- System: SETTINGS_CHANGED, LOGIN_ADMIN

## Severity Levels
- `info` (primary blue), `warning` (amber), `critical` (red)

## Data
- `MOCK_AUDIT_EVENTS` from `audit.mock.ts`
- Sorted by timestamp descending (newest first)

## Improvements
- [ ] Date range filtering
- [ ] Export audit logs
- [ ] Real-time event streaming
- [ ] Event detail modal
- [ ] Automated alerts for critical events
- [ ] IP geolocation display
- [ ] Retention policy management
