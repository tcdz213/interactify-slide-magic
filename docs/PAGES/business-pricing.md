# Business Pricing Rules

## Route
`/business/pricing`

## Status
- Complete: 50%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Display only
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Manage segment-based pricing rules — set prices per customer segment, product unit, and date range.

## Existing Features
- Pricing rules display per product
- Segment badges (superette, wholesale, shadow)
- Effective date ranges

## Existing User Actions
- ✅ View pricing rules
- ❌ Create pricing rule
- ❌ Edit pricing rule
- ❌ Delete pricing rule
- ❌ Bulk price update

## Backend/API Needed
- `GET /pricing-rules`
- `POST /pricing-rules`
- `PUT /pricing-rules/:id`
- `DELETE /pricing-rules/:id`
- `POST /pricing-rules/bulk-update`

## Missing Features
- [ ] CRUD operations
- [ ] Price effective date management
- [ ] Bulk update interface
- [ ] Price comparison view
- [ ] Margin calculation
- [ ] Discount management

## Final Score
**50/100**
