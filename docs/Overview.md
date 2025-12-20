# DevCycle API Documentation

## Overview

DevCycle is a comprehensive product development lifecycle management platform. This documentation covers all API endpoints, authentication, roles, and data flows.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All API requests (except login/signup) require a valid JWT Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Management
- Access tokens expire based on `expiresIn` value
- Refresh tokens can be used to obtain new access tokens
- Automatic token refresh is handled by the API client

## User Roles & Permissions

| Role | Level | Description |
|------|-------|-------------|
| `owner` | 4 | Full access to all resources and admin features |
| `admin` | 3 | Administrative access, can manage users and settings |
| `moderator` | 2 | Can moderate content, manage tasks and bugs |
| `user` | 1 | Basic access to assigned resources |

### Role Hierarchy
Higher level roles inherit all permissions from lower level roles.

## Standard Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO 8601 date"
  }
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... },
    "requestId": "uuid"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Success with no body) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## API Modules

| Module | Description |
|--------|-------------|
| [Auth](./Auth.md) | Authentication, user management, password reset |
| [Products](./Products.md) | Product CRUD, team management, statistics |
| [Features](./Features.md) | Feature requests, voting, approval workflows |
| [Tasks](./Tasks.md) | Task management, subtasks, time tracking, comments |
| [Bugs](./Bugs.md) | Bug tracking, retest results, statistics |
| [Sprints](./Sprints.md) | Sprint planning, metrics, retrospectives |
| [Releases](./Releases.md) | Release management, pipeline, deployments |
| [Team](./Team.md) | Team member management, invitations |
| [Settings](./Settings.md) | User settings, profile, notifications, 2FA |
| [Billing](./Billing.md) | Plans, subscriptions, invoices, payments |
| [Dashboard](./Dashboard.md) | Dashboard stats, activity feed, sprint summary |
| [Admin](./Admin.md) | Admin panel APIs (users, billing, reports, CORS) |

## Common Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search query |
| `sortBy` | string | Field to sort by |
| `sortOrder` | 'asc' \| 'desc' | Sort direction |

## Rate Limiting

API requests are rate limited. Check response headers for:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Window reset timestamp
