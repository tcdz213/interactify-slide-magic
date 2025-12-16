// Feature types matching the API documentation

export type FeatureStatus = 
  | 'idea' 
  | 'review' 
  | 'approved' 
  | 'planning' 
  | 'design' 
  | 'development' 
  | 'testing' 
  | 'release' 
  | 'live' 
  | 'rejected';

export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';

export type FeaturePlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: FeaturePriority;
  productId: string;
  productName: string;
  platform?: FeaturePlatform;
  requestedBy: string;
  requestedByName: string;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  sprintName?: string;
  votes: number;
  votedBy: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequest {
  title: string;
  description: string;
  priority: FeaturePriority;
  productId: string;
  tags?: string[];
  dueDate?: string;
}

export interface UpdateFeatureRequest {
  title?: string;
  description?: string;
  priority?: FeaturePriority;
  estimatedHours?: number;
  tags?: string[];
  dueDate?: string;
  assigneeId?: string;
}

export interface FeatureListParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  productId?: string;
  platform?: FeaturePlatform;
  assigneeId?: string;
  sprintId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FeatureListResponse {
  data: Feature[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Approval Workflow Types
export type GateType = 'design_review' | 'technical_review' | 'security_review' | 'release_approval';
export type GateStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';
export type WorkflowStatus = 'in_progress' | 'completed' | 'rejected';

export interface ApprovalGate {
  id: string;
  type: GateType;
  label: string;
  order: number;
  status: GateStatus;
  assignedTo?: string;
  assignedToName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  comments: GateComment[];
}

export interface GateComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  featureId: string;
  status: WorkflowStatus;
  currentGateIndex: number;
  gates: ApprovalGate[];
  createdAt: string;
  updatedAt: string;
}
