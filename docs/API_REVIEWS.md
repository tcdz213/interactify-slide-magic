# Reviews API Documentation

## Overview
The Reviews API allows users to create, read, update, and delete reviews for business cards. It also provides functionality to mark reviews as helpful and retrieve review statistics.

---

## Endpoints

### 1. Get Business Reviews

**Method:** `GET`  
**URL:** `/api/businesses/:businessId/reviews`  
**Authentication:** Optional (supports both authenticated and anonymous access)

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 10) |

#### Request Example
```http
GET /api/businesses/507f1f77bcf86cd799439011/reviews?page=1&limit=10
Authorization: Bearer <token> (optional)
```

#### Response (200 OK)
```json
{
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439011",
      "business_id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "user_name": "John Doe",
      "user_avatar": "https://example.com/avatar.jpg",
      "rating": 5,
      "title": "Excellent Service!",
      "comment": "Had a great experience. Highly recommended!",
      "created_at": "2025-10-15T10:30:00.000Z",
      "updated_at": "2025-10-15T10:30:00.000Z",
      "helpful_count": 12,
      "verified_purchase": true
    }
  ],
  "stats": {
    "average_rating": 4.5,
    "total_reviews": 128,
    "rating_distribution": {
      "5": 85,
      "4": 25,
      "3": 10,
      "2": 5,
      "1": 3
    }
  }
}
```

---

### 2. Get User's Reviews

**Method:** `GET`  
**URL:** `/api/reviews/user`  
**Authentication:** Required

#### Request Example
```http
GET /api/reviews/user
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439011",
      "business_id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "user_name": "John Doe",
      "user_avatar": "https://example.com/avatar.jpg",
      "rating": 5,
      "title": "Excellent Service!",
      "comment": "Had a great experience. Highly recommended!",
      "created_at": "2025-10-15T10:30:00.000Z",
      "updated_at": "2025-10-15T10:30:00.000Z",
      "helpful_count": 12,
      "verified_purchase": true
    }
  ]
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

### 3. Create Review

**Method:** `POST`  
**URL:** `/api/reviews`  
**Authentication:** Required

#### Request Body
```json
{
  "business_id": "507f1f77bcf86cd799439011",
  "rating": 5,
  "title": "Excellent Service!",
  "comment": "Had a great experience. Highly recommended!"
}
```

#### Request Example
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_id": "507f1f77bcf86cd799439011",
  "rating": 5,
  "title": "Excellent Service!",
  "comment": "Had a great experience. Highly recommended!"
}
```

#### Response (201 Created)
```json
{
  "review": {
    "id": "507f1f77bcf86cd799439011",
    "business_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "user_name": "John Doe",
    "user_avatar": "https://example.com/avatar.jpg",
    "rating": 5,
    "title": "Excellent Service!",
    "comment": "Had a great experience. Highly recommended!",
    "created_at": "2025-10-15T10:30:00.000Z",
    "updated_at": "2025-10-15T10:30:00.000Z",
    "helpful_count": 0,
    "verified_purchase": false
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid data
```json
{
  "error": "ValidationError",
  "message": "Rating must be between 1 and 5"
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**409 Conflict** - Already reviewed
```json
{
  "error": "ConflictError",
  "message": "You have already reviewed this business"
}
```

---

### 4. Update Review

**Method:** `PUT`  
**URL:** `/api/reviews/:reviewId`  
**Authentication:** Required (must be review owner)

#### Request Body
```json
{
  "rating": 4,
  "title": "Good Service",
  "comment": "Updated my review after further thought."
}
```

#### Request Example
```http
PUT /api/reviews/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "title": "Good Service",
  "comment": "Updated my review after further thought."
}
```

#### Response (200 OK)
```json
{
  "review": {
    "id": "507f1f77bcf86cd799439011",
    "business_id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "user_name": "John Doe",
    "user_avatar": "https://example.com/avatar.jpg",
    "rating": 4,
    "title": "Good Service",
    "comment": "Updated my review after further thought.",
    "created_at": "2025-10-15T10:30:00.000Z",
    "updated_at": "2025-10-16T14:22:00.000Z",
    "helpful_count": 12,
    "verified_purchase": true
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

**403 Forbidden** - Not the review owner
```json
{
  "error": "Forbidden",
  "message": "You can only edit your own reviews"
}
```

**404 Not Found** - Review doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Review not found"
}
```

---

### 5. Delete Review

**Method:** `DELETE`  
**URL:** `/api/reviews/:reviewId`  
**Authentication:** Required (must be review owner or admin)

#### Request Example
```http
DELETE /api/reviews/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "message": "Review deleted successfully"
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

**403 Forbidden** - Not the review owner
```json
{
  "error": "Forbidden",
  "message": "You can only delete your own reviews"
}
```

**404 Not Found** - Review doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Review not found"
}
```

---

### 6. Mark Review as Helpful

**Method:** `POST`  
**URL:** `/api/reviews/:reviewId/helpful`  
**Authentication:** Required

#### Request Example
```http
POST /api/reviews/507f1f77bcf86cd799439011/helpful
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "message": "Review marked as helpful",
  "helpful_count": 13
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

**409 Conflict** - Already marked as helpful
```json
{
  "error": "ConflictError",
  "message": "You have already marked this review as helpful"
}
```

**404 Not Found** - Review doesn't exist
```json
{
  "error": "NotFoundError",
  "message": "Review not found"
}
```

---

## Admin Endpoints

### 7. Get All Reviews (Admin)

**Method:** `GET`  
**URL:** `/api/admin/reviews`  
**Authentication:** Required (Admin role)

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 50) |
| status | string | No | Filter by status: all, flagged, verified |

#### Request Example
```http
GET /api/admin/reviews?page=1&limit=50&status=flagged
Authorization: Bearer <admin_token>
```

#### Response (200 OK)
```json
{
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439011",
      "business_id": "507f1f77bcf86cd799439011",
      "business_name": "Acme Corp",
      "user_id": "507f1f77bcf86cd799439012",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "rating": 5,
      "title": "Excellent Service!",
      "comment": "Had a great experience.",
      "created_at": "2025-10-15T10:30:00.000Z",
      "updated_at": "2025-10-15T10:30:00.000Z",
      "helpful_count": 12,
      "verified_purchase": true,
      "is_flagged": false,
      "flag_reason": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_reviews": 500,
    "per_page": 50
  }
}
```

---

### 8. Delete Review (Admin)

**Method:** `DELETE`  
**URL:** `/api/admin/reviews/:reviewId`  
**Authentication:** Required (Admin role)

#### Request Example
```http
DELETE /api/admin/reviews/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

#### Response (200 OK)
```json
{
  "message": "Review deleted successfully"
}
```

---

## Data Models

### Review Object
```typescript
interface Review {
  id: string                    // Unique review identifier
  business_id: string           // Business card ID being reviewed
  user_id: string              // ID of user who wrote review
  user_name: string            // Display name of reviewer
  user_avatar?: string         // Avatar URL of reviewer
  rating: number               // Rating (1-5)
  title: string                // Review title/headline
  comment: string              // Review text content
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
  helpful_count?: number       // Number of helpful votes
  verified_purchase?: boolean  // Whether reviewer had transaction
}
```

### ReviewStats Object
```typescript
interface ReviewStats {
  average_rating: number       // Average rating (0-5)
  total_reviews: number        // Total number of reviews
  rating_distribution: {
    5: number                  // Count of 5-star reviews
    4: number                  // Count of 4-star reviews
    3: number                  // Count of 3-star reviews
    2: number                  // Count of 2-star reviews
    1: number                  // Count of 1-star reviews
  }
}
```

---

## Validation Rules

### Create/Update Review
- **rating**: Required, integer between 1 and 5
- **title**: Required, string, 3-100 characters
- **comment**: Required, string, 10-2000 characters
- **business_id**: Required (create only), valid business card ID

---

## Rate Limiting
- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 200 requests per minute per user
- **Admin endpoints**: 500 requests per minute per admin

---

## Best Practices

1. **Pagination**: Always use pagination for listing reviews
2. **Caching**: Cache review statistics for 5 minutes
3. **Error Handling**: Always handle 401, 403, 404 errors
4. **Optimistic Updates**: Update UI immediately, rollback on error
5. **Toast Notifications**: Show success/error messages to users

---

## Example Usage in Frontend

```typescript
import { reviewsApi } from '@/services/reviewsApi'

// Get reviews for a business
const { reviews, stats } = await reviewsApi.getBusinessReviews(businessId, 1, 10)

// Create a review
await reviewsApi.createReview({
  business_id: businessId,
  rating: 5,
  title: "Great service!",
  comment: "I had an amazing experience..."
})

// Update a review
await reviewsApi.updateReview(reviewId, {
  rating: 4,
  title: "Updated title"
})

// Delete a review
await reviewsApi.deleteReview(reviewId)

// Mark as helpful
await reviewsApi.markHelpful(reviewId)
```

---

## Notes
- All timestamps are in UTC ISO 8601 format
- Reviews are soft-deleted for admin compliance
- Users can only review each business once
- Reviews require authentication
- Helpful votes are unique per user per review
