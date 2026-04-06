# Notification Center

## Route
`/notifications` — Admin only

## UI Components
- **Header**: Bell icon + unread count badge
- **Actions**: "Mark all read" button
- **Filters**: All / Unread / Read pills
- **Notification list**: Cards with priority-colored border, type icon, title, message, tenant name, timestamp, read/unread indicator

## Notification Types (6)
| Type | Icon | Description |
|------|------|-------------|
| TRIAL_EXPIRING | Clock | Tenant trial about to expire |
| QUOTA_WARNING | AlertTriangle | Tenant approaching quota limits |
| QUOTA_EXCEEDED | ShieldAlert | Tenant exceeded quota |
| PAYMENT_OVERDUE | AlertCircle | Payment past due |
| INACTIVE_TENANT | Info | Tenant inactive for extended period |
| SYSTEM_UPDATE | Server | System maintenance or updates |

## Priority Levels
- `low` (muted), `medium` (primary), `high` (amber), `urgent` (red)

## User Actions
- **Toggle read/unread**: Click on notification
- **Mark all read**: Clears all unread indicators
- **Filter**: Switch between all/unread/read views
- **Navigate**: Some notifications link to relevant pages

## Improvements
- [ ] Email/SMS notification preferences
- [ ] Push notifications (PWA)
- [ ] Notification categories and muting
- [ ] Scheduled notifications
- [ ] Webhook integrations
