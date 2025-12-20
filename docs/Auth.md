# Authentication API

## Overview

Handles user authentication, registration, password management, and session control.

---

## Endpoints

### POST /auth/login

Login with email and password.

**Roles:** Public

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "emailVerified": true,
      "workspaceId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt...",
      "refreshToken": "jwt...",
      "expiresIn": 3600
    }
  }
}
```

---

### POST /auth/signup

Register a new user account.

**Roles:** Public

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password (min 8 chars) |
| name | string | Yes | User display name |
| workspaceName | string | No | Name for new workspace |

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "workspaceName": "My Workspace"
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "name": "Jane Doe",
      "avatar": null,
      "emailVerified": false,
      "workspaceId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt...",
      "refreshToken": "jwt...",
      "expiresIn": 3600
    }
  }
}
```

---

### GET /auth/me

Get current authenticated user profile with role.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "emailVerified": true,
    "workspaceId": "uuid",
    "role": "admin",
    "permissions": ["manage_users", "create_products"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /auth/me/roles

Get all roles assigned to current user.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### PATCH /auth/me

Update current user profile.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Updated display name |
| avatar | string | No | Avatar URL |

**Request:**
```json
{
  "name": "John Updated",
  "avatar": "https://new-avatar.com/img.png"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Updated",
    "avatar": "https://new-avatar.com/img.png",
    "emailVerified": true,
    "workspaceId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /auth/password/change

Change password for authenticated user.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password (min 8 chars) |

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Roles:** Public

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Valid refresh token |

**Request:**
```json
{
  "refreshToken": "jwt..."
}
```

**Response (200):**
```json
{
  "data": {
    "accessToken": "new-jwt...",
    "refreshToken": "new-refresh-jwt...",
    "expiresIn": 3600
  }
}
```

---

### POST /auth/password/reset-request

Request password reset email.

**Roles:** Public

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "If an account exists with this email, a reset link will be sent."
  }
}
```

---

### POST /auth/password/reset

Reset password with token.

**Roles:** Public

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Password reset token |
| newPassword | string | Yes | New password |

**Request:**
```json
{
  "token": "reset-token...",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password reset successful"
  }
}
```

---

### POST /auth/verify-email

Verify email with token.

**Roles:** Public

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Email verification token |

**Request:**
```json
{
  "token": "verification-token..."
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Email verified successfully"
  }
}
```

---

### POST /auth/logout

Logout and invalidate session.

**Roles:** Authenticated

**Response (204):** No content

---

## Types

```typescript
type UserRole = 'owner' | 'admin' | 'moderator' | 'user';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserWithRole extends User {
  role: UserRole;
  permissions: string[];
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```
