# Releases API

## Overview

Manage releases including pipeline management, deployments, rollbacks, release notes, and approval workflows.

---

## Endpoints

### GET /releases

List all releases with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by status |
| productId | string | No | Filter by product |
| platform | string | No | Filter by platform |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "version": "1.2.0",
      "buildId": "build-12345",
      "productId": "uuid",
      "productName": "Mobile App",
      "platform": "ios",
      "status": "testing",
      "releaseDate": null,
      "plannedDate": "2024-02-01T00:00:00Z",
      "features": [
        { "featureId": "uuid", "featureTitle": "Dark Mode" }
      ],
      "bugFixes": [
        { "bugId": "uuid", "bugTitle": "Login fix" }
      ],
      "testCoverage": 85,
      "pipeline": [
        { "stage": "build", "status": "passed", ... },
        { "stage": "test", "status": "running", ... }
      ],
      "rollbackLogs": [],
      "releaseNotes": "## What's New\n- Dark mode support",
      "approvalStatus": "pending",
      "approvers": [],
      "createdAt": "2024-01-20T00:00:00Z",
      "updatedAt": "2024-01-25T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /releases/:id

Get release by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /releases

Create a new release.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | Yes | Version number |
| buildId | string | Yes | Build identifier |
| productId | string | Yes | Product ID |
| platform | string | Yes | Target platform |
| plannedDate | string | No | Planned release date |
| releaseNotes | string | No | Initial release notes |

**Request:**
```json
{
  "version": "1.3.0",
  "buildId": "build-12346",
  "productId": "product-uuid",
  "platform": "web",
  "plannedDate": "2024-02-15T00:00:00Z",
  "releaseNotes": "## Features\n- TBD"
}
```

**Response (201):**
```json
{
  "data": { ... }
}
```

---

### PATCH /releases/:id

Update a release.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | No | Updated version |
| buildId | string | No | Updated build ID |
| plannedDate | string | No | Updated planned date |
| releaseNotes | string | No | Updated release notes |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /releases/:id

Delete a release.

**Roles:** `admin`

**Response (204):** No content

---

### PATCH /releases/:id/status

Update release status.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |

**Request:**
```json
{
  "status": "staged"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Pipeline Endpoints

### GET /releases/:id/pipeline

Get release pipeline.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "stage": "build",
      "status": "passed",
      "startedAt": "2024-01-20T10:00:00Z",
      "completedAt": "2024-01-20T10:15:00Z",
      "logs": "Build completed successfully"
    },
    {
      "stage": "test",
      "status": "running",
      "startedAt": "2024-01-20T10:16:00Z",
      "completedAt": null,
      "logs": null
    },
    {
      "stage": "deploy",
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "logs": null
    }
  ]
}
```

---

### POST /releases/:id/pipeline/:stage/start

Start a pipeline stage.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "stage": "deploy",
    "status": "running",
    ...
  }
}
```

---

### POST /releases/:id/pipeline/:stage/complete

Complete a pipeline stage.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Whether stage succeeded |
| notes | string | No | Completion notes |

**Request:**
```json
{
  "success": true,
  "notes": "All tests passed"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /releases/:id/pipeline/:stage/retry

Retry a failed pipeline stage.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Deployment Endpoints

### POST /releases/:id/deploy

Deploy release.

**Roles:** `admin`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| environment | string | Yes | `staging` or `production` |

**Request:**
```json
{
  "environment": "staging"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Deployment initiated"
  }
}
```

---

### POST /releases/:id/rollback

Rollback release.

**Roles:** `admin`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Rollback reason |
| targetVersion | string | Yes | Version to rollback to |

**Request:**
```json
{
  "reason": "Critical bug discovered in production",
  "targetVersion": "1.1.0"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### GET /releases/:id/rollbacks

Get rollback history.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "version": "1.2.0",
      "reason": "Critical bug discovered",
      "rolledBackAt": "2024-01-26T15:00:00Z",
      "rolledBackBy": "uuid",
      "notes": "Rolled back to 1.1.0"
    }
  ]
}
```

---

## Release Notes Endpoints

### PATCH /releases/:id/notes

Update release notes.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| notes | string | Yes | Release notes content |

**Request:**
```json
{
  "notes": "## What's New\n- Dark mode\n- Performance improvements\n\n## Bug Fixes\n- Login issue resolved"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /releases/:id/notes/generate

Auto-generate release notes.

**Roles:** `admin`, `moderator`

**Response (200):**
```json
{
  "data": {
    "data": {
      "notes": "## Version 1.2.0\n\n### New Features\n- Dark Mode Support (#123)\n\n### Bug Fixes\n- Fixed login issue (#456)"
    }
  }
}
```

---

### GET /releases/:id/notes/export

Export release notes.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | `markdown`, `html`, or `pdf` |

**Response (200):**
```json
{
  "data": {
    "data": {
      "downloadUrl": "https://storage.example.com/notes/release-1.2.0.pdf",
      "expiresAt": "2024-01-27T10:00:00Z"
    }
  }
}
```

---

## Feature/Bug Linking Endpoints

### POST /releases/:id/features

Link feature to release.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| featureId | string | Yes | Feature ID |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /releases/:id/features/:featureId

Unlink feature from release.

**Roles:** `admin`, `moderator`

**Response (204):** No content

---

### POST /releases/:id/bugs

Link bug fix to release.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bugId | string | Yes | Bug ID |

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### DELETE /releases/:id/bugs/:bugId

Unlink bug fix from release.

**Roles:** `admin`, `moderator`

**Response (204):** No content

---

## Approval Endpoints

### POST /releases/:id/approval/request

Request approval for release.

**Roles:** `admin`, `moderator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| approvers | array | Yes | User IDs of approvers |

**Request:**
```json
{
  "approvers": ["user-uuid-1", "user-uuid-2"]
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /releases/:id/approval/approve

Approve release.

**Roles:** Designated Approver

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| comment | string | No | Approval comment |

**Request:**
```json
{
  "comment": "LGTM, approved for release"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### POST /releases/:id/approval/reject

Reject release.

**Roles:** Designated Approver

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Rejection reason |

**Request:**
```json
{
  "reason": "Missing security review"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

### GET /releases/:id/approval

Get approval status.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "data": {
      "status": "pending",
      "approvers": [
        {
          "userId": "uuid",
          "userName": "John Doe",
          "status": "approved",
          "comment": "LGTM",
          "approvedAt": "2024-01-25T10:00:00Z"
        },
        {
          "userId": "uuid",
          "userName": "Jane Smith",
          "status": "pending",
          "comment": null,
          "approvedAt": null
        }
      ]
    }
  }
}
```

---

## Types

```typescript
type ReleaseStatus = 'planning' | 'scheduled' | 'in_development' | 
  'testing' | 'staged' | 'released' | 'rolled_back';

type ReleasePlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

type PipelineStageStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

interface Release {
  id: string;
  version: string;
  buildId: string;
  productId: string;
  productName: string;
  platform: ReleasePlatform;
  status: ReleaseStatus;
  releaseDate: string | null;
  plannedDate: string | null;
  features: LinkedFeature[];
  bugFixes: LinkedBugFix[];
  testCoverage: number;
  pipeline: PipelineStep[];
  rollbackLogs: RollbackLog[];
  releaseNotes: string;
  approvalStatus: ApprovalStatus;
  approvers: Approver[];
  createdAt: string;
  updatedAt: string;
}

interface PipelineStep {
  stage: string;
  status: PipelineStageStatus;
  startedAt: string | null;
  completedAt: string | null;
  logs: string | null;
}

interface RollbackLog {
  id: string;
  version: string;
  reason: string;
  rolledBackAt: string;
  rolledBackBy: string;
  notes: string | null;
}

interface Approver {
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  approvedAt: string | null;
}
```
