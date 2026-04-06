# Platform Settings

## Route
`/settings` — Admin only

## UI Components
- **PageWrapper** with breadcrumbs
- **Section cards** organized by concern:

### Regional Configuration
- Currency selector (DZD, EUR, USD, GBP, MAD, TND, SAR)
- Currency symbol
- Timezone (Africa/Algiers default)
- Contact email

### Language & Theme
- Supported languages toggles (FR/EN/AR)
- Default language selector
- Theme selector (light/dark/system)

### Maintenance Mode
- Toggle on/off
- Custom maintenance message
- Visual warning when active

### Subscription Governance
- Trial duration (days)
- Auto-suspend overdue toggle
- Grace period (days)
- Data retention (days)
- Max tenants per plan (editable table)

### Save Action
- Save button at bottom → toast confirmation

## Data
- Local state initialized with `DEFAULT_CONFIG`
- No persistence (resets on page reload)

## Improvements
- [ ] Persist settings to backend
- [ ] Global maintenance mode enforcement
- [ ] Backup & restore settings
- [ ] API rate limiting configuration
- [ ] Custom branding (logo, colors)
- [ ] SMTP configuration for emails
- [ ] Webhook management
- [ ] Feature flags management
