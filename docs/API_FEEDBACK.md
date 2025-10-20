# Feedback API Documentation

## Overview
The Feedback API allows authenticated users to provide feedback about business cards, suggest improvements, report bugs, or ask questions. Feedback helps improve the platform and individual business card quality.

---

## Endpoints

### 1. Submit Feedback

**Method:** `POST`  
**URL:** `/api/feedback`  
**Authentication:** Required

#### Request Body
```json
{
  "card_id": "507f1f77bcf86cd799439011",
  "feedback_type": "improvement",
  "subject": "Add More Contact Options",
  "message": "It would be great to have WhatsApp and Telegram contact options on the business card.",
  "email": "user@example.com",
  "rating": 4
}
```

#### Request Example
```http
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_id": "507f1f77bcf86cd799439011",
  "feedback_type": "improvement",
  "subject": "Add More Contact Options",
  "message": "It would be great to have WhatsApp and Telegram contact options.",
  "email": "user@example.com",
  "rating": 4
}
```

#### Response (201 Created)
```json
{
  "feedback": {
    "id": "507f1f77bcf86cd799439014",
    "card_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "feedback_type": "improvement",
    "subject": "Add More Contact Options",
    "message": "It would be great to have WhatsApp and Telegram contact options.",
    "email": "user@example.com",
    "rating": 4,
    "status": "pending",
    "created_at": "2025-10-20T10:30:00.000Z",
    "updated_at": "2025-10-20T10:30:00.000Z"
  },
  "message": "Feedback submitted successfully. Thank you for your input!"
}
```

#### Error Responses

**400 Bad Request** - Invalid data
```json
{
  "error": "ValidationError",
  "message": "Subject must be between 3 and 100 characters"
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

---

### 2. Get User's Feedback

**Method:** `GET`  
**URL:** `/api/feedback/user`  
**Authentication:** Required

#### Request Example
```http
GET /api/feedback/user
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "feedback": [
    {
      "id": "507f1f77bcf86cd799439014",
      "card_id": "507f1f77bcf86cd799439011",
      "card_title": "John's Business",
      "user_id": "507f1f77bcf86cd799439012",
      "feedback_type": "improvement",
      "subject": "Add More Contact Options",
      "message": "It would be great to have WhatsApp and Telegram contact options.",
      "email": "user@example.com",
      "rating": 4,
      "status": "pending",
      "created_at": "2025-10-20T10:30:00.000Z",
      "updated_at": "2025-10-20T10:30:00.000Z"
    }
  ],
  "total": 12
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

### 3. Get Feedback by ID

**Method:** `GET`  
**URL:** `/api/feedback/:feedbackId`  
**Authentication:** Required (must be feedback owner or admin)

#### Request Example
```http
GET /api/feedback/507f1f77bcf86cd799439014
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "feedback": {
    "id": "507f1f77bcf86cd799439014",
    "card_id": "507f1f77bcf86cd799439011",
    "card_title": "John's Business",
    "user_id": "507f1f77bcf86cd799439012",
    "user_name": "Jane Doe",
    "feedback_type": "improvement",
    "subject": "Add More Contact Options",
    "message": "It would be great to have WhatsApp and Telegram contact options.",
    "email": "user@example.com",
    "rating": 4,
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
  "message": "You can only view your own feedback"
}
```

**404 Not Found** - Feedback doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Feedback not found"
}
```

---

### 4. Delete Feedback

**Method:** `DELETE`  
**URL:** `/api/feedback/:feedbackId`  
**Authentication:** Required (must be feedback owner)

#### Request Example
```http
DELETE /api/feedback/507f1f77bcf86cd799439014
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "message": "Feedback deleted successfully"
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

**403 Forbidden** - Not the feedback owner
```json
{
  "error": "Forbidden",
  "message": "You can only delete your own feedback"
}
```

**404 Not Found** - Feedback doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Feedback not found"
}
```

---

## Admin Endpoints

### 5. Get All Feedback (Admin)

**Method:** `GET`  
**URL:** `/api/admin/feedback`  
**Authentication:** Required (Admin role)

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 50) |
| status | string | No | Filter by status: all, pending, reviewed, resolved |
| feedback_type | string | No | Filter by type: all, general, bug, feature, improvement, question |
| rating | number | No | Filter by rating: 1-5 |

#### Request Example
```http
GET /api/admin/feedback?page=1&limit=50&status=pending
Authorization: Bearer <admin_token>
```

#### Response (200 OK)
```json
{
  "feedback": [
    {
      "id": "507f1f77bcf86cd799439014",
      "card_id": "507f1f77bcf86cd799439011",
      "card_title": "John's Business",
      "user_id": "507f1f77bcf86cd799439012",
      "user_name": "Jane Doe",
      "user_email": "jane@example.com",
      "feedback_type": "improvement",
      "subject": "Add More Contact Options",
      "message": "It would be great to have WhatsApp and Telegram contact options.",
      "email": "user@example.com",
      "rating": 4,
      "status": "pending",
      "created_at": "2025-10-20T10:30:00.000Z",
      "updated_at": "2025-10-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 8,
    "total_feedback": 400,
    "per_page": 50
  },
  "stats": {
    "pending": 150,
    "reviewed": 180,
    "resolved": 70,
    "average_rating": 4.2
  }
}
```

---

### 6. Update Feedback Status (Admin)

**Method:** `PATCH`  
**URL:** `/api/admin/feedback/:feedbackId/status`  
**Authentication:** Required (Admin role)

#### Request Body
```json
{
  "status": "reviewed",
  "admin_notes": "Noted for future feature development"
}
```

#### Request Example
```http
PATCH /api/admin/feedback/507f1f77bcf86cd799439014/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "reviewed",
  "admin_notes": "Noted for future feature development"
}
```

#### Response (200 OK)
```json
{
  "feedback": {
    "id": "507f1f77bcf86cd799439014",
    "card_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "feedback_type": "improvement",
    "subject": "Add More Contact Options",
    "message": "It would be great to have WhatsApp and Telegram contact options.",
    "email": "user@example.com",
    "rating": 4,
    "status": "reviewed",
    "admin_notes": "Noted for future feature development",
    "reviewed_by": "507f1f77bcf86cd799439020",
    "reviewed_at": "2025-10-20T12:45:00.000Z",
    "created_at": "2025-10-20T10:30:00.000Z",
    "updated_at": "2025-10-20T12:45:00.000Z"
  },
  "message": "Feedback status updated successfully"
}
```

---

## Data Models

### Feedback Object
```typescript
interface Feedback {
  id: string                    // Unique feedback identifier
  card_id: string              // Business card related to feedback
  user_id: string              // ID of user who submitted feedback
  feedback_type: FeedbackType  // Type of feedback
  subject: string              // Feedback subject/title
  message: string              // Detailed feedback message
  email?: string               // Optional contact email
  rating?: number              // Optional rating (1-5)
  status: FeedbackStatus       // Current status of feedback
  admin_notes?: string         // Notes from admin (admin only)
  reviewed_by?: string         // Admin who reviewed (admin only)
  reviewed_at?: string         // Review timestamp (admin only)
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
}

type FeedbackType = 
  | 'general'       // General feedback
  | 'bug'          // Bug report
  | 'feature'      // Feature request
  | 'improvement'  // Improvement suggestion
  | 'question'     // Question about the card

type FeedbackStatus = 
  | 'pending'      // Awaiting review
  | 'reviewed'     // Reviewed by admin
  | 'resolved'     // Feedback addressed/implemented
```

---

## Validation Rules

### Create Feedback
- **card_id**: Required, valid business card ID
- **feedback_type**: Required, must be one of: general, bug, feature, improvement, question
- **subject**: Required, string, 3-100 characters
- **message**: Required, string, 10-1000 characters
- **email**: Optional, valid email format, max 255 characters
- **rating**: Optional, integer between 1 and 5

### Update Status (Admin)
- **status**: Required, must be one of: pending, reviewed, resolved
- **admin_notes**: Optional, string, max 1000 characters

---

## Rate Limiting
- **Feedback submission**: 20 submissions per hour per user
- **Get feedback**: 100 requests per minute per user
- **Admin endpoints**: 500 requests per minute per admin

---

## Best Practices

1. **Detailed Messages**: Encourage users to provide specific details
2. **Optional Contact**: Allow users to provide email for follow-up
3. **Rating System**: Use ratings to prioritize feedback
4. **Status Updates**: Notify users when their feedback is reviewed/resolved
5. **Categorization**: Use feedback types for better organization
6. **Follow-up**: Contact users for clarification when needed
7. **Privacy**: Handle contact information securely
8. **Analytics**: Track feedback trends to identify common issues

---

## Example Usage in Frontend

```typescript
import { feedbackApi } from '@/services/feedbackApi'

// Submit feedback
const submitFeedback = async (data: CreateFeedbackData) => {
  try {
    const feedback = await feedbackApi.createFeedback({
      card_id: data.card_id,
      feedback_type: data.feedback_type,
      subject: data.subject,
      message: data.message,
      email: data.email,
      rating: data.rating
    });
    
    toast({
      title: "Feedback submitted",
      description: "Thank you for your input!"
    });
  } catch (error) {
    toast({
      title: "Failed to submit feedback",
      description: error.message,
      variant: "destructive"
    });
  }
};

// Get user's feedback
const loadMyFeedback = async () => {
  try {
    const feedback = await feedbackApi.getUserFeedback();
    setFeedback(feedback);
  } catch (error) {
    console.error('Failed to load feedback:', error);
  }
};

// Delete feedback
const deleteMyFeedback = async (feedbackId: string) => {
  try {
    await feedbackApi.deleteFeedback(feedbackId);
    toast({
      title: "Feedback deleted",
      description: "Your feedback has been removed"
    });
  } catch (error) {
    toast({
      title: "Failed to delete feedback",
      variant: "destructive"
    });
  }
};
```

---

## Notes

1. **Authentication Required**: All feedback must be from authenticated users
2. **Multiple Submissions**: Users can submit multiple feedback items per card
3. **No Editing**: Feedback cannot be edited after submission (delete and resubmit instead)
4. **Contact Info**: Email is optional but helpful for follow-up
5. **Ratings**: Optional ratings help prioritize feedback
6. **User Notifications**: Users can be notified when feedback is addressed
7. **Card Owner Access**: Card owners receive aggregated feedback insights
