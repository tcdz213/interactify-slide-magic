// Task Types based on API documentation

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked';

export type TaskType = 'frontend' | 'backend' | 'mobile_android' | 'mobile_ios' | 'api' | 'design' | 'qa' | 'devops' | 'documentation' | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type DependencyType = 'blocks' | 'blocked_by';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TaskDependency {
  taskId: string;
  taskTitle: string;
  type: DependencyType;
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
  description?: string;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  estimatedHours?: number;
  loggedHours: number;
  dueDate?: string;
  completedAt?: string | null;
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus | string;
  type?: TaskType | string;
  priority?: TaskPriority;
  featureId?: string;
  sprintId?: string;
  assigneeId?: string;
  search?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  featureId?: string;
  sprintId?: string;
  assigneeId?: string;
  estimatedHours?: number;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  estimatedHours?: number;
  labels?: string[];
}

export interface LogTimeData {
  hours: number;
  date: string;
  description?: string;
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TasksResponse {
  data: Task[];
  pagination: TaskPagination;
}

export interface TaskResponse {
  data: Task;
}

export interface TimeLogsResponse {
  data: TimeLog[];
}

export interface CommentsResponse {
  data: TaskComment[];
}

export interface SubtaskResponse {
  data: Subtask;
}
