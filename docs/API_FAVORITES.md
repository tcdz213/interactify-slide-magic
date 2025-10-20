# Favorites API Documentation

## Overview
The Favorites API allows authenticated users to manage their favorite business cards. Favorites are stored per user and synced across devices.

## Base URL
```
{API_BASE_URL}/favorites
```

## Authentication
All favorites endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. Get User Favorites
Retrieve all favorite business cards for the authenticated user.

**Endpoint:** `GET /favorites`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "business_id": "507f1f77bcf86cd799439011",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 10
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

### 2. Add Business to Favorites
Add a business card to the user's favorites list.

**Endpoint:** `POST /favorites`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "business_id": "507f1f77bcf86cd799439011"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "business_id": "507f1f77bcf86cd799439011",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Business added to favorites"
}
```

**Error Responses:**
- `400 Bad Request` - Business already in favorites
```json
{
  "success": false,
  "error": "Business already in favorites"
}
```

- `404 Not Found` - Business not found
```json
{
  "success": false,
  "error": "Business not found"
}
```

---

### 3. Remove Business from Favorites
Remove a business card from the user's favorites list.

**Endpoint:** `DELETE /favorites/{business_id}`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**URL Parameters:**
- `business_id` (string, required) - The ID of the business to remove

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Business removed from favorites"
}
```

**Error Responses:**
- `404 Not Found` - Business not in favorites
```json
{
  "success": false,
  "error": "Business not found in favorites"
}
```

---

### 4. Check if Business is Favorited
Check if a specific business is in the user's favorites.

**Endpoint:** `GET /favorites/check/{business_id}`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**URL Parameters:**
- `business_id` (string, required) - The ID of the business to check

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "is_favorite": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Get Favorite Businesses Details
Get full details of all favorited businesses (with pagination).

**Endpoint:** `GET /favorites/businesses`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "businesses": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Dr. John Smith",
        "company": "Smith Medical Center",
        "domain_key": "health",
        "subdomain_key": "general_practice",
        "description": "Family physician with 15+ years experience",
        "email": "dr.smith@example.com",
        "mobile_phones": ["+1234567890"],
        "address": "123 Main St, New York, NY",
        "verified": true,
        "favorited_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_favorites": 45,
      "limit": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## Data Models

### Favorite
```typescript
interface Favorite {
  business_id: string;
  user_id: string;
  created_at: string; // ISO 8601 timestamp
}
```

### FavoriteWithBusiness
```typescript
interface FavoriteWithBusiness extends BusinessCard {
  favorited_at: string; // ISO 8601 timestamp
}
```

---

## Notes

1. **Duplicate Prevention:** Adding the same business twice returns a 400 error
2. **Soft Delete:** Removing a favorite is permanent and cannot be undone
3. **Rate Limiting:** Maximum 100 add/remove operations per hour per user
4. **Sync:** Favorites automatically sync across all user devices
5. **Privacy:** Users can only access their own favorites
6. **Business Validation:** All business IDs are validated before adding to favorites

---

## Error Codes Summary

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (invalid data, duplicate) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Example Usage

### JavaScript/TypeScript Example
```typescript
// Add to favorites
const addToFavorites = async (businessId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ business_id: businessId }),
  });
  
  return response.json();
};

// Get all favorites
const getFavorites = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/favorites/businesses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

// Remove from favorites
const removeFromFavorites = async (businessId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/favorites/${businessId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```
