# Products API

## Overview

Manage products including CRUD operations, team management, and statistics.

---

## Endpoints

### GET /products

List all products with filtering and pagination.

**Roles:** Authenticated

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| status | string | No | Filter by status: `active`, `archived` |
| platform | string | No | Filter by platform |
| search | string | No | Search in name/description |
| sortBy | string | No | Sort field: `name`, `createdAt`, `updatedAt` |
| sortOrder | string | No | Sort direction: `asc`, `desc` |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Mobile App",
      "description": "Our flagship mobile application",
      "platforms": ["android", "ios"],
      "ownerId": "uuid",
      "ownerName": "John Doe",
      "status": "active",
      "featuresCount": 25,
      "bugsCount": 8,
      "teamMembersCount": 5,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /products/:id

Get product by ID.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Mobile App",
    "description": "Our flagship mobile application",
    "platforms": ["android", "ios"],
    "ownerId": "uuid",
    "ownerName": "John Doe",
    "status": "active",
    "featuresCount": 25,
    "bugsCount": 8,
    "teamMembersCount": 5,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

---

### POST /products

Create a new product.

**Roles:** `admin`, `owner`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | Yes | Product description |
| platforms | array | Yes | Target platforms |

**Request:**
```json
{
  "name": "New Web App",
  "description": "A revolutionary web application",
  "platforms": ["web", "api"]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "New Web App",
    "description": "A revolutionary web application",
    "platforms": ["web", "api"],
    "ownerId": "uuid",
    "ownerName": "John Doe",
    "status": "active",
    "featuresCount": 0,
    "bugsCount": 0,
    "teamMembersCount": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PATCH /products/:id

Update a product.

**Roles:** `admin`, `owner`, Product Owner

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Updated name |
| description | string | No | Updated description |
| platforms | array | No | Updated platforms |

**Request:**
```json
{
  "name": "Updated App Name",
  "description": "Updated description",
  "platforms": ["web", "api", "desktop"]
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Updated App Name",
    ...
  }
}
```

---

### DELETE /products/:id

Delete a product.

**Roles:** `admin`, `owner`, Product Owner

**Response (204):** No content

---

### GET /products/:id/stats

Get product statistics.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "totalFeatures": 50,
    "activeFeatures": 15,
    "completedFeatures": 30,
    "openBugs": 12,
    "resolvedBugs": 45,
    "activeSprintsCount": 2,
    "teamMembersCount": 8,
    "lastActivityAt": "2024-01-15T14:30:00Z"
  }
}
```

---

### GET /products/:id/team

Get product team members.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "userAvatar": "https://...",
      "role": "developer",
      "joinedAt": "2024-01-05T00:00:00Z"
    }
  ]
}
```

---

### POST /products/:id/team

Add team member to product.

**Roles:** `admin`, `owner`, Product Owner

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID to add |
| role | string | Yes | Role in product |

**Request:**
```json
{
  "userId": "user-uuid",
  "role": "developer"
}
```

**Response (201):**
```json
{
  "data": {
    "message": "Team member added successfully"
  }
}
```

---

### DELETE /products/:id/team/:userId

Remove team member from product.

**Roles:** `admin`, `owner`, Product Owner

**Response (204):** No content

---

## Types

```typescript
type ProductPlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';
type ProductStatus = 'active' | 'archived';

interface Product {
  id: string;
  name: string;
  description: string;
  platforms: ProductPlatform[];
  ownerId: string;
  ownerName: string;
  status: ProductStatus;
  featuresCount: number;
  bugsCount: number;
  teamMembersCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  totalFeatures: number;
  activeFeatures: number;
  completedFeatures: number;
  openBugs: number;
  resolvedBugs: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  lastActivityAt: string;
}

interface ProductTeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: string;
  joinedAt: string;
}
```
