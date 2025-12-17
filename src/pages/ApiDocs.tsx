import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CreditCard, 
  Users, 
  Shield, 
  FileText,
  Code,
  Terminal,
  Zap
} from 'lucide-react';

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="rounded-lg overflow-hidden border border-cobalt-500/30 my-4">
    {title && (
      <div className="bg-cobalt-600/20 px-4 py-2 border-b border-cobalt-500/30">
        <span className="text-sm font-medium text-cobalt-200">{title}</span>
      </div>
    )}
    <pre className="bg-cobalt-900/40 p-4 overflow-x-auto">
      <code className="text-sm text-cobalt-100 font-mono">{children}</code>
    </pre>
  </div>
);

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    POST: 'bg-cobalt-500/20 text-cobalt-300 border-cobalt-500/40',
    PATCH: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    PUT: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    DELETE: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };
  return (
    <Badge variant="outline" className={`${colors[method] || ''} font-mono font-semibold`}>
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
  <div className="border border-cobalt-500/20 rounded-lg p-4 mb-4 bg-cobalt-900/20 hover:bg-cobalt-900/30 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      <MethodBadge method={method} />
      <code className="text-sm font-mono text-cobalt-300">{path}</code>
    </div>
    <p className="text-cobalt-200/80 text-sm mb-2">{description}</p>
    <div className="flex items-center gap-2 text-xs">
      {auth ? (
        <Badge variant="secondary" className="text-xs bg-cobalt-600/30 text-cobalt-200 border-cobalt-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Auth Required
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs border-cobalt-500/30 text-cobalt-300">Public</Badge>
      )}
      {role && (
        <Badge variant="outline" className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/40">
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
      description="Complete API reference for DevFlow integration"
    >
      <div className="bg-gradient-to-br from-cobalt-900/50 via-cobalt-800/30 to-background rounded-xl border border-cobalt-500/20 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-cobalt-600/30 border border-cobalt-500/30">
            <Terminal className="w-6 h-6 text-cobalt-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cobalt-100">DevFlow API v1</h2>
            <p className="text-sm text-cobalt-300/70">RESTful API for seamless integration</p>
          </div>
          <Badge className="ml-auto bg-cobalt-500/30 text-cobalt-200 border-cobalt-400/40">
            <Zap className="w-3 h-3 mr-1" />
            Stable
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-cobalt-900/50 border border-cobalt-500/20">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-cobalt-600/40 data-[state=active]:text-cobalt-100">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2 data-[state=active]:bg-cobalt-600/40 data-[state=active]:text-cobalt-100">
              <Shield className="w-4 h-4" />
              Auth
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2 data-[state=active]:bg-cobalt-600/40 data-[state=active]:text-cobalt-100">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-cobalt-600/40 data-[state=active]:text-cobalt-100">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-6 pr-4">
                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-5 h-5 text-cobalt-400" />
                    <h2 className="text-xl font-semibold text-cobalt-100">Base Configuration</h2>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <span className="text-sm text-cobalt-300/70">Base URL</span>
                      <CodeBlock>{`https://api.devflow.io/v1`}</CodeBlock>
                    </div>
                    <div>
                      <span className="text-sm text-cobalt-300/70">Authentication</span>
                      <CodeBlock>{`Authorization: Bearer {access_token}`}</CodeBlock>
                    </div>
                    <div>
                      <span className="text-sm text-cobalt-300/70">Content Type</span>
                      <CodeBlock>{`Content-Type: application/json`}</CodeBlock>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Response Format</h2>
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

                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">HTTP Status Codes</h2>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">200</Badge>
                      <span className="text-cobalt-200/80">OK - Request successful</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">201</Badge>
                      <span className="text-cobalt-200/80">Created - Resource created</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">204</Badge>
                      <span className="text-cobalt-200/80">No Content - Deletion successful</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">400</Badge>
                      <span className="text-cobalt-200/80">Bad Request - Invalid input</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">401</Badge>
                      <span className="text-cobalt-200/80">Unauthorized - Authentication required</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">403</Badge>
                      <span className="text-cobalt-200/80">Forbidden - Insufficient permissions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">404</Badge>
                      <span className="text-cobalt-200/80">Not Found - Resource not found</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">500</Badge>
                      <span className="text-cobalt-200/80">Internal Error - Server error</span>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* AUTH TAB */}
          <TabsContent value="auth">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-6 pr-4">
                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Authentication Endpoints</h2>
                  <p className="text-cobalt-300/70 text-sm mb-4">Base: <code className="text-cobalt-300 bg-cobalt-800/50 px-2 py-0.5 rounded">/api/v1/auth</code></p>
                  
                  <Endpoint method="POST" path="/register" description="Register a new developer account" auth={false}>
                    <CodeBlock title="Request Body">{`{
  "email": "dev@example.com",
  "password": "securePassword123",
  "name": "Alex Developer",
  "role": "developer"
}`}</CodeBlock>
                    <CodeBlock title="Response (201)">{`{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "dev@example.com",
      "name": "Alex Developer",
      "role": "developer",
      "isVerified": false
    }
  },
  "message": "User registered successfully"
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="POST" path="/login" description="Authenticate and get tokens" auth={false}>
                    <CodeBlock title="Request Body">{`{
  "email": "dev@example.com",
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

                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">User Profile</h2>
                  <p className="text-cobalt-300/70 text-sm mb-4">Base: <code className="text-cobalt-300 bg-cobalt-800/50 px-2 py-0.5 rounded">/api/v1/user</code></p>

                  <Endpoint method="GET" path="/me" description="Get current user profile">
                    <CodeBlock title="Response (200)">{`{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "dev@example.com",
    "name": "Alex Developer",
    "role": "developer",
    "avatar": "https://...",
    "isVerified": true
  }
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="PUT" path="/profile" description="Update user profile">
                    <CodeBlock title="Request Body">{`{
  "name": "Alex Senior Dev",
  "avatar": "https://..."
}`}</CodeBlock>
                  </Endpoint>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* TEAM TAB */}
          <TabsContent value="team">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-6 pr-4">
                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Team Management</h2>
                  <p className="text-cobalt-300/70 text-sm mb-4">Base: <code className="text-cobalt-300 bg-cobalt-800/50 px-2 py-0.5 rounded">/api/v1/team</code></p>

                  <Endpoint method="GET" path="/members" description="List all team members">
                    <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "name": "Alex Developer",
      "email": "alex@team.io",
      "role": "lead",
      "avatar": "https://...",
      "status": "active"
    }
  ]
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="POST" path="/invite" description="Invite new team member" role="Admin">
                    <CodeBlock title="Request Body">{`{
  "email": "newdev@team.io",
  "role": "developer"
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="PATCH" path="/members/:id" description="Update member role" role="Admin">
                    <CodeBlock title="Request Body">{`{
  "role": "lead"
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="DELETE" path="/members/:id" description="Remove team member" role="Admin" />
                </Card>

                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Workload & Assignments</h2>

                  <Endpoint method="GET" path="/workload" description="Get team workload overview">
                    <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "memberId": "uuid",
      "name": "Alex Developer",
      "assignedTasks": 8,
      "completedTasks": 45,
      "storyPoints": 21,
      "availability": 0.8
    }
  ]
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="POST" path="/assignments" description="Assign task to member">
                    <CodeBlock title="Request Body">{`{
  "taskId": "uuid",
  "memberId": "uuid"
}`}</CodeBlock>
                  </Endpoint>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* BILLING TAB */}
          <TabsContent value="billing">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-6 pr-4">
                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Subscription Plans</h2>
                  <p className="text-cobalt-300/70 text-sm mb-4">Base: <code className="text-cobalt-300 bg-cobalt-800/50 px-2 py-0.5 rounded">/api/v1/billing</code></p>

                  <Endpoint method="GET" path="/plans" description="Get available plans" auth={false}>
                    <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "free",
      "name": "Starter",
      "monthlyPrice": 0,
      "features": ["3 projects", "5 team members"],
      "limits": { "projects": 3, "members": 5 }
    },
    {
      "id": "pro",
      "name": "Pro",
      "monthlyPrice": 29,
      "popular": true
    },
    {
      "id": "team",
      "name": "Team",
      "monthlyPrice": 79
    }
  ]
}`}</CodeBlock>
                  </Endpoint>
                </Card>

                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Subscription Management</h2>

                  <Endpoint method="GET" path="/subscription" description="Get current subscription">
                    <CodeBlock title="Response (200)">{`{
  "data": {
    "id": "uuid",
    "planId": "pro",
    "status": "active",
    "currentPeriodEnd": "2024-02-01T00:00:00Z"
  }
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="POST" path="/subscription" description="Create subscription">
                    <CodeBlock title="Request Body">{`{
  "planId": "pro",
  "interval": "monthly"
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="DELETE" path="/subscription" description="Cancel subscription" />
                </Card>

                <Card className="p-6 bg-cobalt-900/30 border-cobalt-500/20">
                  <h2 className="text-xl font-semibold mb-4 text-cobalt-100">Payment Methods</h2>

                  <Endpoint method="GET" path="/payment-methods" description="List payment methods">
                    <CodeBlock title="Response (200)">{`{
  "data": [
    {
      "id": "uuid",
      "type": "card",
      "last4": "4242",
      "brand": "Visa",
      "isDefault": true
    }
  ]
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="POST" path="/payment-methods" description="Add payment method">
                    <CodeBlock title="Request Body">{`{
  "token": "stripe_pm_token"
}`}</CodeBlock>
                  </Endpoint>

                  <Endpoint method="DELETE" path="/payment-methods/:id" description="Remove payment method" />
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
