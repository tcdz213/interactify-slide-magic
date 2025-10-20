# Reports API Documentation

## Overview
The Reports API allows authenticated users to report business cards for various issues such as inappropriate content, incorrect information, spam, or copyright violations. Reports are reviewed by administrators to maintain platform quality and safety.

---

## Endpoints

### 1. Submit a Report

**Method:** `POST`  
**URL:** `/api/reports`  
**Authentication:** Required

#### Request Body
```json
{
  "card_id": "507f1f77bcf86cd799439011",
  "report_type": "inappropriate",
  "details": "This business card contains offensive language in the description."
}
```

#### Request Example
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_id": "507f1f77bcf86cd799439011",
  "report_type": "inappropriate",
  "details": "This business card contains offensive language in the description."
}
```

#### Response (201 Created)
```json
{
  "report": {
    "id": "507f1f77bcf86cd799439013",
    "card_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "report_type": "inappropriate",
    "details": "This business card contains offensive language in the description.",
    "status": "pending",
    "created_at": "2025-10-20T10:30:00.000Z",
    "updated_at": "2025-10-20T10:30:00.000Z"
  },
  "message": "Report submitted successfully. Thank you for helping us improve the platform."
}
```

#### Error Responses

**400 Bad Request** - Invalid data
```json
{
  "error": "ValidationError",
  "message": "Invalid report type. Must be one of: inappropriate, incorrect, spam, copyright, other"
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found** - Business card not found
```json
{
  "error": "NotFoundError",
  "message": "Business card not found"
}
```

**409 Conflict** - Already reported
```json
{
  "error": "ConflictError",
  "message": "You have already reported this business card"
}
```

---

### 2. Get User's Reports

**Method:** `GET`  
**URL:** `/api/reports/user`  
**Authentication:** Required

#### Request Example
```http
GET /api/reports/user
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "reports": [
    {
      "id": "507f1f77bcf86cd799439013",
      "card_id": "507f1f77bcf86cd799439011",
      "card_title": "John's Business",
      "user_id": "507f1f77bcf86cd799439012",
      "report_type": "inappropriate",
      "details": "This business card contains offensive language.",
      "status": "pending",
      "created_at": "2025-10-20T10:30:00.000Z",
      "updated_at": "2025-10-20T10:30:00.000Z"
    }
  ],
  "total": 5
}
```

#### Error Response (401 Unauthorized)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

### 3. Get Report by ID

**Method:** `GET`  
**URL:** `/api/reports/:reportId`  
**Authentication:** Required (must be report owner or admin)

#### Request Example
```http
GET /api/reports/507f1f77bcf86cd799439013
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "report": {
    "id": "507f1f77bcf86cd799439013",
    "card_id": "507f1f77bcf86cd799439011",
    "card_title": "John's Business",
    "user_id": "507f1f77bcf86cd799439012",
    "user_name": "Jane Doe",
    "user_email": "jane@example.com",
    "report_type": "inappropriate",
    "details": "This business card contains offensive language.",
    "status": "pending",
    "created_at": "2025-10-20T10:30:00.000Z",
    "updated_at": "2025-10-20T10:30:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden** - Not authorized
```json
{
  "error": "Forbidden",
  "message": "You can only view your own reports"
}
```

**404 Not Found** - Report doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Report not found"
}
```

---

### 4. Delete Report

**Method:** `DELETE`  
**URL:** `/api/reports/:reportId`  
**Authentication:** Required (must be report owner)

#### Request Example
```http
DELETE /api/reports/507f1f77bcf86cd799439013
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "message": "Report deleted successfully"
}
```

#### Error Responses

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden** - Not the report owner
```json
{
  "error": "Forbidden",
  "message": "You can only delete your own reports"
}
```

**404 Not Found** - Report doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Report not found"
}
```

---

## Admin Endpoints

### 5. Get All Reports (Admin)

**Method:** `GET`  
**URL:** `/api/admin/reports`  
**Authentication:** Required (Admin role)

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 50) |
| status | string | No | Filter by status: all, pending, resolved, dismissed |
| report_type | string | No | Filter by type: all, inappropriate, incorrect, spam, copyright, other |

#### Request Example
```http
GET /api/admin/reports?page=1&limit=50&status=pending
Authorization: Bearer <admin_token>
```

#### Response (200 OK)
```json
{
  "reports": [
    {
      "id": "507f1f77bcf86cd799439013",
      "card_id": "507f1f77bcf86cd799439011",
      "card_title": "John's Business",
      "user_id": "507f1f77bcf86cd799439012",
      "user_name": "Jane Doe",
      "user_email": "jane@example.com",
      "report_type": "inappropriate",
      "details": "This business card contains offensive language.",
      "status": "pending",
      "created_at": "2025-10-20T10:30:00.000Z",
      "updated_at": "2025-10-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_reports": 250,
    "per_page": 50
  },
  "stats": {
    "pending": 120,
    "resolved": 100,
    "dismissed": 30
  }
}
```

---

### 6. Update Report Status (Admin)

**Method:** `PATCH`  
**URL:** `/api/admin/reports/:reportId/status`  
**Authentication:** Required (Admin role)

#### Request Body
```json
{
  "status": "resolved",
  "admin_notes": "Issue verified and card has been flagged for review"
}
```

#### Request Example
```http
PATCH /api/admin/reports/507f1f77bcf86cd799439013/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "resolved",
  "admin_notes": "Issue verified and card has been flagged for review"
}
```

#### Response (200 OK)
```json
{
  "report": {
    "id": "507f1f77bcf86cd799439013",
    "card_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "report_type": "inappropriate",
    "details": "This business card contains offensive language.",
    "status": "resolved",
    "admin_notes": "Issue verified and card has been flagged for review",
    "resolved_by": "507f1f77bcf86cd799439020",
    "resolved_at": "2025-10-20T12:45:00.000Z",
    "created_at": "2025-10-20T10:30:00.000Z",
    "updated_at": "2025-10-20T12:45:00.000Z"
  },
  "message": "Report status updated successfully"
}
```

---

## Data Models

### Report Object
```typescript
interface Report {
  id: string                    // Unique report identifier
  card_id: string              // Business card being reported
  user_id: string              // ID of user who submitted report
  report_type: ReportType      // Type of report
  details?: string             // Additional details about the issue
  status: ReportStatus         // Current status of report
  admin_notes?: string         // Notes from admin (admin only)
  resolved_by?: string         // Admin who resolved (admin only)
  resolved_at?: string         // Resolution timestamp (admin only)
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
}

type ReportType = 
  | 'inappropriate'  // Offensive or inappropriate content
  | 'incorrect'      // Incorrect business information
  | 'spam'          // Spam or fake business
  | 'copyright'     // Copyright violations
  | 'other'         // Other issues

type ReportStatus = 
  | 'pending'       // Awaiting admin review
  | 'resolved'      // Issue resolved/action taken
  | 'dismissed'     // Report dismissed as invalid
```

---

## Validation Rules

### Create Report
- **card_id**: Required, valid business card ID
- **report_type**: Required, must be one of: inappropriate, incorrect, spam, copyright, other
- **details**: Optional, string, max 500 characters

### Update Status (Admin)
- **status**: Required, must be one of: pending, resolved, dismissed
- **admin_notes**: Optional, string, max 1000 characters

---

## Rate Limiting
- **Report submission**: 10 reports per hour per user
- **Get reports**: 100 requests per minute per user
- **Admin endpoints**: 500 requests per minute per admin

---

## Best Practices

1. **Clear Details**: Encourage users to provide specific details about the issue
2. **Duplicate Prevention**: Check if user has already reported the same card
3. **Status Updates**: Keep users informed of report status via notifications
4. **Privacy**: Don't expose reporter identity to card owners
5. **Moderation**: Review reports promptly to maintain platform quality
6. **False Reports**: Track users who submit false reports frequently

---

## Example Usage in Frontend

```typescript
import { reportsApi } from '@/services/reportsApi'

// Submit a report
const submitReport = async (cardId: string, type: string, details: string) => {
  try {
    const report = await reportsApi.createReport({
      card_id: cardId,
      report_type: type,
      details: details
    });
    
    toast({
      title: "Report submitted",
      description: "Thank you for helping us improve the platform"
    });
  } catch (error) {
    toast({
      title: "Failed to submit report",
      description: error.message,
      variant: "destructive"
    });
  }
};

// Get user's reports
const loadMyReports = async () => {
  try {
    const reports = await reportsApi.getUserReports();
    setReports(reports);
  } catch (error) {
    console.error('Failed to load reports:', error);
  }
};

// Delete a report
const deleteMyReport = async (reportId: string) => {
  try {
    await reportsApi.deleteReport(reportId);
    toast({
      title: "Report deleted",
      description: "Your report has been removed"
    });
  } catch (error) {
    toast({
      title: "Failed to delete report",
      variant: "destructive"
    });
  }
};
```

---

## Notes

1. **Anonymous Reports**: Reports must be submitted by authenticated users
2. **One per Card**: Users can only submit one report per business card
3. **No Editing**: Reports cannot be edited after submission
4. **Automatic Flagging**: Cards with multiple reports may be automatically flagged
5. **User Notifications**: Users are notified when their reports are reviewed
6. **Appeal Process**: Card owners can appeal if their card is flagged based on reports
