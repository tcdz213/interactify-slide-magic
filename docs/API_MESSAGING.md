# Messaging API Documentation

## Overview
This document describes the messaging and conversations API endpoints for the platform. These APIs allow users to communicate with business owners through direct messages.

---

## Base URL
```
https://api.yourdomain.com/api
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Endpoints

### 1. Get All Conversations
Retrieve all conversations for the authenticated user.

**Scenario:** User opens the Messages page and wants to see all their conversations.

**Method:** `GET`

**URL:** `/conversations`

**Request:**
```http
GET /conversations HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "id": "conv_123abc",
      "business_id": "biz_456def",
      "business_name": "Tech Training Center",
      "business_avatar": "https://example.com/avatar.jpg",
      "user_id": "user_789ghi",
      "user_name": "John Doe",
      "user_avatar": "https://example.com/user-avatar.jpg",
      "last_message": "Hi, is this course still available?",
      "last_message_at": "2025-10-16T14:30:00Z",
      "unread_count": 2,
      "created_at": "2025-10-15T10:00:00Z",
      "updated_at": "2025-10-16T14:30:00Z"
    },
    {
      "id": "conv_456xyz",
      "business_id": "biz_789abc",
      "business_name": "Language Academy",
      "business_avatar": null,
      "user_id": "user_789ghi",
      "user_name": "John Doe",
      "user_avatar": "https://example.com/user-avatar.jpg",
      "last_message": "Thank you for your interest!",
      "last_message_at": "2025-10-14T09:15:00Z",
      "unread_count": 0,
      "created_at": "2025-10-14T08:00:00Z",
      "updated_at": "2025-10-14T09:15:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 2,
    "limit": 50,
    "has_next": false,
    "has_prev": false
  }
}
```

---

### 2. Get Single Conversation
Retrieve details of a specific conversation.

**Scenario:** System needs to load a conversation when user clicks from a notification.

**Method:** `GET`

**URL:** `/conversations/{conversation_id}`

**Request:**
```http
GET /conversations/conv_123abc HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "conversation": {
    "id": "conv_123abc",
    "business_id": "biz_456def",
    "business_name": "Tech Training Center",
    "business_avatar": "https://example.com/avatar.jpg",
    "user_id": "user_789ghi",
    "user_name": "John Doe",
    "user_avatar": "https://example.com/user-avatar.jpg",
    "last_message": "Hi, is this course still available?",
    "last_message_at": "2025-10-16T14:30:00Z",
    "unread_count": 2,
    "created_at": "2025-10-15T10:00:00Z",
    "updated_at": "2025-10-16T14:30:00Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

---

### 3. Create New Conversation
Create a new conversation with a business.

**Scenario:** User clicks the message icon on a listing card for the first time.

**Method:** `POST`

**URL:** `/conversations`

**Request:**
```http
POST /conversations HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "business_id": "biz_456def",
  "initial_message": "Hi, is this course still available?"
}
```

**Request Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_id | string | Yes | ID of the business to message |
| initial_message | string | No | Optional first message (max 2000 chars) |

**Response:** `201 Created`
```json
{
  "conversation": {
    "id": "conv_123abc",
    "business_id": "biz_456def",
    "business_name": "Tech Training Center",
    "business_avatar": "https://example.com/avatar.jpg",
    "user_id": "user_789ghi",
    "user_name": "John Doe",
    "user_avatar": "https://example.com/user-avatar.jpg",
    "last_message": "Hi, is this course still available?",
    "last_message_at": "2025-10-16T14:30:00Z",
    "unread_count": 0,
    "created_at": "2025-10-16T14:30:00Z",
    "updated_at": "2025-10-16T14:30:00Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Business ID is required"
}
```

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "message": "Conversation already exists with this business",
  "conversation_id": "conv_123abc"
}
```

---

### 4. Get Messages in Conversation
Retrieve all messages in a specific conversation.

**Scenario:** User opens a conversation to view message history.

**Method:** `GET`

**URL:** `/conversations/{conversation_id}/messages`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Messages per page (max 100) |

**Request:**
```http
GET /conversations/conv_123abc/messages?page=1&limit=50 HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg_001",
      "conversation_id": "conv_123abc",
      "sender_id": "user_789ghi",
      "sender_name": "John Doe",
      "sender_avatar": "https://example.com/user-avatar.jpg",
      "content": "Hi, is this course still available?",
      "read": true,
      "created_at": "2025-10-16T14:30:00Z",
      "updated_at": null
    },
    {
      "id": "msg_002",
      "conversation_id": "conv_123abc",
      "sender_id": "biz_456def",
      "sender_name": "Tech Training Center",
      "sender_avatar": "https://example.com/avatar.jpg",
      "content": "Yes! The course starts next Monday. Would you like to register?",
      "read": false,
      "created_at": "2025-10-16T14:35:00Z",
      "updated_at": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 2,
    "limit": 50,
    "has_next": false,
    "has_prev": false
  }
}
```

---

### 5. Send Message
Send a new message in a conversation.

**Scenario:** User types and sends a message in an active conversation.

**Method:** `POST`

**URL:** `/messages`

**Request:**
```http
POST /messages HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "conversation_id": "conv_123abc",
  "content": "Yes, I would like to register. What are the fees?"
}
```

**Request Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversation_id | string (UUID) | Yes | ID of the conversation |
| content | string | Yes | Message content (1-2000 chars) |

**Response:** `201 Created`
```json
{
  "message": {
    "id": "msg_003",
    "conversation_id": "conv_123abc",
    "sender_id": "user_789ghi",
    "sender_name": "John Doe",
    "sender_avatar": "https://example.com/user-avatar.jpg",
    "content": "Yes, I would like to register. What are the fees?",
    "read": false,
    "created_at": "2025-10-16T14:40:00Z",
    "updated_at": null
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Message cannot be empty"
}
```

**Error Response:** `429 Too Many Requests`
```json
{
  "success": false,
  "message": "Too many messages. Please wait a moment."
}
```

---

### 6. Mark Messages as Read
Mark all unread messages in a conversation as read.

**Scenario:** User opens a conversation, system automatically marks messages as read.

**Method:** `PUT`

**URL:** `/conversations/{conversation_id}/read`

**Request:**
```http
PUT /conversations/conv_123abc/read HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Messages marked as read",
  "marked_count": 2
}
```

---

### 7. Delete Conversation
Delete a conversation and all its messages.

**Scenario:** User wants to remove a conversation from their list.

**Method:** `DELETE`

**URL:** `/conversations/{conversation_id}`

**Request:**
```http
DELETE /conversations/conv_123abc HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

---

## Common User Scenarios

### Scenario 1: Starting a Conversation from Listing Card

**Flow:**
1. User clicks message icon on business listing
2. Frontend checks if conversation exists:
   - Call `GET /conversations` and filter by `business_id`
3. If conversation exists:
   - Navigate to `/messages?conversation={conversation_id}`
   - Load messages with `GET /conversations/{conversation_id}/messages`
4. If conversation doesn't exist:
   - Create new conversation with `POST /conversations`
   - Navigate to new conversation

**Example Code:**
```javascript
// Check for existing conversation
const conversations = await fetch('/conversations')
const existing = conversations.find(c => c.business_id === businessId)

if (existing) {
  // Open existing conversation
  navigate(`/messages?conversation=${existing.id}`)
} else {
  // Create new conversation
  const response = await fetch('/conversations', {
    method: 'POST',
    body: JSON.stringify({
      business_id: businessId,
      initial_message: "Hi, is this listing still available?"
    })
  })
  const { conversation } = await response.json()
  navigate(`/messages?conversation=${conversation.id}`)
}
```

---

### Scenario 2: Opening from Messages Page

**Flow:**
1. User navigates to `/messages`
2. System loads all conversations with `GET /conversations`
3. User selects a conversation
4. System loads messages with `GET /conversations/{conversation_id}/messages`
5. System marks messages as read with `PUT /conversations/{conversation_id}/read`

---

### Scenario 3: Opening from Notification

**Flow:**
1. User clicks notification for new message
2. Notification contains `conversation_id`
3. System fetches conversation details with `GET /conversations/{conversation_id}`
4. Navigate to conversation view
5. Load and display messages

---

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| GET /conversations | 100 requests/minute |
| POST /conversations | 10 requests/minute |
| GET /messages | 100 requests/minute |
| POST /messages | 60 messages/minute |
| PUT /read | 100 requests/minute |
| DELETE /conversations | 10 requests/minute |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - No access to this resource |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Data Validation

### Message Content
- **Minimum length:** 1 character (after trimming)
- **Maximum length:** 2000 characters
- **Forbidden:** Script tags, JavaScript protocols, event handlers
- **Sanitization:** Automatically removes malicious content

### Conversation
- **business_id:** Required, must be valid business ID
- **initial_message:** Optional, follows message content rules

---

## Security Features

1. **Authentication Required:** All endpoints require valid JWT token
2. **Authorization Checks:** Users can only access their own conversations
3. **Input Sanitization:** All message content is sanitized server-side
4. **Rate Limiting:** Prevents spam and abuse
5. **XSS Protection:** Content is escaped before display
6. **CORS:** Configured for authorized domains only

---

## Testing Examples

### Using cURL

**Get Conversations:**
```bash
curl -X GET \
  https://api.yourdomain.com/api/conversations \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Create Conversation:**
```bash
curl -X POST \
  https://api.yourdomain.com/api/conversations \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "business_id": "biz_456def",
    "initial_message": "Hello!"
  }'
```

**Send Message:**
```bash
curl -X POST \
  https://api.yourdomain.com/api/messages \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "conversation_id": "conv_123abc",
    "content": "Is this still available?"
  }'
```

---

## Support

For API support or questions, contact: api-support@yourdomain.com

**Last Updated:** October 16, 2025
**API Version:** 1.0
