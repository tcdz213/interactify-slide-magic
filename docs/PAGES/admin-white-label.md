# Admin White Label

## Route
`/admin/white-label`

## Status
- Complete: 50%
- UI Status: ✅ Complete
- Logic Status: ⚠️ State changes but no persistence
- API Status: ❌ None
- Production Ready: No

## Purpose
Customize platform branding for tenants — logo, colors, domain, email templates.

## Existing Features
- Tabs: Branding, Domain, Emails
- Color picker with presets
- Brand name input
- Logo/favicon upload zones (non-functional)
- Live branding preview
- Custom domain with DNS instructions
- Email template cards (4 templates with variables)

## Existing UI
- Color picker (native + preset buttons)
- Preview panel
- Upload dropzones
- Domain form with DNS details
- Template cards with variable badges

## Existing User Actions
- ✅ Change primary color (preview updates)
- ✅ Change brand name (preview updates)
- ⚠️ Save branding (toast only, no persistence)
- ❌ Upload logo/favicon
- ❌ Verify DNS
- ❌ Edit email templates

## Backend/API Needed
- `PUT /admin/white-label/branding`
- `POST /admin/white-label/logo`
- `PUT /admin/white-label/domain`
- `POST /admin/white-label/domain/verify`
- `PUT /admin/white-label/emails/:templateId`

## Missing Features
- [ ] Real file upload for logo/favicon
- [ ] Domain verification flow
- [ ] Email template WYSIWYG editor
- [ ] Per-tenant branding override
- [ ] CSS variable generation from color picker
- [ ] Branding preview on different pages

## Priority Tasks
- **Critical**: Auth guard
- **High**: File upload, persistence
- **Medium**: Email template editor
- **Low**: Per-tenant overrides

## Final Score
**50/100**
