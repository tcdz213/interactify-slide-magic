# Admin Settings

## Route
`/admin/settings`

## Status
- Complete: 50%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Forms display but don't persist
- API Status: ❌ None
- Production Ready: No

## Purpose
Platform configuration — general info, notifications, API keys, maintenance mode.

## Existing Features
- Tabs: General, Notifications, API Keys, Maintenance
- Platform info form (name, email, URL)
- Plan pricing editor (Starter/Professional/Enterprise)
- Notification toggles (4 options)
- API key display with show/hide/copy
- Maintenance mode toggle with warning

## Existing UI
- Tabs, form inputs, switches, badge
- API key masked input

## Existing User Actions
- ✅ Toggle maintenance mode (state only)
- ✅ Show/hide API key
- ✅ Copy API key
- ❌ Save settings (button exists, doesn't persist)
- ❌ Generate new API key
- ❌ Save notifications

## Backend/API Needed
- `GET /admin/settings`
- `PUT /admin/settings`
- `POST /admin/settings/api-keys`
- `DELETE /admin/settings/api-keys/:id`
- `PUT /admin/settings/maintenance`

## Missing Features
- [ ] Settings persistence
- [ ] Real API key generation/rotation
- [ ] SMTP configuration
- [ ] Feature flags management
- [ ] Backup/restore settings

## Security Notes
- ⚠️ Hardcoded mock API key in source code

## Priority Tasks
- **Critical**: Auth guard, settings persistence
- **High**: API key management
- **Medium**: SMTP config

## Final Score
**50/100**
