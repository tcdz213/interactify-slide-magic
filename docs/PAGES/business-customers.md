# Business Customers

## Route
`/business/customers`

## Status
- Complete: 55%
- UI Status: ✅ Complete
- Logic Status: ⚠️ Search only
- API Status: ❌ Fake API
- Production Ready: No

## Purpose
Customer/retailer management — view, search, create, manage customer accounts.

## Existing Features
- Customer table with search
- Segment badges (superette, wholesale, shadow)
- "Add Customer" and "Add Shadow" buttons (non-functional)
- Total orders and total spent display

## Existing User Actions
- ✅ Search customers
- ❌ Create customer
- ❌ Edit customer
- ❌ View customer detail
- ❌ Merge shadow accounts
- ❌ View customer history

## Backend/API Needed
- `GET /customers?search=&segment=&page=`
- `POST /customers`
- `PUT /customers/:id`
- `GET /customers/:id/orders`
- `POST /customers/:id/merge`

## Missing Features
- [ ] CRUD operations
- [ ] Customer detail page
- [ ] Order history per customer
- [ ] Credit limit management
- [ ] Segment filter
- [ ] Customer statement
- [ ] Geolocation/map view

## Final Score
**55/100**
