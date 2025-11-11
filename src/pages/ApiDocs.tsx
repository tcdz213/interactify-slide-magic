import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Code, Lock, Server, Users, Package, ShoppingCart, BarChart3, CreditCard, Shield, FileText, Bell } from "lucide-react";

const ApiDocs = () => {
  const apiCategories = [
    {
      id: "auth",
      name: "Authentication & Users",
      icon: Lock,
      color: "bg-primary",
      endpoints: [
        {
          method: "POST",
          path: "/api/v1/auth/register",
          description: "Register a new user (seller or customer)",
          headers: { "Content-Type": "application/json" },
          body: {
            email: "user@example.com",
            password: "securePassword123",
            name: "John Doe",
            role: "seller",
            phone: "+966501234567"
          },
          response: {
            success: true,
            data: {
              user: {
                id: "uuid-v4",
                email: "user@example.com",
                name: "John Doe",
                role: "seller",
                createdAt: "2024-01-15T10:30:00Z"
              },
              access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              expires_in: 3600
            },
            message: "User registered successfully"
          }
        },
        {
          method: "POST",
          path: "/api/v1/auth/login",
          description: "Login with email and password",
          headers: { "Content-Type": "application/json" },
          body: {
            email: "user@example.com",
            password: "securePassword123"
          },
          response: {
            success: true,
            data: {
              user: {
                id: "uuid-v4",
                email: "user@example.com",
                name: "John Doe",
                role: "seller",
                isVerified: true
              },
              access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              expires_in: 3600
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/auth/google",
          description: "Login with Google OAuth",
          headers: { "Content-Type": "application/json" },
          body: {
            idToken: "google_id_token_here"
          },
          response: {
            success: true,
            data: {
              user: { id: "uuid-v4", email: "user@gmail.com", name: "User Name", role: "customer" },
              access_token: "jwt_token",
              refresh_token: "refresh_token"
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/auth/logout",
          description: "Logout and invalidate token",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            message: "Logged out successfully"
          }
        },
        {
          method: "POST",
          path: "/api/v1/auth/refresh",
          description: "Refresh access token using refresh token",
          headers: { "Content-Type": "application/json" },
          body: {
            refresh_token: "refresh_token_here"
          },
          response: {
            success: true,
            data: {
              access_token: "new_jwt_token",
              refresh_token: "new_refresh_token",
              expires_in: 3600
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/user/me",
          description: "Get current user profile",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              email: "user@example.com",
              name: "John Doe",
              role: "seller",
              phone: "+966501234567",
              avatar: "https://cdn.example.com/avatars/user.jpg",
              isVerified: true,
              createdAt: "2024-01-15T10:30:00Z",
              updatedAt: "2024-01-20T14:22:00Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/user/profile",
          description: "Update user profile",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            name: "John Smith",
            phone: "+966501234567",
            avatar: "https://cdn.example.com/avatars/new-avatar.jpg",
            address: "Riyadh, Saudi Arabia"
          },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              email: "user@example.com",
              name: "John Smith",
              phone: "+966501234567",
              avatar: "https://cdn.example.com/avatars/new-avatar.jpg",
              address: "Riyadh, Saudi Arabia"
            },
            message: "Profile updated successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/check-role",
          description: "Check if user has admin role",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              isAdmin: true,
              role: "admin",
              permissions: ["users.read", "users.write", "products.manage", "orders.manage"]
            }
          }
        }
      ]
    },
    {
      id: "verification",
      name: "Verification System",
      icon: FileText,
      color: "bg-accent",
      endpoints: [
        {
          method: "POST",
          path: "/api/v1/verification/upload",
          description: "Upload verification documents (seller verification)",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "multipart/form-data" },
          body: {
            documentType: "national_id|commercial_register|tax_certificate",
            file: "[binary file data]",
            documentNumber: "1234567890"
          },
          response: {
            success: true,
            data: {
              verificationId: "uuid-v4",
              documentType: "national_id",
              status: "pending",
              uploadedAt: "2024-01-15T10:30:00Z"
            },
            message: "Document uploaded successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/verification/status",
          description: "Get verification status for current user",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              status: "pending|approved|rejected",
              documents: [
                {
                  id: "uuid-v4",
                  documentType: "national_id",
                  status: "approved",
                  uploadedAt: "2024-01-15T10:30:00Z",
                  reviewedAt: "2024-01-16T09:15:00Z"
                }
              ],
              rejectionReason: null
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/verification/approve",
          description: "Approve user verification (Admin only)",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            userId: "uuid-v4",
            verificationId: "uuid-v4",
            notes: "All documents verified"
          },
          response: {
            success: true,
            message: "Verification approved",
            data: {
              userId: "uuid-v4",
              status: "approved",
              approvedBy: "admin-uuid",
              approvedAt: "2024-01-16T09:15:00Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/verification/reject",
          description: "Reject user verification (Admin only)",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            userId: "uuid-v4",
            verificationId: "uuid-v4",
            reason: "Document quality is insufficient"
          },
          response: {
            success: true,
            message: "Verification rejected",
            data: {
              userId: "uuid-v4",
              status: "rejected",
              rejectedBy: "admin-uuid",
              rejectedAt: "2024-01-16T09:15:00Z",
              reason: "Document quality is insufficient"
            }
          }
        }
      ]
    },
    {
      id: "products",
      name: "Products (Seller)",
      icon: Package,
      color: "bg-success",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/products",
          description: "Get all products for the seller",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { page: 1, limit: 20, search: "product name", sortBy: "createdAt|name|price", order: "asc|desc" },
          response: {
            success: true,
            data: {
              products: [
                {
                  id: "uuid-v4",
                  name: "Product Name",
                  description: "Product description",
                  price: 99.99,
                  stock: 50,
                  category: "Electronics",
                  images: ["url1", "url2"],
                  status: "active",
                  createdAt: "2024-01-15T10:30:00Z"
                }
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 150,
                totalPages: 8
              }
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/products",
          description: "Create a new product",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            name: "New Product",
            description: "Product description here",
            price: 149.99,
            stock: 100,
            category: "Electronics",
            sku: "PROD-001",
            images: ["https://cdn.example.com/product1.jpg"]
          },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              name: "New Product",
              description: "Product description here",
              price: 149.99,
              stock: 100,
              category: "Electronics",
              sku: "PROD-001",
              sellerId: "seller-uuid",
              status: "active",
              createdAt: "2024-01-20T11:45:00Z"
            },
            message: "Product created successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/products/:id",
          description: "Get product details by ID",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              name: "Product Name",
              description: "Detailed product description",
              price: 99.99,
              stock: 50,
              category: "Electronics",
              images: ["url1", "url2", "url3"],
              specifications: { color: "Black", size: "Medium" },
              status: "active",
              createdAt: "2024-01-15T10:30:00Z",
              updatedAt: "2024-01-20T14:22:00Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/products/:id",
          description: "Update product details",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            name: "Updated Product Name",
            description: "Updated description",
            price: 129.99,
            stock: 75,
            status: "active|inactive"
          },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              name: "Updated Product Name",
              price: 129.99,
              stock: 75,
              updatedAt: "2024-01-21T10:15:00Z"
            },
            message: "Product updated successfully"
          }
        },
        {
          method: "DELETE",
          path: "/api/v1/products/:id",
          description: "Delete a product",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            message: "Product deleted successfully"
          }
        },
        {
          method: "POST",
          path: "/api/v1/products/:id/images",
          description: "Upload product images",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "multipart/form-data" },
          body: {
            images: "[array of binary file data]"
          },
          response: {
            success: true,
            data: {
              productId: "uuid-v4",
              images: [
                { url: "https://cdn.example.com/img1.jpg", order: 1 },
                { url: "https://cdn.example.com/img2.jpg", order: 2 }
              ]
            },
            message: "Images uploaded successfully"
          }
        }
      ]
    },
    {
      id: "orders",
      name: "Orders (Seller)",
      icon: ShoppingCart,
      color: "bg-primary",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/orders",
          description: "Get all orders for the seller",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { page: 1, limit: 20, status: "pending|processing|completed|cancelled", search: "order number" },
          response: {
            success: true,
            data: {
              orders: [
                {
                  id: "uuid-v4",
                  orderNumber: "ORD-20240115-001",
                  customer: { id: "customer-uuid", name: "Customer Name", email: "customer@example.com" },
                  items: [{ productId: "product-uuid", name: "Product Name", quantity: 2, price: 99.99 }],
                  total: 199.98,
                  status: "pending",
                  createdAt: "2024-01-15T10:30:00Z"
                }
              ],
              pagination: { page: 1, limit: 20, total: 45, totalPages: 3 }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/orders/:id",
          description: "Get order details by ID",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              orderNumber: "ORD-20240115-001",
              customer: {
                id: "customer-uuid",
                name: "Customer Name",
                email: "customer@example.com",
                phone: "+966501234567"
              },
              items: [
                {
                  productId: "product-uuid",
                  name: "Product Name",
                  quantity: 2,
                  price: 99.99,
                  subtotal: 199.98
                }
              ],
              subtotal: 199.98,
              shippingCost: 20.00,
              tax: 10.00,
              total: 229.98,
              status: "pending",
              shippingAddress: {
                street: "123 Main St",
                city: "Riyadh",
                country: "Saudi Arabia",
                postalCode: "12345"
              },
              paymentMethod: "credit_card",
              createdAt: "2024-01-15T10:30:00Z",
              updatedAt: "2024-01-15T10:30:00Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/orders/:id/status",
          description: "Update order status",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            status: "pending|processing|shipped|delivered|completed|cancelled",
            notes: "Order shipped via DHL",
            trackingNumber: "DHL123456789"
          },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              status: "shipped",
              trackingNumber: "DHL123456789",
              updatedAt: "2024-01-16T09:20:00Z"
            },
            message: "Order status updated successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/orders/stats",
          description: "Get order statistics for seller dashboard",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31" },
          response: {
            success: true,
            data: {
              totalOrders: 150,
              pendingOrders: 25,
              processingOrders: 40,
              completedOrders: 75,
              cancelledOrders: 10,
              totalRevenue: 15000.00,
              averageOrderValue: 100.00,
              topProducts: [
                { productId: "uuid", name: "Product 1", orders: 45, revenue: 4500 }
              ]
            }
          }
        }
      ]
    },
    {
      id: "analytics",
      name: "Analytics (Seller)",
      icon: BarChart3,
      color: "bg-accent",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/analytics/sales",
          description: "Get sales analytics data",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31", groupBy: "day|week|month" },
          response: {
            success: true,
            data: {
              period: { start: "2024-01-01", end: "2024-01-31" },
              totalSales: 15000.00,
              totalOrders: 150,
              salesByDate: [
                { date: "2024-01-01", sales: 500.00, orders: 5 },
                { date: "2024-01-02", sales: 750.00, orders: 8 }
              ],
              topProducts: [
                { productId: "uuid", name: "Product 1", sales: 3000, units: 30 }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/analytics/revenue",
          description: "Get revenue analytics",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31" },
          response: {
            success: true,
            data: {
              totalRevenue: 15000.00,
              netRevenue: 13500.00,
              fees: 1500.00,
              revenueByMonth: [
                { month: "2024-01", revenue: 15000.00, fees: 1500.00, net: 13500.00 }
              ],
              revenueByCategory: [
                { category: "Electronics", revenue: 8000.00, percentage: 53.3 }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/analytics/products",
          description: "Get product performance analytics",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31", sortBy: "sales|views|revenue" },
          response: {
            success: true,
            data: {
              topPerformers: [
                {
                  productId: "uuid",
                  name: "Product Name",
                  views: 1500,
                  sales: 45,
                  revenue: 4500.00,
                  conversionRate: 3.0
                }
              ],
              lowStock: [
                { productId: "uuid", name: "Product Name", stock: 5, salesVelocity: 10 }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/analytics/customers",
          description: "Get customer analytics",
          headers: { "Authorization": "Bearer {access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31" },
          response: {
            success: true,
            data: {
              totalCustomers: 250,
              newCustomers: 45,
              returningCustomers: 205,
              topCustomers: [
                {
                  customerId: "uuid",
                  name: "Customer Name",
                  totalOrders: 15,
                  totalSpent: 1500.00,
                  avgOrderValue: 100.00
                }
              ]
            }
          }
        }
      ]
    },
    {
      id: "subscriptions",
      name: "Subscriptions (User)",
      icon: CreditCard,
      color: "bg-success",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/subscriptions/plans",
          description: "Get available subscription plans",
          response: {
            success: true,
            data: {
              plans: [
                {
                  id: "plan-basic",
                  name: "Basic Plan",
                  price: 99.00,
                  currency: "SAR",
                  interval: "month",
                  features: ["Up to 50 products", "Basic analytics", "Email support"],
                  isPopular: false
                },
                {
                  id: "plan-pro",
                  name: "Pro Plan",
                  price: 299.00,
                  currency: "SAR",
                  interval: "month",
                  features: ["Unlimited products", "Advanced analytics", "Priority support", "Custom branding"],
                  isPopular: true
                }
              ]
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/subscriptions/subscribe",
          description: "Subscribe to a plan",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            planId: "plan-pro",
            paymentMethodId: "pm_stripe_token_or_method_id"
          },
          response: {
            success: true,
            data: {
              subscriptionId: "sub-uuid",
              planId: "plan-pro",
              status: "active",
              currentPeriodStart: "2024-01-15T00:00:00Z",
              currentPeriodEnd: "2024-02-15T00:00:00Z",
              nextBillingDate: "2024-02-15T00:00:00Z"
            },
            message: "Subscription activated successfully"
          }
        },
        {
          method: "POST",
          path: "/api/v1/subscriptions/cancel",
          description: "Cancel subscription",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            reason: "Too expensive|Not using enough|Found alternative|Other",
            feedback: "Optional feedback text"
          },
          response: {
            success: true,
            data: {
              subscriptionId: "sub-uuid",
              status: "cancelled",
              cancelledAt: "2024-01-20T10:30:00Z",
              validUntil: "2024-02-15T00:00:00Z"
            },
            message: "Subscription cancelled. Access until end of billing period."
          }
        },
        {
          method: "GET",
          path: "/api/v1/subscriptions/current",
          description: "Get current subscription details",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              subscriptionId: "sub-uuid",
              plan: {
                id: "plan-pro",
                name: "Pro Plan",
                price: 299.00,
                features: ["Unlimited products", "Advanced analytics"]
              },
              status: "active",
              currentPeriodStart: "2024-01-15T00:00:00Z",
              currentPeriodEnd: "2024-02-15T00:00:00Z",
              nextBillingDate: "2024-02-15T00:00:00Z",
              cancelAtPeriodEnd: false
            }
          }
        }
      ]
    },
    {
      id: "admin",
      name: "Admin Dashboard",
      icon: Shield,
      color: "bg-destructive",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/admin/dashboard/stats",
          description: "Get admin dashboard statistics",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            data: {
              users: { total: 1250, active: 1100, suspended: 150, newThisMonth: 85 },
              products: { total: 5420, active: 4800, inactive: 620, flagged: 45 },
              orders: { total: 8950, pending: 120, processing: 350, completed: 8200, cancelled: 280 },
              revenue: { total: 895000.00, thisMonth: 125000.00, lastMonth: 98000.00, growth: 27.55 },
              subscriptions: { active: 450, cancelled: 50, revenue: 134550.00 }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/users",
          description: "Get all users with pagination and filters",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { page: 1, limit: 20, role: "seller|customer|admin", status: "active|suspended", search: "user name or email" },
          response: {
            success: true,
            data: {
              users: [
                {
                  id: "uuid-v4",
                  name: "User Name",
                  email: "user@example.com",
                  role: "seller",
                  status: "active",
                  isVerified: true,
                  totalOrders: 45,
                  totalRevenue: 4500.00,
                  createdAt: "2024-01-15T10:30:00Z"
                }
              ],
              pagination: { page: 1, limit: 20, total: 1250, totalPages: 63 }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/users/:id",
          description: "Get specific user details",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              name: "User Name",
              email: "user@example.com",
              role: "seller",
              status: "active",
              isVerified: true,
              phone: "+966501234567",
              address: "Riyadh, Saudi Arabia",
              products: 25,
              orders: 150,
              revenue: 15000.00,
              subscription: { planId: "plan-pro", status: "active" },
              createdAt: "2024-01-15T10:30:00Z",
              lastLogin: "2024-01-20T14:30:00Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/users/:id/status",
          description: "Update user status (suspend/activate)",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            status: "active|suspended",
            reason: "Violation of terms of service"
          },
          response: {
            success: true,
            data: {
              userId: "uuid-v4",
              status: "suspended",
              updatedBy: "admin-uuid",
              updatedAt: "2024-01-20T15:00:00Z"
            },
            message: "User status updated successfully"
          }
        },
        {
          method: "DELETE",
          path: "/api/v1/admin/users/:id",
          description: "Delete user account (with confirmation)",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            message: "User deleted successfully"
          }
        }
      ]
    },
    {
      id: "admin-cards",
      name: "Admin - Cards Management",
      icon: Package,
      color: "bg-primary",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/admin/cards",
          description: "Get all cards (products) with filtering",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { page: 1, limit: 20, status: "all|active|flagged|deleted", search: "product name" },
          response: {
            success: true,
            data: {
              cards: [
                {
                  id: "uuid-v4",
                  name: "Product Name",
                  seller: { id: "seller-uuid", name: "Seller Name" },
                  price: 99.99,
                  stock: 50,
                  status: "active|flagged|deleted",
                  flagReason: "Reported by users",
                  flagCount: 3,
                  createdAt: "2024-01-15T10:30:00Z"
                }
              ],
              pagination: { page: 1, limit: 20, total: 5420, totalPages: 271 },
              stats: { total: 5420, active: 4800, flagged: 45, deleted: 120 }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/cards/:id",
          description: "Get specific card details",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            data: {
              id: "uuid-v4",
              name: "Product Name",
              description: "Product description",
              price: 99.99,
              seller: { id: "seller-uuid", name: "Seller Name", email: "seller@example.com" },
              images: ["url1", "url2"],
              status: "active",
              flags: [
                {
                  id: "flag-uuid",
                  reason: "Inappropriate content",
                  reporter: "user-uuid",
                  createdAt: "2024-01-20T10:00:00Z"
                }
              ],
              analytics: { views: 1500, sales: 45, revenue: 4500.00 }
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/cards/:id/flag",
          description: "Flag a card for review",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            reason: "Inappropriate content|Misleading information|Copyright violation|Other",
            notes: "Admin notes about the flag"
          },
          response: {
            success: true,
            data: {
              cardId: "uuid-v4",
              status: "flagged",
              flaggedBy: "admin-uuid",
              flaggedAt: "2024-01-20T15:00:00Z"
            },
            message: "Card flagged successfully"
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/cards/:id/unflag",
          description: "Remove flag from card",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            notes: "Reviewed and approved"
          },
          response: {
            success: true,
            data: {
              cardId: "uuid-v4",
              status: "active",
              unflaggedBy: "admin-uuid",
              unflaggedAt: "2024-01-21T09:30:00Z"
            },
            message: "Card unflagged successfully"
          }
        },
        {
          method: "DELETE",
          path: "/api/v1/admin/cards/:id",
          description: "Soft delete a card",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          body: {
            reason: "Violation of platform policies"
          },
          response: {
            success: true,
            message: "Card deleted successfully (soft delete)"
          }
        },
        {
          method: "DELETE",
          path: "/api/v1/admin/cards/:id/permanent",
          description: "Permanently delete a card",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            message: "Card permanently deleted"
          }
        },
        {
          method: "POST",
          path: "/api/v1/admin/cards/:id/restore",
          description: "Restore a soft-deleted card",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            data: {
              cardId: "uuid-v4",
              status: "active",
              restoredBy: "admin-uuid",
              restoredAt: "2024-01-22T10:00:00Z"
            },
            message: "Card restored successfully"
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/cards/:id/tags",
          description: "Update card tags",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            tags: ["featured", "trending", "bestseller"]
          },
          response: {
            success: true,
            data: {
              cardId: "uuid-v4",
              tags: ["featured", "trending", "bestseller"]
            },
            message: "Tags updated successfully"
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/cards/:id/schedule",
          description: "Schedule card publication",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            publishAt: "2024-02-01T00:00:00Z",
            unpublishAt: "2024-02-28T23:59:59Z"
          },
          response: {
            success: true,
            data: {
              cardId: "uuid-v4",
              publishAt: "2024-02-01T00:00:00Z",
              unpublishAt: "2024-02-28T23:59:59Z"
            },
            message: "Schedule updated successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/cards/:id/analytics",
          description: "Get detailed analytics for a card",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31" },
          response: {
            success: true,
            data: {
              views: 1500,
              uniqueViews: 1200,
              sales: 45,
              revenue: 4500.00,
              conversionRate: 3.0,
              viewsByDate: [{ date: "2024-01-01", views: 50 }],
              salesByDate: [{ date: "2024-01-01", sales: 2, revenue: 200 }]
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/admin/cards/export",
          description: "Export cards data (CSV/Excel)",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            format: "csv|xlsx",
            filters: {
              status: "all|active|flagged|deleted",
              dateRange: { start: "2024-01-01", end: "2024-01-31" }
            }
          },
          response: {
            success: true,
            data: {
              downloadUrl: "https://cdn.example.com/exports/cards-20240120.csv",
              expiresAt: "2024-01-20T18:00:00Z"
            },
            message: "Export generated successfully"
          }
        }
      ]
    },
    {
      id: "admin-subscriptions",
      name: "Admin - Subscriptions",
      icon: CreditCard,
      color: "bg-accent",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/admin/subscriptions",
          description: "Get all subscriptions",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { page: 1, limit: 20, status: "active|cancelled|expired", planId: "plan-uuid" },
          response: {
            success: true,
            data: {
              subscriptions: [
                {
                  id: "sub-uuid",
                  user: { id: "user-uuid", name: "User Name", email: "user@example.com" },
                  plan: { id: "plan-pro", name: "Pro Plan", price: 299.00 },
                  status: "active",
                  currentPeriodStart: "2024-01-15T00:00:00Z",
                  currentPeriodEnd: "2024-02-15T00:00:00Z",
                  createdAt: "2024-01-15T00:00:00Z"
                }
              ],
              pagination: { page: 1, limit: 20, total: 450, totalPages: 23 }
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/subscriptions/:id",
          description: "Get subscription details",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          response: {
            success: true,
            data: {
              id: "sub-uuid",
              user: { id: "user-uuid", name: "User Name", email: "user@example.com" },
              plan: { id: "plan-pro", name: "Pro Plan", price: 299.00 },
              status: "active",
              currentPeriodStart: "2024-01-15T00:00:00Z",
              currentPeriodEnd: "2024-02-15T00:00:00Z",
              paymentHistory: [
                { date: "2024-01-15", amount: 299.00, status: "paid" }
              ],
              createdAt: "2024-01-15T00:00:00Z"
            }
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/subscriptions/:id/activate",
          description: "Manually activate subscription",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            reason: "Manual activation for promotional offer"
          },
          response: {
            success: true,
            data: {
              subscriptionId: "sub-uuid",
              status: "active",
              activatedBy: "admin-uuid",
              activatedAt: "2024-01-20T10:00:00Z"
            },
            message: "Subscription activated successfully"
          }
        },
        {
          method: "PUT",
          path: "/api/v1/admin/subscriptions/:id/deactivate",
          description: "Manually deactivate subscription",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            reason: "Payment fraud detected"
          },
          response: {
            success: true,
            data: {
              subscriptionId: "sub-uuid",
              status: "cancelled",
              deactivatedBy: "admin-uuid",
              deactivatedAt: "2024-01-20T10:00:00Z"
            },
            message: "Subscription deactivated successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/subscriptions/revenue",
          description: "Get subscription revenue analytics",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31", groupBy: "day|week|month" },
          response: {
            success: true,
            data: {
              totalRevenue: 134550.00,
              mrr: 134550.00,
              arr: 1614600.00,
              revenueByPlan: [
                { planId: "plan-pro", planName: "Pro Plan", revenue: 89700.00, subscribers: 300 }
              ],
              revenueByDate: [
                { date: "2024-01-01", revenue: 4485.00, newSubscribers: 15 }
              ]
            }
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/subscriptions/subscribers",
          description: "Get subscriber growth analytics",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { startDate: "2024-01-01", endDate: "2024-01-31" },
          response: {
            success: true,
            data: {
              totalSubscribers: 450,
              activeSubscribers: 450,
              churnedSubscribers: 50,
              churnRate: 10.0,
              subscribersByPlan: [
                { planId: "plan-pro", planName: "Pro Plan", subscribers: 300 }
              ],
              growthByDate: [
                { date: "2024-01-01", new: 15, churned: 5, net: 10 }
              ]
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/admin/subscriptions/reminders",
          description: "Send payment renewal reminders",
          headers: { "Authorization": "Bearer {admin_access_token}", "Content-Type": "application/json" },
          body: {
            daysBeforeExpiry: 7,
            subscriptionIds: ["sub-uuid-1", "sub-uuid-2"]
          },
          response: {
            success: true,
            data: {
              sentCount: 45,
              failedCount: 2
            },
            message: "Reminders sent successfully"
          }
        },
        {
          method: "GET",
          path: "/api/v1/admin/subscriptions/export",
          description: "Export subscription data",
          headers: { "Authorization": "Bearer {admin_access_token}" },
          query: { format: "csv|xlsx", status: "active|cancelled|expired" },
          response: {
            success: true,
            data: {
              downloadUrl: "https://cdn.example.com/exports/subscriptions-20240120.csv",
              expiresAt: "2024-01-20T18:00:00Z"
            },
            message: "Export generated successfully"
          }
        }
      ]
    },
    {
      id: "pro-features",
      name: "Pro User Features",
      icon: Bell,
      color: "bg-success",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/pro/status",
          description: "Check pro subscription status",
          headers: { "Authorization": "Bearer {access_token}" },
          response: {
            success: true,
            data: {
              isPro: true,
              plan: { id: "plan-pro", name: "Pro Plan" },
              features: {
                unlimitedProducts: true,
                advancedAnalytics: true,
                prioritySupport: true,
                customBranding: true,
                exportCapabilities: true
              },
              validUntil: "2024-02-15T00:00:00Z"
            }
          }
        },
        {
          method: "POST",
          path: "/api/v1/cards/export/pdf",
          description: "Export business card as PDF (Pro only)",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            cardId: "uuid-v4",
            template: "modern|classic|minimal",
            includeQR: true
          },
          response: {
            success: true,
            data: {
              downloadUrl: "https://cdn.example.com/exports/card-20240120.pdf",
              expiresAt: "2024-01-20T18:00:00Z"
            },
            message: "PDF generated successfully"
          }
        },
        {
          method: "POST",
          path: "/api/v1/cards/export/vcard",
          description: "Export business card as vCard (Pro only)",
          headers: { "Authorization": "Bearer {access_token}", "Content-Type": "application/json" },
          body: {
            cardId: "uuid-v4"
          },
          response: {
            success: true,
            data: {
              vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD",
              downloadUrl: "https://cdn.example.com/exports/card-20240120.vcf"
            },
            message: "vCard generated successfully"
          }
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-success/10 text-success border-success/20";
      case "POST": return "bg-primary/10 text-primary border-primary/20";
      case "PUT": return "bg-accent/10 text-accent border-accent/20";
      case "PATCH": return "bg-accent/10 text-accent border-accent/20";
      case "DELETE": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="API Documentation - Complete Reference"
        description="Complete API documentation for the e-commerce platform. Learn how to integrate with authentication, products, orders, analytics, and admin endpoints."
        keywords="API documentation, REST API, e-commerce API, backend integration, developer docs"
      />
      
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">API Documentation</h1>
              <p className="text-muted-foreground">Complete API reference for all endpoints</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Base URL Info */}
        <Card className="p-6 mb-8 border-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Base URL</h3>
              <code className="block bg-muted px-4 py-3 rounded-lg text-sm font-mono">
                https://api.yourdomain.com/v1
              </code>
              <p className="text-sm text-muted-foreground mt-3">
                All API endpoints start with this base URL. Make sure to include authentication token in headers for protected endpoints.
              </p>
            </div>
          </div>
        </Card>

        {/* Authentication Info */}
        <Card className="p-6 mb-8 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This API uses JWT tokens for authentication. Include the token in the Authorization header:
              </p>
              <code className="block bg-background px-4 py-3 rounded-lg text-sm font-mono border">
                Authorization: Bearer YOUR_JWT_TOKEN
              </code>
            </div>
          </div>
        </Card>

        {/* API Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {apiCategories.map((category) => (
            <Card
              key={category.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
              onClick={() => document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.endpoints.length} endpoints
              </p>
            </Card>
          ))}
        </div>

        {/* Endpoints Documentation */}
        <div className="space-y-12">
          {apiCategories.map((category) => (
            <div key={category.id} id={category.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Badge variant="secondary">{category.endpoints.length} endpoints</Badge>
              </div>

              <div className="space-y-6">
                {category.endpoints.map((endpoint, idx) => (
                  <Card key={idx} className="overflow-hidden border-2 hover:border-primary/20 transition-all">
                    <div className="p-6">
                      {/* Endpoint Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Badge className={`${getMethodColor(endpoint.method)} border font-mono px-3 py-1 text-sm`}>
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1">
                          <code className="text-base font-mono font-semibold text-foreground">
                            {endpoint.path}
                          </code>
                          <p className="text-muted-foreground mt-2 text-sm">{endpoint.description}</p>
                        </div>
                      </div>

                      {/* Endpoint Details */}
                      <Tabs defaultValue={endpoint.body ? "body" : endpoint.query ? "query" : "response"} className="mt-4">
                        <TabsList className="grid w-full grid-cols-4">
                          {endpoint.headers && <TabsTrigger value="headers">Headers</TabsTrigger>}
                          {endpoint.query && <TabsTrigger value="query">Query Params</TabsTrigger>}
                          {endpoint.body && <TabsTrigger value="body">Request Body</TabsTrigger>}
                          <TabsTrigger value="response">Response</TabsTrigger>
                        </TabsList>

                        {endpoint.headers && (
                          <TabsContent value="headers" className="mt-4">
                            <div className="bg-muted/50 p-4 rounded-lg border">
                              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(endpoint.headers, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        {endpoint.query && (
                          <TabsContent value="query" className="mt-4">
                            <div className="bg-muted/50 p-4 rounded-lg border">
                              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(endpoint.query, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        {endpoint.body && (
                          <TabsContent value="body" className="mt-4">
                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(endpoint.body, null, 2)}
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        <TabsContent value="response" className="mt-4">
                          <div className="bg-success/5 border border-success/20 p-4 rounded-lg">
                            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(endpoint.response, null, 2)}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Error Codes */}
        <Card className="p-6 mt-12 border-2">
          <h2 className="text-2xl font-bold mb-6">HTTP Status Codes</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { code: "200", message: "OK - Request succeeded", color: "text-success" },
              { code: "201", message: "Created - Resource created successfully", color: "text-success" },
              { code: "204", message: "No Content - Request succeeded with no response body", color: "text-success" },
              { code: "400", message: "Bad Request - Invalid request format or parameters", color: "text-destructive" },
              { code: "401", message: "Unauthorized - Authentication required or token invalid", color: "text-destructive" },
              { code: "403", message: "Forbidden - Insufficient permissions", color: "text-destructive" },
              { code: "404", message: "Not Found - Resource doesn't exist", color: "text-destructive" },
              { code: "422", message: "Unprocessable Entity - Validation errors", color: "text-destructive" },
              { code: "429", message: "Too Many Requests - Rate limit exceeded", color: "text-destructive" },
              { code: "500", message: "Internal Server Error - Server-side error", color: "text-destructive" },
            ].map((error, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
                <Badge className={`font-mono ${error.color} border`}>{error.code}</Badge>
                <span className="text-sm">{error.message}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Rate Limiting */}
        <Card className="p-6 mt-8 border-2 border-accent/20 bg-accent/5">
          <h2 className="text-2xl font-bold mb-4">Rate Limiting</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Standard users:</strong> 100 requests per minute</p>
            <p>• <strong>Pro users:</strong> 1000 requests per minute</p>
            <p>• <strong>Admin users:</strong> Unlimited requests</p>
            <p className="mt-4">Rate limit headers are included in every response:</p>
            <code className="block bg-background px-4 py-3 rounded-lg text-xs font-mono border mt-2">
              X-RateLimit-Limit: 100{'\n'}
              X-RateLimit-Remaining: 95{'\n'}
              X-RateLimit-Reset: 1705834800
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;
