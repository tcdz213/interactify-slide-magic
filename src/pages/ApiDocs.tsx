import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CreditCard, 
  Users, 
  Shield, 
  Clock, 
  Calendar,
  UserPlus,
  Settings,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="rounded-lg overflow-hidden border border-border my-4">
    {title && (
      <div className="bg-muted px-4 py-2 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
    )}
    <pre className="bg-card p-4 overflow-x-auto">
      <code className="text-sm text-foreground">{children}</code>
    </pre>
  </div>
);

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PATCH: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PUT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <Badge variant="outline" className={colors[method] || ''}>
      {method}
    </Badge>
  );
};

const Endpoint = ({ 
  method, 
  path, 
  description, 
  auth = true,
  role,
  children 
}: { 
  method: string; 
  path: string; 
  description: string; 
  auth?: boolean;
  role?: string;
  children?: React.ReactNode;
}) => (
  <div className="border border-border rounded-lg p-4 mb-4">
    <div className="flex items-center gap-3 mb-2">
      <MethodBadge method={method} />
      <code className="text-sm font-mono text-primary">{path}</code>
    </div>
    <p className="text-muted-foreground text-sm mb-2">{description}</p>
    <div className="flex items-center gap-2 text-xs">
      {auth ? (
        <Badge variant="secondary" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Auth Required
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">Public</Badge>
      )}
      {role && (
        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
          {role}
        </Badge>
      )}
    </div>
    {children}
  </div>
);

export default function ApiDocs() {
  return (
    <DashboardLayout
      title="API Documentation"
      description="Complete API reference for backend integration"
    >
      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Base Configuration</h2>
                <div className="grid gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Base URL</span>
                    <CodeBlock>{`http://localhost:3000/api/v1`}</CodeBlock>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Authentication</span>
                    <CodeBlock>{`Authorization: Bearer {access_token}`}</CodeBlock>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Content Type</span>
                    <CodeBlock>{`Content-Type: application/json`}</CodeBlock>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Response Format</h2>
                <CodeBlock title="Success Response">{`{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}`}</CodeBlock>
                <CodeBlock title="Error Response">{`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... },
    "requestId": "uuid"
  }
}`}</CodeBlock>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">HTTP Status Codes</h2>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-400">200</Badge>
                    <span className="text-muted-foreground">OK - Request successful</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-400">201</Badge>
                    <span className="text-muted-foreground">Created - Resource created</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-400">204</Badge>
                    <span className="text-muted-foreground">No Content - Deletion successful</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-500/20 text-yellow-400">400</Badge>
                    <span className="text-muted-foreground">Bad Request - Invalid input</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-500/20 text-red-400">401</Badge>
                    <span className="text-muted-foreground">Unauthorized - Authentication required</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-500/20 text-red-400">403</Badge>
                    <span className="text-muted-foreground">Forbidden - Insufficient permissions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-500/20 text-red-400">404</Badge>
                    <span className="text-muted-foreground">Not Found - Resource not found</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-500/20 text-red-400">500</Badge>
                    <span className="text-muted-foreground">Internal Error - Server error</span>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* AUTH TAB */}
        <TabsContent value="auth">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Authentication Endpoints</h2>
                <p className="text-muted-foreground text-sm mb-4">Base: <code className="text-primary">/api/v1/auth</code></p>
                
                <Endpoint method="POST" path="/register" description="Register a new user" auth={false}>
                  <CodeBlock title="Request Body">{`{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "customer",
  "phone": "+966501234567"
}`}</CodeBlock>
                  <CodeBlock title="Response (201)">{`{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "isVerified": false
    }
  },
  "message": "User registered successfully"
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="POST" path="/login" description="Authenticate user and get tokens" auth={false}>
                  <CodeBlock title="Request Body">{`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}</CodeBlock>
                  <CodeBlock title="Response (200)">{`{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="POST" path="/logout" description="Invalidate current session">
                  <CodeBlock title="Response (200)">{`{
  "success": true,
  "message": "Logged out successfully"
}`}</CodeBlock>
                </Endpoint>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">User Endpoints</h2>
                <p className="text-muted-foreground text-sm mb-4">Base: <code className="text-primary">/api/v1/user</code></p>

                <Endpoint method="GET" path="/me" description="Get current user profile">
                  <CodeBlock title="Response (200)">{`{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "phone": "+966501234567",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": true
  }
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="PUT" path="/profile" description="Update user profile">
                  <CodeBlock title="Request Body">{`{
  "name": "John Updated",
  "phone": "+966509876543",
  "avatar": "https://example.com/new-avatar.jpg"
}`}</CodeBlock>
                </Endpoint>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
                <p className="text-muted-foreground text-sm mb-4">Base: <code className="text-primary">/api/v1/billing</code></p>

                <Endpoint method="GET" path="/plans" description="Get all available subscription plans" auth={false}>
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "free",
      "name": "Free",
      "description": "For individuals and small teams",
      "monthlyPrice": 0,
      "yearlyPrice": 0,
      "features": ["Up to 3 products", "Up to 5 team members", ...],
      "limits": {
        "products": 3,
        "teamMembers": 5,
        "storage": "5GB",
        "advancedAnalytics": false,
        "apiAccess": false
      }
    },
    {
      "id": "pro",
      "name": "Pro",
      "monthlyPrice": 29,
      "yearlyPrice": 290,
      "popular": true,
      ...
    },
    {
      "id": "team",
      "name": "Team",
      "monthlyPrice": 79,
      "yearlyPrice": 790,
      ...
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "monthlyPrice": 299,
      "yearlyPrice": 2990,
      ...
    }
  ]
}`}</CodeBlock>
                </Endpoint>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>

                <Endpoint method="GET" path="/subscription" description="Get current subscription">
                  <CodeBlock title="Response (200)">{`{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "planId": "pro",
    "status": "active",
    "interval": "monthly",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "trialEndsAt": null
  }
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Status values:</strong> active, trial, cancelled, expired
                  </div>
                </Endpoint>

                <Endpoint method="POST" path="/subscription" description="Create new subscription">
                  <CodeBlock title="Request Body">{`{
  "planId": "pro",
  "interval": "monthly"
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Notes:</strong> Paid plans include 14-day trial. No payment required during trial.
                  </div>
                </Endpoint>

                <Endpoint method="PATCH" path="/subscription" description="Update subscription (upgrade/downgrade)">
                  <CodeBlock title="Request Body">{`{
  "planId": "team"
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Notes:</strong> Upgrades take effect immediately. Downgrades at period end.
                  </div>
                </Endpoint>

                <Endpoint method="DELETE" path="/subscription" description="Cancel subscription at period end">
                  <CodeBlock title="Response (200)">{`{
  "data": {
    "message": "Subscription will be cancelled at period end"
  }
}`}</CodeBlock>
                </Endpoint>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Usage & Invoices</h2>

                <Endpoint method="GET" path="/usage" description="Get current usage statistics">
                  <CodeBlock title="Response (200)">{`{
  "data": {
    "products": 5,
    "teamMembers": 12,
    "features": 45,
    "storage": 0
  }
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="GET" path="/invoices" description="Get all invoices">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "subscriptionId": "uuid",
      "amount": 29.00,
      "status": "paid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "paidAt": "2024-01-01T00:05:00.000Z",
      "invoiceUrl": "https://example.com/invoices/uuid.pdf"
    }
  ]
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Status values:</strong> paid, pending, failed
                  </div>
                </Endpoint>

                <Endpoint method="GET" path="/invoices/:id" description="Get invoice by ID" />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>

                <Endpoint method="GET" path="/payment-methods" description="Get all payment methods">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "type": "card",
      "last4": "4242",
      "brand": "Visa",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true
    }
  ]
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="POST" path="/payment-methods" description="Add payment method">
                  <CodeBlock title="Request Body">{`{
  "token": "stripe_payment_method_token"
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="DELETE" path="/payment-methods/:id" description="Delete payment method" />

                <Endpoint method="POST" path="/payment-methods/:id/default" description="Set as default payment method" />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Plan Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Feature</th>
                        <th className="text-center py-2 px-3">Free</th>
                        <th className="text-center py-2 px-3">Pro</th>
                        <th className="text-center py-2 px-3">Team</th>
                        <th className="text-center py-2 px-3">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">Monthly Price</td>
                        <td className="text-center py-2 px-3">$0</td>
                        <td className="text-center py-2 px-3">$29</td>
                        <td className="text-center py-2 px-3">$79</td>
                        <td className="text-center py-2 px-3">$299</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">Products</td>
                        <td className="text-center py-2 px-3">3</td>
                        <td className="text-center py-2 px-3">10</td>
                        <td className="text-center py-2 px-3">50</td>
                        <td className="text-center py-2 px-3">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">Team Members</td>
                        <td className="text-center py-2 px-3">5</td>
                        <td className="text-center py-2 px-3">20</td>
                        <td className="text-center py-2 px-3">100</td>
                        <td className="text-center py-2 px-3">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">Storage</td>
                        <td className="text-center py-2 px-3">5GB</td>
                        <td className="text-center py-2 px-3">50GB</td>
                        <td className="text-center py-2 px-3">200GB</td>
                        <td className="text-center py-2 px-3">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">Advanced Analytics</td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">Custom Workflows</td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3">SSO Integration</td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">API Access</td>
                        <td className="text-center py-2 px-3"><XCircle className="w-4 h-4 mx-auto text-muted-foreground" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                        <td className="text-center py-2 px-3"><CheckCircle className="w-4 h-4 mx-auto text-primary" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                <p className="text-muted-foreground text-sm mb-4">Base: <code className="text-primary">/api/v1/team</code></p>

                <Endpoint method="GET" path="/" description="Get all team members">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "frontend_dev",
      "permissions": ["view_only", "edit"],
      "skills": ["React", "TypeScript", "CSS"],
      "workload": [...],
      "availability": [...],
      "status": "active",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "lastActive": "2024-01-20T14:30:00.000Z"
    }
  ]
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="GET" path="/:id" description="Get team member by ID" />

                <Endpoint method="POST" path="/invite" description="Invite new team member" role="Admin">
                  <CodeBlock title="Request Body">{`{
  "email": "newmember@example.com",
  "name": "Jane Smith",
  "role": "backend_dev"
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Valid roles:</strong> business_owner, product_owner, technical_leader, ui_ux_designer, frontend_dev, backend_dev, mobile_android, mobile_ios, qa_tester, project_manager
                  </div>
                </Endpoint>

                <Endpoint method="PATCH" path="/:id" description="Update team member" role="Admin, Moderator">
                  <CodeBlock title="Request Body">{`{
  "name": "John Smith",
  "role": "technical_leader",
  "skills": ["React", "Node.js", "AWS"],
  "avatar": "https://example.com/new-avatar.jpg"
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="DELETE" path="/:id" description="Remove team member" role="Admin" />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Invitations</h2>

                <Endpoint method="GET" path="/invitations/pending" description="Get pending invitations" role="Admin">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "backend_dev",
      "status": "invited",
      "joinedAt": "2024-01-20T00:00:00.000Z"
    }
  ]
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="POST" path="/:id/resend-invitation" description="Resend invitation email" role="Admin" />

                <Endpoint method="DELETE" path="/:id/invitation" description="Cancel pending invitation" role="Admin" />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Member Roles</h2>

                <Endpoint method="GET" path="/:id/roles" description="Get member roles">
                  <CodeBlock title="Response (200)">{`{
  "data": ["frontend_dev"]
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="POST" path="/:id/roles" description="Assign role" role="Admin">
                  <CodeBlock title="Request Body">{`{
  "role": "technical_leader"
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="DELETE" path="/:id/roles/:role" description="Remove role" role="Admin" />

                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Role Permissions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2">Role</th>
                          <th className="text-center py-2 px-2">View</th>
                          <th className="text-center py-2 px-2">Edit</th>
                          <th className="text-center py-2 px-2">Approve</th>
                          <th className="text-center py-2 px-2">Delete</th>
                          <th className="text-center py-2 px-2">Manage Users</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-2">business_owner</td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-2">product_owner</td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><XCircle className="w-3 h-3 mx-auto text-muted-foreground" /></td>
                          <td className="text-center"><XCircle className="w-3 h-3 mx-auto text-muted-foreground" /></td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-2">project_manager</td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><XCircle className="w-3 h-3 mx-auto text-muted-foreground" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">developers / designers</td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><CheckCircle className="w-3 h-3 mx-auto text-primary" /></td>
                          <td className="text-center"><XCircle className="w-3 h-3 mx-auto text-muted-foreground" /></td>
                          <td className="text-center"><XCircle className="w-3 h-3 mx-auto text-muted-foreground" /></td>
                          <td className="text-center"><XCircle className="w-3 h-3 mx-auto text-muted-foreground" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Availability & Skills</h2>

                <Endpoint method="PATCH" path="/:id/availability" description="Update member availability">
                  <CodeBlock title="Request Body">{`{
  "availability": [
    { "date": "2024-01-20", "status": "available", "notes": null },
    { "date": "2024-01-21", "status": "busy", "notes": "Client meeting" },
    { "date": "2024-01-22", "status": "out_of_office", "notes": "Personal" }
  ]
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Status values:</strong> available, busy, out_of_office
                  </div>
                </Endpoint>

                <Endpoint method="PATCH" path="/:id/skills" description="Update member skills">
                  <CodeBlock title="Request Body">{`{
  "skills": ["React", "Node.js", "PostgreSQL", "AWS", "Docker"]
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="GET" path="/search?skills=React,TypeScript" description="Search members by skills" />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Workload</h2>

                <Endpoint method="GET" path="/:id/tasks" description="Get member's assigned tasks">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "title": "Implement user authentication",
      "estimatedHours": 16,
      "dueDate": "2024-01-25T00:00:00.000Z",
      "status": "in_progress",
      "priority": "high"
    }
  ]
}`}</CodeBlock>
                </Endpoint>

                <Endpoint method="GET" path="/:id/bugs" description="Get member's assigned bugs" />

                <Endpoint method="GET" path="/workload" description="Get workload distribution">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "memberId": "uuid",
      "memberName": "John Doe",
      "totalHours": 32,
      "capacity": 40,
      "utilizationPercent": 80,
      "taskCount": 4,
      "bugCount": 2
    }
  ]
}`}</CodeBlock>
                </Endpoint>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Time Off</h2>

                <Endpoint method="POST" path="/:id/timeoff" description="Request time off">
                  <CodeBlock title="Request Body">{`{
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "type": "vacation",
  "reason": "Family vacation"
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Type values:</strong> vacation, sick, personal, other<br/>
                    <strong>Status values:</strong> pending, approved, rejected
                  </div>
                </Endpoint>

                <Endpoint method="GET" path="/timeoff" description="Get all time off requests" />

                <Endpoint method="GET" path="/calendar?startDate=2024-01-01&endDate=2024-01-31" description="Get team calendar">
                  <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "type": "timeoff",
      "title": "John Doe - Vacation",
      "startDate": "2024-01-15",
      "endDate": "2024-01-19",
      "allDay": true,
      "memberId": "uuid"
    },
    {
      "id": "uuid",
      "type": "sprint",
      "title": "Sprint 12",
      "startDate": "2024-01-08",
      "endDate": "2024-01-21",
      "allDay": true,
      "memberId": null
    }
  ]
}`}</CodeBlock>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Event types:</strong> sprint, release, meeting, timeoff
                  </div>
                </Endpoint>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Team Member Object</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Field</th>
                        <th className="text-left py-2 px-3">Type</th>
                        <th className="text-left py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">id</td>
                        <td className="py-2 px-3">UUID</td>
                        <td className="py-2 px-3">Unique identifier</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">userId</td>
                        <td className="py-2 px-3">UUID</td>
                        <td className="py-2 px-3">Associated user ID</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">name</td>
                        <td className="py-2 px-3">string</td>
                        <td className="py-2 px-3">Display name</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">email</td>
                        <td className="py-2 px-3">string</td>
                        <td className="py-2 px-3">Email address</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">role</td>
                        <td className="py-2 px-3">string</td>
                        <td className="py-2 px-3">Team role</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">permissions</td>
                        <td className="py-2 px-3">string[]</td>
                        <td className="py-2 px-3">Role-based permissions</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">skills</td>
                        <td className="py-2 px-3">string[]</td>
                        <td className="py-2 px-3">Technical skills</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">status</td>
                        <td className="py-2 px-3">string</td>
                        <td className="py-2 px-3">active, invited, inactive</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-mono text-xs">workload</td>
                        <td className="py-2 px-3">object[]</td>
                        <td className="py-2 px-3">Assigned tasks</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono text-xs">availability</td>
                        <td className="py-2 px-3">object[]</td>
                        <td className="py-2 px-3">Schedule</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}