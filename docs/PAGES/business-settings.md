# Business Settings

## Route
`/business/settings`

## Status
- Complete: 85%
- UI Status: ✅ Complete
- Logic Status: ✅ Full CRUD on warehouses/integrations, editable forms
- API Status: ⚠️ State only (no persistence)
- i18n: ✅ Wired
- Production Ready: No

## Purpose
Tenant-level settings — company profile, warehouses, tax config, notifications, integrations.

## Existing Features
- 5-tab interface (Company, Warehouses, Tax, Notifications, Integrations)
- Company profile form with NIF/NIS/RC fields + logo upload zone
- Warehouse CRUD (add, edit, delete) with dialog
- Tax configuration (TVA rates, timezone, invoice prefix, currency)
- Notification preferences matrix (email/push/SMS per event type)
- Integration management with add dialog and toggle on/off

## Existing User Actions
- ✅ Edit company profile
- ✅ Add/edit/delete warehouses
- ✅ Configure TVA rates and timezone
- ✅ Toggle notification channels per event
- ✅ Add/toggle integrations

## Missing Features
- [ ] Real backend persistence
- [ ] Logo file upload
- [ ] Invoice template customization

## Final Score
**85/100**
