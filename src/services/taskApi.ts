import type {
  TaskFilters,
  TasksResponse,
  TaskResponse,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  TimeLogsResponse,
  LogTimeData,
  CommentsResponse,
  SubtaskResponse,
} from '@/types/task';
import { apiFetch } from '@/lib/api';

const BASE_URL = '/tasks';

export const tasksApi = {
  // Get all tasks with filters
  async list(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.featureId) params.append('featureId', filters.featureId);
    if (filters.sprintId) params.append('sprintId', filters.sprintId);
    if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    return apiFetch<TasksResponse>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  // Get task by ID
  async getById(id: string): Promise<TaskResponse> {
    return apiFetch<TaskResponse>(`${BASE_URL}/${id}`);
  },

  // Create task
  async create(data: CreateTaskData): Promise<TaskResponse> {
    return apiFetch<TaskResponse>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update task
  async update(id: string, data: UpdateTaskData): Promise<TaskResponse> {
    return apiFetch<TaskResponse>(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Update task status
  async updateStatus(id: string, status: TaskStatus): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE_URL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete task
  async delete(id: string): Promise<void> {
    await apiFetch<void>(`${BASE_URL}/${id}`, { method: 'DELETE' });
  },

  // Assignment
  async assign(id: string, assigneeId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE_URL}/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId }),
    });
  },

  async unassign(id: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE_URL}/${id}/assign`, {
      method: 'DELETE',
    });
  },

  // Time Tracking
  async logTime(id: string, data: LogTimeData): Promise<{ data: any }> {
    return apiFetch<{ data: any }>(`${BASE_URL}/${id}/time-logs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTimeLogs(id: string): Promise<TimeLogsResponse> {
    return apiFetch<TimeLogsResponse>(`${BASE_URL}/${id}/time-logs`);
  },

  // Subtasks
  async addSubtask(id: string, title: string): Promise<SubtaskResponse> {
    return apiFetch<SubtaskResponse>(`${BASE_URL}/${id}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async updateSubtask(taskId: string, subtaskId: string, data: { title?: string; completed?: boolean }): Promise<SubtaskResponse> {
    return apiFetch<SubtaskResponse>(`${BASE_URL}/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    await apiFetch<void>(`${BASE_URL}/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' });
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<SubtaskResponse> {
    return apiFetch<SubtaskResponse>(`${BASE_URL}/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'POST',
    });
  },

  // Comments
  async getComments(id: string): Promise<CommentsResponse> {
    return apiFetch<CommentsResponse>(`${BASE_URL}/${id}/comments`);
  },

  async addComment(id: string, content: string): Promise<{ data: any }> {
    return apiFetch<{ data: any }>(`${BASE_URL}/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async updateComment(taskId: string, commentId: string, content: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE_URL}/${taskId}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await apiFetch<void>(`${BASE_URL}/${taskId}/comments/${commentId}`, { method: 'DELETE' });
  },

  // Dependencies
  async addDependency(id: string, dependsOnTaskId: string, type: 'blocks' | 'blocked_by'): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE_URL}/${id}/dependencies`, {
      method: 'POST',
      body: JSON.stringify({ dependsOnTaskId, type }),
    });
  },

  async removeDependency(taskId: string, dependencyTaskId: string): Promise<{ data: { message: string } }> {
    return apiFetch<{ data: { message: string } }>(`${BASE_URL}/${taskId}/dependencies/${dependencyTaskId}`, {
      method: 'DELETE',
    });
  },
};
