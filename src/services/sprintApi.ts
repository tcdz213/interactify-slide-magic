import type {
  SprintFilters,
  SprintsResponse,
  SprintResponse,
  CreateSprintData,
  UpdateSprintData,
  SprintMetricsResponse,
  SprintRetrospectiveResponse,
  SaveRetrospectiveData,
  SprintTasksResponse,
  SprintBugsResponse,
} from '@/types/sprint';
import { apiFetch } from '@/lib/api';

const BASE_URL = '/sprints';

export const sprintsApi = {
  // Get all sprints with filters
  async list(filters: SprintFilters = {}): Promise<SprintsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.productId) params.append('productId', filters.productId);
    
    if (filters.status) {
      const statusValue = Array.isArray(filters.status) 
        ? filters.status.join(',') 
        : filters.status;
      params.append('status', statusValue);
    }

    const query = params.toString();
    return apiFetch<SprintsResponse>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  // Get sprint by ID
  async getById(id: string): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(`${BASE_URL}/${id}`);
  },

  // Create sprint
  async create(data: CreateSprintData): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update sprint
  async update(id: string, data: UpdateSprintData): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Start sprint
  async start(id: string): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(`${BASE_URL}/${id}/start`, {
      method: 'POST',
    });
  },

  // Complete sprint
  async complete(id: string): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(`${BASE_URL}/${id}/complete`, {
      method: 'POST',
    });
  },

  // Delete sprint
  async delete(id: string): Promise<void> {
    await apiFetch<void>(`${BASE_URL}/${id}`, { method: 'DELETE' });
  },

  // Task Management
  async getTasks(sprintId: string): Promise<SprintTasksResponse> {
    return apiFetch<SprintTasksResponse>(`${BASE_URL}/${sprintId}/tasks`);
  },

  async addTask(sprintId: string, taskId: string): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(`${BASE_URL}/${sprintId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  },

  async removeTask(sprintId: string, taskId: string): Promise<SprintResponse> {
    return apiFetch<SprintResponse>(`${BASE_URL}/${sprintId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Bug Management
  async getBugs(sprintId: string): Promise<SprintBugsResponse> {
    return apiFetch<SprintBugsResponse>(`${BASE_URL}/${sprintId}/bugs`);
  },

  async addBug(sprintId: string, bugId: string): Promise<{ data: { message: string } }> {
    return apiFetch(`${BASE_URL}/${sprintId}/bugs`, {
      method: 'POST',
      body: JSON.stringify({ bugId }),
    });
  },

  async removeBug(sprintId: string, bugId: string): Promise<{ data: { message: string } }> {
    return apiFetch(`${BASE_URL}/${sprintId}/bugs/${bugId}`, {
      method: 'DELETE',
    });
  },

  // Metrics & Retrospective
  async getMetrics(sprintId: string): Promise<SprintMetricsResponse> {
    return apiFetch<SprintMetricsResponse>(`${BASE_URL}/${sprintId}/metrics`);
  },

  async getRetrospective(sprintId: string): Promise<SprintRetrospectiveResponse> {
    return apiFetch<SprintRetrospectiveResponse>(`${BASE_URL}/${sprintId}/retrospective`);
  },

  async saveRetrospective(sprintId: string, data: SaveRetrospectiveData): Promise<SprintRetrospectiveResponse> {
    return apiFetch<SprintRetrospectiveResponse>(`${BASE_URL}/${sprintId}/retrospective`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
