import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Server, 
  Database, 
  Shield, 
  Code, 
  AlertCircle, 
  CheckCircle,
  Lock,
  GitBranch,
  Settings,
  Zap
} from "lucide-react";

const ApiDocs = () => {
  return (
    <>
      <SEO
        title="API Documentation - Backend Integration Guide"
        description="Complete API documentation with backend setup, database schemas, security requirements, and implementation examples"
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl" dir="ltr">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">API Documentation & Backend Integration Guide</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Complete reference for API endpoints, backend setup, security requirements, and database schemas
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Server className="w-3 h-3" />
              REST API
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Lock className="w-3 h-3" />
              JWT Auth
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Database className="w-3 h-3" />
              PostgreSQL
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              CORS Enabled
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Code className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="setup" className="gap-2">
              <Settings className="w-4 h-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="gap-2">
              <Server className="w-4 h-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="testing" className="gap-2">
              <Zap className="w-4 h-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Base Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Base URL:</p>
                  <code className="bg-muted px-3 py-2 rounded text-sm block">
                    http://localhost:3000/api/v1
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Production: Replace with your actual domain (e.g., https://api.yourdomain.com/api/v1)
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">API Version:</p>
                  <Badge>1.0.0</Badge>
                </div>
                <div>
                  <p className="font-semibold mb-2">Authentication:</p>
                  <p className="text-sm text-muted-foreground">
                    Bearer Token (JWT) - Include in Authorization header for protected endpoints
                  </p>
                  <code className="bg-muted px-3 py-2 rounded text-xs block mt-2">
                    Authorization: Bearer {"<"}access_token{">"}
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-2">Content Type:</p>
                  <code className="bg-muted px-3 py-2 rounded text-sm block">
                    application/json
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-2">Response Format:</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    All responses follow a consistent structure:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">1. Set Environment Variables</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs">
{`# Frontend .env
VITE_API_BASE_URL=http://localhost:3000

# Backend .env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173`}
                  </pre>
                </div>
                
                <div>
                  <p className="font-semibold mb-2">2. Install Dependencies (Node.js Backend)</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs">
{`npm install express cors jsonwebtoken bcrypt pg
npm install --save-dev @types/express @types/cors @types/jsonwebtoken @types/bcrypt`}
                  </pre>
                </div>

                <div>
                  <p className="font-semibold mb-2">3. Test Authentication</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs">
{`curl -X POST http://localhost:3000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "customer"
  }'`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Never expose your JWT secrets. Use environment variables and keep them secure.
                Minimum 32 characters recommended for production secrets.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">

        <div className="space-y-12">
          {/* Authentication Endpoints */}
          <section id="authentication">
            <h2 className="text-3xl font-bold mb-6">Authentication Endpoints</h2>

            <div className="space-y-8">
              {/* Register */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/auth/register</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Register a new user</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Not required</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "customer",
  "phone": "+966501234567"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Validation Rules:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><code>email</code>: Valid email format (required)</li>
                      <li><code>password</code>: Minimum 8 characters (required)</li>
                      <li><code>name</code>: Minimum 2 characters (required)</li>
                      <li><code>role</code>: Either "customer" or "seller" (required)</li>
                      <li><code>phone</code>: Optional</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (201 Created):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "isVerified": false,
      "phone": "+966501234567",
      "createdAt": "2025-11-13T10:00:00.000Z"
    }
  },
  "message": "User registered successfully"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Error Responses:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// 422 Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": ["body", "email"],
      "message": "Invalid email format"
    }
  ]
}

// 422 User Already Exists
{
  "success": false,
  "message": "User with this email already exists"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Login */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/auth/login</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Login user</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Not required</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "isVerified": false,
      "phone": "+966501234567",
      "avatar": null,
      "createdAt": "2025-11-13T10:00:00.000Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Error Responses:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// 401 Unauthorized
{
  "success": false,
  "message": "Invalid credentials"
}

// 422 Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": ["body", "email"],
      "message": "Invalid email format"
    }
  ]
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Logout */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/auth/logout</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Logout user</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Headers:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
Authorization: Bearer &lt;access_token&gt;
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Logged out successfully"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Error Response:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// 401 Unauthorized
{
  "success": false,
  "message": "Invalid token"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Refresh Token */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/auth/refresh</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Refresh access token</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Not required</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* User Endpoints */}
          <section id="user">
            <h2 className="text-3xl font-bold mb-6">User Endpoints</h2>

            <div className="space-y-8">
              {/* Get Current User */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/user/me</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get current user profile</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Headers:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
Authorization: Bearer &lt;access_token&gt;
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "phone": "+966501234567",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": true,
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Error Responses:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// 401 Unauthorized
{
  "success": false,
  "message": "Invalid token"
}

// 404 Not Found
{
  "success": false,
  "message": "User not found"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Update Profile */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      PUT
                    </span>
                    <code className="text-lg">/api/v1/user/profile</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Update user profile</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Headers:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
Authorization: Bearer &lt;access_token&gt;
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "John Updated",
  "phone": "+966509876543",
  "avatar": "https://example.com/new-avatar.jpg"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Updated",
    "role": "customer",
    "phone": "+966509876543",
    "avatar": "https://example.com/new-avatar.jpg",
    "isVerified": true,
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T11:30:00.000Z"
  },
  "message": "Profile updated successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Product Endpoints */}
          <section id="products">
            <h2 className="text-3xl font-bold mb-6">Product Endpoints</h2>

            <div className="space-y-8">
              {/* List Products */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/products</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get all products for current seller</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "currency": "SAR",
      "stock": 50,
      "category": "Electronics",
      "images": ["https://example.com/image1.jpg"],
      "sellerId": "seller-123",
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z"
    }
  ]
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Get Product by ID */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/products/:id</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get specific product details</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Product ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "currency": "SAR",
    "stock": 50,
    "category": "Electronics",
    "images": ["https://example.com/image1.jpg"],
    "sellerId": "seller-123",
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Create Product */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/products</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Create a new product</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "currency": "SAR",
  "stock": 50,
  "category": "Electronics"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (201 Created):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "prod-124",
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "currency": "SAR",
    "stock": 50,
    "category": "Electronics",
    "images": [],
    "sellerId": "seller-123",
    "createdAt": "2025-11-13T12:00:00.000Z",
    "updatedAt": "2025-11-13T12:00:00.000Z"
  },
  "message": "Product created successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Update Product */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      PUT
                    </span>
                    <code className="text-lg">/api/v1/products/:id</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Update product details</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "Updated Product",
  "price": 89.99,
  "stock": 75
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": "Updated Product",
    "description": "Product description",
    "price": 89.99,
    "currency": "SAR",
    "stock": 75,
    "category": "Electronics",
    "images": ["https://example.com/image1.jpg"],
    "sellerId": "seller-123",
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T13:00:00.000Z"
  },
  "message": "Product updated successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Delete Product */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      DELETE
                    </span>
                    <code className="text-lg">/api/v1/products/:id</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Delete a product</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Product deleted successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Product Image */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/products/:id/image</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Upload product image</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Headers:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
Content-Type: multipart/form-data
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body (FormData):</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>image</code>: File (required)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/products/image-123.jpg"
  },
  "message": "Image uploaded successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Order Endpoints */}
          <section id="orders">
            <h2 className="text-3xl font-bold mb-6">Order Endpoints</h2>

            <div className="space-y-8">
              {/* List Orders */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/orders</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get all orders for current seller</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "orderNumber": "ORD-2025-001",
      "customerId": "cust-456",
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "items": [
        {
          "productId": "prod-123",
          "productName": "Product Name",
          "quantity": 2,
          "price": 99.99,
          "total": 199.98
        }
      ],
      "totalAmount": 199.98,
      "currency": "SAR",
      "status": "pending",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "Riyadh",
        "state": "Riyadh",
        "zipCode": "12345",
        "country": "Saudi Arabia"
      },
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z"
    }
  ]
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Get Order by ID */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/orders/:id</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get specific order details</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Order ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "ORD-2025-001",
    "customerId": "cust-456",
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "items": [
      {
        "productId": "prod-123",
        "productName": "Product Name",
        "quantity": 2,
        "price": 99.99,
        "total": 199.98
      }
    ],
    "totalAmount": 199.98,
    "currency": "SAR",
    "status": "pending",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Riyadh",
      "state": "Riyadh",
      "zipCode": "12345",
      "country": "Saudi Arabia"
    },
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Update Order Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      PUT
                    </span>
                    <code className="text-lg">/api/v1/orders/:id/status</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Update order status</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "status": "shipped"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Valid Status Values:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>pending</code></li>
                      <li><code>processing</code></li>
                      <li><code>shipped</code></li>
                      <li><code>delivered</code></li>
                      <li><code>cancelled</code></li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "ORD-2025-001",
    "status": "shipped",
    "updatedAt": "2025-11-13T14:00:00.000Z"
  },
  "message": "Order status updated successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Get Order Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/orders/stats</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get order statistics</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Seller only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "total": 150,
    "pending": 10,
    "processing": 25,
    "delivered": 100,
    "revenue": 15000.00
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Admin Endpoints */}
          <section id="admin">
            <h2 className="text-3xl font-bold mb-6">Admin Endpoints</h2>

            <div className="space-y-8">
              {/* Check Admin Role */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/admin/check-role</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Verify if user has admin role</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "isAdmin": true
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/admin/dashboard/stats</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get admin dashboard statistics</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalProducts": 450,
    "totalOrders": 780,
    "totalRevenue": 125000.00,
    "revenueGrowth": 15.5,
    "userGrowth": 8.2,
    "productGrowth": 12.3,
    "orderGrowth": 10.8
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Get Users */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/admin/users</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get list of users with pagination and search</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Query Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li><code>page</code>: Page number (default: 1)</li>
                      <li><code>limit</code>: Items per page (default: 10)</li>
                      <li><code>search</code>: Search by name or email</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "customer",
        "isVerified": true,
        "productsCount": 5,
        "joinedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "total": 1250,
    "page": 1,
    "totalPages": 125
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Get Cards */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg">/api/v1/admin/cards</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Get list of cards for management</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Query Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>status</code>: Filter by status (all, active, flagged, deleted)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "data": [
    {
      "id": "card-123",
      "title": "Business Card Title",
      "status": "active",
      "views": 1250,
      "clicks": 85,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "flagReason": null
    }
  ]
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Flag Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      PUT
                    </span>
                    <code className="text-lg">/api/v1/admin/cards/:id/flag</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Flag a card for review</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Card ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Request Body:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "reason": "Inappropriate content"
}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Card flagged successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Unflag Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      PUT
                    </span>
                    <code className="text-lg">/api/v1/admin/cards/:id/unflag</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Remove flag from a card</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Card ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Card unflagged successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Delete Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      DELETE
                    </span>
                    <code className="text-lg">/api/v1/admin/cards/:id</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Soft delete a card (can be restored)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Card ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Card deleted successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Permanent Delete Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      DELETE
                    </span>
                    <code className="text-lg">/api/v1/admin/cards/:id/permanent</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Permanently delete a card (cannot be restored)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Card ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Card permanently deleted"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Restore Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg">/api/v1/admin/cards/:id/restore</code>
                  </div>
                  <p className="text-muted-foreground mt-2">Restore a soft-deleted card</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Authentication:</p>
                    <p className="text-sm text-muted-foreground">Required (Bearer Token - Admin only)</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">URL Parameters:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li><code>id</code>: Card ID</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Success Response (200 OK):</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Card restored successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Common Responses */}
          <section id="common-responses">
            <h2 className="text-3xl font-bold mb-6">Common HTTP Status Codes</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">200 OK</p>
                    <p className="text-sm text-muted-foreground">Request successful</p>
                  </div>
                  <div>
                    <p className="font-semibold">201 Created</p>
                    <p className="text-sm text-muted-foreground">Resource created successfully</p>
                  </div>
                  <div>
                    <p className="font-semibold">400 Bad Request</p>
                    <p className="text-sm text-muted-foreground">Invalid request format or parameters</p>
                  </div>
                  <div>
                    <p className="font-semibold">401 Unauthorized</p>
                    <p className="text-sm text-muted-foreground">Missing or invalid authentication token</p>
                  </div>
                  <div>
                    <p className="font-semibold">403 Forbidden</p>
                    <p className="text-sm text-muted-foreground">Insufficient permissions</p>
                  </div>
                  <div>
                    <p className="font-semibold">404 Not Found</p>
                    <p className="text-sm text-muted-foreground">Resource not found</p>
                  </div>
                  <div>
                    <p className="font-semibold">422 Unprocessable Entity</p>
                    <p className="text-sm text-muted-foreground">Validation error</p>
                  </div>
                  <div>
                    <p className="font-semibold">429 Too Many Requests</p>
                    <p className="text-sm text-muted-foreground">Rate limit exceeded</p>
                  </div>
                  <div>
                    <p className="font-semibold">500 Internal Server Error</p>
                    <p className="text-sm text-muted-foreground">Server error</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Rate Limiting */}
          <section id="rate-limiting">
            <h2 className="text-3xl font-bold mb-6">Rate Limiting</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    API requests are rate limited to ensure fair usage and system stability.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">Free Tier:</p>
                      <p className="text-sm text-muted-foreground">100 requests per hour</p>
                    </div>
                    <div>
                      <p className="font-semibold">Basic Plan:</p>
                      <p className="text-sm text-muted-foreground">1,000 requests per hour</p>
                    </div>
                    <div>
                      <p className="font-semibold">Pro Plan:</p>
                      <p className="text-sm text-muted-foreground">10,000 requests per hour</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Rate limit information is included in response headers:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699876543
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default ApiDocs;
