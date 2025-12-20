# Tasks API

## Overview

Manage tasks including CRUD operations, assignments, time tracking, subtasks, comments, and dependencies.

---

## Endpoints

### GET /tasks

List all tasks with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by status |
| type | string | No | Filter by type |
| priority | string | No | Filter by priority |
| featureId | string | No | Filter by feature |
| sprintId | string | No | Filter by sprint |
| assigneeId | string | No | Filter by assignee |
| search | string | No | Search query |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Implement login form",
      "description": "Create login form with validation",
      "status": "in_progress",
      "type": "frontend",
      "priority": "high",
      "featureId": "uuid",
      "featureTitle": "User Authentication",
      "sprintId": "uuid",
      "sprintName": "Sprint 5",
      "assigneeId": "uuid",
      "assigneeName": "John Doe",
      "assigneeAvatar": "https://...",
      "estimatedHours": 8,
      "loggedHours": 5,
      "dueDate": "2024-01-20T00:00:00Z",
      "completedAt": null,
      "subtasks": [
        { "id": "uuid", "title": "Design mockup", "completed": true, "completedAt": "..." }
      ],
      "dependencies": [
        { "taskId": "uuid", "taskTitle": "Setup API", "type": "blocked_by" }
      ],
      "labels": ["auth", "urgent"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /tasks/:id

Get task by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /tasks

Create a new task.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title |
| description | string | No | Task description |
| type | string | Yes | Task type |
| priority | string | Yes | Priority level |
| featureId | string | No | Parent feature ID |
| sprintId | string | No | Sprint ID |
| assigneeId | string | No | Assigned user ID |
| estimatedHours | number | No | Estimated hours |
| dueDate | string | No | Due date (ISO 8601) |
| labels | array | No | Task labels |

**Request:**
```json
{
  "title": "Create API endpoint",
  "description": "Build REST endpoint for user data",
  "type": "backend",
  "priority": "high",
  "featureId": "feature-uuid",
  "assigneeId": "user-uuid",
  "estimatedHours": 4,
  "labels": ["api", "backend"]
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

### PATCH /tasks/:id

Update a task.

**Roles:** `admin`, `moderator`, Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| type | string | No | Updated type |
| priority | string | No | Updated priority |
| estimatedHours | number | No | Updated estimate |
| labels | array | No | Updated labels |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### PATCH /tasks/:id/status

Update task status.

**Roles:** `admin`, `moderator`, Assignee

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |

**Request:**
```json
{
  "status": "in_review"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Status updated"
  }
}
```

---

### DELETE /tasks/:id

Delete a task.

**Roles:** `admin`, `moderator`

**Response (204):** No content

---

## Assignment Endpoints

### POST /tasks/:id/assign

Assign task to user.

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
    "message": "Task assigned successfully"
  }
}
```

---

### DELETE /tasks/:id/assign

Unassign task.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "message": "Task unassigned"
  }
}
```

---

## Time Tracking Endpoints

### GET /tasks/:id/time-logs

Get time logs for task.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "hours": 2.5,
      "date": "2024-01-15",
      "description": "Worked on form validation",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /tasks/:id/time-logs

Log time on task.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hours | number | Yes | Hours worked |
| date | string | Yes | Date of work |
| description | string | No | Work description |

**Request:**
```json
{
  "hours": 3.5,
  "date": "2024-01-15",
  "description": "Implemented form validation"
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

## Subtask Endpoints

### POST /tasks/:id/subtasks

Add subtask.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Subtask title |

**Request:**
```json
{
  "title": "Write unit tests"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Write unit tests",
    "completed": false,
    "completedAt": null
  }
}
```

---

### PATCH /tasks/:taskId/subtasks/:subtaskId

Update subtask.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| completed | boolean | No | Completion status |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /tasks/:taskId/subtasks/:subtaskId/toggle

Toggle subtask completion.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Write unit tests",
    "completed": true,
    "completedAt": "2024-01-15T14:00:00Z"
  }
}
```

---

### DELETE /tasks/:taskId/subtasks/:subtaskId

Delete subtask.

**Roles:** Authenticated

**Response (204):** No content

---

## Comment Endpoints

### GET /tasks/:id/comments

Get task comments.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Jane Smith",
      "userAvatar": "https://...",
      "content": "Great progress on this!",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": null
    }
  ]
}
```

---

### POST /tasks/:id/comments

Add comment.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Comment text |

**Request:**
```json
{
  "content": "Looking good, just needs minor fixes"
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

### PATCH /tasks/:taskId/comments/:commentId

Update comment.

**Roles:** Comment Author

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Updated content |

**Response (200):**
```json
{
  "data": {
    "message": "Comment updated"
  }
}
```

---

### DELETE /tasks/:taskId/comments/:commentId

Delete comment.

**Roles:** Comment Author, `admin`

**Response (204):** No content

---

## Dependency Endpoints

### POST /tasks/:id/dependencies

Add task dependency.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dependsOnTaskId | string | Yes | Dependent task ID |
| type | string | Yes | `blocks` or `blocked_by` |

**Request:**
```json
{
  "dependsOnTaskId": "task-uuid",
  "type": "blocked_by"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Dependency added"
  }
}
```

---

### DELETE /tasks/:taskId/dependencies/:dependencyTaskId

Remove dependency.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "message": "Dependency removed"
  }
}
```

---

## Types

```typescript
type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 
  'testing' | 'done' | 'blocked';

type TaskType = 'frontend' | 'backend' | 'mobile_android' | 'mobile_ios' | 
  'api' | 'design' | 'qa' | 'devops' | 'documentation' | 'other';

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

type DependencyType = 'blocks' | 'blocked_by';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  estimatedHours?: number;
  loggedHours: number;
  dueDate?: string;
  completedAt?: string | null;
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
  description?: string;
  createdAt: string;
}

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
```
