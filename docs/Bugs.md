# Bugs API

## Overview

Track and manage bugs including status updates, assignments, retest results, sprint integration, and statistics.

---

## Endpoints

### GET /bugs

List all bugs with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by status |
| severity | string | No | Filter by severity |
| priority | string | No | Filter by priority |
| productId | string | No | Filter by product |
| platform | string | No | Filter by platform |
| assigneeId | string | No | Filter by assignee |
| reporterId | string | No | Filter by reporter |
| sprintId | string | No | Filter by sprint |
| search | string | No | Search query |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Login button not working on Safari",
      "description": "The login button doesn't respond to clicks",
      "stepsToReproduce": "1. Open Safari\n2. Navigate to login\n3. Click login button",
      "expectedBehavior": "Should submit the form",
      "actualBehavior": "Nothing happens",
      "status": "confirmed",
      "severity": "high",
      "priority": "high",
      "productId": "uuid",
      "productName": "Web App",
      "platform": "web",
      "featureId": "uuid",
      "featureTitle": "User Authentication",
      "sprintId": "uuid",
      "sprintName": "Sprint 5",
      "reporterId": "uuid",
      "reporterName": "Jane Tester",
      "assigneeId": "uuid",
      "assigneeName": "John Developer",
      "environment": "production",
      "version": "1.2.3",
      "browserInfo": "Safari 17.0",
      "retestResults": [],
      "duplicateOf": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z",
      "resolvedAt": null
    }
  ],
  "pagination": { ... }
}
```

---

### GET /bugs/:id

Get bug by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /bugs

Create a new bug report.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Bug title |
| description | string | Yes | Bug description |
| stepsToReproduce | string | Yes | Steps to reproduce |
| expectedBehavior | string | Yes | Expected behavior |
| actualBehavior | string | Yes | Actual behavior |
| severity | string | Yes | `low`, `medium`, `high`, `critical` |
| priority | string | Yes | `low`, `medium`, `high`, `critical` |
| productId | string | Yes | Product ID |
| platform | string | Yes | Platform |
| environment | string | Yes | Environment (production, staging, etc.) |
| version | string | No | App version |
| browserInfo | string | No | Browser information |

**Request:**
```json
{
  "title": "Form validation error",
  "description": "Email validation shows error for valid emails",
  "stepsToReproduce": "1. Go to signup\n2. Enter valid email\n3. See error",
  "expectedBehavior": "Email should be accepted",
  "actualBehavior": "Shows 'Invalid email' error",
  "severity": "medium",
  "priority": "high",
  "productId": "product-uuid",
  "platform": "web",
  "environment": "production",
  "version": "1.2.3",
  "browserInfo": "Chrome 120"
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

### PATCH /bugs/:id

Update a bug.

**Roles:** `admin`, `moderator`, Reporter, Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| stepsToReproduce | string | No | Updated steps |
| expectedBehavior | string | No | Updated expected behavior |
| actualBehavior | string | No | Updated actual behavior |
| severity | string | No | Updated severity |
| priority | string | No | Updated priority |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /bugs/:id/status

Update bug status.

**Roles:** `admin`, `moderator`, Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |

**Request:**
```json
{
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /bugs/:id

Delete a bug.

**Roles:** `admin`, Reporter

**Response (204):** No content

---

## Assignment Endpoints

### POST /bugs/:id/assign

Assign bug to user.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| assigneeId | string | Yes | User ID |

**Request:**
```json
{
  "assigneeId": "user-uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Bug assigned successfully"
  }
}
```

---

### DELETE /bugs/:id/assign

Unassign bug.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "message": "Bug unassigned"
  }
}
```

---

## Feature Linking Endpoints

### POST /bugs/:id/link-feature

Link bug to feature.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| featureId | string | Yes | Feature ID |

**Request:**
```json
{
  "featureId": "feature-uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Bug linked to feature"
  }
}
```

---

### DELETE /bugs/:id/link-feature

Unlink bug from feature.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "message": "Bug unlinked from feature"
  }
}
```

---

## Sprint Integration Endpoints

### POST /bugs/:id/add-to-sprint

Add bug to sprint.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sprintId | string | Yes | Sprint ID |

**Request:**
```json
{
  "sprintId": "sprint-uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Bug added to sprint"
  }
}
```

---

### DELETE /bugs/:id/remove-from-sprint

Remove bug from sprint.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "message": "Bug removed from sprint"
  }
}
```

---

## Retest Endpoints

### GET /bugs/:id/retest

Get retest history.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "failed",
      "testedBy": "uuid",
      "testedByName": "Jane QA",
      "notes": "Still failing on Safari",
      "environment": "staging",
      "testedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /bugs/:id/retest

Add retest result.

**Roles:** `qa`, `moderator`, `admin`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `passed` or `failed` |
| notes | string | No | Retest notes |
| environment | string | Yes | Test environment |

**Request:**
```json
{
  "status": "passed",
  "notes": "Fix verified on all browsers",
  "environment": "staging"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "status": "passed",
    "testedBy": "uuid",
    "testedByName": "Jane QA",
    "notes": "Fix verified on all browsers",
    "environment": "staging",
    "testedAt": "2024-01-16T10:00:00Z"
  }
}
```

---

## Statistics Endpoint

### GET /bugs/statistics

Get bug statistics.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | No | Filter by product |
| dateFrom | string | No | Start date |
| dateTo | string | No | End date |

**Response (200):**
```json
{
  "data": {
    "total": 150,
    "byStatus": {
      "new": 10,
      "confirmed": 15,
      "in_progress": 20,
      "fixed": 30,
      "verified": 25,
      "closed": 40,
      "reopened": 5,
      "wont_fix": 3,
      "duplicate": 2
    },
    "bySeverity": {
      "low": 30,
      "medium": 50,
      "high": 45,
      "critical": 25
    },
    "openBugs": 50,
    "closedBugs": 100,
    "averageResolutionTime": 72,
    "criticalOpen": 8,
    "resolutionRate": 66.7
  }
}
```

---

## Types

```typescript
type BugStatus = 'new' | 'confirmed' | 'in_progress' | 'fixed' | 
  'verified' | 'closed' | 'reopened' | 'wont_fix' | 'duplicate';

type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

type BugPriority = 'low' | 'medium' | 'high' | 'critical';

type BugPlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';

interface Bug {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: BugPriority;
  productId: string;
  productName?: string;
  platform: BugPlatform;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  reporterId: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  environment: string;
  version?: string;
  browserInfo?: string;
  retestResults: RetestResult[];
  duplicateOf?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface RetestResult {
  id: string;
  status: 'passed' | 'failed';
  testedBy: string;
  testedByName: string;
  notes?: string;
  environment: string;
  testedAt: string;
}

interface BugStatistics {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openBugs: number;
  closedBugs: number;
  averageResolutionTime: number;
  criticalOpen: number;
  resolutionRate: number;
}
```
