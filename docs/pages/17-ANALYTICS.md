# Platform Analytics

## Route
`/analytics` — Admin only

## UI Components
- **Header**: BarChart3 icon + title + subtitle
- **Metric Cards** (6): MRR (with growth %), ARR, ARPU, Churn Rate, Conversion Rate (trial→paid), DAU/MAU Ratio
- **GrowthChart**: Tenant growth over time
- **ChurnAnalysis**: Churn breakdown and trends
- **Geographic Distribution**: Tenant distribution by wilaya (Algerian provinces)
- **Revenue by Plan Trend**: Revenue trend segmented by plan

## Metrics
| Metric | Description |
|--------|-------------|
| MRR | Monthly Recurring Revenue |
| ARR | Annual Recurring Revenue |
| ARPU | Average Revenue Per User |
| Churn Rate | Monthly attrition % |
| Conversion | Trial to paid conversion % |
| DAU/MAU | Daily/Monthly active users ratio |

## Data
- `analytics.service.ts`: KPIs, growth data, churn data, geographic distribution, plan revenue trends

## Improvements
- [ ] Cohort analysis
- [ ] Customer lifetime value (CLV)
- [ ] Funnel visualization (signup → trial → paid → upgrade)
- [ ] Custom date ranges
- [ ] Benchmark comparisons
- [ ] Export reports
