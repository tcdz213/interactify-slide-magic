export type ActivityAction = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export' 
  | 'import'
  | 'approve'
  | 'reject'
  | 'deploy'
  | 'rollback'
  | 'settings_change'
  | 'role_change'
  | 'password_change'
  | '2fa_enable'
  | '2fa_disable';

export type ResourceType = 
  | 'user' 
  | 'product' 
  | 'feature' 
  | 'bug' 
  | 'task' 
  | 'sprint' 
  | 'release' 
  | 'team' 
  | 'settings'
  | 'billing'
  | 'api_key';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  action: ActivityAction;
  resourceType: ResourceType;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityLogsQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: ActivityAction;
  resourceType?: ResourceType;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
