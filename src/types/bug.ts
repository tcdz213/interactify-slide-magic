// Bug Types based on API documentation

export type BugStatus = 'new' | 'confirmed' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'reopened' | 'wont_fix' | 'duplicate';

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

export type BugPriority = 'low' | 'medium' | 'high' | 'critical';

export type BugPlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';

export interface RetestResult {
  id: string;
  status: 'passed' | 'failed';
  testedBy: string;
  testedByName: string;
  notes?: string;
  environment: string;
  testedAt: string;
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: BugPriority;
  productId: string;
  productName?: string;
  platform: BugPlatform;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  reporterId: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  environment: string;
  version?: string;
  browserInfo?: string;
  retestResults: RetestResult[];
  duplicateOf?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface BugFilters {
  page?: number;
  limit?: number;
  status?: BugStatus | string;
  severity?: BugSeverity | string;
  priority?: BugPriority | string;
  productId?: string;
  platform?: BugPlatform | string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  search?: string;
}

export interface CreateBugData {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: BugSeverity;
  priority: BugPriority;
  productId: string;
  platform: BugPlatform;
  environment: string;
  version?: string;
  browserInfo?: string;
}

export interface UpdateBugData {
  title?: string;
  description?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  severity?: BugSeverity;
  priority?: BugPriority;
}

export interface RetestData {
  status: 'passed' | 'failed';
  notes?: string;
  environment: string;
}

export interface BugPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BugsResponse {
  data: Bug[];
  pagination: BugPagination;
}

export interface BugResponse {
  data: Bug;
}

export interface BugStatistics {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openBugs: number;
  closedBugs: number;
  averageResolutionTime: number;
  criticalOpen: number;
  resolutionRate: number;
}

export interface BugStatisticsResponse {
  data: BugStatistics;
}
