# Billing API

## Overview

Manage subscriptions, plans, invoices, and payment methods.

---

## Plans Endpoints

### GET /billing/plans

Get available subscription plans.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "plan-free",
      "name": "Free",
      "description": "For individuals and small teams",
      "monthlyPrice": 0,
      "yearlyPrice": 0,
      "popular": false,
      "features": [
        "Up to 2 products",
        "Up to 5 team members",
        "Basic analytics"
      ],
      "limits": {
        "products": 2,
        "teamMembers": 5,
        "featuresPerMonth": 50,
        "storage": "1GB",
        "advancedAnalytics": false,
        "customWorkflows": false,
        "prioritySupport": false,
        "sso": false,
        "apiAccess": false
      }
    },
    {
      "id": "plan-pro",
      "name": "Pro",
      "description": "For growing teams",
      "monthlyPrice": 29,
      "yearlyPrice": 290,
      "popular": true,
      "features": [
        "Unlimited products",
        "Up to 25 team members",
        "Advanced analytics",
        "Priority support"
      ],
      "limits": {
        "products": -1,
        "teamMembers": 25,
        "featuresPerMonth": 500,
        "storage": "50GB",
        "advancedAnalytics": true,
        "customWorkflows": true,
        "prioritySupport": true,
        "sso": false,
        "apiAccess": true
      }
    }
  ]
}
```

---

## Subscription Endpoints

### GET /billing/subscription

Get current subscription.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "sub-uuid",
    "userId": "uuid",
    "workspaceId": "uuid",
    "planId": "plan-pro",
    "status": "active",
    "interval": "monthly",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "trialEndsAt": null
  }
}
```

---

### POST /billing/subscription

Create subscription.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| planId | string | Yes | Plan ID |
| interval | string | Yes | `monthly` or `yearly` |

**Request:**
```json
{
  "planId": "plan-pro",
  "interval": "yearly"
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

### PATCH /billing/subscription

Update subscription (change plan).

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| planId | string | Yes | New plan ID |

**Request:**
```json
{
  "planId": "plan-enterprise"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /billing/subscription

Cancel subscription.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "message": "Subscription cancelled. Will remain active until end of billing period."
  }
}
```

---

## Usage Endpoint

### GET /billing/usage

Get current usage.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "products": 5,
    "teamMembers": 12,
    "features": 150,
    "storage": 25.5
  }
}
```

---

## Invoice Endpoints

### GET /billing/invoices

Get all invoices.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "inv-uuid",
      "subscriptionId": "sub-uuid",
      "amount": 29.00,
      "status": "paid",
      "createdAt": "2024-01-01T00:00:00Z",
      "paidAt": "2024-01-01T00:05:00Z",
      "invoiceUrl": "https://billing.example.com/invoices/inv-uuid"
    }
  ]
}
```

---

### GET /billing/invoices/:id

Get invoice by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "inv-uuid",
    "subscriptionId": "sub-uuid",
    "amount": 29.00,
    "status": "paid",
    "createdAt": "2024-01-01T00:00:00Z",
    "paidAt": "2024-01-01T00:05:00Z",
    "invoiceUrl": "https://billing.example.com/invoices/inv-uuid"
  }
}
```

---

## Payment Method Endpoints

### GET /billing/payment-methods

Get all payment methods.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "pm-uuid",
      "type": "card",
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true
    }
  ]
}
```

---

### POST /billing/payment-methods

Add payment method.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Payment processor token |

**Request:**
```json
{
  "token": "tok_visa"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "pm-uuid",
    "type": "card",
    "last4": "4242",
    "brand": "visa",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "isDefault": false
  }
}
```

---

### DELETE /billing/payment-methods/:id

Delete payment method.

**Roles:** Authenticated

**Response (204):** No content

---

### POST /billing/payment-methods/:id/default

Set default payment method.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "pm-uuid",
    "isDefault": true,
    ...
  }
}
```

---

## Types

```typescript
interface PlanLimits {
  products: number;
  teamMembers: number;
  featuresPerMonth: number;
  storage: string;
  advancedAnalytics: boolean;
  customWorkflows: boolean;
  prioritySupport: boolean;
  sso: boolean;
  apiAccess: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  limits: PlanLimits;
}

interface Subscription {
  id: string;
  userId: string;
  workspaceId: string;
  planId: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
}

interface Usage {
  products: number;
  teamMembers: number;
  features: number;
  storage: number;
}

interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
  paidAt: string | null;
  invoiceUrl: string | null;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}
```
