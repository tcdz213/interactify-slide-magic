# Messaging API Documentation

## Overview

The Messaging API enables real-time communication between users and businesses. It supports WebSocket connections for live updates and REST endpoints for message management.

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** All endpoints require a valid JWT token in the `Authorization` header.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Conversations](#conversations)
3. [Messages](#messages)
4. [WebSocket Events](#websocket-events)
5. [Error Responses](#error-responses)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests must include an `Authorization` header with a valid JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Conversations

### Get All Conversations

Retrieve all conversations for the authenticated user.

**Endpoint:** `GET /conversations`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "id": "uuid",
      "business_id": "string",
      "business_name": "string",
      "business_avatar": "string | null",
      "user_id": "string",
      "user_name": "string",
      "user_avatar": "string | null",
      "last_message": "string | null",
      "last_message_at": "ISO 8601 timestamp | null",
      "unread_count": 0,
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp | null"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 1,
    "limit": 50,
    "has_next": false,
    "has_prev": false
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/conversations \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### Get Single Conversation

Retrieve details of a specific conversation.

**Endpoint:** `GET /conversations/:conversationId`

**Parameters:**
- `conversationId` (path) - UUID of the conversation

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "conversation": {
    "id": "uuid",
    "business_id": "string",
    "business_name": "string",
    "business_avatar": "string | null",
    "user_id": "string",
    "user_name": "string",
    "user_avatar": "string | null",
    "last_message": "string | null",
    "last_message_at": "ISO 8601 timestamp | null",
    "unread_count": 0,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp | null"
  }
}
```

**Error Responses:**
- `404 Not Found` - Conversation not found
- `403 Forbidden` - User not authorized to access this conversation

---

### Create Conversation

Start a new conversation with a business.

**Endpoint:** `POST /conversations`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "business_id": "string (required)",
  "initial_message": "string (optional, max 2000 characters)"
}
```

**Validation:**
- `business_id`: Required, non-empty string
- `initial_message`: Optional, max 2000 characters, no script tags

**Response:** `201 Created`
```json
{
  "conversation": {
    "id": "uuid",
    "business_id": "string",
    "business_name": "string",
    "business_avatar": "string | null",
    "user_id": "string",
    "user_name": "string",
    "user_avatar": "string | null",
    "last_message": "string | null",
    "last_message_at": "ISO 8601 timestamp | null",
    "unread_count": 0,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp | null"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/conversations \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "123",
    "initial_message": "Hi, I would like to inquire about your services."
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid input (missing business_id, message too long, etc.)
- `404 Not Found` - Business not found

---

### Delete Conversation

Permanently delete a conversation and all its messages.

**Endpoint:** `DELETE /conversations/:conversationId`

**Parameters:**
- `conversationId` (path) - UUID of the conversation

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Conversation not found
- `403 Forbidden` - User not authorized to delete this conversation

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/conversations/abc-123-def \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Messages

### Get Messages in Conversation

Retrieve messages from a specific conversation with pagination.

**Endpoint:** `GET /conversations/:conversationId/messages`

**Parameters:**
- `conversationId` (path) - UUID of the conversation
- `page` (query) - Page number (default: 1)
- `limit` (query) - Items per page (default: 50, max: 100)

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "string",
      "conversation_id": "uuid",
      "sender_id": "string",
      "sender_name": "string",
      "sender_avatar": "string | null",
      "content": "string",
      "read": false,
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp | null"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 243,
    "limit": 50,
    "has_next": true,
    "has_prev": false
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/conversations/abc-123/messages?page=1&limit=50" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Error Responses:**
- `404 Not Found` - Conversation not found
- `403 Forbidden` - User not authorized to access this conversation

---

### Send Message

Send a new message in a conversation.

**Endpoint:** `POST /messages`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "conversation_id": "uuid (required)",
  "content": "string (required, min 1, max 2000 characters)"
}
```

**Validation:**
- `conversation_id`: Required, valid UUID
- `content`: Required, 1-2000 characters, no script tags or event handlers
- **Rate Limit:** Maximum 60 messages per minute per user (client-side enforced)

**Response:** `201 Created`
```json
{
  "message": {
    "id": "string",
    "conversation_id": "uuid",
    "sender_id": "string",
    "sender_name": "string",
    "sender_avatar": "string | null",
    "content": "string",
    "read": false,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp | null"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "abc-123-def",
    "content": "Thank you for the information!"
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid input (empty message, too long, invalid conversation_id)
- `403 Forbidden` - User not part of conversation
- `404 Not Found` - Conversation not found
- `429 Too Many Requests` - Rate limit exceeded

---

### Mark Messages as Read

Mark all unread messages in a conversation as read.

**Endpoint:** `PUT /conversations/:conversationId/read`

**Parameters:**
- `conversationId` (path) - UUID of the conversation

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Example:**
```bash
curl -X PUT http://localhost:3000/api/v1/conversations/abc-123/read \
  -H "Authorization: Bearer eyJhbGc..."
```

**Error Responses:**
- `404 Not Found` - Conversation not found
- `403 Forbidden` - User not authorized to access this conversation

---

## WebSocket Events

The messaging system uses WebSocket connections for real-time updates. Connect to the Supabase Realtime channel `messaging-realtime`.

### Connection

```javascript
import { supabase } from "@/integrations/supabase/client"

const channel = supabase.channel('messaging-realtime')
```

### Event Types

#### 1. New Message (INSERT)

Fired when a new message is inserted.

```javascript
channel.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}` // optional filter
  },
  (payload) => {
    const message = payload.new
    // Handle new message
  }
)
```

**Payload:**
```json
{
  "new": {
    "id": "string",
    "conversation_id": "uuid",
    "sender_id": "string",
    "sender_name": "string",
    "sender_avatar": "string | null",
    "content": "string",
    "read": false,
    "created_at": "ISO 8601 timestamp"
  },
  "old": null,
  "eventType": "INSERT"
}
```

#### 2. Message Update (UPDATE)

Fired when a message is updated (e.g., marked as read).

```javascript
channel.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages'
  },
  (payload) => {
    const updatedMessage = payload.new
    // Handle message update
  }
)
```

**Payload:**
```json
{
  "new": { /* updated message */ },
  "old": { /* previous message */ },
  "eventType": "UPDATE"
}
```

#### 3. Conversation Update (UPDATE)

Fired when conversation metadata changes (e.g., last_message, unread_count).

```javascript
channel.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'conversations'
  },
  (payload) => {
    const updatedConversation = payload.new
    // Handle conversation update
  }
)
```

#### 4. Typing Indicator (Broadcast)

Real-time typing indicators using broadcast events.

**Send typing indicator:**
```javascript
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: {
    conversation_id: 'uuid',
    user_id: 'string',
    is_typing: true
  }
})
```

**Receive typing indicator:**
```javascript
channel.on('broadcast', { event: 'typing' }, (payload) => {
  const { conversation_id, user_id, is_typing } = payload.payload
  // Update UI to show typing indicator
})
```

### Subscribe to Channel

```javascript
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Connected to real-time messaging')
  } else if (status === 'CHANNEL_ERROR') {
    console.error('Failed to connect')
  } else if (status === 'TIMED_OUT') {
    console.error('Connection timed out')
  } else if (status === 'CLOSED') {
    console.log('Connection closed')
  }
})
```

### Cleanup

```javascript
// Remove channel when done
supabase.removeChannel(channel)
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "success": false
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no response body |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - User not authorized for this action |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Common Error Examples

**Invalid Message Content:**
```json
{
  "message": "Message must be less than 2000 characters",
  "success": false
}
```

**Rate Limit Exceeded:**
```json
{
  "message": "Too many messages. Please wait a moment.",
  "success": false
}
```

**Conversation Not Found:**
```json
{
  "message": "Failed to fetch conversation",
  "success": false
}
```

---

## Rate Limiting

### Client-Side Rate Limiting

Messages are rate-limited at **60 messages per minute** per user. This is enforced client-side using localStorage:

```javascript
// Rate limit tracking
const rateLimitKey = 'msg_rate_limit'
const rateLimitData = localStorage.getItem(rateLimitKey)

if (rateLimitData) {
  const { count, timestamp } = JSON.parse(rateLimitData)
  if (Date.now() - timestamp < 60000 && count >= 60) {
    throw new Error('Too many messages. Please wait a moment.')
  }
}
```

### Typing Indicator Auto-Clear

Typing indicators automatically clear after **3 seconds** of inactivity to prevent stale states.

---

## Security

### Input Sanitization

All message content is sanitized to prevent XSS attacks:

```javascript
// Removed content:
- Script tags: <script>...</script>
- JavaScript protocol: javascript:
- Event handlers: onclick=, onload=, etc.
```

### Validation Schema

Using Zod for validation:

```typescript
const messageContentSchema = z
  .string()
  .trim()
  .min(1, { message: "Message cannot be empty" })
  .max(2000, { message: "Message must be less than 2000 characters" })
  .refine(
    (content) => {
      const scriptPattern = /<script[^>]*>.*?<\/script>/gi
      return !scriptPattern.test(content)
    },
    { message: "Invalid message content" }
  )
```

---

## Best Practices

### 1. Handle WebSocket Reconnections

```javascript
useEffect(() => {
  const channel = supabase.channel('messaging-realtime')
  
  channel.subscribe((status) => {
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      // Implement exponential backoff retry
      setTimeout(() => channel.subscribe(), 1000)
    }
  })

  return () => supabase.removeChannel(channel)
}, [])
```

### 2. Optimistic UI Updates

```javascript
// Add message immediately
setMessages(prev => [...prev, optimisticMessage])

try {
  // Send to server
  const sentMessage = await messagingApi.sendMessage(data)
  
  // Replace with real message
  setMessages(prev => prev.map(m => 
    m.id === tempId ? sentMessage : m
  ))
} catch (error) {
  // Mark as failed
  setFailedMessages(prev => new Set(prev).add(tempId))
}
```

### 3. Pagination for Large Conversations

```javascript
// Load older messages
const loadMore = async (page) => {
  const olderMessages = await messagingApi.getMessages(
    conversationId, 
    page,
    50
  )
  setMessages(prev => [...olderMessages, ...prev])
}
```

### 4. Mark Messages as Read on View

```javascript
useEffect(() => {
  if (messages.length > 0) {
    messagingApi.markAsRead(conversationId)
  }
}, [messages, conversationId])
```

---

## Code Examples

### Complete Messaging Hook

```typescript
import { useMessages } from "@/hooks/use-messages"

function MessageThread({ conversationId, currentUserId }) {
  const {
    messages,
    isLoading,
    isSending,
    failedMessages,
    isTyping,
    isConnected,
    connectionError,
    sendMessage,
    retryMessage,
    deleteFailedMessage,
    sendTypingIndicator
  } = useMessages({ conversationId, currentUserId })

  // Use the hook values...
}
```

### Sending a Message

```typescript
const handleSend = async (content: string) => {
  try {
    await sendMessage(content)
  } catch (error) {
    console.error('Failed to send:', error)
  }
}
```

---

## Changelog

### Version 1.0.0 (Current)

**Features:**
- ✅ WebSocket real-time messaging
- ✅ Conversation management
- ✅ Message pagination
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Optimistic UI updates
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ Error recovery

**Coming Soon:**
- 📎 File attachments
- ⚡ Message reactions
- ✏️ Message editing
- 🗑️ Message deletion
- 📱 Push notifications
- 🔍 Message search

---

## Support

For issues or questions:
- GitHub Issues: [Link to repository]
- Email: support@example.com
- Documentation: [Link to docs]
