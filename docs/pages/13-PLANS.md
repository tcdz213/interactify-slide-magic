# Plans Management

## Route
`/plans` — Admin only

## UI Components
- **PageWrapper**: Title "Plans & Tarification" + subtitle with tenant count and MRR
- **Plan Cards Grid** (4 cards): One per plan (Free, Starter, Pro, Enterprise)
  - Each card: plan name, price, tenant count, feature list, edit button
- **FeatureComparison**: Table comparing features across all plans
- **EditPlanDrawer**: Slide-over form to modify plan details

## Data
- `MOCK_PLANS` from `src/mock/plans.mock.ts`
- Fields per plan: id, name, monthlyPrice, tenantsCount, features, limits

## User Actions
- **Edit plan**: Click edit on card → opens drawer → modify fields → save
- **Compare features**: Scroll the comparison table

## Improvements
- [ ] Create new plan
- [ ] Archive/retire plans
- [ ] Usage-based pricing tiers
- [ ] Annual vs monthly billing toggle
- [ ] Plan migration wizard
- [ ] Revenue simulation tool
