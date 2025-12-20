# Team API

## Overview

Manage team members including invitations, role updates, and team statistics.

---

## Endpoints

### GET /team

List all team members with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by status: `active`, `away`, `offline` |
| role | string | No | Filter by role |
| search | string | No | Search by name/email |
| sortBy | string | No | `name`, `joinedAt`, `tasksCompleted`, `prsMerged` |
| sortOrder | string | No | `asc` or `desc` |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "role": "senior_developer",
      "status": "active",
      "tasksCompleted": 45,
      "prsMerged": 120,
      "currentTasks": 3,
      "storyPoints": 250,
      "availability": 80,
      "joinedAt": "2023-06-01T00:00:00Z",
      "lastActiveAt": "2024-01-25T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### GET /team/:id

Get team member by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "role": "senior_developer",
    "status": "active",
    "tasksCompleted": 45,
    "prsMerged": 120,
    "currentTasks": 3,
    "storyPoints": 250,
    "availability": 80,
    "joinedAt": "2023-06-01T00:00:00Z",
    "lastActiveAt": "2024-01-25T14:30:00Z"
  }
}
```

---

### GET /team/stats

Get team statistics.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "totalMembers": 15,
    "activeMembers": 12,
    "tasksCompleted": 450,
    "prsMerged": 1200,
    "activeTasks": 35,
    "totalStoryPoints": 2500
  }
}
```

---

### POST /team/invite

Invite a new team member.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address to invite |
| role | string | Yes | Role to assign |
| message | string | No | Custom invitation message |

**Request:**
```json
{
  "email": "newmember@example.com",
  "role": "developer",
  "message": "Welcome to the team! Looking forward to working with you."
}
```

**Response (201):**
```json
{
  "data": {
    "message": "Invitation sent successfully"
  }
}
```

---

### PATCH /team/:id

Update team member.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | No | Updated role |
| status | string | No | Updated status |

**Request:**
```json
{
  "role": "tech_lead",
  "status": "active"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /team/:id

Remove team member.

**Roles:** `admin`, `owner`

**Response (204):** No content

---

### POST /team/:id/resend-invite

Resend invitation to pending member.

**Roles:** `admin`, `owner`

**Response (200):**
```json
{
  "data": {
    "message": "Invitation resent successfully"
  }
}
```

---

## Types

```typescript
type TeamMemberStatus = 'active' | 'away' | 'offline';

type TeamRole = 'admin' | 'tech_lead' | 'senior_developer' | 
  'developer' | 'junior_developer' | 'devops' | 'qa';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  tasksCompleted: number;
  prsMerged: number;
  currentTasks: number;
  storyPoints: number;
  availability: number;
  joinedAt: string;
  lastActiveAt: string;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  tasksCompleted: number;
  prsMerged: number;
  activeTasks: number;
  totalStoryPoints: number;
}

interface InviteTeamMemberRequest {
  email: string;
  role: TeamRole;
  message?: string;
}

interface UpdateTeamMemberRequest {
  role?: TeamRole;
  status?: TeamMemberStatus;
}
```
