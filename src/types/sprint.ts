export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  productId: string;
  productName?: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  taskIds: string[];
  bugIds: string[];
  capacity: number;
  velocity: number | null;
  retrospective: SprintRetrospective | null;
  createdAt: string;
  updatedAt: string;
}

export interface SprintRetrospective {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  savedAt: string;
  savedBy: string;
  savedByName: string;
}

export interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  totalBugs: number;
  fixedBugs: number;
  totalPoints: number;
  completedPoints: number;
  blockedItems: number;
  burndownData: BurndownDataPoint[];
  velocityTrend: number[];
}

export interface BurndownDataPoint {
  date: string;
  remaining: number;
  ideal: number;
}

export interface SprintFilters {
  page?: number;
  limit?: number;
  status?: SprintStatus | SprintStatus[];
  productId?: string;
}

export interface CreateSprintData {
  name: string;
  goal: string;
  productId: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}

export interface UpdateSprintData {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}

export interface SaveRetrospectiveData {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
}

export interface SprintPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SprintsResponse {
  data: Sprint[];
  pagination: SprintPagination;
}

export interface SprintResponse {
  data: Sprint;
}

export interface SprintMetricsResponse {
  data: SprintMetrics;
}

export interface SprintRetrospectiveResponse {
  data: SprintRetrospective;
}

export interface SprintTasksResponse {
  data: string[];
}

export interface SprintBugsResponse {
  data: string[];
}
