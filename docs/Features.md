# Features API

## Overview

Manage feature requests, voting system, sprint assignment, and approval workflows.

---

## Endpoints

### GET /features

List all features with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by status |
| priority | string | No | Filter by priority |
| productId | string | No | Filter by product |
| platform | string | No | Filter by platform |
| assigneeId | string | No | Filter by assignee |
| sprintId | string | No | Filter by sprint |
| search | string | No | Search query |
| sortBy | string | No | Sort field |
| sortOrder | string | No | `asc` or `desc` |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Dark Mode Support",
      "description": "Add dark mode theme option",
      "status": "development",
      "priority": "high",
      "productId": "uuid",
      "productName": "Mobile App",
      "platform": "ios",
      "requestedBy": "uuid",
      "requestedByName": "John Doe",
      "assigneeId": "uuid",
      "assigneeName": "Jane Smith",
      "sprintId": "uuid",
      "sprintName": "Sprint 5",
      "votes": 42,
      "votedBy": ["uuid1", "uuid2"],
      "estimatedHours": 40,
      "actualHours": 35,
      "dueDate": "2024-02-01T00:00:00Z",
      "completedAt": null,
      "tags": ["ui", "enhancement"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /features/:id

Get feature by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Dark Mode Support",
    ...
  }
}
```

---

### POST /features

Create a new feature request.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Feature title |
| description | string | Yes | Feature description |
| priority | string | Yes | `low`, `medium`, `high`, `critical` |
| productId | string | Yes | Product ID |
| tags | array | No | Feature tags |
| dueDate | string | No | Due date (ISO 8601) |

**Request:**
```json
{
  "title": "User Dashboard",
  "description": "Create a comprehensive user dashboard",
  "priority": "high",
  "productId": "product-uuid",
  "tags": ["ui", "dashboard"],
  "dueDate": "2024-03-01T00:00:00Z"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "title": "User Dashboard",
    "status": "idea",
    ...
  }
}
```

---

### PATCH /features/:id

Update a feature.

**Roles:** `admin`, `moderator`, Assignee, Requester

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| priority | string | No | Updated priority |
| estimatedHours | number | No | Estimated hours |
| tags | array | No | Updated tags |
| dueDate | string | No | Updated due date |
| assigneeId | string | No | Assign to user |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /features/:id

Delete a feature.

**Roles:** `admin`, `owner`, Requester

**Response (204):** No content

---

### PATCH /features/:id/status

Update feature status.

**Roles:** `admin`, `moderator`, Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |

**Request:**
```json
{
  "status": "development"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /features/:id/vote

Vote for a feature.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "votes": 43,
    "votedBy": ["uuid1", "uuid2", "uuid3"]
  }
}
```

---

### DELETE /features/:id/vote

Remove vote from feature.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "votes": 42,
    "votedBy": ["uuid1", "uuid2"]
  }
}
```

---

### POST /features/:id/assign-sprint

Assign feature to sprint.

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
    "message": "Feature assigned to sprint"
  }
}
```

---

### DELETE /features/:id/assign-sprint

Remove feature from sprint.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "message": "Feature removed from sprint"
  }
}
```

---

## Approval Workflow Endpoints

### GET /features/:id/approval-workflow

Get approval workflow for feature.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "featureId": "uuid",
    "status": "in_progress",
    "currentGateIndex": 1,
    "gates": [
      {
        "id": "uuid",
        "type": "design_review",
        "label": "Design Review",
        "order": 0,
        "status": "approved",
        "approvedBy": "uuid",
        "approvedByName": "Jane Smith",
        "approvedAt": "2024-01-10T00:00:00Z",
        "comments": []
      },
      {
        "id": "uuid",
        "type": "technical_review",
        "label": "Technical Review",
        "order": 1,
        "status": "pending",
        "comments": []
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z"
  }
}
```

---

### POST /features/:id/approval-workflow

Initialize approval workflow.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gates | array | No | Custom gates configuration |

**Request:**
```json
{
  "gates": [
    { "type": "design_review", "label": "Design Review", "order": 0 },
    { "type": "technical_review", "label": "Tech Review", "order": 1 },
    { "type": "security_review", "label": "Security Review", "order": 2 }
  ]
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

### POST /features/:id/approval-workflow/approve

Approve a gate.

**Roles:** `admin`, `moderator`, Gate Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gateId | string | Yes | Gate ID to approve |

**Request:**
```json
{
  "gateId": "gate-uuid"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /features/:id/approval-workflow/reject

Reject a gate.

**Roles:** `admin`, `moderator`, Gate Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gateId | string | Yes | Gate ID |
| reason | string | Yes | Rejection reason |

**Request:**
```json
{
  "gateId": "gate-uuid",
  "reason": "Does not meet security requirements"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /features/:id/approval-workflow/request-changes

Request changes on a gate.

**Roles:** `admin`, `moderator`, Gate Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gateId | string | Yes | Gate ID |
| comment | string | Yes | Change request details |

**Request:**
```json
{
  "gateId": "gate-uuid",
  "comment": "Please update the design mockups"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /features/:id/approval-workflow/reset

Reset a gate (admin only).

**Roles:** `admin`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gateId | string | Yes | Gate ID to reset |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Types

```typescript
type FeatureStatus = 'idea' | 'review' | 'approved' | 'planning' | 
  'design' | 'development' | 'testing' | 'release' | 'live' | 'rejected';

type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';

type FeaturePlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';

type GateType = 'design_review' | 'technical_review' | 
  'security_review' | 'release_approval';

type GateStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

type WorkflowStatus = 'in_progress' | 'completed' | 'rejected';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: FeaturePriority;
  productId: string;
  productName: string;
  platform?: FeaturePlatform;
  requestedBy: string;
  requestedByName: string;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  sprintName?: string;
  votes: number;
  votedBy: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApprovalWorkflow {
  id: string;
  featureId: string;
  status: WorkflowStatus;
  currentGateIndex: number;
  gates: ApprovalGate[];
  createdAt: string;
  updatedAt: string;
}

interface ApprovalGate {
  id: string;
  type: GateType;
  label: string;
  order: number;
  status: GateStatus;
  assignedTo?: string;
  assignedToName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  comments: GateComment[];
}
```
