# Backend Setup Guide

This document provides instructions for setting up your backend API to work with this platform.

## Required Environment Variables

Create a `.env` file in your project root:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

For local development:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

## API Endpoints Required

Your backend must implement the following endpoints. All endpoints except auth should require Bearer token authentication.

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "refresh_token": "refresh-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "seller",
    "is_verified": false
  }
}
```

#### POST `/api/v1/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### GET `/api/v1/auth/google`
Redirect to Google OAuth flow. After successful auth, redirect back to your app with tokens.

#### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "refresh-token-here"
}
```

**Response:**
```json
{
  "access_token": "new-jwt-token",
  "refresh_token": "new-refresh-token" // optional
}
```

#### GET `/api/v1/user/me`
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://...",
  "role": "seller",
  "is_verified": true,
  "domain": "technology",
  "subcategory": "software"
}
```

#### POST `/api/v1/auth/logout`
Logout and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Admin Endpoints

#### GET `/api/v1/admin/check-role`
Check if user has admin privileges.

**Response:**
```json
{
  "is_admin": true
}
```

#### GET `/api/v1/admin/dashboard/stats`
Get admin dashboard statistics.

**Response:**
```json
{
  "totalUsers": 1245,
  "totalProducts": 3842,
  "totalOrders": 8521,
  "totalRevenue": 2400000,
  "userGrowth": 18.2,
  "productGrowth": 12.8,
  "orderGrowth": 24.5,
  "revenueGrowth": 32.1
}
```

### Profile Endpoints

#### PUT `/api/v1/user/profile`
Update user profile.

**Request:**
```json
{
  "name": "New Name",
  "avatar": "https://...",
  "domain": "technology",
  "subcategory": "software",
  "phone": "+213...",
  "address": "..."
}
```

#### POST `/api/v1/verification/upload`
Upload verification document.

**Request:** (multipart/form-data)
- `domain`: string
- `subcategory`: string
- `document`: file

#### GET `/api/v1/verification/status`
Get verification status.

**Response:**
```json
{
  "status": "pending", // or "approved", "rejected"
  "note": "Optional admin note"
}
```

### Products Endpoints

#### GET `/api/v1/products`
Get all products for current seller.

**Response:**
```json
[
  {
    "id": "product-id",
    "name": "Product Name",
    "description": "...",
    "price": 5000,
    "currency": "DZD",
    "stock": 100,
    "category": "electronics",
    "images": ["url1", "url2"],
    "sellerId": "seller-id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/v1/products`
Create a new product.

#### GET `/api/v1/products/:id`
Get single product details.

#### PUT `/api/v1/products/:id`
Update product.

#### DELETE `/api/v1/products/:id`
Delete product.

#### POST `/api/v1/products/:id/images`
Upload product images (multipart/form-data).

### Orders Endpoints

#### GET `/api/v1/orders`
Get all orders for current seller.

#### GET `/api/v1/orders/:id`
Get single order details.

#### PUT `/api/v1/orders/:id/status`
Update order status.

**Request:**
```json
{
  "status": "processing" // pending, processing, shipped, delivered, cancelled
}
```

#### GET `/api/v1/orders/stats`
Get order statistics.

**Response:**
```json
{
  "total": 150,
  "pending": 20,
  "processing": 30,
  "delivered": 95,
  "revenue": 450000
}
```

### Analytics Endpoints

#### GET `/api/v1/analytics/sales?start_date=2024-01-01&end_date=2024-12-31`
Get sales data.

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "sales": 15000,
    "orders": 25
  }
]
```

#### GET `/api/v1/analytics/revenue`
Get revenue statistics.

#### GET `/api/v1/analytics/products`
Get product analytics.

#### GET `/api/v1/analytics/customers`
Get customer analytics.

## Authentication Flow

1. **Login/Register:** User submits credentials
2. **Token Response:** Backend returns `access_token` and `refresh_token`
3. **Token Storage:** Frontend stores tokens in localStorage
4. **Authenticated Requests:** Frontend sends `Authorization: Bearer <access_token>` header
5. **Token Refresh:** On 401 error, frontend automatically calls refresh endpoint
6. **Auto-Redirect:** If refresh fails, user is redirected to login

## Google OAuth Flow

1. User clicks "Login with Google"
2. Frontend redirects to: `GET /api/v1/auth/google`
3. Backend redirects to Google OAuth
4. After auth, Google redirects to backend callback
5. Backend processes auth and redirects to: `https://yourdomain.com/?access_token=xxx&refresh_token=yyy`
6. Frontend extracts tokens from URL and stores them

## CORS Configuration

Your backend must allow CORS from your frontend domain:

```javascript
// Example for Express.js
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:5173'],
  credentials: true
}));
```

## Security Requirements

1. **Password Hashing:** Use bcrypt (min 10 rounds)
2. **JWT Expiry:** Access token: 15min, Refresh token: 7 days
3. **HTTPS Only:** Production must use HTTPS
4. **Rate Limiting:** Implement rate limiting on auth endpoints
5. **Input Validation:** Validate all inputs server-side
6. **SQL Injection:** Use parameterized queries
7. **XSS Protection:** Sanitize all user inputs

## Database Schema Examples

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'seller',
  is_verified BOOLEAN DEFAULT FALSE,
  domain VARCHAR(100),
  subcategory VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

Test your API endpoints using the provided Postman collection or create your own tests.

Key test scenarios:
1. User registration and login
2. Token refresh flow
3. Protected endpoint access
4. Admin role verification
5. CRUD operations for products/orders
6. File uploads

## Support

For questions about the API integration, refer to:
- API endpoint list in `/src/config/api.ts`
- Service layer implementation in `/src/services/`
- Authentication context in `/src/contexts/AuthContext.tsx`
