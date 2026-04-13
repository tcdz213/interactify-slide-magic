# Business Create Order

## Route
`/business/orders/create`

## Status
- Complete: 60%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Form works client-side, no persistence
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Create new sales order — select customer, add product lines with unit/quantity/pricing, submit.

## Existing Features
- Customer selector
- Product line items with unit selection
- Quantity and price inputs
- Line total calculation
- Order total calculation
- Notes field
- Save as draft / Confirm & send buttons

## Existing UI
- Customer select, product table, add line button, summary card

## Existing User Actions
- ✅ Select customer
- ✅ Add product lines
- ✅ Calculate totals
- ⚠️ Submit order (toast only)
- ❌ Stock validation on quantity

## Backend/API Needed
- `POST /orders`
- `GET /customers`
- `GET /products`
- `GET /products/:id/pricing?segment=`

## Missing Features
- [ ] Real order submission
- [ ] Stock availability check
- [ ] Segment-based auto-pricing
- [ ] Discount per line
- [ ] Minimum order validation
- [ ] Tax calculation (TVA 9%/19%)
- [ ] Order templates
- [ ] Duplicate previous order

## Final Score
**60/100**
