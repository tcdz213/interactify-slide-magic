export interface LinkedFeature {
  featureId: string;
  featureTitle: string;
}

export interface LinkedBugFix {
  bugId: string;
  bugTitle: string;
}

export interface PipelineStep {
  stage: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  startedAt: string | null;
  completedAt: string | null;
  logs: string | null;
}

export interface RollbackLog {
  id: string;
  version: string;
  reason: string;
  rolledBackAt: string;
  rolledBackBy: string;
  notes: string | null;
}

export interface Approver {
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  approvedAt: string | null;
}

export type ReleaseStatus = 'planning' | 'scheduled' | 'in_development' | 'testing' | 'staged' | 'released' | 'rolled_back';
export type ReleasePlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Release {
  id: string;
  version: string;
  buildId: string;
  productId: string;
  productName: string;
  platform: ReleasePlatform;
  status: ReleaseStatus;
  releaseDate: string | null;
  plannedDate: string | null;
  features: LinkedFeature[];
  bugFixes: LinkedBugFix[];
  testCoverage: number;
  pipeline: PipelineStep[];
  rollbackLogs: RollbackLog[];
  releaseNotes: string;
  approvalStatus: ApprovalStatus;
  approvers: Approver[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseRequest {
  version: string;
  buildId: string;
  productId: string;
  platform: ReleasePlatform;
  plannedDate?: string;
  releaseNotes?: string;
}

export interface UpdateReleaseRequest {
  version?: string;
  buildId?: string;
  plannedDate?: string;
  releaseNotes?: string;
}

export interface RollbackRequest {
  reason: string;
  targetVersion: string;
}

export interface DeployRequest {
  environment: 'staging' | 'production';
}

export interface ApprovalRequest {
  approvers: string[];
}

export interface ReleasesQueryParams {
  page?: number;
  limit?: number;
  status?: ReleaseStatus;
  productId?: string;
  platform?: ReleasePlatform;
}
