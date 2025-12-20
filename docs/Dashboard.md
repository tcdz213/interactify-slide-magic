# Dashboard API

## Overview

Dashboard endpoints for statistics, activity feeds, and sprint summaries.

---

## Endpoints

### GET /dashboard/stats

Get dashboard overview statistics.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "activeSprints": 3,
    "pendingTasks": 45,
    "openBugs": 12,
    "upcomingReleases": 2,
    "teamAvailability": {
      "available": 8,
      "busy": 4,
      "away": 2,
      "offline": 1
    },
    "recentActivity": {
      "tasksCompletedToday": 15,
      "bugsFixedToday": 3,
      "featuresApprovedToday": 2
    }
  }
}
```

---

### GET /dashboard/activity

Get activity feed.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| type | string | No | Filter by type: `task`, `bug`, `feature`, `sprint`, `release` |

**Response (200):**
```json
{
  "data": {
    "data": [
      {
        "id": "uuid",
        "type": "task_completed",
        "userId": "uuid",
        "userName": "John Doe",
        "userAvatar": "https://...",
        "entityType": "task",
        "entityId": "task-uuid",
        "entityTitle": "Implement login form",
        "action": "completed",
        "timestamp": "2024-01-25T14:30:00Z"
      },
      {
        "id": "uuid",
        "type": "bug_fixed",
        "userId": "uuid",
        "userName": "Jane Smith",
        "userAvatar": "https://...",
        "entityType": "bug",
        "entityId": "bug-uuid",
        "entityTitle": "Login button not working",
        "action": "fixed",
        "timestamp": "2024-01-25T13:45:00Z"
      },
      {
        "id": "uuid",
        "type": "feature_approved",
        "userId": "uuid",
        "userName": "Bob Wilson",
        "userAvatar": "https://...",
        "entityType": "feature",
        "entityId": "feature-uuid",
        "entityTitle": "Dark Mode Support",
        "action": "approved",
        "timestamp": "2024-01-25T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET /dashboard/sprint-summary

Get active sprints summary.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "activeSprints": [
      {
        "id": "uuid",
        "name": "Sprint 5",
        "progress": 72,
        "tasksTotal": 25,
        "tasksCompleted": 18,
        "daysRemaining": 4,
        "velocity": 85,
        "teamMembers": 5
      },
      {
        "id": "uuid",
        "name": "Sprint 6",
        "progress": 35,
        "tasksTotal": 20,
        "tasksCompleted": 7,
        "daysRemaining": 12,
        "velocity": 70,
        "teamMembers": 4
      }
    ]
  }
}
```

---

## Types

```typescript
interface TeamAvailability {
  available: number;
  busy: number;
  away: number;
  offline: number;
}

interface RecentActivity {
  tasksCompletedToday: number;
  bugsFixedToday: number;
  featuresApprovedToday: number;
}

interface DashboardStats {
  activeSprints: number;
  pendingTasks: number;
  openBugs: number;
  upcomingReleases: number;
  teamAvailability: TeamAvailability;
  recentActivity: RecentActivity;
}

interface ActivityItem {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userAvatar: string;
  entityType: 'task' | 'bug' | 'feature' | 'sprint' | 'release';
  entityId: string;
  entityTitle: string;
  action: string;
  timestamp: string;
}

interface SprintSummary {
  id: string;
  name: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining: number;
  velocity: number;
  teamMembers: number;
}

interface ActivityFeedResponse {
  data: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SprintSummaryResponse {
  activeSprints: SprintSummary[];
}
```
