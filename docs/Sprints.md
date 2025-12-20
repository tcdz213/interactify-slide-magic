# Sprints API

## Overview

Manage sprints including planning, task/bug management, metrics, and retrospectives.

---

## Endpoints

### GET /sprints

List all sprints with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string/array | No | Filter by status(es) |
| productId | string | No | Filter by product |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Sprint 5",
      "goal": "Complete user authentication module",
      "productId": "uuid",
      "productName": "Web App",
      "status": "active",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-29T00:00:00Z",
      "taskIds": ["task-uuid-1", "task-uuid-2"],
      "bugIds": ["bug-uuid-1"],
      "capacity": 100,
      "velocity": 85,
      "retrospective": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /sprints/:id

Get sprint by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /sprints

Create a new sprint.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Sprint name |
| goal | string | Yes | Sprint goal |
| productId | string | Yes | Product ID |
| startDate | string | Yes | Start date (ISO 8601) |
| endDate | string | Yes | End date (ISO 8601) |
| capacity | number | No | Team capacity in points |

**Request:**
```json
{
  "name": "Sprint 6",
  "goal": "Implement payment integration",
  "productId": "product-uuid",
  "startDate": "2024-01-29T00:00:00Z",
  "endDate": "2024-02-12T00:00:00Z",
  "capacity": 80
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Sprint 6",
    "status": "planning",
    ...
  }
}
```

---

### PATCH /sprints/:id

Update a sprint.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Updated name |
| goal | string | No | Updated goal |
| startDate | string | No | Updated start date |
| endDate | string | No | Updated end date |
| capacity | number | No | Updated capacity |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /sprints/:id/start

Start a sprint.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "status": "active",
    ...
  }
}
```

---

### POST /sprints/:id/complete

Complete a sprint.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "status": "completed",
    ...
  }
}
```

---

### DELETE /sprints/:id

Delete a sprint.

**Roles:** `admin`

**Response (204):** No content

---

## Task Management Endpoints

### GET /sprints/:id/tasks

Get tasks in sprint.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": ["task-uuid-1", "task-uuid-2", "task-uuid-3"]
}
```

---

### POST /sprints/:id/tasks

Add task to sprint.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taskId | string | Yes | Task ID |

**Request:**
```json
{
  "taskId": "task-uuid"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /sprints/:id/tasks/:taskId

Remove task from sprint.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Bug Management Endpoints

### GET /sprints/:id/bugs

Get bugs in sprint.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": ["bug-uuid-1", "bug-uuid-2"]
}
```

---

### POST /sprints/:id/bugs

Add bug to sprint.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bugId | string | Yes | Bug ID |

**Request:**
```json
{
  "bugId": "bug-uuid"
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

### DELETE /sprints/:id/bugs/:bugId

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

## Metrics & Retrospective Endpoints

### GET /sprints/:id/metrics

Get sprint metrics.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "totalTasks": 25,
    "completedTasks": 18,
    "totalBugs": 8,
    "fixedBugs": 5,
    "totalPoints": 100,
    "completedPoints": 72,
    "blockedItems": 2,
    "burndownData": [
      { "date": "2024-01-15", "remaining": 100, "ideal": 100 },
      { "date": "2024-01-16", "remaining": 95, "ideal": 93 },
      { "date": "2024-01-17", "remaining": 88, "ideal": 86 }
    ],
    "velocityTrend": [75, 80, 85, 72]
  }
}
```

---

### GET /sprints/:id/retrospective

Get sprint retrospective.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "wentWell": [
      "Team collaboration was excellent",
      "Met all critical deadlines"
    ],
    "needsImprovement": [
      "Code review turnaround time",
      "Documentation quality"
    ],
    "actionItems": [
      "Set up automated code review reminders",
      "Create documentation templates"
    ],
    "savedAt": "2024-01-29T10:00:00Z",
    "savedBy": "uuid",
    "savedByName": "John Doe"
  }
}
```

---

### POST /sprints/:id/retrospective

Save sprint retrospective.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| wentWell | array | Yes | What went well |
| needsImprovement | array | Yes | What needs improvement |
| actionItems | array | Yes | Action items |

**Request:**
```json
{
  "wentWell": [
    "Great teamwork",
    "Early delivery"
  ],
  "needsImprovement": [
    "Testing coverage",
    "Communication"
  ],
  "actionItems": [
    "Increase test coverage to 80%",
    "Daily standups"
  ]
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Types

```typescript
type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  productId: string;
  productName?: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  taskIds: string[];
  bugIds: string[];
  capacity: number;
  velocity: number | null;
  retrospective: SprintRetrospective | null;
  createdAt: string;
  updatedAt: string;
}

interface SprintRetrospective {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  savedAt: string;
  savedBy: string;
  savedByName: string;
}

interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  totalBugs: number;
  fixedBugs: number;
  totalPoints: number;
  completedPoints: number;
  blockedItems: number;
  burndownData: BurndownDataPoint[];
  velocityTrend: number[];
}

interface BurndownDataPoint {
  date: string;
  remaining: number;
  ideal: number;
}
```
