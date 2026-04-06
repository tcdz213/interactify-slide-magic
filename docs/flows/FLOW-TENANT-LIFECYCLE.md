# Flow: Tenant Lifecycle (SaaS)

## Lifecycle States
```
┌───────┐    ┌────────┐    ┌──────────┐
│ TRIAL │───▶│ ACTIVE │───▶│SUSPENDED │
└───────┘    └────────┘    └──────────┘
    │             │              │
    │        Plan upgrade/    Reactivation
    │        downgrade        after payment
    │             │              │
    ▼             ▼              ▼
  Expire      Billing        Deletion
  (→suspend)  cycle          (after grace)
```

## Onboarding Flow
1. **Signup**: New tenant created with type (supplier/warehouse/logistics)
2. **Trial**: 14-day trial period (configurable in Settings)
3. **Plan selection**: Choose free/starter/pro/enterprise
4. **Setup**: Configure warehouse, add products, invite users

## Billing Cycle
1. Monthly billing date based on subscription start
2. Invoice generated automatically
3. Payment expected within grace period
4. Overdue → notification → grace period → auto-suspend (if enabled)

## Quota Management
- Users: per-plan limit (free: 5, starter: 15, pro: 50, enterprise: unlimited)
- Products: per-plan limit (free: 100, starter: 500, pro: 5000, enterprise: unlimited)
- Quota warnings at 70% and 90%
- Quota exceeded → notification to admin

## Audit Trail
All lifecycle events logged: creation, suspension, reactivation, deletion, plan changes, payment events

## Current Gaps
- No actual signup flow (tenants created by admin)
- No automated billing
- No self-service plan management
- No usage metering
