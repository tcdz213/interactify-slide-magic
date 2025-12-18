// Admin Dashboard Types

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'owner' | 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  workspaceId: string;
  workspaceName: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBillingRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  workspaceId: string;
  workspaceName: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  type: 'bug' | 'feedback' | 'support' | 'feature_request';
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  totalWorkspaces: number;
  totalProjects: number;
  openReports: number;
  resolvedReports: number;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminBillingListParams {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  search?: string;
}

export interface AdminReportListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// CORS Management Types
export interface CorsConfig {
  enabled: boolean;
  origins: string[];
  credentials: boolean;
}

export interface CorsResponse {
  message: string;
  config: CorsConfig;
}
