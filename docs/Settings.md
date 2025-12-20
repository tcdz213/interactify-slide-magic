# Settings API

## Overview

Manage user settings, profile, notification preferences, and two-factor authentication.

---

## User Settings Endpoints

### GET /users/me/settings

Get user settings.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "theme": "dark",
    "language": "en",
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "weekStartsOn": 0,
    "emailNotifications": true,
    "pushNotifications": true,
    "compactMode": false
  }
}
```

---

### PATCH /users/me/settings

Update user settings.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| theme | string | No | `light`, `dark`, `system` |
| language | string | No | Language code |
| timezone | string | No | Timezone identifier |
| dateFormat | string | No | Date format string |
| weekStartsOn | number | No | `0` (Sunday), `1` (Monday), `6` (Saturday) |
| emailNotifications | boolean | No | Email notifications enabled |
| pushNotifications | boolean | No | Push notifications enabled |
| compactMode | boolean | No | Compact UI mode |

**Request:**
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "Europe/London",
  "emailNotifications": false
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## User Profile Endpoints

### GET /users/me/profile

Get user profile.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "phone": "+1234567890",
    "title": "Senior Developer",
    "bio": "Passionate about building great software"
  }
}
```

---

### PATCH /users/me/profile

Update user profile.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Display name |
| avatar | string | No | Avatar URL |
| phone | string | No | Phone number |
| title | string | No | Job title |
| bio | string | No | User bio |

**Request:**
```json
{
  "name": "John Updated",
  "title": "Lead Developer",
  "bio": "Building amazing products"
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Notification Preferences Endpoints

### GET /users/me/notifications

Get notification preferences.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "taskAssigned": true,
    "taskCompleted": true,
    "bugReported": true,
    "bugResolved": true,
    "featureApproved": true,
    "releaseDeployed": true,
    "sprintStarted": true,
    "sprintCompleted": true,
    "mentionedInComment": true,
    "weeklyDigest": false
  }
}
```

---

### PATCH /users/me/notifications

Update notification preferences.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taskAssigned | boolean | No | Notify on task assignment |
| taskCompleted | boolean | No | Notify on task completion |
| bugReported | boolean | No | Notify on bug reports |
| bugResolved | boolean | No | Notify on bug resolution |
| featureApproved | boolean | No | Notify on feature approval |
| releaseDeployed | boolean | No | Notify on release deployment |
| sprintStarted | boolean | No | Notify on sprint start |
| sprintCompleted | boolean | No | Notify on sprint completion |
| mentionedInComment | boolean | No | Notify on mentions |
| weeklyDigest | boolean | No | Weekly summary email |

**Request:**
```json
{
  "taskAssigned": true,
  "weeklyDigest": true
}
```

**Response (200):**
```json
{
  "data": { ... }
}
```

---

## Security Endpoints

### POST /users/me/password

Change password.

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

## Two-Factor Authentication Endpoints

### POST /users/me/2fa/enable

Enable 2FA and get setup info.

**Roles:** Authenticated

**Response (200):**
```json
{
  "data": {
    "qrCode": "data:image/png;base64,...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "12345678",
      "87654321",
      "11111111",
      "22222222",
      "33333333"
    ]
  }
}
```

---

### POST /users/me/2fa/verify

Verify 2FA setup with code.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | 6-digit TOTP code |

**Request:**
```json
{
  "code": "123456"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Two-factor authentication enabled"
  }
}
```

---

### POST /users/me/2fa/disable

Disable 2FA.

**Roles:** Authenticated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | Account password |

**Request:**
```json
{
  "password": "currentPassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Two-factor authentication disabled"
  }
}
```

---

## Types

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  weekStartsOn: 0 | 1 | 6;
  emailNotifications: boolean;
  pushNotifications: boolean;
  compactMode: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  title?: string;
  bio?: string;
}

interface NotificationPreferences {
  taskAssigned: boolean;
  taskCompleted: boolean;
  bugReported: boolean;
  bugResolved: boolean;
  featureApproved: boolean;
  releaseDeployed: boolean;
  sprintStarted: boolean;
  sprintCompleted: boolean;
  mentionedInComment: boolean;
  weeklyDigest: boolean;
}

interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```
