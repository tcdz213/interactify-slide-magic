# Admin API

## Overview

Administrative APIs for user management, billing oversight, reports, statistics, and CORS configuration.

**Note:** All Admin API endpoints require `admin` or `owner` role.

---

## Admin Users Endpoints

### GET /admin/users

List all users with filtering.

**Roles:** `admin`, `owner`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | `active`, `suspended`, `pending` |
| role | string | No | Filter by role |
| search | string | No | Search name/email |
| sortBy | string | No | Sort field |
| sortOrder | string | No | `asc` or `desc` |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "role": "user",
      "status": "active",
      "emailVerified": true,
      "workspaceId": "uuid",
      "workspaceName": "My Workspace",
      "lastLoginAt": "2024-01-25T10:00:00Z",
      "createdAt": "2023-06-01T00:00:00Z",
      "updatedAt": "2024-01-25T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /admin/users/:id

Get user by ID.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /admin/users/:id/status

Update user status.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `active` or `suspended` |

**Request:**
```json
{
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /admin/users/:id/role

Update user role.

**Roles:** `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | Yes | New role |

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /admin/users/:id

Delete user.

**Roles:** `owner`

**Response (204):** No content

---

### POST /admin/users/:id/reset-password

Force password reset for user.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

## Admin Billing Endpoints

### GET /admin/billing

List all billing records.

**Roles:** `admin`, `owner`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | `active`, `past_due`, `canceled`, `trialing` |
| plan | string | No | Filter by plan |
| search | string | No | Search user name/email |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "workspaceId": "uuid",
      "workspaceName": "My Workspace",
      "plan": "pro",
      "status": "active",
      "amount": 29.00,
      "currency": "USD",
      "billingCycle": "monthly",
      "nextBillingDate": "2024-02-01T00:00:00Z",
      "createdAt": "2023-06-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /admin/billing/:id

Get billing record by ID.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /admin/billing/:id/plan

Update user's plan.

**Roles:** `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| plan | string | Yes | New plan ID |

**Request:**
```json
{
  "plan": "enterprise"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /admin/billing/:id/cancel

Cancel user's subscription.

**Roles:** `owner`

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /admin/billing/:id/refund

Issue refund.

**Roles:** `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Refund amount |

**Request:**
```json
{
  "amount": 15.00
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Refund processed successfully"
  }
}
```

---

## Admin Reports Endpoints

### GET /admin/reports

List all reports.

**Roles:** `admin`, `owner`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| type | string | No | `bug`, `feedback`, `support`, `feature_request` |
| status | string | No | `new`, `in_progress`, `resolved`, `closed` |
| priority | string | No | `low`, `medium`, `high`, `critical` |
| search | string | No | Search query |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "bug",
      "title": "App crashes on startup",
      "description": "The app crashes immediately after launch",
      "status": "in_progress",
      "priority": "critical",
      "userId": "uuid",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "assignedTo": "uuid",
      "assignedToName": "John Admin",
      "createdAt": "2024-01-20T00:00:00Z",
      "updatedAt": "2024-01-25T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /admin/reports/:id

Get report by ID.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /admin/reports/:id/status

Update report status.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |

**Request:**
```json
{
  "status": "resolved"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /admin/reports/:id/assign

Assign report to admin.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| assignedTo | string | Yes | Admin user ID |

**Request:**
```json
{
  "assignedTo": "admin-uuid"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /admin/reports/:id

Delete report.

**Roles:** `owner`

**Response (204):** No content

---

## Admin Statistics Endpoints

### GET /admin/stats/overview

Get admin overview statistics.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "newUsersThisMonth": 150,
    "totalRevenue": 45000.00,
    "monthlyRevenue": 4500.00,
    "activeSubscriptions": 500,
    "totalWorkspaces": 300,
    "totalProjects": 1200,
    "openReports": 25,
    "resolvedReports": 180
  }
}
```

---

### GET /admin/stats/user-growth

Get user growth statistics.

**Roles:** `admin`, `owner`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | `week`, `month`, `year` |

**Response (200):**
```json
{
  "data": [
    { "date": "2024-01-01", "count": 10 },
    { "date": "2024-01-02", "count": 15 },
    { "date": "2024-01-03", "count": 8 }
  ]
}
```

---

### GET /admin/stats/revenue

Get revenue statistics.

**Roles:** `admin`, `owner`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | `week`, `month`, `year` |

**Response (200):**
```json
{
  "data": [
    { "date": "2024-01-01", "amount": 2500.00 },
    { "date": "2024-01-02", "amount": 1800.00 },
    { "date": "2024-01-03", "amount": 3200.00 }
  ]
}
```

---

### GET /admin/stats/plan-distribution

Get plan distribution.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": [
    { "plan": "free", "count": 800 },
    { "plan": "starter", "count": 300 },
    { "plan": "pro", "count": 350 },
    { "plan": "enterprise", "count": 50 }
  ]
}
```

---

## Admin CORS Endpoints

### GET /admin/cors

Get CORS configuration.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": {
    "enabled": true,
    "origins": [
      "https://app.example.com",
      "https://staging.example.com"
    ],
    "credentials": true
  }
}
```

---

### POST /admin/cors/enable

Enable CORS.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": {
    "message": "CORS enabled",
    "config": { ... }
  }
}
```

---

### POST /admin/cors/disable

Disable CORS.

**Roles:** `owner`

**Response (200):**
```json
{
  "data": {
    "message": "CORS disabled",
    "config": { ... }
  }
}
```

---

### PUT /admin/cors/origins

Replace all CORS origins.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| origins | array | Yes | List of allowed origins |

**Request:**
```json
{
  "origins": [
    "https://app.example.com",
    "https://new-app.example.com"
  ]
}
```

**Response (200):**
```json
{
  "data": {
    "message": "CORS origins updated",
    "config": { ... }
  }
}
```

---

### POST /admin/cors/origins

Add CORS origin.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| origin | string | Yes | Origin to add |

**Request:**
```json
{
  "origin": "https://new-origin.example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Origin added",
    "config": { ... }
  }
}
```

---

### DELETE /admin/cors/origins/:origin

Remove CORS origin.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": {
    "message": "Origin removed",
    "config": { ... }
  }
}
```

---

### POST /admin/cors/reset

Reset CORS to defaults.

**Roles:** `owner`

**Response (200):**
```json
{
  "data": {
    "message": "CORS reset to defaults",
    "config": { ... }
  }
}
```

---

## Types

```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'owner' | 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  workspaceId: string;
  workspaceName: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminBillingRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  workspaceId: string;
  workspaceName: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  createdAt: string;
}

interface AdminReport {
  id: string;
  type: 'bug' | 'feedback' | 'support' | 'feature_request';
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  totalWorkspaces: number;
  totalProjects: number;
  openReports: number;
  resolvedReports: number;
}

interface CorsConfig {
  enabled: boolean;
  origins: string[];
  credentials: boolean;
}
```
